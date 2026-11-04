'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

export function ScenarioSimulator() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [persibVsPort, setPersibVsPort] = useState<'WIN' | 'DRAW' | 'LOSS'>('WIN');
  const [persibVsPortScore, setPersibVsPortScore] = useState<[number, number]>([2, 1]);
  const [persibVsZhejiang, setPersibVsZhejiang] = useState<'WIN' | 'DRAW' | 'LOSS'>('WIN');
  const [persibVsZhejiangScore, setPersibVsZhejiangScore] = useState<[number, number]>([2, 0]);
  const [lionCityVsPort, setLionCityVsPort] = useState<'WIN' | 'DRAW' | 'LOSS'>('DRAW');

  const calculateSimulatedTable = () => {
    const table = [
      { name: 'PERSIB Bandung', played: 4, won: 1, drawn: 1, lost: 2, gf: 5, ga: 6, points: 4, isPersib: true },
      { name: 'Port FC (THA)', played: 4, won: 3, drawn: 0, lost: 1, gf: 6, ga: 4, points: 9, isPersib: false },
      { name: 'Lion City Sailors (SGP)', played: 4, won: 2, drawn: 1, lost: 1, gf: 7, ga: 5, points: 7, isPersib: false },
      { name: 'Zhejiang FC (CHN)', played: 4, won: 1, drawn: 0, lost: 3, gf: 2, ga: 5, points: 3, isPersib: false },
    ];

    const p1PersibGF = persibVsPortScore[0];
    const p1PortGF = persibVsPortScore[1];
    const persib = table.find((t) => t.isPersib)!;
    const port = table.find((t) => t.name.includes('Port FC'))!;
    const lcs = table.find((t) => t.name.includes('Lion City'))!;
    const zhejiang = table.find((t) => t.name.includes('Zhejiang'))!;

    persib.played += 1;
    port.played += 1;
    persib.gf += p1PersibGF;
    persib.ga += p1PortGF;
    port.gf += p1PortGF;
    port.ga += p1PersibGF;

    if (p1PersibGF > p1PortGF) {
      persib.won += 1;
      persib.points += 3;
      port.lost += 1;
    } else if (p1PersibGF === p1PortGF) {
      persib.drawn += 1;
      persib.points += 1;
      port.drawn += 1;
      port.points += 1;
    } else {
      persib.lost += 1;
      port.won += 1;
      port.points += 3;
    }

    const p2PersibGF = persibVsZhejiangScore[0];
    const p2ZhejiangGF = persibVsZhejiangScore[1];
    persib.played += 1;
    zhejiang.played += 1;
    persib.gf += p2PersibGF;
    persib.ga += p2ZhejiangGF;
    zhejiang.gf += p2ZhejiangGF;
    zhejiang.ga += p2PersibGF;

    if (p2PersibGF > p2ZhejiangGF) {
      persib.won += 1;
      persib.points += 3;
      zhejiang.lost += 1;
    } else if (p2PersibGF === p2ZhejiangGF) {
      persib.drawn += 1;
      persib.points += 1;
      zhejiang.drawn += 1;
      zhejiang.points += 1;
    } else {
      persib.lost += 1;
      zhejiang.won += 1;
      zhejiang.points += 3;
    }

    lcs.played += 1;
    port.played += 1;
    if (lionCityVsPort === 'WIN') {
      lcs.won += 1;
      lcs.points += 3;
      lcs.gf += 2;
      lcs.ga += 1;
      port.lost += 1;
      port.gf += 1;
      port.ga += 2;
    } else if (lionCityVsPort === 'DRAW') {
      lcs.drawn += 1;
      lcs.points += 1;
      lcs.gf += 1;
      lcs.ga += 1;
      port.drawn += 1;
      port.points += 1;
      port.gf += 1;
      port.ga += 1;
    } else {
      port.won += 1;
      port.points += 3;
      port.gf += 2;
      port.ga += 1;
      lcs.lost += 1;
      lcs.gf += 1;
      lcs.ga += 2;
    }

    return table.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  };

  const simulatedTable = calculateSimulatedTable();
  const persibRank = simulatedTable.findIndex((t) => t.isPersib) + 1;
  const isQualified = persibRank <= 2;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isPro ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              ACL Two Scenario Simulator
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  isPro ? 'bg-blue-950 text-cyan-300 border border-cyan-800' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Grup F Kalkulator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulasi otomatis peluang Persib Bandung lolos ke Babak 16 Besar ACL Two
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold ${
            isQualified
              ? isPro
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
              : isPro
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
              : 'bg-rose-50 border border-rose-300 text-rose-700'
          }`}
        >
          {isQualified ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                POSISI #{persibRank}: LOLOS KE BABAK 16 BESAR ({persibRank === 1 ? 'JUARA GRUP' : 'RUNNER-UP'})
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>POSISI #{persibRank}: TIDAK LOLOS (MINIMAL RUNNER-UP)</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-5">
        <div
          className={`p-4 rounded-xl border ${
            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2.5">
            <span className="text-blue-500">Matchday 5 (Home)</span>
            <span className="text-slate-400">Si Jalak Harupat</span>
          </div>
          <div className="text-sm font-semibold mb-2">PERSIB vs Port FC</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setPersibVsPort('WIN');
                setPersibVsPortScore([2, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsPort === 'WIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Menang (2-1)
            </button>
            <button
              onClick={() => {
                setPersibVsPort('DRAW');
                setPersibVsPortScore([1, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsPort === 'DRAW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Seri (1-1)
            </button>
            <button
              onClick={() => {
                setPersibVsPort('LOSS');
                setPersibVsPortScore([0, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsPort === 'LOSS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Kalah (0-1)
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Skor simulasi: <span className="font-mono font-bold text-blue-400">{persibVsPortScore[0]} - {persibVsPortScore[1]}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2.5">
            <span className="text-blue-500">Matchday 6 (Away)</span>
            <span className="text-slate-400">Huanglong Sports</span>
          </div>
          <div className="text-sm font-semibold mb-2">Zhejiang FC vs PERSIB</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setPersibVsZhejiang('WIN');
                setPersibVsZhejiangScore([2, 0]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsZhejiang === 'WIN'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Menang (0-2)
            </button>
            <button
              onClick={() => {
                setPersibVsZhejiang('DRAW');
                setPersibVsZhejiangScore([1, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsZhejiang === 'DRAW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Seri (1-1)
            </button>
            <button
              onClick={() => {
                setPersibVsZhejiang('LOSS');
                setPersibVsZhejiangScore([0, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsZhejiang === 'LOSS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Kalah (1-0)
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Skor simulasi: <span className="font-mono font-bold text-blue-400">{persibVsZhejiangScore[0]} - {persibVsZhejiangScore[1]}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2.5">
            <span className="text-purple-400">Hasil Rival Grup F</span>
            <span className="text-slate-400">Jalan Besar Stadium</span>
          </div>
          <div className="text-sm font-semibold mb-2">Lion City vs Port FC</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setLionCityVsPort('WIN')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lionCityVsPort === 'WIN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              LCS Menang
            </button>
            <button
              onClick={() => setLionCityVsPort('DRAW')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lionCityVsPort === 'DRAW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Imbang
            </button>
            <button
              onClick={() => setLionCityVsPort('LOSS')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                lionCityVsPort === 'LOSS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Port Menang
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Dampak: Menentukan persaingan selisih gol & peringkat akhir
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr
              className={`border-b ${
                isPro ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              <th className="py-2.5 px-3"># Pos</th>
              <th className="py-2.5 px-3">Klub</th>
              <th className="py-2.5 px-2 text-center">Main</th>
              <th className="py-2.5 px-2 text-center">M</th>
              <th className="py-2.5 px-2 text-center">S</th>
              <th className="py-2.5 px-2 text-center">K</th>
              <th className="py-2.5 px-2 text-center">GM</th>
              <th className="py-2.5 px-2 text-center">GK</th>
              <th className="py-2.5 px-2 text-center">SG</th>
              <th className="py-2.5 px-3 text-center font-bold">Poin</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {simulatedTable.map((team, idx) => {
              const rank = idx + 1;
              const isTop2 = rank <= 2;
              return (
                <tr
                  key={team.name}
                  className={`border-b transition-colors ${
                    team.isPersib
                      ? isPro
                        ? 'bg-blue-950/60 border-blue-800/80 font-bold text-cyan-200'
                        : 'bg-blue-50/80 border-blue-200 font-bold text-blue-900'
                      : isPro
                      ? 'border-slate-800/50 hover:bg-slate-800/30 text-slate-300'
                      : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                        isTop2
                          ? isPro
                            ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-400/50'
                            : 'bg-emerald-100 text-emerald-800'
                          : isPro
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rank}
                    </span>
                  </td>
                  <td className="py-3 px-3 flex items-center gap-2">
                    <span>{team.name}</span>
                    {team.isPersib && (
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">
                        Klub Anda
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-mono">{team.played}</td>
                  <td className="py-3 px-2 text-center font-mono">{team.won}</td>
                  <td className="py-3 px-2 text-center font-mono">{team.drawn}</td>
                  <td className="py-3 px-2 text-center font-mono">{team.lost}</td>
                  <td className="py-3 px-2 text-center font-mono">{team.gf}</td>
                  <td className="py-3 px-2 text-center font-mono">{team.ga}</td>
                  <td className="py-3 px-2 text-center font-mono">
                    {team.gf - team.ga > 0 ? `+${team.gf - team.ga}` : team.gf - team.ga}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-sm text-blue-500 dark:text-cyan-300">
                    {team.points}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {isTop2 ? (
                      <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                        Lolos 16 Besar
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Tereliminasi</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
