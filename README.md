# ⚽ PERSIB TRACKER — Real-Time Sports Intelligence Engine

Aplikasi web pelacak seluruh elemen klub **Persib Bandung** secara mendalam berbasis data terverifikasi (anti-rumor), dibungkus dengan visual yang adaptif dan interaktif.

---

## 🌟 1. Arsitektur & Konsep UI/UX Shape-Shifting

Aplikasi mengimplementasikan transisi tema global instan (<500ms):
* **State A (Default - Day-to-Day)**: Pendekatan *Ultra-Minimalist Visual Style* dengan dominasi white space, tipografi clean (Plus Jakarta Sans), mikro-animasi halus, dan keterbacaan data maksimal saat tidak bertanding.
* **State B (Live Match / Pro Mode)**: Saat matchday atau saat pengguna menekan tombol **"PRO LIVE"**, tampilan bertransformasi menjadi *Dark Pro Theme* beraksen **Neon Blue & Glowing Gold**, visualisasi spasial 2D/3D tembakan, formasi dinamis, dan feed data live streaming.

---

## 🚀 2. Fitur-Fitur Utama (Professional Club Standards)

### 🔹 Hub 1: First Team & Academy Deep-Dive (Real-Time Roster)
- **Roster Terverifikasi**: Profil lengkap Tim Senior (BRI Liga 1 & ACL Two), Akademi Pangeran Muda (U-20 EPA), dan Persib Putri (Women Team).
- **Live Fitness & Injury Tracker**: Indikator kondisi fisik (Fit, Latihan Terpisah, Cedera) dengan persentase pemulihan dan estimasi tanggal kembali bertanding dari tim medis dokter tim.
- **Player Detail & Spatial Heatmap**: Modal inspeksi individu dengan visual pergerakan heatmap di lapangan sepak bola, akurasi operan, tekel, dan rating performa.

### 🔹 Hub 2: Advanced Match Center (ACL Two & Liga 1)
- **Scenario Simulator (Kalkulator Interaktif)**: Fitur simulator hasil sisa pertandingan Grup F ACL Two (vs Port FC, Zhejiang FC, Lion City Sailors) yang otomatis menghitung klasemen poin, selisih gol, dan status lolos otomatis ke Babak 16 Besar (Juara Grup / Runner-up).
- **Real-Time Spatial Shot Map & Tactics Pitch**: Peta tembakan interaktif 2D standar Opta/StatBomb dengan kalkulasi xG (Expected Goals), titik tembakan terperinci, alur passing vektor, serta catatan taktik Bojan Hodak.

### 🔹 Hub 3: Corporate & Club Element Transparency
- **Infrastruktur Stadion & Fasilitas**: Monitoring kondisi rumput Stadion GBLA (Gelora Bandung Lautan Api), Stadion Si Jalak Harupat (SJH), dan Lapangan Latihan Sidolig (kapasitas drainase mm/jam, kualitas rumput Zoysia Matrella, kapasitas single seat, lux lampu FIFA).
- **Financial Fair Play (FFP) & Transfer Ledger**: Nilai pasar pemain terverifikasi, sisa durasi kontrak resmi, rasio beban gaji terhadap pendapatan klub (*Wage-to-revenue ratio*).
- **Struktur Manajemen & Staf Kepelatihan**: Direksi PT PBB, Bojan Hodak, tim analis video, dan departemen medis.

---

## 🛠️ 3. Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State & Theme Engine**: React 19 Context (`ClubTrackerContext`) dengan persistensi state dan simulasi streaming WebSocket.
- **Icons**: Lucide React
- **PWA Ready**: Manifest (`manifest.json`) dan Service Worker Caching (`sw.js`) untuk kapabilitas offline-first dan instalasi native Android/iOS.

---

## 💻 4. Cara Menjalankan Project

### Mode Pengembangan (Development)
```bash
corepack pnpm dev
# atau
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### Mode Produksi (Production Build)
```bash
corepack pnpm run build
corepack pnpm run start
```
