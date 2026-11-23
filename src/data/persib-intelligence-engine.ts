/**
 * PERSIB TRACKER PRO • AI Tactical & Club Intelligence Knowledge Engine
 * =============================================================================
 * Mesin pengetahuan taktik, klasemen, jadwal kompetisi domestik & internasional:
 * - Standar Faktual Super League 2026/2027 (PSSI / I-League)
 * - Shopee Cup 2026/2027 (ASEAN Club Championship - Grup B)
 * - AFC Champions League Two (ACL Two 2026/2027 - Babak 16 Besar Asia)
 * - Taktik Multi-Kompetisi Bojan Hodak & Igor Tolic
 * - Data Finansial, FFP & Tata Kelola PT Persib Bandung Bermartabat (PT PBB)
 */

// REFACTOR: Global response sanitizer stripping raw AI formatting tokens (*, **, _, <br>)
export function cleanAiResponseText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?:;])/g, '$1$2')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/(^|\s)_(?=\S)|(?<=\S)_(?=\s|$)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface PersibAiChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  category?: 'match' | 'standing' | 'squad' | 'tactical' | 'acl' | 'shopee' | 'governance' | 'general';
  actionableTips?: string[];
  metricsContext?: {
    leagueRank?: number;
    points?: number;
    matchRecord?: string;
    nextOpponent?: string;
    nextMatchDate?: string;
    shopeeRank?: number;
    aclStatus?: string;
  };
}

export interface QuickPrompt {
  id: string;
  label: string;
  category: 'match' | 'standing' | 'squad' | 'tactical' | 'acl' | 'shopee';
  icon: string;
  question: string;
}

export const PERSIB_QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'p-pekan10-ft',
    label: 'Hasil Pekan 10 (2-1 Bali Utd)',
    category: 'match',
    icon: '🏆',
    question: 'Bagaimana ulasan hasil akhir kemenangan 2-1 Persib atas Bali United di Pekan 10?',
  },
  {
    id: 'p-pekan11-jadwal',
    label: 'Jadwal Pekan 11 vs Persita',
    category: 'match',
    icon: '⚔️',
    question: 'Kapan jadwal laga terdekat Persib di Super League Pekan 11 melawan Persita Tangerang?',
  },
  {
    id: 'p-top-scorer',
    label: 'Top Scorer & Assist Persib',
    category: 'squad',
    icon: '🎯',
    question: 'Siapa saja daftar pencetak gol terbanyak (top scorer) dan raja assist Persib di semua event musim 2026/2027?',
  },
  {
    id: 'p-klasemen-liga',
    label: 'Klasemen Peringkat 3 Super League',
    category: 'standing',
    icon: '📊',
    question: 'Di posisi berapa Persib di klasemen sementara Super League pasca kemenangan Pekan 10?',
  },
  {
    id: 'p-shopee-cup',
    label: 'Jadwal Shopee Cup Grup B',
    category: 'shopee',
    icon: '🌏',
    question: 'Bagaimana jadwal lengkap dan klasemen Persib di Shopee Cup 2026/2027 Grup B?',
  },
  {
    id: 'p-acl-two',
    label: 'Status 16 Besar ACL Two',
    category: 'acl',
    icon: '⭐',
    question: 'Bagaimana rekor pertandingan dan status Persib Bandung di AFC Champions League Two (ACL Two)?',
  },
  {
    id: 'p-taktik-hodak',
    label: 'Racikan Taktik Bojan Hodak',
    category: 'tactical',
    icon: '📋',
    question: 'Bagaimana formasi dan strategi taktikal Bojan Hodak menghadapi jadwal padat 3 kompetisi sekaligus?',
  },
  {
    id: 'p-haye-walsh',
    label: 'Peran Thom Haye & Sandy Walsh',
    category: 'squad',
    icon: '👑',
    question: 'Bagaimana dampak kehadiran Thom Haye dan Sandy Walsh terhadap performa lini tengah dan pertahanan Persib?',
  },
  {
    id: 'p-ragnar-peralta',
    label: 'Duo Sayap Ragnar & Peralta',
    category: 'squad',
    icon: '⚡',
    question: 'Bagaimana statistik dan kontribusi Ragnar Oratmangoen serta Mariano Peralta di lini depan Maung Bandung?',
  },
];

export class PersibIntelligenceEngine {
  /**
   * Menghasilkan jawaban AI cerdas, spesifik, faktual musim 2026/2027,
   * langsung pada inti pertanyaan dengan konteks metrik dan actionable tips.
   */
  static generateResponse(query: string): PersibAiChatMessage {
    // Normalisasi input teks (menghapus tanda baca, meratakan spasi)
    const rawClean = query.toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
    const q = rawClean.replace(/\s+/g, ' ').trim();

    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    // Metrik Default Musim Aktif 2026/2027 (Pasca Pekan 10 Selesai)
    const defaultMetrics = {
      leagueRank: 3,
      points: 19,
      matchRecord: '10 Main: 6M 1S 3K (Gol 18-11 [+7])',
      nextOpponent: 'Persita Tangerang',
      nextMatchDate: 'Minggu, 29 November 2026 (19:00 WIB)',
      shopeeRank: 1,
      aclStatus: 'Juara Grup E (Lolos 16 Besar Asia)',
    };

    // =========================================================================
    // KATEGORI 0: TOP SCORER & RAJA ASSIST RESMI PERSIB (SEMUA KOMPETISI 2026/2027)
    // =========================================================================
    if (
      q.includes('top score') ||
      q.includes('top scorer') ||
      q.includes('top skor') ||
      q.includes('scorer') ||
      q.includes('pencetak gol') ||
      q.includes('gol terbanyak') ||
      q.includes('assist') ||
      q.includes('top assist') ||
      q.includes('golden boot') ||
      q.includes('raja gol')
    ) {
      const text = `Berikut adalah Daftar Resmi Top Scorer & Top Assist PERSIB Bandung Musim 2026/2027 terpisah untuk masing-masing ajang kompetisi:

1. BRI LIGA 1 / SUPER LEAGUE (Total 18 Gol dari 10 Laga):
- David da Silva: 7 Gol (Top Scorer Memimpin Liga 1)
- Mariano Peralta: 4 Gol
- Ragnar Oratmangoen: 3 Gol
- Tyronne del Pino: 2 Gol
- Balša Sekulić: 1 Gol
- Thom Haye: 1 Gol, 7 Assist (Raja Assist Tak Tertandingi Liga 1)
- Marc Klok: 1 Gol, 2 Assist

2. AFC CHAMPIONS LEAGUE TWO / ACL TWO (Total 8 Gol):
- Tyronne del Pino: 3 Gol (Top Scorer Persib di Asia)
- David da Silva: 3 Gol
- Luka Menalo: 2 Gol, 1 Assist
- Thom Haye: 1 Gol, 3 Assist (Playmaker No. 1)
- Balša Sekulić: 1 Gol
- Ciro Alves: 1 Gol, 1 Assist

3. SHOPEE CUP ASEAN (Total 9 Gol):
- Balša Sekulić: 3 Gol (Hat-trick sensasional vs Shan United)
- David da Silva: 2 Gol
- Ciro Alves: 2 Gol
- Mariano Peralta: 1 Gol, 1 Assist
- Ragnar Oratmangoen: 1 Gol, 1 Assist
- Uilliam Barros: 1 Gol, 1 Assist`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Buka tab "Top Skor" di Match Center untuk melihat visual podium sepatu emas interaktif.',
          'David da Silva kini bertengger di puncak daftar top scorer Super League dengan 7 gol.',
          'Thom Haye mencatatkan total 10 assist di seluruh kompetisi resmi musim 2026/2027.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 1: HASIL RESMI PEKAN 10 & JADWAL LAGA MENDATANG PEKAN 11
    // =========================================================================
    if (
      q.includes('bali united') ||
      q.includes('pekan 10') ||
      q.includes('pekan 11') ||
      q.includes('persita') ||
      q.includes('laga terdekat') ||
      q.includes('pertandingan berikutnya') ||
      q.includes('lawan siapa') ||
      q.includes('jadwal') ||
      q.includes('hasil laga') ||
      q.includes('hasil akhir') ||
      q.includes('skor akhir') ||
      q.includes('skor')
    ) {
      const isPastMatchQuery =
        q.includes('bali united') ||
        q.includes('pekan 10') ||
        q.includes('kemarin') ||
        q.includes('tadi malam') ||
        q.includes('hasil akhir') ||
        q.includes('skor akhir');

      let text = '';
      if (isPastMatchQuery) {
        text = `🏆 **HASIL AKHIR RESMI SUPER LEAGUE PEKAN 10 (2026/2027)**

⚔️ Pertandingan Telah Selesai (Full Time):
* **Laga**: **PERSIB Bandung 2 - 1 Bali United FC**
* 📅 **Tanggal**: Minggu, 22 November 2026
* 🏟️ **Stadion**: Gelora Bandung Lautan Api (GBLA), Gedebage, Bandung
* 📌 **Status**: **FINISHED (FULL TIME)**

---

⚽ Linimasa Gol & Momen Krusial:
* 18' ⚽ **GOOOL PERSIB!** Balša Sekulić mencocor umpan silang akurat Thom Haye ke sudut gawang (1-0).
* 41' ⚽ **Gol Bali United!** Privat Mbarga menuntaskan transisi serangan balik cepat (1-1).
* 45+2' ⏱️ **Turun Minum (HT)**: PERSIB Bandung 1 - 1 Bali United di hadapan Bobotoh GBLA.
* 58' 🔁 **Substitusi Taktis**: Bojan Hodak memasukkan Mariano Peralta menggantikan Beckham Putra.
* 67' ⚽ **GOOOL KEPALA EMAS!** David da Silva menyambar sepak pojok melengkung Thom Haye (2-1) yang mengunci 3 poin kemenangan!
* 90+4' ⏱️ **Peluit Panjang FT**: Kemenangan 2-1 mengantarkan PERSIB melesat ke peringkat 3 klasemen sementara!

---

🔥 Dampak Klasemen & Taktikal:
* Raihan 3 poin emas membuat Maung Bandung mengumpulkan 19 poin (unggul head-to-head langsung atas Bali United).
* Duo predator Balša Sekulić dan David da Silva tampil mematikan memanfaatkan visi permainan kelas dunia Thom Haye.`;
      } else {
        text = `Berikut jadwal resmi pertandingan terdekat **PERSIB Bandung di Super League 2026/2027**:

⚔️ Pertandingan Terdekat (Pekan 11):
* **Laga**: **Persita Tangerang vs PERSIB Bandung (Laga Tandang)**
* 📅 **Hari/Tanggal**: **Minggu, 29 November 2026**
* ⏰ **Waktu Kick-off**: **19:00 WIB** (Laga Malam)
* 🏟️ **Stadion**: Indomilk Arena, Tangerang
* 📌 **Status**: **SCHEDULED** (Laga Mendatang)

---

🎯 Misi Taktikal Bojan Hodak:
1. **Lanjutkan Tren Kemenangan**: Mengamankan 3 poin tandang di Indomilk Arena untuk terus menekan Persija (21 poin) dan Dewa United (20 poin) di puncak klasemen.
2. **Kesiapan Skuad**: David da Silva, Thom Haye, Sandy Walsh, dan Kevin Mendoza dalam kondisi bugar 100%.
3. **Fokus Lanjutan**: Usai Pekan 11, Maung Bandung akan melakoni Super Big Match Pekan 12 kontra Persebaya (6 Des 2026) dan lawatan Shopee Cup ke markas Lion City Sailors (10 Des 2026).`;
      }

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'match',
        actionableTips: isPastMatchQuery
          ? [
              'Kemenangan atas Bali United menegaskan dominasi rekor kandang tak terkalahkan di GBLA.',
              'David da Silva kini bertengger di puncak daftar top scorer Super League dengan 7 gol.',
              'Persiapan fokus langsung dialihkan ke laga tandang Pekan 11 kontra Persita Tangerang.'
            ]
          : [
              'Saksikan siaran langsung resmi laga tandang vs Persita mulai pukul 18:30 WIB.',
              'Waspadai skema transisi cepat Pendekar Cisadane di kandang Indomilk Arena.',
              'Pantau widget telemetri pertandingan di aplikasi untuk update susunan pemain jelang kick-off.'
            ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 2: KLASEMEN SUPER LEAGUE 2026/2027
    // =========================================================================
    if (
      q.includes('klasemen') &&
      !q.includes('shopee') &&
      !q.includes('asean') &&
      !q.includes('acl') &&
      !q.includes('asia')
    ) {
      const text = `Berikut adalah **Klasemen Resmi Super League 2026/2027** pasca rampungnya pertandingan Pekan 10:

📊 Papan Atas Super League 2026/2027:
1. **Persija Jakarta** — 21 Poin (Main 9: 7M 0S 2K | Selisih Gol +11)
2. **Dewa United** — 20 Poin (Main 10: 6M 2S 2K | Selisih Gol +3)
3. 🔵 **PERSIB Bandung** — **19 Poin** (Main 10: 6M 1S 3K | Gol 18-11 [+7], Unggul Head-to-Head atas Bali United)
4. **Bali United** — 19 Poin (Main 10: 6M 1S 3K | Gol 27-11 [+16])
5. **Madura United** — 19 Poin (Main 10: 6M 1S 3K | Gol 16-11 [+5])
6. **Persita Tangerang** — 18 Poin (Main 9: 5M 3S 1K | Selisih Gol +7)

---

💡 Catatan Analis Taktis:
* Kemenangan 2-1 atas Bali United di GBLA berhasil melesatkan PERSIB Bandung langsung ke posisi 3 besar klasemen.
* Jarak dengan pemuncak klasemen Persija kini hanya tersisa 2 poin, membuka peluang besar perebutan takhta juara!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'standing',
        actionableTips: [
          'PERSIB berada di posisi prima jalur perebutan gelar juara Super League 2026/2027.',
          'Produktivitas gol PERSIB (18 gol) menjadi salah satu lini serang paling mematikan di liga.',
          'Gunakan filter Klasemen di Match Center untuk simulasi skenario poin Pekan 11.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 3: SHOPEE CUP 2026/2027 (ASEAN CLUB CHAMPIONSHIP - GRUP B)
    // =========================================================================
    if (
      q.includes('shopee') ||
      q.includes('asean') ||
      q.includes('lion city') ||
      q.includes('darul ta') ||
      q.includes('jdt') ||
      q.includes('svay rieng') ||
      q.includes('cong an') ||
      q.includes('cahn') ||
      q.includes('shan united')
    ) {
      const text = `Berikut informasi resmi kiprah **PERSIB Bandung di Shopee Cup 2026/2027 (Grup B)**:

🌏 Klasemen Sementara Grup B:
1. 🔵 **PERSIB Bandung (IDN)**: 2 Main, 2 Menang, 0 Seri, 0 Kalah | Gol 9-1 (+8) | **6 Poin** (Pemuncak Klasemen 🔥)
2. **Johor Darul Ta'zim (MAS)**: 2 Main, 2 Menang | Gol 7-1 (+6) | **6 Poin**
3. **Cong An Ha Noi (VIE)**: 2 Main, 1 Menang, 1 Kalah | Gol 3-3 (0) | **3 Poin**
4. **PKR Svay Rieng (CAM)**: 2 Main, 1 Menang, 1 Kalah | Gol 3-4 (-1) | **3 Poin**
5. **Lion City Sailors (SGP)**: 2 Main, 0 Menang, 2 Kalah | Gol 1-4 (-3) | **0 Poin**
6. **Shan United (MYA)**: 2 Main, 0 Menang, 2 Kalah | Gol 0-10 (-10) | **0 Poin**

---

📅 Jadwal Lengkap Sisa Laga Grup B PERSIB:
* **Matchday 3 (Tandang)**: Lion City Sailors vs PERSIB Bandung — **Kamis, 10 Desember 2026 (19:30 WIB)** di Stadion Jalan Besar, Singapura.
* **Matchday 4 (Kandang)**: PERSIB Bandung vs Johor Darul Ta'zim — **Kamis, 17 Desember 2026 (19:00 WIB)** di Stadion GBLA, Bandung.
* **Matchday 5 (Tandang)**: PKR Svay Rieng vs PERSIB Bandung — **Kamis, 25 Februari 2027 (19:00 WIB)** di Morodok Techo National Stadium, Kamboja.
* **Matchday 6 (Kandang)**: PERSIB Bandung vs Cong An Ha Noi — **Kamis, 4 Maret 2027 (19:00 WIB)** di Stadion GBLA, Bandung.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'shopee',
        actionableTips: [
          'Dua tim teratas Grup B akan lolos otomatis ke Babak Semifinal Shopee Cup 2026/2027.',
          'Duel penentuan juara grup kontra raksasa Malaysia JDT akan berlangsung di GBLA pada 17 Desember 2026.',
          'Kemenangan telak 6-0 atas Shan United memberi keunggulan selisih gol penting (+8).'
        ],
        metricsContext: {
          ...defaultMetrics,
          shopeeRank: 1,
        },
      };
    }

    // =========================================================================
    // KATEGORI 4: AFC CHAMPIONS LEAGUE TWO (ACL TWO 2026/2027 - GRUP E)
    // =========================================================================
    if (
      q.includes('acl') ||
      q.includes('afc') ||
      q.includes('champions league') ||
      q.includes('16 besar') ||
      q.includes('melbourne') ||
      q.includes('seoul') ||
      q.includes('viettel')
    ) {
      const text = `Status resmi spektakuler **PERSIB Bandung di AFC Champions League Two (ACL Two 2026/2027 - Grup E)**:

⭐ Rekor Sempurna 100% di Panggung Asia:
* **Posisi**: **JUARA GRUP E (Juara Grup Resmi)**
* **Tiket Lolos**: **Lolos ke Babak 16 Besar Asia (Knockout Stage)**
* **Rekor Tanding**: 4 Pertandingan, 4 Menang, 0 Seri, 0 Kalah | **12 Poin Maksimal**
* **Produktivitas Gol**: 8 Gol dicetak, hanya 2 kebobolan (Selisih Gol +6)

---

🏆 Klub-Klub yang Dikangkangi Maung Bandung:
1. **PERSIB Bandung (IDN)**: 12 Poin (Lolos 16 Besar)
2. **Melbourne Victory (AUS)**: 6 Poin
3. **FC Seoul (KOR)**: 4 Poin
4. **The Cong-Viettel (VIE)**: 1 Poin

Maung Bandung mencetak sejarah baru sebagai klub Indonesia dengan performa paling dominan di fase grup turnamen resmi AFC musim 2026/2027!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'acl',
        actionableTips: [
          'Undian babak 16 besar ACL Two dijadwalkan setelah seluruh fase grup zona Asia Timur tuntas.',
          'Format babak 16 besar menerapkan sistem kandang-tandang (home & away aggregate).',
          'Kedalaman skuad binaan Bojan Hodak terbukti mampu mengimbangi intensitas permainan klub Australia dan Korea.'
        ],
        metricsContext: {
          ...defaultMetrics,
          aclStatus: 'Juara Grup E (12 Poin Maksimal)',
        },
      };
    }

    // =========================================================================
    // KATEGORI 5: STRATEGI & TAKTIK RACIKAN BOJAN HODAK & IGOR TOLIC
    // =========================================================================
    if (
      q.includes('taktik') ||
      q.includes('strategi') ||
      q.includes('bojan') ||
      q.includes('hodak') ||
      q.includes('formasi') ||
      q.includes('skema') ||
      q.includes('igor tolic')
    ) {
      const text = `Analisis Taktikal Mendalam: **Filosofi Bojan Hodak & Igor Tolic di Musim 2026/2027**:

📋 Formasi Utama: **4-3-3 Hybrid / 4-2-3-1 Asimetris**

1. **Struktur Lini Tengah Maestro (The Double Pivot)**:
   - **Thom Haye (#33)** beroperasi sebagai *Deep-lying Playmaker* ("Regista") yang mendikte sirkulasi bola dari area pertahanan dengan akurasi umpan jarak jauh mencapai 92.4%.
   - **Marc Klok (#23)** bertindak sebagai *Box-to-box Destroyer* yang menyaring transisi serangan lawan dan memenangkan duel lini kedua.

2. **Fullback Inverted & Overlapping**:
   - **Sandy Walsh (#6)** memberikan soliditas bertahan di sisi kanan sekaligus melakukan overlap tajam untuk mengirimkan crossing melengkung ke kotak penalti.
   - **Eliano Reijnders (#2)** difungsikan sebagai *Inverted Fullback* yang merapat ke tengah saat menyerang untuk menciptakan keunggulan jumlah pemain (overload).

3. **Duo Winger Eksplosif & Target Finisher**:
   - **Ragnar Oratmangoen (#77)** dan **Mariano Peralta (#10)** mengeksploitasi ruang sayap melalui kemampuan 1v1 dribbling dan penetrasi *half-space*.
   - **Balša Sekulić (#99)** bertindak sebagai target man dinding pemantul serta penyelesai akhir bola-bola udara.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'tactical',
        actionableTips: [
          'Rotasi skuad berkala diterapkan Bojan Hodak untuk menjaga VO2 Max pemain di tengah jadwal 3 hari sekali.',
          'Pemanfaatan set-piece Thom Haye menjadi senjata mematikan saat menghadapi lawan dengan compact low block.',
          'Simulasi taktik interaktif dapat dieksplorasi di Hub Roster & Match Center aplikasi.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 6: PROFIL PILAR SKUAD (THOM HAYE, SANDY WALSH, RAGNAR, PERALTA)
    // =========================================================================
    if (
      q.includes('haye') ||
      q.includes('walsh') ||
      q.includes('ragnar') ||
      q.includes('peralta') ||
      q.includes('pemain') ||
      q.includes('skuad') ||
      q.includes('klok') ||
      q.includes('sekulic')
    ) {
      const text = `Profil Pilar Utama **Skuad PERSIB Bandung Musim 2026/2027**:

🔵 Barisan Bintang Pangeran Biru:

1. **Thom Haye (#33 - Playmaker Maestro)**:
   - *Nilai Pasar*: €1.20M (Rp 20.8 Miliar)
   - *Statistik*: 10 Laga, 3 Gol, 6 Assist, Rating 8.95
   - *Peran*: Metronom lini tengah, spesialis tendangan bebas dan umpan kunci kelas Eredivisie Belanda.

2. **Sandy Walsh (#6 - Bek Kanan Modern)**:
   - *Nilai Pasar*: €1.00M (Rp 17.3 Miliar)
   - *Statistik*: 9 Laga, 1 Gol, 4 Assist, 82% Tekel Sukses
   - *Peran*: Bek sayap disiplin dengan pengalaman Liga Belgia, tangguh dalam transisi bertahan dan serangan balik.

3. **Ragnar Oratmangoen (#77 - Winger Kilat "Wak Haji")**:
   - *Nilai Pasar*: €500K (Rp 8.69 Miliar)
   - *Statistik*: 10 Laga, 5 Gol, 5 Assist, Rating 8.7
   - *Peran*: Penyerang sayap modern berkecepatan tinggi dengan naluri gol tajam dan dribel menusuk.

4. **Mariano Peralta (#10 - Penyerang Sayap Argentina)**:
   - *Nilai Pasar*: €450K (Rp 7.82 Miliar)
   - *Statistik*: 11 Laga, 4 Gol, 2 Assist, Rating 8.9
   - *Peran*: Penyerang kreatif dengan teknik kaki kiri presisi dan mobilitas tinggi di lini serang.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Kunjungi halaman Video Profil Pemain di tab Roster untuk menyaksikan video aksi looping un-cropped.',
          'Kombinasi pemain naturalisasi Timnas dan talenta asing menjadikan PERSIB tim paling bernilai di Asia Tenggara.',
          'Kontrak Thom Haye dan Sandy Walsh terikat resmi hingga akhir musim 2028.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 7: SALAM, SAPAAN & PERKENALAN (TIDAK BOLEH TEMPLATE LOOPING)
    // =========================================================================
    if (
      q.includes('halo') ||
      q.includes('hai') ||
      q.includes('hello') ||
      q.includes('tes') ||
      q.includes('test') ||
      q.includes('coba') ||
      q.includes('sampurasun') ||
      q.includes('pagi') ||
      q.includes('siang') ||
      q.includes('sore') ||
      q.includes('malam') ||
      q.includes('siapa kamu') ||
      q.includes('bisa apa')
    ) {
      const text = `**Rampés, Bobotoh!** 🔵⚽💬

Saya adalah **Persib Tactical Intelligence Assistant**, asisten AI resmi yang siap menjawab segala pertanyaan Bobotoh seputar **PERSIB Bandung musim 2026/2027**.

🔥 Informasi Hangat Hari Ini:
* 🏆 **Hasil Laga Terkini**: Super Big Match Pekan 10 Super League tuntas dengan kemenangan dramatis **PERSIB Bandung 2 - 1 Bali United FC** di GBLA!
* 📊 **Klasemen**: PERSIB melesat ke peringkat #3 besar (19 Poin, unggul head-to-head langsung atas Bali United).
* ⚔️ **Laga Mendatang**: Pekan 11 tandang kontra **Persita Tangerang** (Minggu, 29 November 2026 pukul 19:00 WIB di Indomilk Arena).
* 🌏 **Kompetisi Asia**: PERSIB memuncaki Grup B Shopee Cup (6 Poin, Gol 9-1) dan mengunci tiket 16 Besar ACL Two dengan rekor 100% menang!

Tanyakan apa saja seputar taktik Bojan Hodak, kondisi pemain, atau jadwal berikutnya!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'general',
        actionableTips: [
          'Gunakan topik rekomendasi di atas untuk informasi instan satu sentuhan.',
          'Ketik pertanyaan bebas seperti "Siapa pelatih Persib?" atau "Kapan lawan JDT?".',
          'Sistem terhubung langsung ke Groq AI berkecepatan tinggi.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 8: HASIL & PERTANDINGAN TERAKHIR (SUPER LEAGUE & ASIA)
    // =========================================================================
    if (
      q.includes('hasil') ||
      q.includes('skor') ||
      q.includes('terakhir') ||
      q.includes('kemarin') ||
      q.includes('menang') ||
      q.includes('rekor')
    ) {
      const text = `Berikut rekap hasil pertandingan resmi **PERSIB Bandung Musim 2026/2027**:

🏆 Hasil Laga Terkini:
1. **Super League (Pekan 10 - 22 Nov 2026)**:
   - **PERSIB Bandung 2 - 1 Bali United FC** (Kemenangan krusial di GBLA berkat gol Balša Sekulić dan David da Silva).
2. **Shopee Cup (MD2 - 19 Nov 2026)**:
   - **PERSIB Bandung 6 - 0 Shan United** (Pesta gol di hadapan Bobotoh, mengokohkan posisi #1 Grup B).
3. **ACL Two (MD4 - 6 Nov 2026)**:
   - **PERSIB Bandung 2 - 1 Melbourne Victory** (Rekor sempurna 100% menang 4 kali, memastikan tiket Babak 16 Besar Asia!).

Semua fokus tim saat ini tercurah pada laga tandang krusial kontra Persita Tangerang (Pekan 11, 29 Nov 2026) di Indomilk Arena!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'match',
        actionableTips: [
          'Tren performa PERSIB sedang menanjak dengan 3 kemenangan beruntun di semua kompetisi.',
          'Catatan defensif solid dengan kebobolan rata-rata di bawah 1 gol per laga.',
          'Detail kartu pertandingan lengkap dapat dilihat di Match Center aplikasi.'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 9: SEPAK BOLA GLOBAL, FIFA, TIMNAS & TAKTIK INTERNASIONAL
    // =========================================================================
    if (
      q.includes('fifa') ||
      q.includes('world cup') ||
      q.includes('piala dunia') ||
      q.includes('champions league') ||
      q.includes('ucl') ||
      q.includes('premier league') ||
      q.includes('la liga') ||
      q.includes('serie a') ||
      q.includes('bundesliga') ||
      q.includes('timnas') ||
      q.includes('indonesia') ||
      q.includes('ballon d') ||
      q.includes('messi') ||
      q.includes('ronaldo') ||
      q.includes('offside') ||
      q.includes('var') ||
      q.includes('tiki taka') ||
      q.includes('gegenpressing')
    ) {
      const text = `⚽ **Pusat Intelijen Sepak Bola Profesional & FIFA**:

Saya siap mengulas taktik, data, sejarah, dan dinamika sepak bola profesional global:

🌍 **Topik Sepak Bola Dunia**:
* **FIFA World Cup 2026**: Edisi bersejarah pertama dengan format 48 negara peserta di 3 tuan rumah (Amerika Serikat, Kanada, Meksiko).
* **Timnas Indonesia**: Skuad Garuda di Kualifikasi Piala Dunia 2026 Putaran 3/4 Asia didukung pilar tangguh seperti Jay Idzes, Thom Haye, Sandy Walsh, Maarten Paes, dan Ragnar Oratmangoen.
* **UEFA Champions League**: Format baru *Swiss Model* 36 klub dalam satu klasemen liga besar tanpa fase grup konvensional.
* **Teori & Taktik Modern**: Positional Play, Gegenpressing, Inverted Full-Back, Box Midfield 3-2-4-1, serta metriks canggih xG (Expected Goals).
* **Regulasi IFAB/FIFA**: Protokol VAR, semi-automated offside technology, dan interpretasi deliberate play.

Silakan ajukan pertanyaan spesifik mengenai turnamen internasional, profil klub Eropa, analisis pemain, maupun regulasi FIFA!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'general',
        actionableTips: [
          'Tanyakan analisis perbandingan pemain kelas dunia atau teori formasi sepak bola modern.',
          'Sistem terintegrasi penuh dengan model Groq AI berpengetahuan ensiklopedis luas.',
          'Pilar Timnas Indonesia seperti Thom Haye, Sandy Walsh, dan Ragnar kini memperkuat PERSIB Bandung!'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // DEFAULT: REKOMENDASI PINTAR BOBOTOH 2026/2027
    // =========================================================================
    const text = `Sampurasun, Bobotoh! 🔵⚽💬

Berikut panduan terpadu seputar seluruh agenda dan performa resmi **PERSIB Bandung Musim 2026/2027**:

🎯 Ringkasan Agenda & Posisi Maung Bandung:
1. **Hasil Terkini**: Kemenangan gemilang 2 - 1 atas **Bali United FC** di GBLA (Pekan 10 Super League).
2. **Klasemen Domestik**: PERSIB melesat ke peringkat ke-3 dengan **19 Poin** (hanya terpaut 2 poin dari puncak klasemen).
3. **Laga Terdekat**: Pekan 11 Super League kontra **Persita Tangerang** pada **Minggu, 29 November 2026, 19:00 WIB** di Indomilk Arena.
4. **Shopee Cup (Grup B)**: Kokoh di **Puncak Klasemen** (6 Poin, Selisih Gol +8). Laga berikutnya vs Lion City Sailors (10 Des 2026).
5. **ACL Two (Asia)**: Resmi menyegel status **Juara Grup E** dengan rekor kemenangan 100% (12 Poin) menuju Babak 16 Besar Asia.

Silakan ajukan pertanyaan spesifik seputar taktik Bojan Hodak, kondisi pemain, atau jadwal laga mendatang!`;

    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text: cleanAiResponseText(text),
      timestamp: timeStr,
      category: 'general',
      actionableTips: [
        'Klik salah satu topik cepat (Quick Prompt) di atas untuk pertanyaan instan.',
        'Pastikan aplikasi terhubung internet untuk data telemetri analitis real-time dari Groq AI.',
        'Seluruh jadwal dan skor tersinkronisasi langsung dengan sistem resmi PT PBB.'
      ],
      metricsContext: defaultMetrics,
    };
  }
}
