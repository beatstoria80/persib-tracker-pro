'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { TacticalPitch2D } from './TacticalPitch2D';
import { ScenarioSimulator } from './ScenarioSimulator';
import { Calendar, CheckCircle2, Shield, MapPin, Users, Award, ExternalLink, Sparkles } from 'lucide-react';
import { MatchFixture, Player, LeagueStandingRow } from '@/types/club';

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
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('l1-p8');

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  const currentFixture: MatchFixture =
    tournamentFixtures.find((f: MatchFixture) => f.id === selectedFixtureId) || tournamentFixtures[0] || fixtures[0];

  const startingXI: Player[] = players.filter((p: Player) => p.squadRole === 'starting');
  const substitutes: Player[] = players.filter((p: Player) => p.squadRole === 'substitute');

  return (
    <div className="space-y-3.5">
      {/* Mobile Tournament Selector Card */}
      <div
        className={`rounded-2xl border p-3.5 transition-all ${
          isPro
            ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_20px_rgba(0,102,255,0.08)]'
            : 'bg-white border-slate-300 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${
              isPro
                ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}
          >
            <Award className="w-3 h-3" /> Data Faktual Google / PT LIB
          </span>
          <span className="text-[10px] font-bold text-blue-600 font-mono">Posisi #4 (16 Poin)</span>
        </div>

        {/* Tournament Switcher (2-Column Mobile Buttons) */}
        <div
          className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
            isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => {
              setActiveTournament('liga1');
              setSelectedFixtureId('l1-p8');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTournament === 'liga1'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-900 hover:bg-white'
            }`}
          >
            <span>🇮🇩 BRI Liga 1</span>
          </button>

          <button
            onClick={() => {
              setActiveTournament('acl2');
              setSelectedFixtureId('acl2-26-md4');
            }}
            className={`flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
              activeTournament === 'acl2'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-700 text-white shadow-sm'
                : isPro
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-700 hover:text-blue-900 hover:bg-white'
            }`}
          >
            <span>🌏 ACL Two</span>
          </button>
        </div>

        {/* Horizontal Scrollable Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar text-xs font-semibold whitespace-nowrap">
          <button
            onClick={() => setMatchViewTab('match_card')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'match_card'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Laga ({activeTournament === 'liga1' ? 'Pekan 8 & 9' : 'Matchday 4'})
          </button>
          <button
            onClick={() => setMatchViewTab('standings')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'standings'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Klasemen 18 Tim
          </button>
          <button
            onClick={() => setMatchViewTab('lineup')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'lineup'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Line-Up Skuad
          </button>
          <button
            onClick={() => setMatchViewTab('tactics')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
              matchViewTab === 'tactics'
                ? isPro
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'bg-blue-50 text-blue-800 border-2 border-blue-600'
                : isPro
                ? 'text-slate-400'
                : 'text-slate-600'
            }`}
          >
            Taktik 2D Igor Tolic
          </button>
        </div>
      </div>

      {/* Tab 1: Match Card (Pekan 8 Selesai & Pekan 9 Jadwal) */}
      {matchViewTab === 'match_card' && (
        <div className="space-y-3">
          {/* Fixture Selector Pills */}
          {tournamentFixtures.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {tournamentFixtures.map((fix) => (
                <button
                  key={fix.id}
                  onClick={() => setSelectedFixtureId(fix.id)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all shrink-0 border ${
                    selectedFixtureId === fix.id
                      ? 'bg-blue-700 text-white border-blue-600 shadow-xs'
                      : isPro
                      ? 'bg-slate-900 border-slate-800 text-slate-400'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  {fix.roundOrWeek}
                </button>
              ))}
            </div>
          )}

          <div
            className={`rounded-2xl border overflow-hidden relative transition-all duration-300 ${
              isPro
                ? 'bg-gradient-to-br from-[#0c192c] via-[#091220] to-[#050912] border-blue-900/60 shadow-md text-slate-100'
                : 'bg-white border-slate-300 shadow-sm text-slate-950'
            }`}
          >
            {isPro && (
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400" />
            )}

            <div className="p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold text-amber-500 uppercase font-mono">{currentFixture.tournament}</span>
                </div>
                <span className={`flex items-center gap-1 font-medium ${isPro ? 'text-slate-400' : 'text-slate-600'}`}>
                  <Calendar className="w-3 h-3" /> {currentFixture.date} • {currentFixture.time}
                </span>
              </div>

              {/* Match Scoreboard Row (Native mobile feel) */}
              <div className="flex items-center justify-between py-5">
                {/* Home */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                      currentFixture.homeTeam.includes('PERSIB')
                        ? 'bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-md'
                        : isPro
                        ? 'bg-slate-800 text-cyan-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {currentFixture.homeTeam.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-xs mt-1.5 leading-tight">{currentFixture.homeTeam}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Tuan Rumah</span>
                </div>

                {/* Score / VS */}
                <div className="flex flex-col items-center px-2">
                  {currentFixture.status === 'FINISHED' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-black font-mono ${isPro ? 'text-cyan-300' : 'text-blue-900'}`}>
                          {currentFixture.homeScore}
                        </span>
                        <span className="text-xl font-light text-slate-400">-</span>
                        <span className={`text-3xl font-black font-mono ${isPro ? 'text-slate-300' : 'text-slate-800'}`}>
                          {currentFixture.awayScore}
                        </span>
                      </div>
                      <span className="mt-1 text-[8.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        FULL TIME
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`text-2xl font-black font-mono ${isPro ? 'text-slate-300' : 'text-slate-800'}`}>
                        VS
                      </span>
                      <span className="mt-1 text-[8.5px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        JADWAL RESMI
                      </span>
                    </>
                  )}
                </div>

                {/* Away */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                      currentFixture.awayTeam.includes('PERSIB')
                        ? 'bg-blue-700 text-amber-300 ring-2 ring-blue-500 shadow-md'
                        : isPro
                        ? 'bg-slate-800 text-rose-400 ring-1 ring-slate-700'
                        : 'bg-rose-50 border-2 border-rose-300 text-rose-700 shadow-xs'
                    }`}
                  >
                    {currentFixture.awayTeam.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-xs mt-1.5 leading-tight">{currentFixture.awayTeam}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Tamu</span>
                </div>
              </div>

              {/* Venue & Highlights */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> Venue:
                  </span>
                  <strong className={`font-semibold ${isPro ? 'text-slate-200' : 'text-slate-900'}`}>
                    {currentFixture.venue}
                  </strong>
                </div>

                {currentFixture.highlights && currentFixture.highlights.length > 0 && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] ${
                      isPro ? 'bg-slate-900/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-500 block mb-1">
                      Sorotan Pertandingan:
                    </span>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {currentFixture.highlights.map((h: string, i: number) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Standings (Official Google Sports / PT LIB 18 Teams) */}
      {matchViewTab === 'standings' && (
        <div className="space-y-3">
          {activeTournament === 'liga1' ? (
            <div
              className={`rounded-2xl border p-3.5 transition-all ${
                isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div className="pb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-amber-500 block">
                    Klasemen Resmi BRI Super League 2026/27 (Pekan 8)
                  </span>
                  <h3 className="text-xs font-black tracking-tight mt-0.5">
                    PERSIB Posisi #4 (16 Poin • Beda 2 Poin dari Puncak)
                  </h3>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Google Live
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar mt-2.5">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr
                      className={`border-b font-bold text-[10px] ${
                        isPro ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-700 bg-slate-50'
                      }`}
                    >
                      <th className="py-2 px-1.5 text-center">#</th>
                      <th className="py-2 px-2">Klub</th>
                      <th className="py-2 px-1 text-center">M</th>
                      <th className="py-2 px-1 text-center">M-S-K</th>
                      <th className="py-2 px-1 text-center">SG</th>
                      <th className="py-2 px-2 text-center font-bold">Poin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liga1Standings.map((row: LeagueStandingRow) => (
                      <tr
                        key={row.team}
                        className={`border-b transition-colors ${
                          row.isPersib
                            ? isPro
                              ? 'bg-blue-950/80 border-blue-800 text-cyan-200 font-bold'
                              : 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                            : isPro
                            ? 'border-slate-800/40 text-slate-300'
                            : 'border-slate-200 text-slate-800'
                        }`}
                      >
                        <td className="py-2 px-1.5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-[9px] ${
                              row.isPersib
                                ? 'bg-blue-700 text-white ring-1 ring-blue-400'
                                : row.rank <= 3
                                ? 'bg-amber-400 text-slate-950'
                                : isPro
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {row.rank}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-bold text-[11px] truncate max-w-[130px]">
                          {row.team}
                          {row.isPersib && (
                            <span className="ml-1 text-[8px] uppercase px-1 py-0.2 rounded bg-blue-700 text-white font-mono">
                              Klub Anda
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-1 text-center font-mono text-[10px]">{row.played}</td>
                        <td className="py-2 px-1 text-center font-mono text-[9px] text-slate-500">
                          {row.won}-{row.drawn}-{row.lost}
                        </td>
                        <td
                          className={`py-2 px-1 text-center font-mono text-[10px] font-bold ${
                            isPro ? 'text-cyan-300' : 'text-blue-700'
                          }`}
                        >
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td
                          className={`py-2 px-2 text-center font-mono font-black text-xs ${
                            row.isPersib
                              ? 'text-blue-700 dark:text-cyan-300 font-extrabold'
                              : isPro
                              ? 'text-slate-100'
                              : 'text-slate-900'
                          }`}
                        >
                          {row.points}
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

      {/* Tab 3: Lineup (Starting XI vs Substitutes) */}
      {matchViewTab === 'lineup' && (
        <div
          className={`rounded-2xl border p-3.5 transition-all ${
            isPro ? 'bg-[#0A111E]/90 border-blue-900/50' : 'bg-white border-slate-300 shadow-sm'
          }`}
        >
          <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Line-Up Skuad Faktual 2026/2027
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Head Coach: <strong className="text-blue-600">Igor Tolic</strong> (Formasi 4-2-3-1)
            </p>
          </div>

          <div className="mb-4">
            <h4
              className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isPro ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 11 Pemain Pertama (Starting XI)
            </h4>
            <div className="space-y-2">
              {startingXI.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                    isPro
                      ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                      : 'bg-white border-slate-200 hover:border-blue-600 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-700 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-emerald-600 font-bold block">
                      {player.fitness.percentage}% Fit
                    </span>
                    <span className="text-[10px] text-slate-500">★ {player.stats.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4
              className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                isPro ? 'text-cyan-400' : 'text-blue-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> Pemain Cadangan & Rotasi
            </h4>
            <div className="space-y-2">
              {substitutes.map((player: Player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer active:scale-[0.98] transition-all ${
                    isPro
                      ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isPro ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      #{player.number}
                    </span>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isPro ? 'text-slate-200' : 'text-slate-950'}`}>
                        {player.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {player.nationality} • <strong className="text-blue-600 font-bold">{player.position}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold block ${
                        player.fitness.status === 'cedera'
                          ? 'text-rose-600'
                          : player.fitness.status === 'latihan_terpisah'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
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

      {/* Tab 4: 2D Tactics */}
      {matchViewTab === 'tactics' && <TacticalPitch2D />}
    </div>
  );
}
