import React, { useState } from 'react';
import { ChallengeNotification } from '../types';
import { 
  Bell, Send, ShieldCheck, CheckCircle2, 
  X, Swords, AlertCircle, Sparkles, Flame 
} from 'lucide-react';
import { requestPushPermission, getPushPermissionStatus } from '../utils/pushNotifications';

interface Props {
  notifications: ChallengeNotification[];
  onSendChallenge: (data: { challengerName: string; category: string; roomCode: string }) => Promise<void>;
  onJoinRoomFromChallenge?: (roomCode: string) => void;
  onClose: () => void;
}

export const NotificationCenter: React.FC<Props> = ({
  notifications,
  onSendChallenge,
  onJoinRoomFromChallenge,
  onClose
}) => {
  const [permission, setPermission] = useState<string>(getPushPermissionStatus());
  const [challengerName, setChallengerName] = useState('Pemain Kiki');
  const [selectedCategory, setSelectedCategory] = useState('math');
  const [roomCode, setRoomCode] = useState('ARENA-' + Math.floor(100 + Math.random() * 900));
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleRequestPush = async () => {
    const granted = await requestPushPermission();
    setPermission(granted ? 'granted' : 'denied');
    if (granted) {
      setFeedback('Notifikasi push berhasil diaktifkan! Anda akan menerima peringatan saat ada tantangan baru.');
    } else {
      setFeedback('Izin notifikasi belum diizinkan oleh peramban.');
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengerName.trim()) return;

    setIsSending(true);
    try {
      await onSendChallenge({
        challengerName: challengerName.trim(),
        category: selectedCategory,
        roomCode: roomCode.trim()
      });
      setFeedback(`Tantangan "${roomCode}" berhasil disiarkan ke semua pemain!`);
    } catch {
      setFeedback('Gagal mengirim tantangan.');
    } finally {
      setIsSending(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[90vh] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Baloo_2'] text-amber-300">
                Pusat Notifikasi & Tantangan
              </h2>
              <p className="text-xs text-slate-400">
                Terima dan kirim tantangan kuis real-time ke pemain lain
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

        {/* Push Notification Toggle Box */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Notifikasi Web Push Sistem</h4>
              <p className="text-[11px] text-slate-400">
                {permission === 'granted'
                  ? 'Status: Aktif ✓ (Anda akan diberitahu saat ada pemain baru)'
                  : 'Aktifkan notifikasi peramban agar tidak ketinggalan duel'}
              </p>
            </div>
          </div>

          {permission === 'granted' ? (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
            </span>
          ) : (
            <button
              onClick={handleRequestPush}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all whitespace-nowrap"
            >
              Aktifkan
            </button>
          )}
        </div>

        {feedback && (
          <div className="mb-3 p-2.5 rounded-xl bg-indigo-600/90 border border-indigo-400 text-white text-xs font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            {feedback}
          </div>
        )}

        {/* Send Challenge Form */}
        <form onSubmit={handleSend} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 mb-4">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-4 h-4" /> Kirim Tantangan Duel ke Publik
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nama Penantang</label>
              <input
                type="text"
                value={challengerName}
                onChange={(e) => setChallengerName(e.target.value)}
                maxLength={18}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Kategori Soal</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs font-semibold"
              >
                <option value="math">Matematika</option>
                <option value="eng">Bahasa Inggris</option>
                <option value="science">IPA / Sains</option>
                <option value="general">Pengetahuan Umum</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Kode Room"
              className="flex-1 p-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-bold tracking-wider text-xs focus:outline-none focus:border-amber-400 uppercase"
            />
            <button
              type="submit"
              disabled={isSending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Siarkan
            </button>
          </div>
        </form>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Riwayat Tantangan Masuk
          </h4>
          {notifications.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              Belum ada tantangan aktif saat ini.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-amber-300 text-sm font-['Baloo_2']">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                    <span>Oleh: <b>{notif.challengerName}</b></span>
                    <span>•</span>
                    <span className="capitalize">Kategori: {notif.category}</span>
                    {notif.roomCode && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-bold tracking-wider">
                          Kode: {notif.roomCode}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {notif.roomCode && onJoinRoomFromChallenge && (
                  <button
                    onClick={() => {
                      onJoinRoomFromChallenge(notif.roomCode!);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-md whitespace-nowrap active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Flame className="w-3.5 h-3.5" /> Masuk Room
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
