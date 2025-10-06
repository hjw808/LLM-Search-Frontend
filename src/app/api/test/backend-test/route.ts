import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({
      success: false,
      error: 'NEXT_PUBLIC_BACKEND_URL is not configured',
    });
  }

  const tests = {
    backendUrl: BACKEND_URL,
    results: {} as Record<string, unknown>,
  };

  // Test 1: Root endpoint
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    tests.results.root = {
      success: response.ok,
      status: response.status,
      data: await response.json(),
    };
  } catch (error) {
    tests.results.root = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 2: Health endpoint
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`);
    tests.results.health = {
      success: response.ok,
      status: response.status,
      data: await response.json(),
    };
  } catch (error) {
    tests.results.health = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 3: Config endpoint
  try {
    const response = await fetch(`${BACKEND_URL}/api/config`);
    tests.results.config = {
      success: response.ok,
      status: response.status,
      data: response.ok ? await response.json() : await response.text(),
    };
  } catch (error) {
    tests.results.config = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(tests);
}
