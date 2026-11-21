'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  Send,
  User,
  Copy,
  Check,
  RefreshCw,
  X,
  ArrowLeft,
  Trophy,
} from 'lucide-react';
import Image from 'next/image';
import { SoccerChatIcon } from '@/components/icons/SoccerChatIcon';
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

interface PersibAiChatWindowProps {
  onClose?: () => void;
  isStandalonePage?: boolean;
}

export function PersibAiChatWindow({ onClose, isStandalonePage = false }: PersibAiChatWindowProps) {
  const router = useRouter();
  const { setActiveHub } = useClubTracker();

  const [messages, setMessages] = useState<PersibAiChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text:
        '**Sampurasun, Bobotoh!** ⚽💬\n\nSelamat datang di **Persib & Global Football Tactical Intelligence** resmi musim **2026/2027**.\n\nTanyakan apa saja seputar:\n* 🎯 **Top Scorer & Raja Assist:** Daftar pencetak gol terbanyak David da Silva, Tyronne, Peralta, Sekulić, serta 9 assist Thom Haye\n* ⚔️ **Big Match Pekan 10:** Kontra Bali United (Minggu, 22 Nov 2026, 19:00 WIB di GBLA)\n* 📊 **Klasemen & Skor:** Super League (#6, 16 Poin) & Puncak Grup B Shopee Cup (#1, 6 Poin)\n* ⭐ **ACL Two Asia:** Rekor 100% Juara Grup E & Tiket 16 Besar Asia\n* 🌍 **Sepak Bola Dunia & FIFA:** Piala Dunia, Liga Champions, Timnas Indonesia, taktik modern & regulasi IFAB\n\nSilakan pilih topik rekomendasi di atas atau ketik pertanyaan langsung!',
      timestamp: 'Baru saja',
      category: 'general',
      actionableTips: [
        'Klik topik rekomendasi di bilah atas untuk jawaban analitis cepat.',
        'Data klasemen dan jadwal terverifikasi faktual musim aktif 2026/2027.',
        'Gunakan tombol copy di setiap jawaban untuk membagikan ke sesama Bobotoh.',
      ],
      metricsContext: {
        leagueRank: 6,
        points: 16,
        matchRecord: '9 Main: 5M 1S 3K (+6 SG)',
        nextOpponent: 'Bali United FC',
        nextMatchDate: 'Minggu, 22 Nov 2026 (19:00 WIB)',
        shopeeRank: 1,
        aclStatus: 'Juara Grup E (16 Besar)',
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

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isStandalonePage) {
      router.push('/');
    } else {
      setActiveHub('match-center');
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] sm:h-[720px] max-h-[820px] rounded-3xl overflow-hidden border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-[#0A0E17] text-white">
      {/* =========================================================================
          1. WINDOW TITLEBAR (Mac/Native Window Style)
          ========================================================================= */}
      <div className="px-4 py-3 bg-[#0E131F] border-b border-white/10 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          {/* Mac/Native Window Indicator Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClose}
              title="Tutup Jendela"
              className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity flex items-center justify-center group"
            >
              <X className="w-2 h-2 text-black opacity-0 group-hover:opacity-100" />
            </button>
            <span className="w-3 h-3 rounded-full bg-amber-500 opacity-80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 opacity-80" />
          </div>

          <div className="h-4 w-px bg-white/15 mx-1" />

          {/* Window Title & Live Status */}
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-cyan-400/50 shadow-sm shrink-0">
              <Image
                src="/new_persib_logo.jpeg"
                alt="Persib Crest"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider uppercase text-cyan-400">
                  PERSIB TACTICAL WINDOW
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <span className="text-[9.5px] font-mono text-slate-400 block leading-none">
                AI Groq • 2026/2027 Active Ground Truth
              </span>
            </div>
          </div>
        </div>

        {/* Window Right Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Obrolan"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            title="Kembali ke Dashboard"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95 flex items-center gap-1 text-[11px] font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. CONTEXT HUD BANNER (Data Real-Time Musim 2026/2027)
          ========================================================================= */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-blue-950/60 border-b border-white/5 flex items-center justify-between text-[10px] font-mono shrink-0 overflow-x-auto no-scrollbar gap-3">
        <div className="flex items-center gap-1.5 text-cyan-300 shrink-0 font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Super League: #6 (16 Pts)</span>
        </div>
        <div className="text-slate-400 shrink-0 font-medium">
          Laga: <span className="text-emerald-400 font-bold">vs Bali United (22 Nov 2026)</span>
        </div>
        <div className="text-blue-300 shrink-0 font-medium">
          Shopee Cup: <span className="font-bold text-cyan-300">#1 Grup B (6 Pts)</span>
        </div>
        <div className="text-purple-300 shrink-0 font-medium">
          ACL Two: <span className="font-bold text-white">Juara Grup E (16 Besar)</span>
        </div>
      </div>

      {/* =========================================================================
          3. CATEGORY QUICK PROMPT CHIPS
          ========================================================================= */}
      <div className="px-3.5 py-2.5 bg-[#0D121D] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PERSIB_QUICK_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSend(item.question)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold shrink-0 transition-all active:scale-95 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/60 text-cyan-300 hover:text-white shadow-xs"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. SCROLLABLE MESSAGE STREAM
          ========================================================================= */}
      <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 no-scrollbar bg-[#080C14]">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-cyan-400/50 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <SoccerChatIcon className="w-5 h-5 text-cyan-300" />
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg relative group ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-[#121826] border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Category Badge for AI Messages */}
                {!isUser && m.category && (
                  <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5 text-[9.5px] font-mono">
                    <span className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-blue-600/30 text-cyan-300 border border-cyan-400/30">
                      {m.category === 'match' && '🏆 Laga & Jadwal Super League'}
                      {m.category === 'standing' && '📊 Klasemen Super League'}
                      {m.category === 'shopee' && '🌏 Shopee Cup Grup B'}
                      {m.category === 'acl' && '⭐ ACL Two 16 Besar Asia'}
                      {m.category === 'tactical' && '📋 Taktik Bojan Hodak'}
                      {m.category === 'squad' && '👑 Profil Skuad Bintang'}
                      {m.category === 'general' && '🔵 Intelijen Maung Bandung'}
                    </span>
                    <span className="text-slate-400 font-bold">{m.timestamp}</span>
                  </div>
                )}

                {/* Main Content Body */}
                <div className="whitespace-pre-wrap font-sans selection:bg-cyan-500 selection:text-black">
                  {m.text}
                </div>

                {/* Metrics Context HUD Box */}
                {!isUser && m.metricsContext && (
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 font-mono text-[10px] space-y-1 text-slate-300">
                    <div className="flex items-center justify-between text-cyan-300 font-bold">
                      <span>Super League: Rank #{m.metricsContext.leagueRank} ({m.metricsContext.points} Poin)</span>
                      <span>Shopee Cup: #{m.metricsContext.shopeeRank}</span>
                    </div>
                    {m.metricsContext.nextOpponent && (
                      <div className="text-emerald-300">
                        Laga Berikutnya: <strong>{m.metricsContext.nextOpponent}</strong> • {m.metricsContext.nextMatchDate}
                      </div>
                    )}
                  </div>
                )}

                {/* Actionable Tips Box */}
                {!isUser && m.actionableTips && m.actionableTips.length > 0 && (
                  <div className="mt-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[10.5px]">
                    <span className="font-mono font-bold text-cyan-300 block mb-1">
                      📌 Catatan Taktikal & Panduan Bobotoh:
                    </span>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {m.actionableTips.map((tip, idx) => (
                        <li key={idx} className="leading-snug">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Footer Copy & Timestamp */}
                <div className="mt-2.5 flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/5">
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
                <div className="w-8 h-8 rounded-xl bg-slate-800 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-md border border-white/10">
                  <User className="w-5 h-5 text-slate-200" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-center justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-cyan-400/50 p-1 flex items-center justify-center shrink-0 shadow-md">
              <SoccerChatIcon className="w-5 h-5 text-cyan-300 animate-bounce" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-[#121826] border border-white/10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="text-[10px] text-slate-400 ml-1 font-mono">
                Groq AI menganalisis data 2026/2027...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* =========================================================================
          5. PINNED DOCKED INPUT BAR
          ========================================================================= */}
      <div className="p-3 bg-[#0E131F] border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#141A28] border border-white/15 focus-within:border-cyan-400/80 transition-colors shadow-inner"
        >
          <div className="pl-2">
            <SoccerChatIcon className="w-5 h-5 text-cyan-400" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan jadwal Bali United, klasemen, atau taktik..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-2.5 py-2 text-xs font-medium focus:outline-hidden text-white placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 cursor-pointer'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
