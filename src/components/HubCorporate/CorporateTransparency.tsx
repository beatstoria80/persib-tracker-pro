'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  INFRASTRUCTURE_LIST,
  MANAGEMENT_MEMBERS,
  FINANCIAL_OVERVIEW,
  INITIAL_PLAYERS,
} from '@/data/persib-data';
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Droplets,
  SunMedium,
} from 'lucide-react';

export function CorporateTransparency() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeSection, setActiveSection] = useState<'infrastructure' | 'management' | 'ffp'>('infrastructure');

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Corporate & Club Element Transparency
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Standar klub profesional: Audit kondisi rumput stadion, staf kepelatihan resmi, dan Transfer Ledger FFP
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold ${
              isPro
                ? 'bg-blue-950/80 border border-blue-800 text-cyan-300'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Audit AFC & PT LIB 2024/2025</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveSection('infrastructure')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'infrastructure'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Infrastruktur Stadion & Lapangan
          </button>
          <button
            onClick={() => setActiveSection('ffp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'ffp'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Financial Fair Play & Transfer Ledger
          </button>
          <button
            onClick={() => setActiveSection('management')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all ${
              activeSection === 'management'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'bg-slate-900 text-slate-400 hover:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Struktur Manajemen & Staf Ahli
          </button>
        </div>
      </div>

      {activeSection === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {INFRASTRUCTURE_LIST.map((infra) => (
            <div
              key={infra.id}
              className={`rounded-2xl border p-5 transition-all duration-300 ${
                isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-cyan-400/50 shadow-md'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">{infra.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{infra.location}</div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    isPro ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {infra.status}
                </span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Kondisi Rumput & Lapangan</span>
                  <span className="font-mono font-bold text-cyan-400">{infra.conditionScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${infra.conditionScore}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-400" /> Kapasitas Drainase
                  </span>
                  <span className="font-mono font-bold text-slate-200">{infra.drainageRate}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <SunMedium className="w-3.5 h-3.5 text-amber-400" /> Penerangan Lampu
                  </span>
                  <span className="font-mono font-bold text-slate-200">{infra.lightingLux} Lux (FIFA Std)</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/40">
                  <span className="text-slate-400">Spesies Rumput</span>
                  <span className="font-semibold text-slate-300">{infra.pitchType}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Kapasitas Tribun</span>
                  <span className="font-semibold text-slate-300">{infra.capacity}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/50 text-[11px] text-slate-400 italic">
                {infra.notes}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'ffp' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border ${
              isPro
                ? 'bg-gradient-to-br from-[#0c1a2e] to-[#07101d] border-blue-900/60 shadow-[0_0_30px_rgba(37,99,235,0.15)]'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/70">
              <div>
                <span className="text-xs font-mono font-bold uppercase text-amber-400">
                  PT Persib Bandung Bermartabat (Financial Overview)
                </span>
                <h3 className="text-xl font-black tracking-tight mt-0.5">
                  Kepatuhan Financial Fair Play (FFP): {FINANCIAL_OVERVIEW.ffpComplianceScore}%
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Grade A Klub Mandiri
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Total Nilai Pasar Squad Resmi</div>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
                  {FINANCIAL_OVERVIEW.totalSquadValue}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Terverifikasi Transfermarkt & AFC</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Wage-to-Revenue Ratio</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  {FINANCIAL_OVERVIEW.wageToRevenueRatio}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Batas aman FIFA/AFC: &lt; 70%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-xs text-slate-400">Auditor Finansial Independen</div>
                <div className="text-sm font-bold text-slate-200 mt-1">{FINANCIAL_OVERVIEW.auditedBy}</div>
                <div className="text-[10px] text-slate-400 mt-1">Audit Resmi Musim {FINANCIAL_OVERVIEW.season}</div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                Ledger Durasi Kontrak & Nilai Pasar Pemain (Tanpa Spekulasi)
              </h4>
              <span className="text-xs text-slate-400 font-mono">Status: Terverifikasi</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3"># No</th>
                    <th className="py-2.5 px-3">Nama Pemain</th>
                    <th className="py-2.5 px-3">Posisi</th>
                    <th className="py-2.5 px-3">Kewarganegaraan</th>
                    <th className="py-2.5 px-3">Sisa Durasi Kontrak</th>
                    <th className="py-2.5 px-3 text-right">Nilai Pasar Resmi</th>
                  </tr>
                </thead>
                <tbody>
                  {INITIAL_PLAYERS.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-slate-800/40 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-400">#{player.number}</td>
                      <td className="py-2.5 px-3 font-semibold">{player.name}</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{player.position}</td>
                      <td className="py-2.5 px-3 text-slate-300">{player.nationality}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-300">{player.contractUntil}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
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

      {activeSection === 'management' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MANAGEMENT_MEMBERS.map((person, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                isPro
                  ? 'bg-[#0A1220]/90 border-blue-900/40 hover:border-blue-500/50'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full inline-block mb-2 bg-blue-950 text-cyan-300 border border-blue-800">
                {person.department}
              </div>
              <h4 className="text-base font-extrabold">{person.name}</h4>
              <p className="text-xs text-blue-400 font-semibold mt-0.5">{person.role}</p>
              <div className="mt-4 pt-3 border-t border-slate-800/50 text-xs text-slate-400 space-y-1">
                <div>Asal: {person.nationality}</div>
                {person.license && <div>Lisensi: {person.license}</div>}
                <div>Masa Pengabdian: {person.tenureStart}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
