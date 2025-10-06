/**
 * External config API route that calls the FastAPI backend
 * Used in production when deployed on Vercel (no access to local files)
 */

import { NextRequest, NextResponse } from 'next/server';

interface BusinessConfig {
  name: string;
  url: string;
  location: string;
  aliases: string[];
  queries: {
    consumer: number;
    business: number;
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/config`);

    if (!response.ok) {
      throw new Error('Failed to fetch config from backend');
    }

    const config = await response.json();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config from backend:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const businessConfig: BusinessConfig = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(businessConfig),
    });

    if (!response.ok) {
      throw new Error('Failed to save config to backend');
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving config to backend:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
