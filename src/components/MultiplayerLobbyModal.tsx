import React, { useState } from 'react';
import { Swords, Users, Shield, Zap, X, Check, Play, Globe } from 'lucide-react';

interface Props {
  onlineCount: number;
  playerName: string;
  onSetPlayerName: (name: string) => void;
  roomCode: string;
  onSetRoomCode: (code: string) => void;
  selectedKubu: 'kiri' | 'kanan';
  onSetSelectedKubu: (kubu: 'kiri' | 'kanan') => void;
  roomMembers: Array<{ id: string; name: string; kubu: 'kiri' | 'kanan'; score: number }>;
  onJoinRoom: (code: string, kubu: 'kiri' | 'kanan') => void;
  onStartMatch: () => void;
  isHost: boolean;
  onClose: () => void;
}

export const MultiplayerLobbyModal: React.FC<Props> = ({
  onlineCount,
  playerName,
  onSetPlayerName,
  roomCode,
  onSetRoomCode,
  selectedKubu,
  onSetSelectedKubu,
  roomMembers,
  onJoinRoom,
  onStartMatch,
  isHost,
  onClose
}) => {
  const [localCode, setLocalCode] = useState(roomCode);
  const [hasJoined, setHasJoined] = useState(roomMembers.length > 0);

  const leftMembers = roomMembers.filter(m => m.kubu === 'kiri');
  const rightMembers = roomMembers.filter(m => m.kubu === 'kanan');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localCode.trim()) return;
    onSetRoomCode(localCode.toUpperCase().trim());
    onJoinRoom(localCode.toUpperCase().trim(), selectedKubu);
    setHasJoined(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-['Baloo_2'] text-amber-300">
                  Arena Duel 2 Kubu Online
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {onlineCount} Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pilih kubu, bergabung ke room, dan bertanding secara real-time via WebSocket
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Name and Kubu Setup */}
        <div className="my-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nama Pemain Anda</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => onSetPlayerName(e.target.value)}
                maxLength={16}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Kode Room Duel</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localCode}
                  onChange={(e) => setLocalCode(e.target.value.toUpperCase())}
                  placeholder="ARENA-1"
                  className="flex-1 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold tracking-wider uppercase focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleJoin}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all active:scale-95 shadow-md"
                >
                  Masuk
                </button>
              </div>
            </div>
          </div>

          {/* Kubu Selector */}
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2">
              Pilih Kubu Anda (Posisi Vertikal di Layar):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  onSetSelectedKubu('kiri');
                  if (hasJoined) onJoinRoom(localCode, 'kiri');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  selectedKubu === 'kiri'
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-cyan-400 text-sm font-['Baloo_2']">
                    KUBU KIRI (TIM BIRU)
                  </span>
                  {selectedKubu === 'kiri' && <Check className="w-4 h-4 text-cyan-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Mengendalikan bola jawaban di sisi kiri layar dengan kamera / sentuhan
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSetSelectedKubu('kanan');
                  if (hasJoined) onJoinRoom(localCode, 'kanan');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                  selectedKubu === 'kanan'
                    ? 'border-rose-400 bg-rose-950/40 shadow-lg shadow-rose-500/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-rose-400 text-sm font-['Baloo_2']">
                    KUBU KANAN (TIM MERAH)
                  </span>
                  {selectedKubu === 'kanan' && <Check className="w-4 h-4 text-rose-400" />}
                </div>
                <p className="text-[11px] text-slate-400">
                  Mengendalikan bola jawaban di sisi kanan layar dengan kamera / sentuhan
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Live Arena Room Split Screen Preview */}
        <div className="flex-1 my-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold">
              Status Room: <b className="text-amber-300">{localCode}</b>
            </span>
            <span className="text-slate-400">
              {roomMembers.length} Pemain di Room
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            {/* Left Kubu Box */}
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-2">
                <Shield className="w-4 h-4" /> Kubu Kiri
              </div>
              <div className="space-y-1.5 min-h-[48px]">
                {leftMembers.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">Belum ada pemain di kubu ini</span>
                ) : (
                  leftMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between font-semibold text-slate-200">
                      <span>• {m.name}</span>
                      <span className="text-[10px] text-cyan-400 font-bold">SIAP</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Kubu Box */}
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-2">
                <Zap className="w-4 h-4" /> Kubu Kanan
              </div>
              <div className="space-y-1.5 min-h-[48px]">
                {rightMembers.length === 0 ? (
                  <span className="text-slate-500 italic text-[11px]">Belum ada pemain di kubu ini</span>
                ) : (
                  rightMembers.map(m => (
                    <div key={m.id} className="flex items-center justify-between font-semibold text-slate-200">
                      <span>• {m.name}</span>
                      <span className="text-[10px] text-rose-400 font-bold">SIAP</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onStartMatch();
                onClose();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all font-['Baloo_2']"
            >
              <Play className="w-4 h-4 fill-white" /> MULAI DUEL SEKARANG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
