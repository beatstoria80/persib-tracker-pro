'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { MatchShot, MatchPassVector } from '@/types/club';
import { Crosshair, Layers, ChevronRight } from 'lucide-react';

export function ShotMapTactics() {
  const { mode, liveMatch } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeFilter, setActiveFilter] = useState<'all' | 'persib' | 'goals'>('all');
  const [selectedShot, setSelectedShot] = useState<MatchShot | null>(null);

  const filteredShots = liveMatch.shots.filter((s: MatchShot) => {
    if (activeFilter === 'persib') return s.team === 'persib';
    if (activeFilter === 'goals') return s.outcome === 'goal';
    return true;
  });

  const totalPersibShots = liveMatch.shots.filter((s: MatchShot) => s.team === 'persib').length;
  const persibTotalXG = liveMatch.shots
    .filter((s: MatchShot) => s.team === 'persib')
    .reduce((acc: number, curr: MatchShot) => acc + curr.xG, 0)
    .toFixed(2);

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isPro ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              Real-Time Spasial Shot Map & Tactics
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white">
                Opta/StatBomb Standard
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Peta spasial posisi tembakan, kalkulasi xG (Expected Goals), dan dinamika taktik Bojan Hodak
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({liveMatch.shots.length})
          </button>
          <button
            onClick={() => setActiveFilter('persib')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'persib'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Persib Saja ({totalPersibShots})
          </button>
          <button
            onClick={() => setActiveFilter('goals')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'goals'
                ? isPro
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Gol Saja
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6 items-center">
        <div className="lg:col-span-8 relative">
          <div
            className={`w-full aspect-[16/10] rounded-2xl relative overflow-hidden border p-3 select-none ${
              isPro
                ? 'bg-gradient-to-b from-[#061826] to-[#040e17] border-blue-800/60 shadow-[inset_0_0_40px_rgba(0,102,255,0.15)]'
                : 'bg-[#1b432a] border-emerald-900 shadow-inner'
            }`}
          >
            <svg
              className="w-full h-full"
              viewBox="0 0 100 64"
              preserveAspectRatio="none"
              style={{ opacity: isPro ? 0.85 : 0.95 }}
            >
              <defs>
                <pattern id="pitchGrid" width="10" height="64" patternUnits="userSpaceOnUse">
                  <rect width="5" height="64" fill={isPro ? '#0a2233' : '#1f4e31'} opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100" height="64" fill="url(#pitchGrid)" />

              <rect
                x="2"
                y="2"
                width="96"
                height="60"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <line
                x1="50"
                y1="2"
                x2="50"
                y2="62"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <circle
                cx="50"
                cy="32"
                r="9.15"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <circle cx="50" cy="32" r="0.6" fill={isPro ? '#38bdf8' : '#ffffff'} />

              <rect
                x="2"
                y="14"
                width="16.5"
                height="36"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <rect
                x="2"
                y="22"
                width="5.5"
                height="20"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <circle cx="11" cy="32" r="0.6" fill={isPro ? '#38bdf8' : '#ffffff'} />

              <rect
                x="81.5"
                y="14"
                width="16.5"
                height="36"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <rect
                x="92.5"
                y="22"
                width="5.5"
                height="20"
                fill="none"
                stroke={isPro ? '#38bdf8' : '#ffffff'}
                strokeWidth="0.5"
                strokeOpacity={isPro ? '0.4' : '0.7'}
              />
              <circle cx="89" cy="32" r="0.6" fill={isPro ? '#38bdf8' : '#ffffff'} />

              {liveMatch.passVectors.map((vec: MatchPassVector, i: number) => (
                <g key={i}>
                  <line
                    x1={vec.fromX}
                    y1={vec.fromY}
                    x2={vec.toX}
                    y2={vec.toY}
                    stroke={vec.type === 'assist' ? '#fbbf24' : '#38bdf8'}
                    strokeWidth={vec.type === 'assist' ? '0.9' : '0.6'}
                    strokeDasharray={vec.type === 'assist' ? 'none' : '1.5,1'}
                    strokeOpacity={0.8}
                  />
                  <circle
                    cx={vec.toX}
                    cy={vec.toY}
                    r="0.8"
                    fill={vec.type === 'assist' ? '#fbbf24' : '#38bdf8'}
                  />
                </g>
              ))}
            </svg>

            <div className="absolute top-4 left-6 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
              <span>Pertahanan Persib</span>
            </div>
            <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
              <span>Zona Serang Persib</span>
              <ChevronRight className="w-3 h-3 text-cyan-400" />
            </div>

            {filteredShots.map((shot: MatchShot) => {
              const isGoal = shot.outcome === 'goal';
              const isPersib = shot.team === 'persib';
              const dotSize = Math.max(14, Math.round(shot.xG * 28));

              return (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShot(shot)}
                  style={{
                    left: `${shot.x}%`,
                    top: `${shot.y}%`,
                    width: `${dotSize}px`,
                    height: `${dotSize}px`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute rounded-full cursor-pointer transition-transform hover:scale-150 flex items-center justify-center font-mono font-bold text-[8px] z-10 ${
                    isGoal
                      ? isPro
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/50 shadow-[0_0_20px_#f59e0b]'
                        : 'bg-amber-500 text-white ring-2 ring-white shadow-md'
                      : isPersib
                      ? isPro
                        ? 'bg-cyan-400 text-slate-950 ring-2 ring-cyan-400/40 shadow-[0_0_12px_#22d3ee]'
                        : 'bg-blue-500 text-white ring-1 ring-white'
                      : 'bg-rose-500 text-white ring-1 ring-white/60'
                  }`}
                  title={`${shot.player} (${shot.minute}') - xG: ${shot.xG} [${shot.outcome.toUpperCase()}]`}
                >
                  {isGoal ? '★' : `${shot.minute}'`}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs mt-3 text-slate-400 px-1 gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-400/40"></span> Gol (High xG)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span> Tembakan Persib
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span> Tembakan Lawan
              </span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              Klik titik tembakan di lapangan untuk inspect detail
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div
            className={`p-4 rounded-xl border ${
              isPro ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" /> Taktik Bojan Hodak
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {liveMatch.formation.home}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 mb-3">
              {liveMatch.tacticsNote}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-800/60">
              <div>
                <div className="text-[10px] text-slate-400">xG Total</div>
                <div className="text-sm font-mono font-black text-cyan-400">{persibTotalXG}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Shots (Target)</div>
                <div className="text-sm font-mono font-black text-blue-400">
                  {totalPersibShots} ({liveMatch.shotsOnGoal[0]})
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Akurasi Operan</div>
                <div className="text-sm font-mono font-black text-emerald-400">
                  {liveMatch.passAccuracy[0]}%
                </div>
              </div>
            </div>
          </div>

          {selectedShot ? (
            <div
              className={`p-4 rounded-xl border animate-in fade-in duration-200 ${
                isPro
                  ? 'bg-blue-950/40 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
                  Shot Detail #{selectedShot.id.toUpperCase()}
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    selectedShot.outcome === 'goal'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {selectedShot.outcome.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm font-bold text-white mb-1">{selectedShot.player}</div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-cyan-900/40">
                <span>Menit ke-{selectedShot.minute}&apos;</span>
                <span>Expected Goal (xG): <strong className="text-cyan-300 font-mono">{selectedShot.xG}</strong></span>
              </div>
            </div>
          ) : (
            <div
              className={`p-4 rounded-xl border border-dashed text-center text-xs text-slate-400 ${
                isPro ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'
              }`}
            >
              Pilih salah satu titik tembakan di lapangan untuk melihat analisis xG, jarak, dan eksekutor tembakan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
