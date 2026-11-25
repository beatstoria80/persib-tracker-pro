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

import { VERIFIED_FIXTURES_2026_2027 } from './persib-data';
import { isFixtureTodayWib } from '@/lib/groq';

// REFACTOR: Global response sanitizer stripping raw AI formatting tokens (*, **, _, <br>)
export function cleanAiResponseText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove markdown bold asterisks **text** -> text across multiple lines
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    // Remove any leftover double asterisks
    .replace(/\*\*/g, '')
    // Remove italic single asterisks *text* -> text when wrapping words
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?:;])/g, '$1$2')
    // Remove markdown italic underscores _text_ -> text
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?:;])/g, '$1$2')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/(^|\s)_(?=\S)|(?<=\S)_(?=\s|$)/g, '$1')
    // Remove markdown header tags
    .replace(/^#{1,6}\s+/gm, '')
    // Normalize excessive newlines
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

    // Dynamic fixtures feed from authentic schedule
    const todayMatch = VERIFIED_FIXTURES_2026_2027.find((f) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
    const activeLiveFixture = VERIFIED_FIXTURES_2026_2027.find((f) => f.status === 'LIVE');
    const latestFinished =
      VERIFIED_FIXTURES_2026_2027.filter((f) => f.status === 'FINISHED').slice(-1)[0] ||
      VERIFIED_FIXTURES_2026_2027.find((f) => f.id === 'l1-p10');
    const upcomingScheduled =
      VERIFIED_FIXTURES_2026_2027.find((f) => f.status === 'SCHEDULED' && !isFixtureTodayWib(f.date)) ||
      VERIFIED_FIXTURES_2026_2027.find((f) => f.id === 'l1-p11');

    // Metrik Default Musim Aktif 2026/2027 (Pasca Pekan 10 Selesai & Hari Ini Matchday 5 ACL Two)
    const defaultMetrics = {
      leagueRank: 4,
      points: 19,
      matchRecord: '10 Main: 6M 1S 3K (Gol 18-11 [+7])',
      nextOpponent: todayMatch
        ? (todayMatch.homeTeam.includes('PERSIB') ? todayMatch.awayTeam : todayMatch.homeTeam)
        : upcomingScheduled
        ? (upcomingScheduled.homeTeam.includes('PERSIB') ? upcomingScheduled.awayTeam : upcomingScheduled.homeTeam)
        : 'FC Seoul (KOR)',
      nextMatchDate: todayMatch
        ? `Hari Ini, ${todayMatch.date} (${todayMatch.time || '19:15 WIB'})`
        : upcomingScheduled
        ? `${upcomingScheduled.date} (${upcomingScheduled.time})`
        : 'Hari Ini (19:15 WIB)',
      shopeeRank: 1,
      aclStatus: 'Peringkat 1 Grup E (12 Poin Maksimal - Siap Matchday 5 Hari Ini)',
    };

    // =========================================================================
    // KATEGORI 0A: PERTANDINGAN HARI INI / KESIAPAN LAGA (ACL TWO VS FC SEOUL)
    // =========================================================================
    const isTodayMatchQuery =
      q.includes('hari ini') ||
      q.includes('kesiapan') ||
      q.includes('seoul') ||
      (q.includes('acl') && (q.includes('update') || q.includes('laga') || q.includes('jadwal') || q.includes('siap') || q.includes('main') || q.includes('tanding'))) ||
      (q.includes('laga') && (q.includes('hari ini') || q.includes('malam ini') || q.includes('sekarang')));

    if (isTodayMatchQuery && todayMatch) {
      const isLiveNow = todayMatch.status === 'LIVE';
      const text = `${isLiveNow ? '🚨 LAGA SEDANG BERLANGSUNG LIVE:' : 'Halo Bobotoh! Berikut informasi kesiapan dan update resmi laga PERSIB di ACL Two hari ini:'}

Pertandingan Hari Ini:
• Laga: ${todayMatch.homeTeam} vs ${todayMatch.awayTeam} (Matchday 5 Grup E ACL Two 2026/2027)
• Waktu Kick-off: Hari ini, ${todayMatch.date} pukul ${todayMatch.time || '19:15 WIB'}
• Stadion: ${todayMatch.venue}
• Status: ${isLiveNow ? 'SEDANG BERLANGSUNG LIVE' : 'Siap Kick-off Pukul ' + (todayMatch.time || '19:15 WIB')}

Kesiapan Tim & Mentalitas Skuad:
1. Moral Juara Tertinggi: PERSIB berbekal rekor sempurna di Asia (4 laga, 4 menang, 12 poin) dan kemenangan bersejarah 0-1 di Seoul World Cup Stadium pada Matchday 2 berkat gol Balša Sekulić. Tren kemenangan comeback heroik 2-1 atas Bali United di liga domestik semakin mempertebal kepercayaan diri Maung Bandung.
2. Status Pemain & Disiplin (Penting):
- Mariano Peralta: 100% sah dan bugar bermain sejak menit awal sebagai starter di laga Asia malam ini. Sanksi kartu merah langsung Peralta hanya berlaku di kompetisi domestik (Super League Pekan 11 vs Persita), sehingga tidak memengaruhi keabsahannya di ajang resmi AFC.
- Pilar Inti Siap Tempur: Thom Haye (jenderal lapangan tengah), Sandy Walsh (palang pintu tangguh), Balša Sekulić, Luka Menalo, Patricio Matricardi, dan kiper Teja Paku Alam dalam kondisi fisik 100% prima.
3. Strategi & Skema Taktik Bojan Hodak:
Pelatih Bojan Hodak menurunkan formasi 4-2-3-1 dengan penguasaan lini tengah agresif melalui duet Thom Haye dan Marc Klok, transisi kilat counter-attack, serta eksploitasi koridor sayap oleh Mariano Peralta dan Luka Menalo untuk memanjakan Balša Sekulić di kotak penalti lawan.

Target Utama:
PERSIB bertekad mengunci kemenangan ke-5 berturut-turut untuk menyapu bersih rekor 100% sempurna 15 poin di Grup E dan menegaskan status Juara Grup di hadapan gemuruh puluhan ribu Bobotoh di Stadion GBLA!`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'acl',
        actionableTips: [
          'Pertandingan kick-off resmi malam ini pukul 19:15 WIB di Stadion GBLA Bandung.',
          'Mariano Peralta 100% sah bermain sebagai starter karena kartu merah hanya berlaku di liga domestik.',
          'Pantau live score dan timeline peristiwa pertandingan real-time di tab Matches aplikasi ini.'
        ],
        metricsContext: {
          ...defaultMetrics,
          nextOpponent: todayMatch.awayTeam,
          nextMatchDate: `Hari Ini (${todayMatch.time || '19:15 WIB'})`,
          aclStatus: 'Juara Grup E (12 Poin - Matchday 5 Hari Ini)',
        },
      };
    }

    // =========================================================================
    // KATEGORI 0B: STATUS DISIPLIN, SANKSI KARTU MERAH & DENDA PEMAIN
    // =========================================================================
    if (
      (q.includes('peralta') && (q.includes('kartu') || q.includes('merah') || q.includes('sanksi') || q.includes('denda') || q.includes('bisa main') || q.includes('absen') || q.includes('skorsing'))) ||
      (q.includes('kartu merah') && (q.includes('peralta') || q.includes('denda') || q.includes('persita') || q.includes('acl'))) ||
      (q.includes('matricardi') && q.includes('kartu'))
    ) {
      const isMatricardi = q.includes('matricardi');
      let text = '';
      if (isMatricardi) {
        text = `Berikut adalah status disiplin dan kartu Patricio Matricardi (#48 Bek Tengah):
• Catatan Kartu: Mengantongi 3 kartu kuning di Super League 2026/2027.
• Status Kesiapan: Berada dalam status PERINGATAN AKUMULASI (1 kartu kuning lagi menuju sanksi larangan bertanding 1 laga di Super League).
• Ketersediaan Laga: Siap 100% tampil sebagai benteng pertahanan utama, baik di ajang Super League maupun ACL Two malam ini vs FC Seoul.`;
      } else {
        text = `Berikut rincian resmi status sanksi disiplin dan ketersediaan laga Mariano Peralta (#10 Sayap Kanan):

1. Kronologi Kartu Merah:
Mariano Peralta menerima kartu merah langsung pada menit ke-86 saat laga dramatis Pekan 10 Super League vs Bali United di Stadion GBLA usai mencetak gol penyama kedudukan di menit 79.

2. Konsekuensi di Super League (Liga Domestik):
• Status: Terkena sanksi larangan bertanding pada laga Super League Pekan 11 kontra Persita Tangerang (Minggu, 29 November 2026).
• Opsi Klausul Denda: Berdasarkan regulasi Komite Disiplin PSSI, sanksi dapat diselesaikan melalui opsi denda disiplin sebesar Rp 10.000.000 jika diselesaikan oleh pihak klub.

3. Konsekuensi di Ajang Asia (ACL Two & Shopee Cup):
• Status: 100% SAH DAN BEBAS BERMAIN SEJAK MENIT AWAL!
• Regulasi: Yurisdiksi sanksi kartu merah PSSI di liga domestik terpisah dari regulasi kompetisi AFC (Asian Football Confederation) dan AFF. Oleh karena itu, Peralta bebas tampil penuh membela PERSIB di laga Matchday 5 ACL Two vs FC Seoul malam ini serta Shopee Cup.`;
      }

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Sanksi kartu merah Peralta hanya berlaku di kompetisi domestik PSSI (Pekan 11 vs Persita).',
          'Untuk kompetisi internasional (ACL Two vs FC Seoul malam ini), Peralta 100% sah bermain.',
          'Manajemen PERSIB sedang mengevaluasi opsi pembayaran denda Komdis PSSI Rp 10 Juta untuk Pekan 11.'
        ],
        metricsContext: defaultMetrics,
      };
    }

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
- Mariano Peralta: 5 Gol (Top Scorer Persib di Super League)
- Balša Sekulić: 4 Gol
- Luka Menalo: 4 Gol
- Ragnar Oratmangoen: 3 Gol
- Thom Haye: 1 Gol, 7 Assist (Raja Assist Tak Tertandingi Liga 1)
- Marc Klok: 1 Gol, 2 Assist

2. AFC CHAMPIONS LEAGUE TWO / ACL TWO (Total 7 Gol PERSIB - Rekor 100% Menang Grup E):
- Balša Sekulić: 5 Gol (Top Scorer Puncak Grup E ACL Two)
- Luka Menalo: 1 Gol, 1 Assist
- Marc Klok: 1 Gol (Penalti)
- Thom Haye: 3 Assist (Playmaker Kreator Gol Asia)
- Mariano Peralta: 2 Assist (Sayap Penyuplai Bola)

3. SHOPEE CUP ASEAN (Total 9 Gol):
- Balša Sekulić: 3 Gol (Hat-trick sensasional vs Shan United)
- Luka Menalo: 2 Gol
- Mariano Peralta: 2 Gol
- Berguinho: 1 Gol
- Uilliam Barros: 1 Gol`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Buka tab "Top Skor" di Match Center untuk melihat visual podium sepatu emas interaktif.',
          'Balša Sekulić memimpin daftar pencetak gol PERSIB di Super League dengan 5 gol.',
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
      if (activeLiveFixture) {
        text = `🚨 LAGA SEDANG BERLANGSUNG LIVE: ${activeLiveFixture.roundOrWeek} (${activeLiveFixture.tournament})

⚔️ Informasi Pertandingan Langsung:
• Pertandingan: ${activeLiveFixture.homeTeam} vs ${activeLiveFixture.awayTeam}
• Skor Sementara: ${activeLiveFixture.homeScore} - ${activeLiveFixture.awayScore}
• Waktu/Menit: ${activeLiveFixture.time || 'LIVE'}
• Stadion: ${activeLiveFixture.venue}
• Status: SEDANG BERLANGSUNG (LIVE)

Pantau pembaruan peristiwa laga real-time di Match Center aplikasi!`;
      } else if (isPastMatchQuery && latestFinished) {
        const highlightsText =
          latestFinished.highlights && latestFinished.highlights.length > 0
            ? latestFinished.highlights.map((h) => `• ${h}`).join('\n')
            : `• Skor Akhir: ${latestFinished.homeTeam} ${latestFinished.homeScore} - ${latestFinished.awayScore} ${latestFinished.awayTeam}`;
        text = `🏆 HASIL AKHIR RESMI: ${latestFinished.roundOrWeek} (${latestFinished.tournament})

⚔️ Pertandingan Telah Selesai (Full Time):
• Laga: ${latestFinished.homeTeam} ${latestFinished.homeScore} - ${latestFinished.awayScore} ${latestFinished.awayTeam}
• Tanggal: ${latestFinished.date}
• Stadion: ${latestFinished.venue}
• Status: SELESAI (FULL TIME)

⚽ Linimasa Momen Krusial:
${highlightsText}

🔥 Dampak Klasemen & Taktikal:
Koleksi 19 poin menempatkan PERSIB di posisi 4 klasemen sementara Super League 2026/2027, menempel ketat papan atas!`;
      } else if (upcomingScheduled) {
        const oppName = upcomingScheduled.homeTeam.includes('PERSIB') ? upcomingScheduled.awayTeam : upcomingScheduled.homeTeam;
        text = `Berikut jadwal resmi pertandingan terdekat PERSIB Bandung di ${upcomingScheduled.tournament}:

⚔️ Pertandingan Terdekat (${upcomingScheduled.roundOrWeek}):
• Laga: ${upcomingScheduled.homeTeam} vs ${upcomingScheduled.awayTeam} (${upcomingScheduled.homeTeam.includes('PERSIB') ? 'Laga Kandang' : 'Laga Tandang'})
• Hari/Tanggal: ${upcomingScheduled.date}
• Waktu Kick-off: ${upcomingScheduled.time} WIB
• Stadion: ${upcomingScheduled.venue}
• Status: SCHEDULED (Laga Mendatang)

🎯 Misi Taktikal Bojan Hodak:
1. Lanjutkan Tren Kemenangan: Mengamankan 3 poin tandang demi terus menekan Persija (22 poin), Dewa United (20 poin), dan Bali United (19 poin).
2. Kesiapan Skuad: Balša Sekulić, Luka Menalo, Thom Haye, Sandy Walsh, dan Teja Paku Alam dalam kondisi bugar 100% (Peralta absen suspensi kartu merah di liga domestik).
3. Fokus Lanjutan: Usai Pekan 11, Maung Bandung akan melakoni Super Big Match Pekan 12 kontra Persebaya (6 Des 2026) dan lawatan Shopee Cup ke markas Lion City Sailors (10 Des 2026).`;
      }

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'match',
        actionableTips: isPastMatchQuery
          ? [
              'Kemenangan comeback dramatis atas Bali United menegaskan mental juara Maung Bandung di GBLA.',
              'Mariano Peralta dan Luka Menalo menjadi motor kemenangan comeback 2 menit.',
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
1. **Persija Jakarta** — 22 Poin (Main 10: 7M 1S 2K | Selisih Gol +12)
2. **Dewa United** — 20 Poin (Main 10: 6M 2S 2K | Selisih Gol +3)
3. **Bali United** — 19 Poin (Main 10: 6M 1S 3K | Gol 27-11 [+16])
4. 🔵 **PERSIB Bandung** — **19 Poin** (Main 10: 6M 1S 3K | Gol 18-11 [+7])
5. **Madura United** — 19 Poin (Main 10: 6M 1S 3K | Gol 16-11 [+5])
6. **Persita Tangerang** — 18 Poin (Main 9: 5M 3S 1K | Selisih Gol +7)

---

💡 Catatan Analis Taktis:
* Kemenangan comeback heroik 2-1 atas Bali United di GBLA melesatkan PERSIB mengunci 19 poin di peringkat 4 klasemen, menempel ketat Bali United (#3) dan Dewa United (#2, 20 poin).
* Jarak dengan pemuncak klasemen Persija (22 poin) kini terpaut 3 poin, membuka persaingan gelar juara semakin panas!`;

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
      const text = `Status resmi spektakuler PERSIB Bandung di AFC Champions League Two (ACL Two 2026/2027 - Grup E):

⭐ Rekor Sempurna 100% di Panggung Asia:
• Posisi: Peringkat 1 / JUARA GRUP E
• Tiket Lolos: Lolos ke Babak 16 Besar Asia (Knockout Stage)
• Rekor Tanding Saat Ini: 4 Pertandingan, 4 Menang, 0 Seri, 0 Kalah | 12 Poin Maksimal (Gol 7-1, Selisih Gol +6)
• Laga Matchday 5: Hari Ini (Rabu, 25 November 2026 pukul 19:15 WIB) vs FC Seoul di Stadion GBLA Bandung!

🏆 Klasemen Sementara Grup E:
1. PERSIB Bandung (IDN): 12 Poin (Gol 7-1, +6) - Lolos 16 Besar Asia
2. FC Seoul (KOR): 7 Poin (Gol 5-3, +2)
3. Melbourne Victory (AUS): 3 Poin (Gol 3-6, -3)
4. The Cong-Viettel (VIE): 1 Poin (Gol 1-6, -5)

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
    // KATEGORI 6.5: DAFTAR RESMI 11 PEMAIN ASING PERSIB 2026/2027
    // =========================================================================
    if (
      q.includes('pemain asing') ||
      q.includes('legion asing') ||
      q.includes('legiun asing') ||
      q.includes('asing') ||
      q.includes('impor') ||
      q.includes('mutombo') ||
      q.includes('cesar') ||
      q.includes('loncar') ||
      q.includes('matricardi') ||
      q.includes('guaycochea') ||
      q.includes('notsuda') ||
      q.includes('berguinho') ||
      q.includes('menalo') ||
      q.includes('uilliam') ||
      q.includes('david da silva')
    ) {
      const text = `Daftar Resmi **11 Pemain Asing PERSIB Bandung Musim 2026/2027**:

Berikut adalah 11 pilar legiun asing resmi yang terdaftar membela PERSIB Bandung di Super League & Asia:

1. **#3 Gabriel Mutombo** (Prancis) — Bek Tengah
2. **#4 Júlio César** (Brasil) — Bek Tengah
3. **#22 Danijel Lončar** (Kroasia) — Bek Tengah
4. **#48 Patricio Matricardi** (Argentina) — Bek Tengah
5. **#8 Luciano Guaycochea** (Argentina) — Gelandang Serang
6. **#17 Gakuto Notsuda** (Jepang) — Gelandang Tengah
7. **#97 Berguinho (Rosembergne da Silva)** (Brasil) — Gelandang Serang / Sayap
8. **#9 Luka Menalo** (Bosnia-Herzegovina / Kroasia) — Sayap Kiri
9. **#10 Mariano Peralta** (Argentina) — Sayap Kanan
10. **#94 Uilliam Barros** (Brasil) — Penyerang Tengah
11. **#99 Balša Sekulić** (Montenegro) — Penyerang Tengah

⚠️ **Catatan Penting Integritas Data**:
Pemain-pemain masa lalu seperti David da Silva, Ciro Alves, Tyronne del Pino, Federico Barba, Kevin Ray Mendoza, Nick Kuipers, Alberto Rodriguez, Stefano Beltrame, maupun Mateo Kocijan **SUDAH TIDAK LAGI BERMAIN UNTUK PERSIB** di musim 2026/2027. Selain ke-11 nama resmi di atas, tidak ada pemain asing lain di skuad Persib saat ini.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Hanya 11 pemain asing ini yang terdaftar secara sah di PSSI Super League & AFC.',
          'Buka tab Roster di aplikasi untuk melihat statistik dan video aksi pemain asing.',
          'Pemain seperti Thom Haye, Sandy Walsh, Eliano Reijnders, dan Ragnar Oratmangoen berstatus WNI (Naturalisasi Timnas Indonesia).'
        ],
        metricsContext: defaultMetrics,
      };
    }

    // =========================================================================
    // KATEGORI 6.6: DAFTAR RESMI PENJAGA GAWANG (GOAL KEEPER) PERSIB 2026/2027
    // =========================================================================
    if (
      q.includes('kiper') ||
      q.includes('penjaga gawang') ||
      q.includes('goal keeper') ||
      q.includes('goalkeeper') ||
      q.includes('goal-keeper') ||
      q.includes('teja') ||
      q.includes('rhaka') ||
      q.includes('syafaka') ||
      q.includes('fitrah') ||
      q.includes('mendoza')
    ) {
      const text = `Daftar Resmi **Penjaga Gawang (Goal Keeper) PERSIB Bandung Musim 2026/2027**:

Berikut adalah 3 penjaga gawang resmi berstatus Lokal yang mengawal gawang Maung Bandung:

1. **#14 Teja Paku Alam** — Status: Lokal (Kiper Utama)
2. **#60 Muhammad Rhaka Syafaka** — Status: Lokal (Kiper Muda)
3. **#81 Fitrah Maulana** — Status: Lokal (Kiper Muda Timnas U-23)

⚠️ **Catatan Penting Penjaga Gawang**:
Kiper masa lalu seperti Kevin Ray Mendoza, Fitrul Dwi Rustapa, Reky Rahayu, maupun Sheva Sanggasi **SUDAH TIDAK LAGI BERMAIN UNTUK PERSIB** di musim 2026/2027. Gawang PERSIB sepenuhnya dipercayakan secara tangguh kepada 3 kiper lokal di atas.`;

      return {
        id: 'msg-' + Date.now(),
        sender: 'ai',
        text: cleanAiResponseText(text),
        timestamp: timeStr,
        category: 'squad',
        actionableTips: [
          'Teja Paku Alam (#14) berposisi sebagai kiper utama dengan statistik kebobolan minim di Super League.',
          'Muhammad Rhaka Syafaka (#60) dan Fitrah Maulana (#81) merupakan aset masa depan binaan akademi dan Timnas muda.',
          'Seluruh 3 kiper resmi Persib musim 2026/2027 berstatus pemain lokal Indonesia.'
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
   - **PERSIB Bandung 2 - 1 Bali United FC** (Kemenangan comeback dramatis 2 menit di GBLA berkat gol Mariano Peralta 79' dan Luka Menalo 81' membalas gol Marko Dugandžić 66').
2. **Shopee Cup (MD2 - 19 Nov 2026)**:
   - **PERSIB Bandung 6 - 0 Shan United** (Pesta gol di hadapan Bobotoh, mengokohkan posisi #1 Grup B).
3. **ACL Two (MD4 Leg 2 - 6 Nov 2026)**:
   - **Melbourne Victory 1 - 2 PERSIB Bandung** (Kemenangan comeback dramatis Leg 2 di AAMI Park Melbourne, rekor 100% menang 4 kali, memastikan tiket Babak 16 Besar Asia!).

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
