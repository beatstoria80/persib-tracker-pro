'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Shield } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export const SPLASH_SESSION_KEY = 'persib_opening_splash_v8';

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  // Check session storage on mount (lazy init)
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem(SPLASH_SESSION_KEY);
  });
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const handleDismiss = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'seen');
      }
    } catch {}
    if (onFinishRef.current) onFinishRef.current();
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  }, [isFading]);

  const handleDismissRef = useRef(handleDismiss);
  useEffect(() => {
    handleDismissRef.current = handleDismiss;
  }, [handleDismiss]);

  // If already seen in this session, immediately trigger onFinish and hide
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(SPLASH_SESSION_KEY)) {
        setIsVisible(false);
        if (onFinishRef.current) onFinishRef.current();
      }
    } catch {}
  }, []);

  // Lock body scroll and prevent touch bounce / drag while opening splash is active
  useEffect(() => {
    if (!isVisible) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      document.body.style.userSelect = prevUserSelect;
    };
  }, [isVisible]);

  // REFACTOR: Putar video Stadium_scene_logo_animation_6f37cafb.mp4 tepat satu kali saat splash aktif
  useEffect(() => {
    if (!isVisible) return;
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = 1.0;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    const startPlayback = () => {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch(() => {
            // Fallback interaksi jika browser menerapkan restriksi autoplay
            const onTouch = () => {
              if (video) {
                video.muted = true;
                video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
              }
              window.removeEventListener('touchstart', onTouch);
              window.removeEventListener('click', onTouch);
            };
            window.addEventListener('touchstart', onTouch, { once: true, passive: true });
            window.addEventListener('click', onTouch, { once: true, passive: true });
          });
      }
    };

    startPlayback();
    video.addEventListener('canplay', startPlayback, { once: true });
    video.addEventListener('playing', () => setIsVideoPlaying(true), { once: true });

    return () => {
      video.removeEventListener('canplay', startPlayback);
    };
  }, [isVisible]);

  // Timer keselamatan dimulai HANYA setelah video benar-benar mulai diputar
  useEffect(() => {
    if (!isVideoPlaying) return;
    const safetyTimer = setTimeout(() => {
      handleDismissRef.current();
    }, 7000);

    return () => clearTimeout(safetyTimer);
  }, [isVideoPlaying]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;

    const current = v.currentTime;
    const dur = v.duration;
    setProgressPercent(Math.min(100, Math.round((current / dur) * 100)));

    // Selesaikan splash tepat saat video mendekati akhir (0.15s sebelum usai)
    if (dur > 0.5 && current >= dur - 0.15) {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pembuka Sinematik PERSIB"
      style={{
        backgroundColor: '#030712',
        touchAction: 'none',
        userSelect: 'none',
        overscrollBehavior: 'none',
        WebkitUserSelect: 'none',
      }}
      className={`fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-default touch-none overscroll-none transition-all duration-500 ease-out ${
        isFading
          ? 'opacity-0 scale-100 filter blur-sm pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* 1. Backdrop Visual Seketika (Zero Black Screen - Instant Aura & Logo) */}
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#030712] via-[#05112c] to-[#02050e] pointer-events-none select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/30 via-slate-950/70 to-black pointer-events-none" />

        <div className={`relative flex flex-col items-center justify-center text-center px-4 transition-all duration-700 ${
          isVideoPlaying ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          <div className="relative w-28 h-28 rounded-3xl p-1.5 bg-gradient-to-b from-amber-400/50 via-blue-600/40 to-transparent shadow-[0_0_60px_rgba(37,99,235,0.5)] mb-4">
            <img
              src="/new_persib_logo.jpeg"
              alt="PERSIB Bandung"
              className="w-full h-full object-contain rounded-2xl drop-shadow-2xl animate-pulse"
            />
          </div>
          <h2 className="text-xl font-black tracking-wider text-white drop-shadow-md">
            PERSIB BANDUNG
          </h2>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 mt-1 uppercase font-bold">
            Gelora Bandung Lautan Api
          </span>
          <div className="flex items-center gap-1.5 mt-4 px-3 py-1 rounded-full bg-blue-950/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Memulai Tayangan Stadion...</span>
          </div>
        </div>
      </div>

      {/* 2. Video Sinematik Layar Penuh Default Formasi Layar (Fixed Fullscreen, Non-Draggable, Non-Scrollable) */}
      <div className="absolute inset-0 z-1 w-full h-full overflow-hidden pointer-events-none select-none touch-none overscroll-none">
        <video
          ref={videoRef}
          src="/Stadium_scene_logo_animation_6f37cafb.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          draggable={false}
          onPlaying={() => setIsVideoPlaying(true)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          className={`w-full h-full object-cover object-center select-none pointer-events-none transition-opacity duration-700 ${
            isVideoPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Header Atas: Badge Pembuka Resmi & Tombol Lewati */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pt-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 backdrop-blur-md border border-blue-800/50 text-[10px] font-mono font-bold text-cyan-300 shadow-sm">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>PERSIB OFFICIAL</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/50 text-white text-[11px] font-extrabold shadow-lg transition-all cursor-pointer"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Bagian Bawah: Progress Bar Halus & Identitas Resmi (Default Formasi Layar) */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pb-6 space-y-2 pointer-events-none">
        {/* Progress Bar Video */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-white/80 px-0.5 drop-shadow-sm">
          <span>Stadion GBLA Sinematik</span>
          <span>PERSIB Bandung 2026/2027</span>
        </div>
      </div>
    </div>
  );
}
