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
    const provider = searchParams.get('provider');

    // Extract business name and timestamp from report ID
    const reportTimeParts = reportId.split('_');
    const reportTime = reportTimeParts[reportTimeParts.length - 1];
    const reportTimestamp = new Date(reportTime);

    // Try to find the CSV responses file based on the report ID
    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');

    // First, try to find test run ID from metadata files
    let testRunId: string | null = null;
    try {
      const metadataFiles = await readdir(resultsPath);
      for (const file of metadataFiles) {
        if (file.startsWith('.test_run_') && file.endsWith('.json')) {
          const metadataPath = join(resultsPath, file);
          const metadataContent = await readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);

          // Check if this metadata's timestamp matches our report
          const metadataTime = new Date(metadata.timestamp);
          const timeDiff = Math.abs(metadataTime.getTime() - reportTimestamp.getTime());

          // If within 5 minutes, use this test run ID
          if (timeDiff < 5 * 60 * 1000) {
            testRunId = metadata.test_run_id;
            break;
          }
        }
      }
    } catch (error) {
      console.log('No metadata files found, using timestamp matching');
    }

    try {
      const businessDirs = await readdir(resultsPath);

      for (const businessDir of businessDirs) {
        const businessPath = join(resultsPath, businessDir);
        const businessStat = await stat(businessPath);

        if (businessStat.isDirectory()) {
          try {
            const files = await readdir(businessPath);

            for (const file of files) {
              if (file.endsWith('.csv') && file.includes('responses')) {
                // If provider is specified, filter by provider
                if (provider && !file.startsWith(provider)) {
                  continue;
                }

                // If we have a test run ID, match CSV by test run ID in filename
                if (testRunId) {
                  if (file.includes(`testrun_${testRunId}`)) {
                    // Found matching CSV with test run ID
                    const filePath = join(businessPath, file);
                    const content = await readFile(filePath, 'utf-8');
                    const responses = parseCSV(content);

                    // Try to load analyzed version with Competitors_Mentioned column
                    const analyzedResponses = await tryLoadAnalyzedData(businessPath, file, responses);
                    return NextResponse.json(analyzedResponses);
                  }
                } else {
                  // Fallback to timestamp matching for old reports
                  const timestampMatch = file.match(/(\d{8}_\d{6})/);
                  if (timestampMatch) {
                    const timestamp = timestampMatch[1];
                    const fileTimestamp = parseTimestamp(timestamp);
                    const fileTime = new Date(fileTimestamp);

                    // Match based on minute precision
                    const fileMinute = fileTimestamp.substring(0, 16); // YYYY-MM-DDTHH:MM
                    const reportMinute = reportTime.substring(0, 16);

                    if (fileMinute === reportMinute) {
                      const filePath = join(businessPath, file);
                      const content = await readFile(filePath, 'utf-8');
                      const responses = parseCSV(content);

                      // Try to load analyzed version with Competitors_Mentioned column
                      const analyzedResponses = await tryLoadAnalyzedData(businessPath, file, responses);
                      return NextResponse.json(analyzedResponses);
                    }
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

    return NextResponse.json({ error: 'Responses not found' }, { status: 404 });

  } catch (error) {
    console.error('Error reading responses:', error);
    return NextResponse.json(
      { error: 'Failed to load responses' },
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

function parseCSV(csvContent: string): any[] {
  const responses = [];

  // Split by newlines but respect quoted fields
  let rows: string[] = [];
  let currentRow = '';
  let inQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"' && (i === 0 || csvContent[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
      currentRow += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentRow.trim()) {
        rows.push(currentRow);
      }
      currentRow = '';
    } else {
      currentRow += char;
    }
  }

  // Add last row if exists
  if (currentRow.trim()) {
    rows.push(currentRow);
  }

  if (rows.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(rows[0]);

  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVLine(rows[i]);

    if (values.length === headers.length) {
      const obj: any = {};
      headers.forEach((header, index) => {
        // Remove surrounding quotes and unescape internal quotes
        let value = values[index];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        value = value.replace(/""/g, '"'); // Unescape doubled quotes
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
        // Escaped quote - add one quote and skip next
        current += '"';
        i++;
      } else {
        // Toggle quote state
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

async function tryLoadAnalyzedData(businessPath: string, originalFile: string, fallbackResponses: any[]): Promise<any[]> {
  try {
    // Try to find an analyzed CSV file (with _analysis_ in the name)
    const analyzedFileName = originalFile.replace('responses', 'analysis');

    const analyzedFilePath = join(businessPath, analyzedFileName);

    try {
      const analyzedContent = await readFile(analyzedFilePath, 'utf-8');
      const analyzedData = parseCSV(analyzedContent);

      // Check if it has the Competitors_Mentioned column
      if (analyzedData.length > 0 && 'Competitors_Mentioned' in analyzedData[0]) {
        console.log('Found analyzed CSV with Competitors_Mentioned column');
        return analyzedData;
      }
    } catch {
      // Analyzed file doesn't exist, fall through
    }

    // If no analyzed file found, return original responses
    console.log('No analyzed CSV found, using raw responses');
    return fallbackResponses;
  } catch (error) {
    console.error('Error loading analyzed data:', error);
    return fallbackResponses;
  }
}
