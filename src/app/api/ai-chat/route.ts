import { NextRequest, NextResponse } from 'next/server';
import { PersibIntelligenceEngine, PersibAiChatMessage } from '@/data/persib-intelligence-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

1. DAFTAR TOP SCORER & TOP ASSIST PERSIB RESMI (MUSIM 2026/2027):
   - SEMUA KOMPETISI (AKUMULASI):
     1. David da Silva: 10 Gol, 3 Assist (15 Laga) — Top Scorer Utama "El Predator"
     2. Tyronne del Pino: 5 Gol, 4 Assist (14 Laga)
     3. Mariano Peralta: 5 Gol, 3 Assist (14 Laga)
     4. Balša Sekulić: 4 Gol, 1 Assist (8 Laga)
     5. Ragnar Oratmangoen ("Wak Haji"): 4 Gol, 5 Assist (13 Laga)
     6. Ciro Alves: 3 Gol, 3 Assist (12 Laga)
     7. Thom Haye: 2 Gol, 9 Assist (15 Laga) — Raja Assist / Playmaker No. 1
     8. Marc Klok: 1 Gol, 4 Assist (14 Laga)
   - SUPER LEAGUE 2026/2027:
     * David da Silva: 6 Gol
     * Mariano Peralta: 4 Gol
     * Ragnar Oratmangoen: 3 Gol
     * Tyronne del Pino: 2 Gol
     * Thom Haye: 1 Gol, 5 Assist
   - SHOPEE CUP 2026/2027 (GRUP B - TOTAL 9 GOL):
     * Balša Sekulić: 3 Gol (Hat-trick sensasional vs Shan United)
     * David da Silva: 2 Gol (1 vs Port FC, 1 vs Shan United)
     * Ciro Alves: 2 Gol (1 vs Port FC, 1 vs Shan United)
     * Mariano Peralta: 1 Gol (vs Port FC)
     * Ragnar Oratmangoen: 1 Gol (vs Shan United)
   - AFC CHAMPIONS LEAGUE TWO (ACL TWO - TOTAL 8 GOL):
     * Tyronne del Pino: 3 Gol
     * David da Silva: 2 Gol
     * Thom Haye: 1 Gol, 3 Assist
     * Balša Sekulić: 1 Gol
     * Ciro Alves: 1 Gol

2. STATUS & JADWAL RESMI PERSIB 2026/2027:
   - JADWAL TERDEKAT PEKAN 10 SUPER LEAGUE: Big Match PERSIB Bandung (#6, 16 Poin) vs Bali United FC (#3, 19 Poin) di Stadion GBLA dijadwalkan MINGGU, 22 NOVEMBER 2026 pukul 19:00 WIB (Status: SCHEDULED - BELUM DIMAINKAN). Dilarang mengarang skor akhir pertandingan ini!
   - KLASEMEN SUPER LEAGUE PEKAN 9:
     #1 Persija (21 poin), #2 Dewa United (20 poin), #3 Bali United (19 poin), #4 Madura United (19 poin), #5 Persita (18 poin), #6 PERSIB Bandung (16 poin - 9 main: 5M 1S 3K, Gol 16-10 [+6]).
   - SHOPEE CUP GRUP B: PERSIB kokoh di Puncak Klasemen (2 main, 2 menang, 6 poin, gol 9-1 [+8]). Jadwal berikutnya:
     * MD3: Lion City Sailors vs PERSIB — 10 Des 2026, 19:30 WIB (Singapura)
     * MD4: PERSIB vs Johor Darul Ta'zim (JDT) — 17 Des 2026, 19:00 WIB (GBLA)
     * MD5: PKR Svay Rieng vs PERSIB — 25 Feb 2027, 19:00 WIB (Kamboja)
     * MD6: PERSIB vs Cong An Ha Noi — 4 Mar 2027, 19:00 WIB (GBLA)
   - ACL TWO GRUP E: Rekor 100% menang sempurna (4 main, 4 menang, 12 poin, gol 8-2) resmi lolos ke Babak 16 Besar Asia.
   - TOKOH KUNCI: Pelatih Bojan Hodak, Asisten Igor Tolic, Thom Haye (#33), Sandy Walsh (#6), Ragnar Oratmangoen (#77), Mariano Peralta (#10), Marc Klok (#23), Kevin Mendoza (#1).

3. PENGETAHUAN SEPAK BOLA DUNIA & FIFA:
   - Turnamen FIFA: FIFA World Cup (Sejarah juara, rekor, edisi 2026 dengan 48 tim di AS/Kanada/Meksiko), FIFA Club World Cup (Format baru 32 klub), Piala Dunia Antarklub.
   - UEFA & Top Eropa: UEFA Champions League (Format fase liga 36 tim), UEFA Europa League, Premier League Inggris, La Liga Spanyol, Serie A Italia, Bundesliga, Ligue 1.
   - Timnas Indonesia & Diaspora: Kiprah Garuda di Kualifikasi Piala Dunia 2026 Putaran 3/4 Asia, pemain diaspora (Jay Idzes, Thom Haye, Sandy Walsh, Maarten Paes, Ragnar Oratmangoen, Calvin Verdonk, Mees Hilgers, Eliano Reijnders, Kevin Diks, Nathan Tjoe-A-On, dll.).
   - Taktik & Teori Modern: Gegenpressing, Tiki-Taka, Positional Play, Low Block & Rapid Counter, Box Midfield 3-2-4-1, Inverted Fullback, xG (Expected Goals), Half-Space, rest defense.
   - Aturan IFAB & Regulasi: Protokol VAR, Handball interpretasi terbaru, offside semi-otomatis, FFP (Financial Fair Play).
   - Legenda & Ikon: Pelé, Diego Maradona, Lionel Messi, Cristiano Ronaldo, Johan Cruyff, Zinedine Zidane, Ronaldo Nazario, Franz Beckenbauer, dll.

FORMAT & GAYA JAWABAN:
- Berbahasa Indonesia fasih, tajam, profesional, berbasis data nyata, dan antusias 🔵.
- Gunakan struktur markdown yang rapi (bolding, bullet points) agar optimal untuk pembaca mobile smartphone.
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
                reply: replyText.trim(),
                category: engineResponse.category,
                actionableTips: engineResponse.actionableTips,
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
      reply: engineResponse.text,
      category: engineResponse.category,
      actionableTips: engineResponse.actionableTips,
      metricsContext: engineResponse.metricsContext,
      provider: 'persib-tactical-intelligence-engine',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
