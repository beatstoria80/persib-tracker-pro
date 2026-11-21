'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlayerIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/player/peralta-10');
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#050811] flex items-center justify-center text-white font-mono text-sm">
      <div className="animate-pulse flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
        <span>Memuat Video Profil Peralta...</span>
      </div>
    </div>
  );
}
