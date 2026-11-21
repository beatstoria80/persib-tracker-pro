'use client';

import React from 'react';
import { PersibAiChatWindow } from '@/components/HubAiChat/PersibAiChatWindow';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export default function ChatDedicatedPage() {
  return (
    <div className="min-h-screen w-full bg-[#050811] text-white flex justify-center items-start">
      {/* 430px Mobile Device Canvas */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col justify-between p-2 sm:p-4 pb-24">
        {/* Full Viewport Window Style AI Chat Component */}
        <main className="flex-1 flex flex-col justify-center">
          <PersibAiChatWindow isStandalonePage={true} />
        </main>

        {/* Permanently Fixed Floating Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
