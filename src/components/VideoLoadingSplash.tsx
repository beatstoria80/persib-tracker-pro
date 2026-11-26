'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play, Shield } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

// REFACTOR: Bump session key to v5 to reset any stale dismiss states from previous sessions
export const SPLASH_SESSION_KEY = 'persib_opening_splash_v5';

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  // Cek apakah sudah pernah dilihat dalam sesi aktif saat ini
  const [alreadyShown] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [isVisible, setIsVisible] = useState<boolean>(!alreadyShown);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
      }
    } catch {
      // Abaikan error storage pada mode private
    }
    if (isFading) return;
    setIsFading(true);
    if (onFinish) onFinish();
    setTimeout(() => {
      setIsVisible(false);
    }, 450);
  }, [isFading, onFinish]);

  // Jika sudah ditampilkan sebelumnya dalam sesi tab ini, panggil onFinish segera
  useEffect(() => {
    if (alreadyShown && onFinish) {
      onFinish();
    }
  }, [alreadyShown, onFinish]);

  // REFACTOR: Autoplay imperatif robust dengan dukungan event loadedmetadata, loadeddata, dan canplay
  useEffect(() => {
    if (alreadyShown) return;
    const video = videoRef.current;
    if (!video) return;

    // Set atribut wajib autoplay di mobile browser secara langsung pada node DOM
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = 1.0;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch(() => {
            // Jika browser membatasi autoplay otomatis, tampilkan tombol putar manual
            setAutoplayBlocked(true);
          });
      }
    };

    if (video.readyState >= 1) {
      tryPlay();
    } else {
      video.addEventListener('loadedmetadata', tryPlay, { once: true });
      video.addEventListener('loadeddata', tryPlay, { once: true });
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    // Safety fallback: maksimal 8 detik jika video macet
    const fallbackTimer = setTimeout(() => {
      if (!isPlaying && !autoplayBlocked) {
        handleDismiss();
      }
    }, 8000);

    return () => {
      clearTimeout(fallbackTimer);
      if (video) {
        video.removeEventListener('loadedmetadata', tryPlay);
        video.removeEventListener('loadeddata', tryPlay);
        video.removeEventListener('canplay', tryPlay);
      }
    };
  }, [alreadyShown, handleDismiss, isPlaying, autoplayBlocked]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;

    const current = v.currentTime;
    const dur = v.duration;
    setProgressPercent(Math.min(100, Math.round((current / dur) * 100)));

    // Selesaikan splash tepat sebelum video habis (0.2s sebelum akhir)
    if (dur > 0.5 && current >= dur - 0.2) {
      handleDismiss();
    }
  };

  const handleManualPlayTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (v) {
      v.muted = true;
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

  if (alreadyShown || !isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pembuka Sinematik PERSIB"
      onClick={handleDismiss}
      style={{ backgroundColor: '#040711' }}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer transition-all duration-450 ease-out ${
        isFading
          ? 'opacity-0 scale-105 filter blur-sm pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Container Video Sinematik Layar Penuh (Menggunakan direct src pada tag video tanpa duplicate source child) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
        <video
          ref={videoRef}
          src="/Stadium_scene_logo_animation_6f37cafb.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          onError={() => {
            // Jangan langsung dismiss seketika pada synthetic error, coba reload sekali
            const v = videoRef.current;
            if (v && !v.src.includes('retry')) {
              v.src = '/Stadium_scene_logo_animation_6f37cafb.mp4?retry=1';
              v.load();
            } else {
              setTimeout(handleDismiss, 1500);
            }
          }}
          style={{ backgroundColor: '#000000' }}
          className="w-full h-full object-cover object-center"
        />
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

      {/* Pusat: Tombol Manual Play Jika Autoplay Dicegah Kebijakan Browser Mobile */}
      {autoplayBlocked && !isPlaying && (
        <div className="relative z-20 flex flex-col items-center justify-center p-6 text-center">
          <button
            type="button"
            onClick={handleManualPlayTap}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-slate-950 font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current text-slate-950" />
            <span>Putar Video Pembuka</span>
          </button>
          <span className="text-[10px] text-cyan-300/80 mt-2.5 font-medium">
            Ketuk untuk memulai animasi sinematik stadion
          </span>
        </div>
      )}

      {/* Bagian Bawah: Progress Bar Halus & Petunjuk Ketuk */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pb-6 space-y-2">
        {/* Progress Bar Video */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-xs">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400/70 px-0.5">
          <span>Stadion GBLA Sinematik</span>
          <span>Ketuk di mana saja untuk lanjut</span>
        </div>
      </div>
    </div>
  );
}
