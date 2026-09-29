import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'camera_hud',
    name: 'AR Kamera Live HUD',
    icon: 'Camera',
    bgClass: 'from-blue-950/80 via-indigo-950/70 to-slate-950/90',
    primaryColor: '#00f5d4',
    secondaryColor: '#7b2cbf',
    accentColor: '#fee440',
    dividerStyle: 'border-cyan-400/80 shadow-[0_0_15px_rgba(0,245,212,0.6)]',
    ballTheme: 'neon'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon Arena',
    icon: 'Zap',
    bgClass: 'from-[#0b0826] via-[#1a0b36] to-[#05021a]',
    primaryColor: '#ff007f',
    secondaryColor: '#00f0ff',
    accentColor: '#ffe600',
    dividerStyle: 'border-fuchsia-500 shadow-[0_0_20px_rgba(255,0,127,0.8)]',
    ballTheme: 'neon'
  },
  {
    id: 'galaxy',
    name: 'Galaksi Kosmik',
    icon: 'Sparkles',
    bgClass: 'from-[#060919] via-[#111638] to-[#04060f]',
    primaryColor: '#8a2be2',
    secondaryColor: '#4cc9f0',
    accentColor: '#f72585',
    dividerStyle: 'border-violet-400 shadow-[0_0_15px_rgba(138,43,226,0.6)]',
    ballTheme: 'cosmic'
  },
  {
    id: 'sunset',
    name: 'Retro Sunset Arcade',
    icon: 'Sun',
    bgClass: 'from-[#2b0938] via-[#4d1234] to-[#17041f]',
    primaryColor: '#ff7700',
    secondaryColor: '#ff007f',
    accentColor: '#ffdd00',
    dividerStyle: 'border-amber-400 shadow-[0_0_18px_rgba(255,170,0,0.7)]',
    ballTheme: 'neon'
  },
  {
    id: 'cartoon',
    name: 'Akademi Ceria',
    icon: 'Smile',
    bgClass: 'from-[#3b82f6] via-[#60a5fa] to-[#93c5fd]',
    primaryColor: '#fbbf24',
    secondaryColor: '#10b981',
    accentColor: '#ec4899',
    dividerStyle: 'border-white shadow-[0_0_10px_rgba(255,255,255,0.8)]',
    ballTheme: 'bubble'
  },
  {
    id: 'dark_scifi',
    name: 'Stealth Emerald Sci-Fi',
    icon: 'Shield',
    bgClass: 'from-[#03150d] via-[#052317] to-[#020b07]',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentColor: '#34d399',
    dividerStyle: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]',
    ballTheme: 'neon'
  }
];
