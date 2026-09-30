import React, { useState, useMemo } from 'react';
import { Question } from '../types';
import { 
  GraduationCap, Plus, Trash2, Edit3, RotateCcw, 
  Download, Upload, Search, X, Check, BookOpen, 
  Sparkles, Copy, FileSpreadsheet, FileText, CheckCircle2,
  HelpCircle, Layers, ArrowRight, Zap, RefreshCw
} from 'lucide-react';

interface Props {
  questions: Question[];
  onAddQuestion: (q: Question) => Promise<void>;
  onUpdateQuestion: (q: Question) => Promise<void>;
  onDeleteQuestion: (id: string) => Promise<void>;
  onResetQuestions: () => Promise<void>;
  onClose: () => void;
}

const PRESET_CATEGORIES = [
  { id: 'all', label: 'Semua Soal' },
  { id: 'math', label: 'Matematika' },
  { id: 'science', label: 'IPA / Sains' },
  { id: 'eng', label: 'Bahasa Inggris' },
  { id: 'indo', label: 'Bahasa Indonesia' },
  { id: 'ips', label: 'IPS & Sejarah' },
  { id: 'general', label: 'Pengetahuan Umum' },
  { id: 'custom', label: 'Soal Buatan Guru' }
];

export const AdminDashboard: React.FC<Props> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onResetQuestions,
  onClose
}) => {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Form states
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);

  // Single Question Form State
  const [formCategory, setFormCategory] = useState<string>('math');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const [formLevel, setFormLevel] = useState<number>(4);
  const [formHead, setFormHead] = useState<string>('');
  const [formText, setFormText] = useState<string>('');
  const [formAns, setFormAns] = useState<string>('');
  const [formWrong1, setFormWrong1] = useState<string>('');
  const [formWrong2, setFormWrong2] = useState<string>('');
  const [formWrong3, setFormWrong3] = useState<string>('');
  const [formDifficulty, setFormDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');

  // Bulk Quick Add State
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkCategory, setBulkCategory] = useState<string>('math');
  const [bulkLevel, setBulkLevel] = useState<number>(4);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Open clean add modal
  const openAddForm = () => {
    setEditingQ(null);
    setFormText('');
    setFormAns('');
    setFormWrong1('');
    setFormWrong2('');
    setFormWrong3('');
    setFormCategory('math');
    setCustomCategoryName('');
    setFormLevel(4);
    setFormHead('MATEMATIKA - KELAS 4');
    setFormDifficulty('sedang');
    setIsAddingNew(true);
    setBulkMode(false);
  };

  // Open edit modal
  const openEditForm = (q: Question) => {
    setEditingQ(q);
    setFormText(q.text);
    setFormAns(q.ans);
    setFormWrong1(q.wrong[0] || '');
    setFormWrong2(q.wrong[1] || '');
    setFormWrong3(q.wrong[2] || '');
    
    // Check if category is standard or custom
    const isStandard = ['math', 'science', 'eng', 'indo', 'ips', 'general'].includes(q.category);
    if (isStandard) {
      setFormCategory(q.category);
      setCustomCategoryName('');
    } else {
      setFormCategory('custom');
      setCustomCategoryName(q.category);
    }
    
    setFormLevel(q.level || 4);
    setFormHead(q.head || '');
    setFormDifficulty(q.difficulty || 'sedang');
    setIsAddingNew(true);
    setBulkMode(false);
  };

  // Duplicate an existing question to speed up variation creation
  const handleDuplicate = (q: Question) => {
    setEditingQ(null);
    setFormText(q.text + ' (Variasi)');
    setFormAns(q.ans);
    setFormWrong1(q.wrong[0] || '');
    setFormWrong2(q.wrong[1] || '');
    setFormWrong3(q.wrong[2] || '');
    setFormCategory(q.category);
    setFormLevel(q.level);
    setFormHead(q.head);
    setFormDifficulty(q.difficulty || 'sedang');
    setIsAddingNew(true);
    setBulkMode(false);
    showToast('Soal disalin ke formulir. Silakan sesuaikan lalu simpan!');
  };

  // Magic Distractor Generator: Helper to generate plausible wrong answers
  const handleGenerateDistractors = () => {
    if (!formAns.trim()) {
      showToast('Ketik Jawaban Benar terlebih dahulu agar sistem bisa membuat pengecoh!', 'info');
      return;
    }

    const trimmedAns = formAns.trim();
    const num = parseFloat(trimmedAns);

    if (!isNaN(num) && Number.isFinite(num)) {
      // It's a numerical answer
      let diff1 = 1;
      let diff2 = 2;
      let diff3 = -1;

      if (Math.abs(num) >= 100) {
        diff1 = 10;
        diff2 = -10;
        diff3 = 20;
      } else if (Math.abs(num) >= 20) {
        diff1 = 2;
        diff2 = -2;
        diff3 = 4;
      }

      const w1 = String(num + diff1);
      const w2 = String(num - diff1);
      const w3 = String(num + (diff2 !== diff1 ? diff2 : 5));

      setFormWrong1(w1);
      setFormWrong2(w2);
      setFormWrong3(w3);
      showToast('✨ Pilihan jawaban salah angka otomatis dibuat!');
    } else {
      // It's text
      const sampleDistractors = [
        trimmedAns + ' Salah',
        'Bukan ' + trimmedAns,
        trimmedAns + ' Sebagian'
      ];
      setFormWrong1(sampleDistractors[0]);
      setFormWrong2(sampleDistractors[1]);
      setFormWrong3(sampleDistractors[2]);
      showToast('✨ Pilihan pengecoh teks dibuat. Anda bisa menyempurnakannya!');
    }
  };

  // Save single question
  const handleSaveQuestion = async (keepOpen = false) => {
    if (!formText.trim()) {
      showToast('Pertanyaan tidak boleh kosong!', 'error');
      return;
    }
    if (!formAns.trim()) {
      showToast('Jawaban Benar tidak boleh kosong!', 'error');
      return;
    }

    // Determine category
    const actualCategory = formCategory === 'custom' 
      ? (customCategoryName.trim().toLowerCase() || 'custom') 
      : formCategory;

    // Collect distractors
    let wrongList = [formWrong1.trim(), formWrong2.trim(), formWrong3.trim()].filter(Boolean);
    
    // Auto fill if teacher only provided 1 or 2 wrong answers
    if (wrongList.length === 0) {
      wrongList = ['Pilihan Lain A', 'Pilihan Lain B', 'Pilihan Lain C'];
    } else if (wrongList.length === 1) {
      wrongList.push(wrongList[0] + ' 2', wrongList[0] + ' 3');
    } else if (wrongList.length === 2) {
      wrongList.push('Opsi Lain');
    }

    const categoryTitle = actualCategory.toUpperCase();
    const headText = formHead.trim() || `${categoryTitle} - KELAS ${formLevel}`;

    const qData: Question = {
      id: editingQ ? editingQ.id : 'guru_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      category: actualCategory,
      level: Number(formLevel),
      head: headText,
      text: formText.trim(),
      ans: formAns.trim(),
      wrong: wrongList,
      difficulty: formDifficulty,
      createdAt: new Date().toISOString()
    };

    if (editingQ) {
      await onUpdateQuestion(qData);
      showToast('✅ Soal berhasil diperbarui!');
    } else {
      await onAddQuestion(qData);
      showToast('🎉 Soal baru berhasil disimpan ke bank soal!');
    }

    if (keepOpen) {
      // Reset text inputs for rapid subsequent entry
      setFormText('');
      setFormAns('');
      setFormWrong1('');
      setFormWrong2('');
      setFormWrong3('');
    } else {
      setIsAddingNew(false);
      setEditingQ(null);
    }
  };

  // Bulk Quick Add Parser
  const handleProcessBulk = async () => {
    if (!bulkText.trim()) {
      showToast('Harap tempel (paste) baris soal terlebih dahulu!', 'error');
      return;
    }

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    let addedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Format 1: Soal | Jawaban Benar | Salah 1 | Salah 2 | Salah 3
      // Format 2: Soal ; Jawaban Benar ; Salah 1 ; Salah 2 ; Salah 3
      const separator = line.includes('|') ? '|' : (line.includes(';') ? ';' : ',');
      const parts = line.split(separator).map(p => p.trim());

      if (parts.length >= 2) {
        const text = parts[0].replace(/^\d+[\.\)\-]\s*/, ''); // strip leading numbering like "1. "
        const ans = parts[1];
        let wrong = parts.slice(2).filter(Boolean);

        if (wrong.length === 0) {
          // generate fallback
          const n = parseFloat(ans);
          if (!isNaN(n)) {
            wrong = [String(n + 1), String(n - 1), String(n + 2)];
          } else {
            wrong = ['Pilihan A', 'Pilihan B', 'Pilihan C'];
          }
        } else if (wrong.length < 3) {
          while (wrong.length < 3) {
            wrong.push('Opsi Pengecoh ' + (wrong.length + 1));
          }
        }

        const newQ: Question = {
          id: 'bulk_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 4),
          category: bulkCategory,
          level: Number(bulkLevel),
          head: `${bulkCategory.toUpperCase()} - KELAS ${bulkLevel}`,
          text,
          ans,
          wrong: wrong.slice(0, 3),
          difficulty: 'sedang'
        };

        await onAddQuestion(newQ);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      showToast(`🎉 Berhasil memproses dan menyimpan ${addedCount} soal sekaligus!`);
      setBulkText('');
      setBulkMode(false);
    } else {
      showToast('Format baris tidak terbaca. Pisahkan dengan tanda pipa (|) atau koma.', 'error');
    }
  };

  // Export to CSV for Excel
  const handleExportCSV = () => {
    const headers = ['ID', 'Kategori', 'Tingkat Kelas', 'Pertanyaan', 'Jawaban Benar', 'Pilihan Salah 1', 'Pilihan Salah 2', 'Pilihan Salah 3'];
    const rows = questions.map(q => [
      q.id,
      q.category,
      q.level,
      `"${q.text.replace(/"/g, '""')}"`,
      `"${q.ans.replace(/"/g, '""')}"`,
      `"${(q.wrong[0] || '').replace(/"/g, '""')}"`,
      `"${(q.wrong[1] || '').replace(/"/g, '""')}"`,
      `"${(q.wrong[2] || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bank_soal_kiki_guru_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Berhasil mengekspor bank soal ke file Excel (CSV)!');
  };

  // Download Example CSV Template
  const handleDownloadTemplate = () => {
    const templateRows = [
      'Pertanyaan,Jawaban Benar,Pilihan Salah 1,Pilihan Salah 2,Pilihan Salah 3,Kategori,Tingkat Kelas',
      '"Berapakah 25 + 75?","100","90","110","105","math","4"',
      '"Apa ibukota negara Indonesia?","IKN Nusantara","Jakarta","Surabaya","Bandung","general","5"',
      '"Planet manakah yang dijuluki Planet Merah?","Mars","Venus","Jupiter","Saturnus","science","4"'
    ];
    const csvContent = '\uFEFF' + templateRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_input_soal_kiki.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📄 Template CSV siap diisi di Excel berhasil diunduh!');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `bank_soal_kiki_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('📥 Berhasil mengekspor bank soal ke file JSON!');
  };

  // Import JSON / CSV
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;

        if (isCSV) {
          // Parse CSV
          const lines = text.split(/\r\n|\n/).filter(Boolean);
          if (lines.length <= 1) {
            showToast('File CSV kosong atau tidak memiliki baris data.', 'error');
            return;
          }

          let importedCount = 0;
          // Skip header row
          for (let i = 1; i < lines.length; i++) {
            // Regex for CSV parsing handling quotes
            const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
            if (row.length >= 2 && row[0]) {
              const qText = row[0];
              const qAns = row[1];
              const w1 = row[2] || 'Pilihan Salah 1';
              const w2 = row[3] || 'Pilihan Salah 2';
              const w3 = row[4] || 'Pilihan Salah 3';
              const cat = row[5] || 'general';
              const lvl = parseInt(row[6], 10) || 4;

              await onAddQuestion({
                id: 'csv_' + Date.now() + '_' + i,
                category: cat,
                level: lvl,
                head: `${cat.toUpperCase()} - KELAS ${lvl}`,
                text: qText,
                ans: qAns,
                wrong: [w1, w2, w3],
                difficulty: 'sedang'
              });
              importedCount++;
            }
          }
          showToast(`🎉 Berhasil mengimpor ${importedCount} soal dari file CSV Excel!`);
        } else {
          // Parse JSON
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            let importedCount = 0;
            for (const item of json) {
              if (item.text && item.ans && Array.isArray(item.wrong)) {
                await onAddQuestion({
                  ...item,
                  id: item.id || 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
                });
                importedCount++;
              }
            }
            showToast(`🎉 Berhasil mengimpor ${importedCount} soal dari JSON!`);
          } else {
            showToast('Format JSON tidak sesuai.', 'error');
          }
        }
      } catch (err) {
        showToast('Gagal memproses file. Pastikan format sesuai.', 'error');
      }
    };

    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Distinct category list dynamically computed from questions
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('all');
    cats.add('math');
    cats.add('science');
    cats.add('eng');
    cats.add('general');
    questions.forEach(q => {
      if (q.category) cats.add(q.category);
    });
    return Array.from(cats);
  }, [questions]);

  // Filtered Question list
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchCategory = activeTab === 'all' || q.category === activeTab;
      const matchSearch = q.text.toLowerCase().includes(search.toLowerCase()) || 
                          q.ans.toLowerCase().includes(search.toLowerCase()) ||
                          (q.head && q.head.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [questions, activeTab, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[92vh] bg-slate-900 border-2 border-indigo-500/50 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-white relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-['Baloo_2'] text-amber-300">
                  Ruang Guru: Buat & Kelola Soal Kuis
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  Tersimpan Otomatis
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Buat soal kuis buatan sendiri untuk dimainkan siswa dengan sensor kamera atau sentuhan
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Ruang Guru"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openAddForm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Buat 1 Soal Baru
            </button>

            <button
              onClick={() => {
                setBulkMode(true);
                setIsAddingNew(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs border border-indigo-400/40 shadow-sm active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4 text-cyan-300" /> Tempel Massal (Banyak Soal)
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Excel / CSV Tools */}
            <button
              onClick={handleExportCSV}
              title="Unduh semua soal ke file Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Ekspor Excel
            </button>

            <label
              title="Unggah file soal Excel (.csv) atau JSON"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" /> Impor Excel / JSON
              <input type="file" accept=".csv,.json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              onClick={handleDownloadTemplate}
              title="Unduh template format Excel untuk diisi guru"
              className="px-2.5 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
            >
              Template Excel
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={async () => {
              if (confirm('Kembalikan bank soal ke soal standar bawaan aplikasi? Soal kustom akan di-reset.')) {
                await onResetQuestions();
                showToast('Bank soal berhasil dikembalikan ke standar bawaan.');
              }
            }}
            title="Reset ke Soal Standar Bawaan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>
        </div>

        {/* Categories Bar & Search */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          {/* Dynamic Subject Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
            {availableCategories.map(cat => {
              const label = PRESET_CATEGORIES.find(c => c.id === cat)?.label || cat.toUpperCase();
              const count = cat === 'all' 
                ? questions.length 
                : questions.filter(q => q.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === cat
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 font-semibold'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === cat ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan / jawaban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Questions Grid / List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <BookOpen className="w-12 h-12 mb-3 opacity-30 text-amber-400" />
              <p className="text-base font-bold text-slate-200">Belum ada soal pada kategori ini</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                Klik tombol <b className="text-emerald-400">"Buat 1 Soal Baru"</b> di atas untuk mulai membuat soal latihan siswa.
              </p>
              <button
                onClick={openAddForm}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg"
              >
                + Tambah Soal Pertama
              </button>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                {/* Number & Question Details */}
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-xl bg-slate-700/70 text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] tracking-wide uppercase border border-indigo-500/30">
                        {q.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-700 text-amber-300 text-[10px] font-bold">
                        Kelas {q.level}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {q.head}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white font-['Baloo_2'] leading-snug">
                      {q.text}
                    </h4>

                    {/* Answer choices visualization */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {/* Correct answer */}
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Kunci: <b>{q.ans}</b></span>
                      </span>

                      {/* Wrong choices */}
                      {q.wrong.map((w, wIdx) => (
                        <span key={wIdx} className="px-2.5 py-1 rounded-xl bg-slate-900/60 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1">
                          <span className="text-rose-400 font-bold">✕</span> {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-2 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Duplikat Soal (Buat Variasi)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditForm(q)}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-colors"
                    title="Edit Soal Ini"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm(`Yakin ingin menghapus soal: "${q.text}"?`)) {
                        await onDeleteQuestion(q.id);
                        showToast('Soal berhasil dihapus.');
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Total Bank Soal: <b className="text-amber-300">{questions.length}</b> soal</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan aman di memori & browser
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
          >
            Selesai & Tutup
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl shadow-2xl text-xs font-bold animate-in slide-in-from-bottom duration-300 z-70 flex items-center gap-2.5 border ${
            toastMsg.type === 'error'
              ? 'bg-rose-900 border-rose-500 text-rose-100'
              : toastMsg.type === 'info'
              ? 'bg-sky-900 border-sky-400 text-sky-100'
              : 'bg-emerald-900 border-emerald-400 text-emerald-100'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Modal: Single Question Add / Edit Form */}
        {isAddingNew && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
              
              {/* Form Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-['Baloo_2'] text-amber-300">
                      {editingQ ? 'Edit Soal Kuis' : 'Buat Soal Kuis Baru (Khusus Guru)'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Masukkan teks soal, jawaban yang benar, dan pilihan salah yang akan jatuh
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="overflow-y-auto space-y-4 py-4 pr-1 text-xs">
                
                {/* Category & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mata Pelajaran</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="math">Matematika</option>
                      <option value="science">IPA / Sains</option>
                      <option value="indo">Bahasa Indonesia</option>
                      <option value="eng">Bahasa Inggris</option>
                      <option value="ips">IPS / Sejarah</option>
                      <option value="general">Pengetahuan Umum</option>
                      <option value="custom">✏️ Kategori Kustom Baru...</option>
                    </select>
                  </div>

                  {formCategory === 'custom' && (
                    <div>
                      <label className="block text-cyan-300 font-bold mb-1">Nama Kategori Baru</label>
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="Misal: Biologi, Geografi"
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-cyan-500 text-white font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tingkat Kelas</label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      {[1, 2, 3, 4, 5, 6].map(l => (
                        <option key={l} value={l}>Kelas {l} SD</option>
                      ))}
                      {[7, 8, 9].map(l => (
                        <option key={l} value={l}>Kelas {l} SMP</option>
                      ))}
                      {[10, 11, 12].map(l => (
                        <option key={l} value={l}>Kelas {l} SMA</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tingkat Kesulitan</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as 'mudah' | 'sedang' | 'sulit')}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-amber-400"
                    >
                      <option value="mudah">Mudah</option>
                      <option value="sedang">Sedang</option>
                      <option value="sulit">Menantang / Sulit</option>
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-amber-300 font-bold mb-1">
                    Teks Pertanyaan Kuis <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Contoh: Berapakah hasil dari 25 × 4?"
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
                  />
                </div>

                {/* Correct Answer */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-emerald-400 font-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Jawaban Benar (Kunci Jawaban Tepat) <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-emerald-400/80">Bola yang harus disentuh murid</span>
                  </div>
                  <input
                    type="text"
                    value={formAns}
                    onChange={(e) => setFormAns(e.target.value)}
                    placeholder="Contoh: 100"
                    className="w-full p-2.5 rounded-xl bg-emerald-950/40 border-2 border-emerald-500 text-emerald-100 font-bold text-sm focus:outline-none focus:border-emerald-400 shadow-sm"
                  />
                </div>

                {/* Distractors (Wrong Answers) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                        <span>Pilihan Jawaban Salah (Pengecoh)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Bola salah yang akan mengurangi poin jika murid menyentuhnya
                      </p>
                    </div>

                    {/* Auto Generate Button */}
                    <button
                      type="button"
                      onClick={handleGenerateDistractors}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-cyan-200 text-xs font-bold flex items-center gap-1.5 border border-indigo-400/30 transition-all active:scale-95 shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" /> Otomatis Buat Pengecoh
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <input
                        type="text"
                        value={formWrong1}
                        onChange={(e) => setFormWrong1(e.target.value)}
                        placeholder="Pengecoh 1 (misal: 90)"
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-400 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formWrong2}
                        onChange={(e) => setFormWrong2(e.target.value)}
                        placeholder="Pengecoh 2 (misal: 110)"
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-400 text-xs"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formWrong3}
                        onChange={(e) => setFormWrong3(e.target.value)}
                        placeholder="Pengecoh 3 (misal: 105)"
                        className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-rose-400 text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2">
                  {!editingQ && (
                    <button
                      type="button"
                      onClick={() => handleSaveQuestion(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                    >
                      Simpan & Tambah Soal Lain ⏩
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveQuestion(false)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                  >
                    Simpan Soal ✓
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal: Bulk Quick Add */}
        {bulkMode && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-slate-900 border-2 border-indigo-500 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] flex flex-col">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-cyan-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-['Baloo_2'] text-cyan-300">
                      Tempel Massal: Tambah Banyak Soal Sekaligus
                    </h3>
                    <p className="text-xs text-slate-400">
                      Salin daftar soal dari dokumen Word / WhatsApp lalu tempel di sini
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBulkMode(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Mata Pelajaran</label>
                    <select
                      value={bulkCategory}
                      onChange={(e) => setBulkCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold"
                    >
                      <option value="math">Matematika</option>
                      <option value="science">IPA / Sains</option>
                      <option value="indo">Bahasa Indonesia</option>
                      <option value="eng">Bahasa Inggris</option>
                      <option value="ips">IPS / Sejarah</option>
                      <option value="general">Pengetahuan Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Tingkat Kelas</label>
                    <select
                      value={bulkLevel}
                      onChange={(e) => setBulkLevel(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(l => (
                        <option key={l} value={l}>Kelas {l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-bold text-amber-300">Format Setiap Baris (Pisahkan dengan tanda pipa |):</div>
                  <div className="font-mono text-cyan-300">Pertanyaan | Jawaban Benar | Pengecoh 1 | Pengecoh 2 | Pengecoh 3</div>
                  <div className="text-slate-400">Contoh:</div>
                  <div className="font-mono text-slate-300">Berapakah 12 x 12? | 144 | 124 | 134 | 154</div>
                  <div className="font-mono text-slate-300">Ibukota Indonesia | IKN Nusantara | Jakarta | Bandung | Surabaya</div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Tempel Baris Soal Anda di Sini:
                  </label>
                  <textarea
                    rows={8}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder={`Berapakah 25 + 75? | 100 | 90 | 110 | 105\nSiapakah penemu bola lampu? | Thomas Edison | Albert Einstein | Isaac Newton | Nikola Tesla`}
                    className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-white border border-slate-700 focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setBulkMode(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleProcessBulk}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg active:scale-95 transition-all"
                >
                  Proses & Simpan Semua Soal 🚀
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
