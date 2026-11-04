export type PlayerCategory = 'senior' | 'academy' | 'women';

export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export type FitnessStatus = 'fit' | 'latihan_terpisah' | 'cedera';

export interface PlayerStats {
  minutesPlayed: number;
  appearances: number;
  goals: number;
  assists: number;
  passAccuracy: number; // percentage
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
  nationality: string;
  age: number;
  marketValue: string; // e.g., "€400K" / "Rp 6.95 M"
  contractUntil: string; // e.g., "31 Mei 2026"
  verifiedData: boolean;
  fitness: {
    status: FitnessStatus;
    percentage: number; // 0 - 100%
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
  x: number; // 0-100 percentage of pitch
  y: number; // 0-100 percentage of pitch
  outcome: 'goal' | 'saved' | 'blocked' | 'off_target';
  xG: number;
}

export interface MatchPassVector {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  type: 'key' | 'normal' | 'assist';
}

export interface LiveMatchData {
  id: string;
  tournament: 'ACL Two' | 'BRI Liga 1';
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  currentMinute: number;
  status: 'LIVE' | 'SCHEDULED' | 'FINISHED';
  venue: string;
  formation: {
    home: string; // e.g. "4-3-3"
    away: string;
  };
  tacticsNote: string;
  shots: MatchShot[];
  passVectors: MatchPassVector[];
  possession: [number, number]; // [home, away]
  passAccuracy: [number, number];
  shotsOnGoal: [number, number];
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
  conditionScore: number; // 0 - 100
  drainageRate: string; // e.g. "85 mm/jam"
  lightingLux: number; // e.g. 1800 Lux
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

export interface FinancialSummary {
  season: string;
  totalSquadValue: string; // e.g. "Rp 94.5 M"
  ffpComplianceScore: number; // 94%
  wageToRevenueRatio: string; // "52% (Safe < 70%)"
  auditedBy: string;
  verifiedSource: string;
}

