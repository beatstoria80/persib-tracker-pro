/**
 * GROQ CHAT AI ENGINE (Interactive Conversational Agent with Dynamic Grounding)
 * Role: Handles Bobotoh conversational Q&A, tactical discussions, historical club facts, and squad status.
 * Data Collection: Dynamically fetches real-time Google News RSS search headlines to eliminate
 *                  stale hardcoded .ts database dependencies and stop hallucinations.
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

/**
 * Dynamic Live Grounding Collector for AI Groq Chat
 * Queries Google News RSS in real-time based on the user's inquiry.
 * Eliminates reliance on static, outdated .ts files.
 */
export async function collectLiveGroundingForChat(userMessage: string): Promise<string[]> {
  const cleanInput = userMessage
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract core keywords from user inquiry
  const stopWords = new Set([
    'apa', 'siapa', 'bagaimana', 'kapan', 'di', 'ke', 'dari', 'yang', 'ini', 'itu',
    'apakah', 'berapa', 'tolong', 'jelaskan', 'dong', 'min', 'bot', 'tentang', 'soal',
    'ada', 'pada', 'untuk', 'dengan', 'dan', 'atau', 'laga', 'info', 'update'
  ]);
  const meaningfulWords = cleanInput
    .split(' ')
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 5)
    .join(' ');

  // Formulate dynamic search variants
  const queriesToRun: string[] = [];
  if (meaningfulWords) {
    queriesToRun.push(`PERSIB Bandung ${meaningfulWords}`);
  }

  if (cleanInput.includes('acl') || cleanInput.includes('seoul') || cleanInput.includes('asia') || cleanInput.includes('grup')) {
    queriesToRun.push('PERSIB Bandung ACL Two skor hasil klasemen');
  } else if (cleanInput.includes('jadwal') || cleanInput.includes('kapan') || cleanInput.includes('lawan') || cleanInput.includes('berikutnya')) {
    queriesToRun.push('PERSIB Bandung jadwal pertandingan berikutnya');
  } else if (cleanInput.includes('pemain') || cleanInput.includes('skuad') || cleanInput.includes('transfer') || cleanInput.includes('cedera')) {
    queriesToRun.push('PERSIB Bandung berita pemain skuad cedera transfer');
  } else {
    queriesToRun.push('PERSIB Bandung berita skor hasil terkini');
  }

  const collectedHeadlines: string[] = [];
  const seenHeadlines = new Set<string>();

  await Promise.all(
    queriesToRun.slice(0, 2).map(async (query) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=id&gl=ID&ceid=ID:id`;

        const res = await fetch(rssUrl, {
          cache: 'no-store',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; PersibTrackerChatGrounding/2.0)',
          },
        });
        clearTimeout(timeout);

        if (res.ok) {
          const xml = await res.text();
          const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>[\s\S]*?<\/item>/g;
          let match: RegExpExecArray | null;
          while ((match = itemRegex.exec(xml)) !== null && collectedHeadlines.length < 8) {
            const rawTitle = match[1]
              .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim();
            const pubDate = match[2].trim();
            if (rawTitle && !seenHeadlines.has(rawTitle.toLowerCase())) {
              seenHeadlines.add(rawTitle.toLowerCase());
              collectedHeadlines.push(`${rawTitle} (${pubDate})`);
            }
          }
        }
      } catch {
        // Silently skip on network timeout
      }
    })
  );

  return collectedHeadlines;
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
          temperature: options.temperature ?? 0.25,
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
