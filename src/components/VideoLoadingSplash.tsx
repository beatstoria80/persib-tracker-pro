'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export const SPLASH_SESSION_KEY = 'persib_opening_splash_v4';

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  // REFACTOR: Check sessionStorage so mobile refresh never loops or traps user in opening video
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
      }
    } catch {
      // Ignore storage errors in private browsing
    }
    if (isFading) return;
    setIsFading(true);
    // Trigger onFinish synchronously with fade-out
    if (onFinish) onFinish();
    setTimeout(() => {
      setIsVisible(false);
    }, 400);
  }, [isFading, onFinish]);

  // If already shown in session, notify parent immediately on mount
  useEffect(() => {
    if (alreadyShown && onFinish) {
      onFinish();
    }
  }, [alreadyShown, onFinish]);

  const attemptPlay = useCallback(() => {
    if (alreadyShown) return;
    const v = videoRef.current;
    if (!v) return;

    // Explicitly configure DOM properties to bypass mobile browser autoplay restrictions
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.playbackRate = 1.0;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');

    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {
          // Autoplay restricted by mobile OS battery saver / user gesture requirement
          setAutoplayBlocked(true);
        });
    }
  }, [alreadyShown]);

  useEffect(() => {
    if (alreadyShown) return;
    attemptPlay();

    // Safety fallback: only if video is neither playing nor user is prompted
    let fallbackTimer: NodeJS.Timeout | null = null;
    if (!isPlaying && !autoplayBlocked) {
      fallbackTimer = setTimeout(() => {
        handleDismiss();
      }, 7000);
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [alreadyShown, attemptPlay, handleDismiss, isPlaying, autoplayBlocked]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;

    // Dismiss when video is within 0.2s of completion
    if (v.duration > 0.5 && v.currentTime >= v.duration - 0.2) {
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

  if (alreadyShown || !isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pemuatan Persib Tracker"
      onClick={handleDismiss}
      style={{ backgroundColor: '#050811' }}
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer transition-all duration-400 ease-out ${
        isFading ? 'opacity-0 scale-105 filter blur-xs pointer-events-none' : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Video animasi sinematik opening layar penuh */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
        <video
          ref={videoRef}
          src="/Stadium_scene_logo_animation_6f37cafb.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onPlaying={handleVideoPlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          onError={handleDismiss}
          style={{ backgroundColor: '#000000' }}
          className="w-full h-full object-cover object-center"
        >
          <source src="/Stadium_scene_logo_animation_6f37cafb.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Top Header: Clean subtle Skip Pill Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/40 text-white text-[11px] font-bold shadow-lg transition-all"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Center Action: Play Button fallback if Autoplay was restricted by mobile OS */}
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

      {/* REFACTOR: Tap anywhere hint at bottom */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 flex justify-center text-center">
        <span className="text-[10px] text-slate-400/60 font-medium">Ketuk di mana saja untuk lanjut</span>
      </div>
    </div>
  );
}
