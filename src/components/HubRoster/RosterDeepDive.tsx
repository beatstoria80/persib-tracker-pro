'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { PlayerCategory, Position, SquadRole, Player } from '@/types/club';
import { FitnessTrackerBadge } from './FitnessTrackerBadge';
import { ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { PlayerAvatar } from '@/components/PlayerAvatar';

export function RosterDeepDive() {
  const router = useRouter();
  const { mode, players } = useClubTracker();
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
    <div className="space-y-5">
      {/* 1. Header Typography */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
            Official Roster & Medical
          </span>
          <button
            onClick={() => setFitnessFilter((prev) => (prev === 'ALL' ? 'CEDERA_ONLY' : 'ALL'))}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
              fitnessFilter === 'CEDERA_ONLY'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>{injuredCount} Medis</span>
          </button>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          SQUAD 26/27
        </h1>
      </div>

      {/* 2. Category Pills Selector (Minimalist Horizontal Bar) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {(
          [
            { id: 'senior', label: 'Senior Team' },
            { id: 'academy', label: 'Akademi U-20' },
            { id: 'women', label: 'Persib Putri' },
          ] as const
        ).map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              setRoleFilter('ALL');
            }}
            className={`px-4 py-2 rounded-full text-xs font-black tracking-tight transition-all shrink-0 ${
              activeCategory === cat.id
                ? isPro
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-blue-700 text-white shadow-md shadow-blue-700/25'
                : isPro
                ? 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Sub-Filters: Starting XI vs Cadangan & Posisi */}
      {activeCategory === 'senior' && (
        <div
          className={`p-1.5 rounded-2xl border flex items-center justify-between text-xs font-bold ${
            isPro
              ? 'bg-[#121620] border-slate-800 text-slate-400'
              : 'bg-white border-slate-200 text-slate-600 shadow-xs'
          }`}
        >
          {(
            [
              { id: 'ALL', label: 'Semua Skuad' },
              { id: 'starting', label: 'Starting XI' },
              { id: 'substitute', label: 'Cadangan' },
            ] as const
          ).map((role) => (
            <button
              key={role.id}
              onClick={() => setRoleFilter(role.id)}
              className={`flex-1 py-2 rounded-xl text-[11px] font-extrabold transition-all text-center ${
                roleFilter === role.id
                  ? isPro
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'bg-blue-50 text-blue-900 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      )}

      {/* Position Quick Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {(['ALL', 'GK', 'DF', 'MF', 'FW'] as const).map((pos) => (
          <button
            key={pos}
            onClick={() => setSelectedPosition(pos)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all shrink-0 border ${
              selectedPosition === pos
                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-xs'
                : isPro
                ? 'bg-[#121620] border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {pos === 'ALL' ? 'Semua Posisi' : pos}
          </button>
        ))}
      </div>

      {/* 4. Player Cards Stack (Rounded [28px], Spacious, High Visual Punch) */}
      <div className="space-y-3">
        {filteredPlayers.map((player: Player) => (
          <div
            key={player.id}
            // // REFACTOR: Direct navigation to player profile page without popup card modal
            onClick={() => router.push(`/player/${player.id}`)}
            className={`rounded-[28px] border p-4 cursor-pointer active:scale-[0.98] transition-all shadow-md ${
              isPro
                ? 'bg-[#121620] border-slate-800 hover:border-cyan-400/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                : 'bg-white border-slate-200 hover:border-blue-600 shadow-[0_4px_15px_rgba(0,0,0,0.04)]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <PlayerAvatar
                  name={player.name}
                  number={player.number}
                  avatarUrl={player.avatarUrl}
                  position={player.position}
                  isStarting={player.squadRole === 'starting'}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm tracking-tight text-slate-950 dark:text-white">
                      {player.name}
                    </h4>
                    {player.squadRole === 'starting' && (
                      <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
                        XI
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {player.nationality} • <strong className="text-blue-600 dark:text-cyan-400">{player.position}</strong> ({player.age} thn)
                  </div>
                </div>
              </div>

              {player.verifiedData && (
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-1" />
              )}
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />

              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-400 text-[10.5px]">G: {player.stats.goals} | A: {player.stats.assists}</span>
                <span className="text-blue-600 dark:text-cyan-400 font-black flex items-center text-xs">
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
