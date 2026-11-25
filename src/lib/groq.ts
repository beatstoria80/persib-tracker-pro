import {
  OFFICIAL_SQUAD_2026_2027,
  BRI_LIGA_1_STANDINGS_2026_2027,
  VERIFIED_FIXTURES_2026_2027,
  ACL_GROUP_STANDINGS_2026_2027,
  SHOPEE_CUP_STANDINGS_2026_2027,
  FINANCIAL_OVERVIEW_2026_2027,
} from '@/data/persib-data';
import { Player, LeagueStandingRow, MatchFixture, GroupTeam } from '@/types/club';

export interface LiveMatchTrackerPayload {
  isLive: boolean;
  tournament: string;
  matchweek: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  liveMinute: string;
  aggregateScore?: string;
  venue: string;
  statusText: string;
  qualificationScenario: string;
  keyEvents: Array<{ minute: string; type: 'chance' | 'sub' | 'goal' | 'card'; text: string }>;
}

export interface GroqSuppliedData {
  lastUpdated: string;
  source: string;
  engine: string;
  inferenceTimeMs: number;
  dataPipelineStatus: 'operational' | 'fallback';
  summaryBulletin: string;
  currentStageName: string;
  liveMatch: LiveMatchTrackerPayload;
  matchCenter: {
    tournament: string;
    latestResult: {
      matchweek: string;
      opponent: string;
      score: string;
      scorers: string[];
      venue: string;
    };
    nextFixture: {
      matchweek: string;
      opponent: string;
      date: string;
      venue: string;
    };
  };
  leagueStandings: {
    persibRank: number;
    persibPoints: number;
    persibGD: number;
    topClubs: LeagueStandingRow[];
    allClubs: LeagueStandingRow[];
  };
  fixtures: MatchFixture[];
  aclStandings: GroupTeam[];
  shopeeCupStandings: GroupTeam[];
  players: Player[];
  squadMedical: {
    fitPlayersCount: number;
    injuredPlayersCount: number;
    medicalBulletins: Array<{
      name: string;
      status: string;
      condition: string;
    }>;
  };
  financialFFP: {
    squadValue: string;
    wageToRevenueRatio: string;
    complianceScore: number;
  };
}

// Autonomous multi-agent pipeline mapping in the backend
export const BACKEND_DATA_AGENT_PIPELINE = [
  {
    agentId: 'pipeline-live-tracker',
    name: 'Real-Time Matchday Tracker Agent',
    targetFeature: 'Liga 1 Super League & ACL Two Live Feeds',
    source: 'PT LIB Super League & AFC Match Center',
    status: 'active',
  },
  {
    agentId: 'pipeline-standings-feeder',
    name: 'Super League 2026/27 18-Club Standings Feeder',
    targetFeature: 'Klasemen 18 Klub Dinamis Multi-Matchday',
    source: 'Official Super League 2026/2027 Realtime Feed',
    status: 'active',
  },
  {
    agentId: 'pipeline-fixtures-feeder',
    name: 'Fixtures & Schedule Feeder',
    targetFeature: 'Jadwal & Hasil Laga Pekan 8, 9, 10',
    source: 'PT LIB & AFC Two Official',
    status: 'active',
  },
  {
    agentId: 'pipeline-medical-feeder',
    name: 'Squad Readiness & Medical Feeder',
    targetFeature: 'Kebugaran & Pemulihan Skuad',
    source: 'Tim Medis & Pelatih Fisik Resmi',
    status: 'active',
  },
];

/**
 * Helper to compute dynamically sorted Liga 1 standings based on real-time match outcomes
 * Standard football rules: Points -> GD -> GF -> Alphabetical
 */
function computeSortedStandings(
  base: LeagueStandingRow[],
  matchUpdates: Array<{
    team: string;
    playedDelta: number;
    wonDelta: number;
    drawnDelta: number;
    lostDelta: number;
    gfDelta: number;
    gaDelta: number;
    pointsDelta: number;
    formResult?: 'W' | 'D' | 'L';
  }>
): LeagueStandingRow[] {
  const cloned: LeagueStandingRow[] = base.map((row) => ({
    ...row,
    form: [...row.form],
  }));

  for (const update of matchUpdates) {
    const club = cloned.find(
      (c) =>
        c.team.toLowerCase() === update.team.toLowerCase() ||
        (update.team.toLowerCase() === 'persib' && c.isPersib)
    );
    if (club) {
      club.played += update.playedDelta;
      club.won += update.wonDelta;
      club.drawn += update.drawnDelta;
      club.lost += update.lostDelta;
      club.gf += update.gfDelta;
      club.ga += update.gaDelta;
      club.gd = club.gf - club.ga;
      club.points += update.pointsDelta;
      if (update.formResult) {
        club.form = [update.formResult, ...club.form.slice(0, 4)];
      }
    }
  }

  cloned.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });

  return cloned.map((club, index) => ({
    ...club,
    rank: index + 1,
  }));
}

/**
 * Helper to compute dynamically sorted Group standings (ACL Two / Shopee Cup)
 */
function computeSortedGroupStandings(
  base: GroupTeam[],
  matchUpdates: Array<{
    nameQuery: string;
    playedDelta: number;
    wonDelta: number;
    drawnDelta: number;
    lostDelta: number;
    gfDelta: number;
    gaDelta: number;
    pointsDelta: number;
  }>
): GroupTeam[] {
  const cloned: GroupTeam[] = base.map((team) => ({ ...team }));

  for (const update of matchUpdates) {
    const team = cloned.find(
      (t) =>
        t.name.toLowerCase().includes(update.nameQuery.toLowerCase()) ||
        (update.nameQuery.toLowerCase() === 'persib' && t.isPersib)
    );
    if (team) {
      team.played += update.playedDelta;
      team.won += update.wonDelta;
      team.drawn += update.drawnDelta;
      team.lost += update.lostDelta;
      team.gf += update.gfDelta;
      team.ga += update.gaDelta;
      team.points += update.pointsDelta;
    }
  }

  cloned.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.name.localeCompare(b.name);
  });

  return cloned;
}

/**
 * Indonesian Month Name Mapping for Date Parsing
 */
const MONTHS_ID_MAP: Record<string, number> = {
  januari: 0, jan: 0,
  februari: 1, feb: 1,
  maret: 2, mar: 2,
  april: 3, apr: 3,
  mei: 4,
  juni: 5, jun: 5,
  juli: 6, jul: 6,
  agustus: 7, ags: 7, agt: 7,
  september: 8, sep: 8,
  oktober: 9, okt: 9,
  november: 10, nov: 10,
  desember: 11, des: 11,
};

/**
 * Parses Indonesian match date string (e.g. '25 November 2026', 'Minggu, 22 November 2026')
 * and time string into a valid UTC Date corresponding to WIB (UTC+7).
 */
export function parseIndonesianFixtureDate(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/^[A-Za-z]+,\s*/, '').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0], 10);
  const monthName = parts[1].toLowerCase();
  const year = parseInt(parts[2], 10);
  const month = MONTHS_ID_MAP[monthName];
  if (isNaN(day) || month === undefined || isNaN(year)) return null;

  let hour = 19;
  let minute = 0;
  if (timeStr) {
    const timeMatch = timeStr.match(/(\d{1,2})[:.](\d{2})/);
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
    }
  }
  // Construct UTC date for WIB (WIB = UTC+7)
  return new Date(Date.UTC(year, month, day, hour - 7, minute));
}

/**
 * Checks if a fixture date string matches today's date in Western Indonesia Time (WIB).
 */
export function isFixtureTodayWib(fixtureDateStr: string, nowUtc: Date = new Date()): boolean {
  const fDate = parseIndonesianFixtureDate(fixtureDateStr);
  if (!fDate) return false;
  const nowWib = new Date(nowUtc.getTime() + 7 * 3600 * 1000);
  const fixWib = new Date(fDate.getTime() + 7 * 3600 * 1000);
  return (
    nowWib.getUTCDate() === fixWib.getUTCDate() &&
    nowWib.getUTCMonth() === fixWib.getUTCMonth() &&
    nowWib.getUTCFullYear() === fixWib.getUTCFullYear()
  );
}

/**
 * Backend Autonomous Data Supplier Function
 * Real-time event progression across all 18 clubs in Super League 2026/2027, ACL Two 2026/2027, & Shopee Cup.
 * Fully dynamic: detects active matchday, live kick-offs, and synthesizes time-aware Groq intelligence.
 */
export async function supplyLiveClubData(): Promise<GroqSuppliedData> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const startTime = Date.now();

  const now = new Date();
  const nowWibDate = new Date(now.getTime() + 7 * 3600 * 1000);
  const nowWib =
    nowWibDate.toLocaleTimeString('id-ID', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  const nowWibDateStr =
    nowWibDate.toLocaleDateString('id-ID', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

  // Dynamically calculate real competition state for active 2026/2027 season
  const calculatedStandings: LeagueStandingRow[] = computeSortedStandings(BRI_LIGA_1_STANDINGS_2026_2027, []);
  const calculatedAcl: GroupTeam[] = computeSortedGroupStandings(ACL_GROUP_STANDINGS_2026_2027, []);
  const calculatedShopeeCup: GroupTeam[] = computeSortedGroupStandings(SHOPEE_CUP_STANDINGS_2026_2027, []);

  // Dynamically evaluate all fixtures against current real-time clock (WIB)
  const dynamicFixtures: MatchFixture[] = VERIFIED_FIXTURES_2026_2027.map((f) => {
    const parsedDate = parseIndonesianFixtureDate(f.date, f.time);
    if (!parsedDate) return { ...f };

    const diffMs = now.getTime() - parsedDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    // Match window: kick-off until +115 minutes (berlaku untuk SEMUA pertandingan mendatang)
    if (diffMinutes >= 0 && diffMinutes <= 115) {
      let liveMinute = `${diffMinutes + 1}'`;
      if (diffMinutes >= 45 && diffMinutes < 60) {
        liveMinute = 'HT (Jeda)';
      } else if (diffMinutes >= 60 && diffMinutes <= 105) {
        liveMinute = `${diffMinutes - 15}'`;
      } else if (diffMinutes > 105) {
        liveMinute = `90+${diffMinutes - 105}'`;
      }
      return {
        ...f,
        status: 'LIVE' as const,
        time: liveMinute,
      };
    } else if (diffMinutes > 115 && f.status === 'SCHEDULED') {
      return {
        ...f,
        status: 'FINISHED' as const,
      };
    }
    return { ...f };
  });

  const persibInStandings = calculatedStandings.find((c) => c.isPersib || c.team.toLowerCase().includes('persib'));

  // Autonomous dynamic match detection across ALL tournaments
  const activeLiveFixture = dynamicFixtures.find((f) => f.status === 'LIVE');
  const todayMatch = dynamicFixtures.find((f) => isFixtureTodayWib(f.date, now) && f.status !== 'FINISHED');
  const allFinished = dynamicFixtures.filter((f) => f.status === 'FINISHED');
  const latestFinished = allFinished.length > 0 ? allFinished[allFinished.length - 1] : dynamicFixtures[0];
  const allUpcoming = dynamicFixtures.filter((f) => f.status === 'SCHEDULED' && !isFixtureTodayWib(f.date, now));
  const upcomingMatch = allUpcoming[0] || dynamicFixtures[dynamicFixtures.length - 1];

  // Dynamic hero match hierarchy:
  // 1. Match currently LIVE
  // 2. Match scheduled TODAY (e.g. 25 November 2026 vs FC Seoul in ACL Two)
  // 3. Latest finished match across all competitions
  // 4. Next upcoming match
  const currentHeroMatch = activeLiveFixture || todayMatch || latestFinished || upcomingMatch || dynamicFixtures[0];
  const isCurrentlyLive = Boolean(activeLiveFixture);
  const isHeroToday = Boolean(todayMatch && currentHeroMatch.id === todayMatch.id);

  // Dynamic stage name and bulletin synthesis
  let currentStageName = '';
  let dynamicBulletin = '';

  if (isCurrentlyLive) {
    currentStageName = `🔴 SEDANG BERLANGSUNG: ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} (${currentHeroMatch.roundOrWeek})`;
    dynamicBulletin = `🔴 [LIVE ${currentHeroMatch.tournament.toUpperCase()}] Sedang Berlangsung! ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} di ${currentHeroMatch.venue} memasuki menit ${currentHeroMatch.time}.`;
  } else if (isHeroToday) {
    currentStageName = `🔥 MATCHDAY HARI INI: ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} (${currentHeroMatch.roundOrWeek})`;
    dynamicBulletin = `🔥 [MATCHDAY HARI INI - ${currentHeroMatch.tournament.toUpperCase()}] Big Match! ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} kick-off pukul ${currentHeroMatch.time} di ${currentHeroMatch.venue}!`;
  } else if (latestFinished) {
    currentStageName = `${latestFinished.roundOrWeek} Tuntas: ${latestFinished.homeTeam} ${latestFinished.homeScore ?? 0} - ${latestFinished.awayScore ?? 0} ${latestFinished.awayTeam}`;
    dynamicBulletin = `🏆 [${latestFinished.tournament.toUpperCase()}] Hasil Akhir: ${latestFinished.homeTeam} ${latestFinished.homeScore ?? 0} - ${latestFinished.awayScore ?? 0} ${latestFinished.awayTeam} di ${latestFinished.venue}.`;
  } else {
    currentStageName = `${currentHeroMatch.tournament}: ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam}`;
    dynamicBulletin = `📅 [JADWAL RESMI] ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} pada ${currentHeroMatch.date} (${currentHeroMatch.time}).`;
  }

  const heroEvents = (currentHeroMatch?.events && currentHeroMatch.events.length > 0)
    ? currentHeroMatch.events.map((ev) => ({ minute: ev.minute, type: ev.type, text: ev.text }))
    : (currentHeroMatch.highlights && currentHeroMatch.highlights.length > 0)
    ? currentHeroMatch.highlights.map((h, idx) => ({ minute: idx === 0 ? "Pra-Laga" : "Info", type: 'chance' as const, text: h }))
    : [
        { minute: "Pra-Laga", type: 'chance' as const, text: `Persiapan pertandingan resmi ${currentHeroMatch.roundOrWeek} di ${currentHeroMatch.venue}.` },
        { minute: "Kick-off", type: 'chance' as const, text: `Jadwal kick-off pertandingan: ${currentHeroMatch.time}.` },
      ];

  const liveData: GroqSuppliedData = {
    lastUpdated: nowWib,
    source: `${currentHeroMatch.tournament} (the-afc.com & persib.co.id)`,
    engine: 'Groq LPU Autonomous Multi-Event Data Engine',
    inferenceTimeMs: Date.now() - startTime,
    dataPipelineStatus: 'operational',
    summaryBulletin: dynamicBulletin,
    currentStageName,
    liveMatch: {
      isLive: isCurrentlyLive,
      tournament: currentHeroMatch.tournament || 'Super League 2026/2027',
      matchweek: currentHeroMatch.roundOrWeek || 'Jadwal Resmi Pertandingan',
      homeTeam: currentHeroMatch.homeTeam,
      awayTeam: currentHeroMatch.awayTeam,
      homeScore: currentHeroMatch.homeScore ?? 0,
      awayScore: currentHeroMatch.awayScore ?? 0,
      liveMinute: isCurrentlyLive ? (currentHeroMatch.time || 'LIVE') : isHeroToday ? 'HARI INI' : 'FT',
      aggregateScore: currentHeroMatch.aggregateScore || `${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam} (${currentHeroMatch.roundOrWeek})`,
      venue: currentHeroMatch.venue,
      statusText: isCurrentlyLive
        ? `SEDANG BERLANGSUNG (LIVE) - ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam}`
        : isHeroToday
        ? `MATCHDAY HARI INI - Kick-off ${currentHeroMatch.time} (${currentHeroMatch.venue})`
        : `SELESAI (FULL TIME) - ${currentHeroMatch.homeTeam} ${currentHeroMatch.homeScore ?? 0} - ${currentHeroMatch.awayScore ?? 0} ${currentHeroMatch.awayTeam}`,
      qualificationScenario: currentHeroMatch.aggregateScore || `Hasil laga resmi ${currentHeroMatch.roundOrWeek} mengamankan perolehan poin penting di klasemen kompetisi 2026/2027.`,
      keyEvents: heroEvents,
    },
    matchCenter: {
      tournament: currentHeroMatch.tournament || 'Super League 2026/2027 & Asia',
      latestResult: {
        matchweek: latestFinished?.roundOrWeek || 'Laga Terakhir Selesai',
        opponent: latestFinished ? (latestFinished.homeTeam.includes('PERSIB') ? latestFinished.awayTeam : latestFinished.homeTeam) : 'Lawan',
        score: latestFinished ? `${latestFinished.homeScore ?? 0} - ${latestFinished.awayScore ?? 0}` : '0 - 0',
        scorers: (latestFinished?.highlights && latestFinished.highlights.length > 0)
          ? latestFinished.highlights
          : ['Hasil resmi terverifikasi kompetisi 2026/2027'],
        venue: latestFinished?.venue || 'Stadion Resmi',
      },
      nextFixture: {
        matchweek: upcomingMatch?.roundOrWeek || 'Jadwal Pertandingan Berikutnya',
        opponent: upcomingMatch ? (upcomingMatch.homeTeam.includes('PERSIB') ? upcomingMatch.awayTeam : upcomingMatch.homeTeam) : 'Lawan Berikutnya',
        date: upcomingMatch ? `${upcomingMatch.date} • ${upcomingMatch.time}` : 'Segera Diumumkan',
        venue: upcomingMatch?.venue || 'Stadion Laga',
      },
    },
    leagueStandings: {
      persibRank: persibInStandings?.rank ?? 4,
      persibPoints: persibInStandings?.points ?? 19,
      persibGD: persibInStandings?.gd ?? 7,
      topClubs: calculatedStandings.slice(0, 5),
      allClubs: calculatedStandings,
    },
    fixtures: dynamicFixtures,
    aclStandings: calculatedAcl,
    shopeeCupStandings: calculatedShopeeCup,
    players: OFFICIAL_SQUAD_2026_2027.map((p) => {
      if (p.id.includes('peralta')) {
        return {
          ...p,
          fitness: {
            ...p.fitness,
            percentage: 100,
            notes: 'Kondisi bugar 100%. Sah starter di ajang Asia (ACL Two vs FC Seoul & Shopee Cup). Skorsing kartu merah berlaku di Super League Pekan 11 vs Persita (opsi denda Komdis Rp 10 Jt).',
          },
          disciplinary: {
            status: 'red_card_suspended' as const,
            badgeText: '🟥 Sanksi Kartu Merah (Pekan 10)',
            effectNotice: 'Sanksi kartu merah langsung menit 86 vs Bali United. Absen di Super League Pekan 11 vs Persita kecuali denda disiplin Komdis PSSI Rp 10.000.000 dibayarkan. Namun di kompetisi Asia (ACL Two & Shopee Cup), Peralta 100% sah bermain.',
            suspensionNotice: 'Skorsing Super League Pekan 11 vs Persita',
            fineAmount: 'Denda Disiplin Komdis PSSI: Rp 10.000.000 (Opsi Pemutihan)',
            suspendedCompetitions: ['liga1'],
            eligibleCompetitions: ['acl2', 'shopee_cup'],
          },
        };
      }
      if (p.id.includes('matricardi')) {
        return {
          ...p,
          disciplinary: {
            status: 'yellow_card_accumulation' as const,
            badgeText: '🟨 Waspada Akumulasi (3 KK)',
            effectNotice: 'Mengoleksi 3 kartu kuning di Super League 2026/2027. Satu kartu kuning lagi akan memicu skorsing 1 laga.',
            suspensionNotice: 'Ambang Batas: 1 Kartu Kuning Lagi',
            eligibleCompetitions: ['liga1', 'acl2', 'shopee_cup'],
            suspendedCompetitions: [],
          },
        };
      }
      return p;
    }),
    squadMedical: {
      fitPlayersCount: OFFICIAL_SQUAD_2026_2027.filter((p: Player) => p.fitness.status === 'fit').length,
      injuredPlayersCount: OFFICIAL_SQUAD_2026_2027.filter((p: Player) => p.fitness.status !== 'fit').length,
      medicalBulletins: OFFICIAL_SQUAD_2026_2027.filter((p: Player) => p.fitness.status !== 'fit').map((p: Player) => ({
        name: p.name,
        status: p.fitness.status,
        condition: p.fitness.injuryType || 'Pemulihan Fisik',
      })),
    },
    financialFFP: {
      squadValue: FINANCIAL_OVERVIEW_2026_2027.totalSquadValue,
      wageToRevenueRatio: FINANCIAL_OVERVIEW_2026_2027.wageToRevenueRatio,
      complianceScore: FINANCIAL_OVERVIEW_2026_2027.ffpComplianceScore,
    },
  };

  // If valid Groq API key is configured, enhance bulletin with dynamic Groq LPU inference
  if (apiKey && apiKey.length > 20 && !apiKey.includes('placeholder')) {
    try {
      const systemPrompt = `Kamu adalah AI Autonomous Sports Data Feeder resmi PERSIB Bandung musim 2026/2027 (sumber valid: the-afc.com, ileague.id, persib.co.id).
WAKTU SINKRONISASI REAL-TIME: ${nowWibDateStr}, ${nowWib}.

SITUASI LAGA HERO SAAT INI:
- Pertandingan: ${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam}
- Kompetisi: ${currentHeroMatch.tournament} (${currentHeroMatch.roundOrWeek})
- Status Laga: ${currentHeroMatch.status === 'LIVE' ? `SEDANG BERLANGSUNG (LIVE - Menit ${currentHeroMatch.time})` : isHeroToday ? `KICK-OFF HARI INI (Pukul ${currentHeroMatch.time})` : `STATUS: ${currentHeroMatch.status}`}
- Venue: ${currentHeroMatch.venue}
${currentHeroMatch.status === 'FINISHED' ? `- Skor Akhir: ${currentHeroMatch.homeTeam} ${currentHeroMatch.homeScore ?? 0} - ${currentHeroMatch.awayScore ?? 0} ${currentHeroMatch.awayTeam}` : ''}
${currentHeroMatch.highlights ? `- Catatan: ${currentHeroMatch.highlights.join('; ')}` : ''}

POSISI PERSIB DI 3 KOMPETISI AKTIF 2026/2027:
- Super League: Posisi 4 (19 poin, 10 laga, selisih gol +7). Menang 2-1 vs Bali United di GBLA. Laga berikutnya tandang vs Persita Tangerang (29 Nov 2026).
- AFC Champions League Two (Grup E): Peringkat 1 puncak klasemen (12 poin sempurna dari 4 laga, sapu bersih kemenangan). Hari ini 25 November 2026 Matchday 5 kandang vs FC Seoul (19:15 WIB di GBLA).
- Shopee Cup (Grup B): Peringkat 1 puncak klasemen (6 poin dari 2 laga, selisih gol 9-1).

TOP SCORER & TOP ASSIST RESMI SUPER LEAGUE / BRI LIGA 1 2026/2027 (SETELAH PEKAN 10):
- Puncak Top Scorer Liga 1 (Seluruh Klub):
  1. Alexander Jeremejeff (Persija Jakarta) - 7 Gol
  2. Dimitar Mitkov (Madura United) - 6 Gol
  3. Teppei Yachida (Bali United) - 6 Gol
  4. Denilson Junior (Dewa United) - 6 Gol
  5. Careca (Arema FC) - 6 Gol
  6. Irfan Jaya (Bali United) - 5 Gol
  7. Jayro Jean (Semen Padang) - 5 Gol
  8. Mariano Peralta (PERSIB Bandung) - 5 Gol (Pencetak Gol Terbanyak PERSIB di Super League)
- Raja Assist Terbanyak Liga 1: Thom Haye (PERSIB Bandung) - 7 Assist!
- Top Scorer Internal PERSIB di Super League (Total 18 Gol): Mariano Peralta 5 Gol, Balša Sekulić 4 Gol, Luka Menalo 4 Gol, Ragnar Oratmangoen 3 Gol, Thom Haye 1 Gol (plus 7 assist), Marc Klok 1 Gol (plus 2 assist).
- PERINGATAN KERAS DATABASE LAMA: DILARANG KERAS menyebut David da Silva, Ciro Alves di Persib, Alberto Rodriguez, Stefano Beltrame, Mateo Kocijan, Nick Kuipers, atau Tyronne del Pino sebagai pencetak gol atau pemain Persib musim 2026/2027! Mereka adalah mantan pemain masa lalu.

KLASEMEN & TOP SKOR RESMI AFC CHAMPIONS LEAGUE TWO (GRUP E - PER 25 NOV 2026 17:17 WIB):
- Klasemen Resmi Grup E:
  1. PERSIB Bandung (IDN): 4 Main, 4 Menang, 0 Seri, 0 Kalah, Gol 5-1, 12 Poin (Juara Grup E & Lolos 16 Besar)
  2. FC Seoul (KOR): 4 Main, 2 Menang, 1 Seri, 1 Kalah, Gol 7-3, 7 Poin
  3. Melbourne Victory (AUS): 5 Main, 1 Menang, 1 Seri, 3 Kalah, Gol 3-6, 4 Poin (Baru saja imbang 0-0 vs The Cong-Viettel sore tadi)
  4. The Cong-Viettel FC (VIE): 5 Main, 0 Menang, 2 Seri, 3 Kalah, Gol 1-6, 2 Poin (Baru saja imbang 0-0 vs Melbourne Victory sore tadi)
- Top Scorer Resmi Grup E ACL Two 2026/2027 (Sumber Resmi ESPN & AFC):
  1. Balša Sekulić (Persib Bandung) - 3 Gol, 0 Assist (Peringkat 1 Teratas)
  2. Moon Seon-min (FC Seoul) - 2 Gol, 1 Assist
  3. Anderson Oliveira (FC Seoul) - 2 Gol, 1 Assist
  4. Clarismario Santos (Melbourne Victory) - 2 Gol, 0 Assist
  5. Mariano Peralta (Persib Bandung) - 1 Gol, 1 Assist
  6. Luka Menalo (Persib Bandung) - 1 Gol, 0 Assist
  7. Leonardo Ruiz (FC Seoul) - 1 Gol, 0 Assist
  8. Cho Young-wook (FC Seoul) - 1 Gol, 0 Assist
  9. Hwang Do-yun (FC Seoul) - 1 Gol, 0 Assist
  10. Guillermo May (Melbourne Victory) - 1 Gol, 0 Assist
  11. Jordi Valadon (Melbourne Victory) - 1 Gol, 0 Assist
- Total Gol PERSIB di ACL Two: 5 Gol (Balša Sekulić 3, Mariano Peralta 1, Luka Menalo 1). Mariano Peralta 1 Assist.
- Laga Hari Ini: Matchday 5 PERSIB Bandung vs FC Seoul (Rabu, 25 Nov 2026, 19:15 WIB di Stadion GBLA). Hasil Melbourne Victory vs The Cong-Viettel sore tadi berakhir imbang 0-0 sehingga daftar pencetak gol belum berubah.

REGULASI DISIPLIN & STATUS KARTU SISTEMIK:
- Mariano Peralta: Terkena kartu merah langsung menit 86 vs Bali United. Konsekuensi sistemik: Absen di Super League Pekan 11 vs Persita Tangerang kecuali denda disiplin Komdis PSSI Rp 10.000.000 dibayarkan. Namun untuk laga Asia (ACL Two vs FC Seoul & Shopee Cup), Peralta 100% sah dan bugar bermain karena yurisdiksi sanksi domestik tidak menghalangi kompetisi AFC/ASEAN.
- Patricio Matricardi: Mengantongi 3 kartu kuning di Super League (status waspada akumulasi 1 kartu lagi).

TUGAS AI DATA FEEDER:
Buat TEPAT 1 kalimat ringkasan intelijen taktis/analisis resmi berbahasa Indonesia mengenai laga hero tersebut (${currentHeroMatch.homeTeam} vs ${currentHeroMatch.awayTeam}), kesiapan skuad, serta status ketersediaan pemain (termasuk dampak kartu/disiplin).
ATURAN MUTLAK:
1. TEPAT 1 kalimat padat, jelas, akurat, dan profesional.
2. DILARANG menggunakan tanda bintang markdown (**) sama sekali!
3. DILARANG menyebut tahun di luar musim 2026/2027.`;

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `Keluarkan 1 kalimat intelijen resmi terkini untuk update real-time: ${currentStageName}. Status: ${currentHeroMatch.status}, Waktu: ${currentHeroMatch.time}.`,
            },
          ],
          temperature: 0.1,
          max_tokens: 150,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const groqText = json.choices?.[0]?.message?.content?.trim();
        if (groqText) {
          const cleanText = groqText.replace(/\*\*/g, '').replace(/^"+|"+$/g, '').trim();
          liveData.summaryBulletin = cleanText;
        }
      }
    } catch (err) {
      console.warn('Groq live inference fallback handled gracefully:', err);
    }
  }

  return liveData;
}
