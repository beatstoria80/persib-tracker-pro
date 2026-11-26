'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { OFFICIAL_SQUAD_2026_2027, getPlayerAvatar } from '@/data/persib-data';
import { PlayerAvatar } from '@/components/PlayerAvatar';
import { SPLASH_SESSION_KEY } from '@/components/VideoLoadingSplash';
import {
  ArrowLeft,
  ShieldCheck,
  Share2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

function SquadThumbnailAvatar({
  player,
}: {
  player: (typeof OFFICIAL_SQUAD_2026_2027)[0];
}) {
  return (
    <PlayerAvatar
      name={player.name}
      number={player.number}
      avatarUrl={player.avatarUrl}
      position={player.position}
      size="xs"
      className="!w-8 !h-8 !rounded-full overflow-hidden shrink-0"
    />
  );
}

export default function PlayerVideoProfilePage() {
  const params = useParams();
  const router = useRouter();
  const routeId = (params?.id as string) || 'peralta-10';

  const normalizedRoute = routeId.toLowerCase().replace('caesar', 'cesar');

  // REFACTOR: Derive active player directly from routeId without setState-in-effect
  const activePlayer =
    OFFICIAL_SQUAD_2026_2027.find(
      (p) =>
        p.id.toLowerCase() === routeId.toLowerCase() ||
        p.id.toLowerCase() === normalizedRoute ||
        p.id.toLowerCase().includes(routeId.toLowerCase()) ||
        p.id.toLowerCase().includes(normalizedRoute) ||
        p.name.toLowerCase().includes(routeId.toLowerCase()) ||
        p.name.toLowerCase().includes(normalizedRoute) ||
        p.number.toString() === routeId.trim() ||
        (routeId.toLowerCase().includes('gatuko') && p.id.includes('notsuda')) ||
        (routeId.toLowerCase().includes('gakuto') && p.id.includes('notsuda')) ||
        (routeId.toLowerCase().includes('rhaka') && p.id.includes('rakha')) ||
        (routeId.toLowerCase().includes('syafaka') && p.id.includes('rakha')) ||
        (routeId.toLowerCase().includes('teja') && p.id.includes('teja')) ||
        (routeId.toLowerCase().includes('beckam') && p.id.includes('beckham')) ||
        (routeId.toLowerCase().includes('suyatna') && p.id.includes('adam')) ||
        (routeId.toLowerCase().includes('fitrah') && p.id.includes('fitrah'))
    ) ||
    OFFICIAL_SQUAD_2026_2027.find((p) => p.id === 'peralta-10') ||
    OFFICIAL_SQUAD_2026_2027[0];

  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activePlayer.name} #${activePlayer.number} - PERSIB Bandung 2026/2027`,
          text: `Profil resmi ${activePlayer.name} (${activePlayer.position}) skuad PERSIB Bandung musim 2026/2027.`,
          url,
        });
      } catch {
        // Fallback to clipboard
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedToast('Link profil berhasil disalin!');
      setTimeout(() => setCopiedToast(null), 2500);
    }
  };

  const handleBackToDashboard = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SPLASH_SESSION_KEY, 'seen');
      }
    } catch {}
    try {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // REFACTOR: Authentic player video resolution with cinematic stadium fallback
  const videoSource =
    activePlayer.videoUrl ||
    (activePlayer.id.includes('beckham') || activePlayer.id.includes('beckam')
      ? '/Beckam.mp4'
      : activePlayer.id.includes('kakang')
      ? '/Kakang.mp4'
      : activePlayer.id.includes('teja')
      ? '/paku_alam.mp4'
      : activePlayer.id.includes('adam')
      ? '/adam_alis.mp4'
      : activePlayer.id.includes('uilliam')
      ? '/uilliam.mp4'
      : activePlayer.id.includes('menalo')
      ? '/menalo.mp4'
      : activePlayer.id.includes('reijnders')
      ? '/Reijnders.mp4'
      : activePlayer.id.includes('klok')
      ? '/Klok.mp4'
      : activePlayer.id.includes('haye')
      ? '/haye.mp4'
      : activePlayer.id.includes('ragnar')
      ? '/Ragnar.mp4'
      : activePlayer.id.includes('walsh')
      ? '/Sandy_Walsh.mp4'
      : activePlayer.id.includes('peralta')
      ? '/peralta.mp4'
      : activePlayer.id.includes('loncar')
      ? '/Loncar.mp4'
      : activePlayer.id.includes('cesar') || activePlayer.id.includes('caesar')
      ? '/Cesar.mp4'
      : activePlayer.id.includes('matricardi')
      ? '/Matricardi.mp4'
      : activePlayer.id.includes('mutombo')
      ? '/Mutombo.mp4'
      : activePlayer.id.includes('notsuda') || activePlayer.id.includes('gatuko') || activePlayer.id.includes('gakuto')
      ? '/Gatuko.mp4'
      : '/Stadium_scene_logo_animation_6f37cafb.mp4') || '/Stadium_scene_logo_animation_6f37cafb.mp4';

  // Imperative Autoplay & Immediate Video Rendering Trigger (Zero Delay on Page Navigation)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Enforce hardware-accelerated muted inline autoplay for mobile WebView / Safari / Chrome
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');

    const tryPlay = () => {
      if (!video) return;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoPlaying(true))
          .catch(() => {
            // Retry muted playback if browser queued or throttled background play
            if (video) {
              video.muted = true;
              video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
            }
          });
      }
    };

    tryPlay();
    video.addEventListener('loadeddata', tryPlay, { once: true });
    video.addEventListener('canplay', tryPlay, { once: true });

    const onPlaying = () => setIsVideoPlaying(true);
    video.addEventListener('playing', onPlaying, { once: true });

    // Passive touch fallback in case aggressive OS battery saving mode requires first touch
    const resumeOnInteraction = () => {
      if (video && video.paused) {
        video.muted = true;
        video.play().then(() => setIsVideoPlaying(true)).catch(() => {});
      }
    };
    window.addEventListener('touchstart', resumeOnInteraction, { once: true, passive: true });
    window.addEventListener('click', resumeOnInteraction, { once: true, passive: true });

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('playing', onPlaying);
      window.removeEventListener('touchstart', resumeOnInteraction);
      window.removeEventListener('click', resumeOnInteraction);
    };
  }, [videoSource]);

  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex justify-center items-start overflow-hidden">
      {/* Native React 19 Head Video Preloading for Zero-Delay Startup */}
      <link rel="preload" as="video" type="video/mp4" href={videoSource} />

      {/* 430px Mobile-First App Canvas */}
      <div className="w-full max-w-[430px] h-screen max-h-screen relative flex flex-col justify-between overflow-hidden shadow-2xl bg-[#060c18]">
        {/* Background Looping Video Stream & Instant Hero Portrait (Zero Black Void) */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#09162e] via-[#050e20] to-[#03060f] flex items-center justify-center">
          {/* Ambient stadium lighting gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/35 via-slate-950/80 to-black pointer-events-none" />

          {/* Instant Player Portrait & Atmospheric Glow (Appears in 0.00ms while video streams) */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${
            isVideoPlaying ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}>
            {/* Ambient Blurred Aura from player avatar */}
            {activePlayer.avatarUrl && (
              <img
                src={activePlayer.avatarUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-30 scale-125 select-none"
              />
            )}

            {/* Centered Hero Identification Badge while video buffers */}
            <div className="relative flex flex-col items-center justify-center text-center px-4 -mt-16">
              <div className="relative w-40 h-40 rounded-full ring-4 ring-cyan-400/50 shadow-[0_0_60px_rgba(34,211,238,0.4)] overflow-hidden bg-slate-900/90 mb-4 p-1">
                <img
                  src={activePlayer.avatarUrl || getPlayerAvatar(activePlayer.name)}
                  alt={activePlayer.name}
                  className="w-full h-full object-contain origin-bottom scale-95"
                />
              </div>
              <span className="font-mono font-black text-2xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                #{activePlayer.number}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight mt-1 drop-shadow-md">
                {activePlayer.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-blue-950/90 border border-cyan-400/40 text-[10px] font-mono text-cyan-200 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Menyiapkan Siaran Looping...</span>
              </div>
            </div>
          </div>

          <video
            ref={videoRef}
            key={videoSource}
            src={videoSource}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onPlaying={() => setIsVideoPlaying(true)}
            onLoadedData={() => {
              if (videoRef.current && videoRef.current.paused) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
              }
            }}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Subtle Top & Bottom Gradient (Unobtrusive, Keeps Video Crisp & Unblurred) */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Floating Notification Toast */}
        {copiedToast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xl border border-blue-400/40 backdrop-blur-md animate-fade-in">
            {copiedToast}
          </div>
        )}

        {/* REFACTOR: Ultra-minimalist top navigation header */}
        <header className="relative z-40 px-4 pt-5 pb-3 flex items-center justify-between pointer-events-auto">
          <Link
            href="/"
            onClick={handleBackToDashboard}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 border border-white/25 backdrop-blur-md flex items-center justify-center text-white hover:text-cyan-300 transition-all cursor-pointer shadow-lg z-50 pointer-events-auto"
            aria-label="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 border border-white/25 backdrop-blur-md flex items-center justify-center text-white hover:text-cyan-300 transition-all cursor-pointer shadow-lg z-50 pointer-events-auto"
            aria-label="Bagikan Profil"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </header>

        {/* Transparent tap area over upper video to close sheet (Zero Blur, Zero Dimming) */}
        {isExpanded && (
          <div
            onClick={() => setIsExpanded(false)}
            className="absolute inset-0 z-15 cursor-pointer"
            aria-label="Tutup detail"
          />
        )}

        {/* REFACTOR: Minimized Profile Floating Bar (Looped video 100% visible) */}
        {!isExpanded && (
          <div
            className="relative z-20 px-4 pb-6 pt-2"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="w-full flex items-center justify-between p-3.5 px-4 rounded-2xl bg-slate-950/75 hover:bg-slate-900/85 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 group active:scale-[0.98]"
              aria-label="Buka Profil Lengkap Pemain"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/50 flex items-center justify-center font-mono font-black text-cyan-400 text-base shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                  #{activePlayer.number}
                </div>
                <div className="text-left truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-black text-sm text-white tracking-tight group-hover:text-cyan-400 transition-colors truncate">
                      {activePlayer.name}
                    </span>
                    {activePlayer.verifiedData && (
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 inline shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-200 font-medium truncate mt-0.5 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 shrink-0">
                      {activePlayer.nationality}
                    </span>
                    <span className="text-white/40">•</span>
                    {activePlayer.position === 'GK' ? (
                      <span className="truncate">
                        <span className="text-amber-300 font-black">{activePlayer.position}</span> • {activePlayer.stats.appearances} Laga • {activePlayer.stats.interceptions} Penyelamatan • Rating <strong className="text-amber-400 font-black">{activePlayer.stats.rating}</strong>
                      </span>
                    ) : (
                      <span className="truncate">
                        <span className="text-cyan-300 font-black">{activePlayer.position}</span> • {activePlayer.stats.goals} Gol • {activePlayer.stats.assists} Ast • Rating <strong className="text-amber-400 font-black">{activePlayer.stats.rating}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Minimalist Rise Icon Chevron without capsule or copy text */}
              <ChevronUp className="w-5 h-5 text-white/80 group-hover:text-cyan-400 transition-colors shrink-0 ml-2" />
            </button>
          </div>
        )}

        {/* REFACTOR: Risen Profile Sheet (Spacious layout, high-contrast, zero-collision) */}
        {isExpanded && (
          <div
            className="relative z-20 px-4 pb-6 pt-2 flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto no-scrollbar animate-sheet-rise"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
          >
            {/* Minimalist Close/Minimize Chevron Handle - Placed Outside in the Center */}
            <div className="flex justify-center -mb-1 z-30">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-cyan-300 transition-all active:scale-90 shadow-lg cursor-pointer"
                aria-label="Tutup sheet profil"
              >
                <ChevronDown className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Main Player Identification Card (High-Contrast Frosted Glass - Zero Collisions) */}
            <div className="p-5 rounded-[28px] bg-slate-950/80 backdrop-blur-xl border border-white/20 shadow-2xl space-y-4">
              {/* Row 1: Player Number + Name + Verified Badge on left, Contract Pill on right */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] shrink-0">
                    #{activePlayer.number}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 truncate">
                      <span className="truncate">{activePlayer.name}</span>
                      {activePlayer.verifiedData && (
                        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                      )}
                    </h1>
                  </div>
                </div>

                {/* Contract Badge with High-Contrast Pill */}
                <div className="shrink-0 text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold bg-cyan-500/15 text-cyan-200 border border-cyan-400/35 whitespace-nowrap shadow-xs">
                    s.d. {activePlayer.contractUntil}
                  </span>
                </div>
              </div>

              {/* Row 2: Full Name, Position Pill, Asal Negara (Nationality), and Age */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-100 font-semibold">
                <span className="text-slate-200 font-bold">{activePlayer.fullName}</span>
                <span className="text-white/40">•</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10.5px] font-black uppercase tracking-wider bg-blue-600 text-white font-mono shadow-xs">
                  {activePlayer.position}
                </span>
                <span className="text-white/40">•</span>
                <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span>Asal:</span>
                  <span className="text-white font-black">{activePlayer.nationality}</span>
                </span>
                <span className="text-white/40">•</span>
                <span className="text-slate-200 font-medium">Usia {activePlayer.age} Tahun</span>
              </div>

              {/* Row 3: Nationality & Market Value */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-200 flex-wrap pt-1 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Kewarganegaraan:</span>
                  <span className="text-emerald-300 font-extrabold">{activePlayer.nationality}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-slate-400">Nilai Pasar:</span>
                  <strong className="text-emerald-300 font-extrabold text-sm">{activePlayer.marketValue}</strong>
                </div>
              </div>

              {/* Row 4: Quick Performance Indicators Grid (High Contrast & Legible) */}
              <div className="grid grid-cols-4 gap-2.5 pt-2 text-center font-mono">
                {activePlayer.position === 'GK' ? (
                  <>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Save</span>
                      <span className="text-lg sm:text-xl font-black text-amber-300">{activePlayer.stats.interceptions}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Umpan</span>
                      <span className="text-lg sm:text-xl font-black text-cyan-300">{activePlayer.stats.passAccuracy}%</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Main</span>
                      <span className="text-lg sm:text-xl font-black text-white">{activePlayer.stats.appearances}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Rating</span>
                      <span className="text-lg sm:text-xl font-black text-amber-300">{activePlayer.stats.rating}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Gol</span>
                      <span className="text-lg sm:text-xl font-black text-cyan-300">{activePlayer.stats.goals}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Assist</span>
                      <span className="text-lg sm:text-xl font-black text-blue-300">{activePlayer.stats.assists}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Main</span>
                      <span className="text-lg sm:text-xl font-black text-white">{activePlayer.stats.appearances}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 shadow-xs">
                      <span className="text-[10px] text-slate-200 block font-sans font-extrabold uppercase tracking-wider">Rating</span>
                      <span className="text-lg sm:text-xl font-black text-amber-300">{activePlayer.stats.rating}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Row 5: Tactical Brief Box with Vibrant Contrast */}
              <div className="text-xs text-slate-100 leading-relaxed bg-gradient-to-r from-blue-950/70 via-slate-900/70 to-blue-950/70 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/35 shadow-sm space-y-1">
                <span className="text-cyan-300 font-black block text-[11px] uppercase font-mono tracking-wider">
                  ⚡ Peran Taktikal Bojan Hodak:
                </span>
                <p className="font-medium text-slate-100 text-[11.5px] leading-relaxed">
                  {activePlayer.fitness.notes || 'Pemain kunci dalam skema multi-kompetisi PERSIB Bandung 2026/2027.'}
                </p>
              </div>

              {/* Row 6: Disciplinary & Match Availability Systemic Status */}
              {activePlayer.disciplinary && (
                <div className={`p-3.5 rounded-2xl border backdrop-blur-md space-y-1.5 ${
                  activePlayer.disciplinary.status === 'red_card_suspended'
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : activePlayer.disciplinary.status === 'yellow_card_accumulation'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>{activePlayer.disciplinary.badgeText}</span>
                    </span>
                    {activePlayer.disciplinary.fineAmount && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-200">
                        {activePlayer.disciplinary.fineAmount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    {activePlayer.disciplinary.effectNotice}
                  </p>
                </div>
              )}
            </div>

            {/* Horizontal Roster Carousel Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Pilih Pemain Skuad Lainnya
                </span>
                <span className="text-[11px] text-cyan-300 font-extrabold bg-cyan-500/15 border border-cyan-400/30 px-2 py-0.5 rounded-full font-mono">
                  {OFFICIAL_SQUAD_2026_2027.length} Pemain
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {OFFICIAL_SQUAD_2026_2027.map((player) => {
                  const isSelected = player.id === activePlayer.id;
                  return (
                    <button
                      type="button"
                      key={player.id}
                      onMouseEnter={() => {
                        const targetSrc = player.videoUrl || '/Stadium_scene_logo_animation_6f37cafb.mp4';
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.as = 'video';
                        link.href = targetSrc;
                        document.head.appendChild(link);
                      }}
                      onTouchStart={() => {
                        const targetSrc = player.videoUrl || '/Stadium_scene_logo_animation_6f37cafb.mp4';
                        const link = document.createElement('link');
                        link.rel = 'prefetch';
                        link.as = 'video';
                        link.href = targetSrc;
                        document.head.appendChild(link);
                      }}
                      onClick={() => {
                        setIsExpanded(false);
                        router.replace(`/player/${player.id}`);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all shrink-0 active:scale-95 shadow-md ${
                        isSelected
                          ? 'bg-blue-600 border-cyan-300 text-white shadow-blue-600/50 ring-2 ring-cyan-400'
                          : 'bg-slate-950/80 backdrop-blur-md border-white/20 text-slate-200 hover:border-cyan-400/50 hover:bg-slate-900'
                      }`}
                    >
                      <SquadThumbnailAvatar player={player} />
                      <div className="text-left font-mono">
                        <div className="text-xs font-black leading-tight text-white">
                          #{player.number} {player.name}
                        </div>
                        <div className="text-[9.5px] text-cyan-200 mt-0.5 font-sans font-bold">
                          {player.position}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
