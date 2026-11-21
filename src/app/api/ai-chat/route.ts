import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Fallback intelligence engine when offline or network fails
function generateFactualFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('jadwal') || q.includes('kapan') || q.includes('laga terdekat') || q.includes('lawan')) {
    if (q.includes('shopee') || q.includes('asean')) {
      return `📅 **Jadwal Resmi PERSIB Bandung di Shopee Cup 2026/2027 (Grup B):**\n\n` +
        `1. **Matchday 3 (Tandang):** Lion City Sailors vs PERSIB Bandung — **Kamis, 10 Desember 2026, 19:30 WIB** (Stadion Jalan Besar, Singapura)\n` +
        `2. **Matchday 4 (Kandang):** PERSIB Bandung vs Johor Darul Ta'zim — **Kamis, 17 Desember 2026, 19:00 WIB** (Stadion GBLA, Bandung)\n` +
        `3. **Matchday 5 (Tandang):** PKR Svay Rieng vs PERSIB Bandung — **Kamis, 25 Februari 2027, 19:00 WIB** (Morodok Techo National Stadium, Kamboja)\n` +
        `4. **Matchday 6 (Kandang):** PERSIB Bandung vs Cong An Ha Noi — **Kamis, 4 Maret 2027, 19:00 WIB** (Stadion GBLA, Bandung)`;
    }
    return `🏆 **Laga Terdekat PERSIB Bandung:**\n\n` +
      `* **Super Big Match Super League Pekan 10:** PERSIB Bandung vs Bali United FC\n` +
      `* 📅 **Hari/Tanggal:** Minggu, 22 November 2026\n` +
      `* ⏰ **Waktu:** 19:00 WIB (Kick-off Malam)\n` +
      `* 🏟️ **Stadion:** Gelora Bandung Lautan Api (GBLA), Bandung\n` +
      `* 📌 **Status:** SCHEDULED (Belum dimainkan. PERSIB siap memburu 3 poin penuh di hadapan puluhan ribu Bobotoh!)`;
  }

  if (q.includes('klasemen') || q.includes('peringkat') || q.includes('posisi') || q.includes('poin')) {
    if (q.includes('shopee') || q.includes('asean')) {
      return `🌏 **Klasemen Sementara Shopee Cup 2026/2027 Grup B:**\n\n` +
        `1. **PERSIB Bandung (IDN)**: 2 Main, 2 Menang, 0 Seri, 0 Kalah | Gol 9-1 (+8) | **6 Poin** (Pemuncak Klasemen 🔥)\n` +
        `2. **Johor Darul Ta'zim (MAS)**: 2 Main, 2 Menang | Gol 7-1 (+6) | **6 Poin**\n` +
        `3. **Cong An Ha Noi (VIE)**: 2 Main, 1 Menang, 1 Kalah | Gol 3-3 (0) | **3 Poin**\n` +
        `4. **PKR Svay Rieng (CAM)**: 2 Main, 1 Menang, 1 Kalah | Gol 3-4 (-1) | **3 Poin**\n` +
        `5. **Lion City Sailors (SGP)**: 2 Main, 0 Menang, 2 Kalah | Gol 1-4 (-3) | **0 Poin**\n` +
        `6. **Shan United (MYA)**: 2 Main, 0 Menang, 2 Kalah | Gol 0-10 (-10) | **0 Poin**`;
    }
    return `📊 **Klasemen Resmi Super League 2026/2027 (Setelah Pekan 9 Selesai):**\n\n` +
      `* #1 Persija Jakarta: 21 Poin (Main 9)\n` +
      `* #2 Dewa United: 20 Poin (Main 10)\n` +
      `* #3 Bali United: 19 Poin (Main 9)\n` +
      `* #4 Madura United: 19 Poin (Main 10)\n` +
      `* #5 Persita Tangerang: 18 Poin (Main 9)\n` +
      `* **#6 PERSIB Bandung: 16 Poin** (Main 9: 5 Menang, 1 Seri, 3 Kalah | Gol 16-10 [+6])\n\n` +
      `*Kemenangan di laga Pekan 10 kontra Bali United akan mendongkrak Maung Bandung langsung menyamai 19 poin Serdadu Tridatu!*`;
  }

  if (q.includes('acl') || q.includes('asia') || q.includes('champions league')) {
    return `⭐ **PERSIB Bandung di AFC Champions League Two (ACL Two 2026/2027 - Grup E):**\n\n` +
      `* **Status:** JUARA GRUP E (Lolos Resmi ke Babak 16 Besar Asia!)\n` +
      `* **Rekor:** 100% Sempurna — 4 Pertandingan, 4 Kemenangan, 12 Poin Maksimal\n` +
      `* **Produktivitas Gol:** 8 Gol dicetak, hanya 2 kebobolan (Selisih Gol +6)\n` +
      `* Mengungguli klub kuat Asia seperti Melbourne Victory, FC Seoul, dan The Cong-Viettel!`;
  }

  if (q.includes('pemain') || q.includes('skuad') || q.includes('haye') || q.includes('walsh') || q.includes('ragnar') || q.includes('peralta')) {
    return `🔵 **Pilar Utama Skuad PERSIB Bandung Musim 2026/2027:**\n\n` +
      `* **Thom Haye (#33 - MF):** "The Professor" jenderal metronom lini tengah berpaspor Indonesia dengan akurasi operan 92.4% dan visi set-piece kelas Eropa.\n` +
      `* **Sandy Walsh (#6 - DF):** Bek sayap kanan modern dengan crossing presisi dan disiplin bertahan kelas Liga Belgia.\n` +
      `* **Ragnar Oratmangoen (#77 - FW):** Winger lincah eksplosif Timnas Indonesia dengan kemampuan penetrasi solo run menusuk kotak penalti.\n` +
      `* **Mariano Peralta (#10 - FW):** Penyerang anyar Argentina pemegang nomor punggung 10 dengan insting finishing akurat.\n` +
      `* **Marc Klok (#23 - MF):** Kapten karismatik dan pengatur ritme transisi tim.\n` +
      `* **Balša Sekulić (#99 - FW):** Predator kotak penalti asal Montenegro, target man udara tangguh.\n` +
      `* **Pelatih Kepala:** Bojan Hodak & Igor Tolic (Kroasia).`;
  }

  return `🔵 **Halo Bobotoh!** Saya asisten AI resmi PERSIB Tracker musim 2026/2027.\n\n` +
    `Anda dapat bertanya mengenai:\n` +
    `* 🏆 **Jadwal & Hasil Laga:** Super Big Match Pekan 10 vs Bali United (Minggu, 22 Nov 2026, 19:00 WIB)\n` +
    `* 📊 **Klasemen:** Posisi PERSIB di Super League (#6, 16 Poin) dan Puncak Shopee Cup Grup B (6 Poin)\n` +
    `* 🌏 **Kompetisi Asia:** Tiket 16 Besar ACL Two dan Jadwal Shopee Cup (vs Lion City Sailors, JDT, Svay Rieng, CAHN)\n` +
    `* 👥 **Profil Skuad:** Thom Haye, Sandy Walsh, Ragnar Oratmangoen, Mariano Peralta, dan analisis taktik Bojan Hodak.\n\n` +
    `Ada yang ingin Anda ketahui lebih lanjut?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message || '';
    const conversationHistory: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!userMessage.trim()) {
      return NextResponse.json(
        { success: false, error: 'Pesan pertanyaan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY || '';
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    // System prompt with absolute factual ground truth for 2026/2027
    const systemPrompt = `Kamu adalah "PERSIB AI INTELLIGENCE ASSISTANT", asisten AI resmi paling cerdas dan terpercaya untuk para pendukung PERSIB Bandung (Bobotoh) pada MUSIM AKTIF 2026/2027.

PEDOMAN UTAMA & DATA VALID RESMI 2026/2027:
1. LARANGAN KERAS: Dilarang menggunakan data kadaluarsa musim 2024/2025 ataupun 2025/2026! Fokus penuh pada musim aktif 2026/2027.
2. JADWAL PEKAN 10 SUPER LEAGUE: Big Match PERSIB Bandung vs Bali United FC di Stadion GBLA dijadwalkan BESOK MINGGU, 22 NOVEMBER 2026 pukul 19:00 WIB (Status: SCHEDULED - BELUM DIMAINKAN). Dilarang mengarang skor akhir pertandingan ini!
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

GAYA KOMUNIKASI:
- Berbahasa Indonesia ramah, profesional, suportif kepada Bobotoh, penuh semangat Maung Bandung 🔵.
- Gunakan format markdown bersih (bullet points, bolding) agar nyaman dibaca di layar mobile smartphone.
- Jika pengguna menanyakan jadwal, sebutkan tanggal, hari, jam (WIB), dan nama stadionnya dengan jelas.`;

    if (apiKey && !apiKey.startsWith('gsk_fjb3E_dummy')) {
      try {
        const messagesToSend: ChatMessage[] = [
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
              provider: 'groq-llama-3.3-70b',
            });
          }
        }
      } catch {
        // Fall back gracefully to internal verified engine
      }
    }

    // Factual rule-based fallback response
    const fallbackReply = generateFactualFallback(userMessage);
    return NextResponse.json({
      success: true,
      reply: fallbackReply,
      provider: 'persib-factual-intelligence-engine',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
