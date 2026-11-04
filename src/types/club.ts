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

export type TournamentKey = 'liga1' | 'acl2' | 'piala_presiden';

export interface MatchFixture {
  id: string;
  tournament: string;
  tournamentKey: TournamentKey;
  roundOrWeek: string;
  homeTeam: string;
  awayTeam: string;
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
}

export interface LeagueStandingRow {
  rank: number;
  team: string;
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
