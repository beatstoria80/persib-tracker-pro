'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Play, Pause, RotateCcw, Layers, ShieldCheck } from 'lucide-react';
// REFACTOR: Strictly imported types to avoid implicit any
import { TacticalStep, TacticalPlayerPos } from '@/types/club';

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
  const currentStepData: TacticalStep =
    tacticalPlaybook.find((s: TacticalStep) => s.step === activeTacticalStep) || tacticalPlaybook[0];

  return (
    // REFACTOR: Contrast-adaptive container in State A and State B
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-[0_4px_25px_rgba(0,102,255,0.08)]'
          : 'bg-white border-slate-300 shadow-sm'
      }`}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-3 ${
          isPro ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2.5 rounded-xl ${
              isPro ? 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`text-base font-bold tracking-tight flex items-center gap-2 ${
                isPro ? 'text-slate-100' : 'text-slate-950'
              }`}
            >
              Visual Animasi Taktik 2D & Spasial Lapangan (2026/2027)
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-700 text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Head Coach Igor Tolic (4-2-3-1)
              </span>
            </h3>
            <p className={`text-xs ${isPro ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
              Simulasi transisi serangan vertikal: Poros ganda Thom Haye & Marc Klok ke Peralta & striker Uilliam
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border ${
              isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
            }`}
          >
            <button
              onClick={() => setPitchPerspective('2d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                pitchPerspective === '2d'
                  ? isPro
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-700 text-white shadow-sm'
                  : isPro
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-700 hover:text-blue-900'
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
                    : 'bg-blue-700 text-white shadow-sm'
                  : isPro
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-700 hover:text-blue-900'
              }`}
            >
              Spasial 2.5D
            </button>
          </div>
        </div>
      </div>

      <div className="my-5">
        <div
          className={`w-full aspect-[16/10] rounded-2xl relative overflow-hidden border p-3 select-none transition-transform duration-700 ${
            pitchPerspective === 'spatial'
              ? 'perspective-[1000px] [transform:rotateX(20deg)] scale-[0.96] shadow-2xl'
              : ''
          } ${
            isPro
              ? 'bg-gradient-to-b from-[#061826] to-[#040e17] border-blue-800/60 shadow-[inset_0_0_40px_rgba(0,102,255,0.15)]'
              : 'bg-[#15803d] border-emerald-800 shadow-inner'
          }`}
        >
          <svg className="w-full h-full" viewBox="0 0 100 64" preserveAspectRatio="none">
            <defs>
              <pattern id="tacticalGrid" width="10" height="64" patternUnits="userSpaceOnUse">
                <rect width="5" height="64" fill={isPro ? '#0a2233' : '#166534'} opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100" height="64" fill="url(#tacticalGrid)" />

            <rect
              x="2"
              y="2"
              width="96"
              height="60"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />
            <line
              x1="50"
              y1="2"
              x2="50"
              y2="62"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />
            <circle
              cx="50"
              cy="32"
              r="9.15"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />
            <circle cx="50" cy="32" r="0.6" fill={isPro ? '#38bdf8' : '#ffffff'} />

            <rect
              x="2"
              y="14"
              width="16.5"
              height="36"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />
            <rect
              x="81.5"
              y="14"
              width="16.5"
              height="36"
              fill="none"
              stroke={isPro ? '#38bdf8' : '#ffffff'}
              strokeWidth="0.5"
              strokeOpacity="0.7"
            />
          </svg>

          <div className="absolute top-3 left-4 text-[10px] font-mono font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded">
            Pertahanan Persib (Gawang Adam Przybek #1)
          </div>
          <div className="absolute top-3 right-4 text-[10px] font-mono font-bold text-amber-300 bg-black/40 px-2 py-0.5 rounded flex items-center gap-1">
            <span>Arah Serang &rarr; Gawang Lawan</span>
          </div>

          {currentStepData.playerPositions.map((player: TacticalPlayerPos) => (
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
                  player.id === 'cf' || player.id === 'rw' || player.id === 'am'
                    ? 'bg-amber-400 text-slate-950 ring-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                    : player.id === 'dm1' || player.id === 'dm2' || player.id === 'lw'
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

      {/* REFACTOR: Replaced hardcoded dark controller with adaptive light/pro styling */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border ${
          isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-300'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-mono font-bold uppercase ${
                isPro ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              {currentStepData.label}
            </span>
            <span className={`text-[10px] font-mono ${isPro ? 'text-slate-400' : 'text-slate-600 font-bold'}`}>
              (Fase {currentStepData.step} dari {tacticalPlaybook.length})
            </span>
          </div>
          <p className={`text-xs leading-relaxed max-w-2xl ${isPro ? 'text-slate-300' : 'text-slate-800 font-medium'}`}>
            {currentStepData.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTacticsPlaying(!isTacticsPlaying)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isTacticsPlaying
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'bg-blue-700 text-white hover:bg-blue-800 shadow-md'
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
            {tacticalPlaybook.map((step: TacticalStep) => (
              <button
                key={step.step}
                onClick={() => {
                  setIsTacticsPlaying(false);
                  setActiveTacticalStep(step.step);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  activeTacticalStep === step.step
                    ? isPro
                      ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300'
                      : 'bg-blue-700 text-white ring-2 ring-blue-400 shadow-sm'
                    : isPro
                    ? 'bg-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
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
            className={`p-2 rounded-lg ${
              isPro ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
