'use client';

import React from 'react';
import { useClubTracker, ActiveHub } from '@/context/ClubTrackerContext';
import { ShieldCheck, Trophy, Users, Building2, Zap, Sparkles } from 'lucide-react';

export function Header() {
  const { mode, toggleMode, activeHub, setActiveHub } = useClubTracker();

  const isPro = mode === 'pro';

  const hubs: { id: ActiveHub; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'match-center', label: 'Match Center', icon: <Trophy className="w-4 h-4" />, badge: 'Liga 1 Juara' },
    { id: 'roster', label: 'Roster & Fitness', icon: <Users className="w-4 h-4" /> },
    { id: 'transparency', label: 'Corporate & Finance', icon: <Building2 className="w-4 h-4" />, badge: 'Verified' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${
        isPro
          ? 'bg-[#060B13]/85 border-blue-900/40 text-slate-100 shadow-[0_4px_30px_rgba(0,102,255,0.08)]'
          : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-black tracking-wider text-lg shadow-md transition-all duration-300 ${
                  isPro
                    ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-amber-300 ring-2 ring-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                    : 'bg-blue-700 text-white ring-1 ring-slate-300'
                }`}
              >
                P1933
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight uppercase">
                  Persib <span className={isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300 font-black' : 'text-blue-700'}>Tracker</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-blue-950/80 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> Verified Data
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Real-Time Sports Intelligence • BRI Liga 1 & ACL Two
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            {hubs.map((hub) => {
              const active = activeHub === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => setActiveHub(hub.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? isPro
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                        : 'bg-white text-blue-700 shadow-sm border border-slate-200'
                      : isPro
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  {hub.icon}
                  {hub.label}
                  {hub.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
                        isPro
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {hub.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMode}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 border ${
                isPro
                  ? 'bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-cyan-500/20 border-cyan-400/50 text-cyan-200 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400 shadow-sm'
              }`}
            >
              {isPro ? (
                <>
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
                  <span className="hidden sm:inline">STATE B:</span>
                  <span className="text-amber-300 font-extrabold uppercase">PRO LIVE</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">STATE A:</span>
                  <span className="text-blue-700 font-bold uppercase">MINIMAL DAY</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-200 dark:border-slate-800">
          {hubs.map((hub) => {
            const active = activeHub === hub.id;
            return (
              <button
                key={hub.id}
                onClick={() => setActiveHub(hub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  active
                    ? isPro
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-700 text-white'
                    : isPro
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                {hub.icon}
                <span>{hub.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
