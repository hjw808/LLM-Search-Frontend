import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    // Try to find the HTML report file based on the report ID
    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');

    try {
      const businessDirs = await readdir(resultsPath);

      for (const businessDir of businessDirs) {
        const businessPath = join(resultsPath, businessDir);
        const businessStat = await stat(businessPath);

        if (businessStat.isDirectory()) {
          try {
            const files = await readdir(businessPath);

            for (const file of files) {
              if (file.endsWith('.html') && (file.includes('report') || file.includes('responses'))) {
                // Parse timestamp from filename
                const timestampMatch = file.match(/(\d{8}_\d{6})/);
                if (timestampMatch) {
                  const timestamp = timestampMatch[1];
                  const fileReportId = `${businessDir}_${parseTimestamp(timestamp)}`;

                  if (fileReportId === reportId) {
                    // Found the matching HTML report file
                    const filePath = join(businessPath, file);
                    const content = await readFile(filePath, 'utf-8');

                    return new NextResponse(content, {
                      headers: {
                        'Content-Type': 'text/html',
                      },
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error reading business directory ${businessDir}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error reading results directory:', error);
    }

    return new NextResponse('HTML report not found', { status: 404 });

  } catch (error) {
    console.error('Error reading HTML report:', error);
    return NextResponse.json(
      { error: 'Failed to load HTML report' },
      { status: 500 }
    );
  }
}

function parseTimestamp(timestampStr: string): string {
  // Convert 20251004_120104 to ISO format
  const date = timestampStr.substring(0, 8);
  const time = timestampStr.substring(9);

  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);

  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);
  const second = time.substring(4, 6);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}
