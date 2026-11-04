'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Play, Pause, RotateCcw, Layers, ShieldCheck } from 'lucide-react';
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
    <div
      className={`rounded-2xl border p-3.5 transition-all duration-300 ${
        isPro
          ? 'bg-[#0A111E]/90 border-blue-900/50 shadow-sm'
          : 'bg-white border-slate-300 shadow-sm'
      }`}
    >
      {/* Mobile Tactical Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isPro ? 'bg-cyan-500/10 text-cyan-300' : 'bg-blue-50 text-blue-700'
            }`}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <span>Taktik Spasial 2026/27</span>
              <span className="text-[8px] uppercase font-mono px-1 rounded bg-blue-700 text-white">
                4-2-3-1 Tolic
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 leading-none mt-0.5">
              Poros Thom Haye & Klok &rarr; Uilliam
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-0.5 p-0.5 rounded-lg border shrink-0 ${
            isPro ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => setPitchPerspective('2d')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              pitchPerspective === '2d'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setPitchPerspective('spatial')}
            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
              pitchPerspective === 'spatial'
                ? isPro
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            2.5D
          </button>
        </div>
      </div>

      {/* Responsive Tactical Pitch Frame */}
      <div className="my-3">
        <div
          className={`w-full aspect-[16/11] rounded-2xl relative overflow-hidden border p-2 select-none transition-transform duration-700 ${
            pitchPerspective === 'spatial'
              ? 'perspective-[1000px] [transform:rotateX(20deg)] scale-[0.97] shadow-xl'
              : ''
          } ${
            isPro
              ? 'bg-gradient-to-b from-[#061826] to-[#040e17] border-blue-800/60 shadow-[inset_0_0_30px_rgba(0,102,255,0.15)]'
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

          <div className="absolute top-2 left-2.5 text-[8px] font-mono font-bold text-white/90 bg-black/40 px-1.5 py-0.2 rounded">
            Gawang Persib
          </div>
          <div className="absolute top-2 right-2.5 text-[8px] font-mono font-bold text-amber-300 bg-black/40 px-1.5 py-0.2 rounded">
            Serang &rarr;
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
                className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[9px] font-mono shadow-md ring-1.5 ${
                  player.id === 'cf' || player.id === 'rw' || player.id === 'am'
                    ? 'bg-amber-400 text-slate-950 ring-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : player.id === 'dm1' || player.id === 'dm2' || player.id === 'lw'
                    ? 'bg-cyan-400 text-slate-950 ring-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                    : 'bg-blue-600 text-white ring-blue-400'
                }`}
              >
                {player.number}
              </div>
              <span className="text-[7.5px] font-bold text-white bg-slate-950/80 px-1 rounded tracking-tighter whitespace-nowrap shadow mt-0.5">
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
            className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_10px_#fbbf24] z-20 transition-all duration-700 ease-out animate-pulse"
            title="Bola"
          />
        </div>
      </div>

      {/* Mobile Playback & Step Controls */}
      <div
        className={`p-3 rounded-xl border space-y-2.5 ${
          isPro ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[11px] font-mono font-bold uppercase ${
                isPro ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              {currentStepData.label}
            </span>
            <span className="text-[9px] font-mono text-slate-500 font-bold">
              (Fase {currentStepData.step}/{tacticalPlaybook.length})
            </span>
          </div>
          <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-300 font-medium">
            {currentStepData.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setIsTacticsPlaying(!isTacticsPlaying)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isTacticsPlaying
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            {isTacticsPlaying ? (
              <>
                <Pause className="w-3 h-3" /> Jeda
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" /> Animasi
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
                className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold transition-all ${
                  activeTacticalStep === step.step
                    ? isPro
                      ? 'bg-cyan-500 text-slate-950 ring-1 ring-cyan-300'
                      : 'bg-blue-700 text-white ring-1 ring-blue-400 shadow-xs'
                    : isPro
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {step.step}
              </button>
            ))}

            <button
              onClick={() => {
                setIsTacticsPlaying(false);
                setActiveTacticalStep(1);
              }}
              title="Reset ke Fase 1"
              className={`p-1.5 rounded-md ${
                isPro ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
