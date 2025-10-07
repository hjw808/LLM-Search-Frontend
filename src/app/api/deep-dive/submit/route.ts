import { NextRequest, NextResponse } from 'next/server';
import { createRequest } from '@/lib/deep-dive-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { businessName, businessUrl, aiEngines, queryCount, queryTypes, notes } = body;

    // Validation
    if (!businessName || !businessUrl || !aiEngines || aiEngines.length === 0 || !queryCount || !queryTypes || queryTypes.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRequest = await createRequest({
      businessName,
      businessUrl,
      aiEngines,
      queryCount: parseInt(queryCount),
      queryTypes,
      notes: notes || '',
    });

    return NextResponse.json({
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error('Error creating deep dive request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
