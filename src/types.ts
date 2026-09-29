export interface Question {
  id: string;
  category: 'math' | 'eng' | 'science' | 'general' | string;
  level: number; // 1 to 12 (SD, SMP, SMA)
  head: string;
  text: string;
  ans: string;
  wrong: string[]; // 3 wrong answers
  difficulty?: 'mudah' | 'sedang' | 'sulit';
  createdAt?: string;
}

export interface FallingBall {
  id: string;
  side: 0 | 1; // 0 = Kubu Kiri, 1 = Kubu Kanan
  label: string;
  correct: boolean;
  x: number; // 0 to 1280 (or relative to side width)
  y: number; // Falling vertical position
  radius: number;
  speed: number;
  color: string;
  state: 'falling' | 'hit_correct' | 'hit_wrong' | 'missed';
  popProgress: number; // 0 to 1 for animation
  dwellTime: number; // motion accumulation
  seed: number;
}

export interface PlayerScore {
  name: string;
  score: number;
  combo: number;
  maxCombo: number;
  correctCount: number;
  wrongCount: number;
  kubu: 'kiri' | 'kanan';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  accuracy: number;
  kubu: 'kiri' | 'kanan';
  mode: 'local' | 'online' | 'solo';
  category: string;
  date: string;
}

export type ThemeType = 'camera_hud' | 'cyberpunk' | 'galaxy' | 'sunset' | 'cartoon' | 'dark_scifi';

export type FallSpeedPreset = 'slow' | 'normal' | 'fast' | 'extreme';

export type BallSpacingSetting = 'normal' | 'wide' | 'extra_wide';

export type PlayMode = 'single' | 'versus';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  icon: string;
  bgClass: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  dividerStyle: string;
  ballTheme: 'neon' | 'bubble' | 'cosmic' | 'flat';
}

export interface BattleRoom {
  id: string;
  name: string;
  hostId: string;
  playerLeft: { id: string; name: string; ready: boolean; score: number; combo: number } | null;
  playerRight: { id: string; name: string; ready: boolean; score: number; combo: number } | null;
  status: 'waiting' | 'starting' | 'playing' | 'ended';
  category: string;
  level: number;
  duration: number;
  currentQuestion?: Question;
  startTime?: number;
}

export interface ChallengeNotification {
  id: string;
  title: string;
  message: string;
  challengerName: string;
  roomCode?: string;
  category: string;
  timestamp: string;
  read: boolean;
}
