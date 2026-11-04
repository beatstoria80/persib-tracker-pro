'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { PlayerCategory, Position } from '@/types/club';
import { PlayerDetailModal } from './PlayerDetailModal';
import { FitnessTrackerBadge } from './FitnessTrackerBadge';
import { Users, Filter, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export function RosterDeepDive() {
  const { mode, players, selectedPlayer, setSelectedPlayer } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeCategory, setActiveCategory] = useState<PlayerCategory>('senior');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [fitnessFilter, setFitnessFilter] = useState<'ALL' | 'CEDERA_ONLY'>('ALL');

  const filteredPlayers = players.filter((p) => {
    if (p.category !== activeCategory) return false;
    if (selectedPosition !== 'ALL' && p.position !== selectedPosition) return false;
    if (fitnessFilter === 'CEDERA_ONLY' && p.fitness.status === 'fit') return false;
    return true;
  });

  const injuredCount = players.filter(
    (p) => p.category === activeCategory && p.fitness.status !== 'fit'
  ).length;

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              First Team & Academy Deep-Dive
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Data terverifikasi squad resmi Persib Bandung: Tim Senior, Akademi Pangeran Muda, dan Persib Women
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
            <Activity className="w-4 h-4 text-rose-400" />
            <span>
              {injuredCount} Pemain dalam Penanganan Medis{' '}
              {fitnessFilter === 'CEDERA_ONLY' ? '(Aktif)' : '(Klik Filter)'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveCategory('senior')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'senior'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tim Utama (Senior / BRI Liga 1 & ACL Two)
          </button>

          <button
            onClick={() => setActiveCategory('academy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'academy'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pangeran Muda (Akademi U-20 / EPA)
          </button>

          <button
            onClick={() => setActiveCategory('women')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeCategory === 'women'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Persib Putri (Women Team)
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Posisi:
          </span>
          {(['ALL', 'FW', 'MF', 'DF', 'GK'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                selectedPosition === pos
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : isPro
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className={`group rounded-2xl border p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
              isPro
                ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-cyan-400/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105 ${
                    isPro
                      ? 'bg-blue-600 text-amber-300 ring-2 ring-cyan-400/50 shadow-md'
                      : 'bg-blue-700 text-white'
                  }`}
                >
                  #{player.number}
                </div>
                <div>
                  <h4 className="font-extrabold text-base tracking-tight group-hover:text-cyan-400 transition-colors">
                    {player.name}
                  </h4>
                  <div className="text-xs text-slate-400 font-medium">
                    {player.nationality} • <strong className="text-blue-500">{player.position}</strong>
                  </div>
                </div>
              </div>

              {player.verifiedData && (
                <span title="Data Terverifikasi Resmi">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                </span>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div className="text-[10px] text-slate-400 uppercase font-mono mb-1">
                Kondisi Fisik Terkini:
              </div>
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400">Menit Main</span>
                <div className="text-xs font-mono font-bold text-slate-200">{player.stats.minutesPlayed}&apos;</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Gol/Assist</span>
                <div className="text-xs font-mono font-bold text-amber-400">
                  {player.stats.goals} / {player.stats.assists}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Rating</span>
                <div className="text-xs font-mono font-bold text-cyan-400">★ {player.stats.rating}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-[11px] text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
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
