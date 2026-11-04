'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  isGroqSyncing: boolean;
  lastSyncedAt: string;
  groqBulletin: string;
  triggerGroqDataSync: () => Promise<void>;
}

const ClubTrackerContext = createContext<ClubTrackerContextType | undefined>(undefined);

export function ClubTrackerProvider({ children }: { children: ReactNode }) {
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

  // Autonomous Backend Groq AI Data Feeder State (Backend supplier, NOT chatbot)
  const [isGroqSyncing, setIsGroqSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Live Synced');
  const [groqBulletin, setGroqBulletin] = useState<string>(
    '🏆 HASIL AKHIR ACL TWO: Melbourne Victory 1 - 2 PERSIB Bandung (FT)! Comeback dramatis gol Luka Menalo (85\') dan masa injury time (90+2\') bawa Persib raih 12 poin sempurna & lolos ke Babak 16 Besar sebagai Juara Grup E!'
  );

  const lastVerifiedDate = 'AFC Live Center & Google Sports (Real-Time)';

  const triggerGroqDataSync = useCallback(async () => {
    setIsGroqSyncing(true);
    try {
      const res = await fetch('/api/groq-agent');
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.summaryBulletin) {
          setGroqBulletin(json.data.summaryBulletin);
        }
        setLastSyncedAt(json?.data?.lastUpdated || 'Baru Saja');
      }
    } catch (e) {
      console.warn('Groq backend data sync fetch failed:', e);
    } finally {
      setIsGroqSyncing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const syncBackground = async () => {
      try {
        const res = await fetch('/api/groq-agent');
        if (res.ok && isSubscribed) {
          const json = await res.json();
          if (json?.data?.summaryBulletin) {
            setGroqBulletin(json.data.summaryBulletin);
          }
          setLastSyncedAt(json?.data?.lastUpdated || 'Baru Saja');
        }
      } catch (e) {
        console.warn('Groq backend data sync error:', e);
      }
    };

    // Trigger initial background fetch asynchronously
    const timeout = setTimeout(() => {
      syncBackground();
    }, 100);

    const interval = setInterval(syncBackground, 25000);

    return () => {
      isSubscribed = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const toggleMode = () => {
    setMode((prev: AppThemeState) => (prev === 'minimal' ? 'pro' : 'minimal'));
  };

  useEffect(() => {
    // Purge stale Service Workers and browser CacheStorage to prevent cache-locking
    if (typeof window !== 'undefined') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }
    }
  }, []);

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
        isGroqSyncing,
        lastSyncedAt,
        groqBulletin,
        triggerGroqDataSync,
      }}
    >
      <div
        className={`min-h-screen w-full transition-colors duration-500 font-sans ${
          mode === 'pro'
            ? 'bg-[#060B13] text-slate-100 selection:bg-blue-600 selection:text-white'
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
