'use client';

import React from 'react';
import { useClubTracker, ActiveHub } from '@/context/ClubTrackerContext';
import { Trophy, Users, Building2, Flame } from 'lucide-react';

export function MobileBottomNav() {
  const { mode, activeHub, setActiveHub } = useClubTracker();
  const isPro = mode === 'pro';

  const navItems: { id: ActiveHub; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'match-center',
      label: 'Match Center',
      icon: <Trophy className="w-5 h-5" />,
      badge: '#1',
    },
    {
      id: 'roster',
      label: 'Skuad & Medis',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'transparency',
      label: 'Klub & FFP',
      icon: <Building2 className="w-5 h-5" />,
      badge: 'FFP',
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 max-w-[430px] mx-auto z-40 transition-all duration-300 border-t backdrop-blur-xl ${
        isPro
          ? 'bg-[#060B13]/95 border-blue-900/60 shadow-[0_-8px_30px_rgba(0,102,255,0.15)] text-slate-200'
          : 'bg-white/95 border-slate-300 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] text-slate-800'
      }`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <div className="grid grid-cols-3 h-16 items-center px-2">
        {navItems.map((item) => {
          const isActive = activeHub === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveHub(item.id)}
              className="relative flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  className={`absolute -top-1 w-8 h-1 rounded-full ${
                    isPro ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-blue-700'
                  }`}
                />
              )}

              <div
                className={`relative p-1.5 rounded-xl transition-all ${
                  isActive
                    ? isPro
                      ? 'bg-blue-600/25 text-cyan-300 ring-1 ring-cyan-400/40'
                      : 'bg-blue-50 text-blue-800 ring-1 ring-blue-300'
                    : isPro
                    ? 'text-slate-400 group-hover:text-slate-200'
                    : 'text-slate-500 group-hover:text-slate-900'
                }`}
              >
                {item.icon}

                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[8px] font-mono font-black px-1 py-0.2 rounded-full uppercase tracking-tighter ${
                      isActive
                        ? 'bg-amber-400 text-slate-950'
                        : isPro
                        ? 'bg-blue-950 text-cyan-300 border border-blue-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                  isActive
                    ? isPro
                      ? 'text-cyan-300 font-extrabold'
                      : 'text-blue-800 font-black'
                    : isPro
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
