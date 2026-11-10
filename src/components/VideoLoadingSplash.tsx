'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onFinish) onFinish();
    }, 450);
  }, [isFading, onFinish]);

  const attemptPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    // REFACTOR: Explicitly configure DOM properties to bypass mobile browser autoplay restrictions
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.playbackRate = 1.0;
    v.defaultPlaybackRate = 1.0;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay restricted by mobile OS battery saver / user gesture requirement
          setAutoplayBlocked(true);
        });
    }
  }, []);

  useEffect(() => {
    attemptPlay();

    // Safety fallback: If video fails to load after 8s, allow user to enter app
    const fallbackTimer = setTimeout(() => {
      if (!isPlaying) {
        handleDismiss();
      }
    }, 8000);

    return () => clearTimeout(fallbackTimer);
  }, [attemptPlay, isPlaying, handleDismiss]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
    setProgress(pct);

    // Dismiss when video is within 0.1s of completion
    if (v.currentTime >= v.duration - 0.1) {
      handleDismiss();
    }
  };

  const handleVideoPlaying = () => {
    setIsPlaying(true);
    setAutoplayBlocked(false);
  };

  const handleManualPlayTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (v) {
      v.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          handleDismiss();
        });
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pemuatan Persib Tracker"
      style={{ backgroundColor: '#002B7F' }}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={handleDismiss}
    >
      {/* REFACTOR: Hapus elemen logo statis lama - Latar belakang langsung memutar VideoLoading.mp4 murni */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#002B7F]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={handleVideoPlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          style={{ backgroundColor: '#002B7F' }}
          className="w-full h-full object-cover object-center"
        >
          <source src="/VideoLoading.mp4" type="video/mp4" />
          <source src="/Video loading.mp4" type="video/mp4" />
        </video>
        {/* Subtle royal blue wash - Tanpa latar hitam kelam */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#002B7F]/40 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Top Header: Skip Pill Button */}
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

      {/* Center Action: Play Button if Autoplay was restricted by mobile OS */}
      {autoplayBlocked && !isPlaying && (
        <div className="relative z-20 flex flex-col items-center justify-center p-4">
          <button
            type="button"
            onClick={handleManualPlayTap}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-400 text-blue-950 font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Putar Video Pembuka</span>
          </button>
        </div>
      )}

      {/* Bottom Telemetry & Real Video Progress Indicator */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-6 flex flex-col items-center text-center space-y-3 pb-8 sm:pb-6">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-md">
            PERSIB TRACKER PRO
          </h1>
          <p className="text-xs text-cyan-200 font-medium tracking-wide drop-shadow-xs">
            {isPlaying ? 'Memutar Animasi Pembuka 1x...' : 'Menyiapkan Animasi Pembuka...'}
          </p>
        </div>

        {/* Dynamic Progress Bar bound to real video duration */}
        <div className="w-full max-w-xs space-y-1.5">
          <div className="h-1.5 w-full bg-blue-950/60 backdrop-blur-xs rounded-full overflow-hidden p-0.5 border border-cyan-400/30 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-white rounded-full transition-all duration-75 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 font-bold px-0.5">
            <span>KECEPATAN 1.0X</span>
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
