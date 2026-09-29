export interface MotionPoint {
  x: number; // 0 to 1280
  y: number; // 0 to 720
  intensity: number;
  side: 'left' | 'right';
  active: boolean;
}

export type SensorStabilityMode = 'high' | 'balanced' | 'sensitive';

export class MotionTracker {
  public video: HTMLVideoElement | null = null;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D | null;
  private width: number = 80;
  private height: number = 45;
  private prevFrame: Uint8Array | null = null;
  public motionGrid: Uint8Array;
  public isReady: boolean = false;
  public isRunning: boolean = false;
  public cameraError: string | null = null;

  // Real-time motion activity meter (0 - 100%)
  public currentActivity: number = 0;
  
  // Settings
  public sensitivity: number = 6; // 1 to 10
  public stabilityMode: SensorStabilityMode = 'balanced';

  // Hand smoothed centroids
  public leftHand: { x: number; y: number; active: boolean; intensity: number; isSlapping: boolean } = {
    x: 320,
    y: 420,
    active: false,
    intensity: 0,
    isSlapping: false
  };
  public rightHand: { x: number; y: number; active: boolean; intensity: number; isSlapping: boolean } = {
    x: 960,
    y: 420,
    active: false,
    intensity: 0,
    isSlapping: false
  };

  public activePoints: MotionPoint[] = [];

  constructor() {
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;
    this.offCtx = this.offscreen.getContext('2d', { willReadFrequently: true });
    this.motionGrid = new Uint8Array(this.width * this.height);
  }

  public async start(videoElement: HTMLVideoElement): Promise<boolean> {
    try {
      this.video = videoElement;
      this.cameraError = null;

      if (!this.video.srcObject) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });
        } catch {
          // Fallback to basic video request if resolution constraint fails
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        this.video.srcObject = stream;
        this.video.muted = true;
        this.video.playsInline = true;

        await new Promise<void>((resolve) => {
          if (this.video && this.video.readyState >= 2) {
            resolve();
          } else if (this.video) {
            this.video.onloadeddata = () => resolve();
            this.video.oncanplay = () => resolve();
            // safety timeout in case event is missed
            setTimeout(resolve, 800);
          }
        });

        await this.video.play();
      }

      this.isReady = true;
      this.isRunning = true;
      this.prevFrame = null;
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('Camera access denied or unavailable:', errorMsg);
      this.cameraError = errorMsg;
      this.isReady = false;
      this.isRunning = false;
      return false;
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.isReady = false;
    if (this.video && this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.prevFrame = null;
    this.motionGrid.fill(0);
    this.currentActivity = 0;
  }

  public calibrate(): void {
    this.prevFrame = null;
    this.motionGrid.fill(0);
    this.currentActivity = 0;
  }

  public update(): void {
    if (!this.isRunning || !this.video || !this.offCtx || this.video.readyState < 2) {
      return;
    }

    const vw = this.video.videoWidth || 1280;
    const vh = this.video.videoHeight || 720;
    if (vw === 0 || vh === 0) return;

    const aspect = 16 / 9;
    let sw = vw;
    let sh = vw / aspect;
    if (sh > vh) {
      sh = vh;
      sw = vh * aspect;
    }
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    // Draw mirrored video frame to offscreen canvas
    this.offCtx.save();
    this.offCtx.translate(this.width, 0);
    this.offCtx.scale(-1, 1);
    this.offCtx.drawImage(this.video, sx, sy, sw, sh, 0, 0, this.width, this.height);
    this.offCtx.restore();

    const imgData = this.offCtx.getImageData(0, 0, this.width, this.height);
    const data = imgData.data;
    const current = new Uint8Array(this.width * this.height);

    for (let i = 0, p = 0; i < current.length; i++, p += 4) {
      current[i] = (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) | 0;
    }

    this.motionGrid.fill(0);
    this.activePoints = [];

    if (this.prevFrame) {
      // Sensible difference threshold (lower threshold = more responsive)
      // Sensitivity 1 -> thr 24; Sensitivity 5 -> thr 18; Sensitivity 10 -> thr 11
      const threshold = Math.max(10, 26 - this.sensitivity * 1.5);
      
      let leftSumX = 0, leftSumY = 0, leftCount = 0;
      let rightSumX = 0, rightSumY = 0, rightCount = 0;
      let totalMotion = 0;
      const mid = this.width / 2;

      for (let y = 0; y < this.height; y++) {
        const yw = y * this.width;
        for (let x = 0; x < this.width; x++) {
          const idx = yw + x;
          const diff = Math.abs(current[idx] - this.prevFrame[idx]);
          if (diff > threshold) {
            this.motionGrid[idx] = 1;
            totalMotion++;
            if (x < mid) {
              leftSumX += x;
              leftSumY += y;
              leftCount++;
            } else {
              rightSumX += x;
              rightSumY += y;
              rightCount++;
            }
          }
        }
      }

      this.currentActivity = Math.min(100, Math.round((totalMotion / (this.width * this.height)) * 500));

      const smoothingAlpha = this.stabilityMode === 'high' ? 0.35 : 0.55;
      const minPoints = 3;

      // Left hand centroid
      if (leftCount >= minPoints) {
        const targetX = (leftSumX / leftCount / this.width) * 1280;
        const targetY = (leftSumY / leftCount / this.height) * 720;

        if (!this.leftHand.active) {
          this.leftHand.x = targetX;
          this.leftHand.y = targetY;
          this.leftHand.active = true;
        } else {
          this.leftHand.x = this.leftHand.x * (1 - smoothingAlpha) + targetX * smoothingAlpha;
          this.leftHand.y = this.leftHand.y * (1 - smoothingAlpha) + targetY * smoothingAlpha;
        }
        this.leftHand.intensity = Math.min(1, leftCount / 20);

        this.activePoints.push({
          x: this.leftHand.x,
          y: this.leftHand.y,
          intensity: this.leftHand.intensity,
          side: 'left',
          active: true
        });
      } else {
        this.leftHand.intensity *= 0.88;
        if (this.leftHand.intensity < 0.05) this.leftHand.active = false;
      }

      // Right hand centroid
      if (rightCount >= minPoints) {
        const targetX = (rightSumX / rightCount / this.width) * 1280;
        const targetY = (rightSumY / rightCount / this.height) * 720;

        if (!this.rightHand.active) {
          this.rightHand.x = targetX;
          this.rightHand.y = targetY;
          this.rightHand.active = true;
        } else {
          this.rightHand.x = this.rightHand.x * (1 - smoothingAlpha) + targetX * smoothingAlpha;
          this.rightHand.y = this.rightHand.y * (1 - smoothingAlpha) + targetY * smoothingAlpha;
        }
        this.rightHand.intensity = Math.min(1, rightCount / 20);

        this.activePoints.push({
          x: this.rightHand.x,
          y: this.rightHand.y,
          intensity: this.rightHand.intensity,
          side: 'right',
          active: true
        });
      } else {
        this.rightHand.intensity *= 0.88;
        if (this.rightHand.intensity < 0.05) this.rightHand.active = false;
      }
    }

    this.prevFrame = current;
  }

  /**
   * Check if a falling ball is touched by hand motion
   */
  public checkBallTouch(
    ballX: number,
    ballY: number,
    ballRadius: number,
    ballSide: 0 | 1,
    canvasW: number = 1280,
    canvasH: number = 720,
    isSingleMode: boolean = false
  ): { touched: boolean; confidence: number } {
    // 1. Hand centroid distance check (Very reliable)
    const hands = isSingleMode ? [this.leftHand, this.rightHand] : [ballSide === 0 ? this.leftHand : this.rightHand];
    for (const hand of hands) {
      if (hand.active && hand.intensity > 0.1) {
        const distSq = (hand.x - ballX) ** 2 + (hand.y - ballY) ** 2;
        const hitRadius = ballRadius * 1.35;
        if (distSq <= hitRadius * hitRadius) {
          return { touched: true, confidence: 0.95 };
        }
      }
    }

    // 2. Local optical flow motion check
    const gridX = (ballX / canvasW) * this.width;
    const gridY = (ballY / canvasH) * this.height;
    const gridR = (ballRadius / canvasW) * this.width * 1.05;

    let hitCount = 0;
    let totalInCircle = 0;

    const minX = Math.max(0, Math.floor(gridX - gridR));
    const maxX = Math.min(this.width - 1, Math.ceil(gridX + gridR));
    const minY = Math.max(0, Math.floor(gridY - gridR));
    const maxY = Math.min(this.height - 1, Math.ceil(gridY + gridR));

    for (let y = minY; y <= maxY; y++) {
      const yw = y * this.width;
      for (let x = minX; x <= maxX; x++) {
        const dx = x - gridX;
        const dy = y - gridY;
        if (dx * dx + dy * dy <= gridR * gridR) {
          totalInCircle++;
          if (this.motionGrid[yw + x] === 1) {
            hitCount++;
          }
        }
      }
    }

    const frac = totalInCircle > 0 ? hitCount / totalInCircle : 0;
    // Low, responsive threshold: 10% movement in circle triggers hit
    if (frac >= 0.10 && hitCount >= 3) {
      return { touched: true, confidence: frac };
    }

    return { touched: false, confidence: frac };
  }
}

export const motionTracker = new MotionTracker();
