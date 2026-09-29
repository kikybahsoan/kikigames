import { Question } from '../types';

export const DEFAULT_QUESTIONS: Question[] = [
  // Matematika SD
  {
    id: 'm1',
    category: 'math',
    level: 1,
    head: 'MATEMATIKA - KELAS 1',
    text: 'Berapakah 7 + 5?',
    ans: '12',
    wrong: ['11', '13', '14'],
    difficulty: 'mudah'
  },
  {
    id: 'm2',
    category: 'math',
    level: 2,
    head: 'MATEMATIKA - KELAS 2',
    text: 'Berapakah 18 − 9?',
    ans: '9',
    wrong: ['8', '7', '10'],
    difficulty: 'mudah'
  },
  {
    id: 'm3',
    category: 'math',
    level: 3,
    head: 'MATEMATIKA - KELAS 3',
    text: 'Berapakah 6 × 7?',
    ans: '42',
    wrong: ['36', '48', '40'],
    difficulty: 'sedang'
  },
  {
    id: 'm4',
    category: 'math',
    level: 4,
    head: 'MATEMATIKA - KELAS 4',
    text: 'Berapakah 72 ÷ 8?',
    ans: '9',
    wrong: ['7', '8', '6'],
    difficulty: 'sedang'
  },
  {
    id: 'm5',
    category: 'math',
    level: 5,
    head: 'MATEMATIKA - KELAS 5',
    text: 'Berapakah 12 × 12?',
    ans: '144',
    wrong: ['124', '134', '154'],
    difficulty: 'sedang'
  },
  {
    id: 'm6',
    category: 'math',
    level: 6,
    head: 'MATEMATIKA - KELAS 6',
    text: 'Berapakah 25% dari 200?',
    ans: '50',
    wrong: ['25', '40', '60'],
    difficulty: 'sedang'
  },
  // Matematika SMP & SMA
  {
    id: 'm7',
    category: 'math',
    level: 7,
    head: 'MATEMATIKA - KELAS 7',
    text: '(-8) × 6 = ?',
    ans: '-48',
    wrong: ['48', '-42', '-54'],
    difficulty: 'sedang'
  },
  {
    id: 'm8',
    category: 'math',
    level: 8,
    head: 'MATEMATIKA - KELAS 8',
    text: 'Akar kuadrat dari 169 (√169) = ?',
    ans: '13',
    wrong: ['12', '14', '17'],
    difficulty: 'sedang'
  },
  {
    id: 'm9',
    category: 'math',
    level: 9,
    head: 'MATEMATIKA - KELAS 9',
    text: 'Jika 3x + 6 = 21, maka nilai x adalah?',
    ans: '5',
    wrong: ['4', '6', '7'],
    difficulty: 'sedang'
  },
  {
    id: 'm10',
    category: 'math',
    level: 10,
    head: 'MATEMATIKA - KELAS 10',
    text: 'x² − 7x + 12 = 0. Berapa nilai x terbesar?',
    ans: '4',
    wrong: ['3', '-4', '6'],
    difficulty: 'sulit'
  },
  {
    id: 'm11',
    category: 'math',
    level: 11,
    head: 'MATEMATIKA - KELAS 11',
    text: 'Turunan dari f(x) = 3x² + 5x pada x = 2?',
    ans: '17',
    wrong: ['11', '16', '19'],
    difficulty: 'sulit'
  },
  {
    id: 'm12',
    category: 'math',
    level: 12,
    head: 'MATEMATIKA - KELAS 12',
    text: 'Berapakah nilai dari ²log 32?',
    ans: '5',
    wrong: ['4', '6', '8'],
    difficulty: 'sulit'
  },

  // Bahasa Inggris
  {
    id: 'e1',
    category: 'eng',
    level: 4,
    head: 'BAHASA INGGRIS - KELAS 4',
    text: 'Apa arti kata "Kucing" dalam Bahasa Inggris?',
    ans: 'Cat',
    wrong: ['Dog', 'Rabbit', 'Bird'],
    difficulty: 'mudah'
  },
  {
    id: 'e2',
    category: 'eng',
    level: 4,
    head: 'BAHASA INGGRIS - KELAS 4',
    text: 'Lawan kata dari "BIG" adalah?',
    ans: 'Small',
    wrong: ['Huge', 'Tall', 'Fast'],
    difficulty: 'mudah'
  },
  {
    id: 'e3',
    category: 'eng',
    level: 6,
    head: 'BAHASA INGGRIS - KELAS 6',
    text: 'Apa bahasa Inggris dari "Perpustakaan"?',
    ans: 'Library',
    wrong: ['Laboratory', 'Bookstore', 'Classroom'],
    difficulty: 'sedang'
  },
  {
    id: 'e4',
    category: 'eng',
    level: 8,
    head: 'BAHASA INGGRIS - KELAS 8',
    text: 'Past tense (V2) dari kata "GO" adalah?',
    ans: 'Went',
    wrong: ['Gone', 'Goes', 'Going'],
    difficulty: 'sedang'
  },
  {
    id: 'e5',
    category: 'eng',
    level: 10,
    head: 'BAHASA INGGRIS - KELAS 10',
    text: 'Sinonim dari kata "ENORMOUS" adalah?',
    ans: 'Huge',
    wrong: ['Tiny', 'Fragile', 'Ancient'],
    difficulty: 'sulit'
  },
  {
    id: 'e6',
    category: 'eng',
    level: 11,
    head: 'BAHASA INGGRIS - KELAS 11',
    text: 'Kata yang berarti "Keberanian" dalam Bahasa Inggris?',
    ans: 'Courage',
    wrong: ['Curiosity', 'Cowardice', 'Caution'],
    difficulty: 'sulit'
  },

  // Sains / IPA
  {
    id: 's1',
    category: 'science',
    level: 4,
    head: 'IPA - KELAS 4',
    text: 'Planet terdekat dari Matahari dalam tata surya adalah?',
    ans: 'Merkurius',
    wrong: ['Venus', 'Mars', 'Bumi'],
    difficulty: 'mudah'
  },
  {
    id: 's2',
    category: 'science',
    level: 4,
    head: 'IPA - KELAS 4',
    text: 'Gas yang dihirup manusia saat bernapas adalah?',
    ans: 'Oksigen',
    wrong: ['Karbon dioksida', 'Nitrogen', 'Hidrogen'],
    difficulty: 'mudah'
  },
  {
    id: 's3',
    category: 'science',
    level: 5,
    head: 'IPA - KELAS 5',
    text: 'Proses tumbuhan hijau memasak makanan sendiri disebut?',
    ans: 'Fotosintesis',
    wrong: ['Respirasi', 'Transpirasi', 'Evaporasi'],
    difficulty: 'sedang'
  },
  {
    id: 's4',
    category: 'science',
    level: 6,
    head: 'IPA - KELAS 6',
    text: 'Hewan pemakan daging disebut kelompok?',
    ans: 'Karnivora',
    wrong: ['Herbivora', 'Omnivora', 'Insektivora'],
    difficulty: 'mudah'
  },
  {
    id: 's5',
    category: 'science',
    level: 8,
    head: 'IPA FISIKA - KELAS 8',
    text: 'Alat untuk mengukur kuat arus listrik adalah?',
    ans: 'Amperemeter',
    wrong: ['Voltmeter', 'Termometer', 'Barometer'],
    difficulty: 'sedang'
  },
  {
    id: 's6',
    category: 'science',
    level: 9,
    head: 'IPA BIOLOGI - KELAS 9',
    text: 'Organ pemompa darah ke seluruh tubuh pada manusia adalah?',
    ans: 'Jantung',
    wrong: ['Paru-paru', 'Hati', 'Ginjal'],
    difficulty: 'mudah'
  },

  // Pengetahuan Umum
  {
    id: 'g1',
    category: 'general',
    level: 5,
    head: 'PENGETAHUAN UMUM',
    text: 'Ibu Kota Negara Indonesia yang baru di Kalimantan adalah?',
    ans: 'Nusantara',
    wrong: ['Balikpapan', 'Samarinda', 'Pontianak'],
    difficulty: 'mudah'
  },
  {
    id: 'g2',
    category: 'general',
    level: 5,
    head: 'PENGETAHUAN UMUM',
    text: 'Hari Kemerdekaan Republik Indonesia diperingati setiap tanggal?',
    ans: '17 Agustus',
    wrong: ['1 Juni', '28 Oktober', '10 November'],
    difficulty: 'mudah'
  },
  {
    id: 'g3',
    category: 'general',
    level: 7,
    head: 'PENGETAHUAN UMUM',
    text: 'Candi Buddha terbesar di dunia yang terletak di Magelang adalah?',
    ans: 'Borobudur',
    wrong: ['Prambanan', 'Mendut', 'Muara Takus'],
    difficulty: 'sedang'
  },
  {
    id: 'g4',
    category: 'general',
    level: 8,
    head: 'PENGETAHUAN UMUM',
    text: 'Benua terbesar di dunia berdasarkan luas daratan adalah?',
    ans: 'Asia',
    wrong: ['Afrika', 'Amerika', 'Eropa'],
    difficulty: 'sedang'
  }
];
