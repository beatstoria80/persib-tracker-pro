'use client';

import React, { useState } from 'react';
import { getPlayerAvatar } from '@/data/persib-data';

export function PlayerAvatar({
  name,
  number,
  avatarUrl,
  size = 'md',
  className = '',
}: {
  name: string;
  number?: number;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const src = avatarUrl || getPlayerAvatar(name);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[9px]',
    sm: 'w-9 h-9 text-[10px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-16 h-16 text-base',
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden shrink-0 flex items-center justify-center font-black ${sizeClasses[size]} bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 text-white shadow-sm ring-1 ring-blue-500/30 ${className}`}
    >
      {!imgError && src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover object-top select-none"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-blue-700 to-slate-900 text-white font-mono">
          <span>{number ? `#${number}` : name.substring(0, 2).toUpperCase()}</span>
        </div>
      )}
      {number && size !== 'xs' && (
        <span className="absolute bottom-0 right-0 bg-blue-950/90 text-cyan-300 font-mono text-[8px] font-black px-1 rounded-tl shadow-xs border-t border-l border-cyan-800/50">
          #{number}
        </span>
      )}
    </div>
  );
}

