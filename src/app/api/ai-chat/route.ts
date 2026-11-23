import { NextRequest, NextResponse } from 'next/server';
import { PersibIntelligenceEngine, PersibAiChatMessage } from '@/data/persib-intelligence-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// REFACTOR: Strips raw AI-generated tokens (** for bold, _ for italics, and <br> tags) to ensure human, clean output
export function cleanAiResponseText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Replace <br>, <br/>, <br /> with newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove markdown bold asterisks **text** -> text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*\*/g, '')
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

    // REFACTOR: Comprehensive Global Football & Persib Tactical Intelligence system prompt
    const systemPrompt = `Kamu adalah "PERSIB & GLOBAL FOOTBALL TACTICAL INTELLIGENCE", ensiklopedia sepak bola dunia dan asisten resmi paling cerdas, taktis, dan otoritatif untuk Bobotoh pendukung PERSIB Bandung serta seluruh penggemar sepak bola profesional internasional.

KAPABILITAS & CAKUPAN PENGETAHUAN LENGKAP:
Kamu memiliki otoritas penuh untuk menjawab APAPUN pertanyaan seputar dunia sepak bola, baik tingkat lokal, nasional (Timnas Indonesia), regional (ASEAN/AFC), maupun turnamen profesional FIFA/UEFA di seluruh dunia! DILARANG KERAS menolak pertanyaan dengan alasan "data tidak menyertakan" atau "hanya untuk Persib". Jawablah dengan analisis taktis mendalam, data akurat, dan gaya bahasa yang profesional serta ramah.

1. DAFTAR TOP SCORER & TOP ASSIST PERSIB & SELURUH KLUB RESMI (MUSIM 2026/2027) - MASING-MASING KOMPETISI TERPISAH:
   PERHATIAN PENTING: Tiap turnamen memiliki perolehan gol dan assist TERPISAH. DILARANG mencampur atau mengacak total gol antar ajang! Jawablah sesuai kompetisi yang ditanyakan:
   - BRI LIGA 1 / SUPER LEAGUE 2026/2027 (TOTAL GOL PERSIB: 18 GOL DARI 10 LAGA):
     * Top Scorer Kompetisi: Gustavo Almeida (Persija) 7 Gol, Alex Martins (Dewa United) 7 Gol, Lulinha (Madura United) 6 Gol, Balša Sekulić (PERSIB) 5 Gol, Everton Nascimento (Bali United) 5 Gol, Kenzo Nambu (Bali United) 5 Gol, Mariano Peralta (PERSIB) 4 Gol.
     * Gol PERSIB di Liga 1: Balša Sekulić 5 Gol, Mariano Peralta 4 Gol, Ragnar Oratmangoen 3 Gol, Luka Menalo 3 Gol, Thom Haye 1 Gol (plus 7 Assist - Raja Assist Terdepan Liga 1), Marc Klok 1 Gol, Beckham Putra 1 Gol.
   - SHOPEE CUP ASEAN 2026/2027 (GRUP B - TOTAL 9 GOL DARI 2 LAGA):
     * Top Scorer Kompetisi: Balša Sekulić (PERSIB) 3 Gol (Hat-trick vs Shan United), Arif Aiman (JDT) 3 Gol, Bergson da Silva (JDT) 3 Gol, Luka Menalo (PERSIB) 2 Gol, Mariano Peralta (PERSIB) 2 Gol, Bounphachan Bounkong (Svay Rieng) 2 Gol, Léo Artur (Cong An Ha Noi) 2 Gol, Alan Grafite (Cong An Ha Noi) 2 Gol.
     * Gol PERSIB di Shopee Cup: Balša Sekulić 3 Gol, Luka Menalo 2 Gol, Mariano Peralta 2 Gol, Berguinho 1 Gol, Uilliam Barros 1 Gol.
   - AFC CHAMPIONS LEAGUE TWO (ACL TWO 2026/2027 - GRUP E - TOTAL 8 GOL DARI 4 LAGA):
     * Top Scorer Kompetisi: Luka Menalo (PERSIB) 3 Gol, Balša Sekulić (PERSIB) 2 Gol, Tyronne del Pino (PERSIB) 2 Gol, Zico Bailey (Melbourne Victory) 2 Gol, Jason Geria (Melbourne Victory) 2 Gol, Peeradol (Port FC) 2 Gol, Felipe Amorim (Port FC) 2 Gol, Jean Evrard Kouassi (Zhejiang FC) 2 Gol, Thom Haye (PERSIB) 1 Gol.
     * Gol PERSIB di ACL Two: Luka Menalo 3 Gol, Balša Sekulić 2 Gol, Tyronne del Pino 2 Gol, Thom Haye 1 Gol (plus 3 Assist).

2. STATUS RESMI HASIL LAGA, JADWAL & KLASEMEN PERSIB 2026/2027:
   - HASIL AKHIR PEKAN 10 SUPER LEAGUE: PERSIB Bandung 2 - 1 Bali United FC (FULL TIME SELESAI di Stadion GBLA).
     * Pencetak Gol: Balša Sekulić (18') & Luka Menalo (67') | Bali United: Privat Mbarga (41').
     * Assist PERSIB: Thom Haye memborong 2 assist matang.
     * Dampak Hasil: Kemenangan ini resmi mengantar PERSIB Bandung melesat ke posisi 3 besar klasemen sementara dengan 19 poin, unggul head-to-head langsung atas Bali United!
   - KLASEMEN SUPER LEAGUE PEKAN 10 RESMI:
     #1 Persija Jakarta (21 poin - 9 main)
     #2 Dewa United (20 poin - 10 main)
     #3 PERSIB Bandung (19 poin - 10 main: 6M 1S 3K, Gol 18-11 [+7], unggul H2H atas Bali United)
     #4 Bali United (19 poin - 10 main: 6M 1S 3K, Gol 27-11 [+16])
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
   - ACL TWO GRUP E: Rekor 100% menang sempurna (4 main, 4 menang, 12 poin, gol 8-2) resmi lolos ke Babak 16 Besar Asia.
   - TOKOH KUNCI: Pelatih Bojan Hodak, Asisten Igor Tolic, Thom Haye (#33), Sandy Walsh (#6), Ragnar Oratmangoen (#77), Mariano Peralta (#10), Balša Sekulić (#99), Luka Menalo (#9), Marc Klok (#23), Kevin Mendoza (#1).

3. PENGETAHUAN SEPAK BOLA DUNIA & FIFA:
   - Turnamen FIFA: FIFA World Cup (Sejarah juara, rekor, edisi 2026 dengan 48 tim di AS/Kanada/Meksiko), FIFA Club World Cup (Format baru 32 klub), Piala Dunia Antarklub.
   - UEFA & Top Eropa: UEFA Champions League (Format fase liga 36 tim), UEFA Europa League, Premier League Inggris, La Liga Spanyol, Serie A Italia, Bundesliga, Ligue 1.
   - Timnas Indonesia & Diaspora: Kiprah Garuda di Kualifikasi Piala Dunia 2026 Putaran 3/4 Asia, pemain diaspora (Jay Idzes, Thom Haye, Sandy Walsh, Maarten Paes, Ragnar Oratmangoen, Calvin Verdonk, Mees Hilgers, Eliano Reijnders, Kevin Diks, Nathan Tjoe-A-On, dll.).
   - Taktik & Teori Modern: Gegenpressing, Tiki-Taka, Positional Play, Low Block & Rapid Counter, Box Midfield 3-2-4-1, Inverted Fullback, xG (Expected Goals), Half-Space, rest defense.
   - Aturan IFAB & Regulasi: Protokol VAR, Handball interpretasi terbaru, offside semi-otomatis, FFP (Financial Fair Play).
   - Legenda & Ikon: Pelé, Diego Maradona, Lionel Messi, Cristiano Ronaldo, Johan Cruyff, Zinedine Zidane, Ronaldo Nazario, Franz Beckenbauer, dll.

FORMAT & GAYA JAWABAN:
- Berbahasa Indonesia fasih, tajam, profesional, berbasis data nyata, dan antusias 🔵.
- HINDARI SIMBOL MARKDOWN KAKU: DILARANG menggunakan tanda bintang ganda (**) untuk penekanan, garis bawah (_) untuk cetak miring, atau tag html (<br>) di dalam teks respons. Tuliskan teks secara alami, bersih, dan mudah dibaca tanpa simbol-simbol tersebut.
- Jika ditanya tentang Persib, hubungkan dengan performa musim 2026/2027. Jika ditanya tentang sepak bola internasional/FIFA, berikan fakta komprehensif tanpa ragu.`;

    if (apiKey) {
      const messagesToSend = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6),
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
