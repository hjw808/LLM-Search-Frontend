import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  return NextResponse.json({
    configured: !!backendUrl,
    backendUrl: backendUrl || 'NOT SET',
    environment: process.env.NODE_ENV,
    message: backendUrl
      ? 'Backend URL is configured'
      : 'Backend URL is NOT configured. Set NEXT_PUBLIC_BACKEND_URL in Vercel environment variables.',
  });
}
