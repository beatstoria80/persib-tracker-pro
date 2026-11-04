import { NextRequest, NextResponse } from 'next/server';
import { queryGroqAgent, GROQ_AGENT_GRAPH_MAP, GroqAgentTask } from '@/lib/groq';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body?.prompt || '';
    const task: GroqAgentTask = body?.task || 'custom_query';

    if (!prompt.trim() && task === 'custom_query') {
      return NextResponse.json(
        { error: 'Prompt tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const result = await queryGroqAgent(prompt, task);

    return NextResponse.json({
      ...result,
      graphMap: GROQ_AGENT_GRAPH_MAP,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        graphMap: GROQ_AGENT_GRAPH_MAP,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    engine: 'Groq LPU Inference Engine',
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    graphMap: GROQ_AGENT_GRAPH_MAP,
  });
}
