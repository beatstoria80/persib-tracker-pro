'use client';

import React from 'react';
import { Player } from '@/types/club';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { X, ShieldCheck, Calendar, DollarSign } from 'lucide-react';
import { FitnessTrackerBadge } from './FitnessTrackerBadge';

interface ModalProps {
  player: Player | null;
  onClose: () => void;
}

export function PlayerDetailModal({ player, onClose }: ModalProps) {
  const { mode } = useClubTracker();
  if (!player) return null;

  const isPro = mode === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-3 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-all ${
          isPro
            ? 'bg-[#0A1220] border-blue-800/80 text-slate-100 shadow-[0_0_50px_rgba(37,99,235,0.25)]'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Mobile Drag Indicator */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isPro ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                isPro
                  ? 'bg-blue-600 text-amber-300 ring-2 ring-cyan-400'
                  : 'bg-blue-700 text-white shadow-sm'
              }`}
            >
              #{player.number}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-black tracking-tight">{player.name}</h3>
                {player.verifiedData && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[8px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                      isPro ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-blue-600 dark:text-cyan-400" /> Terverifikasi
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {player.fullName} • <strong className="text-blue-600 font-bold">{player.position}</strong> ({player.age} thn)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isPro ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1 pb-6">
          {/* Medical Fitness Card */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase mb-2 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span>Kondisi Medis & Kebugaran</span>
              <span className="font-mono text-cyan-500 font-bold">{player.fitness.percentage}% Optimal</span>
            </div>
            <div className="mb-2">
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden mb-1.5 ${isPro ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <div
                style={{ width: `${player.fitness.percentage}%` }}
                className={`h-full ${
                  player.fitness.status === 'fit'
                    ? 'bg-emerald-500'
                    : player.fitness.status === 'latihan_terpisah'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
            {player.fitness.notes && (
              <p className={`text-[11px] italic ${isPro ? 'text-slate-300' : 'text-slate-700'}`}>{player.fitness.notes}</p>
            )}
          </div>

          {/* Spatial Heatmap */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase mb-2 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span>Heatmap Pergerakan Lapangan</span>
              <span className={`text-[9px] font-bold ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                Zona Dominasi Posisi
              </span>
            </div>

            <div
              className={`w-full aspect-[16/10] rounded-xl relative overflow-hidden border p-2 ${
                isPro ? 'bg-[#061826] border-blue-900/60' : 'bg-[#15803d] border-emerald-800'
              }`}
            >
              <svg className="w-full h-full opacity-60" viewBox="0 0 100 64" preserveAspectRatio="none">
                <rect x="2" y="2" width="96" height="60" fill="none" stroke="#fff" strokeWidth="0.5" />
                <line x1="50" y1="2" x2="50" y2="62" stroke="#fff" strokeWidth="0.5" />
                <circle cx="50" cy="32" r="9" fill="none" stroke="#fff" strokeWidth="0.5" />
                <rect x="2" y="16" width="16" height="32" fill="none" stroke="#fff" strokeWidth="0.5" />
                <rect x="82" y="16" width="16" height="32" fill="none" stroke="#fff" strokeWidth="0.5" />
              </svg>

              {player.stats.heatmapCoords.map((pt: { x: number; y: number; intensity: number }, idx: number) => (
                <div
                  key={idx}
                  style={{
                    left: `${pt.x}%`,
                    top: `${pt.y}%`,
                    opacity: pt.intensity,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-amber-500/80 via-rose-500/70 to-blue-500/40 blur-md pointer-events-none"
                />
              ))}

              <div className="absolute bottom-2 right-2 text-[9px] font-mono font-bold text-white bg-black/40 px-1.5 py-0.2 rounded">
                Arah Serang &rarr;
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div
              className={`p-2 rounded-xl border ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase font-bold text-slate-500">Umpan</div>
              <div className={`text-sm font-mono font-black mt-0.5 ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                {player.stats.passAccuracy}%
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase font-bold text-slate-500">Tekel</div>
              <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {player.stats.tackles}
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase font-bold text-slate-500">Gol/Ast</div>
              <div className={`text-sm font-mono font-black mt-0.5 ${isPro ? 'text-amber-400' : 'text-amber-600'}`}>
                {player.stats.goals}/{player.stats.assists}
              </div>
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="text-[9px] uppercase font-bold text-slate-500">Rating</div>
              <div className={`text-sm font-mono font-black mt-0.5 ${isPro ? 'text-blue-400' : 'text-blue-800'}`}>
                ★ {player.stats.rating}
              </div>
            </div>
          </div>

          {/* Contract & Market Value */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
              isPro ? 'bg-blue-950/30 border-blue-800/40' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] text-slate-500">Kontrak:</span>
              <strong className="font-mono text-[11px]">{player.contractUntil}</strong>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {player.marketValue}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
