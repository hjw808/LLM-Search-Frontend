/**
 * New API route that calls external Python backend
 * This replaces the local Python subprocess approach
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TestRequest {
  providers: string[];
  queryTypes: string[];
  consumerQueries: number;
  businessQueries: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const { providers, queryTypes, consumerQueries, businessQueries }: TestRequest = await request.json();

    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { error: 'At least one provider must be selected' },
        { status: 400 }
      );
    }

    // Check usage limits
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Call usage API to increment and check limit
    const usageResponse = await fetch(`${request.nextUrl.origin}/api/test/usage`, {
      method: 'POST',
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (usageResponse.status === 429) {
      const usageData = await usageResponse.json();
      return NextResponse.json(
        {
          error: 'Monthly test limit reached',
          limitReached: true,
          limit: usageData.limit
        },
        { status: 429 }
      );
    }

    if (!usageResponse.ok) {
      console.error('Usage check failed:', await usageResponse.text());
      return NextResponse.json(
        { error: 'Failed to check usage limits' },
        { status: 500 }
      );
    }

    console.log('Starting test run with external backend:', BACKEND_URL);
    console.log('Providers:', providers);
    console.log('Query types:', queryTypes);

    // Start the test run on the backend
    const response = await fetch(`${BACKEND_URL}/api/test/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers,
        query_types: queryTypes,
        consumer_queries: consumerQueries,
        business_queries: businessQueries,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Backend request failed');
    }

    const data = await response.json();
    const jobId = data.job_id;

    console.log('Test run started, job ID:', jobId);

    // Poll for results
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(`${BACKEND_URL}/api/test/status/${jobId}`);

      if (!statusResponse.ok) {
        throw new Error('Failed to get test status');
      }

      const status = await statusResponse.json();
      console.log(`Poll ${attempts + 1}: ${status.status} - ${status.progress}% - ${status.message}`);

      if (status.status === 'completed') {
        console.log('Test run completed successfully');
        return NextResponse.json({
          success: true,
          message: 'Test run completed successfully',
          jobId: jobId,
          results: status.results,
        });
      }

      if (status.status === 'failed') {
        throw new Error(status.error || 'Test run failed');
      }

      attempts++;
    }

    // Timeout
    return NextResponse.json(
      { error: 'Test run timed out. Check backend logs.' },
      { status: 408 }
    );

  } catch (error) {
    console.error('Error running test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run test' },
      { status: 500 }
    );
  }
}
