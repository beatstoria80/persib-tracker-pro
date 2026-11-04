'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Play, Pause, RotateCcw, Layers, ShieldCheck } from 'lucide-react';

export function TacticalPitch2D() {
  const {
    mode,
    tacticalPlaybook,
    activeTacticalStep,
    setActiveTacticalStep,
    isTacticsPlaying,
    setIsTacticsPlaying,
  } = useClubTracker();
  const isPro = mode === 'pro';

  const [pitchPerspective, setPitchPerspective] = useState<'2d' | 'spatial'>('2d');
  const currentStepData = tacticalPlaybook.find((s) => s.step === activeTacticalStep) || tacticalPlaybook[0];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header with Verified Tag & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isPro ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
              Visual Animasi Taktik 2D & Spasial Lapangan
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-600 text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Taktik Bojan Hodak
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simulasi transisi serangan resmi Persib Bandung: Build-up 3-2-4-1 hingga eksekusi gol
            </p>
          </div>
        </div>

        {/* Perspective Switcher: Pure 2D Flat vs Spatial Perspective */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPitchPerspective('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                pitchPerspective === '2d'
                  ? isPro
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Top-Down 2D
            </button>
            <button
              onClick={() => setPitchPerspective('spatial')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                pitchPerspective === 'spatial'
                  ? isPro
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-cyan-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spasial 2.5D
            </button>
          </div>
        </div>
      </div>

      {/* Main Tactical Animation Arena */}
      <div className="my-5">
        <div
          className={`w-full aspect-[16/10] rounded-2xl relative overflow-hidden border p-3 select-none transition-transform duration-700 ${
            pitchPerspective === 'spatial'
              ? 'perspective-[1000px] [transform:rotateX(20deg)] scale-[0.96] shadow-2xl'
              : ''
          } ${
            isPro
              ? 'bg-gradient-to-b from-[#061826] to-[#040e17] border-blue-800/60 shadow-[inset_0_0_40px_rgba(0,102,255,0.15)]'
              : 'bg-[#1b432a] border-emerald-900 shadow-inner'
          }`}
        >
          {/* Pitch Markings SVG */}
          <svg className="w-full h-full" viewBox="0 0 100 64" preserveAspectRatio="none">
            <defs>
              <pattern id="tacticalGrid" width="10" height="64" patternUnits="userSpaceOnUse">
                <rect width="5" height="64" fill={isPro ? '#0a2233' : '#1f4e31'} opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="64" fill="url(#tacticalGrid)" />

            {/* Field boundaries */}
            <rect
              x="2"
              y="2"
              width="96"
              height="60"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            {/* Half line */}
            <line
              x1="50"
              y1="2"
              x2="50"
              y2="62"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            <circle
              cx="50"
              cy="32"
              r="9.15"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            <circle cx="50" cy="32" r="0.6" fill={isPro ? '#38bdf8' : '#ffffff'} />

            {/* Penalty boxes */}
            <rect
              x="2"
              y="14"
              width="16.5"
              height="36"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
            <rect
              x="81.5"
              y="14"
              width="16.5"
              height="36"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.5"
            />
          </svg>

          {/* Directional Overlay */}
          <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-400">
            Pertahanan Persib (Gawang Mendoza)
          </div>
          <div className="absolute top-3 right-4 text-[10px] font-mono text-cyan-300 flex items-center gap-1">
            <span>Arah Serang &rarr; Gawang Lawan</span>
          </div>

          {/* Animated Player Nodes */}
          {currentStepData.playerPositions.map((player) => (
            <div
              key={player.id}
              style={{
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute flex flex-col items-center pointer-events-none transition-all duration-700 ease-out z-10"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[10px] font-mono shadow-md ring-2 ${
                  player.id === 'cf' || player.id === 'lw' || player.id === 'am'
                    ? 'bg-amber-400 text-slate-950 ring-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                    : player.id === 'dm1' || player.id === 'dm2' || player.id === 'rw'
                    ? 'bg-cyan-400 text-slate-950 ring-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                    : 'bg-blue-600 text-white ring-blue-400'
                }`}
              >
                {player.number}
              </div>
              <span className="text-[9px] font-bold text-white bg-slate-950/80 px-1 py-0.2 rounded mt-0.5 tracking-tighter whitespace-nowrap shadow">
                {player.name}
              </span>
            </div>
          ))}

          {/* Animated Ball */}
          <div
            style={{
              left: `${currentStepData.ballPos.x}%`,
              top: `${currentStepData.ballPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_15px_#fbbf24] z-20 transition-all duration-700 ease-out animate-pulse"
            title="Bola"
          />
        </div>
      </div>

      {/* Playback Controls & Tactical Phase Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase text-amber-400">
              {currentStepData.label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              (Langkah {currentStepData.step} dari {tacticalPlaybook.length})
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            {currentStepData.description}
          </p>
        </div>

        {/* Step Buttons & Play/Pause */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTacticsPlaying(!isTacticsPlaying)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isTacticsPlaying
                ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {isTacticsPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Jeda
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Putar Animasi
              </>
            )}
          </button>

          <div className="flex items-center gap-1">
            {tacticalPlaybook.map((step) => (
              <button
                key={step.step}
                onClick={() => {
                  setIsTacticsPlaying(false);
                  setActiveTacticalStep(step.step);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTacticalStep === step.step
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {step.step}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setIsTacticsPlaying(false);
              setActiveTacticalStep(1);
            }}
            title="Reset ke Fase 1"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
