import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';

function parseFilename(filename: string): { provider: string; timestamp: string } | null {
  // Expected format: openai_queries_Business_Name_20251004_120104.txt
  // Updated regex to be more flexible with business names containing underscores
  const match = filename.match(/^(openai|claude|perplexity)_queries_.*_(\d{8}_\d{6})\.txt$/);
  if (match) {
    const [, provider, timestampStr] = match;
    const timestamp = parseTimestamp(timestampStr);
    return { provider, timestamp };
  }
  return null;
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    // Try to find the actual file based on the report ID
    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');

    try {
      const businessDirs = await readdir(resultsPath);

      for (const businessDir of businessDirs) {
        const businessPath = join(resultsPath, businessDir);

        try {
          const files = await readdir(businessPath);

          for (const file of files) {
            if (file.endsWith('.txt')) {
              // Check if this file matches our report ID
              const parsed = parseFilename(file);
              if (parsed) {
                const fileReportId = `${businessDir}_${parsed.timestamp}`;
                if (fileReportId === reportId) {
                  // Found the matching file, read its content
                  const filePath = join(businessPath, file);
                  const content = await readFile(filePath, 'utf-8');

                  return new NextResponse(content, {
                    headers: {
                      'Content-Type': 'text/plain',
                      'Content-Disposition': `attachment; filename="${file}"`,
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
    } catch (error) {
      console.error('Error reading results directory:', error);
    }

    return new NextResponse('Report not found', { status: 404 });

  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
}