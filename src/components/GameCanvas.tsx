import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Question, FallingBall, ThemeConfig } from '../types';
import { motionTracker, MotionPoint } from '../utils/motionTracker';
import { sounds } from '../utils/audio';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface TouchRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  life: number;
}

interface Props {
  theme: ThemeConfig;
  currentQuestion: Question | null;
  timeLeft: number;
  totalTime: number;
  playerLeftName: string;
  playerRightName: string;
  playerLeftScore: number;
  playerRightScore: number;
  playerLeftCombo: number;
  playerRightCombo: number;
  useCamera: boolean;
  sensitivity: number;
  stabilityMode: 'high' | 'balanced' | 'sensitive';
  fallSpeed: number;
  ballSpacing?: 'normal' | 'wide' | 'extra_wide';
  playMode?: 'single' | 'versus';
  singlePlayerName?: string;
  isGameActive: boolean;
  isOnlineMode: boolean;
  localPlayerKubu: 'kiri' | 'kanan';
  onBallTouched: (side: 0 | 1, isCorrect: boolean, ballLabel: string) => void;
  onNextQuestionRequested: () => void;
}

const W = 1280;
const H = 720;
const FONT = '"Baloo 2", "Plus Jakarta Sans", system-ui, sans-serif';

interface VisualHand {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isSlapping: boolean;
  slapTimer: number;
  active: boolean;
}

export const GameCanvas: React.FC<Props> = ({
  theme,
  currentQuestion,
  timeLeft,
  totalTime,
  playerLeftName,
  playerRightName,
  playerLeftScore,
  playerRightScore,
  playerLeftCombo,
  playerRightCombo,
  useCamera,
  sensitivity,
  stabilityMode,
  fallSpeed,
  ballSpacing = 'wide',
  playMode = 'versus',
  singlePlayerName = 'Pahlawan Kuis',
  isGameActive,
  isOnlineMode,
  localPlayerKubu,
  onBallTouched,
  onNextQuestionRequested
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ballsRef = useRef<FallingBall[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const ripplesRef = useRef<TouchRipple[]>([]);
  const shakeRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lastSpawnQuestionRef = useRef<string | null>(null);
  const lastHitTimeRef = useRef<number>(0);

  // Interactive Visual Hand positions
  const visualLeftHandRef = useRef<VisualHand>({
    x: 320,
    y: 520,
    targetX: 320,
    targetY: 520,
    isSlapping: false,
    slapTimer: 0,
    active: true
  });

  const visualRightHandRef = useRef<VisualHand>({
    x: 960,
    y: 520,
    targetX: 960,
    targetY: 520,
    isSlapping: false,
    slapTimer: 0,
    active: true
  });

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start or stop camera
  const initCamera = useCallback(async () => {
    if (!useCamera || !videoRef.current) {
      motionTracker.stop();
      setCameraActive(false);
      return;
    }

    setCameraError(null);
    motionTracker.sensitivity = sensitivity;
    motionTracker.stabilityMode = stabilityMode;

    const ok = await motionTracker.start(videoRef.current);
    setCameraActive(ok);
    if (!ok) {
      setCameraError(motionTracker.cameraError || 'Izin kamera belum aktif. Mode Tangan Visual tetap bisa digunakan.');
    }
  }, [useCamera, sensitivity, stabilityMode]);

  useEffect(() => {
    initCamera();
    return () => {
      motionTracker.stop();
    };
  }, [initCamera]);

  // Update sensitivity & stability
  useEffect(() => {
    motionTracker.sensitivity = sensitivity;
    motionTracker.stabilityMode = stabilityMode;
  }, [sensitivity, stabilityMode]);

  // Dynamic falling speed update
  useEffect(() => {
    ballsRef.current.forEach(ball => {
      if (ball.state === 'falling') {
        ball.speed = fallSpeed + (Math.random() * 20 - 10);
      }
    });
  }, [fallSpeed]);

  // Spawn falling balls when question changes
  useEffect(() => {
    if (!currentQuestion || !isGameActive) {
      ballsRef.current = [];
      return;
    }

    if (lastSpawnQuestionRef.current === currentQuestion.id + '_' + currentQuestion.text) {
      return;
    }
    lastSpawnQuestionRef.current = currentQuestion.id + '_' + currentQuestion.text;

    const newBalls: FallingBall[] = [];
    const options = [currentQuestion.ans, ...currentQuestion.wrong.slice(0, 3)];

    const shuffleArray = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    // Calculate generous vertical gap based on ballSpacing setting
    const verticalGap = ballSpacing === 'extra_wide' ? 250 : ballSpacing === 'normal' ? 160 : 210;

    if (playMode === 'single') {
      // Single Player: 4 answer balls spread across full 1280px arena width
      const singleLanes = [220, 500, 780, 1060];
      const sideOptions = shuffleArray(options);
      const laneOrder = shuffleArray([0, 1, 2, 3]);

      sideOptions.forEach((opt, idx) => {
        const laneX = singleLanes[laneOrder[idx]];
        const startY = -80 - idx * verticalGap;
        const isCorrect = opt === currentQuestion.ans;

        newBalls.push({
          id: `ball_0_${idx}_${Date.now()}`,
          side: 0,
          label: opt,
          correct: isCorrect,
          x: laneX,
          y: startY,
          radius: 54, // large, prominent & clear in solo play!
          speed: fallSpeed + (Math.random() * 15 - 7.5),
          color: isCorrect ? '#10b981' : '#6366f1',
          state: 'falling',
          popProgress: 0,
          dwellTime: 0,
          seed: Math.random() * 10
        });
      });
    } else {
      // Versus 2 Kubu: 2 sets of balls for Kubu Kiri (Side 0) and Kubu Kanan (Side 1)
      const leftLanes = [135, 260, 385, 510];   // Kubu Kiri (width: 640px)
      const rightLanes = [770, 895, 1020, 1145]; // Kubu Kanan (width: 640px)

      for (let side = 0; side < 2; side++) {
        const sideOptions = shuffleArray(options);
        const laneOrder = shuffleArray([0, 1, 2, 3]);

        sideOptions.forEach((opt, idx) => {
          const laneX = side === 0 ? leftLanes[laneOrder[idx]] : rightLanes[laneOrder[idx]];
          const startY = -80 - idx * verticalGap;
          const isCorrect = opt === currentQuestion.ans;

          newBalls.push({
            id: `ball_${side}_${idx}_${Date.now()}`,
            side: side as 0 | 1,
            label: opt,
            correct: isCorrect,
            x: laneX,
            y: startY,
            radius: 50,
            speed: fallSpeed + (Math.random() * 15 - 7.5),
            color: isCorrect ? '#10b981' : '#6366f1',
            state: 'falling',
            popProgress: 0,
            dwellTime: 0,
            seed: Math.random() * 10
          });
        });
      }
    }

    ballsRef.current = newBalls;
  }, [currentQuestion, isGameActive, fallSpeed, ballSpacing, playMode]);

  // Burst explosion particles
  const spawnExplosion = useCallback((x: number, y: number, color: string, count: number = 28) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 260;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.2,
        color: i % 2 === 0 ? color : '#fcd34d',
        radius: 4 + Math.random() * 5
      });
    }
  }, []);

  // Handle ball hit
  const handleBallHit = useCallback((ball: FallingBall, hitSourceX?: number, hitSourceY?: number) => {
    if (ball.state !== 'falling') return;

    const hitX = hitSourceX ?? ball.x;
    const hitY = hitSourceY ?? ball.y;

    // Trigger visual slap animation on the respective hand
    const hand = ball.side === 0 ? visualLeftHandRef.current : visualRightHandRef.current;
    hand.isSlapping = true;
    hand.slapTimer = 0.28;

    // Create impact ripple
    ripplesRef.current.push({
      x: hitX,
      y: hitY,
      radius: 12,
      maxRadius: 65,
      color: ball.correct ? '#10b981' : '#ef4444',
      life: 0.35
    });

    if (ball.correct) {
      ball.state = 'hit_correct';
      const currentCombo = (ball.side === 0 ? playerLeftCombo : playerRightCombo) + 1;
      const particleCount = Math.min(64, 30 + currentCombo * 8);
      spawnExplosion(ball.x, ball.y, '#10b981', particleCount);

      // Explosive combo sparks
      if (currentCombo >= 2) {
        spawnExplosion(ball.x, ball.y, '#fbbf24', currentCombo * 8);
        shakeRef.current = 0.12; // satisfying tactile punch
      }

      sounds.playCorrect(currentCombo);

      // Visual Combo Milestone Tier
      let comboText = '+10 TEPAT! 🎯';
      let comboColor = '#34d399';
      if (currentCombo === 2) {
        comboText = '🔥 2x COMBO! (+15)';
        comboColor = '#fbbf24';
      } else if (currentCombo === 3) {
        comboText = '⚡ 3x MEGA STREAK! (+20)';
        comboColor = '#fde047';
      } else if (currentCombo === 4) {
        comboText = '💥 4x SUPER HIT! (+25)';
        comboColor = '#fb923c';
      } else if (currentCombo === 5) {
        comboText = '👑 5x UNSTOPPABLE! (+35)';
        comboColor = '#f43f5e';
      } else if (currentCombo >= 6) {
        comboText = `🌟 ${currentCombo}x GODLIKE STREAK! (+${10 + currentCombo * 5})`;
        comboColor = '#ec4899';
      }

      floatingTextsRef.current.push({
        id: 'f_' + Math.random(),
        x: ball.x,
        y: ball.y - 45,
        text: comboText,
        color: comboColor,
        life: 1.4,
        maxLife: 1.4
      });

      onBallTouched(ball.side, true, ball.label);

      setTimeout(() => {
        onNextQuestionRequested();
      }, 700);
    } else {
      ball.state = 'hit_wrong';
      shakeRef.current = 0.25;
      spawnExplosion(ball.x, ball.y, '#ef4444', 18);
      sounds.playWrong();

      floatingTextsRef.current.push({
        id: 'f_' + Math.random(),
        x: ball.x,
        y: ball.y - 40,
        text: '-5 SALAH! ✗',
        color: '#f87171',
        life: 1.0,
        maxLife: 1.0
      });

      onBallTouched(ball.side, false, ball.label);
    }
  }, [onBallTouched, onNextQuestionRequested, spawnExplosion, playerLeftCombo, playerRightCombo]);

  // Pointer move / touch handler: Controls the Visual Hands directly
  const handlePointerAction = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isGameActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;

    sounds.playTouchHover();

    // Route coordinates to the respective visual hand
    if (px < W / 2) {
      // Left side interaction
      if (!isOnlineMode || localPlayerKubu === 'kiri') {
        visualLeftHandRef.current.targetX = px;
        visualLeftHandRef.current.targetY = py;
        visualLeftHandRef.current.active = true;
      }
    } else {
      // Right side interaction
      if (!isOnlineMode || localPlayerKubu === 'kanan') {
        visualRightHandRef.current.targetX = px;
        visualRightHandRef.current.targetY = py;
        visualRightHandRef.current.active = true;
      }
    }

    // Direct hit check on balls
    for (const ball of ballsRef.current) {
      if (ball.state !== 'falling') continue;

      if (isOnlineMode) {
        if (localPlayerKubu === 'kiri' && ball.side !== 0) continue;
        if (localPlayerKubu === 'kanan' && ball.side !== 1) continue;
      }

      const dx = px - ball.x;
      const dy = py - ball.y;
      if (dx * dx + dy * dy <= (ball.radius * 1.35) ** 2) {
        handleBallHit(ball, px, py);
        break;
      }
    }
  };

  // Main Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;
      timeRef.current += dt;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // 1. Camera Motion Update
      if (useCamera && motionTracker.isRunning) {
        motionTracker.update();

        // If camera detects motion, map smoothed centroids to visual hands
        if (motionTracker.leftHand.active) {
          visualLeftHandRef.current.targetX = motionTracker.leftHand.x;
          visualLeftHandRef.current.targetY = motionTracker.leftHand.y;
          visualLeftHandRef.current.active = true;
        }

        if (motionTracker.rightHand.active) {
          visualRightHandRef.current.targetX = motionTracker.rightHand.x;
          visualRightHandRef.current.targetY = motionTracker.rightHand.y;
          visualRightHandRef.current.active = true;
        }
      }

      // 2. Smooth Visual Hands Interpolation (Spring Lerp)
      const lerpSpeed = 16 * dt;
      const vlh = visualLeftHandRef.current;
      vlh.x += (vlh.targetX - vlh.x) * lerpSpeed;
      vlh.y += (vlh.targetY - vlh.y) * lerpSpeed;
      if (vlh.slapTimer > 0) {
        vlh.slapTimer -= dt;
        if (vlh.slapTimer <= 0) vlh.isSlapping = false;
      }

      const vrh = visualRightHandRef.current;
      vrh.x += (vrh.targetX - vrh.x) * lerpSpeed;
      vrh.y += (vrh.targetY - vrh.y) * lerpSpeed;
      if (vrh.slapTimer > 0) {
        vrh.slapTimer -= dt;
        if (vrh.slapTimer <= 0) vrh.isSlapping = false;
      }

      // 3. Screen shake
      if (shakeRef.current > 0) {
        shakeRef.current -= dt;
      }

      // 4. Update falling balls physics & collision detection
      let needRespawn = false;
      const remainingBalls = ballsRef.current;
      const nowMs = performance.now();

      for (const ball of remainingBalls) {
        if (ball.state === 'falling') {
          ball.y += ball.speed * dt;
          ball.x += Math.sin(timeRef.current * 2 + ball.seed) * 0.8;

          // Check hit against Visual Hands!
          if (isGameActive && nowMs - lastHitTimeRef.current > 180) {
            const hand = ball.side === 0 ? vlh : vrh;
            const distSq = (hand.x - ball.x) ** 2 + (hand.y - ball.y) ** 2;
            const hitThreshold = (ball.radius * 1.35) ** 2;

            if (distSq <= hitThreshold) {
              lastHitTimeRef.current = nowMs;
              handleBallHit(ball, hand.x, hand.y);
            }
          }

          // Also check camera optical flow inside circle
          if (useCamera && isGameActive && motionTracker.isReady && nowMs - lastHitTimeRef.current > 180) {
            const { touched } = motionTracker.checkBallTouch(ball.x, ball.y, ball.radius, ball.side, W, H, playMode === 'single');
            if (touched) {
              lastHitTimeRef.current = nowMs;
              handleBallHit(ball);
            }
          }

          // Offscreen check
          if (ball.y > H + 80) {
            ball.state = 'missed';
            if (ball.correct) {
              needRespawn = true;
            }
          }
        } else if (ball.state === 'hit_correct' || ball.state === 'hit_wrong') {
          ball.popProgress += dt * 4;
        }
      }

      if (needRespawn) {
        const anyCorrectActive = remainingBalls.some(b => b.correct && b.state === 'falling');
        if (!anyCorrectActive) {
          onNextQuestionRequested();
        }
      }

      ballsRef.current = remainingBalls.filter(
        b => (b.state === 'falling' && b.y <= H + 80) || ((b.state === 'hit_correct' || b.state === 'hit_wrong') && b.popProgress < 1)
      );

      // Update particles
      for (const p of particlesRef.current) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 320 * dt;
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // Update floating texts
      for (const f of floatingTextsRef.current) {
        f.life -= dt;
        f.y -= 45 * dt;
      }
      floatingTextsRef.current = floatingTextsRef.current.filter(f => f.life > 0);

      // Update ripples
      for (const r of ripplesRef.current) {
        r.life -= dt;
        r.radius += (r.maxRadius - r.radius) * 12 * dt;
      }
      ripplesRef.current = ripplesRef.current.filter(r => r.life > 0);

      // ---------------- RENDER TO CANVAS ----------------
      ctx.save();

      if (shakeRef.current > 0) {
        const intensity = (shakeRef.current / 0.25) * 8;
        ctx.translate((Math.random() - 0.5) * intensity, (Math.random() - 0.5) * intensity);
      }

      // 1. Background
      drawBackground(ctx, theme, useCamera);

      // 2. Vertical Divider
      drawVerticalDivider(ctx, theme);

      // 3. Falling Balls
      for (const ball of ballsRef.current) {
        drawFallingBall(ctx, ball, theme);
      }

      // 4. FX (Particles, ripples, floating scores)
      drawFx(ctx);

      // 5. Top HUD
      drawHUD(ctx);

      // 6. Bottom Sensor & Touch Status Bar
      drawBottomStatusBar(ctx);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [theme, useCamera, isGameActive, isOnlineMode, localPlayerKubu, handleBallHit, onNextQuestionRequested]);

  // Helper: Draw Background
  const drawBackground = (ctx: CanvasRenderingContext2D, t: ThemeConfig, camOn: boolean) => {
    if (camOn && videoRef.current && videoRef.current.readyState >= 2) {
      const vid = videoRef.current;
      const vw = vid.videoWidth || W;
      const vh = vid.videoHeight || H;
      const ar = W / H;
      let sw = vw;
      let sh = vw / ar;
      if (sh > vh) {
        sh = vh;
        sw = vh * ar;
      }
      const sx = (vw - sw) / 2;
      const sy = (vh - sh) / 2;

      ctx.save();
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, W, H);
      ctx.restore();

      ctx.fillStyle = t.id === 'camera_hud' ? 'rgba(7, 13, 36, 0.45)' : 'rgba(10, 15, 45, 0.65)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < H; y += 4) {
        ctx.fillRect(0, y, W, 1);
      }
    } else {
      if (t.id === 'cyberpunk') {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0c0728');
        grad.addColorStop(0.6, '#1e0845');
        grad.addColorStop(1, '#08031a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(255, 0, 127, 0.25)';
        ctx.lineWidth = 1.5;
        const horizon = H * 0.72;
        for (let x = -200; x <= W + 200; x += 90) {
          ctx.beginPath();
          ctx.moveTo(W / 2, horizon);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = horizon; y <= H; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }
      } else if (t.id === 'galaxy') {
        const grad = ctx.createRadialGradient(W / 2, H / 2, 80, W / 2, H / 2, W * 0.7);
        grad.addColorStop(0, '#1c1b4d');
        grad.addColorStop(0.5, '#0b0d26');
        grad.addColorStop(1, '#03040a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 40; i++) {
          const sx = (i * 137.5 + timeRef.current * 8) % W;
          const sy = (i * 93.7) % H;
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#03140c');
        grad.addColorStop(0.6, '#062818');
        grad.addColorStop(1, '#020b06');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }
    }
  };

  // Helper: Draw Vertical Divider
  const drawVerticalDivider = (ctx: CanvasRenderingContext2D, t: ThemeConfig) => {
    if (playMode === 'single') {
      ctx.save();
      ctx.font = `800 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.fillText('⭐ ARENA SINGLE PLAYER • REFLEKS CEPAT & BIDIK SKOR TERTINGGI ⭐', W / 2, 185);
      ctx.restore();
      return;
    }

    const midX = W / 2;
    const topY = 175;
    const botY = H - 50;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = t.primaryColor;
    ctx.strokeStyle = t.primaryColor;
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    ctx.lineDashOffset = -timeRef.current * 25;

    ctx.beginPath();
    ctx.moveTo(midX, topY);
    ctx.lineTo(midX, botY);
    ctx.stroke();

    ctx.shadowBlur = 24;
    ctx.shadowColor = t.accentColor;
    ctx.fillStyle = t.accentColor;
    ctx.beginPath();
    ctx.arc(midX, (topY + botY) / 2, 7 + Math.sin(timeRef.current * 4) * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.font = `800 13px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.fillText('◄ KUBU KIRI (TIM BIRU)', midX - 110, topY + 22);

    ctx.fillStyle = 'rgba(244, 63, 94, 0.9)';
    ctx.fillText('KUBU KANAN (TIM MERAH) ►', midX + 110, topY + 22);

    ctx.restore();
  };

  // Helper: Draw Falling Ball with Enhanced Visual Touch Halo
  const drawFallingBall = (ctx: CanvasRenderingContext2D, ball: FallingBall, t: ThemeConfig) => {
    if (ball.state === 'missed') return;

    ctx.save();
    const x = ball.x;
    const y = ball.y;
    let r = Math.max(0, ball.radius);

    if (ball.state === 'hit_correct' || ball.state === 'hit_wrong') {
      r *= Math.max(0, 1 - ball.popProgress);
      ctx.globalAlpha = Math.max(0, 1 - ball.popProgress);
      if (r <= 8) {
        ctx.restore();
        return;
      }
    }

    if (r <= 1) {
      ctx.restore();
      return;
    }

    // Outer Glow & Touch Halo
    const haloColor = ball.side === 0 ? '#00f0ff' : '#ff007f';
    ctx.shadowBlur = 20;
    ctx.shadowColor = haloColor;

    // Rotating target orbital ring to guide visual touches
    const orbitalR = Math.max(1, r + 10);
    ctx.strokeStyle = haloColor;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = timeRef.current * 15;
    ctx.beginPath();
    ctx.arc(x, y, orbitalR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball Body Gradient
    const rInner = Math.max(0.1, r * 0.15);
    const rOuter = Math.max(1, r);
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, rInner, x, y, rOuter);
    if (ball.side === 0) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#67e8f9');
      grad.addColorStop(1, '#0284c7');
    } else {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fda4af');
      grad.addColorStop(1, '#e11d48');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rOuter, 0, Math.PI * 2);
    ctx.fill();

    // Outline Ring
    ctx.lineWidth = 4;
    ctx.strokeStyle = ball.side === 0 ? '#38bdf8' : '#fb7185';
    ctx.beginPath();
    ctx.arc(x, y, rOuter, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Gold Accent Ring (only when r > 8 to prevent negative or cramped radius)
    if (r > 8) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, r - 6), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Answer Label
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f172a';

    const maxTextWidth = r * 1.55;
    let fontSize = 24;
    ctx.font = `800 ${fontSize}px ${FONT}`;
    while (ctx.measureText(ball.label).width > maxTextWidth && fontSize > 13) {
      fontSize -= 1.5;
      ctx.font = `800 ${fontSize}px ${FONT}`;
    }

    ctx.fillText(ball.label, x, y);

    ctx.restore();
  };

  // Helper: Draw FX
  const drawFx = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    for (const r of ripplesRef.current) {
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3.5;
      ctx.globalAlpha = Math.max(0, r.life / 0.35);
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(0.1, r.radius), 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const p of particlesRef.current) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.radius), 0, Math.PI * 2);
      ctx.fill();
    }

    for (const f of floatingTextsRef.current) {
      ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
      ctx.font = `800 28px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#020617';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }

    ctx.restore();
  };

  // Helper: Draw Top HUD
  const drawHUD = (ctx: CanvasRenderingContext2D) => {
    ctx.save();

    if (playMode === 'single') {
      const pName = singlePlayerName || playerLeftName;
      drawPlayerCard(ctx, 20, 16, 260, 120, '⭐ SINGLE PLAYER', pName, playerLeftScore, playerLeftCombo, '#00f0ff', '#083344');
      drawPlayerCard(ctx, W - 280, 16, 260, 120, '🏆 KOMBO MAKSIMAL', `${playerLeftCombo}x KOMBO`, playerLeftScore, 0, '#fbbf24', '#451a03');
    } else {
      drawPlayerCard(ctx, 20, 16, 260, 120, 'KUBU KIRI', playerLeftName, playerLeftScore, playerLeftCombo, '#00f0ff', '#083344');
      drawPlayerCard(ctx, W - 280, 16, 260, 120, 'KUBU KANAN', playerRightName, playerRightScore, playerRightCombo, '#f43f5e', '#4c0519');
    }

    const qx = 300, qy = 16, qw = 680, qh = 120;
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(79, 70, 229, 0.45)';
    roundRect(ctx, qx, qy, qw, qh, 24);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fill();

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#6366f1';
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (currentQuestion) {
      ctx.font = `800 14px ${FONT}`;
      ctx.fillStyle = '#fde047';
      ctx.fillText(currentQuestion.head.toUpperCase(), qx + qw / 2, qy + 24);

      let qFontSize = 26;
      ctx.font = `800 ${qFontSize}px ${FONT}`;
      while (ctx.measureText(currentQuestion.text).width > qw - 48 && qFontSize > 16) {
        qFontSize -= 1.5;
        ctx.font = `800 ${qFontSize}px ${FONT}`;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(currentQuestion.text, qx + qw / 2, qy + 68);

      ctx.font = `600 13px ${FONT}`;
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('⚡ Lambaikan tangan di depan kamera atau sentuh bola jawaban yang benar!', qx + qw / 2, qy + 100);
    } else {
      ctx.font = `800 28px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Bersiap Menghadapi Duel Kuis...', qx + qw / 2, qy + qh / 2);
    }

    const tx = 20, ty = 148, tw = W - 40, th = 14;
    roundRect(ctx, tx, ty, tw, th, 7);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    const timeRatio = Math.max(0, Math.min(1, timeLeft / totalTime));
    if (timeRatio > 0) {
      roundRect(ctx, tx, ty, tw * timeRatio, th, 7);
      const timerGrad = ctx.createLinearGradient(tx, ty, tx + tw * timeRatio, ty);
      if (timeRatio > 0.45) {
        timerGrad.addColorStop(0, '#10b981');
        timerGrad.addColorStop(1, '#06b6d4');
      } else if (timeRatio > 0.2) {
        timerGrad.addColorStop(0, '#f59e0b');
        timerGrad.addColorStop(1, '#eab308');
      } else {
        timerGrad.addColorStop(0, '#ef4444');
        timerGrad.addColorStop(1, '#dc2626');
      }
      ctx.fillStyle = timerGrad;
      ctx.fill();
    }

    const sec = Math.ceil(timeLeft);
    const timeFormatted = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    ctx.font = `800 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#020617';
    ctx.strokeText(`⏱️ ${timeFormatted}`, W / 2, ty + 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`⏱️ ${timeFormatted}`, W / 2, ty + 24);

    ctx.restore();
  };

  // Helper: Draw Bottom Sensor & Touch Status Bar
  const drawBottomStatusBar = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    const bx = 20, by = H - 42, bw = W - 40, bh = 32;

    roundRect(ctx, bx, by, bw, bh, 10);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
    ctx.stroke();

    ctx.font = `700 12px ${FONT}`;
    ctx.textBaseline = 'middle';

    if (playMode === 'single') {
      const pName = singlePlayerName || playerLeftName;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`⭐ Pemain Solo: ${pName}`, bx + 16, by + bh / 2);

      ctx.textAlign = 'center';
      if (useCamera && cameraActive) {
        ctx.fillStyle = '#34d399';
        ctx.fillText(`🟢 KAMERA AKTIF • AKTIVITAS GERAK: ${motionTracker.currentActivity}%`, W / 2, by + bh / 2);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`👆 MODE SENTUH • SENTUH ATAU KLIK BOLA JAWABAN YANG BENAR`, W / 2, by + bh / 2);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`SKOR: ${playerLeftScore} • KOMBO: ${playerLeftCombo}x`, bx + bw - 16, by + bh / 2);
    } else {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`◄ Kubu Kiri: ${playerLeftName}`, bx + 16, by + bh / 2);

      ctx.textAlign = 'center';
      if (useCamera && cameraActive) {
        ctx.fillStyle = '#34d399';
        ctx.fillText(`🟢 KAMERA AKTIF • AKTIVITAS GERAK: ${motionTracker.currentActivity}%`, W / 2, by + bh / 2);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`👆 SENTUH ATAU KLIK BOLA JAWABAN YANG BENAR`, W / 2, by + bh / 2);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff007f';
      ctx.fillText(`Kubu Kanan: ${playerRightName} ►`, bx + bw - 16, by + bh / 2);
    }

    ctx.restore();
  };

  // Helper: Draw Score Cards
  const drawPlayerCard = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    badge: string,
    name: string,
    score: number,
    combo: number,
    accentColor: string,
    bgColor: string
  ) => {
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = accentColor;
    roundRect(ctx, x, y, w, h, 20);
    ctx.fillStyle = bgColor;
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = accentColor;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `800 12px ${FONT}`;
    ctx.fillStyle = accentColor;
    ctx.fillText(badge, x + w / 2, y + 18);

    let nameFont = 18;
    ctx.font = `700 ${nameFont}px ${FONT}`;
    let truncatedName = name;
    while (ctx.measureText(truncatedName).width > w - 30 && truncatedName.length > 3) {
      truncatedName = truncatedName.slice(0, -1);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillText(truncatedName, x + w / 2, y + 42);

    ctx.font = `800 36px ${FONT}`;
    ctx.fillStyle = '#fde047';
    ctx.fillText(String(score), x + w / 2, y + 80);

    if (combo >= 2) {
      // Fiery animated combo pill
      const comboW = 120;
      const comboH = 22;
      const comboX = x + w / 2 - comboW / 2;
      const comboY = y + 95;

      ctx.save();
      ctx.shadowBlur = 12 + Math.sin(timeRef.current * 8) * 6;
      ctx.shadowColor = combo >= 5 ? '#f59e0b' : '#f43f5e';
      roundRect(ctx, comboX, comboY, comboW, comboH, 8);
      ctx.fillStyle = combo >= 5 ? 'rgba(245, 158, 11, 0.95)' : 'rgba(244, 63, 94, 0.92)';
      ctx.fill();

      ctx.font = `800 12px ${FONT}`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = combo >= 5 ? `👑 ${combo}x STREAK!` : `🔥 ${combo}x COMBO!`;
      ctx.fillText(label, x + w / 2, comboY + comboH / 2);
      ctx.restore();
    }

    ctx.restore();
  };

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  return (
    <div className="relative w-full max-w-[1280px] aspect-[16/9] mx-auto select-none rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-950/80 bg-black">
      {/* 
        CRITICAL FIX: 
        Never use display:none or className="hidden" on the video element!
        Browsers pause video decoding on hidden elements, completely breaking drawImage and motion tracking.
      */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -9999
        }}
      />

      {/* Interactive Main Game Canvas */}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={handlePointerAction}
        onPointerMove={handlePointerAction}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Signature Watermark by kikybahsoan */}
      <div className="absolute bottom-2.5 right-4 pointer-events-none z-20 text-[10px] text-slate-400/80 font-bold tracking-wider drop-shadow-md flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-slate-800/60">
        <span className="text-amber-400">⚡ KIKI Games</span>
        <span className="text-slate-600">•</span>
        <span>by <span className="text-cyan-300 underline decoration-cyan-500/30">kikybahsoan</span></span>
      </div>

      {/* Camera Error / Permission Notice if user wants camera but blocked */}
      {useCamera && cameraError && (
        <div className="absolute top-44 left-1/2 -translate-x-1/2 z-40 p-3 rounded-2xl bg-slate-900/95 border-2 border-amber-400 text-white shadow-2xl flex items-center gap-3 text-xs max-w-lg">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-amber-300 block">Kamera Belum Aktif</span>
            <span className="text-[11px] text-slate-300">
              Jangan khawatir! Anda tetap bisa bermain dengan **Tangan Visual** menggunakan sentuhan layar atau mouse.
            </span>
          </div>
          <button
            onClick={initCamera}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
};
