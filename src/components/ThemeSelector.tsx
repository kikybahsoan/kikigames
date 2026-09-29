import React from 'react';
import { THEMES } from '../data/themes';
import { ThemeConfig } from '../types';
import { Palette, X, Check, Sparkles, Sun, Shield, Smile, Zap, Camera } from 'lucide-react';

interface Props {
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  onClose: () => void;
}

export const ThemeSelector: React.FC<Props> = ({ currentTheme, onSelectTheme, onClose }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return <Camera className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Sun': return <Sun className="w-5 h-5" />;
      case 'Smile': return <Smile className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl shadow-indigo-950/50 text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Baloo_2'] text-amber-300">Pilih Tema Arena Visual</h3>
              <p className="text-xs text-slate-400">Ubah gaya visual latar belakang dan bola kuis sesuai seleramu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-6 max-h-[60vh] overflow-y-auto pr-1">
          {THEMES.map((theme) => {
            const isSelected = theme.id === currentTheme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-amber-400 bg-indigo-950/80 shadow-lg shadow-amber-400/20 scale-[1.02]'
                    : 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <div className="flex items-center gap-2.5 mb-2 font-semibold text-sm">
                  <span style={{ color: theme.primaryColor }}>{getIcon(theme.icon)}</span>
                  <span>{theme.name}</span>
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.primaryColor }} title="Warna Utama" />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.secondaryColor }} title="Warna Sekunder" />
                  <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.accentColor }} title="Aksen" />
                  <span className="text-[11px] text-slate-400 ml-auto capitalize">Tipe: {theme.ballTheme}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md active:scale-95 transition-all text-sm"
          >
            Terapkan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
