'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  Send,
  User,
  Copy,
  Check,
  RefreshCw,
  Trophy,
  Calendar,
  Shield,
  HelpCircle,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { SoccerChatIcon } from '@/components/icons/SoccerChatIcon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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

const QUICK_PROMPTS = [
  { label: 'Laga Terdekat Pekan 10', icon: Trophy, prompt: 'Kapan laga terdekat Persib di Liga 1 Pekan 10 dan lawannya siapa?' },
  { label: 'Jadwal Shopee Cup Grup B', icon: Calendar, prompt: 'Bagaimana jadwal lengkap Persib Bandung di Shopee Cup 2026/2027 Grup B?' },
  { label: 'Klasemen Super League', icon: Shield, prompt: 'Di peringkat berapa Persib saat ini di klasemen Super League dan berapa poinnya?' },
  { label: 'Status di ACL Two', icon: Zap, prompt: 'Bagaimana hasil dan posisi Persib Bandung di AFC Champions League Two (ACL Two)?' },
  { label: 'Profil Haye & Sandy Walsh', icon: HelpCircle, prompt: 'Bisa jelaskan profil dan peran Thom Haye serta Sandy Walsh di Persib?' },
];

export function PersibAiChat() {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        '**Sampurasun, Bobotoh!** ⚽💬\n\nSaya adalah **Persib Football Chat Assistant** resmi musim **2026/2027**.\n\nTanyakan apa saja tentang:\n* 🏆 **Jadwal & Hasil Laga:** Super League, ACL Two, & Shopee Cup\n* 📊 **Klasemen:** Peringkat terkini Super League & Grup B Asia\n* 👥 **Pemain & Taktik:** Thom Haye, Sandy Walsh, Ragnar, Peralta, dan racikan Bojan Hodak\n\nSilakan pilih topik cepat di bawah atau ketik pertanyaan Anda!',
      timestamp: 'Baru saja',
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

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: text,
        timestamp: nowTime,
      },
    ];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyContent =
        data.success && data.reply
          ? data.reply
          : 'Maaf, terjadi gangguan pada jaringan cerdas. Silakan coba beberapa saat lagi.';

      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('ai'),
          role: 'assistant',
          content: replyContent,
          timestamp: getLocalWibTimeString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId('ai-err'),
          role: 'assistant',
          content:
            '⚠️ Terjadi kendala saat menghubungi server AI. Namun sistem tetap berjalan optimal. Silakan tanyakan seputar jadwal laga, klasemen, atau pemain Persib.',
          timestamp: 'Baru saja',
        },
      ]);
    } finally {
      setIsLoading(false);
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
        role: 'assistant',
        content:
          'Obrolan telah disetel ulang. Ada yang ingin Anda tanyakan lagi seputar laga dan agenda Persib Bandung musim 2026/2027? 🔵',
        timestamp: 'Baru saja',
      },
    ]);
  }, []);

  return (
    <div className="space-y-4 max-w-full">
      {/* Header Intelligence Card */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
          isPro
            ? 'bg-[#121620] border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.5)]'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shrink-0">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src="/new_persib_logo.jpeg"
                  alt="Persib AI"
                  width={34}
                  height={34}
                  className="object-contain"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <SoccerChatIcon className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                  <span>PERSIB CHAT</span>
                </h2>
                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-600 dark:text-cyan-400 border border-blue-500/30">
                  2026/2027
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Konsultan Sepakbola & Tanya Jawab Event Pangeran Biru
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Obrolan"
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              isPro
                ? 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Topik Rekomendasi Bobotoh:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {QUICK_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  disabled={isLoading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-bold shrink-0 transition-all active:scale-95 border ${
                    isPro
                      ? 'bg-blue-950/40 hover:bg-blue-900/50 border-blue-800/60 text-cyan-300'
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className={`p-3.5 sm:p-4 rounded-3xl border min-h-[380px] max-h-[520px] overflow-y-auto space-y-3.5 shadow-xl transition-all ${
          isPro
            ? 'bg-[#0B0F17]/90 border-slate-800/90 shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
            : 'bg-white border-slate-200 shadow-md'
        }`}
      >
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-2.5 sm:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-blue-700/90 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <SoccerChatIcon className="w-4 h-4 text-cyan-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-br-none font-medium'
                    : isPro
                    ? 'bg-[#141B28] border border-slate-800 text-slate-200 rounded-bl-none'
                    : 'bg-slate-100/90 border border-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                {/* Formatted Markdown Content */}
                <div className="whitespace-pre-wrap font-sans selection:bg-cyan-500 selection:text-black">
                  {m.content}
                </div>

                <div
                  className={`mt-1.5 flex items-center justify-between gap-2 text-[9.5px] ${
                    isUser ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span className="font-mono">{m.timestamp}</span>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-70 hover:opacity-100 transition-opacity p-0.5 flex items-center gap-1"
                      title="Salin jawaban"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[9px] text-emerald-400">Tersalin</span>
                        </>
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 p-0.5 flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator with Animated Bouncing Dots */}
        {isLoading && (
          <div className="flex gap-2.5 items-center justify-start">
            <div className="w-7 h-7 rounded-xl bg-blue-700/80 p-1 flex items-center justify-center shrink-0 shadow-md">
              <SoccerChatIcon className="w-4 h-4 text-cyan-300 animate-bounce" />
            </div>
            <div
              className={`rounded-2xl px-4 py-3 rounded-bl-none flex items-center gap-1.5 ${
                isPro ? 'bg-[#141B28] border border-slate-800' : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="text-[10px] text-slate-400 ml-1.5 font-medium">
                Persib sedang menganalisis data...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className={`p-2 rounded-2xl border shadow-xl flex items-center gap-2 transition-all ${
          isPro
            ? 'bg-[#121620] border-slate-800 focus-within:border-cyan-500/60'
            : 'bg-white border-slate-200 focus-within:border-blue-500'
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanyakan jadwal, pemain, taktik, atau klasemen..."
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-xs font-medium focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center shrink-0 ${
            input.trim() && !isLoading
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
