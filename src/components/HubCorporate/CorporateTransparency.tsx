'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  INFRASTRUCTURE_LIST,
  MANAGEMENT_MEMBERS_2026_2027,
  FINANCIAL_OVERVIEW_2026_2027,
  OFFICIAL_SQUAD_2026_2027,
} from '@/data/persib-data';
import {
  FileSpreadsheet,
  Droplets,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { InfrastructureItem, ManagementMember, Player } from '@/types/club';

export function CorporateTransparency() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeSection, setActiveSection] = useState<'infrastructure' | 'management' | 'ffp'>('infrastructure');

  return (
    <div className="space-y-5">
      {/* 1. Header Typography */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 font-bold uppercase">
            Corporate Transparency
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
            <CheckCircle2 className="w-3 h-3" />
            PT PBB Verified
          </span>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
          GOVERNANCE
        </h1>
      </div>

      {/* 2. Horizontal Section Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {(
          [
            { id: 'infrastructure', label: 'Stadion & Fasilitas' },
            { id: 'management', label: 'Staf & Pelatih' },
            { id: 'ffp', label: 'FFP & Finansial' },
          ] as const
        ).map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-4 py-2 rounded-full text-xs font-black tracking-tight transition-all shrink-0 ${
              activeSection === sec.id
                ? isPro
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-blue-700 text-white shadow-md shadow-blue-700/25'
                : isPro
                ? 'bg-[#121620] text-slate-400 hover:text-slate-200 border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Section 1: Infrastructure */}
      {activeSection === 'infrastructure' && (
        <div className="space-y-3.5">
          {INFRASTRUCTURE_LIST.map((infra: InfrastructureItem) => (
            <div
              key={infra.id}
              className={`rounded-[28px] border p-5 transition-all shadow-md ${
                isPro
                  ? 'bg-[#121620] border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  : 'bg-white border-slate-200 shadow-[0_4px_15px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
                    {infra.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">{infra.location}</div>
                </div>
                <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {infra.status}
                </span>
              </div>

              {/* Pitch Condition Progress */}
              <div
                className={`mt-4 p-3 rounded-2xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 text-[11px] font-medium">Kondisi Lapangan</span>
                  <span className="font-mono font-black text-xs text-blue-600 dark:text-cyan-400">
                    {infra.conditionScore}/100
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <div
                    style={{ width: `${infra.conditionScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Drainase:
                  </span>
                  <strong className="font-mono">{infra.drainageRate}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <SunMedium className="w-3.5 h-3.5 text-amber-500" /> Lampu:
                  </span>
                  <strong className="font-mono">{infra.lightingLux} Lux (FIFA)</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Kapasitas Kursi:</span>
                  <strong className="font-semibold">{infra.capacity}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Management & Coaching */}
      {activeSection === 'management' && (
        <div className="space-y-3">
          {MANAGEMENT_MEMBERS_2026_2027.map((person: ManagementMember, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-[28px] border transition-all shadow-md ${
                person.role.includes('Head Coach')
                  ? isPro
                    ? 'bg-gradient-to-br from-[#121c2e] to-[#0e1624] border-blue-800/80 text-white'
                    : 'bg-blue-50/80 border-2 border-blue-600 text-blue-950 shadow-sm'
                  : isPro
                  ? 'bg-[#121620] border-slate-800'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20">
                  {person.department}
                </span>
                {person.role.includes('Head Coach') && (
                  <span className="text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-blue-700 text-white">
                    Head Coach
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-950 dark:text-white">{person.name}</h4>
              <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 mt-0.5">{person.role}</p>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                <div>Kewarganegaraan: <strong className="text-slate-700 dark:text-slate-200">{person.nationality}</strong></div>
                {person.license && <div>Lisensi: <strong className="text-amber-500">{person.license}</strong></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: FFP & Ledger */}
      {activeSection === 'ffp' && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-[32px] border shadow-xl ${
              isPro
                ? 'bg-[#121620] border-slate-800 text-white'
                : 'bg-white border-slate-200 shadow-sm text-slate-950'
            }`}
          >
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                FFP Compliance Musim 2026/2027
              </span>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                Kepatuhan Finansial: {FINANCIAL_OVERVIEW_2026_2027.ffpComplianceScore}% (Grade A+)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div
                className={`p-3 rounded-2xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-medium">Nilai Pasar Skuad</div>
                <div className="text-sm font-black font-mono text-blue-600 dark:text-cyan-400 mt-1">
                  {FINANCIAL_OVERVIEW_2026_2027.totalSquadValue}
                </div>
              </div>
              <div
                className={`p-3 rounded-2xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-400 font-medium">Wage / Revenue</div>
                <div className="text-sm font-black font-mono text-emerald-500 mt-1">
                  {FINANCIAL_OVERVIEW_2026_2027.wageToRevenueRatio}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Ledger Mobile Table */}
          <div
            className={`rounded-[32px] border p-5 shadow-xl ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Ledger Durasi Kontrak
              </h4>
              <span className="text-[10px] font-mono text-emerald-500 font-bold">100% Valid</span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-2">#</th>
                    <th className="py-2 px-2">Pemain</th>
                    <th className="py-2 px-2">Kontrak</th>
                    <th className="py-2 px-2 text-right">Nilai Pasar</th>
                  </tr>
                </thead>
                <tbody>
                  {OFFICIAL_SQUAD_2026_2027.map((player: Player) => (
                    <tr
                      key={player.id}
                      className={`border-b transition-colors ${
                        isPro
                          ? 'border-slate-800/40 text-slate-300'
                          : 'border-slate-100 text-slate-800'
                      }`}
                    >
                      <td className="py-2.5 px-2 font-mono font-bold text-blue-600">#{player.number}</td>
                      <td className="py-2.5 px-2 font-bold text-xs truncate max-w-[130px]">{player.name}</td>
                      <td className="py-2.5 px-2 font-mono text-[11px] text-amber-500 font-bold">
                        {player.contractUntil}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-500 text-[11px]">
                        {player.marketValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
