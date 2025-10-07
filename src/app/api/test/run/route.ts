import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFileSync } from 'fs';

interface TestRequest {
  providers: string[];
  queryTypes: string[];
  consumerQueries: number;
  businessQueries: number;
  customQueries?: {
    consumer: string[];
    business: string[];
  };
}

interface TestResult {
  provider: string;
  success: boolean;
  queriesPath?: string | null;
  responsesPath?: string | null;
  totalQueries?: number;
  error?: string;
  collectError?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Load environment variables from the tester directory
function loadTesterEnv(): Record<string, string> {
  const testerDir = join(process.cwd(), '..', 'ai-visibility-tester');
  const envPath = join(testerDir, '.env');

  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};

    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    console.error('Failed to load .env from tester directory:', error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const { providers, queryTypes, consumerQueries, businessQueries, customQueries }: TestRequest = await request.json();

    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { error: 'At least one provider must be selected' },
        { status: 400 }
      );
    }

    // If backend URL is set, proxy to external backend (production mode)
    if (BACKEND_URL) {
      console.log('Using external backend:', BACKEND_URL);

      try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/test/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            providers,
            query_types: queryTypes,
            consumer_queries: consumerQueries,
            business_queries: businessQueries,
            ...(customQueries && { custom_queries: customQueries }),
          }),
        });

        if (!backendResponse.ok) {
          const errorText = await backendResponse.text();
          console.error('Backend error response:', errorText);
          throw new Error(`Backend request failed: ${backendResponse.status} ${errorText}`);
        }

        const data = await backendResponse.json();
        const jobId = data.job_id;

        console.log('Test run started, job ID:', jobId);

        // Poll for results
        const maxAttempts = 60; // 5 minutes max (5 second intervals)
        let attempts = 0;

        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

          try {
            const statusResponse = await fetch(`${BACKEND_URL}/api/test/status/${jobId}`);

            if (!statusResponse.ok) {
              console.error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
              throw new Error(`Failed to get test status: ${statusResponse.status}`);
            }

            const status = await statusResponse.json();
            console.log(`Poll ${attempts + 1}: ${status.status} - ${status.progress}% - ${status.message}`);

            if (status.status === 'completed') {
              console.log('Test run completed successfully');
              return NextResponse.json({
                success: true,
                message: 'Test run completed successfully',
                results: status.results || [],
              });
            }

            if (status.status === 'failed') {
              throw new Error(status.error || 'Test run failed');
            }

            attempts++;
          } catch (pollError) {
            console.error(`Poll attempt ${attempts + 1} failed:`, pollError);

            // If polling fails, wait and retry
            if (attempts >= 3) {
              // After 3 failed polls, give up
              throw pollError;
            }
            attempts++;
          }
        }

        // Timeout
        return NextResponse.json(
          { error: 'Test run timed out. Check backend logs.' },
          { status: 408 }
        );
      } catch (backendError) {
        console.error('Backend communication error:', backendError);
        return NextResponse.json(
          {
            error: backendError instanceof Error ? backendError.message : 'Failed to communicate with backend',
            details: 'Make sure NEXT_PUBLIC_BACKEND_URL is set correctly and the backend is running'
          },
          { status: 500 }
        );
      }
    }

    // Local development mode - run Python scripts directly
    console.log('Using local Python execution');

    // Path to the Python scripts
    const workingDir = join(process.cwd(), '..', 'ai-visibility-tester');
    const scriptsPath = join(workingDir, 'scripts');
    const configPath = join(workingDir, 'config.yaml');

    // Generate unique test run ID
    const testRunId = Date.now().toString();

    // Create test run metadata file
    const { writeFile } = await import('fs/promises');
    const testRunMetadata = {
      test_run_id: testRunId,
      providers: providers,
      timestamp: new Date().toISOString(),
      total_providers: providers.length,
      query_types: queryTypes,
      consumer_queries: consumerQueries,
      business_queries: businessQueries
    };

    const metadataPath = join(workingDir, 'results', `.test_run_${testRunId}.json`);
    await writeFile(metadataPath, JSON.stringify(testRunMetadata, null, 2));
    console.log('Created test run metadata:', metadataPath);

    const results: TestResult[] = [];
    const queriesPaths: (string | null)[] = [];
    const responsesPaths: (string | null)[] = [];

    // Step 1: Generate or save custom queries
    let customQueriesPath: string | null = null;

    if (customQueries) {
      // Save custom queries to CSV file
      try {
        const { readFile } = await import('fs/promises');
        const configContent = await readFile(configPath, 'utf-8');
        const configMatch = configContent.match(/business_name:\s*["']?([^"'\n]+)["']?/);
        const businessName = configMatch ? configMatch[1].trim() : 'Unknown';

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
        const csvFilename = `custom_queries_${businessName.replace(/\s+/g, '_')}_${timestamp}.csv`;
        customQueriesPath = join(workingDir, 'results', businessName, csvFilename);

        // Create CSV content
        let csvContent = 'Query,Query_Type\n';
        customQueries.consumer.forEach(query => {
          csvContent += `"${query.replace(/"/g, '""')}",consumer\n`;
        });
        customQueries.business.forEach(query => {
          csvContent += `"${query.replace(/"/g, '""')}",business\n`;
        });

        // Ensure directory exists
        const { mkdir } = await import('fs/promises');
        const resultsDir = join(workingDir, 'results', businessName);
        await mkdir(resultsDir, { recursive: true });

        await writeFile(customQueriesPath, csvContent);
        console.log('Saved custom queries to:', customQueriesPath);

        // Use the same queries path for all providers
        for (const provider of providers) {
          queriesPaths.push(customQueriesPath);
          results.push({
            provider,
            success: true,
            queriesPath: customQueriesPath,
            totalQueries: customQueries.consumer.length + customQueries.business.length,
          });
        }
      } catch (error) {
        console.error('Error saving custom queries:', error);
        return NextResponse.json(
          { error: 'Failed to save custom queries' },
          { status: 500 }
        );
      }
    } else {
      // Generate queries for all providers (AI mode)
      for (const provider of providers) {
        try {
          const scriptPath = join(scriptsPath, `${provider}_script.py`);

          // Generate queries
          const generateOutput = await runPythonScript(scriptPath, workingDir, configPath, 'generate');
          const queriesPath = extractFilePath(generateOutput, 'Saved to:');

          // Always push to maintain index alignment, even if null
          queriesPaths.push(queriesPath || null);

          results.push({
            provider,
            success: !!queriesPath,
            queriesPath,
            totalQueries: consumerQueries + businessQueries,
          });
        } catch (error) {
          // Push null to maintain index alignment
          queriesPaths.push(null);
          results.push({
            provider,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    // Step 2: Collect responses for all providers using their queries
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const queriesPath = queriesPaths[i];

      if (!queriesPath) continue;

      try {
        const scriptPath = join(scriptsPath, `${provider}_script.py`);

        // Collect responses with test run ID
        const collectOutput = await runPythonScript(scriptPath, workingDir, configPath, 'collect', queriesPath, testRunId);
        const responsesPath = extractFilePath(collectOutput, 'saved to:');

        if (responsesPath) {
          responsesPaths.push(responsesPath);
          results[i].responsesPath = responsesPath;
        }
      } catch (error) {
        results[i].collectError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Step 3: Generate report for each provider's responses
    const reportPaths: string[] = [];
    const validResponsesPaths = responsesPaths.filter(path => path !== null && path !== undefined);

    for (const responsesPath of validResponsesPaths) {
      try {
        const reportScriptPath = join(scriptsPath, '4_generate_report.py');
        const reportOutput = await runReportScript(reportScriptPath, workingDir, configPath, responsesPath, testRunId);

        const reportPath = extractFilePath(reportOutput, 'report saved to:');
        if (reportPath) {
          reportPaths.push(reportPath);
        }
      } catch (error) {
        console.error('Error generating report:', error);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      reportPaths,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running test:', error);
    return NextResponse.json(
      { error: 'Failed to execute test' },
      { status: 500 }
    );
  }
}

function runPythonScript(
  scriptPath: string,
  workingDir: string,
  configPath: string,
  action: 'generate' | 'collect',
  queriesPath?: string,
  testRunId?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [scriptPath, '--config', configPath, '--action', action];

    if (action === 'collect' && queriesPath) {
      args.push('--queries', queriesPath);

      if (testRunId) {
        args.push('--test-run-id', testRunId);
      }
    }

    const testerEnv = loadTesterEnv();
    const pythonProcess = spawn('python', args, {
      cwd: workingDir,
      env: { ...process.env, ...testerEnv }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });

    pythonProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(text);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

function runReportScript(
  scriptPath: string,
  workingDir: string,
  configPath: string,
  analysisFile: string,
  testRunId: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = [scriptPath, '--analysis', analysisFile, '--config', configPath, '--test-run-id', testRunId];

    const testerEnv = loadTesterEnv();
    const pythonProcess = spawn('python', args, {
      cwd: workingDir,
      env: { ...process.env, ...testerEnv }
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text);
    });

    pythonProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      console.error(text);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Report script failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

function extractFilePath(output: string, marker: string): string | null {
  const lines = output.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const markerIndex = lowerLine.indexOf(marker.toLowerCase());

    if (markerIndex >= 0) {
      const path = line.substring(markerIndex + marker.length).trim();
      return path.replace(/\.$/, ''); // Remove trailing period if present
    }
  }
  return null;
}