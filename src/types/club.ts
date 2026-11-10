export type PlayerCategory = 'senior' | 'academy' | 'women';

export type SquadRole = 'starting' | 'substitute' | 'reserve';

export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export type FitnessStatus = 'fit' | 'latihan_terpisah' | 'cedera';

export interface PlayerStats {
  minutesPlayed: number;
  appearances: number;
  goals: number;
  assists: number;
  passAccuracy: number;
  interceptions: number;
  tackles: number;
  shotsOnTarget: number;
  rating: number;
  heatmapCoords: Array<{ x: number; y: number; intensity: number }>;
}

export interface Player {
  id: string;
  name: string;
  fullName: string;
  number: number;
  position: Position;
  category: PlayerCategory;
  squadRole: SquadRole;
  nationality: string;
  age: number;
  marketValue: string;
  contractUntil: string;
  verifiedData: boolean;
  fitness: {
    status: FitnessStatus;
    percentage: number;
    injuryType?: string;
    estimatedReturn?: string;
    notes?: string;
  };
  stats: PlayerStats;
  avatarUrl?: string;
}

export interface MatchShot {
  id: string;
  minute: number;
  player: string;
  team: 'persib' | 'opponent';
  x: number;
  y: number;
  outcome: 'goal' | 'saved' | 'blocked' | 'off_target';
  xG: number;
}

export interface MatchPassVector {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromPlayer: string;
  toPlayer: string;
  type: 'key' | 'normal' | 'assist';
}

export interface TacticalPlayerPos {
  id: string;
  name: string;
  number: number;
  x: number;
  y: number;
}

export interface TacticalStep {
  step: number;
  label: string;
  description: string;
  ballPos: { x: number; y: number };
  playerPositions: TacticalPlayerPos[];
}

export type TournamentKey = 'liga1' | 'acl2' | 'piala_presiden' | 'shopee_cup';

export interface MatchEventItem {
  minute: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'chance';
  team: 'home' | 'away';
  player: string;
  assistBy?: string;
  detail?: string;
}

export interface MatchStatsSummary {
  possession: [number, number]; // [home, away] %
  shotsOnTarget: [number, number];
  totalShots: [number, number];
  passAccuracy: [number, number]; // %
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  saves: [number, number];
}

export interface ClubPlayerProfile {
  id: string;
  name: string;
  fullName?: string;
  number: number;
  position: string;
  roleBadge?: string;
  nationality: string;
  marketValue: string;
  avatarUrl?: string;
  isStarting: boolean;
  fitnessPercentage: number;
  rating?: number;
  keyStat: string;
  tacticalRole?: string;
  pitchX?: number; // 0-100 vertical position on pitch
  pitchY?: number; // 0-100 horizontal position on pitch
}

export interface TacticalDuelMatchup {
  id: string;
  title: string;
  zone: string;
  persibPlayer: {
    name: string;
    number: number;
    position: string;
    rating: number;
    avatarUrl?: string;
  };
  opponentPlayer: {
    name: string;
    number: number;
    position: string;
    rating: number;
    avatarUrl?: string;
  };
  keyInsight: string;
  winProbability: [number, number]; // [persib %, opponent %]
}

export interface LiveMomentumPoint {
  minute: number;
  persibPressure: number; // 0 - 100
  opponentPressure: number; // 0 - 100
  highlight?: string;
}

export interface MatchFixture {
  id: string;
  tournament: string;
  tournamentKey: TournamentKey;
  roundOrWeek: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  date: string;
  time: string;
  venue: string;
  status: 'LIVE' | 'FINISHED' | 'SCHEDULED' | 'SIMULATION';
  liveMinute?: string;
  aggregateScore?: string;
  highlights?: string[];
  events?: Array<{ minute: string; type: 'goal' | 'card' | 'sub' | 'chance'; text: string }>;
  detailedEvents?: MatchEventItem[];
  statsSummary?: MatchStatsSummary;
  opponentSquad?: {
    startingXI: ClubPlayerProfile[];
    substitutes: ClubPlayerProfile[];
  };
  persibLineup?: {
    startingXI: ClubPlayerProfile[];
    substitutes: ClubPlayerProfile[];
  };
  tacticalDuels?: TacticalDuelMatchup[];
  liveMomentumTimeline?: LiveMomentumPoint[];
}

export interface LeagueStandingRow {
  rank: number;
  team: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
  isPersib?: boolean;
  form: Array<'W' | 'D' | 'L'>;
}

export interface GroupTeam {
  name: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  isPersib?: boolean;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  location: string;
  capacity: string;
  pitchType: string;
  conditionScore: number;
  drainageRate: string;
  lightingLux: number;
  status: 'Ready' | 'Maintenance' | 'Refurbishment';
  lastInspection: string;
  notes: string;
}

export interface ManagementPerson {
  role: string;
  name: string;
  nationality: string;
  license?: string;
  tenureStart: string;
  department: 'Direksi' | 'Kepelatihan' | 'Medis & Analitik';
}

export type ManagementMember = ManagementPerson;

export interface FinancialSummary {
  season: string;
  totalSquadValue: string;
  ffpComplianceScore: number;
  wageToRevenueRatio: string;
  auditedBy: string;
  verifiedSource: string;
}

export interface ClubTacticalStrength {
  title: string;
  rating: number; // 1-100
  description: string;
}

export interface ClubKeyPlayer {
  name: string;
  position: string;
  number: number;
  marketValue: string;
  avatarUrl?: string;
  keyStat: string;
}

export interface ClubAnalysisProfile {
  id: string;
  name: string;
  shortName: string;
  nickname: string;
  logoUrl: string;
  city: string;
  foundedYear: number;
  stadium: string;
  stadiumCapacity: string;
  headCoach: string;
  headCoachNationality: string;
  headCoachPhotoUrl?: string;
  squadPhotoUrl?: string;
  preferredFormation: string;
  squadMarketValue: string;
  tacticalStyle: string;
  attackRating: number;
  defenseRating: number;
  tacticalFlexibility: number;
  strengths: ClubTacticalStrength[];
  weaknesses: string[];
  keyPlayers: ClubKeyPlayer[];
  headToHeadVsPersib: {
    lastMeetingScore: string;
    lastMeetingDate: string;
    totalWinsVsPersib: number;
    drawsVsPersib: number;
    lossesVsPersib: number;
    scoutingReport: string;
  };
  verifiedBy: string;
}
