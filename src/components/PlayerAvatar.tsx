'use client';

import React, { useState } from 'react';
import { getPlayerAvatar } from '@/data/persib-data';

export interface PlayerAvatarProps {
  name: string;
  number?: number;
  avatarUrl?: string;
  position?: string;
  isStarting?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function PlayerAvatar({
  name,
  number,
  avatarUrl,
  position,
  isStarting,
  size = 'md',
  className = '',
}: PlayerAvatarProps) {
  const [retryStage, setRetryStage] = useState<number>(0);
  const rawSrc = avatarUrl || getPlayerAvatar(name);

  // Fallback cascade: direct Transfermarkt/Custom -> Weserv Image Proxy -> UI Avatars high-res
  const getSrc = () => {
    if (retryStage === 0 && rawSrc) return rawSrc;
    if (retryStage <= 1 && rawSrc) {
      const cleanUrl = rawSrc.replace(/^https?:\/\//, '');
      return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=200&h=200&fit=cover`;
    }
    // Final reliable photo fallback
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1d4ed8&color=ffffff&bold=true&size=128`;
  };

  const currentSrc = getSrc();

  const sizeClasses = {
    xs: 'w-8 h-8 text-[9px] rounded-xl',
    sm: 'w-10 h-10 text-[10px] rounded-xl',
    md: 'w-13 h-13 text-xs rounded-2xl',
    lg: 'w-16 h-16 text-sm rounded-2xl',
    xl: 'w-20 h-20 text-base rounded-3xl',
  };

  // Position-coded frame ring accents
  const getPositionRing = (pos?: string) => {
    if (!pos) return 'ring-blue-500/40 border-blue-600/30';
    const p = pos.toUpperCase();
    if (p.includes('GK')) return 'ring-amber-400/60 border-amber-400/50';
    if (p.includes('DF')) return 'ring-emerald-400/60 border-emerald-400/50';
    if (p.includes('MF')) return 'ring-cyan-400/60 border-cyan-400/50';
    if (p.includes('FW')) return 'ring-rose-400/60 border-rose-400/50';
    return 'ring-blue-500/40 border-blue-600/30';
  };

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center font-black ${sizeClasses[size]} overflow-hidden shadow-md border ring-2 transition-transform select-none ${getPositionRing(
        position
      )} ${
        isStarting
          ? 'bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 ring-amber-400/70 shadow-amber-500/20'
          : 'bg-gradient-to-br from-blue-800 via-blue-950 to-slate-950 shadow-blue-900/30'
      } ${className}`}
    >
      {retryStage <= 2 && currentSrc ? (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <img
            src={currentSrc}
            alt={name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-contain select-none transition-all duration-300 scale-[0.88] origin-bottom drop-shadow-sm"
            onError={() => setRetryStage((prev) => prev + 1)}
            loading="lazy"
          />
          {/* Subtle bottom vignette to ensure number readability without cutting off the face */}
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-800 to-slate-950 text-white font-mono">
          <span>{number ? `#${number}` : name.substring(0, 2).toUpperCase()}</span>
        </div>
      )}

      {/* Number Badge Pill on the bottom right */}
      {number && size !== 'xs' && (
        <span
          className={`absolute bottom-0 right-0 font-mono text-[8px] font-black px-1 py-0.2 rounded-tl shadow-xs border-t border-l ${
            isStarting
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-blue-950/95 text-cyan-300 border-cyan-800/60'
          }`}
        >
          #{number}
        </span>
      )}

      {/* Starting XI Star/Dot indicator */}
      {isStarting && size !== 'xs' && (
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-xs ring-1 ring-black/40" />
      )}
    </div>
  );
}

