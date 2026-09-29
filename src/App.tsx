/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Trophy, Settings, Palette, Bell, Swords, Volume2, 
  VolumeX, Maximize2, Camera, CameraOff, RefreshCw, 
  Play, Users, Sparkles, Award, ArrowRight, Zap, Flame,
  Gauge, ShieldCheck, Crosshair, Sliders, User
} from 'lucide-react';
import { Question, ThemeConfig, LeaderboardEntry, ChallengeNotification, PlayMode } from './types';
import { THEMES } from './data/themes';
import { DEFAULT_QUESTIONS } from './data/defaultQuestions';
import { GameCanvas } from './components/GameCanvas';
import { ThemeSelector } from './components/ThemeSelector';
import { AdminDashboard } from './components/AdminDashboard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { NotificationCenter } from './components/NotificationCenter';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { KikiLogo } from './components/KikiLogo';
import { AiMotivationWidget } from './components/AiMotivationWidget';
import { sounds } from './utils/audio';
import { motionTracker } from './utils/motionTracker';
import { showSystemNotification } from './utils/pushNotifications';

export default function App() {
  // Game Configuration State
  const [theme, setTheme] = useState<ThemeConfig>(THEMES[0]); // default to AR Camera Live HUD
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<ChallengeNotification[]>([]);
  
  // Game Setup & Modes (Single Player vs Versus)
  const [playMode, setPlayMode] = useState<PlayMode>('versus');
  const [singlePlayerName, setSinglePlayerName] = useState('Pahlawan Kuis');
  const [playerLeftName, setPlayerLeftName] = useState('Ibrahim');
  const [playerRightName, setPlayerRightName] = useState('Al Farabi');
  const [gameCategory, setGameCategory] = useState<string>('math');
  const [gameLevel, setGameLevel] = useState<number>(4);
  const [gameDuration, setGameDuration] = useState<number>(60);
  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [sensitivity, setSensitivity] = useState<number>(5);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Speed and Sensor Stability
  const [fallSpeed, setFallSpeed] = useState<number>(125); // px per second
  const [ballSpacing, setBallSpacing] = useState<'normal' | 'wide' | 'extra_wide'>('wide');
  const [stabilityMode, setStabilityMode] = useState<'high' | 'balanced' | 'sensitive'>('high');
  const [calibrationToast, setCalibrationToast] = useState<string | null>(null);

  // Active Game State
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'gameover'>('menu');
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [scoreLeft, setScoreLeft] = useState<number>(0);
  const [scoreRight, setScoreRight] = useState<number>(0);
  const [comboLeft, setComboLeft] = useState<number>(0);
  const [comboRight, setComboRight] = useState<number>(0);
  const [correctHitsLeft, setCorrectHitsLeft] = useState<number>(0);
  const [correctHitsRight, setCorrectHitsRight] = useState<number>(0);

  // Online Multiplayer State
  const [isOnlineMode, setIsOnlineMode] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [roomCode, setRoomCode] = useState<string>('ARENA-1');
  const [localKubu, setLocalKubu] = useState<'kiri' | 'kanan'>('kiri');
  const [roomMembers, setRoomMembers] = useState<Array<{ id: string; name: string; kubu: 'kiri' | 'kanan'; score: number }>>([]);
  const socketRef = useRef<WebSocket | null>(null);

  // Modals
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [showLobbyModal, setShowLobbyModal] = useState<boolean>(false);

  // In-app challenge toast notification
  const [activeChallengeToast, setActiveChallengeToast] = useState<ChallengeNotification | null>(null);

  // Fetch initial questions, leaderboard, and challenges from backend
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/questions');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch {
      // Fallback to local default
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.challenges) {
        setNotifications(data.challenges);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchLeaderboard();
    fetchNotifications();
  }, [fetchQuestions, fetchLeaderboard, fetchNotifications]);

  // Connect to WebSocket Server for Real-Time Synchronization
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join_lobby',
        name: playerLeftName
      }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'connected') {
          setOnlineCount(msg.onlineCount || 1);
        } else if (msg.type === 'lobby_synced') {
          setOnlineCount(msg.onlineCount || 1);
        } else if (msg.type === 'room_state') {
          setRoomMembers(msg.members || []);
        } else if (msg.type === 'game_started') {
          setIsOnlineMode(true);
          setCurrentQuestion(msg.question);
          setTimeLeft(msg.duration || 60);
          setScoreLeft(0);
          setScoreRight(0);
          setComboLeft(0);
          setComboRight(0);
          setGameState('countdown');
          setCountdown(3);
        } else if (msg.type === 'opponent_score') {
          if (msg.kubu === 'kiri') {
            setScoreLeft(msg.score);
            setComboLeft(msg.combo || 0);
          } else {
            setScoreRight(msg.score);
            setComboRight(msg.combo || 0);
          }
        } else if (msg.type === 'new_question') {
          setCurrentQuestion(msg.question);
        } else if (msg.type === 'challenge_broadcast') {
          const ch = msg.challenge as ChallengeNotification;
          setNotifications(prev => [ch, ...prev]);
          setActiveChallengeToast(ch);
          showSystemNotification(ch.title, { body: ch.message });
          setTimeout(() => setActiveChallengeToast(null), 6000);
        }
      } catch (err) {
        console.error('WebSocket receive error:', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [playerLeftName]);

  // Handle Question Picking
  const pickNextQuestion = useCallback(() => {
    const pool = questions.filter(q => q.category === gameCategory) || questions;
    const candidates = pool.length > 0 ? pool : questions;
    const randomQ = candidates[Math.floor(Math.random() * candidates.length)];
    setCurrentQuestion(randomQ);

    if (isOnlineMode && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'next_question'
      }));
    }
  }, [questions, gameCategory, isOnlineMode]);

  // Start Countdown Sequence
  const startGame = () => {
    setScoreLeft(0);
    setScoreRight(0);
    setComboLeft(0);
    setComboRight(0);
    setCorrectHitsLeft(0);
    setCorrectHitsRight(0);
    setTimeLeft(gameDuration);
    setGameState('countdown');
    setCountdown(3);
    sounds.playStart();
  };

  // Countdown timer logic
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdown > 0) {
      sounds.playTick();
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('playing');
      pickNextQuestion();
    }
  }, [gameState, countdown, pickNextQuestion]);

  // Main Playing Game Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('gameover');
          sounds.playVictory();
          // Submit score to leaderboard
          handleGameFinished();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Submit finish scores to Leaderboard
  const handleGameFinished = async () => {
    const isSingle = playMode === 'single';
    const winnerName = isSingle ? (singlePlayerName || 'Pahlawan Kuis') : (scoreLeft >= scoreRight ? playerLeftName : playerRightName);
    const winnerScore = isSingle ? scoreLeft : Math.max(scoreLeft, scoreRight);
    const winnerKubu = isSingle ? 'kiri' : (scoreLeft >= scoreRight ? 'kiri' : 'kanan');
    const accuracy = Math.round((Math.max(correctHitsLeft, correctHitsRight) / Math.max(1, (scoreLeft + scoreRight) / 10)) * 100);

    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: winnerName,
          score: winnerScore,
          accuracy: Math.min(100, Math.max(70, accuracy || 90)),
          kubu: winnerKubu,
          mode: isSingle ? 'solo' : (isOnlineMode ? 'online' : 'local'),
          category: gameCategory
        })
      });
      fetchLeaderboard();
    } catch {}
  };

  // Ball Touched Event Handler
  const handleBallTouched = (side: 0 | 1, isCorrect: boolean) => {
    if (side === 0) {
      // Left side touched
      if (isCorrect) {
        setScoreLeft(prev => prev + 10 + comboLeft * 2);
        setComboLeft(prev => prev + 1);
        setCorrectHitsLeft(prev => prev + 1);
      } else {
        setScoreLeft(prev => Math.max(0, prev - 5));
        setComboLeft(0);
      }

      // Sync across socket if in online mode
      if (isOnlineMode && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'sync_score',
          score: isCorrect ? scoreLeft + 10 : Math.max(0, scoreLeft - 5),
          combo: isCorrect ? comboLeft + 1 : 0,
          hitType: isCorrect ? 'correct' : 'wrong'
        }));
      }
    } else {
      // Right side touched
      if (isCorrect) {
        setScoreRight(prev => prev + 10 + comboRight * 2);
        setComboRight(prev => prev + 1);
        setCorrectHitsRight(prev => prev + 1);
      } else {
        setScoreRight(prev => Math.max(0, prev - 5));
        setComboRight(0);
      }

      if (isOnlineMode && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'sync_score',
          score: isCorrect ? scoreRight + 10 : Math.max(0, scoreRight - 5),
          combo: isCorrect ? comboRight + 1 : 0,
          hitType: isCorrect ? 'correct' : 'wrong'
        }));
      }
    }
  };

  // Fullscreen trigger
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Sound toggle
  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Baloo_2'] selection:bg-amber-400 selection:text-slate-900 overflow-x-hidden ${theme.bgClass}`}>
      
      {/* Top Navigation Bar */}
      <header className="px-3 sm:px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border-b border-indigo-900/40 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KikiLogo size="sm" showSubtitle={true} showWatermark={true} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Online Matchmaking Button */}
          <button
            onClick={() => setShowLobbyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span className="hidden md:inline">Duel Online 2 Kubu</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          {/* Theme Selector Button */}
          <button
            onClick={() => setShowThemeModal(true)}
            title="Pilih Tema Visual"
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">{theme.name}</span>
          </button>

          {/* Global Leaderboard Button */}
          <button
            onClick={() => {
              fetchLeaderboard();
              setShowLeaderboardModal(true);
            }}
            title="Papan Peringkat Global"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="hidden md:inline">Peringkat</span>
          </button>

          {/* Notification Center Button */}
          <button
            onClick={() => setShowNotificationModal(true)}
            title="Pusat Notifikasi & Tantangan"
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Admin Dashboard */}
          <button
            onClick={() => setShowAdminModal(true)}
            title="Dashboard Edit Soal Admin"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title="Layar Penuh"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Real-time In-App Push Challenge Toast */}
      {activeChallengeToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 border-2 border-amber-400 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 max-w-md w-[92vw]">
          <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-300">{activeChallengeToast.title}</h4>
            <p className="text-xs text-slate-200">{activeChallengeToast.message}</p>
          </div>
          <button
            onClick={() => {
              if (activeChallengeToast.roomCode) {
                setRoomCode(activeChallengeToast.roomCode);
                setShowLobbyModal(true);
              }
              setActiveChallengeToast(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md whitespace-nowrap"
          >
            Terima
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-7xl w-full mx-auto">
        
        {/* Real-time AI Coach Motivation Bar */}
        <div className="w-full max-w-[1280px] mb-2.5">
          <AiMotivationWidget
            eventType={
              comboLeft >= 3 || comboRight >= 3
                ? 'combo_streak'
                : Math.abs(scoreLeft - scoreRight) <= 15 && (scoreLeft > 0 || scoreRight > 0)
                ? 'comeback'
                : 'default'
            }
            playerName={scoreLeft >= scoreRight ? playerLeftName : playerRightName}
            kubu={scoreLeft >= scoreRight ? 'kiri' : 'kanan'}
            scoreLeft={scoreLeft}
            scoreRight={scoreRight}
            combo={Math.max(comboLeft, comboRight)}
          />
        </div>

        {/* Arena Screen View */}
        <div className="w-full relative">
          
          {/* Game Canvas Component */}
          <GameCanvas
            theme={theme}
            currentQuestion={currentQuestion}
            timeLeft={timeLeft}
            totalTime={gameDuration}
            playMode={playMode}
            singlePlayerName={singlePlayerName}
            playerLeftName={playerLeftName}
            playerRightName={playerRightName}
            playerLeftScore={scoreLeft}
            playerRightScore={scoreRight}
            playerLeftCombo={comboLeft}
            playerRightCombo={comboRight}
            useCamera={useCamera}
            sensitivity={sensitivity}
            stabilityMode={stabilityMode}
            fallSpeed={fallSpeed}
            ballSpacing={ballSpacing}
            isGameActive={gameState === 'playing'}
            isOnlineMode={isOnlineMode}
            localPlayerKubu={localKubu}
            onBallTouched={handleBallTouched}
            onNextQuestionRequested={pickNextQuestion}
          />

          {/* In-Game Floating Quick Tuner (Active during gameplay) */}
          {gameState === 'playing' && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-indigo-500/30 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {/* Active Mode Badge */}
                <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
                  playMode === 'single'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                }`}>
                  {playMode === 'single' ? '⭐ SINGLE PLAYER' : '⚔️ VERSUS 2 KUBU'}
                </span>

                <span className="flex items-center gap-1 font-bold text-amber-300 ml-1">
                  <Gauge className="w-4 h-4 text-amber-400" /> Kecepatan:
                </span>
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setFallSpeed(prev => Math.max(50, prev - 25))}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                    title="Perlambat Jatuh"
                  >
                    -
                  </button>
                  <span className="px-2 font-bold text-amber-300 min-w-[65px] text-center">
                    {fallSpeed} px/s
                  </span>
                  <button
                    onClick={() => setFallSpeed(prev => Math.min(320, prev + 25))}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                    title="Percepat Jatuh"
                  >
                    +
                  </button>
                </div>

                {/* Spacing Selector in-game */}
                <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold px-1">Jarak:</span>
                  {(['normal', 'wide', 'extra_wide'] as const).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setBallSpacing(sp)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        ballSpacing === sp
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {sp === 'normal' ? 'Normal' : sp === 'wide' ? 'Renggang' : 'Ekstra Luas'}
                    </button>
                  ))}
                </div>

                <div className="hidden sm:flex gap-1">
                  {[
                    { label: 'Lambat', spd: 75 },
                    { label: 'Normal', spd: 125 },
                    { label: 'Cepat', spd: 195 }
                  ].map(p => (
                    <button
                      key={p.spd}
                      onClick={() => setFallSpeed(p.spd)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                        fallSpeed === p.spd
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {useCamera && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      motionTracker.calibrate();
                      setCalibrationToast('Sensor kamera berhasil dikalibrasi ke ruangan!');
                      setTimeout(() => setCalibrationToast(null), 3000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] transition-all active:scale-95"
                    title="Klik jika sensor tangan terasa goyang atau terganggu cahaya"
                  >
                    <Crosshair className="w-3.5 h-3.5" /> Kalibrasi Sensor
                  </button>

                  <select
                    value={stabilityMode}
                    onChange={(e) => setStabilityMode(e.target.value as typeof stabilityMode)}
                    className="p-1 px-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold focus:outline-none"
                    title="Pilih mode stabilisasi sensor"
                  >
                    <option value="high">Stabilisasi: Tinggi (Anti-Goyang)</option>
                    <option value="balanced">Stabilisasi: Seimbang</option>
                    <option value="sensitive">Stabilisasi: Sensitif</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Calibration Feedback Toast */}
          {calibrationToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-cyan-600 border border-cyan-300 text-white rounded-xl shadow-2xl text-xs font-bold animate-bounce flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white" />
              {calibrationToast}
            </div>
          )}

          {/* Countdown Overlay */}
          {gameState === 'countdown' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-3xl animate-in fade-in">
              <div className="text-9xl font-black text-amber-400 font-['Baloo_2'] animate-ping drop-shadow-[0_0_35px_rgba(251,191,36,0.8)]">
                {countdown > 0 ? countdown : 'MULAI!'}
              </div>
              <p className="text-lg font-bold text-white mt-6 tracking-wide drop-shadow-md">
                {useCamera ? '🖐️ Berdiri di kubu masing-masing & lambaikan tangan ke bola jawaban!' : '🖱️ Sentuh atau klik bola jawaban yang benar!'}
              </p>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md rounded-3xl animate-in zoom-in-95 text-center overflow-y-auto max-h-full">
              {/* Brand Logo & Acronym */}
              <KikiLogo size="md" showSubtitle={true} showWatermark={false} className="mb-2" />

              <h2 className="text-2xl sm:text-4xl font-black font-['Baloo_2'] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mb-1">
                {playMode === 'single' ? 'Sesi Solo Selesai! 🎉' : 'Pertarungan Kuis Selesai!'}
              </h2>
              <p className="text-sm text-slate-300 mb-3">
                {playMode === 'single'
                  ? `Hasil Refleks & Pengetahuan ${singlePlayerName || 'Pahlawan Kuis'}!`
                  : scoreLeft === scoreRight
                  ? 'Pertarungan Sengit! Hasil Seri Sempurna!'
                  : scoreLeft > scoreRight
                  ? `🏆 Kemenangan Telak untuk ${playerLeftName} (Kubu Kiri)!`
                  : `🏆 Kemenangan Telak untuk ${playerRightName} (Kubu Kanan)!`}
              </p>

              {/* AI Motivation Coach Evaluation */}
              <div className="w-full max-w-md mb-4">
                <AiMotivationWidget
                  eventType="game_over"
                  playerName={playMode === 'single' ? (singlePlayerName || 'Pahlawan Kuis') : (scoreLeft >= scoreRight ? playerLeftName : playerRightName)}
                  kubu={scoreLeft >= scoreRight ? 'kiri' : 'kanan'}
                  scoreLeft={scoreLeft}
                  scoreRight={scoreRight}
                  combo={Math.max(comboLeft, comboRight)}
                />
              </div>

              {playMode === 'single' ? (
                /* Single Player Performance Scorecard */
                <div className="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-950/40 via-slate-900/70 to-indigo-950/40 max-w-md w-full mb-4 shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      ⭐ MODE SINGLE PLAYER
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold uppercase">
                      {scoreLeft >= 120 ? 'GRADE S • SANG MAESTRO' : scoreLeft >= 80 ? 'GRADE A • SANGAT HEBAT' : scoreLeft >= 50 ? 'GRADE B • BAGUS' : 'GRADE C • TERUS BERLATIH'}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-white">{singlePlayerName || 'Pahlawan Kuis'}</h4>
                  <div className="text-5xl font-black text-amber-300 my-2 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                    {scoreLeft} <span className="text-sm font-semibold text-slate-400">POIN</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <div>Jawaban Tepat: <b className="text-emerald-400">{correctHitsLeft}</b></div>
                    <div>Kombo Terpanjang: <b className="text-amber-400">{comboLeft}x</b></div>
                  </div>
                </div>
              ) : (
                /* Versus 2 Kubu Cards */
                <div className="grid grid-cols-2 gap-3 max-w-md w-full mb-4">
                  <div className={`p-3.5 rounded-2xl border-2 ${scoreLeft >= scoreRight ? 'border-cyan-400 bg-cyan-950/30' : 'border-slate-800 bg-slate-900/60'}`}>
                    <span className="text-[11px] font-bold text-cyan-400">KUBU KIRI</span>
                    <h4 className="text-base font-bold text-white truncate">{playerLeftName}</h4>
                    <div className="text-3xl font-black text-amber-300 my-0.5">{scoreLeft}</div>
                    <span className="text-[11px] text-slate-400">{correctHitsLeft} jawaban tepat</span>
                  </div>

                  <div className={`p-3.5 rounded-2xl border-2 ${scoreRight >= scoreLeft ? 'border-rose-400 bg-rose-950/30' : 'border-slate-800 bg-slate-900/60'}`}>
                    <span className="text-[11px] font-bold text-rose-400">KUBU KANAN</span>
                    <h4 className="text-base font-bold text-white truncate">{playerRightName}</h4>
                    <div className="text-3xl font-black text-amber-300 my-0.5">{scoreRight}</div>
                    <span className="text-[11px] text-slate-400">{correctHitsRight} jawaban tepat</span>
                  </div>
                </div>
              )}

              {/* Watermark certificate */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-4 font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Battle Record • Game KIKI by <span className="text-cyan-300 font-bold">kikybahsoan</span></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={startGame}
                  className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-400/20 active:scale-95 transition-all"
                >
                  Main Lagi ⚡
                </button>
                <button
                  onClick={() => setGameState('menu')}
                  className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base transition-colors"
                >
                  Pengaturan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control & Configuration Panel (Active when menu mode or paused) */}
        {gameState === 'menu' && (
          <div className="w-full max-w-4xl mt-6 space-y-4">
            {/* Grand Hero Welcome Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
              <KikiLogo size="lg" showSubtitle={true} showWatermark={true} className="mb-4" />
              
              {/* Mode Selection Chips */}
              <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-md w-full mb-3 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPlayMode('single')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    playMode === 'single'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" /> Single Player (Solo)
                </button>
                <button
                  type="button"
                  onClick={() => setPlayMode('versus')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    playMode === 'versus'
                      ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-4 h-4" /> Versus (Duel 2 Kubu)
                </button>
              </div>

              <p className="max-w-xl text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed">
                {playMode === 'single'
                  ? 'Mode Solo: Asah refleks dan kecerdasanmu di seluruh arena layar penuh! Lambaikan tangan atau sentuh bola untuk mencetak rekor skor dan kombo tertinggi.'
                  : 'Mode Versus: Uji kecepatan refleks dan kecerdasan otak dalam duel kuis 2 kubu split-screen! Bersaing secara lokal atau tantang lawan online.'}
              </p>
              
              {/* Live AI Motivation Tip in Menu */}
              <div className="w-full max-w-lg mb-4">
                <AiMotivationWidget eventType="default" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={startGame}
                  className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all text-slate-950 ${
                    playMode === 'single'
                      ? 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-500 hover:to-emerald-500 shadow-cyan-500/25'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-500/25'
                  }`}
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  {playMode === 'single' ? 'MAIN SINGLE PLAYER (SOLO) ⚡' : 'MULAI DUEL VERSUS ⚔️'}
                </button>

                {playMode === 'versus' && (
                  <button
                    onClick={() => setShowLobbyModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 text-cyan-200 font-bold text-sm transition-all active:scale-95"
                  >
                    <Swords className="w-4 h-4 text-cyan-400" /> Duel Online 2 Kubu
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-indigo-900/40 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold font-['Baloo_2'] text-amber-300">
                  Pengaturan Permainan ({playMode === 'single' ? 'Single Player' : 'Versus 2 Kubu'})
                </h3>
                <p className="text-xs text-slate-400">
                  Sesuaikan nama pemain, kategori mata pelajaran, durasi waktu, dan sensitivitas kamera
                </p>
              </div>
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" /> MULAI GAME!
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* Player Name(s) based on playMode */}
              {playMode === 'single' ? (
                <div className="sm:col-span-2">
                  <label className="block text-cyan-400 font-bold mb-1">Nama Pemain (Single Player)</label>
                  <input
                    type="text"
                    value={singlePlayerName}
                    onChange={(e) => setSinglePlayerName(e.target.value)}
                    maxLength={18}
                    placeholder="Masukkan nama pemain..."
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-cyan-400 font-bold mb-1">Nama Pemain Kubu Kiri</label>
                    <input
                      type="text"
                      value={playerLeftName}
                      onChange={(e) => setPlayerLeftName(e.target.value)}
                      maxLength={14}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-rose-400 font-bold mb-1">Nama Pemain Kubu Kanan</label>
                    <input
                      type="text"
                      value={playerRightName}
                      onChange={(e) => setPlayerRightName(e.target.value)}
                      maxLength={14}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-rose-400"
                    />
                  </div>
                </>
              )}

              {/* Subject Category */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Mata Pelajaran</label>
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="math">Matematika</option>
                  <option value="eng">Bahasa Inggris (Kosakata)</option>
                  <option value="science">IPA / Sains</option>
                  <option value="general">Pengetahuan Umum</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tingkat Kelas</label>
                <select
                  value={gameLevel}
                  onChange={(e) => setGameLevel(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value={1}>Kelas 1 SD</option>
                  <option value={2}>Kelas 2 SD</option>
                  <option value={3}>Kelas 3 SD</option>
                  <option value={4}>Kelas 4 SD</option>
                  <option value={5}>Kelas 5 SD</option>
                  <option value={6}>Kelas 6 SD</option>
                  <option value={7}>Kelas 7 SMP</option>
                  <option value={8}>Kelas 8 SMP</option>
                  <option value={9}>Kelas 9 SMP</option>
                  <option value={10}>Kelas 10 SMA</option>
                  <option value={11}>Kelas 11 SMA</option>
                  <option value={12}>Kelas 12 SMA</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
              {/* Duration Radio */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Durasi Permainan</label>
                <div className="flex gap-2">
                  {[30, 60, 90, 120].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setGameDuration(dur)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border transition-all ${
                        gameDuration === dur
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                          : 'border-slate-800 bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Mode: Camera vs Mouse/Touch */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Metode Deteksi Input</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUseCamera(true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-bold border transition-all ${
                      useCamera
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300'
                        : 'border-slate-800 bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> Kamera Tangan
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCamera(false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-bold border transition-all ${
                      !useCamera
                        ? 'border-indigo-400 bg-indigo-400/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CameraOff className="w-3.5 h-3.5" /> Sentuh / Mouse
                  </button>
                </div>
              </div>

              {/* Quick Calibration Action */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Kalibrasi Kamera Ruangan</label>
                <button
                  type="button"
                  onClick={() => {
                    motionTracker.calibrate();
                    setCalibrationToast('Sensor kamera berhasil dikalibrasi ke ruangan!');
                    setTimeout(() => setCalibrationToast(null), 3000);
                  }}
                  disabled={!useCamera}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all active:scale-95 disabled:opacity-40"
                >
                  <Crosshair className="w-3.5 h-3.5" /> Reset & Kalibrasi Sensor
                </button>
              </div>
            </div>

            {/* Dedicated Falling Speed and Sensor Stability Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800 text-xs">
              
              {/* 1. Setting Cepat Lambatnya Jatuh (Falling Speed) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Gauge className="w-4 h-4 text-amber-400" /> Kecepatan Jatuh Bola
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[11px] border border-amber-400/30">
                    {fallSpeed} px/detik
                  </span>
                </div>

                {/* Preset Speed Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Lambat', spd: 75, desc: 'Santai' },
                    { label: 'Normal', spd: 125, desc: 'Standar' },
                    { label: 'Cepat', spd: 195, desc: 'Tantangan' },
                    { label: 'Kilat', spd: 280, desc: 'Ekstrem' }
                  ].map(p => (
                    <button
                      key={p.spd}
                      type="button"
                      onClick={() => setFallSpeed(p.spd)}
                      className={`p-1.5 rounded-xl text-center border transition-all ${
                        fallSpeed === p.spd
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 font-bold shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{p.label}</div>
                      <div className="text-[9px] opacity-75">{p.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Precision Falling Speed Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Sangat Lambat (50 px/s)</span>
                    <span>Sangat Cepat (320 px/s)</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="320"
                    step="5"
                    value={fallSpeed}
                    onChange={(e) => setFallSpeed(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                {/* Spacing Selector (Jarak Antar Bola) */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 font-semibold text-[11px]">Jarak Antar Bola yang Jatuh</span>
                    <span className="text-amber-300 font-bold text-[10px]">
                      {ballSpacing === 'extra_wide' ? 'Ekstra Luas (250px)' : ballSpacing === 'wide' ? 'Renggang (210px)' : 'Standar (160px)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'normal', label: 'Standar', desc: '160px' },
                      { id: 'wide', label: 'Renggang', desc: '210px (Rekomendasi)' },
                      { id: 'extra_wide', label: 'Ekstra Luas', desc: '250px' }
                    ].map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setBallSpacing(s.id as typeof ballSpacing)}
                        className={`p-1.5 rounded-xl text-center border transition-all ${
                          ballSpacing === s.id
                            ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 font-bold shadow-md'
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-[10px]">{s.label}</div>
                        <div className="text-[9px] opacity-75">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Setting Sensor Tangan Stabil & Anti-Goyang */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" /> Stabilisasi Sensor Tangan
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Sensitivitas: <b className="text-amber-300">{sensitivity}/10</b>
                  </span>
                </div>

                {/* Stability Mode Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'high', label: 'Tinggi', desc: 'Anti-Goyang' },
                    { id: 'balanced', label: 'Seimbang', desc: 'Standar' },
                    { id: 'sensitive', label: 'Sensitif', desc: 'Mikro' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setStabilityMode(m.id as typeof stabilityMode)}
                      className={`p-1.5 rounded-xl text-center border transition-all ${
                        stabilityMode === m.id
                          ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 font-bold shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{m.label}</div>
                      <div className="text-[9px] opacity-75">{m.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Sensitivity Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Kurang Sensitif (1)</span>
                    <span>Sangat Sensitif (10)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                    disabled={!useCamera}
                    className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>

      {/* Modals */}
      {showThemeModal && (
        <ThemeSelector
          currentTheme={theme}
          onSelectTheme={(t) => setTheme(t)}
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showAdminModal && (
        <AdminDashboard
          questions={questions}
          onAddQuestion={async (q) => {
            const res = await fetch('/api/questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(q)
            });
            const data = await res.json();
            if (data.question) {
              setQuestions(prev => [data.question, ...prev]);
            }
          }}
          onUpdateQuestion={async (q) => {
            const res = await fetch(`/api/questions/${q.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(q)
            });
            const data = await res.json();
            if (data.question) {
              setQuestions(prev => prev.map(item => item.id === q.id ? data.question : item));
            }
          }}
          onDeleteQuestion={async (id) => {
            await fetch(`/api/questions/${id}`, { method: 'DELETE' });
            setQuestions(prev => prev.filter(q => q.id !== id));
          }}
          onResetQuestions={async () => {
            const res = await fetch('/api/questions/reset', { method: 'POST' });
            const data = await res.json();
            if (data.questions) {
              setQuestions(data.questions);
            }
          }}
          onClose={() => setShowAdminModal(false)}
        />
      )}

      {showLeaderboardModal && (
        <LeaderboardModal
          leaderboard={leaderboard}
          onRefresh={fetchLeaderboard}
          onClose={() => setShowLeaderboardModal(false)}
        />
      )}

      {showNotificationModal && (
        <NotificationCenter
          notifications={notifications}
          onSendChallenge={async (data) => {
            await fetch('/api/challenge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            fetchNotifications();
          }}
          onJoinRoomFromChallenge={(code) => {
            setRoomCode(code);
            setShowLobbyModal(true);
          }}
          onClose={() => setShowNotificationModal(false)}
        />
      )}

      {showLobbyModal && (
        <MultiplayerLobbyModal
          onlineCount={onlineCount}
          playerName={playerLeftName}
          onSetPlayerName={setPlayerLeftName}
          roomCode={roomCode}
          onSetRoomCode={setRoomCode}
          selectedKubu={localKubu}
          onSetSelectedKubu={setLocalKubu}
          roomMembers={roomMembers}
          onJoinRoom={(code, kubu) => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({
                type: 'create_or_join_room',
                roomCode: code,
                kubu,
                name: playerLeftName,
                category: gameCategory,
                level: gameLevel,
                duration: gameDuration
              }));
            }
          }}
          onStartMatch={() => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({
                type: 'start_match'
              }));
            }
            startGame();
          }}
          isHost={true}
          onClose={() => setShowLobbyModal(false)}
        />
      )}

      {/* Official Footer with kikybahsoan Watermark */}
      <footer className="mt-auto py-6 border-t border-slate-900/80 bg-slate-950/90 text-center text-xs text-slate-400 z-30">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <KikiLogo size="sm" showSubtitle={false} showWatermark={false} />
            <div className="text-left">
              <span className="font-bold text-slate-200 text-xs block">
                KIKI: Kompetisi Interaktif Kuis Indonesia
              </span>
              <span className="text-[10px] text-slate-500 italic block">
                Kuis Interaktif Kamera Inovatif
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>
              Created & Developed by <span className="font-extrabold text-cyan-300 underline decoration-cyan-500/40">kikybahsoan</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            © 2026 KIKI Games • All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
