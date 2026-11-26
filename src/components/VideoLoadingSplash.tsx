'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play, Shield, Loader2 } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

// REFACTOR: Bump session key to v6 to reset any stale dismiss states
export const SPLASH_SESSION_KEY = 'persib_opening_splash_v6';

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

  // REFACTOR: Autoplay imperatif langsung tanpa deadlock loadedmetadata
  useEffect(() => {
    if (alreadyShown) return;
    const video = videoRef.current;
    if (!video) return;

    // Set seluruh atribut DOM esensial agar video lolos kebijakan autoplay mobile browser
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.playbackRate = 1.0;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    // Paksa browser memuat buffer video segera
    try {
      video.load();
    } catch {}

    const handlePlaySuccess = () => {
      setIsPlaying(true);
      setAutoplayBlocked(false);
    };

    // Jalankan play secara langsung (browser modern mengizinkan play untuk muted + playsinline)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(handlePlaySuccess)
        .catch(() => {
          // Jika kebijakan browser memblokir autoplay otomatis, tampilkan tombol play manual
          setAutoplayBlocked(true);
        });
    }

    const onCanPlay = () => {
      const p = video.play();
      if (p !== undefined) {
        p.then(handlePlaySuccess).catch(() => setAutoplayBlocked(true));
      }
    };

    video.addEventListener('playing', handlePlaySuccess);
    video.addEventListener('canplay', onCanPlay);

    // Safety fallback: maksimal 6 detik jika media tidak dapat dimainkan
    const safetyTimer = setTimeout(() => {
      if (!video.currentTime || video.paused) {
        handleDismiss();
      }
    }, 6000);

    return () => {
      clearTimeout(safetyTimer);
      if (video) {
        video.removeEventListener('playing', handlePlaySuccess);
        video.removeEventListener('canplay', onCanPlay);
      }
    };
  }, [alreadyShown, handleDismiss]);

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

  const handleManualPlayTap = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      onClick={autoplayBlocked ? () => handleManualPlayTap() : handleDismiss}
      style={{ backgroundColor: '#040711' }}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer transition-all duration-450 ease-out ${
        isFading
          ? 'opacity-0 scale-105 filter blur-sm pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Visual Placeholder & Loading Aura: Mencegah layar hitam kosong saat video sedang memuat buffer */}
      {!isPlaying && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute -inset-6 rounded-full bg-blue-600/25 blur-2xl animate-pulse" />
            <img
              src="/new_persib_logo.jpeg"
              alt="PERSIB Official Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-full shadow-2xl border-2 border-cyan-400/40 relative z-10"
            />
          </div>

          <h3 className="text-white font-black text-sm tracking-widest uppercase mb-1">
            PERSIB BANDUNG
          </h3>
          <p className="text-cyan-300/80 font-mono text-[11px] font-semibold mb-4">
            Official Club Tracker 2026/2027
          </p>

          {!autoplayBlocked ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 backdrop-blur-md">
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-[10px] font-mono font-bold text-cyan-300">
                Memuat Animasi Sinematik...
              </span>
            </div>
          ) : (
            <div className="relative z-30 pointer-events-auto mt-2">
              <button
                type="button"
                onClick={(e) => handleManualPlayTap(e)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-slate-950 font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current text-slate-950" />
                <span>Putar Video Pembuka</span>
              </button>
              <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                Ketuk untuk menyaksikan animasi stadion GBLA
              </span>
            </div>
          )}
        </div>
      )}

      {/* Container Video Sinematik Layar Penuh */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
        <video
          ref={videoRef}
          src="/Stadium_scene_logo_animation_6f37cafb.mp4"
          poster="/new_persib_logo.jpeg"
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
            // Jika browser gagal membaca video, segera dismiss tanpa menggantung di layar hitam
            handleDismiss();
          }}
          style={{ backgroundColor: '#000000' }}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
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
          <span>Ketuk di mana saja untuk lewati</span>
        </div>
      </div>
    </div>
  );
}
