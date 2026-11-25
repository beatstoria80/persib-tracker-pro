'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowLeft,
  RefreshCw,
  Send,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { SoccerChatIcon } from '@/components/icons/SoccerChatIcon';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import {
  PersibAiChatMessage,
  PERSIB_QUICK_PROMPTS,
  PersibIntelligenceEngine,
} from '@/data/persib-intelligence-engine';

let messageSeqId = 1;
function createMessageId(prefix: string): string {
  return `${prefix}-${messageSeqId++}`;
}

function getLocalWibTimeString(): string {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m} WIB`;
}

export default function ChatDedicatedPage() {
  const router = useRouter();

  const [messages, setMessages] = useState<PersibAiChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text:
        '**Sampurasun, Bobotoh!** ⚽💬\n\nSelamat datang di **Persib Chat** resmi musim **2026/2027**.\n\nTanyakan apa saja seputar:\n* 🏆 **Hasil Pekan 10:** PERSIB 2 - 1 Bali United (Comeback kilat Peralta 79\' & Menalo 81\' amankan 19 poin di papan atas!)\n* 📅 **Jadwal Pekan 11:** Persita Tangerang vs PERSIB (Minggu, 29 Nov 2026, 19:00 WIB di Indomilk Arena)\n* 📊 **Klasemen:** Posisi PERSIB di Super League (#4, 19 Poin) & Puncak Shopee Cup (#1, 6 Poin)\n* ⭐ **ACL Two Asia:** Rekor 100% Juara Grup E & Tiket 16 Besar Asia\n* 📋 **Taktik & Skuad:** Racikan Bojan Hodak, Thom Haye, Sandy Walsh, Luka Menalo, Balša Sekulić, Ragnar, dan Peralta.\n\nSilakan pilih topik cepat di atas atau ketik pertanyaan langsung!',
      timestamp: 'Baru saja',
      category: 'general',
      actionableTips: [
        'Klik tombol topik cepat di bilah atas untuk jawaban taktis instan.',
        'Data jadwal dan klasemen terverifikasi faktual musim aktif 2026/2027.',
        'Gunakan tombol salin untuk membagikan info ke sesama Bobotoh.',
      ],
      metricsContext: {
        leagueRank: 4,
        points: 19,
        nextOpponent: 'Persita Tangerang',
        nextMatchDate: '29 Nov 2026 (19:00 WIB)',
      },
    },
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsgId = createMessageId('user');
    const nowTime = getLocalWibTimeString();

    const userMsg: PersibAiChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: nowTime,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: PersibAiChatMessage = {
          id: createMessageId('ai'),
          sender: 'ai',
          text: data.reply || data.message || 'Data tidak tersedia.',
          timestamp: getLocalWibTimeString(),
          category: data.category || 'general',
          actionableTips: data.actionableTips || [],
          metricsContext: data.metricsContext || undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('API offline');
      }
    } catch {
      // Deterministic instant fallback
      const fallbackMsg = PersibIntelligenceEngine.generateResponse(text);
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = useCallback(() => {
    setMessages([
      {
        id: createMessageId('init'),
        sender: 'ai',
        text: 'Obrolan telah direset. Ada yang ingin Bobotoh ketahui seputar jadwal, klasemen, atau taktik Persib musim 2026/2027?',
        timestamp: getLocalWibTimeString(),
        category: 'general',
      },
    ]);
  }, []);

  return (
    <div className="min-h-dvh max-h-dvh h-dvh w-full bg-[#050811] text-white flex justify-center items-start overflow-hidden">
      {/* 430px Mobile Canvas Container */}
      <div className="w-full max-w-[430px] h-full flex flex-col justify-between bg-[#070A12] relative overflow-hidden shadow-2xl">
        {/* =========================================================================
            1. MINIMALIST TOP HEADER
            ========================================================================= */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-[#0B0F19]/95 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-400/50 shadow-xs shrink-0">
                <Image
                  src="/new_persib_logo.jpeg"
                  alt="Persib Crest"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xs font-black tracking-wide text-white leading-tight">
                  PERSIB CHAT
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9.5px] text-emerald-400 font-mono font-bold leading-none">
                    Online • 2026/2027
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Obrolan"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition-all"
            aria-label="Reset Obrolan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* =========================================================================
            2. MINIMALIST QUICK PROMPT CHIPS
            ========================================================================= */}
        <div className="px-3 py-2 border-b border-white/5 bg-[#090D16] shrink-0 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {PERSIB_QUICK_PROMPTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSend(item.question)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 transition-all active:scale-95 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-cyan-300 shadow-2xs"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* =========================================================================
            3. SCROLLABLE MESSAGES STREAM
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 space-y-3 bg-[#060810]">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-cyan-400/40 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <SoccerChatIcon className="w-4 h-4 text-cyan-300" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm relative group ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                      : 'bg-[#111724] border border-white/10 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Category Pill for Assistant */}
                  {!isUser && m.category && (
                    <div className="mb-1.5 flex items-center justify-between text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      <span>
                        {m.category === 'match' && '🏆 Laga Super League'}
                        {m.category === 'standing' && '📊 Klasemen'}
                        {m.category === 'shopee' && '🌏 Shopee Cup'}
                        {m.category === 'acl' && '⭐ ACL Two'}
                        {m.category === 'tactical' && '📋 Taktik Hodak'}
                        {m.category === 'squad' && '👑 Pilar Skuad'}
                        {m.category === 'general' && '🔵 Persib Intel'}
                      </span>
                      <span className="text-slate-400 font-normal">{m.timestamp}</span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-wrap font-sans selection:bg-cyan-500 selection:text-black">
                    {m.text}
                  </div>

                  {/* Compact Actionable Tips if any */}
                  {!isUser && m.actionableTips && m.actionableTips.length > 0 && (
                    <div className="mt-2.5 p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-slate-300 space-y-1">
                      <span className="font-mono font-bold text-cyan-300 block text-[9.5px]">
                        📌 Catatan Penting:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5">
                        {m.actionableTips.map((tip, idx) => (
                          <li key={idx} className="leading-tight">{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer Copy & Timestamp */}
                  <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
                    <span className="font-mono">{m.timestamp}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.text)}
                        className="opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 text-slate-300 hover:text-cyan-400"
                        title="Salin jawaban"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm border border-white/10">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2 items-center justify-start">
              <div className="w-7 h-7 rounded-xl bg-blue-600/30 border border-cyan-400/40 p-1 flex items-center justify-center shrink-0 shadow-sm">
                <SoccerChatIcon className="w-4 h-4 text-cyan-300 animate-bounce" />
              </div>
              <div className="rounded-2xl px-3.5 py-2.5 bg-[#111724] border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                <span className="text-[10px] text-slate-400 ml-1 font-mono">
                  Menganalisis data...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            4. MINIMALIST FLOATING INPUT BAR (Above Bottom Nav)
            ========================================================================= */}
        <div
          className="px-3 pt-2 bg-gradient-to-t from-[#050811] via-[#050811]/95 to-transparent shrink-0 z-20"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 70px)' }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-1.5 rounded-full bg-[#121826] border border-white/15 focus-within:border-cyan-400/70 transition-colors shadow-lg"
          >
            <div className="pl-2.5">
              <SoccerChatIcon className="w-4.5 h-4.5 text-cyan-400" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan jadwal, klasemen, atau taktik..."
              disabled={isLoading}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs font-medium focus:outline-hidden text-white placeholder:text-slate-400"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`w-8 h-8 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${
                input.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 cursor-pointer'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* =========================================================================
            5. PERMANENTLY FIXED MOBILE BOTTOM NAVIGATION
            ========================================================================= */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
