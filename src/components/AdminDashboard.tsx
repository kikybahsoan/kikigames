import React, { useState } from 'react';
import { Question } from '../types';
import { 
  Settings, Plus, Trash2, Edit3, RotateCcw, 
  Download, Upload, Search, X, Check, BookOpen, AlertCircle
} from 'lucide-react';

interface Props {
  questions: Question[];
  onAddQuestion: (q: Question) => Promise<void>;
  onUpdateQuestion: (q: Question) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onResetQuestions: () => Promise<void>;
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'math' | 'eng' | 'science' | 'general'>('all');
  const [search, setSearch] = useState('');
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formText, setFormText] = useState('');
  const [formAns, setFormAns] = useState('');
  const [formWrong1, setFormWrong1] = useState('');
  const [formWrong2, setFormWrong2] = useState('');
  const [formWrong3, setFormWrong3] = useState('');
  const [formCategory, setFormCategory] = useState<'math' | 'eng' | 'science' | 'general'>('math');
  const [formLevel, setFormLevel] = useState<number>(4);
  const [formHead, setFormHead] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openAddForm = () => {
    setEditingQ(null);
    setFormText('');
    setFormAns('');
    setFormWrong1('');
    setFormWrong2('');
    setFormWrong3('');
    setFormCategory('math');
    setFormLevel(4);
    setFormHead('MATEMATIKA - KELAS 4');
    setIsAddingNew(true);
  };

  const openEditForm = (q: Question) => {
    setEditingQ(q);
    setFormText(q.text);
    setFormAns(q.ans);
    setFormWrong1(q.wrong[0] || '');
    setFormWrong2(q.wrong[1] || '');
    setFormWrong3(q.wrong[2] || '');
    setFormCategory((q.category as 'math' | 'eng' | 'science' | 'general') || 'math');
    setFormLevel(q.level || 4);
    setFormHead(q.head || '');
    setIsAddingNew(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim() || !formAns.trim() || !formWrong1.trim()) {
      showToast('Harap isi pertanyaan, jawaban benar, dan minimal 1 jawaban salah!');
      return;
    }

    const wrongList = [formWrong1.trim(), formWrong2.trim(), formWrong3.trim()].filter(Boolean);
    if (wrongList.length < 3) {
      showToast('Disarankan melengkapi 3 jawaban salah agar opsi genap 4 pilihan.');
    }

    const qData: Question = {
      id: editingQ ? editingQ.id : 'q_' + Date.now(),
      category: formCategory,
      level: Number(formLevel),
      head: formHead.trim() || `${formCategory.toUpperCase()} - KELAS ${formLevel}`,
      text: formText.trim(),
      ans: formAns.trim(),
      wrong: wrongList,
      difficulty: 'sedang'
    };

    if (editingQ) {
      await onUpdateQuestion(qData);
      showToast('Soal berhasil diperbarui!');
    } else {
      await onAddQuestion(qData);
      showToast('Soal baru berhasil ditambahkan!');
    }
    setIsAddingNew(false);
  };

  const handleDelete = async (id: string, text: string) => {
    if (confirm(`Yakin ingin menghapus soal: "${text}"?`)) {
      await onDeleteQuestion(id);
      showToast('Soal berhasil dihapus.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `bank_soal_kiki_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Bank soal berhasil diekspor ke file JSON!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          for (const item of json) {
            if (item.text && item.ans && Array.isArray(item.wrong)) {
              await onAddQuestion(item);
            }
          }
          showToast(`Berhasil mengimpor ${json.length} soal!`);
        } else {
          showToast('Format JSON tidak valid (harus array objek soal).');
        }
      } catch {
        showToast('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const filteredQuestions = questions.filter(q => {
    const matchCategory = activeTab === 'all' || q.category === activeTab;
    const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || 
                        q.ans.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[90vh] bg-slate-900 border-2 border-indigo-500/40 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-white relative">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Baloo_2'] text-amber-300">
                Dashboard Admin: Manajemen Soal Kuis
              </h2>
              <p className="text-xs text-slate-400">
                Tambah, edit, dan kelola bank soal kuis yang jatuh saat permainan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {[
              { id: 'all', label: 'Semua Soal' },
              { id: 'math', label: 'Matematika' },
              { id: 'eng', label: 'Bahasa Inggris' },
              { id: 'science', label: 'IPA / Sains' },
              { id: 'general', label: 'Pengetahuan Umum' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Soal
            </button>
            <button
              onClick={handleExportJSON}
              title="Ekspor ke JSON"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Impor dari JSON"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={async () => {
                if (confirm('Kembalikan bank soal ke setelan bawaan kurikulum standar?')) {
                  await onResetQuestions();
                  showToast('Bank soal berhasil di-reset ke bawaan.');
                }
              }}
              title="Reset ke Default"
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kata kunci pertanyaan atau jawaban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Total: <b>{filteredQuestions.length}</b> soal
          </span>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <BookOpen className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-semibold">Tidak ada soal yang cocok dengan filter.</p>
              <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci atau klik "Tambah Soal".</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-[10px] tracking-wide uppercase">
                      {q.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-semibold">
                      Kelas {q.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {q.head}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-['Baloo_2']">
                    {q.text}
                  </h4>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ✓ Benar: {q.ans}
                    </span>
                    {q.wrong.map((w, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-700/60 text-slate-300 border border-slate-600/40">
                        ✗ {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => openEditForm(q)}
                    className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 hover:text-amber-200 transition-colors"
                    title="Edit Soal"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id, q.text)}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Toast alert */}
        {toastMsg && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 border border-indigo-400 text-white rounded-xl shadow-xl text-xs font-bold animate-bounce flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            {toastMsg}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isAddingNew && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-bold font-['Baloo_2'] text-amber-300">
                  {editingQ ? 'Edit Soal Kuis' : 'Tambah Soal Kuis Baru'}
                </h3>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="space-y-3.5 mt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as typeof formCategory)}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="math">Matematika</option>
                      <option value="eng">Bahasa Inggris</option>
                      <option value="science">IPA / Sains</option>
                      <option value="general">Pengetahuan Umum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Kelas</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(l => (
                        <option key={l} value={l}>Kelas {l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Teks Pertanyaan</label>
                  <textarea
                    rows={2}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Contoh: Berapakah 15 × 8?"
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">Jawaban Benar (Opsi Valid)</label>
                  <input
                    type="text"
                    value={formAns}
                    onChange={(e) => setFormAns(e.target.value)}
                    placeholder="Contoh: 120"
                    className="w-full p-2 rounded-xl bg-emerald-950/40 border border-emerald-500 text-white focus:outline-none focus:border-emerald-400 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-rose-400 font-bold">Jawaban Salah (Pilihan Pengecoh)</label>
                  <input
                    type="text"
                    value={formWrong1}
                    onChange={(e) => setFormWrong1(e.target.value)}
                    placeholder="Pilihan salah 1 (misal: 110)"
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={formWrong2}
                    onChange={(e) => setFormWrong2(e.target.value)}
                    placeholder="Pilihan salah 2 (misal: 125)"
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    value={formWrong3}
                    onChange={(e) => setFormWrong3(e.target.value)}
                    placeholder="Pilihan salah 3 (misal: 130)"
                    className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold shadow-lg"
                  >
                    Simpan Soal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
