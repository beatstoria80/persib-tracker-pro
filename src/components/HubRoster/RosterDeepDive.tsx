'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

  const handleNavigatePlayer = (playerId: string) => {
    try {
      router.push(`/player/${playerId}`);
    } catch {
      window.location.href = `/player/${playerId}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Typography - Compact & High Contrast (Tanpa Menghabiskan Space) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <h1 className={`text-base sm:text-lg font-black tracking-tight uppercase ${isPro ? 'text-white' : 'text-slate-950'}`}>
            Squad 26/27
          </h1>
          <span className={`text-[9.5px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md uppercase ${
            isPro ? 'bg-blue-600/25 border border-blue-400/40 text-cyan-300' : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            Roster Resmi
          </span>
        </div>

        <button
          onClick={() => setFitnessFilter((prev) => (prev === 'ALL' ? 'CEDERA_ONLY' : 'ALL'))}
          className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider transition-all active:scale-95 ${
            fitnessFilter === 'CEDERA_ONLY'
              ? 'bg-rose-600 text-white shadow-sm'
              : isPro
              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          <Activity className="w-3 h-3" />
          <span>{injuredCount} Medis</span>
        </button>
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
                ? 'bg-[#121620] text-slate-200 hover:text-white border border-slate-700/80'
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
              ? 'bg-[#121620] border-slate-700/80 text-slate-300'
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
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-900 shadow-xs'
                  : isPro
                  ? 'text-slate-200 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
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
                ? isPro
                  ? 'bg-cyan-400 text-slate-950 font-black border-transparent shadow-xs'
                  : 'bg-slate-950 text-white border-transparent shadow-xs'
                : isPro
                ? 'bg-[#121620] border-slate-700/80 text-slate-200 hover:text-white'
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
          <Link
            key={player.id}
            href={`/player/${player.id}`}
            prefetch={true}
            className={`block rounded-[28px] border p-4 cursor-pointer active:scale-[0.98] transition-all shadow-md group ${
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
                    <h4 className={`font-black text-sm tracking-tight group-hover:text-cyan-400 transition-colors ${isPro ? 'text-white' : 'text-slate-950'}`}>
                      {player.name}
                    </h4>
                    {player.squadRole === 'starting' && (
                      <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
                        XI
                      </span>
                    )}
                  </div>
                  <div className={`text-[11px] font-medium mt-0.5 ${isPro ? 'text-slate-300' : 'text-slate-500'}`}>
                    {player.nationality} • <strong className={isPro ? 'text-cyan-400' : 'text-blue-600'}>{player.position}</strong> ({player.age} thn)
                  </div>
                </div>
              </div>

              {player.verifiedData && (
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-1" />
              )}
            </div>

            <div className={`mt-3.5 pt-3 border-t flex items-center justify-between text-xs ${isPro ? 'border-slate-800' : 'border-slate-100'}`}>
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />

              <div className="flex items-center gap-2.5 font-mono">
                <span className={`text-[10.5px] ${isPro ? 'text-slate-300' : 'text-slate-500'}`}>
                  G: {player.stats.goals} | A: {player.stats.assists}
                </span>
                <span
                  className={`font-black flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isPro
                      ? 'text-cyan-300 bg-cyan-950/40 border-cyan-800/60 group-hover:bg-cyan-900/80 group-hover:border-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'text-blue-700 bg-blue-50 border-blue-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600'
                  }`}
                >
                  Detail <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
