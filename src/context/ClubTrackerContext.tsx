'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Player,
  GroupTeam,
  TournamentKey,
  MatchFixture,
  LeagueStandingRow,
  TacticalStep,
} from '@/types/club';
import {
  OFFICIAL_SQUAD_2026_2027,
  BRI_LIGA_1_STANDINGS_2026_2027,
  ACL_GROUP_STANDINGS_2026_2027,
  VERIFIED_FIXTURES_2026_2027,
  IGOR_TOLIC_TACTICAL_PLAYBOOK,
} from '@/data/persib-data';

export type AppThemeState = 'minimal' | 'pro';
export type ActiveHub = 'match-center' | 'roster' | 'transparency';
export type MatchDisplayMode = 'official_result' | 'upcoming_schedule' | 'tactical_simulation';

interface ClubTrackerContextType {
  mode: AppThemeState;
  setMode: (mode: AppThemeState) => void;
  toggleMode: () => void;
  activeHub: ActiveHub;
  setActiveHub: (hub: ActiveHub) => void;
  activeTournament: TournamentKey;
  setActiveTournament: (t: TournamentKey) => void;
  matchDisplayMode: MatchDisplayMode;
  setMatchDisplayMode: (m: MatchDisplayMode) => void;
  players: Player[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  fixtures: MatchFixture[];
  liga1Standings: LeagueStandingRow[];
  aclStandings: GroupTeam[];
  updateMatchSimulator: (simulatedPersibWon: boolean, simulatedGoalDiff: number) => void;
  tacticalPlaybook: TacticalStep[];
  activeTacticalStep: number;
  setActiveTacticalStep: (step: number) => void;
  isTacticsPlaying: boolean;
  setIsTacticsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  lastVerifiedDate: string;
}

const ClubTrackerContext = createContext<ClubTrackerContextType | undefined>(undefined);

export function ClubTrackerProvider({ children }: { children: ReactNode }) {
  // REFACTOR: Initialized default state to 'minimal' for Light Bright & High-Contrast visual mode as requested
  const [mode, setMode] = useState<AppThemeState>('minimal');
  const [activeHub, setActiveHub] = useState<ActiveHub>('match-center');
  const [activeTournament, setActiveTournament] = useState<TournamentKey>('liga1');
  const [matchDisplayMode, setMatchDisplayMode] = useState<MatchDisplayMode>('official_result');
  const [players] = useState<Player[]>(OFFICIAL_SQUAD_2026_2027);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [fixtures] = useState<MatchFixture[]>(VERIFIED_FIXTURES_2026_2027);
  const [liga1Standings] = useState<LeagueStandingRow[]>(BRI_LIGA_1_STANDINGS_2026_2027);
  const [aclStandings, setAclStandings] = useState<GroupTeam[]>(ACL_GROUP_STANDINGS_2026_2027);
  const [activeTacticalStep, setActiveTacticalStep] = useState<number>(1);
  const [isTacticsPlaying, setIsTacticsPlaying] = useState<boolean>(false);
  const lastVerifiedDate = 'Update Resmi PT LIB & AFC: Musim 2026/2027 (Pekan 11 - Faktual)';

  const toggleMode = () => {
    setMode((prev: AppThemeState) => (prev === 'minimal' ? 'pro' : 'minimal'));
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg: ServiceWorkerRegistration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Persib Tracker SW registered:', reg.scope);
          }
        })
        .catch((err: unknown) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Persib Tracker SW registration error:', err);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (!isTacticsPlaying) return;

    const interval = setInterval(() => {
      setActiveTacticalStep((prev: number) => (prev < 3 ? prev + 1 : 1));
    }, 2800);

    return () => clearInterval(interval);
  }, [isTacticsPlaying]);

  const updateMatchSimulator = (simulatedPersibWon: boolean, simulatedGoalDiff: number) => {
    const updated = ACL_GROUP_STANDINGS_2026_2027.map((team: GroupTeam) => {
      if (team.isPersib) {
        const extraPoints = simulatedPersibWon ? 3 : 1;
        return {
          ...team,
          played: team.played + 1,
          won: simulatedPersibWon ? team.won + 1 : team.won,
          drawn: !simulatedPersibWon ? team.drawn + 1 : team.drawn,
          gf: team.gf + (simulatedPersibWon ? Math.max(1, simulatedGoalDiff) : 1),
          ga: team.ga + (simulatedPersibWon ? 0 : 1),
          points: team.points + extraPoints,
        };
      }
      return { ...team };
    });

    updated.sort((a: GroupTeam, b: GroupTeam) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      return gdB - gdA;
    });

    setAclStandings(updated);
  };

  return (
    <ClubTrackerContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        activeHub,
        setActiveHub,
        activeTournament,
        setActiveTournament,
        matchDisplayMode,
        setMatchDisplayMode,
        players,
        selectedPlayer,
        setSelectedPlayer,
        fixtures,
        liga1Standings,
        aclStandings,
        updateMatchSimulator,
        tacticalPlaybook: IGOR_TOLIC_TACTICAL_PLAYBOOK,
        activeTacticalStep,
        setActiveTacticalStep,
        isTacticsPlaying,
        setIsTacticsPlaying,
        lastVerifiedDate,
      }}
    >
      <div
        className={`min-h-screen w-full transition-colors duration-500 font-sans ${
          mode === 'pro'
            ? 'bg-[#060B13] text-slate-100 selection:bg-blue-600 selection:text-white'
            // REFACTOR: Enhanced light mode background to high-contrast ultra-bright canvas with deep slate-950 text
            : 'bg-[#F4F6F9] text-slate-950 selection:bg-blue-600 selection:text-white'
        }`}
      >
        {children}
      </div>
    </ClubTrackerContext.Provider>
  );
}

export function useClubTracker(): ClubTrackerContextType {
  const context = useContext(ClubTrackerContext);
  if (!context) {
    throw new Error('useClubTracker must be used within a ClubTrackerProvider');
  }
  return context;
}
