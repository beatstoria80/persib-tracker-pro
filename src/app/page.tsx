'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { VideoLoadingSplash, SPLASH_SESSION_KEY } from '@/components/VideoLoadingSplash';
import { PwaInstallModal } from '@/components/PwaInstallModal';
import { LiveTelemetryWidget } from '@/components/LiveTelemetryWidget';
import { SponsorshipFooter } from '@/components/SponsorshipFooter';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { isFixtureTodayWib } from '@/lib/groq';

export default function HomePage() {
  const { mode, activeHub, activeTournament, syncFeedback, fixtures } = useClubTracker();
  const isPro = mode === 'pro';

  // REFACTOR: State pemicu transisi rise element UI/UX bertingkat (staggered cascade) setelah video splash selesai
  // Inisialisasi dari sessionStorage agar refresh di mobile tidak mengulang loop video
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  // Dynamic tournament fixture selection: LIVE -> scheduled TODAY -> latest finished -> next scheduled
  const currentTournFixture =
    tournamentFixtures.find((f) => f.status === 'LIVE') ||
    tournamentFixtures.find((f) => isFixtureTodayWib(f.date)) ||
    [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED') ||
    tournamentFixtures.find((f) => f.status === 'SCHEDULED') ||
    tournamentFixtures[0] ||
    fixtures[0];

  return (
    <>
      {/* PWA Video Splash & Loading Screen on Smartphone Launch */}
      <VideoLoadingSplash onFinish={() => setHasEnteredApp(true)} />

      {/* REFACTOR: App container rendered directly without display:none to guarantee instant responsiveness on mobile refresh */}
      <div
        className={`min-h-screen w-full flex justify-center items-start transition-opacity duration-300 ${
          isPro ? 'bg-[#080B11]' : 'bg-[#EDF2F7]'
        } ${hasEnteredApp ? 'opacity-100' : 'opacity-100'}`}
      >
      {/* Desktop Helper Notice */}
      <div className="hidden xl:flex fixed left-10 top-12 flex-col gap-2 max-w-xs text-xs pointer-events-none">
        <div
          className={`p-4 rounded-3xl border ${
            isPro ? 'bg-[#121620] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Smartphone className="w-4 h-4 text-blue-600" />
            <span>Mobile-First Layout</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Didesain presisi dalam rasio smartphone modern (430px) dengan visual style minimalis, kartu dual-tone, dan negative space lapang.
          </p>
        </div>
      </div>

      {/* Mobile Device Canvas */}
      <div
        className={`w-full max-w-[430px] min-h-screen flex flex-col relative transition-colors duration-200 sm:my-3 sm:rounded-[40px] sm:border overflow-x-clip ${
          isPro
            ? 'bg-[#0E1118] text-white sm:border-slate-800 shadow-2xl'
            : 'bg-[#F8FAFC] text-slate-950 sm:border-slate-200 shadow-xl'
        }`}
      >
        {/* Stationary Sticky Mobile Top Header - Permanently stays at top on scroll */}
        <div className={`sticky top-0 z-50 w-full ${hasEnteredApp ? 'animate-ui-header-drop' : 'opacity-0 -translate-y-4'}`}>
          <Header />
        </div>

        {/* Real-Time Live Sync Notification Toast */}
        {syncFeedback && (
          <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md border border-emerald-400/40 transition-all animate-bounce">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 1-Tap PWA Install Card for Mobile Users */}
        <div className={hasEnteredApp ? 'animate-ui-rise-1' : 'opacity-0'}>
          <InstallPwaPrompt />
        </div>

        {/* REFACTOR: Unified Live Telemetry & AI Intelligence Widget (Menggantikan 2 bar terpotong sebelumnya) */}
        <div className={hasEnteredApp ? 'animate-ui-rise-1' : 'opacity-0 translate-y-6'}>
          <LiveTelemetryWidget currentFixture={currentTournFixture} />
        </div>

        {/* Scrollable Main Mobile Hub Content - Flexible bottom alignment without wasteful dead space */}
        <main
          className={`flex-1 flex flex-col justify-between px-4 sm:px-5 py-3 ${hasEnteredApp ? 'animate-ui-rise-3' : 'opacity-0 translate-y-8'}`}
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)' }}
        >
          <div className="flex-1">
            {(activeHub === 'match-center' || activeHub === 'ai-chat') && <MatchCenter />}
            {activeHub === 'roster' && <RosterDeepDive />}
            {activeHub === 'transparency' && <CorporateTransparency />}
          </div>

          {/* Official Sponsorship & Partner Footer Section pushed down cleanly above bottom nav */}
          <div className="mt-auto pt-3 pb-0">
            <SponsorshipFooter />
          </div>
        </main>
      </div>

      {/* Floating Pill Mobile Bottom Navigation - Permanently fixed at viewport bottom */}
      <MobileBottomNav />
    </div>

    {/* Dedicated Multi-Platform PWA Installation Modal */}
    <PwaInstallModal />
    </>
  );
}
