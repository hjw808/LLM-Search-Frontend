import { NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/deep-dive-storage';

export async function GET() {
  try {
    const requests = await getAllRequests();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Error fetching all deep dive requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
