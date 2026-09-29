import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Medal, X, Flame, Shield, Award, RefreshCw } from 'lucide-react';

interface Props {
  leaderboard: LeaderboardEntry[];
  onRefresh: () => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<Props> = ({ leaderboard, onRefresh, onClose }) => {
  const [filterMode, setFilterMode] = useState<'all' | 'solo' | 'local' | 'online'>('all');
  const [filterKubu, setFilterKubu] = useState<'all' | 'kiri' | 'kanan'>('all');

  const filtered = leaderboard.filter(item => {
    const matchMode = filterMode === 'all' || item.mode === filterMode;
    const matchKubu = filterKubu === 'all' || item.kubu === filterKubu;
    return matchMode && matchKubu;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[88vh] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-['Baloo_2'] text-amber-300">
                Papan Peringkat Global
              </h2>
              <p className="text-xs text-slate-400">
                Skor tertinggi pertarungan kuis gerak tangan antar pemain & kubu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              title="Perbarui Data"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-3 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'all' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Mode
            </button>
            <button
              onClick={() => setFilterMode('solo')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'solo' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ Single Player
            </button>
            <button
              onClick={() => setFilterMode('online')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'online' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Online Versus
            </button>
            <button
              onClick={() => setFilterMode('local')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterMode === 'local' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Versus 2 Kubu
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterKubu('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterKubu === 'all' ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Kubu
            </button>
            <button
              onClick={() => setFilterKubu('kiri')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterKubu === 'kiri' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kubu Kiri
            </button>
            <button
              onClick={() => setFilterKubu('kanan')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                filterKubu === 'kanan' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kubu Kanan
            </button>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="font-semibold text-sm">Belum ada catatan skor untuk filter ini.</p>
              <p className="text-xs text-slate-500">Jadilah yang pertama mencetak rekor di arena kuis!</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isTop3 = idx < 3;
              const medalColor = idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-amber-600';
              const rankBg = idx === 0 ? 'bg-amber-400/10 border-amber-400/40' : 'bg-slate-800/60 border-slate-800';

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:scale-[1.01] ${rankBg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex items-center justify-center font-extrabold text-base">
                      {isTop3 ? (
                        <Medal className={`w-6 h-6 ${medalColor}`} />
                      ) : (
                        <span className="text-slate-400 font-bold text-sm">#{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-white">
                          {item.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.kubu === 'kiri'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {item.kubu === 'kiri' ? 'Kubu Kiri' : 'Kubu Kanan'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize">{item.category}</span>
                        <span>•</span>
                        <span>Akurasi: {item.accuracy}%</span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-extrabold text-lg sm:text-xl text-amber-300 font-['Baloo_2']">
                      <Flame className="w-4 h-4 text-amber-400" />
                      {item.score}
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">poin skor</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
          <span>Papan peringkat otomatis tersinkronisasi via Socket</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
