'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { TacticalPitch2D } from './TacticalPitch2D';
import { ScenarioSimulator } from './ScenarioSimulator';
import { Trophy, Calendar, CheckCircle2, Shield, MapPin, Users, Award } from 'lucide-react';

export function MatchCenter() {
  const {
    mode,
    activeTournament,
    setActiveTournament,
    fixtures,
    liga1Standings,
    players,
    setSelectedPlayer,
  } = useClubTracker();
  const isPro = mode === 'pro';

  const [matchViewTab, setMatchViewTab] = useState<'match_card' | 'lineup' | 'tactics' | 'standings'>('match_card');

  const currentFixture = fixtures.find((f) => f.tournamentKey === activeTournament) || fixtures[0];

  const startingXI = players.filter((p) => p.squadRole === 'starting');
  const substitutes = players.filter((p) => p.squadRole === 'substitute');

  return (
    <div className="space-y-6">
      {/* Tournament Selector Header */}
      <div
        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 flex items-center gap-1">
                <Award className="w-3 h-3" /> Musim Kompetisi 2026/2027 (Head Coach Igor Tolic)
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Match Center & Turnamen Resmi
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pusat data laga BRI Liga 1 2026/2027 (Pekan 11) & AFC Champions League Two
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setActiveTournament('liga1')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTournament === 'liga1'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇩 BRI Liga 1 2026/27</span>
              <span className="text-[9px] uppercase px-1 rounded bg-amber-400 text-slate-950 font-black">
                Peringkat #1
              </span>
            </button>

            <button
              onClick={() => setActiveTournament('acl2')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTournament === 'acl2'
                  ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌏 ACL Two 2026/27</span>
            </button>
          </div>
        </div>

        {/* View mode sub-navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setMatchViewTab('match_card')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'match_card'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Laga Terpilih ({currentFixture.status === 'FINISHED' ? 'Hasil Resmi Pekan 11' : 'Jadwal'})
          </button>
          <button
            onClick={() => setMatchViewTab('lineup')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'lineup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Susunan Pemain 2026/2027 (Starting XI & Cadangan)
          </button>
          <button
            onClick={() => setMatchViewTab('tactics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'tactics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Animasi 2D & Spasial Taktik Igor Tolic
          </button>
          <button
            onClick={() => setMatchViewTab('standings')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              matchViewTab === 'standings'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Klasemen {activeTournament === 'liga1' ? 'BRI Liga 1 2026/2027' : 'ACL Two 2026/2027'}
          </button>
        </div>
      </div>

      {/* Tab 1: Match Card */}
      {matchViewTab === 'match_card' && (
        <div
          className={`rounded-3xl border overflow-hidden relative transition-all duration-300 ${
            isPro
              ? 'bg-gradient-to-br from-[#0c192c] via-[#091220] to-[#050912] border-blue-900/60 shadow-[0_8px_40px_rgba(0,102,255,0.18)]'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {isPro && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400" />
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-600/10 text-blue-500 border border-blue-500/20">
                  <Shield className="w-5 h-5 text-amber-400" />
                </span>
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                    {currentFixture.tournament}
                  </div>
                  <div className="text-sm font-semibold text-slate-300">{currentFixture.roundOrWeek}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                    currentFixture.status === 'FINISHED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-blue-950 text-cyan-300 border border-blue-800'
                  }`}
                >
                  {currentFixture.status === 'FINISHED' ? 'FULL TIME (RESMI PT LIB)' : 'JADWAL RESMI'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {currentFixture.date} • {currentFixture.time}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-center py-8 gap-6">
              <div className="flex items-center md:justify-end gap-4 text-left md:text-right">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentFixture.homeTeam}</h2>
                  <div className="text-xs text-slate-400 mt-1">Igor Tolic • Formasi 4-2-3-1</div>
                </div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl bg-blue-600 text-amber-300 ring-2 ring-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.5)] shrink-0">
                  PSB
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                {currentFixture.status === 'FINISHED' ? (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl sm:text-6xl font-black font-mono text-cyan-300">
                        {currentFixture.homeScore}
                      </span>
                      <span className="text-3xl font-light text-slate-500">-</span>
                      <span className="text-5xl sm:text-6xl font-black font-mono text-slate-300">
                        {currentFixture.awayScore}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kemenangan Pekan 11 (Unbeaten)
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-mono font-bold text-slate-300">VS</div>
                    <div className="mt-2 text-xs font-mono text-cyan-400">El Clasico Indonesia 2026/2027</div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl bg-slate-800 text-rose-400 ring-1 ring-slate-700 shrink-0">
                  {currentFixture.awayTeam.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{currentFixture.awayTeam}</h2>
                  <div className="text-xs text-slate-400 mt-1">Lawan Resmi PT LIB</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Venue: <strong className="text-slate-200">{currentFixture.venue}</strong></span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Data resmi dari Match Commissioner PT LIB & AFC musim 2026/2027
              </div>
            </div>

            {currentFixture.highlights && currentFixture.highlights.length > 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 mb-1 block">
                  Sorotan Resmi Laga:
                </span>
                <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                  {currentFixture.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Lineup (Starting XI vs Substitutes 2026/2027) */}
      {matchViewTab === 'lineup' && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 transition-all ${
            isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-5 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Line-Up Resmi Persib Bandung (Musim 2026/2027)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Head Coach: <strong className="text-cyan-300">Igor Tolic</strong> • Strategic Advisor: <strong className="text-amber-300">Bojan Hodak</strong> • Formasi: 4-2-3-1
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
              Formasi 4-2-3-1 Igor Tolic
            </span>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> 11 Pemain Pertama (Starting XI)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {startingXI.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-400/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                      #{player.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{player.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {player.nationality} • <strong className="text-blue-400">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                      {player.fitness.percentage}% Fit
                    </span>
                    <span className="text-[10px] text-slate-500">★ {player.stats.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider mb-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Pemain Cadangan & Rotasi Resmi (Substitutes)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {substitutes.map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold text-xs flex items-center justify-center">
                      #{player.number}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{player.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {player.nationality} • <strong className="text-blue-400">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        player.fitness.status === 'cedera'
                          ? 'text-rose-400'
                          : player.fitness.status === 'latihan_terpisah'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {player.fitness.status === 'cedera' ? 'Cedera' : `${player.fitness.percentage}%`}
                    </span>
                    <span className="text-[10px] text-slate-500">{player.stats.appearances} Laga</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2D & Spatial Tactical Pitch */}
      {matchViewTab === 'tactics' && <TacticalPitch2D />}

      {/* Tab 4: Standings */}
      {matchViewTab === 'standings' && (
        <div className="space-y-6">
          {activeTournament === 'liga1' ? (
            <div
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-amber-400">
                    Klasemen Resmi Sementara BRI Liga 1 2026/2027 (Pekan 11)
                  </span>
                  <h3 className="text-base font-black tracking-tight mt-0.5">
                    PERSIB Bandung Pemuncak Klasemen (27 Poin - Rekor Tak Terkalahkan)
                  </h3>
                </div>
                <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-cyan-500 text-slate-950">
                  🔥 Unbeaten 11 Pekan
                </span>
              </div>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
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
                      <th className="py-2.5 px-3 text-center">Form (5 Laga)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liga1Standings.map((row) => (
                      <tr
                        key={row.team}
                        className={`border-b transition-colors ${
                          row.isPersib
                            ? 'bg-blue-950/70 border-blue-800 text-cyan-200 font-bold'
                            : 'border-slate-800/40 hover:bg-slate-800/30 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                              row.rank === 1
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                                : row.rank <= 4
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 flex items-center gap-2">
                          <span>{row.team}</span>
                          {row.isPersib && (
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">
                              Pemuncak
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center font-mono">{row.played}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.won}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.drawn}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.lost}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.gf}</td>
                        <td className="py-3 px-2 text-center font-mono">{row.ga}</td>
                        <td className="py-3 px-2 text-center font-mono text-cyan-300">
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold text-sm text-cyan-300">
                          {row.points}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {row.form.map((res, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                                  res === 'W'
                                    ? 'bg-emerald-500 text-slate-950'
                                    : res === 'D'
                                    ? 'bg-amber-500 text-slate-950'
                                    : 'bg-rose-500 text-white'
                                }`}
                              >
                                {res}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ScenarioSimulator />
          )}
        </div>
      )}
    </div>
  );
}
