import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({
      success: false,
      error: 'NEXT_PUBLIC_BACKEND_URL is not configured',
    });
  }

  try {
    // Step 1: Create a test job
    console.log('Creating test job...');
    const createResponse = await fetch(`${BACKEND_URL}/api/test/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providers: ['claude'],
        query_types: ['consumer'],
        consumer_queries: 5,
        business_queries: 5,
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      return NextResponse.json({
        success: false,
        step: 'create_job',
        status: createResponse.status,
        error: errorText,
      });
    }

    const createData = await createResponse.json();
    const jobId = createData.job_id;

    console.log('Job created:', jobId);

    // Step 2: Immediately check status
    const statusResponse = await fetch(`${BACKEND_URL}/api/test/status/${jobId}`);

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      return NextResponse.json({
        success: false,
        step: 'check_status',
        jobId,
        status: statusResponse.status,
        error: errorText,
      });
    }

    const statusData = await statusResponse.json();

    return NextResponse.json({
      success: true,
      jobId,
      createResponse: createData,
      statusResponse: statusData,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
