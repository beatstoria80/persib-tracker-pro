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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl transition-all ${
          isPro
            ? 'bg-[#0A1220] border-blue-800/80 text-slate-100 shadow-[0_0_50px_rgba(37,99,235,0.25)]'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isPro ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
                isPro
                  ? 'bg-blue-600 text-amber-300 ring-2 ring-cyan-400'
                  : 'bg-blue-700 text-white shadow-md'
              }`}
            >
              #{player.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{player.name}</h3>
                {player.verifiedData && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isPro ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-cyan-400" /> Terverifikasi
                  </span>
                )}
              </div>
              <p className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                {player.fullName} • Posisi: <strong className="text-blue-600 font-bold">{player.position}</strong> • {player.nationality} ({player.age} thn)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isPro ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div
            className={`p-4 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-xs font-bold uppercase mb-2 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span>Status Kebugaran & Medis (Real-Time Dokter Tim)</span>
              <span className="font-mono text-cyan-500 font-bold">{player.fitness.percentage}% Optimal</span>
            </div>
            <div className="mb-3">
              <FitnessTrackerBadge
                status={player.fitness.status}
                percentage={player.fitness.percentage}
                injuryType={player.fitness.injuryType}
                isPro={isPro}
              />
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden mb-2 ${isPro ? 'bg-slate-800' : 'bg-slate-200'}`}>
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
              <p className={`text-xs italic ${isPro ? 'text-slate-300' : 'text-slate-700'}`}>{player.fitness.notes}</p>
            )}
            {player.fitness.estimatedReturn && (
              <p className={`text-xs mt-1 font-semibold ${isPro ? 'text-amber-400' : 'text-amber-700'}`}>
                Estimasi Siap Tanding: {player.fitness.estimatedReturn}
              </p>
            )}
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-xs font-bold uppercase mb-2 flex items-center justify-between ${
              isPro ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <span>Visual Heatmap Pergerakan Lapangan (Match Tracker)</span>
              <span className={`text-[10px] font-bold ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                Zona Dominasi Posisi
              </span>
            </div>

            <div
              className={`w-full aspect-[16/9] rounded-xl relative overflow-hidden border p-2 ${
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
                  className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-amber-500/80 via-rose-500/70 to-blue-500/40 blur-md pointer-events-none"
                />
              ))}

              <div className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                Arah Serang &rarr;
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              className={`p-3 rounded-xl border text-center ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                Akurasi Umpan
              </div>
              <div className={`text-lg font-mono font-black mt-0.5 ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                {player.stats.passAccuracy}%
              </div>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                Intersep & Tekel
              </div>
              <div className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {player.stats.interceptions} / {player.stats.tackles}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                Gol / Assist
              </div>
              <div className={`text-lg font-mono font-black mt-0.5 ${isPro ? 'text-amber-400' : 'text-amber-600'}`}>
                {player.stats.goals} / {player.stats.assists}
              </div>
            </div>
            <div
              className={`p-3 rounded-xl border text-center ${
                isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className={`text-[10px] uppercase font-bold ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                Match Rating
              </div>
              <div className={`text-lg font-mono font-black mt-0.5 ${isPro ? 'text-blue-400' : 'text-blue-800'}`}>
                ★ {player.stats.rating}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isPro ? 'bg-blue-950/30 border-blue-800/40' : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-700'}`}>Masa Kontrak:</span>
              // REFACTOR: Replaced hardcoded text-slate-200 with contrast-adaptive color
              <strong className={`text-xs font-mono font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                {player.contractUntil}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-700'}`}>Nilai Pasar Resmi:</span>
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
