'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { PlayerCategory, Position, SquadRole, Player } from '@/types/club';
import { PlayerDetailModal } from './PlayerDetailModal';
import { FitnessTrackerBadge } from './FitnessTrackerBadge';
import { Users, Filter, ShieldCheck, ChevronRight, Activity, Award } from 'lucide-react';

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
    <div className="space-y-6">
      {/* REFACTOR: Container with high-contrast white card in State A and glowing neon in State B */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isPro
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-amber-700 bg-amber-50 border-amber-300'
                }`}
              >
                // REFACTOR: Updated verified header to season 2026/2027
                Skuad Resmi Musim 2026/2027 (Terverifikasi PT LIB & AFC)
              </span>
            </div>
            <h2
              className={`text-xl font-black tracking-tight flex items-center gap-2 ${
                isPro ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              <Users className="w-5 h-5 text-blue-600" />
              First Team & Academy Deep-Dive (Starting XI & Cadangan)
            </h2>
            <p className={`text-xs mt-0.5 ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
              Data lengkap skuad 2026/2027: Head Coach Igor Tolic, Thom Haye, Mariano Peralta, Uilliam, Akademi U-20, & Persib Putri
            </p>
          </div>

          <div
            onClick={() => setFitnessFilter((prev) => (prev === 'ALL' ? 'CEDERA_ONLY' : 'ALL'))}
            className={`cursor-pointer flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              injuredCount > 0
                ? isPro
                  ? fitnessFilter === 'CEDERA_ONLY'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                  : fitnessFilter === 'CEDERA_ONLY'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
                : isPro
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" />
            <span>
              {injuredCount} Pemain dalam Penanganan Medis{' '}
              {fitnessFilter === 'CEDERA_ONLY' ? '(Aktif)' : '(Klik Filter)'}
            </span>
          </div>
        </div>

        {/* Category Tabs: Senior, Academy, Women */}
        <div
          className={`flex flex-wrap items-center gap-2 mt-5 pt-4 border-t ${
            isPro ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => {
              setActiveCategory('senior');
              setRoleFilter('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'senior'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tim Utama Senior (Musim 2026/2027)
          </button>

          <button
            onClick={() => {
              setActiveCategory('academy');
              setRoleFilter('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'academy'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Pangeran Muda (Akademi U-20 EPA)
          </button>

          <button
            onClick={() => {
              setActiveCategory('women');
              setRoleFilter('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'women'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Persib Putri (Women Team)
          </button>
        </div>

        {/* Sub-Filters: Starting XI vs Substitutes & Positions */}
        {activeCategory === 'senior' && (
          <div
            className={`flex flex-wrap items-center gap-2 mt-3 pt-3 border-t text-xs ${
              isPro ? 'border-slate-800/60' : 'border-slate-200'
            }`}
          >
            <span className={`flex items-center gap-1 font-mono font-bold ${isPro ? 'text-slate-400' : 'text-slate-700'}`}>
              <Award className="w-3.5 h-3.5 text-amber-500" /> Peran Skuad:
            </span>
            <button
              onClick={() => setRoleFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                roleFilter === 'ALL'
                  ? isPro
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-700 text-white font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Skuad
            </button>
            <button
              onClick={() => setRoleFilter('starting')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                roleFilter === 'starting'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Starting XI (11 Pertama)
            </button>
            <button
              onClick={() => setRoleFilter('substitute')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                roleFilter === 'substitute'
                  ? isPro
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-blue-600 text-white font-bold'
                  : isPro
                  ? 'bg-slate-800 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pemain Cadangan (Substitutes)
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 mt-3">
          <span className={`text-xs mr-2 flex items-center gap-1 ${isPro ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
            <Filter className="w-3 h-3" /> Posisi:
          </span>
          {(['ALL', 'FW', 'MF', 'DF', 'GK'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                selectedPosition === pos
                  ? isPro
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'bg-blue-100 text-blue-900 border border-blue-400'
                  : isPro
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Players Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player: Player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            // REFACTOR: Replaced dark player cards with bright white cards in State A and glowing neon in State B
            className={`group rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isPro
                ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                : 'bg-white border-slate-300 hover:border-blue-600 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105 ${
                    player.squadRole === 'starting'
                      ? 'bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-md'
                      : isPro
                      ? 'bg-slate-800 text-cyan-300 ring-1 ring-slate-700'
                      : 'bg-slate-100 text-slate-800 border border-slate-300'
                  }`}
                >
                  #{player.number}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`font-black text-base tracking-tight transition-colors ${
                        isPro ? 'text-slate-100 group-hover:text-cyan-400' : 'text-slate-950 group-hover:text-blue-700'
                      }`}
                    >
                      {player.name}
                    </h4>
                    {player.squadRole === 'starting' && (
                      <span className="text-[9px] font-mono font-bold uppercase px-1 rounded bg-amber-400 text-slate-950">
                        XI
                      </span>
                    )}
                  </div>
                  <div className={`text-xs font-medium ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                    {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong> ({player.age} thn)
                  </div>
                </div>
              </div>

              {player.verifiedData && (
                <span title="Data Terverifikasi Resmi PT LIB & Transfermarkt">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                </span>
              )}
            </div>

            <div
              className={`mt-4 pt-3 border-t ${
                isPro ? 'border-slate-800/80' : 'border-slate-200'
              }`}
            >
              <div
                className={`text-[10px] uppercase font-mono mb-1 ${
                  isPro ? 'text-slate-400' : 'text-slate-600 font-bold'
                }`}
              >
                Kondisi Fisik Terkini:
              </div>
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />
            </div>

            {/* REFACTOR: Fixed illegible text-slate-200 on white backgrounds in light mode */}
            <div
              className={`grid grid-cols-3 gap-2 text-center mt-4 pt-3 border-t ${
                isPro ? 'border-slate-800/80' : 'border-slate-200'
              }`}
            >
              <div>
                <span className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>Menit Main</span>
                <div
                  className={`text-xs font-mono font-bold ${
                    isPro ? 'text-slate-200' : 'text-slate-950 font-black'
                  }`}
                >
                  {player.stats.minutesPlayed}&apos;
                </div>
              </div>
              <div>
                <span className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>Gol/Assist</span>
                <div
                  className={`text-xs font-mono font-bold ${
                    isPro ? 'text-amber-400' : 'text-amber-600 font-black'
                  }`}
                >
                  {player.stats.goals} / {player.stats.assists}
                </div>
              </div>
              <div>
                <span className={`text-[10px] ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>Rating</span>
                <div
                  className={`text-xs font-mono font-bold ${
                    isPro ? 'text-cyan-400' : 'text-blue-700 font-black'
                  }`}
                >
                  ★ {player.stats.rating}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-[11px] text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
              <span>Buka Spasial Heatmap & Info Kontrak</span>
              <ChevronRight className="w-4 h-4" />
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
