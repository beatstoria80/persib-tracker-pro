'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, LiveMatchData, GroupTeam } from '@/types/club';
import { INITIAL_PLAYERS, LIVE_MATCH_MOCK, ACL_GROUP_F_STANDINGS } from '@/data/persib-data';

export type AppThemeState = 'minimal' | 'pro';
export type ActiveHub = 'roster' | 'match-center' | 'transparency';

interface ClubTrackerContextType {
  mode: AppThemeState;
  setMode: (mode: AppThemeState) => void;
  toggleMode: () => void;
  activeHub: ActiveHub;
  setActiveHub: (hub: ActiveHub) => void;
  players: Player[];
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  liveMatch: LiveMatchData;
  aclStandings: GroupTeam[];
  updateMatchSimulator: (simulatedPersibWon: boolean, simulatedGoalDiff: number) => void;
  isStreaming: boolean;
  toggleStreaming: () => void;
  lastUpdateTimestamp: string;
}

const ClubTrackerContext = createContext<ClubTrackerContextType | undefined>(undefined);

export function ClubTrackerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppThemeState>('pro');
  const [activeHub, setActiveHub] = useState<ActiveHub>('match-center');
  const [players] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [liveMatch, setLiveMatch] = useState<LiveMatchData>(LIVE_MATCH_MOCK);
  const [aclStandings, setAclStandings] = useState<GroupTeam[]>(ACL_GROUP_F_STANDINGS);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState<string>('Live (1 Detik Lalu)');

  const toggleMode = () => {
    setMode((prev: AppThemeState) => (prev === 'minimal' ? 'pro' : 'minimal'));
  };

  const toggleStreaming = () => {
    setIsStreaming((prev: boolean) => !prev);
  };

  // PWA Service Worker Registration
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

  // Real-time ticker simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setLiveMatch((prev: LiveMatchData) => {
        const nextMin = prev.currentMinute < 90 ? prev.currentMinute + 1 : 1;
        return {
          ...prev,
          currentMinute: nextMin,
          possession: [
            Math.min(65, Math.max(48, prev.possession[0] + (Math.random() > 0.5 ? 1 : -1))),
            100 - Math.min(65, Math.max(48, prev.possession[0] + (Math.random() > 0.5 ? 1 : -1))),
          ],
        };
      });
      setLastUpdateTimestamp(new Date().toLocaleTimeString('id-ID', { hour12: false }));
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const updateMatchSimulator = (simulatedPersibWon: boolean, simulatedGoalDiff: number) => {
    const updated = ACL_GROUP_F_STANDINGS.map((team: GroupTeam) => {
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
        players,
        selectedPlayer,
        setSelectedPlayer,
        liveMatch,
        aclStandings,
        updateMatchSimulator,
        isStreaming,
        toggleStreaming,
        lastUpdateTimestamp,
      }}
    >
      <div
        className={`min-h-screen w-full transition-colors duration-500 font-sans ${
          mode === 'pro'
            ? 'bg-[#060B13] text-slate-100 selection:bg-blue-600 selection:text-white'
            : 'bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-900'
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
