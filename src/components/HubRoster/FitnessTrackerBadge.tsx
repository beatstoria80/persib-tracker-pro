'use client';

import React from 'react';
import { FitnessStatus } from '@/types/club';
import { Activity, HeartPulse, ShieldAlert } from 'lucide-react';

interface FitnessProps {
  status: FitnessStatus;
  percentage: number;
  injuryType?: string;
  isPro: boolean;
}

export function FitnessTrackerBadge({ status, percentage, injuryType, isPro }: FitnessProps) {
  if (status === 'fit') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
            isPro
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIT ({percentage}%)</span>
        </div>
      </div>
    );
  }

  if (status === 'latihan_terpisah') {
    return (
      <div className="flex flex-col gap-1">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
            isPro
              ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Latihan Terpisah ({percentage}%)</span>
        </div>
        {injuryType && <span className="text-[10px] text-slate-400 italic">{injuryType}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ${
          isPro
            ? 'bg-rose-950/60 text-rose-300 border border-rose-500/40'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        <span>Cedera (Pemulihan {percentage}%)</span>
      </div>
      {injuryType && <span className="text-[10px] text-slate-400 italic">{injuryType}</span>}
    </div>
  );
}
