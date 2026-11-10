'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export function VideoLoadingSplash({ onFinish, minDurationMs = 3200 }: VideoLoadingSplashProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    setIsFading(true);

    // Safely remove native raw preloader if still present in DOM
    const rawSplash = document.getElementById('pwa-native-splash');
    if (rawSplash) {
      rawSplash.style.transition = 'opacity 0.3s ease-out';
      rawSplash.style.opacity = '0';
      setTimeout(() => {
        try {
          rawSplash.remove();
        } catch {
          rawSplash.style.display = 'none';
        }
      }, 300);
    }

    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 400);
  }, [onFinish]);

  useEffect(() => {
    // REFACTOR: Explicitly enforce 1.0x native fast playback rate on mobile devices
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.defaultPlaybackRate = 1.0;
      const playPromise = videoRef.current.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(() => {
          // Handled silently if mobile battery saver blocks autoplay
        });
      }
    }

    // Hide raw DOM preloader now that interactive React splash is running
    const rawSplash = document.getElementById('pwa-native-splash');
    if (rawSplash) {
      rawSplash.style.display = 'none';
    }

    // High precision loading progress counter
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, handleDismiss]);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pemuatan Persib Tracker"
      className={`fixed inset-0 z-[99999] bg-[#002B7F] flex flex-col justify-between overflow-hidden select-none transition-opacity duration-400 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleDismiss}
    >
      {/* Background Fullscreen Video with Zero Dark Cast */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#002B7F]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 1.0;
              videoRef.current.defaultPlaybackRate = 1.0;
            }
          }}
          onEnded={handleDismiss}
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105"
        >
          <source src="/VideoLoading.mp4" type="video/mp4" />
          <source src="/Video loading.mp4" type="video/mp4" />
        </video>
        {/* REFACTOR: Cyan/Royal Blue subtle gradient - Eliminates any dark pitch black cast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#002B7F]/60 via-transparent to-[#002B7F]/25 pointer-events-none" />
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/40 text-white text-[11px] font-bold shadow-xl transition-all"
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
          <p className="text-xs text-cyan-200 font-medium tracking-wide drop-shadow-xs">
            Memuat Intelegensi & Data Real-Time Klub...
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="h-1.5 w-full bg-blue-950/60 backdrop-blur-xs rounded-full overflow-hidden p-0.5 border border-cyan-400/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-white rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 font-bold px-0.5">
            <span>KECEPATAN STANDAR 1X</span>
            <span>{progress}%</span>
          </div>
        </div>

        <span className="text-[10px] text-white/80 font-medium">
          Ketuk layar untuk langsung masuk ke aplikasi
        </span>
      </div>
    </div>
  );
}
