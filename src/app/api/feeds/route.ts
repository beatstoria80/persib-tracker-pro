import { NextResponse } from 'next/server';
import { fetchMultiCompetitionLiveFeeds } from '@/lib/groq-collector';

export const dynamic = 'force-dynamic';
export const revalidate = 180; // 3 minutes cache

/**
 * Dedicated Real-Time Persib Feeds Endpoint
 * Fetches and returns live verified Google News RSS articles for Persib Bandung across all competitions.
 */
export async function GET() {
  try {
    const now = new Date();
    const nowWib =
      new Date(now.getTime() + 7 * 3600 * 1000).toLocaleTimeString('id-ID', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB';

    const feeds = await fetchMultiCompetitionLiveFeeds(nowWib);
    return NextResponse.json({
      success: true,
      count: feeds.length,
      feeds,
      updatedAt: nowWib,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
