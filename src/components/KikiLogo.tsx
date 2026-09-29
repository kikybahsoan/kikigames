import React from 'react';
import { Zap, Sparkles, Award } from 'lucide-react';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showWatermark?: boolean;
  className?: string;
}

export const KikiLogo: React.FC<Props> = ({
  size = 'md',
  showSubtitle = true,
  showWatermark = true,
  className = ''
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Brand Icon & Typography Container */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Emblem Crest */}
        <div
          className={`relative rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 ${
            isSm
              ? 'w-9 h-9 p-1.5 bg-gradient-to-br from-cyan-500 via-indigo-600 to-rose-500 border border-cyan-300/40 shadow-cyan-500/20'
              : isLg
              ? 'w-16 h-16 p-3 bg-gradient-to-br from-cyan-400 via-indigo-600 to-rose-500 border-2 border-cyan-300/60 shadow-indigo-500/40'
              : 'w-11 h-11 p-2 bg-gradient-to-br from-cyan-500 via-indigo-600 to-rose-500 border border-cyan-300/50 shadow-cyan-500/30'
          }`}
        >
          {/* Glowing Aura Ring */}
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-md -z-10 animate-pulse" />

          {/* Central Lightning & Quiz Star */}
          <div className="relative flex items-center justify-center w-full h-full bg-slate-950/80 rounded-xl">
            <Zap
              className={`text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] ${
                isSm ? 'w-4 h-4' : isLg ? 'w-8 h-8' : 'w-5 h-5'
              }`}
            />
            <Sparkles
              className={`absolute -top-1 -right-1 text-cyan-300 ${
                isSm ? 'w-2.5 h-2.5' : isLg ? 'w-4 h-4' : 'w-3 h-3'
              }`}
            />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="text-left flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-black tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 ${
                isSm ? 'text-xl leading-none' : isLg ? 'text-4xl leading-none' : 'text-2xl leading-none'
              }`}
              style={{ fontFamily: '"Baloo 2", sans-serif' }}
            >
              KIKI
            </span>
            <span
              className={`font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 ${
                isSm ? 'text-[9px]' : isLg ? 'text-xs' : 'text-[10px]'
              }`}
            >
              GAMES
            </span>
          </div>

          {/* Acronym Definition */}
          {showSubtitle && (
            <div className="flex flex-col">
              <span
                className={`font-bold text-slate-300 ${
                  isSm ? 'text-[9px]' : isLg ? 'text-xs' : 'text-[10px]'
                }`}
              >
                <span className="text-cyan-400 font-extrabold">K</span>ompetisi{' '}
                <span className="text-indigo-400 font-extrabold">I</span>nteraktif{' '}
                <span className="text-amber-400 font-extrabold">K</span>uis{' '}
                <span className="text-rose-400 font-extrabold">I</span>ndonesia
              </span>
              <span
                className={`text-slate-400 italic ${
                  isSm ? 'text-[8px]' : isLg ? 'text-[10px]' : 'text-[9px]'
                }`}
              >
                (Kuis Interaktif Kamera Inovatif)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Signature Watermark by kikybahsoan */}
      {showWatermark && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400/90 tracking-wide font-medium">
          <Award className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            Created by <span className="font-bold text-cyan-300 underline decoration-cyan-500/40">kikybahsoan</span>
          </span>
        </div>
      )}
    </div>
  );
};
