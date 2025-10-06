import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv'; // csv or json

    // Extract business name and timestamp from report ID
    const reportTimeParts = reportId.split('_');
    const reportTime = reportTimeParts[reportTimeParts.length - 1];
    const reportTimestamp = new Date(reportTime);

    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');

    // Try to find test run ID from metadata files
    let testRunId: string | null = null;
    try {
      const metadataFiles = await readdir(resultsPath);
      for (const file of metadataFiles) {
        if (file.startsWith('.test_run_') && file.endsWith('.json')) {
          const metadataPath = join(resultsPath, file);
          const metadataContent = await readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);

          const metadataTime = new Date(metadata.timestamp);
          const timeDiff = Math.abs(metadataTime.getTime() - reportTimestamp.getTime());

          if (timeDiff < 5 * 60 * 1000) {
            testRunId = metadata.test_run_id;
            break;
          }
        }
      }
    } catch {
      console.log('No metadata files found');
    }

    // Collect all CSV files for this report
    const csvFiles: Array<{provider: string; content: string; filename: string}> = [];

    try {
      const businessDirs = await readdir(resultsPath);

      for (const businessDir of businessDirs) {
        const businessPath = join(resultsPath, businessDir);
        const businessStat = await stat(businessPath);

        if (businessStat.isDirectory()) {
          const files = await readdir(businessPath);

          for (const file of files) {
            if (file.endsWith('.csv') && file.includes('responses')) {
              let shouldInclude = false;

              // Check if this file matches our test run
              if (testRunId && file.includes(`testrun_${testRunId}`)) {
                shouldInclude = true;
              } else {
                // Fallback to timestamp matching
                const timestampMatch = file.match(/(\d{8}_\d{6})/);
                if (timestampMatch) {
                  const timestamp = timestampMatch[1];
                  const fileTimestamp = parseTimestamp(timestamp);
                  const fileMinute = fileTimestamp.substring(0, 16);
                  const reportMinute = reportTime.substring(0, 16);

                  if (fileMinute === reportMinute) {
                    shouldInclude = true;
                  }
                }
              }

              if (shouldInclude) {
                const filePath = join(businessPath, file);
                const content = await readFile(filePath, 'utf-8');

                // Extract provider from filename
                const providerMatch = file.match(/^(openai|claude|gemini|copilot|perplexity)_/);
                const provider = providerMatch ? providerMatch[1] : 'unknown';

                csvFiles.push({
                  provider,
                  content,
                  filename: file
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error reading results directory:', error);
    }

    if (csvFiles.length === 0) {
      return new NextResponse('No response data found', { status: 404 });
    }

    if (format === 'json') {
      // Convert CSVs to JSON format
      const jsonData = csvFiles.map(file => ({
        provider: file.provider,
        data: parseCSV(file.content)
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ai-responses-${reportId}.json"`,
        },
      });
    } else {
      // Return combined CSV or individual CSVs
      if (csvFiles.length === 1) {
        // Single file - return as-is
        return new NextResponse(csvFiles[0].content, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${csvFiles[0].filename}"`,
          },
        });
      } else {
        // Multiple files - combine them with provider column
        let combinedCSV = 'Provider,Query ID,Query Text,Response Text\n';

        for (const file of csvFiles) {
          const rows = file.content.split('\n');
          // Skip header row
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim()) {
              combinedCSV += `${file.provider},${rows[i]}\n`;
            }
          }
        }

        return new NextResponse(combinedCSV, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="ai-responses-combined-${reportId}.csv"`,
          },
        });
      }
    }

  } catch (error) {
    console.error('Error downloading responses:', error);
    return NextResponse.json(
      { error: 'Failed to download responses' },
      { status: 500 }
    );
  }
}

function parseTimestamp(timestampStr: string): string {
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

function parseCSV(csvContent: string): Record<string, string>[] {
  const responses = [];
  const rows = csvContent.split('\n').filter(r => r.trim());

  if (rows.length < 2) return [];

  const headers = parseCSVLine(rows[0]);

  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVLine(rows[i]);

    if (values.length === headers.length) {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        let value = values[index];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        value = value.replace(/""/g, '"');
        obj[header] = value;
      });
      responses.push(obj);
    }
  }

  return responses;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}
