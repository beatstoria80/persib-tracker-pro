import { NextRequest, NextResponse } from 'next/server';
import { PersibIntelligenceEngine, PersibAiChatMessage } from '@/data/persib-intelligence-engine';
import { VERIFIED_FIXTURES_2026_2027 } from '@/data/persib-data';
import { isFixtureTodayWib } from '@/lib/groq';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// REFACTOR: Strips raw AI-generated tokens (** for bold, _ for italics, and <br> tags) to ensure human, clean output
function cleanAiResponseText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Replace <br>, <br/>, <br /> with newline
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

interface ChatHistoryItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message || '';
    const conversationHistory: ChatHistoryItem[] = Array.isArray(body.history) ? body.history : [];

    if (!userMessage.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pesan pertanyaan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    // Default factual engine response (for context, category & actionable tips)
    const engineResponse: PersibAiChatMessage = PersibIntelligenceEngine.generateResponse(userMessage);

    const apiKey = process.env.GROQ_API_KEY || '';
    const primaryModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    // Verified active Groq models in prioritized order
    const candidateModels = [
      primaryModel,
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
    ];

    // Remove duplicates while preserving order
    const uniqueModels = Array.from(new Set(candidateModels));

    // Dynamic live fixtures & schedule feed from database
    const todayMatch = VERIFIED_FIXTURES_2026_2027.find((f) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
    const liveMatchNow = VERIFIED_FIXTURES_2026_2027.find((f) => f.status === 'LIVE');
    const recentFinished = VERIFIED_FIXTURES_2026_2027.filter((f) => f.status === 'FINISHED').slice(-3);
    const nextUpcoming = VERIFIED_FIXTURES_2026_2027.filter((f) => f.status === 'SCHEDULED' && !isFixtureTodayWib(f.date)).slice(0, 5);

    const todayMatchFeed = todayMatch
      ? `🚨 HARI INI ADA PERTANDINGAN BESAR RESMI PERSIB (${todayMatch.date}):
- Turnamen: ${todayMatch.tournament} (${todayMatch.roundOrWeek})
- Laga: ${todayMatch.homeTeam} vs ${todayMatch.awayTeam} (${todayMatch.homeTeam.includes('PERSIB') ? 'Laga Kandang di Bandung' : 'Laga Tandang'})
- Waktu Kick-off Resmi: Pukul ${todayMatch.time || '19:15 WIB'}
- Stadion: ${todayMatch.venue}
- Status: ${todayMatch.status === 'LIVE' ? 'SEDANG BERLANGSUNG LIVE SAAT INI!' : 'JADWAL HARI INI (SIAP KICK-OFF MALAM INI ' + (todayMatch.time || '19:15 WIB') + ')'}
- Konteks Laga & Kesiapan:
  * Ini adalah laga Matchday 5 Grup E ACL Two vs wakil kuat K-League Korea Selatan FC Seoul di Stadion GBLA.
  * Rekor Pertemuan: Pada Matchday 2 di Korea, PERSIB mencetak sejarah menang 0-1 di Seoul World Cup Stadium lewat gol Balša Sekulić.
  * Kesiapan Tim: Mentalitas tim sangat tinggi setelah menang dramatis 2-1 atas Bali United di liga domestik dan mengantongi rekor 100% menang di Grup E (12 poin dari 4 laga).
  * Status Skuad & Disiplin (PENTING): Mariano Peralta 100% SAH dan bebas bermain sebagai starter di laga Asia malam ini (kartu merah Peralta hanya berlaku di kompetisi domestik Super League PSSI, tidak ada sanksi di kompetisi AFC). Pilar inti seperti Thom Haye, Sandy Walsh, Balša Sekulić, Luka Menalo, dan Patricio Matricardi siap tempur.
  * Target: Mengamankan kemenangan ke-5 beruntun untuk menyapu bersih rekor 100% sempurna 15 poin di Grup E!`
      : `Tidak ada pertandingan resmi yang dijadwalkan pada hari ini. Tim sedang beristirahat dan berlatih taktik mempersiapkan laga terdekat mendatang.`;

    const liveMatchFeed = liveMatchNow
      ? `SEDANG BERLANGSUNG LIVE: ${liveMatchNow.roundOrWeek} (${liveMatchNow.tournament}): ${liveMatchNow.homeTeam} ${liveMatchNow.homeScore} - ${liveMatchNow.awayScore} ${liveMatchNow.awayTeam} (Waktu: ${liveMatchNow.time || 'LIVE'}) di ${liveMatchNow.venue}. Pertandingan sedang berjalan saat ini!`
      : todayMatch
      ? `Laga resmi berikutnya adalah HARI INI (${todayMatch.date}): ${todayMatch.homeTeam} vs ${todayMatch.awayTeam} pukul ${todayMatch.time || '19:15 WIB'} di ${todayMatch.venue}.`
      : `Tidak ada laga yang sedang berjalan LIVE saat ini. Laga resmi terakhir telah rampung dan tim sedang mempersiapkan jadwal terdekat berikutnya.`;

    const recentResultsFeed = recentFinished
      .map((f) => `* ${f.roundOrWeek} (${f.tournament}): ${f.homeTeam} ${f.homeScore} - ${f.awayScore} ${f.awayTeam} (FT di ${f.venue})`)
      .join('\n     ');

    const upcomingScheduleFeed = nextUpcoming
      .map((f) => `* ${f.roundOrWeek} (${f.tournament}): ${f.homeTeam} vs ${f.awayTeam} (${f.date} pukul ${f.time} di ${f.venue})`)
      .join('\n     ');

    // REFACTOR: Comprehensive Global Football & Persib Tactical Intelligence system prompt
    const systemPrompt = `Kamu adalah "PERSIB & GLOBAL FOOTBALL TACTICAL INTELLIGENCE", ensiklopedia sepak bola dunia dan asisten resmi paling cerdas, taktis, dan otoritatif untuk Bobotoh pendukung PERSIB Bandung serta seluruh penggemar sepak bola profesional internasional.

ATURAN UTAMA MENJAWAB (PATUHI INTENSI PERTANYAAN SECARA KETAT & DILARANG SALAH KONTEKS):
1. JIKA PENGGUNA BERTANYA: "apa update laga persib di ACL hari ini", "bagaimana kesiapan laga hari ini", "apakah hari ini ada pertandingan", atau pertanyaan serupa seputar laga hari ini / ACL Two:
   - JAWAB LANGSUNG MENGENAI LAGA HARI INI: PERSIB Bandung vs FC Seoul (KOR) di Matchday 5 Grup E ACL Two, kick-off malam ini pukul 19:15 WIB di Stadion Gelora Bandung Lautan Api (GBLA)!
   - Jelaskan kesiapan tim: moral juara tim pasca menang 0-1 di markas Seoul dan comeback heroik 2-1 atas Bali United.
   - Jelaskan status pemain: Mariano Peralta 100% SAH dan bebas bermain di ACL Two malam ini (skorsing kartu merah Peralta hanya berlaku di kompetisi domestik PSSI Super League, BUKAN kompetisi Asia AFC). Thom Haye, Sandy Walsh, Balša Sekulić (pencetak gol di Seoul), Luka Menalo, dan Patricio Matricardi siap starter.
   - DILARANG KERAS menjawab panjang lebar mendeskripsikan hasil laga lampau (seperti ulasan laga Matchday 4 vs Melbourne Victory atau laga-laga berbulan-bulan lalu) ketika pengguna menanyakan kesiapan hari ini! Fokus 100% pada laga hari ini dan persiapan tim!
   - DILARANG KERAS mengatakan "saat ini tidak ada laga persib" atau "tim sedang istirahat menunggu 16 besar", karena hari ini ada laga Matchday 5 vs FC Seoul!

2. PENANGANAN HIDDEN KONTEKS PADA SELURUH TEMA:
   - Tema Jadwal & Laga Terdekat:
     Jika pengguna menanyakan "laga selanjutnya", "jadwal terdekat", atau "kapan main lagi":
     Prioritas pertama: Sebutkan laga hari ini jika ada (vs FC Seoul 19:15 WIB hari ini). Setelah itu baru sebutkan laga Super League berikutnya (Pekan 11 vs Persita, 29 Nov 19:00 WIB di Indomilk Arena).
   - Tema Disiplin & Ketersediaan Pemain (Mariano Peralta & Patricio Matricardi):
     Jika ditanya "apakah Peralta bisa main?" atau tentang kartu merah:
     Peralta terkena kartu merah langsung vs Bali United (menit 86). Konsekuensi: Absen di Super League Pekan 11 vs Persita Tangerang kecuali denda disiplin Komdis PSSI Rp 10.000.000 diselesaikan klub. NAMUN di kompetisi internasional (ACL Two vs FC Seoul & Shopee Cup), Peralta 100% SAH dan bebas bermain karena yurisdiksi sanksi domestik PSSI tidak berlaku di AFC/ASEAN.
     Patricio Matricardi mengantongi 3 kartu kuning (peringatan akumulasi di liga).
   - Tema Klasemen:
     Jika tidak menyebut ajang, berikan rangkuman ringkas ketiga kompetisi (Super League #4 19 poin; ACL Two #1 12 poin lolos 16 besar; Shopee Cup #1 6 poin).
   - Tema Taktik & Formasi Bojan Hodak:
     Jelaskan formasi 4-2-3-1, kedisiplinan compact defense, transisi balik kilat, poros Thom Haye-Marc Klok, penetrasi Menalo-Peralta, dan finishing Sekulic/Uilliam.
   - Tema Skuad Asing & Pemain Lama:
     Pemain lama (David da Silva, Ciro Alves, Alberto Rodriguez, Nick Kuipers, Mendoza, Tyronne del Pino) sudah tidak bermain di Persib 2026/2027. Skuad saat ini diperkuat 11 pemain asing resmi plus diaspora Thom Haye, Sandy Walsh, dan Ragnar Oratmangoen.

KAPABILITAS & CAKUPAN PENGETAHUAN LENGKAP:
Kamu memiliki otoritas penuh untuk menjawab APAPUN pertanyaan seputar dunia sepak bola, baik tingkat lokal, nasional (Timnas Indonesia), regional (ASEAN/AFC), maupun turnamen profesional FIFA/UEFA di seluruh dunia! DILARANG KERAS menolak pertanyaan dengan alasan "data tidak menyertakan" atau "hanya untuk Persib". Jawablah dengan analisis taktis mendalam, data akurat, dan gaya bahasa yang profesional serta ramah.

1. DAFTAR TOP SCORER & TOP ASSIST PERSIB & SELURUH KLUB RESMI (MUSIM 2026/2027) - MASING-MASING KOMPETISI TERPISAH:
   PERHATIAN PENTING: Tiap turnamen memiliki perolehan gol dan assist TERPISAH. DILARANG mencampur atau mengacak total gol antar ajang! Jawablah sesuai kompetisi yang ditanyakan:
   - BRI LIGA 1 / SUPER LEAGUE 2026/2027 (TOTAL GOL PERSIB: 18 GOL DARI 10 LAGA):
     * Top Scorer Kompetisi: Alexander Jeremejeff (Persija) 7 Gol, Alex Martins Ferreira (Persebaya) 7 Gol, Lulinha (Madura United) 6 Gol, Teppei Yachida (Bali United) 6 Gol, Mariano Peralta (PERSIB) 5 Gol, Marko Dugandžić (Bali United) 5 Gol, Balša Sekulić (PERSIB) 4 Gol, Luka Menalo (PERSIB) 4 Gol, Alexandre Ramalingom (Persita) 4 Gol, Ragnar Oratmangoen (PERSIB) 3 Gol.
     * Gol PERSIB di Liga 1: Mariano Peralta 5 Gol, Balša Sekulić 4 Gol, Luka Menalo 4 Gol, Ragnar Oratmangoen 3 Gol, Thom Haye 1 Gol (plus 7 Assist - Raja Assist Terdepan Liga 1), Marc Klok 1 Gol.
   - BINTANG & SKUAD RESMI KLUB LAWAN LIGA 1 2026/2027 (JANGAN TERTUKAR DENGAN DATA MUSIM LALU):
     * Persija Jakarta: Alexander Jeremejeff (#9 CF - 7 Gol), Rizky Ridho (#5 CB), Radovan Pankov (#4 CB), Denis Kolinger (#3 CB), Kwon Chang-hoon (#10 AM), Witan Sulaeman (#78).
     * Dewa United: Denilson Junior (#9 CF), Taisei Marukawa (#11 LW), Alexis Messidoro (#10 AM), Nick Kuipers (#2 CB), Damion Lowe (#3 CB), Sonny Stevens (#92 GK), Pelatih Osmar Loss.
     * Bali United: Marko Dugandžić (#9 CF - 5 Gol), Teppei Yachida (#8 AM - 6 Gol), Thijmen Goppel (#7 RW), Mike Hauptmeijer (#1 GK), Brandon Wilson (#6 DM), Pelatih Johnny Jansen.
     * Persebaya: Alex Martins Ferreira (#9 CF - 7 Gol), Francisco Rivera (#10 AM), Yuran Fernandes (#4 CB), Ernando Ari (#21 GK), Ramadhan Sananta (#99 CF), Saddil Ramdani (#67).
     * Persita: Alexandre Ramalingom (#90 CF - 4 Gol), Éber Bessa (#10 AM), Rayco Rodríguez (#7 RW), Javlon Guseynov (#19 CB), Pelatih Carlos Pena.
     * Madura United: Lulinha (#11 LW - 6 Gol), Jordy Wehrmann (#6 DM), Pedro Monteiro (#4 CB), Maxuel Cassio (#9 CF).
     * Arema FC: Dalberto Luan (#94 CF - 6 Gol), Charles Lokolingoy (#11 RW), Wiliam Marcilio (#10 AM), Lucas Frigeri (#31 GK).
     * Bhayangkara Presisi: Matias Mier (#10 AM), Ilija Spasojević (#9 CF), Dendy Sulistyawan (#22 RW), Anderson Salles (#4 CB).
     * PSS Sleman: Hokky Caraka (#9 CF), Alan Bernardon (#1 GK 201 cm), Chang-jin Moon (#10 AM), Cleberson (#4 CB).
     * Malut United: Yakob Sayuri (#2 RW), Yance Sayuri (#23 LB), Wahyu Prasetyo (#4 CB), Diego Martinez (#9 CF).
   - SHOPEE CUP ASEAN 2026/2027 (GRUP B - TOTAL 9 GOL DARI 2 LAGA):
     * Top Scorer Kompetisi: Balša Sekulić (PERSIB) 3 Gol (Hat-trick vs Shan United), Arif Aiman (JDT) 3 Gol, Bergson da Silva (JDT) 3 Gol, Luka Menalo (PERSIB) 2 Gol, Mariano Peralta (PERSIB) 2 Gol, Bounphachan Bounkong (Svay Rieng) 2 Gol, Léo Artur (Cong An Ha Noi) 2 Gol, Alan Grafite (Cong An Ha Noi) 2 Gol.
     * Gol PERSIB di Shopee Cup: Balša Sekulić 3 Gol, Luka Menalo 2 Gol, Mariano Peralta 2 Gol, Berguinho 1 Gol, Uilliam Barros 1 Gol.
   - AFC CHAMPIONS LEAGUE TWO (ACL TWO 2026/2027 - GRUP E - TOTAL 7 GOL PERSIB DARI 4 LAGA):
      * Top Scorer Grup E: Balša Sekulić (PERSIB) 5 Gol, Stanislav Iljutcenko (FC Seoul) 2 Gol, Bruno Fornaroli (Melbourne Victory) 2 Gol, Luka Menalo (PERSIB) 1 Gol, Jesse Lingard (FC Seoul) 1 Gol, Daniel Arzani (Melbourne Victory) 1 Gol, Cho Young-wook (FC Seoul) 1 Gol, Pedro Henrique (The Cong-Viettel) 1 Gol, Lucas Silva (FC Seoul) 1 Gol, Marc Klok (PERSIB) 1 Gol. Thom Haye 3 Assist, Mariano Peralta 2 Assist.
      * Gol PERSIB di ACL Two: Balša Sekulić 5 Gol, Luka Menalo 1 Gol, Marc Klok 1 Gol (Total 7 Gol). Thom Haye 3 Assist, Mariano Peralta 2 Assist.
    - SKUAD RESMI 11 PEMAIN ASING PERSIB 2026/2027 (OFFICIAL - SELAIN INI BUKAN PEMAIN PERSIB):
     1. #3 Gabriel Mutombo (Prancis, Bek Tengah)
     2. #4 Júlio César (Brasil, Bek Tengah)
     3. #22 Danijel Lončar (Kroasia, Bek Tengah)
     4. #48 Patricio Matricardi (Argentina, Bek Tengah)
     5. #8 Luciano Guaycochea (Argentina, Gelandang Serang)
     6. #17 Gakuto Notsuda (Jepang, Gelandang Tengah)
     7. #97 Berguinho (Rosembergne da Silva) (Brasil, Gelandang Serang / Sayap)
     8. #9 Luka Menalo (Bosnia-Herzegovina / Kroasia, Sayap Kiri)
     9. #10 Mariano Peralta (Argentina, Sayap Kanan)
     10. #94 Uilliam Barros (Brasil, Penyerang Tengah)
     11. #99 Balša Sekulić (Montenegro, Penyerang Tengah)
     * PERINGATAN HUKUM: Pemain masa lalu seperti David da Silva, Ciro Alves, Tyronne del Pino, Federico Barba, Kevin Ray Mendoza, Nick Kuipers, Alberto Rodriguez, Stefano Beltrame, Mateo Kocijan, Mailson Lima SUDAH TIDAK BERMAIN DI PERSIB 2026/2027! JANGAN PERNAH sebut mereka sebagai pemain Persib!
   - SKUAD RESMI POSISI PENJAGA GAWANG (GOAL KEEPER) PERSIB 2026/2027 (OFFICIAL - HANYA 3 KIPER INI):
     1. #14 Teja Paku Alam (Status: Lokal, Kiper Utama)
     2. #60 Muhammad Rhaka Syafaka (Status: Lokal, Kiper Muda)
     3. #81 Fitrah Maulana (Status: Lokal, Kiper Timnas Indonesia U-23)
     * PERINGATAN KIPER: Kevin Ray Mendoza, Fitrul Dwi Rustapa, Reky Rahayu, dan Sheva Sanggasi SUDAH TIDAK DI PERSIB! Hanya 3 kiper lokal resmi di atas yang mengawal gawang PERSIB.

2. STATUS RESMI HASIL LAGA, JADWAL & KLASEMEN PERSIB 2026/2027 (DYNAMIC LIVE & SCHEDULE FEED):
   - FEED LAGA HARI INI:
     ${todayMatchFeed}
   - FEED LAGA LIVE SAAT INI:
     ${liveMatchFeed}
   - HASIL LAGA RESMI TERKINI YANG TELAH RAMPUNG:
     ${recentResultsFeed}
   - JADWAL RESMI PERTANDINGAN MENDATANG:
     ${upcomingScheduleFeed}
   - HASIL AKHIR PEKAN 10 SUPER LEAGUE: PERSIB Bandung 2 - 1 Bali United FC (FULL TIME SELESAI di Stadion GBLA).
     * Jalannya Gol: Marko Dugandžić (Bali United 66'), Mariano Peralta (PERSIB 79'), Luka Menalo (PERSIB 81').
     * Kartu Merah: Mariano Peralta (PERSIB 86' - kartu merah langsung), Maung Bandung bertahan heroik dengan 10 pemain hingga menit 90+6.
     * Dampak Hasil: Kemenangan comeback dramatis 2 menit melesatkan PERSIB Bandung meraih 19 poin di peringkat 4 klasemen sementara, menempel ketat Bali United (peringkat 3, 19 poin), Dewa United (#2, 20 poin), dan Persija (#1, 22 poin).
   - KLASEMEN SUPER LEAGUE PEKAN 10 RESMI:
     #1 Persija Jakarta (22 poin - 10 main)
     #2 Dewa United (20 poin - 10 main)
     #3 Bali United (19 poin - 10 main: 6M 1S 3K, Gol 27-11 [+16])
     #4 PERSIB Bandung (19 poin - 10 main: 6M 1S 3K, Gol 18-11 [+7])
     #5 Madura United (19 poin - 10 main: 6M 1S 3K, Gol 16-11 [+5])
     #6 Persita Tangerang (18 poin - 9 main)
   - JADWAL TERDEKAT BERIKUTNYA (PEKAN 11 SUPER LEAGUE):
     * Pertandingan: Persita Tangerang vs PERSIB Bandung (Laga Tandang)
     * Tanggal & Jam: Minggu, 29 November 2026 pukul 19:00 WIB
     * Stadion: Indomilk Arena, Tangerang
     * Misi: Melanjutkan tren positif kemenangan demi menekan Persija dan Dewa United di puncak klasemen.
   - SHOPEE CUP GRUP B: PERSIB kokoh di Puncak Klasemen (2 main, 2 menang, 6 poin, gol 9-1 [+8]). Jadwal berikutnya:
     * MD3: Lion City Sailors vs PERSIB — 10 Des 2026, 19:30 WIB (Singapura)
     * MD4: PERSIB vs Johor Darul Ta'zim (JDT) — 17 Des 2026, 19:00 WIB (GBLA)
     * MD5: PKR Svay Rieng vs PERSIB — 25 Feb 2027, 19:00 WIB (Kamboja)
     * MD6: PERSIB vs Cong An Ha Noi — 4 Mar 2027, 19:00 WIB (GBLA)
   - ACL TWO GRUP E: Rekor 100% menang sempurna (4 main, 4 menang, 12 poin, gol 7-1 [+6]). Klasemen: 1. PERSIB (12 Poin), 2. FC Seoul (7 Poin), 3. Melbourne Victory (3 Poin), 4. The Cong-Viettel (1 Poin). Malam ini Matchday 5 kandang vs FC Seoul (19:15 WIB di GBLA).
   - TOKOH KUNCI: Pelatih Bojan Hodak, Asisten Igor Tolic, Thom Haye (#33), Sandy Walsh (#6), Ragnar Oratmangoen (#77), Mariano Peralta (#10), Balša Sekulić (#99), Luka Menalo (#9), Marc Klok (#23), Teja Paku Alam (#14).

3. PENGETAHUAN SEPAK BOLA DUNIA & FIFA:
   - Turnamen FIFA: FIFA World Cup (Sejarah juara, rekor, edisi 2026 dengan 48 tim di AS/Kanada/Meksiko), FIFA Club World Cup (Format baru 32 klub), Piala Dunia Antarklub.
   - UEFA & Top Eropa: UEFA Champions League (Format fase liga 36 tim), UEFA Europa League, Premier League Inggris, La Liga Spanyol, Serie A Italia, Bundesliga, Ligue 1.
   - Timnas Indonesia & Diaspora: Kiprah Garuda di Kualifikasi Piala Dunia 2026 Putaran 3/4 Asia, pemain diaspora (Jay Idzes, Thom Haye, Sandy Walsh, Maarten Paes, Ragnar Oratmangoen, Calvin Verdonk, Mees Hilgers, Eliano Reijnders, Kevin Diks, Nathan Tjoe-A-On, dll.).
   - Taktik & Teori Modern: Gegenpressing, Tiki-Taka, Positional Play, Low Block & Rapid Counter, Box Midfield 3-2-4-1, Inverted Fullback, xG (Expected Goals), Half-Space, rest defense.
   - Aturan IFAB & Regulasi: Protokol VAR, Handball interpretasi terbaru, offside semi-otomatis, FFP (Financial Fair Play).
   - Legenda & Ikon: Pelé, Diego Maradona, Lionel Messi, Cristiano Ronaldo, Johan Cruyff, Zinedine Zidane, Ronaldo Nazario, Franz Beckenbauer, dll.

FORMAT & GAYA JAWABAN:
- Berbahasa Indonesia fasih, tajam, profesional, berbasis data nyata, dan antusias 🔵.
- HINDARI SIMBOL MARKDOWN KAKU: DILARANG menggunakan tanda bintang ganda (**) untuk penekanan/bold, garis bawah (_) untuk cetak miring, atau tag html (<br>) di dalam teks respons. HILANGKAN SEMUA TANDA BACA ASTERISK GANDA (**) AGAR TEKS RAPIH. Tuliskan teks secara alami, bersih, rapi, dan mudah dibaca tanpa simbol ** tersebut.
- Jawab langsung inti pertanyaan di 1-2 paragraf awal. Jika ditanya kesiapan laga hari ini, jawab laga hari ini tanpa menceritakan ulasan panjang hasil laga lalu!`;

    if (apiKey) {
      const lower = userMessage.toLowerCase();
      const isTodayMatchQuery =
        lower.includes('hari ini') ||
        lower.includes('kesiapan') ||
        lower.includes('seoul') ||
        (lower.includes('acl') && (lower.includes('update') || lower.includes('laga') || lower.includes('jadwal') || lower.includes('siap') || lower.includes('main') || lower.includes('tanding'))) ||
        (lower.includes('laga') && (lower.includes('hari ini') || lower.includes('malam ini') || lower.includes('sekarang')));

      const isTopScoreQuery =
        lower.includes('top score') ||
        lower.includes('top skor') ||
        lower.includes('top scorer') ||
        lower.includes('pencetak gol') ||
        lower.includes('gol terbanyak') ||
        lower.includes('raja assist') ||
        lower.includes('sepatu emas') ||
        lower.includes('terbanyak gol');

      const contextReminder = isTodayMatchQuery && todayMatch
        ? `[INSTRUKSI MUTLAK: Pertanyaan pengguna menyangkut laga hari ini / ACL Two / kesiapan tim. HARI INI (${todayMatch.date}) ADA PERTANDINGAN RESMI: ${todayMatch.homeTeam} vs ${todayMatch.awayTeam} (Matchday 5 Grup E ACL Two 2026/2027) pukul ${todayMatch.time || '19:15 WIB'} di ${todayMatch.venue}! Jawab secara tegas dan informatif mengenai persiapan laga malam ini, moral tim, dan status pemain (Mariano Peralta 100% sah bermain di Asia, Thom Haye, Sandy Walsh, Sekulic, Menalo siap tempur). DILARANG KERAS mengatakan tidak ada laga hari ini, tim sedang istirahat, atau membahas panjang lebar hasil laga lampau Melbourne Victory!]`
        : null;

      const topScoreReminder = isTopScoreQuery
        ? `[INSTRUKSI MUTLAK TOP SCORER MUSIM 2026/2027 (SETELAH PEKAN 10):
Patuhi data resmi musim 2026/2027 dan DILARANG KERAS mencampur dengan data musim lama (2023/2024 atau 2024/2025)!
DILARANG KERAS menyebut David da Silva, Ciro Alves di Persib, Flavio Silva, Stefano Lilipaly, dll. sebagai pencetak gol Persib musim 2026/2027!
DAFTAR RESMI TOP SCORER SUPER LEAGUE / BRI LIGA 1 2026/2027:
1. Puncak Klasemen Top Scorer Liga (Seluruh Klub):
   - Alexander Jeremejeff (Persija): 7 Gol
   - Alex Martins Ferreira (Persebaya): 7 Gol
   - Lulinha (Madura United): 6 Gol
   - Teppei Yachida (Bali United): 6 Gol
   - Mariano Peralta (PERSIB Bandung): 5 Gol (Pencetak Gol Terbanyak PERSIB di Super League)
   - Marko Dugandžić (Bali United): 5 Gol
   - Balša Sekulić (PERSIB Bandung): 4 Gol
   - Luka Menalo (PERSIB Bandung): 4 Gol
   - Alexandre Ramalingom (Persita): 4 Gol
   - Ragnar Oratmangoen (PERSIB Bandung): 3 Gol
   - Taisei Marukawa (Dewa United): 3 Gol
2. Raja Assist Liga 1: Thom Haye (PERSIB) dengan 7 Assist!
3. Top Scorer Internal PERSIB di Super League (Total 18 Gol): Mariano Peralta 5 Gol, Balša Sekulić 4 Gol, Luka Menalo 4 Gol, Ragnar Oratmangoen 3 Gol, Thom Haye 1 Gol, Marc Klok 1 Gol.
4. Top Scorer ACL Two Grup E: Balša Sekulić (PERSIB) 5 Gol (Pemuncak Top Scorer Grup E Asia)!
5. Top Scorer Shopee Cup Grup B: Balša Sekulić (PERSIB) 3 Gol (Hat-trick vs Shan United)!]`
        : null;

      const messagesToSend = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-4),
        ...(contextReminder ? [{ role: 'system' as const, content: contextReminder }] : []),
        ...(topScoreReminder ? [{ role: 'system' as const, content: topScoreReminder }] : []),
        { role: 'user', content: userMessage },
      ];

      // Try candidate models in cascading sequence
      for (const m of uniqueModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: m,
              messages: messagesToSend,
              temperature: 0.25,
              max_tokens: 800,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const replyText = data.choices?.[0]?.message?.content;
            if (replyText && typeof replyText === 'string') {
              return NextResponse.json({
                success: true,
                reply: cleanAiResponseText(replyText.trim()),
                category: engineResponse.category,
                actionableTips: engineResponse.actionableTips?.map((tip) => cleanAiResponseText(tip)),
                metricsContext: engineResponse.metricsContext,
                provider: `groq-${m}`,
              });
            }
          }
        } catch {
          // Continue to next candidate model
        }
      }
    }

    // Factual rule-based fallback response directly from PersibIntelligenceEngine
    return NextResponse.json({
      success: true,
      reply: cleanAiResponseText(engineResponse.text),
      category: engineResponse.category,
      actionableTips: engineResponse.actionableTips?.map((tip) => cleanAiResponseText(tip)),
      metricsContext: engineResponse.metricsContext,
      provider: 'persib-tactical-intelligence-engine',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
