'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export const SPLASH_SESSION_KEY = 'persib_nav_from_player';

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [alreadyShown, setAlreadyShown] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Session storage check to skip splash when returning from player page
  useEffect(() => {
    setIsMounted(true);
    try {
      const isFromPlayer = sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';
      if (isFromPlayer) {
        sessionStorage.removeItem(SPLASH_SESSION_KEY);
        setAlreadyShown(true);
        setIsVisible(false);
        if (onFinishRef.current) {
          onFinishRef.current();
        }
      }
    } catch {
      // Graceful fallback for sandboxed storage environments
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    if (onFinishRef.current) onFinishRef.current();
    setTimeout(() => {
      setIsVisible(false);
    }, 350);
  }, [isFading]);

  // Lock body scroll and prevent touch bounce while opening splash is active
  useEffect(() => {
    if (!isVisible || alreadyShown || !isMounted) return;
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
  }, [isVisible, alreadyShown, isMounted]);

  // Safe timeout: Dismiss automatically after 5.5 seconds if video stalls
  useEffect(() => {
    if (!isVisible || alreadyShown || !isMounted) return;
    const fallbackTimer = setTimeout(() => {
      handleDismiss();
    }, 5500);

    return () => clearTimeout(fallbackTimer);
  }, [isVisible, alreadyShown, isMounted, handleDismiss]);

  // Instant Autoplay without calling v.load() to avoid resetting media decoder
  useEffect(() => {
    if (alreadyShown || !isMounted) return;
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;

    const playVideo = () => {
      if (v && v.paused) {
        v.muted = true;
        v.play().catch(() => {});
      }
    };

    // Immediate attempt
    playVideo();

    // Event listeners to start as soon as first frames are ready
    v.addEventListener('canplay', playVideo, { once: true });
    v.addEventListener('loadeddata', playVideo, { once: true });

    // One-time interaction fallback in case mobile OS requires user gesture
    const onUserInteraction = () => {
      playVideo();
    };
    window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
    window.addEventListener('click', onUserInteraction, { once: true, passive: true });

    return () => {
      v.removeEventListener('canplay', playVideo);
      v.removeEventListener('loadeddata', playVideo);
      window.removeEventListener('touchstart', onUserInteraction);
      window.removeEventListener('click', onUserInteraction);
    };
  }, [alreadyShown, isMounted]);

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

  const handleScreenTap = () => {
    const v = videoRef.current;
    if (v && v.paused) {
      v.muted = true;
      v.defaultMuted = true;
      v.play().catch(() => {});
    }
  };

  if (!isMounted || alreadyShown || !isVisible) return null;

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
      className={`fixed inset-0 w-screen h-screen z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer touch-none overscroll-none transition-all duration-400 ease-out bg-[#040914] ${
        isFading
          ? 'opacity-0 scale-105 filter blur-xs pointer-events-none'
          : 'opacity-100 scale-100 filter blur-0'
      }`}
    >
      {/* Background Ambient Poster to eliminate any black screen while video initializes */}
      <div
        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center pointer-events-none transition-opacity duration-500 ease-out ${
          isVideoPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-pulse">
            <Image
              src="/new_persib_logo.jpeg"
              alt="PERSIB Logo"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-white font-black tracking-widest text-sm uppercase drop-shadow">
              PERSIB BANDUNG
            </span>
            <span className="text-cyan-400 text-[10px] font-bold tracking-wider">
              1933 • JUARA INDONESIA
            </span>
          </div>
        </div>
      </div>

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
          onPlaying={() => setIsVideoPlaying(true)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleDismiss}
          onError={handleDismiss}
          className={`w-full h-full object-cover object-center select-none pointer-events-none transition-opacity duration-300 ${
            isVideoPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Top Header: Lewati Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pt-6 flex items-center justify-end pointer-events-auto">
        <button
          type="button"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/80 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/40 text-white text-[11px] font-bold shadow-lg transition-all cursor-pointer"
        >
          <span>Lewati</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>

      {/* Bottom Area: Progress Bar & Brand Tagline */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 pb-6 space-y-2 pointer-events-none">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400/70 font-medium px-0.5">
          <span>Stadion GBLA Sinematik</span>
          <span>PERSIB Bandung 2026/2027</span>
        </div>
      </div>
    </div>
  );
}
