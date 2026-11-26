/**
 * Unified Groq AI Architecture Hub
 * Cleanly separates:
 * 1. Groq Chat Engine (Interactive Q&A for Bobotoh in ai-chat)
 * 2. Groq Live Collector Engine (Autonomous Live Grounding & Telemetry in groq-agent)
 */

export * from './groq-chat';
export * from './groq-collector';

export const BACKEND_DATA_AGENT_PIPELINE = [
  {
    agentId: 'pipeline-live-collector',
    name: 'Autonomous Live Match Collector Agent',
    targetFeature: 'Google News RSS Grounding & Live Score Extraction',
    source: 'Google News RSS Live & the-afc.com',
    status: 'active',
  },
  {
    agentId: 'pipeline-standings-feeder',
    name: 'Super League & ACL Two Standings Telemetry Feeder',
    targetFeature: 'Klasemen 18 Klub Liga 1 & Grup E Asia',
    source: 'PT LIB Super League & AFC Official',
    status: 'active',
  },
  {
    agentId: 'pipeline-chat-agent',
    name: 'Bobotoh Interactive AI Chat Agent',
    targetFeature: 'Tanya Jawab Taktik, Skuad, FFP & Regulasi Kompetisi',
    source: 'Groq LPU Conversational Engine',
    status: 'active',
  },
];
