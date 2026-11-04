import { NextResponse } from 'next/server';
import { supplyLiveClubData, BACKEND_DATA_AGENT_PIPELINE } from '@/lib/groq';

/**
 * Backend AI Data Supplier Endpoint
 * Serves autonomous real-time verified club data to keep all frontend features up-to-date.
 * Note: Groq is an autonomous backend data supplier, NOT a chat bot.
 */
export async function GET() {
  try {
    const liveData = await supplyLiveClubData();
    return NextResponse.json({
      success: true,
      pipeline: BACKEND_DATA_AGENT_PIPELINE,
      data: liveData,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        pipeline: BACKEND_DATA_AGENT_PIPELINE,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
