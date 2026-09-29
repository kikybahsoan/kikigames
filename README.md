# KIKI: Kompetisi Interaktif Kuis Indonesia 🇮🇩
> **Kuis Interaktif Kamera Inovatif dengan Sensor Gerak Tangan Split-Screen & Solo Mode**  
> Dibuat oleh **kikybahsoan** (kbahsoan@gmail.com)

---

## 🚀 Panduan Deploy ke GitHub Pages (Mengatasi Blank Screen)

Jika website menampilkan **layar putih (blank white)** setelah memilih *"Deploy from a branch"* di GitHub Pages, hal itu terjadi karena:
1. GitHub Pages menyajikan file mentah TypeScript (`.tsx`) yang belum di-compile ke JavaScript (`dist/`).
2. Path aset Vite secara default mencari `/assets/` di root domain, bukan di subfolder repository (`/nama-repo/assets/`).

### ✅ Solusi Paling Mudah (Rekomendasi 1-Klik):
Repository ini sudah dilengkapi file workflow otomatis: `.github/workflows/deploy.yml` dan konfigurasi `base: './'` di `vite.config.ts`.

1. Buka repository Anda di **GitHub**.
2. Klik tab **Settings** (di bagian atas repository).
3. Di menu sidebar sebelah kiri, klik **Pages**.
4. Di bagian **Build and deployment**:
   - Ubah **Source** dari *"Deploy from a branch"* menjadi **"GitHub Actions"**.
5. Lakukan **git push** commit terbaru:
   ```bash
   git add .
   git commit -m "Fix GitHub Pages deployment and base path"
   git push origin main
   ```
6. GitHub Actions otomatis mem-build dan situs Anda akan langsung aktif dengan URL:
   `https://<username>.github.io/<nama-repo>/` 🎉

---

### 🌟 Alternatif: Jika Tetap Ingin Memakai "Deploy from a branch"
Workflow GitHub Actions kami juga otomatis membuat dan mengunggah hasil build ke branch **`gh-pages`**.
1. Di GitHub: **Settings** -> **Pages**.
2. **Source**: Pilih **Deploy from a branch**.
3. **Branch**: Pilih **`gh-pages`** (jangan pilih `main`) dan folder **`/ (root)`**.
4. Klik **Save**.

---

### 💻 Menjalankan di Lokal (Development):
```bash
# 1. Install dependensi
npm install

# 2. Jalankan server lokal (Vite + Express + WebSocket)
npm run dev
```
Akses di browser: `http://localhost:3000`

---

## 🎮 Fitur Unggulan KIKI
- **Deteksi Gerakan Kamera Real-Time**: Gunakan lambaian tangan di depan webcam tanpa mouse atau sentuh layar secara langsung.
- **Mode Permainan Lengkap**:
  - ⭐ **Single Player (Solo)**: Asah refleks dan kecerdasan di seluruh arena layar penuh dengan sistem grade penilaian (Grade S, A, B, C).
  - ⚔️ **Versus 2 Kubu (Split-Screen)**: Duel langsung Kubu Kiri vs Kubu Kanan dengan pemisahan jalur bola vertikal.
  - 🌐 **Online Multiplayer Room**: Sinkronisasi skor dan pertandingan kuis dua arah.
- **Bank Soal Lengkap**: Matematika SD-SMP, IPA/Sains, Pengetahuan Umum & Geografi Indonesia, Sejarah Nasional.
- **Papan Peringkat (Leaderboard)**: Tersinkronisasi online dan memiliki penyimpanan otomatis di `localStorage` saat dimainkan di GitHub Pages (offline/static friendly).
- **Generator Soal AI**: Tambah bank soal cerdas secara instan.
- **Audio & Visual AR**: Efek suara sintetis retro, ledakan partikel kembang api, dan tema antarmuka futuristik.
