/**
 * GROQ CHAT AI ENGINE (Interactive Conversational Agent)
 * Role: Handles Bobotoh conversational Q&A, tactical discussions, historical club facts, and squad status.
 * Separated cleanly from the background Autonomous Data Collector Agent.
 */

export function cleanAiResponseText(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$|[.,!?:;])/g, '$1$2')
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,!?:;])/g, '$1$2')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/(^|\s)_(?=\S)|(?<=\S)_(?=\s|$)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function requestGroqChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<{ content: string; modelUsed: string } | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.length < 20 || apiKey.includes('placeholder')) {
    return null;
  }

  const primaryModel = options.model || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const candidateModels = Array.from(
    new Set([primaryModel, 'openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'])
  );

  for (const model of candidateModels) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1024,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const rawContent = json?.choices?.[0]?.message?.content;
        if (typeof rawContent === 'string' && rawContent.trim()) {
          return {
            content: cleanAiResponseText(rawContent),
            modelUsed: model,
          };
        }
      }
    } catch (err) {
      console.warn(`Groq chat model ${model} request failed, attempting fallback:`, err);
    }
  }

  return null;
}
