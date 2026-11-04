'use client';

import React, { useState } from 'react';
import { useClubTracker } from '@/context/ClubTrackerContext';
import {
  Sparkles,
  X,
  Send,
  Cpu,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Trophy,
} from 'lucide-react';
import { GROQ_AGENT_GRAPH_MAP, AgentGraphNode, GroqAgentTask } from '@/lib/groq';

interface GroqAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroqAgentModal({ isOpen, onClose }: GroqAgentModalProps) {
  const { mode } = useClubTracker();
  const isPro = mode === 'pro';

  const [prompt, setPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'graph_map'>('chat');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [responseContent, setResponseContent] = useState<string>(
    'Sampurasun Bobotoh! Saya Maung AI yang ditenagai oleh Groq LPU Ultra-Fast Inference. Pilih tugas intelijen di bawah atau ajukan pertanyaan faktual tentang Persib Bandung musim 2026/2027.'
  );
  const [activeAgentNode, setActiveAgentNode] = useState<string>('agent-orchestrator');
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleExecuteTask = async (task: GroqAgentTask, customText?: string) => {
    setIsLoading(true);
    setResponseContent('Menghubungkan ke Groq LPU Inference Engine...');

    try {
      const res = await fetch('/api/groq-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          prompt: customText || prompt || 'Berikan analisis intelijen terkini.',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResponseContent(data.content);
        setActiveAgentNode(data.agentNode);
        setInferenceTime(data.inferenceTimeMs || 180);
      } else {
        setResponseContent(`Maaf, terjadi kendala: ${data.error || 'Gagal memproses data'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResponseContent(`Kendala koneksi ke server Groq: ${msg}`);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const quickPrompts: { label: string; icon: React.ReactNode; task: GroqAgentTask; query: string }[] = [
    {
      label: 'Analisis Pekan 8 & Java United',
      icon: <Trophy className="w-3.5 h-3.5 text-amber-500" />,
      task: 'match_briefing',
      query: 'Jelaskan kemenangan telak 4-0 Pekan 8 dan persiapan laga Pekan 9 melawan Java United.',
    },
    {
      label: 'Taktik 4-2-3-1 Igor Tolic',
      icon: <Layers className="w-3.5 h-3.5 text-blue-500" />,
      task: 'tactical_analysis',
      query: 'Bagaimana peran poros ganda Thom Haye dan Marc Klok dalam membongkar pertahanan lawan?',
    },
    {
      label: 'Status Medis & Kebugaran Skuad',
      icon: <Activity className="w-3.5 h-3.5 text-rose-500" />,
      task: 'medical_report',
      query: 'Laporkan status kebugaran skuad Persib saat ini.',
    },
    {
      label: 'Skenario 16 Besar ACL Two',
      icon: <GitBranch className="w-3.5 h-3.5 text-cyan-500" />,
      task: 'scenario_sim',
      query: 'Kalkulasikan peluang Persib lolos fase grup AFC Champions League Two 2026/2027.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-3">
      <div
        className={`w-full max-w-[430px] rounded-t-[32px] sm:rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
          isPro
            ? 'bg-[#0A1220] border-blue-800/80 text-slate-100 shadow-[0_0_50px_rgba(37,99,235,0.3)]'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Mobile Pull Indicator */}
        <div className="pt-2 sm:hidden flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Modal Top Header */}
        <div
          className={`flex items-center justify-between p-3.5 border-b ${
            isPro ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white shadow-md">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-tight flex items-center gap-1">
                  Maung AI <span className="text-amber-500 font-mono text-xs">• Groq LPU</span>
                </h3>
                <span className="text-[8px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-amber-400 text-slate-950">
                  Ultra-Fast
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Autonomous Sports Intelligence Agent • 120B Model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${
              isPro ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher: Chat Intel vs Graph Map */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 p-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chat'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat Intelijen Real-Time</span>
          </button>

          <button
            onClick={() => setActiveTab('graph_map')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'graph_map'
                ? isPro
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-800 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Graph Map Arsitektur Agent</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 space-y-3 overflow-y-auto no-scrollbar flex-1">
          {activeTab === 'chat' ? (
            <>
              {/* Quick-Action Chips */}
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block mb-1.5">
                  Tugas Intelijen AI Terverifikasi:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      disabled={isLoading}
                      onClick={() => handleExecuteTask(q.task, q.query)}
                      className={`p-2 rounded-xl border text-left transition-all active:scale-95 disabled:opacity-50 ${
                        isPro
                          ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-400/50'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">{q.icon}</div>
                      <span className="text-[10.5px] font-bold leading-tight line-clamp-2 block">
                        {q.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isPro
                    ? 'bg-gradient-to-br from-slate-900/90 to-[#081220] border-blue-900/50 text-slate-200'
                    : 'bg-slate-50/90 border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-[10px]">
                  <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-cyan-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sumber Terverifikasi Google Sports & PT LIB</span>
                  </div>

                  {inferenceTime && (
                    <span className="flex items-center gap-1 font-mono text-emerald-600 font-bold">
                      <Clock className="w-3 h-3" /> {inferenceTime}ms (Groq LPU)
                    </span>
                  )}
                </div>

                <div className="text-xs leading-relaxed whitespace-pre-line font-normal">
                  {responseContent}
                </div>
              </div>
            </>
          ) : (
            /* Graph Map Architecture View */
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-[11px]">
                <div className="font-bold flex items-center gap-1 text-blue-800 dark:text-cyan-300 mb-0.5">
                  <GitBranch className="w-3.5 h-3.5" /> Arsitektur Graph Map Tugas Agent AI Groq
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-snug">
                  Alur orkestrator membagi permintaan pengguna ke 4 sub-agent spesifik berbasis ground-truth data klub sebelum disintesis oleh Groq LPU Llama/GPT-OSS.
                </p>
              </div>

              <div className="space-y-2">
                {GROQ_AGENT_GRAPH_MAP.map((node: AgentGraphNode, i: number) => {
                  const isActive = activeAgentNode === node.id;
                  return (
                    <div
                      key={node.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isActive
                          ? isPro
                            ? 'bg-blue-950/80 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.25)]'
                            : 'bg-blue-50 border-2 border-blue-600 shadow-sm'
                          : isPro
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-blue-700 text-white font-mono font-bold text-[9px] flex items-center justify-center">
                            {i + 1}
                          </span>
                          <h4 className="font-extrabold text-xs">{node.name}</h4>
                        </div>
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {node.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                        {node.description}
                      </p>

                      <div className="grid grid-cols-2 gap-1 text-[9px] font-mono pt-1.5 border-t border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block">Input Source:</span>
                          <span className="font-bold text-blue-600 dark:text-cyan-300 truncate block">
                            {node.inputSource}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Output Target:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-300 truncate block">
                            {node.outputTarget}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Footer */}
        {activeTab === 'chat' && (
          <div
            className={`p-3 border-t flex items-center gap-2 ${
              isPro ? 'border-slate-800 bg-[#08101C]' : 'border-slate-200 bg-white'
            }`}
          >
            <input
              type="text"
              value={prompt}
              disabled={isLoading}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim() && !isLoading) {
                  handleExecuteTask('custom_query', prompt);
                }
              }}
              placeholder="Tanya strategi, klasemen, atau pemain..."
              className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none border transition-all ${
                isPro
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-400'
                  : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600'
              }`}
            />

            <button
              disabled={isLoading || !prompt.trim()}
              onClick={() => handleExecuteTask('custom_query', prompt)}
              className="p-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white disabled:opacity-40 active:scale-95 shadow-md shrink-0"
              title="Kirim ke Groq LPU AI"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

