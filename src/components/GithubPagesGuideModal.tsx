import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertTriangle, ArrowRight, X, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const GithubPagesGuideModal: React.FC<Props> = ({ onClose }) => {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    setTimeout(() => setCopiedStep(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl text-white flex flex-col max-h-[92vh] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-lg">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Baloo_2'] text-amber-300">
                Solusi & Panduan Deploy GitHub Pages
              </h2>
              <p className="text-xs text-slate-400">
                Mengatasi layar putih (blank screen) & panduan setting 1-klik di GitHub Pages
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs sm:text-sm">
          
          {/* Explanation Alert */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300">Mengapa Sebelumnya Layar Putih (Blank)?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Di Vite / React, file utama adalah TypeScript (<code className="text-cyan-300">.tsx</code>). Jika GitHub Pages di-set <b>"Deploy from a branch (main / root)"</b>, browser menerima file mentah yang belum di-compile ke JavaScript, serta path aset mencari domain root (<code className="text-cyan-300">/assets/</code>) bukan subfolder repo.
              </p>
            </div>
          </div>

          {/* Solution 1: Recommended */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-800/80 border-2 border-indigo-500/40">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> CARA 1 (PALING MUDAH & OTOMATIS)
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Rekomendasi Resmi GitHub & Vite</span>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Kami sudah membuatkan file otomatisasi <b>GitHub Actions</b> (<code className="text-cyan-300">.github/workflows/deploy.yml</code>) dan setting <code className="text-cyan-300">base: './'</code> di <code className="text-cyan-300">vite.config.ts</code>.
            </p>

            <ol className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                <div>
                  Buka repository Anda di <b>GitHub</b> &rarr; klik tab <b>Settings</b> &rarr; pilih <b>Pages</b> di menu sebelah kiri.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                <div>
                  Pada bagian <b>Build and deployment</b> &rarr; <b>Source</b>, ubah dari <i>"Deploy from a branch"</i> menjadi:
                  <div className="mt-1 font-bold text-amber-300 text-sm">
                    &bull; "GitHub Actions"
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                <div>
                  Commit & Push kode ini ke GitHub. GitHub Actions akan otomatis mem-build dan mendeploy website Anda dalam 1 menit!
                </div>
              </li>
            </ol>
          </div>

          {/* Solution 2: If still wanting "Deploy from a branch" */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
            <h4 className="font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <span>CARA 2: Jika Tetap Memilih "Deploy from a branch"</span>
            </h4>
            <p className="text-xs text-slate-300 mb-2 leading-relaxed">
              Workflow otomatis yang kami buat juga otomatis mengunggah hasil build ke branch khusus bernama <code className="text-amber-300 font-bold">gh-pages</code>.
            </p>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs space-y-1">
              <div>Di GitHub &rarr; <b>Settings</b> &rarr; <b>Pages</b>:</div>
              <div>&bull; <b>Source:</b> Deploy from a branch</div>
              <div>&bull; <b>Branch:</b> Pilih <span className="text-amber-300 font-bold">gh-pages</span> (bukan main) dan folder <span className="text-amber-300 font-bold">/ (root)</span></div>
              <div>&bull; Klik <b>Save</b>.</div>
            </div>
          </div>

          {/* Solution 3: Local build via CLI */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80">
            <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Opsi Manual (Build ke folder docs)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-2">
              Jika ingin build di laptop/komputer lalu push folder <code className="text-white">docs/</code>:
            </p>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400">
              <code>npm run build:docs</code>
              <button 
                onClick={() => copyToClipboard('npm run build:docs', 'docs')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1"
              >
                {copiedStep === 'docs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedStep === 'docs' ? 'Disalin' : 'Salin'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Lalu di GitHub Pages pilih Branch: <b>main</b>, Folder: <b>/docs</b>.
            </p>
          </div>

          {/* What we fixed */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              Apa Saja yang Sudah Diperbaiki & Dilengkapi:
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span><b>vite.config.ts:</b> Ditambahkan <code className="text-cyan-300">base: './'</code> agar path file CSS & JS relatif dan tidak 404 di subfolder repo.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span><b>.github/workflows/deploy.yml:</b> Dibuatkan workflow build & deploy otomatis untuk GitHub Actions dan branch <code className="text-cyan-300">gh-pages</code> (tanpa error lockfile).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span><b>package-lock.json:</b> Disertakan file lock resmi sehingga dependency runner GitHub Actions terjamin sinkron 100%.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span><b>Offline / Static Fallback:</b> Pertanyaan kuis, leaderboard, dan skor tersimpan otomatis di <code className="text-cyan-300">localStorage</code> browser tanpa perlu server Node.js aktif di GitHub Pages.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm active:scale-95 transition-all shadow-md"
          >
            Mengerti, Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
