'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { PlayerCategory, Position, SquadRole, Player } from '@/types/club';
import { PlayerDetailModal } from './PlayerDetailModal';
import { FitnessTrackerBadge } from './FitnessTrackerBadge';
import { Filter, ShieldCheck, ChevronRight, Activity, Award } from 'lucide-react';

export function RosterDeepDive() {
  const { mode, players, selectedPlayer, setSelectedPlayer } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeCategory, setActiveCategory] = useState<PlayerCategory>('senior');
  const [roleFilter, setRoleFilter] = useState<SquadRole | 'ALL'>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [fitnessFilter, setFitnessFilter] = useState<'ALL' | 'CEDERA_ONLY'>('ALL');

  const filteredPlayers: Player[] = players.filter((p: Player) => {
    if (p.category !== activeCategory) return false;
    if (roleFilter !== 'ALL' && p.squadRole !== roleFilter) return false;
    if (selectedPosition !== 'ALL' && p.position !== selectedPosition) return false;
    if (fitnessFilter === 'CEDERA_ONLY' && p.fitness.status === 'fit') return false;
    return true;
  });

  const injuredCount = players.filter(
    (p: Player) => p.category === activeCategory && p.fitness.status !== 'fit'
  ).length;

  return (
    <div className="space-y-4">
      {/* Category & Filters Header */}
      <div
        className={`rounded-2xl border p-3.5 transition-all duration-300 ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-sm'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
              isPro
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}
          >
            <Award className="w-3 h-3" /> Skuad Resmi 2026/2027
          </span>

          <div
            onClick={() => setFitnessFilter((prev) => (prev === 'ALL' ? 'CEDERA_ONLY' : 'ALL'))}
            className={`cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
              injuredCount > 0
                ? fitnessFilter === 'CEDERA_ONLY'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Activity className="w-3 h-3 text-rose-500" />
            <span>{injuredCount} Medis</span>
          </div>
        </div>

        {/* Category Horizontal Scrollable Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => {
              setActiveCategory('senior');
              setRoleFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeCategory === 'senior'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Tim Senior
          </button>

          <button
            onClick={() => {
              setActiveCategory('academy');
              setRoleFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeCategory === 'academy'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Akademi U-20
          </button>

          <button
            onClick={() => {
              setActiveCategory('women');
              setRoleFilter('ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeCategory === 'women'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Persib Putri
          </button>
        </div>

        {/* Sub-Filters: Starting XI vs Substitutes */}
        {activeCategory === 'senior' && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 ${
                roleFilter === 'ALL'
                  ? 'bg-blue-700 text-white font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setRoleFilter('starting')}
              className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 ${
                roleFilter === 'starting'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Starting XI
            </button>
            <button
              onClick={() => setRoleFilter('substitute')}
              className={`px-2 py-0.5 rounded-lg font-semibold shrink-0 ${
                roleFilter === 'substitute'
                  ? 'bg-blue-600 text-white font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Cadangan
            </button>
          </div>
        )}

        {/* Position Filter Chips */}
        <div className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 mr-1 flex items-center gap-0.5 shrink-0">
            <Filter className="w-3 h-3" /> Pos:
          </span>
          {(['ALL', 'FW', 'MF', 'DF', 'GK'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all shrink-0 ${
                selectedPosition === pos
                  ? isPro
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-blue-100 text-blue-900 border border-blue-400'
                  : isPro
                  ? 'text-slate-400'
                  : 'text-slate-600 bg-slate-50'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Player Cards Stack (1-column touch-friendly list) */}
      <div className="space-y-2.5">
        {filteredPlayers.map((player: Player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className={`rounded-2xl border p-3.5 cursor-pointer active:scale-[0.98] transition-all ${
              isPro
                ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-cyan-400/60 shadow-sm'
                : 'bg-white border-slate-300 hover:border-blue-600 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    player.squadRole === 'starting'
                      ? 'bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-sm'
                      : isPro
                      ? 'bg-slate-800 text-cyan-300'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  #{player.number}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`font-black text-sm tracking-tight ${
                        isPro ? 'text-slate-100' : 'text-slate-950'
                      }`}
                    >
                      {player.name}
                    </h4>
                    {player.squadRole === 'starting' && (
                      <span className="text-[8px] font-mono font-bold uppercase px-1 rounded bg-amber-400 text-slate-950">
                        XI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {player.nationality} • <strong className="text-blue-600">{player.position}</strong> ({player.age} thn)
                  </div>
                </div>
              </div>

              {player.verifiedData && (
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-1" />
              )}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />

              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-500 text-[10px]">G: {player.stats.goals} | A: {player.stats.assists}</span>
                <span className="text-blue-600 font-bold flex items-center">
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
}
