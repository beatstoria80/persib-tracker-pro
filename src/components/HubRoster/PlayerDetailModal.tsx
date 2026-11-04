'use client';

import React from 'react';
import { Player } from '@/types/club';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { X, ShieldCheck, Calendar, DollarSign, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-3">
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
          isPro
            ? 'bg-[#0A1220] border-blue-800 text-slate-100 shadow-[0_0_50px_rgba(37,99,235,0.25)]'
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
                player.squadRole === 'starting'
                  ? 'bg-blue-600 text-amber-300 ring-2 ring-cyan-400'
                  : isPro
                  ? 'bg-slate-800 text-cyan-300'
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
          {/* Real Squad Role Status */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              player.squadRole === 'starting'
                ? isPro
                  ? 'bg-blue-950/40 border-blue-800'
                  : 'bg-blue-50 border-blue-200 text-blue-950'
                : isPro
                ? 'bg-slate-900/40 border-slate-800'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Alokasi Taktis Bojan Hodak
              </div>
              <div className="text-sm font-black flex items-center gap-1.5 mt-0.5">
                {player.squadRole === 'starting' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pilihan Utama (Starting XI)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Skuad Rotasi & Cadangan Strategis</span>
                  </>
                )}
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                player.squadRole === 'starting'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {player.position}
            </span>
          </div>

          {/* Medical Fitness Card */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase mb-2 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                Status Medis Resmi (Dr. Rafi Ghani)
              </span>
              <span className="font-mono text-cyan-500 font-bold">{player.fitness.percentage}% Siap</span>
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
              <p className={`text-[11px] italic mt-1.5 ${isPro ? 'text-slate-300' : 'text-slate-700'}`}>{player.fitness.notes}</p>
            )}
          </div>

          {/* Factual Performance Stats (Pekan 1-8 Liga 1 2026/2027) */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase mb-2.5 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span>Statistik Resmi Pekan 1-8 (Google Sports / PT LIB)</span>
              <span className="font-mono text-[9px] text-emerald-500 font-bold">Terverifikasi</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div
                className={`p-2 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-slate-500">Akurasi Operan</div>
                <div className={`text-sm font-mono font-black mt-0.5 ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                  {player.stats.passAccuracy}%
                </div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-slate-500">Tekel Bersih</div>
                <div className="text-sm font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {player.stats.tackles}
                </div>
              </div>
              <div
                className={`p-2 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-[9px] uppercase font-bold text-slate-500">Gol / Assist</div>
                <div className={`text-sm font-mono font-black mt-0.5 ${isPro ? 'text-amber-400' : 'text-amber-600'}`}>
                  {player.stats.goals} / {player.stats.assists}
                </div>
              </div>
            </div>
          </div>

          {/* Contract & Transfermarkt Market Value */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
              isPro ? 'bg-blue-950/30 border-blue-800/40' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/40 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] text-slate-500">Masa Kontrak:</span>
              </div>
              <strong className="font-mono text-xs">{player.contractUntil}</strong>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-slate-500">Estimasi Nilai Pasar:</span>
              </div>
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
