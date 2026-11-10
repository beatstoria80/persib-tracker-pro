'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface VideoLoadingSplashProps {
  onFinish?: () => void;
}

export function VideoLoadingSplash({ onFinish }: VideoLoadingSplashProps) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isFading, setIsFading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleDismiss = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    // REFACTOR: Trigger onFinish synchronously with fade-out so underlying elements rise up in cross-fade sync
    if (onFinish) onFinish();
    setTimeout(() => {
      setIsVisible(false);
    }, 550);
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
      className={`fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none transition-all duration-500 ease-out ${
        isFading ? 'opacity-0 scale-105 filter blur-xs pointer-events-none' : 'opacity-100 scale-100 filter blur-0'
      }`}
      onClick={handleDismiss}
    >
      {/* REFACTOR: Video murni layar penuh tanpa blocking element atau latar hitam */}
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
      </div>

      {/* Top Header: Clean subtle Skip Pill Button */}
      <div className="relative z-10 w-full max-w-[430px] mx-auto p-4 flex items-center justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-950/70 hover:bg-blue-900 active:scale-95 backdrop-blur-md border border-cyan-400/30 text-white text-[11px] font-bold shadow-lg transition-all"
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

      {/* REFACTOR: UI UX copy teks, progress bar shape, dan label 'Kecepatan 1.0x' dihilangkan seluruhnya agar video tampil sinematik & bersih */}
      <div className="relative z-10 w-full p-4 pointer-events-none" />
    </div>
  );
}
