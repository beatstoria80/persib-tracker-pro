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
  Award,
} from 'lucide-react';
import { InfrastructureItem, ManagementMember, Player } from '@/types/club';

export function CorporateTransparency() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeSection, setActiveSection] = useState<'infrastructure' | 'management' | 'ffp'>('infrastructure');

  return (
    <div className="space-y-4">
      {/* Mobile Transparency Header Card */}
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
            <Award className="w-3 h-3 text-amber-500" /> Transparansi Klub 2026/27
          </span>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isPro
                ? 'bg-blue-950/80 border-blue-800 text-cyan-300'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            Verified PT PBB
          </span>
        </div>

        {/* Horizontal Scrollable Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveSection('infrastructure')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeSection === 'infrastructure'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Stadion & Fasilitas
          </button>
          <button
            onClick={() => setActiveSection('management')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeSection === 'management'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            Staf & Pelatih
          </button>
          <button
            onClick={() => setActiveSection('ffp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 ${
              activeSection === 'ffp'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            FFP & Ledger Kontrak
          </button>
        </div>
      </div>

      {/* Section 1: Infrastructure */}
      {activeSection === 'infrastructure' && (
        <div className="space-y-3">
          {INFRASTRUCTURE_LIST.map((infra: InfrastructureItem) => (
            <div
              key={infra.id}
              className={`rounded-2xl border p-4 transition-all duration-300 ${
                isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40 shadow-sm'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-sm font-extrabold tracking-tight ${isPro ? 'text-slate-100' : 'text-slate-950'}`}>
                    {infra.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">{infra.location}</div>
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {infra.status}
                </span>
              </div>

              {/* Pitch Condition Bar */}
              <div
                className={`mt-3 p-2.5 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 text-[11px]">Kondisi Lapangan</span>
                  <span className={`font-mono font-bold text-xs ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                    {infra.conditionScore}/100
                  </span>
                </div>
                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isPro ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    style={{ width: `${infra.conditionScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 mt-3 text-[11px]">
                <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" /> Drainase:
                  </span>
                  <strong className="font-mono">{infra.drainageRate}</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
                  <span className="text-slate-500 flex items-center gap-1">
                    <SunMedium className="w-3 h-3 text-amber-500" /> Lampu:
                  </span>
                  <strong className="font-mono">{infra.lightingLux} Lux (FIFA)</strong>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Kapasitas Kursi:</span>
                  <strong className="font-semibold">{infra.capacity}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Management & Coaching */}
      {activeSection === 'management' && (
        <div className="space-y-2.5">
          {MANAGEMENT_MEMBERS_2026_2027.map((person: ManagementMember, idx: number) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all ${
                person.role.includes('Head Coach')
                  ? isPro
                    ? 'bg-blue-950/60 border-cyan-400/60 shadow-sm'
                    : 'bg-blue-50 border-2 border-blue-600 text-blue-950 shadow-sm'
                  : person.role.includes('Strategic Advisor')
                  ? isPro
                    ? 'bg-amber-950/40 border-amber-400/40 shadow-sm'
                    : 'bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-sm'
                  : isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40'
                  : 'bg-white border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-blue-950 text-cyan-300 border-blue-800'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {person.department}
                </span>
                {person.role.includes('Head Coach') && (
                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-blue-700 text-white">
                    Head Coach
                  </span>
                )}
                {person.role.includes('Strategic Advisor') && (
                  <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                    Strategic Advisor
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black">{person.name}</h4>
              <p className="text-xs font-bold text-blue-600 mt-0.5">{person.role}</p>
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/50 text-[11px] text-slate-500 space-y-0.5">
                <div>Kewarganegaraan: <strong className="text-slate-700 dark:text-slate-300">{person.nationality}</strong></div>
                {person.license && <div>Lisensi: <strong className="text-amber-600 dark:text-amber-300">{person.license}</strong></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: FFP & Ledger */}
      {activeSection === 'ffp' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl border ${
              isPro
                ? 'bg-gradient-to-br from-[#0c1a2e] to-[#07101d] border-blue-900/60 shadow-sm'
                : 'bg-white border-slate-300 shadow-sm text-slate-950'
            }`}
          >
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                FFP Audit Musim 2026/2027
              </span>
              <h3 className="text-sm font-black tracking-tight mt-0.5">
                Kepatuhan Finansial: {FINANCIAL_OVERVIEW_2026_2027.ffpComplianceScore}% (Grade A+)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div
                className={`p-2.5 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-500 font-medium">Nilai Pasar Skuad</div>
                <div className="text-sm font-black font-mono text-blue-600 dark:text-cyan-400 mt-0.5">
                  {FINANCIAL_OVERVIEW_2026_2027.totalSquadValue}
                </div>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] text-slate-500 font-medium">Wage/Revenue</div>
                <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {FINANCIAL_OVERVIEW_2026_2027.wageToRevenueRatio}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Ledger Mobile Table */}
          <div
            className={`rounded-2xl border p-3.5 ${
              isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                Ledger Durasi Kontrak 2026/27
              </h4>
              <span className="text-[10px] font-mono text-slate-500 font-bold">Resmi</span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr
                    className={`border-b font-bold ${
                      isPro ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                  >
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
                          : 'border-slate-200 text-slate-800'
                      }`}
                    >
                      <td className="py-2 px-2 font-mono font-bold text-blue-600">#{player.number}</td>
                      <td className="py-2 px-2 font-bold text-[11px] truncate max-w-[130px]">{player.name}</td>
                      <td className="py-2 px-2 font-mono text-[11px] text-amber-600 dark:text-amber-300">
                        {player.contractUntil}
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
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
