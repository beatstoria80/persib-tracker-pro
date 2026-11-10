'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export function VideoLoadingSplash({ onFinish, minDurationMs = 2800 }: VideoLoadingSplashProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 450);
  }, [onFinish]);

  useEffect(() => {
    // Attempt auto-play with sound muted (guaranteed to be permitted by mobile browsers)
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback if browser requires user gesture
      });
    }

    // Animate loading progress bar
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [minDurationMs, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pemuatan Persib Tracker"
      className={`fixed inset-0 z-[99999] bg-[#002B7F] flex flex-col justify-between overflow-hidden select-none transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleDismiss}
    >
      {/* Background Fullscreen Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#002B7F]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          poster="/icon-512.png"
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
        >
          <source src="/VideoLoading.mp4" type="video/mp4" />
          <source src="/Video loading.mp4" type="video/mp4" />
        </video>
        {/* Subtle Dark Gradient Overlay for High Contrast Typography */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />
      </div>

      {/* Top Bar: Skip Pill Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-[10px] font-mono font-black tracking-wider shadow-lg">
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>PERSIB PRO 2026/27</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold shadow-xl transition-all"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Bottom Telemetry & Progress Indicator */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-6 flex flex-col items-center text-center space-y-3 pb-8 sm:pb-6">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md">
            PERSIB TRACKER PRO
          </h1>
          <p className="text-xs text-cyan-200/90 font-medium tracking-wide drop-shadow-xs">
            Memuat Intelegensi & Data Real-Time Klub...
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="h-1.5 w-full bg-white/20 backdrop-blur-xs rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-white rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300/80 font-bold px-0.5">
            <span>MEMULAI SISTEM</span>
            <span>{progress}%</span>
          </div>
        </div>

        <span className="text-[10px] text-white/60 font-medium">
          Ketuk layar untuk langsung masuk ke aplikasi
        </span>
      </div>
    </div>
  );
}
