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
        playPromise.catch(() => {
          // Fallback sentuhan jika browser menerapkan restriksi autoplay ketat
          const onTouch = () => {
            if (video) {
              video.muted = true;
              video.play().catch(() => {});
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

    // Batas waktu pengaman jika durasi video tuntas (durasi 5.04s + jeda transisi)
    const safetyTimer = setTimeout(() => {
      handleDismissRef.current();
    }, 6500);

    return () => {
      clearTimeout(safetyTimer);
    };
  }, [isVisible]);

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

  const handleScreenTouch = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.muted = true;
      v.play().catch(() => {});
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pembuka Sinematik PERSIB"
      onClick={handleScreenTouch}
      style={{ backgroundColor: '#000000' }}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer transition-all duration-500 ease-out ${
        isFading
          ? 'opacity-0 scale-105 filter blur-sm pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Video Sinematik Layar Penuh Stadium_scene_logo_animation_6f37cafb.mp4 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none bg-black">
        <video
          ref={videoRef}
          src="/Stadium_scene_logo_animation_6f37cafb.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          className="w-full h-full object-cover object-center"
        >
          <source src="/Stadium_scene_logo_animation_6f37cafb.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Header Atas: Badge Pembuka Resmi & Tombol Lewati */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pt-6 flex items-center justify-between">
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
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/50 text-white text-[11px] font-extrabold shadow-lg transition-all"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Bagian Bawah: Progress Bar Halus & Petunjuk Sentuh */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pb-6 space-y-2">
        {/* Progress Bar Video */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-white/80 px-0.5 drop-shadow-sm">
          <span>Stadion GBLA Sinematik</span>
          <span>Ketuk di mana saja untuk lewati</span>
        </div>
      </div>
    </div>
  );
}
