'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

export function ScenarioSimulator() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [persibVsJeonbuk, setPersibVsJeonbuk] = useState<'WIN' | 'DRAW' | 'LOSS'>('WIN');
  const [persibVsJeonbukScore, setPersibVsJeonbukScore] = useState<[number, number]>([2, 1]);
  const [persibVsBangkok, setPersibVsBangkok] = useState<'WIN' | 'DRAW' | 'LOSS'>('WIN');
  const [persibVsBangkokScore, setPersibVsBangkokScore] = useState<[number, number]>([2, 0]);
  const [jeonbukVsSydney, setJeonbukVsSydney] = useState<'WIN' | 'DRAW' | 'LOSS'>('WIN');

  const calculateSimulatedTable = () => {
    const table = [
      { name: 'PERSIB Bandung', played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7, isPersib: true },
      { name: 'Jeonbuk Hyundai (KOR)', played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, points: 6, isPersib: false },
      { name: 'Bangkok United (THA)', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, points: 3, isPersib: false },
      { name: 'Sydney FC (AUS)', played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 6, points: 1, isPersib: false },
    ];

    const persib = table.find((t) => t.isPersib)!;
    const jeonbuk = table.find((t) => t.name.includes('Jeonbuk'))!;
    const bangkok = table.find((t) => t.name.includes('Bangkok'))!;
    const sydney = table.find((t) => t.name.includes('Sydney'))!;

    // Match 1: Persib vs Jeonbuk
    persib.played += 1;
    jeonbuk.played += 1;
    persib.gf += persibVsJeonbukScore[0];
    persib.ga += persibVsJeonbukScore[1];
    jeonbuk.gf += persibVsJeonbukScore[1];
    jeonbuk.ga += persibVsJeonbukScore[0];

    if (persibVsJeonbukScore[0] > persibVsJeonbukScore[1]) {
      persib.won += 1;
      persib.points += 3;
      jeonbuk.lost += 1;
    } else if (persibVsJeonbukScore[0] === persibVsJeonbukScore[1]) {
      persib.drawn += 1;
      persib.points += 1;
      jeonbuk.drawn += 1;
      jeonbuk.points += 1;
    } else {
      persib.lost += 1;
      jeonbuk.won += 1;
      jeonbuk.points += 3;
    }

    // Match 2: Persib vs Bangkok United
    persib.played += 1;
    bangkok.played += 1;
    persib.gf += persibVsBangkokScore[0];
    bangkok.ga += persibVsBangkokScore[0];
    persib.ga += persibVsBangkokScore[1];
    bangkok.gf += persibVsBangkokScore[1];

    if (persibVsBangkokScore[0] > persibVsBangkokScore[1]) {
      persib.won += 1;
      persib.points += 3;
      bangkok.lost += 1;
    } else if (persibVsBangkokScore[0] === persibVsBangkokScore[1]) {
      persib.drawn += 1;
      persib.points += 1;
      bangkok.drawn += 1;
      bangkok.points += 1;
    } else {
      persib.lost += 1;
      bangkok.won += 1;
      bangkok.points += 3;
    }

    // Match 3: Jeonbuk vs Sydney FC
    jeonbuk.played += 1;
    sydney.played += 1;
    if (jeonbukVsSydney === 'WIN') {
      jeonbuk.won += 1;
      jeonbuk.points += 3;
      jeonbuk.gf += 2;
      jeonbuk.ga += 0;
      sydney.lost += 1;
      sydney.ga += 2;
    } else if (jeonbukVsSydney === 'DRAW') {
      jeonbuk.drawn += 1;
      jeonbuk.points += 1;
      sydney.drawn += 1;
      sydney.points += 1;
    } else {
      sydney.won += 1;
      sydney.points += 3;
      jeonbuk.lost += 1;
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
      className={`rounded-2xl border p-3.5 sm:p-5 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-sm'
          : 'bg-white border-slate-300 shadow-sm'
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
              ACL Two 2026/2027 Scenario Simulator
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  isPro ? 'bg-blue-950 text-cyan-300 border border-cyan-800' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Kalkulator Fase Grup Asia
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Kalkulasi peluang Persib Bandung asuhan Igor Tolic lolos ke Babak Gugur 16 Besar Asia
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
                POSISI #{persibRank}: LOLOS KE 16 BESAR ({persibRank === 1 ? 'JUARA GRUP' : 'RUNNER-UP'})
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
            <span className="text-blue-500">Matchday 4 (Home)</span>
            <span className="text-slate-400">Si Jalak Harupat</span>
          </div>
          <div className="text-sm font-semibold mb-2">PERSIB vs Jeonbuk Motors</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setPersibVsJeonbuk('WIN');
                setPersibVsJeonbukScore([2, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsJeonbuk === 'WIN'
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
                setPersibVsJeonbuk('DRAW');
                setPersibVsJeonbukScore([1, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsJeonbuk === 'DRAW'
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
                setPersibVsJeonbuk('LOSS');
                setPersibVsJeonbukScore([0, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsJeonbuk === 'LOSS'
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
            Skor simulasi: <span className="font-mono font-bold text-blue-400">{persibVsJeonbukScore[0]} - {persibVsJeonbukScore[1]}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2.5">
            <span className="text-blue-500">Matchday 5 (Away)</span>
            <span className="text-slate-400">Thammasat Stadium</span>
          </div>
          <div className="text-sm font-semibold mb-2">Bangkok United vs PERSIB</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => {
                setPersibVsBangkok('WIN');
                setPersibVsBangkokScore([2, 0]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsBangkok === 'WIN'
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
                setPersibVsBangkok('DRAW');
                setPersibVsBangkokScore([1, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsBangkok === 'DRAW'
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
                setPersibVsBangkok('LOSS');
                setPersibVsBangkokScore([0, 1]);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                persibVsBangkok === 'LOSS'
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
            Skor simulasi: <span className="font-mono font-bold text-blue-400">{persibVsBangkokScore[0]} - {persibVsBangkokScore[1]}</span>
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold mb-2.5">
            <span className="text-purple-400">Laga Rival Grup</span>
            <span className="text-slate-400">Jeonju World Cup Stadium</span>
          </div>
          <div className="text-sm font-semibold mb-2">Jeonbuk vs Sydney FC</div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setJeonbukVsSydney('WIN')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                jeonbukVsSydney === 'WIN'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Jeonbuk Menang
            </button>
            <button
              onClick={() => setJeonbukVsSydney('DRAW')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                jeonbukVsSydney === 'DRAW'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Imbang
            </button>
            <button
              onClick={() => setJeonbukVsSydney('LOSS')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                jeonbukVsSydney === 'LOSS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isPro
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-white text-slate-600 border'
              }`}
            >
              Sydney Menang
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            Dampak: Menentukan persaingan selisih gol peringkat 1 dan 2
          </div>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs whitespace-nowrap">
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
