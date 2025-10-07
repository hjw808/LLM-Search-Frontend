import { NextRequest, NextResponse } from 'next/server';
import { updateRequestResults } from '@/lib/deep-dive-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { id, competitorsMentioned, yourMentions, extractedQueries, recommendations } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing request ID' },
        { status: 400 }
      );
    }

    const updatedRequest = await updateRequestResults(id, {
      competitorsMentioned: competitorsMentioned || '',
      yourMentions: yourMentions || '',
      extractedQueries: extractedQueries || '',
      recommendations: recommendations || '',
    });

    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating deep dive request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
