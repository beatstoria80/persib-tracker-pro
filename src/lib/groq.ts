import {
  OFFICIAL_SQUAD_2026_2027,
  BRI_LIGA_1_STANDINGS_2026_2027,
  VERIFIED_FIXTURES_2026_2027,
  ACL_GROUP_STANDINGS_2026_2027,
} from '@/data/persib-data';

export type GroqAgentTask =
  | 'match_briefing'
  | 'tactical_analysis'
  | 'medical_report'
  | 'scenario_sim'
  | 'custom_query';

export interface AgentGraphNode {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'standby';
  inputSource: string;
  outputTarget: string;
}

export const GROQ_AGENT_GRAPH_MAP: AgentGraphNode[] = [
  {
    id: 'agent-orchestrator',
    name: 'Groq Dispatcher & Router',
    role: 'Central Prompt & Query Classifier',
    description: 'Mengklasifikasikan intent pengguna & memetakan konteks resmi ke sub-agent terkait.',
    status: 'active',
    inputSource: 'User Query / Client Trigger',
    outputTarget: 'Specialized Sub-Agents',
  },
  {
    id: 'agent-standings',
    name: 'Match & Standings Intelligence Agent',
    role: 'Liga 1 & ACL Two Data Evaluator',
    description: 'Menyuplai kalkulasi selisih gol, rekor tak terkalahkan, dan peta klasemen 18 tim Liga 1 Pekan 8.',
    status: 'active',
    inputSource: 'BRI_LIGA_1_STANDINGS_2026_2027',
    outputTarget: 'Groq Response Synthesizer',
  },
  {
    id: 'agent-tactics',
    name: 'Tactical Playbook Synthesis Agent',
    role: 'Igor Tolic 4-2-3-1 Formation Analyst',
    description: 'Menganalisis pergerakan poros ganda Thom Haye-Klok, transisi sayap Peralta, dan penyelesaian Uilliam.',
    status: 'active',
    inputSource: 'IGOR_TOLIC_TACTICAL_PLAYBOOK',
    outputTarget: 'Groq Response Synthesizer',
  },
  {
    id: 'agent-medical',
    name: 'Medical & Squad Fitness Agent',
    role: 'Real-Time Player Readiness Tracker',
    description: 'Memantau kondisi fisik pemain (Fit, Latihan Terpisah, Cedera) dan estimasi masa siap tanding.',
    status: 'active',
    inputSource: 'OFFICIAL_SQUAD_2026_2027.fitness',
    outputTarget: 'Groq Response Synthesizer',
  },
  {
    id: 'agent-synthesizer',
    name: 'Groq LPU Synthesis Engine',
    role: 'Sub-second Response Generator',
    description: 'Membangun respons ringkas, akurat, dan 100% berbasis data valid tanpa rumor/halusinasi.',
    status: 'active',
    inputSource: 'Sub-agent Aggregations',
    outputTarget: 'Persib Tracker Mobile Client',
  },
];

// Ground truth context builder to enforce verified facts
export function buildVerifiedSystemPrompt(): string {
  const top4Standings = BRI_LIGA_1_STANDINGS_2026_2027.slice(0, 5)
    .map((s) => `#${s.rank} ${s.team} (${s.points} Poin, SG: ${s.gd})`)
    .join(' | ');

  const starting11Names = OFFICIAL_SQUAD_2026_2027.filter((p) => p.squadRole === 'starting')
    .map((p) => `#${p.number} ${p.name} (${p.position})`)
    .join(', ');

  const injuredPlayers = OFFICIAL_SQUAD_2026_2027.filter((p) => p.fitness.status !== 'fit')
    .map((p) => `${p.name} (${p.fitness.status}: ${p.fitness.injuryType || 'Pemulihan'})`)
    .join(', ');

  const latestMatch = VERIFIED_FIXTURES_2026_2027[0];
  const nextMatch = VERIFIED_FIXTURES_2026_2027[1];

  return `Kamu adalah "Maung AI", asisten Sports Intelligence resmi untuk Persib Bandung (Persib Tracker Pro) yang ditenagai oleh Groq LPU Ultra-Fast Inference.
ATURAN UTAMA:
1. Kamu HANYA menggunakan data terverifikasi resmi musim 2026/2027 berikut. JANGAN BERHALUSINASI atau mengarang data rumor.
2. Gaya bicara: Lugas, taktis, profesional, dan bangga (Persib Salawasna / Maung Bandung).
3. Format jawaban: Bersih, menggunakan poin atau bullet bila perlu, cocok untuk layar mobile.

DATA RESMI TERVERIFIKASI KLUB MUSIM 2026/2027:
- Head Coach: Igor Tolic (Kroasia, Lisensi UEFA Pro, Formasi Utama 4-2-3-1)
- Strategic Advisor: Bojan Hodak
- Klasemen BRI Liga 1 (Pekan 8 Resmi Google & PT LIB):
  Persib berada di Posisi #4 dengan 16 Poin (5 Menang, 1 Seri, 2 Kalah, Gol: 15-8, Selisih Gol: +7).
  Top 5 Klasemen: ${top4Standings}. Persib hanya berselisih 2 poin dari puncak klasemen (Persija 18 poin)!
- Laga Terakhir (Pekan 8): PERSIB Bandung 4 - 0 Isenmulang Kalteng FC (31 Okt 2026, GBLA). Pencetak gol: Thom Haye (18'), Uilliam (42'), Mariano Peralta (67'), Beckham Putra (84').
- Laga Berikutnya (Pekan 9): Java United FC vs PERSIB Bandung (Minggu, 08 Nov 2026, 19:00 WIB, Stadion Jatidiri Semarang).
- Starting XI Utama 2026/2027: ${starting11Names}
- Kiper Utama: Adam Przybek (#1)
- Poros Gelandang Bertahan: Thom Haye (#8) & Marc Klok (#23)
- Pemain dalam pemulihan medis: ${injuredPlayers || 'Tidak ada cedera berat'}
- Kompetisi Asia: AFC Champions League Two (ACL Two 2026/2027 Fase Grup). Persib mengoleksi 7 poin dari 3 laga.`;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatResponse {
  success: boolean;
  content: string;
  agentNode: string;
  model: string;
  inferenceTimeMs?: number;
  error?: string;
}

export async function queryGroqAgent(
  userPrompt: string,
  task: GroqAgentTask = 'custom_query'
): Promise<GroqChatResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

  const startTime = Date.now();
  let assignedAgent = 'agent-orchestrator';

  if (!apiKey) {
    return {
      success: false,
      content: 'Konfigurasi GROQ_API_KEY belum disetel pada Environment Variables.',
      agentNode: assignedAgent,
      model,
      error: 'Missing GROQ_API_KEY in environment variables',
    };
  }

  // Task Routing Logic
  let taskDirective = '';
  switch (task) {
    case 'match_briefing':
      assignedAgent = 'agent-standings';
      taskDirective = 'Berikan ringkasan taktis kemenangan telak 4-0 Pekan 8 atas Isenmulang Kalteng FC dan persiapan jelang laga Pekan 9 melawan Java United FC.';
      break;
    case 'tactical_analysis':
      assignedAgent = 'agent-tactics';
      taskDirective = 'Jelaskan skema taktik 4-2-3-1 Igor Tolic: pergerakan poros ganda Thom Haye dan Marc Klok, serta kombinasi sayap Mariano Peralta dan striker Uilliam.';
      break;
    case 'medical_report':
      assignedAgent = 'agent-medical';
      taskDirective = 'Laporkan status kebugaran skuad Persib saat ini, kondisi pemain utama, dan kesiapan untuk laga mendatang.';
      break;
    case 'scenario_sim':
      assignedAgent = 'agent-standings';
      taskDirective = 'Kalkulasikan peluang Persib Bandung menyodok ke peringkat 1-2 Liga 1 dan skenario lolos ke 16 besar ACL Two 2026/2027.';
      break;
    default:
      assignedAgent = 'agent-synthesizer';
      taskDirective = '';
  }

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: buildVerifiedSystemPrompt(),
    },
    {
      role: 'user',
      content: taskDirective ? `${taskDirective}\n\nPertanyaan pengguna: ${userPrompt}` : userPrompt,
    },
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMessage = (errJson as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
      return {
        success: false,
        content: `Gagal memanggil Groq AI LPU: ${errMessage}`,
        agentNode: assignedAgent,
        model,
        inferenceTimeMs: Date.now() - startTime,
        error: errMessage,
      };
    }

    const data = await response.json();
    const assistantReply: string = data?.choices?.[0]?.message?.content || 'Tidak ada balasan dari Groq AI.';
    const inferenceTimeMs = Date.now() - startTime;

    return {
      success: true,
      content: assistantReply,
      agentNode: assignedAgent,
      model,
      inferenceTimeMs,
    };
  } catch (err: unknown) {
    const errorString = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      content: `Terjadi kendala jaringan ke Groq LPU engine: ${errorString}`,
      agentNode: assignedAgent,
      model,
      inferenceTimeMs: Date.now() - startTime,
      error: errorString,
    };
  }
}
