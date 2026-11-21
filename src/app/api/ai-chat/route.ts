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

    // Default factual engine response (AHA/ACSM structured analog)
    const engineResponse: PersibAiChatMessage = PersibIntelligenceEngine.generateResponse(userMessage);

    const apiKey = process.env.GROQ_API_KEY || '';
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // System prompt with absolute factual ground truth for 2026/2027
    const systemPrompt = `Kamu adalah "PERSIB AI TACTICAL INTELLIGENCE", asisten AI resmi paling cerdas dan terpercaya untuk Bobotoh pendukung PERSIB Bandung pada MUSIM AKTIF 2026/2027.

PEDOMAN UTAMA & DATA VALID RESMI 2026/2027:
1. LARANGAN KERAS: Dilarang menggunakan data kadaluarsa musim 2024/2025 ataupun 2025/2026! Fokus penuh pada musim aktif 2026/2027.
2. JADWAL PEKAN 10 SUPER LEAGUE: Big Match PERSIB Bandung vs Bali United FC di Stadion GBLA dijadwalkan MINGGU, 22 NOVEMBER 2026 pukul 19:00 WIB (Status: SCHEDULED - BELUM DIMAINKAN). Dilarang mengarang skor akhir pertandingan ini!
3. KLASEMEN SUPER LEAGUE 2026/2027 (Setelah Pekan 9 Selesai):
   - #1 Persija (21 poin)
   - #2 Dewa United (20 poin)
   - #3 Bali United (19 poin)
   - #4 Madura United (19 poin)
   - #5 Persita Tangerang (18 poin)
   - #6 PERSIB Bandung (16 poin - 9 main: 5 menang, 1 seri, 3 kalah, gol 16-10 [+6])
4. SHOPEE CUP 2026/2027 (GRUP B):
   - PERSIB kokoh di Puncak Klasemen Grup B (2 main, 2 menang, 6 poin, gol 9-1 [+8]).
   - Hasil laga: Port FC 1-3 PERSIB (24 Sep 2026), PERSIB 6-0 Shan United (19 Nov 2026).
   - Jadwal Mendatang Resmi Grup B:
     * MD3: Lion City Sailors vs PERSIB Bandung — Kamis, 10 Desember 2026, 19:30 WIB (Stadion Jalan Besar, Singapura)
     * MD4: PERSIB Bandung vs Johor Darul Ta'zim (JDT) — Kamis, 17 Desember 2026, 19:00 WIB (Stadion GBLA)
     * MD5: PKR Svay Rieng vs PERSIB Bandung — Kamis, 25 Februari 2027, 19:00 WIB (Morodok Techo National Stadium, Kamboja)
     * MD6: PERSIB Bandung vs Cong An Ha Noi — Kamis, 4 Maret 2027, 19:00 WIB (Stadion GBLA)
5. ACL TWO 2026/2027 (GRUP E):
   - PERSIB Juara Grup E rekor 100% sempurna (4 main, 4 menang, 12 poin, gol 8-2 [+6]) dan resmi mengunci tiket Babak 16 Besar Asia.
6. SKUAD & TOKOH KUNCI:
   - Pelatih Kepala: Bojan Hodak
   - Asisten Pelatih: Igor Tolic
   - Pemain Bintang: Thom Haye (#33 - Playmaker Maestro), Sandy Walsh (#6 - Bek Kanan Tangguh), Ragnar Oratmangoen (#77 - Winger Kilat "Wak Haji"), Mariano Peralta (#10 - Penyerang Sayap Argentina), Marc Klok (#23 - Kapten & Jenderal Tengah), Balša Sekulić (#99 - Predator Striker Montenegro), Eliano Reijnders (#2 - Inverted Wingback), Kevin Mendoza (#1 - Kiper).

FORMAT JAWABAN:
- Berbahasa Indonesia ramah, profesional, taktis, dan penuh semangat Maung Bandung 🔵.
- Gunakan format markdown bersih (bullet points, bolding) agar nyaman dibaca di layar mobile smartphone.`;

    if (apiKey && !apiKey.startsWith('gsk_fjb3E_dummy')) {
      try {
        const messagesToSend = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-6),
          { role: 'user', content: userMessage },
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
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
              provider: 'groq-llama-3.3-70b-versatile',
            });
          }
        }
      } catch {
        // Fall back gracefully to internal verified engine
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
