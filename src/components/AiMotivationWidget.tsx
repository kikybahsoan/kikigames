import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Sparkles, RefreshCw, Flame, Award } from 'lucide-react';

interface Props {
  eventType?: 'combo_streak' | 'comeback' | 'wrong_hit' | 'lead_change' | 'game_over' | 'default';
  playerName?: string;
  kubu?: 'kiri' | 'kanan';
  scoreLeft?: number;
  scoreRight?: number;
  combo?: number;
  className?: string;
}

export const AiMotivationWidget: React.FC<Props> = ({
  eventType = 'default',
  playerName = 'Pemain',
  kubu = 'kiri',
  scoreLeft = 0,
  scoreRight = 0,
  combo = 0,
  className = ''
}) => {
  const [message, setMessage] = useState<string>('Refleks secepat kilat! Buktikan ketajaman ilmumu di arena KIKI!');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchMotivation = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-motivation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          playerName,
          kubu,
          scoreLeft,
          scoreRight,
          combo
        })
      });
      const data = await res.json();
      if (data && data.message) {
        setMessage(data.message);
      }
    } catch {
      // Fallback
      if (combo >= 3) {
        setMessage(`🔥 Kombo ${combo}x membara! Fokus tak terbendung, teruskan dominasi!`);
      } else {
        setMessage('⚡ Setiap detik adalah peluang emas! Sapu bola jawaban yang tepat!');
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventType, playerName, kubu, scoreLeft, scoreRight, combo]);

  useEffect(() => {
    fetchMotivation();
  }, [fetchMotivation]);

  return (
    <div
      className={`relative p-3 rounded-2xl bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-cyan-950/90 border border-indigo-500/40 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs ${className}`}
    >
      {/* Bot Icon with Animated Glow */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md border border-cyan-300/40">
          <Bot className="w-4 h-4 text-white" />
          <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-ping" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 font-extrabold text-cyan-300 text-[11px]">
            <span>AI Coach Kiki</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] uppercase tracking-wider">
              Live Motivasi
            </span>
          </div>
          <p className="text-slate-100 font-semibold text-xs mt-0.5 leading-snug">
            {message}
          </p>
        </div>
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={fetchMotivation}
        disabled={isLoading}
        className="px-2.5 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/70 border border-indigo-400/40 text-cyan-200 font-bold text-[11px] shrink-0 flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
        title="Dapatkan kata motivasi baru dari AI Coach"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
        <span className="hidden sm:inline">Motivasi AI</span>
      </button>
    </div>
  );
};
