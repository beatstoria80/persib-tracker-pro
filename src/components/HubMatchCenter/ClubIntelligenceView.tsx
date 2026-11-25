'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { ClubAnalysisProfile, LeagueStandingRow } from '@/types/club';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  MapPin,
  Zap,
  TrendingUp,
  AlertTriangle,
  Flame,
  Swords,
  Crosshair,
  Camera,
} from 'lucide-react';

interface ClubIntelligenceViewProps {
  profile: ClubAnalysisProfile;
  standingRow?: LeagueStandingRow;
  onBack: () => void;
}

export function ClubIntelligenceView({
  profile,
  standingRow,
  onBack,
}: ClubIntelligenceViewProps) {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [activeTab, setActiveTab] = useState<'tactics' | 'players' | 'h2h' | 'stats'>('tactics');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* 1. Sleek Navigation Header with Back Button */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 border ${
            isPro
              ? 'bg-[#121620] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>Kembali ke Klasemen</span>
        </button>

        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          <span>Verified Scouting</span>
        </span>
      </div>

      {/* 2. Hero Club Profile Card (Brand Header) */}
      <div
        className={`p-5 rounded-[32px] border relative overflow-hidden shadow-xl transition-all ${
          isPro
            ? 'bg-gradient-to-br from-blue-950/40 via-[#121620] to-[#0E1118] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
            : 'bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-slate-200 shadow-[0_12px_35px_rgba(0,0,0,0.06)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-16 h-16 rounded-2xl p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shrink-0 flex items-center justify-center">
              <Image
                src={profile.logoUrl}
                alt={profile.name}
                width={56}
                height={56}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-md bg-blue-600 text-white shrink-0">
                  {profile.shortName}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  Est. {profile.foundedYear}
                </span>
              </div>
              <h2 className={`text-xl font-black tracking-tight mt-1 truncate ${isPro ? 'text-white' : 'text-slate-950'}`}>
                {profile.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                &ldquo;{profile.nickname}&rdquo;
              </p>
            </div>
          </div>

          {/* Ranking & Points Badge */}
          {standingRow && (
            <div className="text-right shrink-0">
              <span className="text-3xl font-black font-mono text-blue-600 dark:text-cyan-400 block leading-none">
                #{standingRow.rank}
              </span>
              <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                {standingRow.points} Poin
              </span>
            </div>
          )}
        </div>

        {/* Quick Meta Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Stadion Kandang</span>
              <span className="font-bold truncate block">{profile.stadium}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="truncate">
              <span className="text-[9px] text-slate-400 block uppercase font-bold">Pelatih Kepala</span>
              <span className="font-bold truncate block">
                {profile.headCoach} ({profile.headCoachNationality})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Switcher Pills */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
        <button
          onClick={() => setActiveTab('tactics')}
          className={`py-2 rounded-xl transition-all text-center ${
            activeTab === 'tactics'
              ? isPro
                ? 'bg-[#181D2A] text-cyan-400 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Taktis & Radar
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`py-2 rounded-xl transition-all text-center ${
            activeTab === 'players'
              ? isPro
                ? 'bg-[#181D2A] text-cyan-400 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Pemain Kunci
        </button>

        <button
          onClick={() => setActiveTab('h2h')}
          className={`py-2 rounded-xl transition-all text-center ${
            activeTab === 'h2h'
              ? isPro
                ? 'bg-[#181D2A] text-cyan-400 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          vs PERSIB
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`py-2 rounded-xl transition-all text-center ${
            activeTab === 'stats'
              ? isPro
                ? 'bg-[#181D2A] text-cyan-400 shadow-xs'
                : 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Statistik
        </button>
      </div>

      {/* TAB 1: TACTICS & RADAR */}
      {activeTab === 'tactics' && (
        <div className="space-y-3.5">
          {/* Tactical Radar Ratings */}
          <div
            className={`p-5 rounded-3xl border ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Indeks Kekuatan Taktikal 2026/2027
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-cyan-300">
                {profile.preferredFormation}
              </span>
            </div>

            {/* Radar Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-rose-500">
                    <Flame className="w-3.5 h-3.5" /> Indeks Daya Serang (Attack)
                  </span>
                  <span className="font-mono">{profile.attackRating} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-700"
                    style={{ width: `${profile.attackRating}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-blue-500 dark:text-cyan-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Soliditas Pertahanan (Defense)
                  </span>
                  <span className="font-mono">{profile.defenseRating} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                    style={{ width: `${profile.defenseRating}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <Zap className="w-3.5 h-3.5" /> Fleksibilitas Taktis (Adaptability)
                  </span>
                  <span className="font-mono">{profile.tacticalFlexibility} / 100</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                    style={{ width: `${profile.tacticalFlexibility}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tactical Style Box */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                Gaya Bermain Utama
              </span>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {profile.tacticalStyle}
              </p>
            </div>
          </div>

          {/* Key Tactical Strengths */}
          <div
            className={`p-5 rounded-3xl border ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Kekuatan Taktis Kunci (Scouted Strengths)
              </h3>
            </div>

            <div className="space-y-3">
              {profile.strengths.map((str, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border ${
                    isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-950 dark:text-white">
                      {str.title}
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-500">
                      {str.rating}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {str.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Vulnerabilities */}
          <div
            className={`p-5 rounded-3xl border ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Kerentanan Taktikal (Bisa Dieksploitasi Persib)
              </h3>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              {profile.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 2: KEY PLAYERS & SQUAD PROFILE */}
      {activeTab === 'players' && (
        <div className="space-y-3.5">
          {/* Official Squad Photo Profile Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg group">
            <img
              src={
                profile.squadPhotoUrl ||
                'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
              }
              alt={`Foto Skuad Resmi ${profile.name}`}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-40 object-cover select-none transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
              <div className="flex items-end justify-between w-full">
                <div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase font-black text-cyan-300 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/40 backdrop-blur-sm">
                    <Camera className="w-2.5 h-2.5" /> Foto Profil Skuad 2026/2027
                  </span>
                  <h3 className="text-base font-black text-white mt-1 drop-shadow-md">
                    Skuad Resmi {profile.name}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Formasi Utama: <strong className="text-cyan-300">{profile.preferredFormation}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-300 block font-bold uppercase">Nilai Pasar</span>
                  <span className="text-xs font-mono font-black text-emerald-400 drop-shadow">
                    {profile.squadMarketValue}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Pemain Kunci & Pilar Utama Skuad:</span>
            <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold">
              {profile.keyPlayers.length} Pemain Kunci
            </span>
          </div>

          {profile.keyPlayers.map((player, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-3xl border flex items-center justify-between gap-3 transition-all ${
                isPro
                  ? 'bg-[#121620] border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <PlayerAvatar
                  name={player.name}
                  number={player.number}
                  avatarUrl={player.avatarUrl}
                  position={player.position}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black truncate text-slate-950 dark:text-white">
                      {player.name}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {player.position}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/40">
                    {player.keyStat}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] text-slate-400 block font-bold uppercase">Estimasi Pasar</span>
                <span className="text-xs font-mono font-black text-blue-600 dark:text-cyan-400">
                  {player.marketValue}
                </span>
              </div>
            </div>
          ))}

          <div
            className={`p-4 rounded-2xl border text-center ${
              isPro ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[10px] text-slate-400 block font-bold uppercase">
              Total Nilai Pasar Skuad Resmi
            </span>
            <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
              {profile.squadMarketValue}
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: HEAD TO HEAD VS PERSIB */}
      {activeTab === 'h2h' && (
        <div className="space-y-3.5">
          {/* H2H Stat Summary Banner */}
          <div
            className={`p-5 rounded-3xl border ${
              isPro
                ? 'bg-gradient-to-br from-blue-950/50 via-[#121620] to-[#0E1118] border-blue-900/50'
                : 'bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5" /> Rekor Head-to-Head Bersejarah
              </span>
              <span className="text-[9px] font-bold text-slate-400">
                vs PERSIB Bandung
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-2">
              <div className="p-2.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Menang</span>
                <span className="text-xl font-mono font-black text-blue-600 dark:text-cyan-400">
                  {profile.headToHeadVsPersib.totalWinsVsPersib}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Imbang</span>
                <span className="text-xl font-mono font-black text-slate-700 dark:text-slate-300">
                  {profile.headToHeadVsPersib.drawsVsPersib}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/40 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Kalah</span>
                <span className="text-xl font-mono font-black text-rose-500">
                  {profile.headToHeadVsPersib.lossesVsPersib}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">Hasil Pertemuan Terakhir:</span>
              <span className="font-black text-slate-900 dark:text-white">
                {profile.headToHeadVsPersib.lastMeetingScore}
              </span>
            </div>
          </div>

          {/* Tactical Scouting Report */}
          <div
            className={`p-5 rounded-3xl border ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Catatan Intelijen Taktis Bojan Hodak
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              &ldquo;{profile.headToHeadVsPersib.scoutingReport}&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: COMPLETE SEASON STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-3.5">
          <div
            className={`p-5 rounded-3xl border ${
              isPro ? 'bg-[#121620] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Statistik Super League 2026/2027
              </span>
              <span className="text-xs font-black text-blue-600 dark:text-cyan-400 font-mono">
                Peringkat #{standingRow?.rank ?? 5}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Main (MP)</span>
                <span className="text-lg font-mono font-black">{standingRow?.played ?? 9} Laga</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Poin</span>
                <span className="text-lg font-mono font-black text-blue-600 dark:text-cyan-400">
                  {standingRow?.points ?? 16}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Gol (GF:GA)</span>
                <span className="text-lg font-mono font-black">
                  {standingRow?.gf ?? 16} : {standingRow?.ga ?? 10}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Selisih Gol</span>
                <span className="text-lg font-mono font-black text-emerald-500">
                  {(standingRow?.gd ?? 6) > 0 ? `+${standingRow?.gd ?? 6}` : standingRow?.gd ?? 6}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">Rasio Kemenangan:</span>
              <span className="font-mono font-black text-slate-900 dark:text-white">
                {standingRow && standingRow.played > 0
                  ? ((standingRow.won / standingRow.played) * 100).toFixed(1)
                  : '60.0'}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Verified Disclaimer */}
      <div className="pt-2 text-center text-[10px] text-slate-400 font-mono">
        Sumber Analisis Terverifikasi: {profile.verifiedBy}
      </div>
    </div>
  );
}

