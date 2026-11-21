'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { InstallPwaPrompt } from '@/components/InstallPwaPrompt';
import { MatchCenter } from '@/components/HubMatchCenter/MatchCenter';
import { RosterDeepDive } from '@/components/HubRoster/RosterDeepDive';
import { CorporateTransparency } from '@/components/HubCorporate/CorporateTransparency';
import { PersibAiChatWindow } from '@/components/HubAiChat/PersibAiChatWindow';
import { VideoLoadingSplash } from '@/components/VideoLoadingSplash';
import { PwaInstallModal } from '@/components/PwaInstallModal';
import { LiveTelemetryWidget } from '@/components/LiveTelemetryWidget';
import { SponsorshipFooter } from '@/components/SponsorshipFooter';
import { Smartphone, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { mode, activeHub, setActiveHub, activeTournament, syncFeedback, fixtures } = useClubTracker();
  const isPro = mode === 'pro';

  // REFACTOR: State pemicu transisi rise element UI/UX bertingkat (staggered cascade) setelah video splash selesai
  // Inisialisasi dari sessionStorage agar refresh di mobile tidak mengulang loop video
  const [hasEnteredApp, setHasEnteredApp] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('persib_opening_splash_seen_v1') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const tournamentFixtures = fixtures.filter((f) => f.tournamentKey === activeTournament);
  // REFACTOR: Tournament-aware resolution: LIVE -> tournament key match -> scheduled / latest finished
  const currentTournFixture =
    tournamentFixtures.find((f) => f.status === 'LIVE') ||
    (activeTournament === 'shopee_cup'
      ? tournamentFixtures.find((f) => f.id === 'shopee-26-md2-ft')
      : activeTournament === 'acl2'
      ? tournamentFixtures.find((f) => f.id === 'acl2-26-md4-live')
      : tournamentFixtures.find((f) => f.id === 'l1-p10') || tournamentFixtures.find((f) => f.id === 'l1-p9')) ||
    tournamentFixtures.find((f) => f.status === 'SCHEDULED') ||
    [...tournamentFixtures].reverse().find((f) => f.status === 'FINISHED') ||
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
        {/* Sleek Mobile Header with Drop-Down Entrance */}
        <div className={hasEnteredApp ? 'animate-ui-header-drop' : 'opacity-0 -translate-y-4'}>
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

        {/* Scrollable Main Mobile Hub Content - Stage 3 High Impact Rise with Sheen */}
        <main className={`flex-1 px-4 sm:px-5 py-3 pb-36 ${hasEnteredApp ? 'animate-ui-rise-3' : 'opacity-0 translate-y-8'}`}>
          <div>
            {activeHub === 'match-center' && <MatchCenter />}
            {activeHub === 'roster' && <RosterDeepDive />}
            {activeHub === 'transparency' && <CorporateTransparency />}
            {activeHub === 'ai-chat' && (
              <PersibAiChatWindow onClose={() => setActiveHub('match-center')} />
            )}
          </div>

          {/* REFACTOR: Official Sponsorship & Partner Footer Section (Suppressed in dedicated AI chat window) */}
          {activeHub !== 'ai-chat' && (
            <div className="mt-4">
              <SponsorshipFooter />
            </div>
          )}
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
