'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export const SPLASH_SESSION_KEY = 'persib_nav_from_player';

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  // Check if returning from inside the app (e.g. back button from player profile)
  const [alreadyShown] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const isFromPlayer = sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';
        if (isFromPlayer) {
          sessionStorage.removeItem(SPLASH_SESSION_KEY);
          return true;
        }
        return false;
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

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const handleDismiss = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    // Trigger onFinish synchronously with fade-out
    if (onFinishRef.current) onFinishRef.current();
    setTimeout(() => {
      setIsVisible(false);
    }, 400);
  }, [isFading]);

  const handleDismissRef = useRef(handleDismiss);
  useEffect(() => {
    handleDismissRef.current = handleDismiss;
  }, [handleDismiss]);

  // If returning from inside the app, notify parent immediately on mount
  useEffect(() => {
    if (alreadyShown && onFinishRef.current) {
      onFinishRef.current();
    }
  }, [alreadyShown]);

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

  // Imperative Autoplay with hardware acceleration attributes
  const attemptPlay = useCallback(() => {
    if (alreadyShown) return;
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.playbackRate = 1.0;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', 'true');
    v.setAttribute('x5-playsinline', 'true');

    try {
      v.load();
    } catch {}

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

  // Tap anywhere on the screen to directly start or resume video playback
  const handleScreenTap = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.defaultMuted = true;
      v.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (alreadyShown) return;
    const v = videoRef.current;
    if (!v) return;

    if (v.readyState >= 1) {
      attemptPlay();
    } else {
      v.addEventListener('loadedmetadata', attemptPlay, { once: true });
      v.addEventListener('canplay', attemptPlay, { once: true });
    }

    attemptPlay();

    const onUserInteraction = () => {
      handleScreenTap();
    };
    window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
    window.addEventListener('click', onUserInteraction, { once: true, passive: true });

    return () => {
      if (v) {
        v.removeEventListener('loadedmetadata', attemptPlay);
        v.removeEventListener('canplay', attemptPlay);
      }
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('click', onUserInteraction);
    };
  }, [alreadyShown, attemptPlay, handleScreenTap]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;

    const current = v.currentTime;
    const dur = v.duration;
    setProgressPercent(Math.min(100, Math.round((current / dur) * 100)));

    // Dismiss when video is within 0.2s of completion
    if (dur > 0.5 && current >= dur - 0.2) {
      handleDismiss();
    }
  };

  const handleVideoPlaying = () => {
    setIsPlaying(true);
    setAutoplayBlocked(false);
  };

  const handleManualPlayTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleScreenTap();
  };

  if (alreadyShown || !isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Layar Pembuka Sinematik PERSIB"
      onClick={handleScreenTap}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        overscrollBehavior: 'none',
        WebkitUserSelect: 'none',
      }}
      className={`fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer touch-none overscroll-none transition-all duration-400 ease-out bg-gradient-to-b from-[#091b38] via-[#050f22] to-[#020510] ${
        isFading
          ? 'opacity-0 scale-105 filter blur-xs pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Video Sinematik Layar Penuh Stadium_scene_logo_animation_6f37cafb.mp4 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none touch-none overscroll-none flex items-center justify-center">
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
          onPlaying={handleVideoPlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          onError={handleDismiss}
          className="w-full h-full object-cover object-center select-none pointer-events-none"
        >
          <source src="/Stadium_scene_logo_animation_6f37cafb.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Top Header: Lewati Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pt-6 flex items-center justify-end pointer-events-auto">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/40 text-white text-[11px] font-bold shadow-lg transition-all cursor-pointer"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Center Action: Play button if video not yet playing */}
      {!isPlaying && (
        <div className="relative z-20 flex flex-col items-center justify-center p-4 pointer-events-auto">
          <button
            type="button"
            onClick={handleManualPlayTap}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-400 text-blue-950 font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Putar Video Sinematik</span>
          </button>
        </div>
      )}

      {/* Bottom Area: Progress Bar & Hint */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pb-6 space-y-2 pointer-events-none">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400/70 font-medium px-0.5">
          <span>Stadion GBLA Sinematik</span>
          <span>Ketuk layar untuk memutar video</span>
        </div>
      </div>
    </div>
  );
}
