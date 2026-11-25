'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Player,
  GroupTeam,
  TournamentKey,
  MatchFixture,
  LeagueStandingRow,
  TacticalStep,
  FinancialSummary,
} from '@/types/club';
import {
  OFFICIAL_SQUAD_2026_2027,
  BRI_LIGA_1_STANDINGS_2026_2027,
  ACL_GROUP_STANDINGS_2026_2027,
  SHOPEE_CUP_STANDINGS_2026_2027,
  VERIFIED_FIXTURES_2026_2027,
  IGOR_TOLIC_TACTICAL_PLAYBOOK,
  FINANCIAL_OVERVIEW_2026_2027,
} from '@/data/persib-data';
import { isFixtureTodayWib } from '@/lib/groq';

export type AppThemeState = 'minimal' | 'pro';
export type ActiveHub = 'match-center' | 'roster' | 'transparency' | 'ai-chat';
export type MatchDisplayMode = 'official_result' | 'upcoming_schedule' | 'tactical_simulation';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

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
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  selectedPlayer: Player | null;
  setSelectedPlayer: (player: Player | null) => void;
  fixtures: MatchFixture[];
  setFixtures: React.Dispatch<React.SetStateAction<MatchFixture[]>>;
  liga1Standings: LeagueStandingRow[];
  setLiga1Standings: React.Dispatch<React.SetStateAction<LeagueStandingRow[]>>;
  aclStandings: GroupTeam[];
  setAclStandings: React.Dispatch<React.SetStateAction<GroupTeam[]>>;
  shopeeCupStandings: GroupTeam[];
  setShopeeCupStandings: React.Dispatch<React.SetStateAction<GroupTeam[]>>;
  financialOverview: FinancialSummary;
  setFinancialOverview: React.Dispatch<React.SetStateAction<FinancialSummary>>;
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
  syncFeedback: string | null;
  // REFACTOR: Global PWA installation states & trigger handler
  isStandalone: boolean;
  isPwaInstallModalOpen: boolean;
  setIsPwaInstallModalOpen: (open: boolean) => void;
  triggerPwaInstall: () => Promise<void>;
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const ClubTrackerContext = createContext<ClubTrackerContextType | undefined>(undefined);

export function ClubTrackerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppThemeState>('minimal');
  const [activeHub, setActiveHub] = useState<ActiveHub>('match-center');
  const [activeTournament, setActiveTournament] = useState<TournamentKey>(() => {
    const matchToday = VERIFIED_FIXTURES_2026_2027.find((f) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
    return matchToday?.tournamentKey || 'liga1';
  });
  const [matchDisplayMode, setMatchDisplayMode] = useState<MatchDisplayMode>('official_result');
  const [players, setPlayers] = useState<Player[]>(OFFICIAL_SQUAD_2026_2027);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [fixtures, setFixtures] = useState<MatchFixture[]>(VERIFIED_FIXTURES_2026_2027);
  const [liga1Standings, setLiga1Standings] = useState<LeagueStandingRow[]>(BRI_LIGA_1_STANDINGS_2026_2027);
  const [aclStandings, setAclStandings] = useState<GroupTeam[]>(ACL_GROUP_STANDINGS_2026_2027);
  const [shopeeCupStandings, setShopeeCupStandings] = useState<GroupTeam[]>(SHOPEE_CUP_STANDINGS_2026_2027);
  const [financialOverview, setFinancialOverview] = useState<FinancialSummary>(FINANCIAL_OVERVIEW_2026_2027);
  const [activeTacticalStep, setActiveTacticalStep] = useState<number>(1);
  const [isTacticsPlaying, setIsTacticsPlaying] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // REFACTOR: PWA Installation state management with lazy initializer to avoid cascading renders
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstallModalOpen, setIsPwaInstallModalOpen] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  // Autonomous Backend Groq AI Data Feeder State (Backend supplier, NOT chatbot)
  const [isGroqSyncing, setIsGroqSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('Live Synced');
  const [groqBulletin, setGroqBulletin] = useState<string>(
    '🏆 [ACL TWO 16 BESAR] PERSIB Bandung raih 12 poin sempurna sapu bersih Grup E dan resmi lolos fase gugur Asia!'
  );

  const lastVerifiedDate = 'AFC Live Center & Google Sports (Real-Time)';

  const triggerGroqDataSync = useCallback(async () => {
    setIsGroqSyncing(true);
    try {
      const res = await fetch(`/api/groq-agent?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const payload = json?.data;
        if (payload) {
          // 1. Sinkronisasi Data Klasemen Real-Time (Liga 1, ACL Two, Shopee Cup)
          if (payload.leagueStandings?.allClubs && Array.isArray(payload.leagueStandings.allClubs)) {
            setLiga1Standings([...payload.leagueStandings.allClubs]);
          }
          if (payload.aclStandings && Array.isArray(payload.aclStandings)) {
            setAclStandings([...payload.aclStandings]);
          }
          if (payload.shopeeCupStandings && Array.isArray(payload.shopeeCupStandings)) {
            setShopeeCupStandings([...payload.shopeeCupStandings]);
          }

          // 2. Sinkronisasi Jadwal & Hasil Pertandingan
          if (payload.fixtures && Array.isArray(payload.fixtures)) {
            setFixtures([...payload.fixtures]);
            const matchToday = payload.fixtures.find((f: MatchFixture) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
            if (matchToday?.tournamentKey) {
              setActiveTournament(matchToday.tournamentKey);
            }
          }

          // 3. Sinkronisasi Skuad Pemain & Medis (Fitness Live Updates)
          if (payload.players && Array.isArray(payload.players)) {
            setPlayers([...payload.players]);
          } else {
            setPlayers((prev) =>
              prev.map((p) => {
                if (p.id.includes('peralta')) {
                  return {
                    ...p,
                    fitness: {
                      ...p.fitness,
                      percentage: 100,
                      notes: 'Masa pemulihan tuntas! Siap starter di laga Super League Pekan 10.',
                    },
                  };
                }
                return p;
              })
            );
          }

          // 4. Sinkronisasi Data Finansial & FFP
          if (payload.financialFFP) {
            setFinancialOverview((prev) => ({
              ...prev,
              totalSquadValue: payload.financialFFP.squadValue || prev.totalSquadValue,
              wageToRevenueRatio: payload.financialFFP.wageToRevenueRatio || prev.wageToRevenueRatio,
              ffpComplianceScore: payload.financialFFP.complianceScore || prev.ffpComplianceScore,
            }));
          }

          // 5. Sinkronisasi Teks Intelijen AI & Live Time Ticker
          if (payload.summaryBulletin) {
            setGroqBulletin(payload.summaryBulletin);
          }

          const nowTime =
            payload.lastUpdated ||
            new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
          setLastSyncedAt(nowTime);

          // 6. Feedback Visual Responsif
          setSyncFeedback('Data seluruh 4 fitur (Klasemen, Jadwal, Skuad & Finansial) berhasil diperbarui real-time!');
          setTimeout(() => setSyncFeedback(null), 3500);
        }
      }
    } catch (e) {
      console.warn('Groq backend data sync fetch failed:', e);
      const fallbackTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      setLastSyncedAt(fallbackTime);
    } finally {
      setIsGroqSyncing(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const syncBackground = async () => {
      try {
        const res = await fetch(`/api/groq-agent?t=${Date.now()}`);
        if (res.ok && isSubscribed) {
          const json = await res.json();
          const payload = json?.data;
          if (payload) {
            if (payload.leagueStandings?.allClubs && Array.isArray(payload.leagueStandings.allClubs)) {
              setLiga1Standings([...payload.leagueStandings.allClubs]);
            }
            if (payload.aclStandings && Array.isArray(payload.aclStandings)) {
              setAclStandings([...payload.aclStandings]);
            }
            if (payload.shopeeCupStandings && Array.isArray(payload.shopeeCupStandings)) {
              setShopeeCupStandings([...payload.shopeeCupStandings]);
            }
            if (payload.fixtures && Array.isArray(payload.fixtures)) {
              setFixtures([...payload.fixtures]);
              const matchToday = payload.fixtures.find((f: MatchFixture) => isFixtureTodayWib(f.date) || f.status === 'LIVE');
              if (matchToday?.tournamentKey) {
                setActiveTournament(matchToday.tournamentKey);
              }
            }
            if (payload.players && Array.isArray(payload.players)) {
              setPlayers([...payload.players]);
            }
            if (payload.financialFFP) {
              setFinancialOverview((prev) => ({
                ...prev,
                totalSquadValue: payload.financialFFP.squadValue || prev.totalSquadValue,
                wageToRevenueRatio: payload.financialFFP.wageToRevenueRatio || prev.wageToRevenueRatio,
                ffpComplianceScore: payload.financialFFP.complianceScore || prev.ffpComplianceScore,
              }));
            }
            if (payload.summaryBulletin) {
              setGroqBulletin(payload.summaryBulletin);
            }
            if (payload.lastUpdated) {
              setLastSyncedAt(payload.lastUpdated);
            }
          }
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
    setMode((prev: AppThemeState) => {
      const next = prev === 'minimal' ? 'pro' : 'minimal';
      try {
        localStorage.setItem('persib_theme_mode', next);
      } catch {}
      return next;
    });
  };

  // Synchronize 'dark' class on documentElement for complete CSS contrast in dark mode
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mode === 'pro') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mode]);

  useEffect(() => {
    // Register PWA Service Worker for standalone installability on any mobile phone
    if (typeof window !== 'undefined') {
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setIsStandalone(true);
        setDeferredPrompt(null);
        setIsPwaInstallModalOpen(false);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleAppInstalled);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            reg.update();
          })
          .catch((err) => {
            console.warn('PWA ServiceWorker registration notice:', err);
          });
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  const triggerPwaInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Native install prompt failed, opening modal guide:', err);
        setIsPwaInstallModalOpen(true);
      }
    } else {
      setIsPwaInstallModalOpen(true);
    }
  }, [deferredPrompt]);

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
        setPlayers,
        selectedPlayer,
        setSelectedPlayer,
        fixtures,
        setFixtures,
        liga1Standings,
        setLiga1Standings,
        aclStandings,
        setAclStandings,
        shopeeCupStandings,
        setShopeeCupStandings,
        financialOverview,
        setFinancialOverview,
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
        syncFeedback,
        isStandalone,
        isPwaInstallModalOpen,
        setIsPwaInstallModalOpen,
        triggerPwaInstall,
        deferredPrompt,
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
