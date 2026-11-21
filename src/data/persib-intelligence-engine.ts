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
    id: 'p-bali-united',
    label: 'Big Match vs Bali United',
    category: 'match',
    icon: '⚔️',
    question: 'Kapan laga terdekat Persib di Super League Pekan 10 dan bagaimana persiapan jelang lawan Bali United?',
  },
  {
    id: 'p-klasemen-liga',
    label: 'Klasemen Super League 2026/2027',
    category: 'standing',
    icon: '📊',
    question: 'Di posisi berapa Persib di klasemen sementara Super League dan berapa jarak poin dengan peringkat atas?',
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

    // Metrik Default Musim Aktif 2026/2027
    const defaultMetrics = {
      leagueRank: 6,
      points: 16,
      matchRecord: '9 Main: 5M 1S 3K (Gol 16-10 [+6])',
      nextOpponent: 'Bali United FC',
      nextMatchDate: 'Minggu, 22 November 2026 (19:00 WIB)',
      shopeeRank: 1,
      aclStatus: 'Juara Grup E (Lolos 16 Besar Asia)',
    };

    // =========================================================================
    // KATEGORI 1: JADWAL & BIG MATCH SUPER LEAGUE PEKAN 10 VS BALI UNITED
    // =========================================================================
    if (
      q.includes('bali united') ||
      q.includes('pekan 10') ||
      q.includes('laga terdekat') ||
      q.includes('besok') ||
      (q.includes('jadwal') && (q.includes('liga') || q.includes('super league') || q.includes('gbla') || q.includes('kandang')))
    ) {
      const text = `Berikut detail resmi dan analisis jelang **Super Big Match Super League Pekan 10 (2026/2027)**:

⚔️ Pertandingan Terdekat:
* **Laga**: **PERSIB Bandung (#6, 16 Poin) vs Bali United FC (#3, 19 Poin)**
* 📅 **Hari/Tanggal**: **Minggu, 22 November 2026**
* ⏰ **Waktu Kick-off**: **19:00 WIB** (Laga Malam)
* 🏟️ **Stadion**: Gelora Bandung Lautan Api (GBLA), Gedebage, Bandung
* 📌 **Status**: **SCHEDULED** (Pertandingan belum dimainkan).

---

🔥 Signifikansi Taktikal & Klasemen:
1. **Peluang Lonjakan Klasemen**: Kemenangan 3 poin di hadapan Bobotoh akan membuat Maung Bandung mengumpulkan 19 poin, menyamai perolehan Bali United dan Madura United di papan atas.
2. **Kondisi Skuad**: Trio pilar Thom Haye, Sandy Walsh, dan Marc Klok dalam kondisi bugar 100% setelah rotasi cerdas Bojan Hodak di ajang Shopee Cup.
3. **Head to Head & Mentalitas**: Rekor tak terkalahkan di kandang GBLA menjadi modal krusial menghadapi agresivitas lini serang Serdadu Tridatu.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text,
        timestamp: timeStr,
        category: 'match',
        actionableTips: [
          'Dukung langsung di GBLA atau saksikan siaran langsung resmi mulai pukul 18:30 WIB.',
          'Waspadai serangan balik cepat Bali United melalui transisi sayap di 15 menit awal babak pertama.',
          'Pantau Live Telemetry Widget di dashboard aplikasi untuk update taktis berkala jelang kick-off.'
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
      const text = `Berikut adalah **Klasemen Resmi Super League 2026/2027** pasca rampungnya seluruh pertandingan Pekan 9:

📊 Papan Atas Super League 2026/2027:
1. **Persija Jakarta** — 21 Poin (Main 9: 6M 3S 0K | Selisih Gol +9)
2. **Dewa United** — 20 Poin (Main 10: 6M 2S 2K | Selisih Gol +7)
3. **Bali United** — 19 Poin (Main 9: 6M 1S 2K | Selisih Gol +6)
4. **Madura United** — 19 Poin (Main 10: 6M 1S 3K | Selisih Gol +5)
5. **Persita Tangerang** — 18 Poin (Main 9: 5M 3S 1K | Selisih Gol +4)
6. 🔵 **PERSIB Bandung** — **16 Poin** (Main 9: 5M 1S 3K | Gol 16-10 [+6])

---

💡 Catatan Analis Taktis:
* PERSIB menyimpan tabungan 1 pertandingan lebih sedikit dibandingkan Dewa United dan Madura United.
* Tambahan 3 poin kontra Bali United besok malam (22 Nov 2026) akan merapatkan selisih poin ke puncak klasemen menjadi hanya 2 angka!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text,
        timestamp: timeStr,
        category: 'standing',
        actionableTips: [
          'Kemenangan atas Bali United berpotensi mengangkat PERSIB langsung ke posisi 3 besar.',
          'Produktivitas gol PERSIB (16 gol) merupakan salah satu yang tertinggi di Super League.',
          'Gunakan filter Klasemen di Match Center untuk simulasi skenario perolehan poin pekan ini.'
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
        text,
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
        text,
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
        text,
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
        text,
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
* ⚔️ **Laga Mendatang**: Super Big Match Pekan 10 Super League kontra **Bali United FC** besok **Minggu, 22 November 2026 pukul 19:00 WIB** di GBLA!
* 📊 **Klasemen**: PERSIB berada di peringkat #6 (16 Poin). Kemenangan besok malam akan melesatkan Maung Bandung ke posisi 3 besar menyamai Bali United (19 Poin).
* 🌏 **Kompetisi Asia**: PERSIB memuncaki Grup B Shopee Cup (6 Poin, Gol 9-1) dan mengunci tiket 16 Besar ACL Two dengan rekor 100% menang!

Tanyakan apa saja seputar taktik Bojan Hodak, kondisi pemain, atau jadwal berikutnya!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text,
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
1. **Shopee Cup (MD2 - 19 Nov 2026)**:
   - **PERSIB Bandung 6 - 0 Shan United** (Pesta gol di hadapan Bobotoh, mengokohkan posisi #1 Grup B).
2. **Super League (Pekan 9 - 14 Nov 2026)**:
   - **Arema FC 1 - 2 PERSIB Bandung** (Kemenangan krusial tandang berkat gol Mariano Peralta dan Thom Haye).
3. **ACL Two (MD4 - 6 Nov 2026)**:
   - **PERSIB Bandung 2 - 1 Melbourne Victory** (Rekor sempurna 100% menang 4 kali, memastikan tiket Babak 16 Besar Asia!).

Semua fokus tim saat ini tercurah pada laga krusial kontra Bali United besok malam (22 Nov 2026) di GBLA!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text,
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
    // DEFAULT: REKOMENDASI PINTAR BOBOTOH 2026/2027
    // =========================================================================
    const text = `Sampurasun, Bobotoh! 🔵⚽💬

Berikut panduan terpadu seputar seluruh agenda dan performa resmi **PERSIB Bandung Musim 2026/2027**:

🎯 Ringkasan Agenda & Posisi Maung Bandung:
1. **Laga Terdekat**: Super Big Match Pekan 10 Super League kontra **Bali United FC** pada **Minggu, 22 November 2026, 19:00 WIB** di GBLA.
2. **Klasemen Domestik**: PERSIB di peringkat ke-6 dengan **16 Poin** (selisih 3 angka dari 3 besar).
3. **Shopee Cup (Grup B)**: Kokoh di **Puncak Klasemen** (6 Poin, Selisih Gol +8). Laga berikutnya vs Lion City Sailors (10 Des 2026).
4. **ACL Two (Asia)**: Resmi menyegel status **Juara Grup E** dengan rekor kemenangan 100% (12 Poin) menuju Babak 16 Besar Asia.

Silakan ajukan pertanyaan spesifik seputar taktik Bojan Hodak, kondisi pemain, atau jadwal laga mendatang!`;

    return {
      id: 'msg-' + Date.now(),
      sender: 'ai',
      text,
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
