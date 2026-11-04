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
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Droplets,
  SunMedium,
  Award,
} from 'lucide-react';
// REFACTOR: Strictly imported types
import { InfrastructureItem, ManagementMember, Player } from '@/types/club';

export function CorporateTransparency() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeSection, setActiveSection] = useState<'infrastructure' | 'management' | 'ffp'>('infrastructure');

  return (
    <div className="space-y-6">
      {/* REFACTOR: Container high-contrast card styling in State A */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
                  isPro
                    ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    : 'text-amber-700 bg-amber-50 border-amber-300'
                }`}
              >
                <Award className="w-3 h-3 text-amber-500" /> Standar Klub Profesional Musim 2026/2027
              </span>
            </div>
            <h2
              className={`text-xl font-black tracking-tight flex items-center gap-2 ${
                isPro ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              <Building2 className="w-5 h-5 text-blue-600" />
              Corporate & Club Element Transparency
            </h2>
            <p className={`text-xs mt-0.5 ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
              Transparansi resmi PT PBB: Struktur kepelatihan baru Igor Tolic & Bojan Hodak, stadion GBLA/SJH, dan ledger kontrak FFP
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${
              isPro
                ? 'bg-blue-950/80 border-blue-800 text-cyan-300'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Audit AFC & PT LIB 2026/2027</span>
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center gap-2 mt-5 pt-4 border-t ${
            isPro ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveSection('infrastructure')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'infrastructure'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Infrastruktur Stadion & Lapangan
          </button>
          <button
            onClick={() => setActiveSection('management')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'management'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Struktur Manajemen & Staf Kepelatihan Baru
          </button>
          <button
            onClick={() => setActiveSection('ffp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'ffp'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-md'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Financial Fair Play & Transfer Ledger (2026/2027)
          </button>
        </div>
      </div>

      {/* Section 1: Infrastructure */}
      {activeSection === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {INFRASTRUCTURE_LIST.map((infra: InfrastructureItem) => (
            <div
              key={infra.id}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-cyan-400/50 shadow-md'
                  : 'bg-white border-slate-300 shadow-sm hover:border-blue-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-base font-extrabold tracking-tight ${isPro ? 'text-slate-100' : 'text-slate-950'}`}>
                    {infra.name}
                  </h3>
                  <div className={`text-xs mt-0.5 ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                    {infra.location}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {infra.status}
                </span>
              </div>

              {/* REFACTOR: Pitch condition progress box contrast fix */}
              <div
                className={`mt-4 p-3 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={isPro ? 'text-slate-400' : 'text-slate-700 font-medium'}>
                    Kondisi Lapangan & Rumput
                  </span>
                  <span className={`font-mono font-bold ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                    {infra.conditionScore}/100
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isPro ? 'bg-slate-800' : 'bg-slate-200'}`}>
                  <div
                    style={{ width: `${infra.conditionScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div
                  className={`flex items-center justify-between py-1 border-b ${
                    isPro ? 'border-slate-800/40' : 'border-slate-200'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Kapasitas Drainase
                  </span>
                  <span className={`font-mono font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                    {infra.drainageRate}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between py-1 border-b ${
                    isPro ? 'border-slate-800/40' : 'border-slate-200'
                  }`}
                >
                  <span className={`flex items-center gap-1.5 ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                    <SunMedium className="w-3.5 h-3.5 text-amber-500" /> Penerangan Lampu
                  </span>
                  <span className={`font-mono font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                    {infra.lightingLux} Lux (Standar FIFA)
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between py-1 border-b ${
                    isPro ? 'border-slate-800/40' : 'border-slate-200'
                  }`}
                >
                  <span className={isPro ? 'text-slate-400' : 'text-slate-600'}>Tipe Rumput</span>
                  <span className={`font-semibold ${isPro ? 'text-slate-300' : 'text-slate-900'}`}>
                    {infra.pitchType}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className={isPro ? 'text-slate-400' : 'text-slate-600'}>Kapasitas Kursi Tunggal</span>
                  <span className={`font-semibold ${isPro ? 'text-slate-300' : 'text-slate-900'}`}>
                    {infra.capacity}
                  </span>
                </div>
              </div>

              <div
                className={`mt-4 pt-3 border-t text-[11px] italic ${
                  isPro ? 'border-slate-800/50 text-slate-400' : 'border-slate-200 text-slate-600 font-medium'
                }`}
              >
                {infra.notes}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 2: Management & Coach Staff */}
      {activeSection === 'management' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MANAGEMENT_MEMBERS_2026_2027.map((person: ManagementMember, idx: number) => (
            <div
              key={idx}
              // REFACTOR: Distinct styling for Head Coach and Strategic Advisor in light and pro modes
              className={`p-5 rounded-2xl border transition-all ${
                person.role.includes('Head Coach')
                  ? isPro
                    ? 'bg-blue-950/60 border-cyan-400/60 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                    : 'bg-blue-50 border-2 border-blue-600 text-blue-950 shadow-md'
                  : person.role.includes('Strategic Advisor')
                  ? isPro
                    ? 'bg-amber-950/40 border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                    : 'bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-md'
                  : isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-blue-500/50'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isPro
                      ? 'bg-blue-950 text-cyan-300 border-blue-800'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {person.department}
                </span>
                {person.role.includes('Head Coach') && (
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-blue-700 text-white">
                    Pelatih Utama Baru
                  </span>
                )}
                {person.role.includes('Strategic Advisor') && (
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                    Advisor Manajemen
                  </span>
                )}
              </div>
              <h4 className={`text-base font-extrabold ${isPro ? 'text-slate-100' : 'text-slate-950'}`}>
                {person.name}
              </h4>
              <p className={`text-xs font-bold mt-0.5 ${isPro ? 'text-blue-400' : 'text-blue-700'}`}>
                {person.role}
              </p>
              <div
                className={`mt-4 pt-3 border-t text-xs space-y-1 ${
                  isPro ? 'border-slate-800/50 text-slate-400' : 'border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  Kewarganegaraan: <strong className={isPro ? 'text-slate-200' : 'text-slate-950 font-bold'}>{person.nationality}</strong>
                </div>
                {person.license && (
                  <div>
                    Lisensi Kepelatihan: <strong className={isPro ? 'text-amber-300' : 'text-amber-700 font-bold'}>{person.license}</strong>
                  </div>
                )}
                <div>Periode Pengabdian: {person.tenureStart}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: FFP & Transfer Ledger */}
      {activeSection === 'ffp' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              isPro
                ? 'bg-gradient-to-br from-[#0c1a2e] to-[#07101d] border-blue-900/60 shadow-[0_0_30px_rgba(37,99,235,0.15)]'
                : 'bg-white border-slate-300 shadow-sm text-slate-950'
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
                isPro ? 'border-slate-800/70' : 'border-slate-200'
              }`}
            >
              <div>
                <span
                  className={`text-xs font-mono font-bold uppercase ${
                    isPro ? 'text-amber-400' : 'text-amber-700'
                  }`}
                >
                  Financial Fair Play (FFP) Audit Musim 2026/2027
                </span>
                <h3 className="text-xl font-black tracking-tight mt-0.5">
                  Tingkat Kepatuhan Regulasi Keuangan: {FINANCIAL_OVERVIEW_2026_2027.ffpComplianceScore}%
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
                  Grade A+ Klub Finansial Mandiri
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div
                className={`p-4 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  Total Nilai Pasar Skuad Resmi 2026/2027
                </div>
                <div className={`text-2xl font-black font-mono mt-1 ${isPro ? 'text-cyan-400' : 'text-blue-700'}`}>
                  {FINANCIAL_OVERVIEW_2026_2027.totalSquadValue}
                </div>
                <div className={`text-[10px] mt-1 ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                  Terverifikasi Transfermarkt & AFC
                </div>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  Wage-to-Revenue Ratio
                </div>
                <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  {FINANCIAL_OVERVIEW_2026_2027.wageToRevenueRatio}
                </div>
                <div className={`text-[10px] mt-1 ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                  Batas aman FIFA/LIB: &lt; 70%
                </div>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                  Auditor Independen Terakreditasi
                </div>
                <div className={`text-sm font-bold mt-1 ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                  {FINANCIAL_OVERVIEW_2026_2027.auditedBy}
                </div>
                <div className={`text-[10px] mt-1 ${isPro ? 'text-slate-400' : 'text-slate-500'}`}>
                  Audit Resmi Musim {FINANCIAL_OVERVIEW_2026_2027.season}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Ledger Durasi Kontrak & Nilai Pasar Skuad 2026/2027 (Terverifikasi)
              </h4>
              <span className={`text-xs font-mono ${isPro ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>
                100% Anti-Rumor
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className={`border-b font-bold ${
                      isPro ? 'border-slate-800 text-slate-400 bg-slate-900/40' : 'border-slate-300 text-slate-700 bg-slate-50'
                    }`}
                  >
                    <th className="py-2.5 px-3"># No</th>
                    <th className="py-2.5 px-3">Nama Pemain</th>
                    <th className="py-2.5 px-3">Peran Skuad</th>
                    <th className="py-2.5 px-3">Posisi</th>
                    <th className="py-2.5 px-3">Kewarganegaraan</th>
                    <th className="py-2.5 px-3">Sisa Durasi Kontrak</th>
                    <th className="py-2.5 px-3 text-right">Nilai Pasar Resmi</th>
                  </tr>
                </thead>
                <tbody>
                  {OFFICIAL_SQUAD_2026_2027.map((player: Player) => (
                    <tr
                      key={player.id}
                      className={`border-b transition-colors ${
                        isPro
                          ? 'border-slate-800/40 hover:bg-slate-800/30 text-slate-300'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600">#{player.number}</td>
                      <td className={`py-2.5 px-3 font-bold ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            player.squadRole === 'starting'
                              ? 'bg-amber-400 text-slate-950'
                              : isPro
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {player.squadRole === 'starting' ? 'Starting XI' : 'Cadangan'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${isPro ? 'text-cyan-300' : 'text-blue-700'}`}>
                        {player.position}
                      </td>
                      <td className="py-2.5 px-3">{player.nationality}</td>
                      <td className={`py-2.5 px-3 font-mono font-bold ${isPro ? 'text-amber-300' : 'text-amber-700'}`}>
                        {player.contractUntil}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
