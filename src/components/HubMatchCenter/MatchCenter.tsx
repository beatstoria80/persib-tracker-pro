'use client';

import React from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { ScenarioSimulator } from './ScenarioSimulator';
import { ShotMapTactics } from './ShotMapTactics';
import { MapPin, Award } from 'lucide-react';

export function MatchCenter() {
  const { mode, liveMatch } = useClubTracker();
  const isPro = mode === 'pro';

  return (
    <div className="space-y-6">
      <div
        className={`rounded-3xl border overflow-hidden relative transition-all duration-300 ${
          isPro
            ? 'bg-gradient-to-br from-[#0c192c] via-[#091220] to-[#050912] border-blue-900/60 shadow-[0_8px_40px_rgba(0,102,255,0.18)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {isPro && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400"></div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-200/40 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                <Award className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                  {liveMatch.tournament}
                </div>
                <div className="text-sm font-semibold text-slate-300">{liveMatch.stage}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider ${
                  isPro
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span>LIVE {liveMatch.currentMinute}&apos;</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{liveMatch.venue}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center py-8 gap-6">
            <div className="flex items-center md:justify-end gap-4 text-left md:text-right">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{liveMatch.homeTeam}</h2>
                <div className="text-xs text-slate-400 mt-1">Bojan Hodak • 4-3-3 Attack</div>
                <div className="text-xs text-emerald-400 font-mono mt-0.5">David da Silva (28&apos;, 67&apos;)</div>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                  isPro
                    ? 'bg-blue-600 text-amber-300 ring-2 ring-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.5)]'
                    : 'bg-blue-700 text-white'
                }`}
              >
                PSB
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-4">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-blue-500 dark:text-cyan-300">
                  {liveMatch.homeScore}
                </span>
                <span className="text-3xl font-light text-slate-400">:</span>
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-600 dark:text-slate-300">
                  {liveMatch.awayScore}
                </span>
              </div>
              <div className="mt-2 text-xs font-mono uppercase tracking-widest text-slate-400">
                Menit {liveMatch.currentMinute} (Babak Kedua)
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 ${
                  isPro ? 'bg-slate-800 text-rose-400 ring-1 ring-slate-700' : 'bg-slate-200 text-slate-700'
                }`}
              >
                PFC
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{liveMatch.awayTeam}</h2>
                <div className="text-xs text-slate-400 mt-1">Rangsan Viwatchaichok • 5-3-2</div>
                <div className="text-xs text-rose-400 font-mono mt-0.5">Bordin Phala (42&apos;)</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs font-mono font-bold mb-2">
              <span className="text-blue-400">Penguasaan Bola: {liveMatch.possession[0]}%</span>
              <span className="text-slate-400">Port FC: {liveMatch.possession[1]}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800 flex">
              <div
                style={{ width: `${liveMatch.possession[0]}%` }}
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500"
              />
              <div
                style={{ width: `${liveMatch.possession[1]}%` }}
                className="h-full bg-slate-600 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      <ShotMapTactics />

      <ScenarioSimulator />
    </div>
  );
}
