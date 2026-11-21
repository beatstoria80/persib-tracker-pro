'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useClubTracker, ActiveHub } from '@/context/ClubTrackerContext';
import { Trophy, Users, Building2 } from 'lucide-react';
import { SoccerChatIcon } from '@/components/icons/SoccerChatIcon';

export function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, activeHub, setActiveHub } = useClubTracker();
  const isPro = mode === 'pro';

  // REFACTOR: 4 Hub Navigation Items with Authentic Bola + Chat Icon (No AI Slop)
  const navItems: { id: ActiveHub; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'match-center',
      label: 'Matches',
      icon: <Trophy className="w-4.5 h-4.5" />,
      badge: '#6',
    },
    {
      id: 'roster',
      label: 'Roster',
      icon: <Users className="w-4.5 h-4.5" />,
    },
    {
      id: 'transparency',
      label: 'Club FFP',
      icon: <Building2 className="w-4.5 h-4.5" />,
      badge: '94%',
    },
    {
      id: 'ai-chat',
      label: 'Ai Chat',
      icon: <SoccerChatIcon className="w-4.5 h-4.5 text-cyan-400" />,
      badge: 'LIVE',
    },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 pointer-events-none flex justify-center"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="w-full max-w-[430px] px-3 sm:px-4">
        <nav
          className={`pointer-events-auto rounded-full p-1.5 flex items-center justify-around shadow-2xl backdrop-blur-xl border transition-all ${
            isPro
              ? 'bg-[#0E121B]/95 border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.65)]'
              : 'bg-white/95 border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
          }`}
        >
        {navItems.map((item) => {
          const isActive = pathname === '/chat' ? item.id === 'ai-chat' : activeHub === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => {
                setActiveHub(item.id);
                if (pathname === '/chat' && item.id !== 'ai-chat') {
                  router.push('/');
                }
              }}
              className={`relative flex items-center gap-1.5 py-2 px-2.5 sm:px-3 rounded-full transition-all duration-200 active:scale-95 ${
                isActive
                  ? isPro
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                    : 'bg-blue-700 text-white shadow-md shadow-blue-700/25 font-black'
                  : isPro
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {isActive && (
                <span className="text-[11px] tracking-tight uppercase font-extrabold pr-0.5">
                  {item.label}
                </span>
              )}
              {item.badge && !isActive && (
                <span
                  className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    item.id === 'ai-chat'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                      : isPro
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      </div>
    </div>
  );
}
