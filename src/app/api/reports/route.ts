import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface ProviderReport {
  provider: string;
  html_report_path: string;
  queries: number;
  business_mentions: number;
  competitors_found: number;
  visibility_score: number;
  top_competitors?: Array<{name: string; count: number}>;
}

interface TestResult {
  id: string;
  timestamp: string;
  business_name: string;
  providers: string[];
  total_queries: number;
  visibility_score: number;
  status: "completed" | "running" | "failed";
  has_analysis: boolean;
  business_mentions?: number;
  competitors_found?: number;
  top_competitors?: Array<{name: string; count: number}>;
  provider_reports: ProviderReport[];
}

export async function GET() {
  try {
    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');
    console.log('Reading reports from:', resultsPath);

    try {
      const businessDirs = await readdir(resultsPath);
      console.log('Found business directories:', businessDirs);

      // Group reports by test run ID
      const testRunsMap = new Map<string, TestResult>();

      for (const businessDir of businessDirs) {
        const businessPath = join(resultsPath, businessDir);
        const businessStat = await stat(businessPath);

        if (businessStat.isDirectory()) {
          try {
            const files = await readdir(businessPath);

            // Process all HTML report files
            for (const file of files) {
              if (file.endsWith('.html') && (file.includes('report') || file.includes('responses'))) {
                console.log('Processing HTML report:', file);
                const filePath = join(businessPath, file);
                const fileContent = await readFile(filePath, 'utf-8');

                // Parse test run ID, timestamp and provider from filename
                // New format: provider_responses_testrun_ID_timestamp.html
                // Old format: provider_responses_business_timestamp.html
                const testRunMatch = file.match(/testrun_(\d+)/);
                const timestampMatch = file.match(/(\d{8}_\d{6})/);
                const providerMatch = file.match(/^(openai|claude|gemini|copilot)_/);

                if (providerMatch && timestampMatch) {
                  const provider = providerMatch[1];
                  const timestampStr = timestampMatch[1];
                  const timestamp = parseTimestamp(timestampStr);

                  // Extract analysis data from HTML
                  const analysisData = extractAnalysisFromHTML(fileContent);

                  const providerReport: ProviderReport = {
                    provider,
                    html_report_path: filePath,
                    queries: analysisData.totalQueries || 0,
                    business_mentions: analysisData.businessMentions || 0,
                    competitors_found: analysisData.competitorsFound || 0,
                    visibility_score: analysisData.visibilityScore || 0,
                    top_competitors: analysisData.topCompetitors
                  };

                  // If file has test run ID, use it for grouping
                  if (testRunMatch) {
                    const testRunId = testRunMatch[1];
                    const testRunKey = `${businessDir}_testrun_${testRunId}`;

                    // Get or create test run
                    if (!testRunsMap.has(testRunKey)) {
                      testRunsMap.set(testRunKey, {
                        id: `${businessDir}_${timestamp}`,
                        timestamp: timestamp,
                        business_name: businessDir.replace(/_/g, ' '),
                        providers: [],
                        total_queries: 0,
                        visibility_score: 0,
                        status: "completed",
                        has_analysis: true,
                        business_mentions: 0,
                        competitors_found: 0,
                        top_competitors: [],
                        provider_reports: []
                      });
                    }

                    const testRun = testRunsMap.get(testRunKey)!;

                    // Only add provider if not already in the array
                    if (!testRun.providers.includes(provider)) {
                      testRun.providers.push(provider);
                    }

                    // Only add provider report if this provider isn't already in the reports
                    const providerAlreadyExists = testRun.provider_reports.some(r => r.provider === provider);
                    if (!providerAlreadyExists) {
                      testRun.provider_reports.push(providerReport);
                    }
                  } else {
                    // Old format without test run ID - create separate test run for each
                    const testRunKey = `${businessDir}_${timestampStr}`;
                    testRunsMap.set(testRunKey, {
                      id: `${businessDir}_${timestamp}`,
                      timestamp: timestamp,
                      business_name: businessDir.replace(/_/g, ' '),
                      providers: [provider],
                      total_queries: 0,
                      visibility_score: 0,
                      status: "completed",
                      has_analysis: true,
                      business_mentions: 0,
                      competitors_found: 0,
                      top_competitors: [],
                      provider_reports: [providerReport]
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

      // Aggregate metrics for each test run after all reports are collected
      for (const testRun of testRunsMap.values()) {
        if (testRun.provider_reports.length > 0) {
          // Sum total queries across all providers (each provider may have its own queries)
          testRun.total_queries = testRun.provider_reports.reduce((sum, r) => sum + r.queries, 0);

          // Sum business mentions across providers
          testRun.business_mentions = testRun.provider_reports.reduce((sum, r) => sum + r.business_mentions, 0);

          // Average visibility score across providers
          testRun.visibility_score = Math.round(
            testRun.provider_reports.reduce((sum, r) => sum + r.visibility_score, 0) / testRun.provider_reports.length
          );

          // Merge competitors - use MAX count per competitor (not sum)
          const allCompetitors = new Map<string, number>();
          for (const report of testRun.provider_reports) {
            if (report.top_competitors) {
              for (const comp of report.top_competitors) {
                const currentMax = allCompetitors.get(comp.name) || 0;
                allCompetitors.set(comp.name, Math.max(currentMax, comp.count));
              }
            }
          }
          testRun.top_competitors = Array.from(allCompetitors.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          testRun.competitors_found = allCompetitors.size;
        }
      }

      // Convert map to array and sort by timestamp descending
      const reports = Array.from(testRunsMap.values());
      reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      console.log('Returning reports:', reports.length, 'combined test runs found');
      return NextResponse.json(reports);
    } catch (error) {
      // If results directory doesn't exist or other error, return empty array
      console.log('Results directory not found or error reading:', error);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error reading reports:', error);
    return NextResponse.json(
      { error: 'Failed to load reports' },
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

function extractAnalysisFromHTML(htmlContent: string): {
  providers: string[];
  totalQueries: number;
  visibilityScore: number;
  businessMentions?: number;
  competitorsFound?: number;
  topCompetitors?: Array<{name: string; count: number}>;
} {
  const result = {
    providers: [] as string[],
    totalQueries: 0,
    visibilityScore: 0,
    businessMentions: 0,
    competitorsFound: 0,
    topCompetitors: [] as Array<{name: string; count: number}>
  };

  try {
    // Extract total queries
    const totalQueriesMatch = htmlContent.match(/<strong>Total Queries:<\/strong>\s*(\d+)/);
    if (totalQueriesMatch) {
      result.totalQueries = parseInt(totalQueriesMatch[1]);
    }

    // Extract business mentions and calculate visibility score
    const businessFoundMatch = htmlContent.match(/<strong>Business Found:<\/strong>.*?(\d+)\s*times.*?\(([\d.]+)%\)/s);
    if (businessFoundMatch) {
      result.businessMentions = parseInt(businessFoundMatch[1]);
      result.visibilityScore = Math.round(parseFloat(businessFoundMatch[2]));
    }

    // Extract providers from AI Engine sections
    const providerMatches = htmlContent.matchAll(/<h3>(\w+)\s+AI\s+Engine<\/h3>/gi);
    for (const match of providerMatches) {
      result.providers.push(match[1].toLowerCase());
    }

    // Extract competitor count and details from ranking table
    const competitorTableRegex = /<tr>\s*<td class="rank">(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>(\d+)<\/td>\s*<\/tr>/g;
    const competitorMatches = [...htmlContent.matchAll(competitorTableRegex)];

    if (competitorMatches.length > 0) {
      result.competitorsFound = competitorMatches.length;
      result.topCompetitors = competitorMatches.map(match => ({
        name: match[2].trim(),
        count: parseInt(match[3])
      }));
    }

  } catch (error) {
    console.error('Error parsing HTML analysis:', error);
  }

  return result;
}