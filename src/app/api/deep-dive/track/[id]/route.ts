import { NextRequest, NextResponse } from 'next/server';
import { getRequestById } from '@/lib/deep-dive-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deepDiveRequest = await getRequestById(id);

    if (!deepDiveRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      request: deepDiveRequest,
    });
  } catch (error) {
    console.error('Error fetching deep dive request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
