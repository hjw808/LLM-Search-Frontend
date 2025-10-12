"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Competitor {
  name: string;
  count: number;
  queries: number[];
}

interface ProviderReport {
  provider: string;
  html_report_path: string;
  queries: number;
  business_mentions: number;
  competitors_found: number;
  visibility_score: number;
  top_competitors?: Competitor[];
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
  top_competitors?: Competitor[];
  provider_reports: ProviderReport[];
}

export default function ReportsPage() {
  const [reports, setReports] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiResponses, setAiResponses] = useState<{[provider: string]: Record<string, string>[]}>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentQAIndex, setCurrentQAIndex] = useState<{[provider: string]: number}>({});
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = useState<{[key: string]: boolean}>({});
  const [competitorPageIndex, setCompetitorPageIndex] = useState<{[competitor: string]: number}>({});
  const [isCompetitorsExpanded, setIsCompetitorsExpanded] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<{[provider: string]: boolean}>({});

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0 && currentIndex < reports.length) {
      loadReportResponses(reports[currentIndex]);
      // Reset QA indices, expanded competitor, and competitor pages when switching reports
      setCurrentQAIndex({});
      setExpandedCompetitor(null);
      setCompetitorPageIndex({});
      setIsCompetitorsExpanded(false);
      setExpandedProviders({});
    }
  }, [currentIndex, reports]);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportResponses = async (report: TestResult) => {
    const responses: {[provider: string]: Record<string, string>[]} = {};

    for (const providerReport of report.provider_reports) {
      try {
        const response = await fetch(`/api/reports/${report.id}/responses?provider=${providerReport.provider}`);
        if (response.ok) {
          const data = await response.json();
          responses[providerReport.provider] = data;
        }
      } catch (error) {
        console.error(`Failed to load ${providerReport.provider} responses:`, error);
      }
    }

    setAiResponses(responses);
  };

  const handleDeleteReport = async (reportId: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const newReports = reports.filter(r => r.id !== reportId);
        setReports(newReports);
        // Adjust current index if needed
        if (currentIndex >= newReports.length && currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        setDeleteConfirmId(null);
      } else {
        console.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadResponses = async (reportId: string, format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download-responses?format=${format}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `ai-responses-${reportId}.${format}`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Failed to download responses');
      }
    } catch (error) {
      console.error('Failed to download responses:', error);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < reports.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6 px-4 md:px-0">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Navigation Skeleton */}
        <Skeleton className="h-20 w-full" />

        {/* Report Overview Skeleton */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>

        {/* AI Conversations Skeleton */}
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Reports Yet</h2>
          <p className="text-slate-400 mb-6">
            Run your first AI visibility test to see results here
          </p>
          <button
            onClick={() => window.location.href = '/test'}
            className="px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Run Test
          </button>
        </div>
      </div>
    );
  }

  const currentReport = reports[currentIndex];

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Test Report</h1>
          <p className="text-sm md:text-base text-slate-400">
            Viewing report {currentIndex + 1} of {reports.length}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.location.href = '/test'}
            className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sm:hidden">New</span>
            <span className="hidden sm:inline">Run New Test</span>
          </button>
          <button
            onClick={loadReports}
            className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="sr-only sm:not-sr-only sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => handleDownloadResponses(currentReport.id, 'csv')}
            className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="sm:hidden">CSV</span>
            <span className="hidden sm:inline">Download All Responses</span>
          </button>
          {deleteConfirmId === currentReport.id ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteReport(currentReport.id)}
                disabled={isDeleting}
                className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                Confirm
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirmId(currentReport.id)}
              className="px-3 md:px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 min-w-[44px] ${
            currentIndex === 0
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden md:inline">Previous Report</span>
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          {reports.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-500 w-6 md:w-8' : 'bg-slate-500 hover:bg-slate-400'
              }`}
              aria-label={`Go to report ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === reports.length - 1}
          className={`px-3 md:px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 min-w-[44px] ${
            currentIndex === reports.length - 1
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <span className="hidden md:inline">Next Report</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Report Overview */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-white break-words">{currentReport.business_name}</h2>
              <p className="flex items-center gap-2 mt-2 text-sm md:text-base text-slate-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">
                  {new Date(currentReport.timestamp).toLocaleDateString()} at{" "}
                  {new Date(currentReport.timestamp).toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {currentReport.visibility_score}%
              </div>
              <div className="text-xs md:text-sm text-slate-400 flex items-center gap-1 justify-start sm:justify-end group relative">
                <span>Visibility Score</span>
                <div className="relative">
                  <span className="text-blue-400 cursor-help">ℹ️</span>
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-slate-900 border border-white/20 rounded-xl text-xs text-slate-300 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                    Your visibility score represents how often your business was mentioned in AI responses compared to total queries. Higher is better!
                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="text-center p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-xl md:text-2xl font-bold text-white">{currentReport.total_queries}</div>
              <div className="text-xs md:text-sm text-slate-400">Total Queries</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-xl md:text-2xl font-bold text-white">{currentReport.business_mentions || 0}</div>
              <div className="text-xs md:text-sm text-slate-400">Business Mentions</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-xl md:text-2xl font-bold text-white">{currentReport.competitors_found || 0}</div>
              <div className="text-xs md:text-sm text-slate-400">Competitors Found</div>
            </div>
            <div className="text-center p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-xl md:text-2xl font-bold text-white">{currentReport.providers.length}</div>
              <div className="text-xs md:text-sm text-slate-400">
                {currentReport.providers.length === 1 ? 'AI Provider' : 'AI Providers'}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {currentReport.providers.map((provider) => (
              <span key={provider} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs md:text-sm capitalize">
                {provider}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* All Competitors */}
      {currentReport.top_competitors && currentReport.top_competitors.length > 0 && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <button
            onClick={() => setIsCompetitorsExpanded(!isCompetitorsExpanded)}
            className="w-full p-4 md:p-6 hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="break-words">All Competitors Mentioned</span>
                  <span className="text-xs md:text-sm font-normal text-slate-400 whitespace-nowrap">
                    ({currentReport.top_competitors.length} total)
                  </span>
                </h3>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Click to {isCompetitorsExpanded ? 'hide' : 'view'} all competitors
                </p>
              </div>
              <ChevronRight className={`w-5 h-5 md:w-6 md:h-6 text-slate-400 transition-transform flex-shrink-0 ${isCompetitorsExpanded ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {isCompetitorsExpanded && (
            <div className="p-4 md:p-6 border-t border-white/10">
              <div className="space-y-3">
                {currentReport.top_competitors.map((competitor, index) => {
                const isExpanded = expandedCompetitor === competitor.name;

                // Find all responses that mention this competitor using query IDs from backend
                const mentioningResponses: Array<{query: string; response: string; provider: string; queryId: number}> = [];

                if (competitor.queries && competitor.queries.length > 0) {
                  // Use backend's query IDs for precise matching
                  const queryIdsSet = new Set(competitor.queries);

                  Object.keys(aiResponses).forEach(provider => {
                    aiResponses[provider]?.forEach(resp => {
                      const queryId = parseInt(resp['Query ID'] || '0');

                      if (queryIdsSet.has(queryId)) {
                        const responseText = resp['Response Text\r'] || resp['Response Text'] || '';
                        mentioningResponses.push({
                          queryId: queryId,
                          query: resp['Query Text'] || '',
                          response: responseText,
                          provider: provider
                        });
                      }
                    });
                  });
                } else {
                  // Fallback for old reports without query tracking
                  Object.keys(aiResponses).forEach(provider => {
                    aiResponses[provider]?.forEach(resp => {
                      const responseText = resp['Response Text\r'] || resp['Response Text'] || '';
                      const competitorsMentioned = resp['Competitors_Mentioned'];
                      let isCompetitorMentioned = false;

                      if (competitorsMentioned && competitorsMentioned !== 'None') {
                        const competitors = competitorsMentioned.split(',').map((c: string) => c.trim().toLowerCase());
                        isCompetitorMentioned = competitors.includes(competitor.name.toLowerCase());
                      }

                      if (isCompetitorMentioned) {
                        const queryId = parseInt(resp['Query ID'] || '0');
                        mentioningResponses.push({
                          queryId: queryId,
                          query: resp['Query Text'] || '',
                          response: responseText,
                          provider: provider
                        });
                      }
                    });
                  });
                }

                return (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCompetitor(isExpanded ? null : competitor.name)}
                      className="w-full flex flex-col sm:flex-row sm:items-center gap-3 p-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-slate-400 w-5 sm:w-6 flex-shrink-0 pt-1">{index + 1}</span>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="font-medium text-sm sm:text-base text-white break-words">{competitor.name}</span>
                          {competitor.queries && competitor.queries.length > 0 && (
                            <span className="text-xs text-slate-500 break-all">
                              Queries: {competitor.queries.sort((a, b) => a - b).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 ml-7 sm:ml-0">
                        <div className="w-24 sm:w-32 h-2 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${(competitor.count / currentReport.total_queries) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-slate-400 w-12 sm:w-16 text-right whitespace-nowrap">
                          {competitor.count} times
                        </span>
                        <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && mentioningResponses.length > 0 && (
                      <div className="border-t border-white/10 p-4 bg-white/5">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm text-slate-400">
                            Viewing {(competitorPageIndex[competitor.name] || 0) + 1} of {mentioningResponses.length} {mentioningResponses.length === 1 ? 'query' : 'queries'}
                          </p>
                          {mentioningResponses.length > 1 && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const currentIdx = competitorPageIndex[competitor.name] || 0;
                                  if (currentIdx > 0) {
                                    setCompetitorPageIndex({
                                      ...competitorPageIndex,
                                      [competitor.name]: currentIdx - 1
                                    });
                                  }
                                }}
                                disabled={(competitorPageIndex[competitor.name] || 0) === 0}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                  (competitorPageIndex[competitor.name] || 0) === 0
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                }`}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const currentIdx = competitorPageIndex[competitor.name] || 0;
                                  if (currentIdx < mentioningResponses.length - 1) {
                                    setCompetitorPageIndex({
                                      ...competitorPageIndex,
                                      [competitor.name]: currentIdx + 1
                                    });
                                  }
                                }}
                                disabled={(competitorPageIndex[competitor.name] || 0) === mentioningResponses.length - 1}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                                  (competitorPageIndex[competitor.name] || 0) === mentioningResponses.length - 1
                                    ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                }`}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {(() => {
                          const currentIdx = competitorPageIndex[competitor.name] || 0;
                          const item = mentioningResponses[currentIdx];
                          const responseKey = `competitor-${competitor.name}-${currentIdx}`;
                          const isResponseExpanded = expandedResponses[responseKey];
                          const responseLines = item.response.split('\n').filter(line => line.trim());
                          const shouldShowReadMore = responseLines.length > 4;

                          return (
                            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-3 md:p-4">
                              <div className="mb-3">
                                <span className="text-xs font-semibold text-blue-400 uppercase">{item.provider}</span>
                              </div>
                              <div className="mb-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                                  <span className="text-base">❓</span> Question
                                </div>
                                <p className="text-xs md:text-sm text-white break-words">{item.query}</p>
                              </div>
                              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                                  <span className="text-base">💡</span> AI Response
                                </div>
                                <div className={`text-xs md:text-sm text-slate-300 whitespace-pre-wrap break-words ${!isResponseExpanded && shouldShowReadMore ? 'line-clamp-4' : ''}`}>
                                  {responseLines.map((paragraph, pIdx) => (
                                    <p key={pIdx} className="mb-2">{paragraph}</p>
                                  ))}
                                </div>
                                {shouldShowReadMore && (
                                  <button
                                    onClick={() => setExpandedResponses({
                                      ...expandedResponses,
                                      [responseKey]: !isResponseExpanded
                                    })}
                                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                                  >
                                    {isResponseExpanded ? 'Show less' : 'Read more'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Navigation dots */}
                        {mentioningResponses.length > 1 && (
                          <div className="flex items-center justify-center gap-2 mt-4">
                            {mentioningResponses.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCompetitorPageIndex({ ...competitorPageIndex, [competitor.name]: idx })}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === (competitorPageIndex[competitor.name] || 0) ? 'bg-blue-500 w-8' : 'bg-slate-500 hover:bg-slate-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Conversations by Provider */}
      {Object.keys(aiResponses).map((provider) => {
        const responses = aiResponses[provider] || [];
        const currentIdx = currentQAIndex[provider] || 0;
        const totalResponses = responses.length;

        if (totalResponses === 0) return null;

        const response = responses[currentIdx];
        const queryText = response['Query Text'] || '';
        // Handle the carriage return in the field name
        const responseText = response['Response Text\r'] || response['Response Text'] || response['AI Response'] || '';

        const goToPreviousQA = () => {
          if (currentIdx > 0) {
            setCurrentQAIndex({ ...currentQAIndex, [provider]: currentIdx - 1 });
          }
        };

        const goToNextQA = () => {
          if (currentIdx < totalResponses - 1) {
            setCurrentQAIndex({ ...currentQAIndex, [provider]: currentIdx + 1 });
          }
        };

        const isExpanded = expandedProviders[provider];

        return (
          <div key={provider} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedProviders({ ...expandedProviders, [provider]: !isExpanded })}
              className="w-full p-4 md:p-6 hover:bg-white/5 transition-all text-left"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="break-words">{provider.charAt(0).toUpperCase() + provider.slice(1)} AI Conversations</span>
                    <span className="text-xs md:text-sm font-normal text-slate-400 whitespace-nowrap">
                      ({totalResponses} {totalResponses === 1 ? 'query' : 'queries'})
                    </span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Click to {isExpanded ? 'hide' : 'view'} all conversations
                  </p>
                </div>
                <ChevronRight className={`w-5 h-5 md:w-6 md:h-6 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-white/10">
                <div className="p-4 md:p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs md:text-sm text-slate-400">
                      Viewing {currentIdx + 1} of {totalResponses} {totalResponses === 1 ? 'pair' : 'pairs'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPreviousQA}
                        disabled={currentIdx === 0}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 min-w-[44px] min-h-[44px] justify-center ${
                          currentIdx === 0
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                        aria-label="Previous response"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={goToNextQA}
                        disabled={currentIdx === totalResponses - 1}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 min-w-[44px] min-h-[44px] justify-center ${
                          currentIdx === totalResponses - 1
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                        aria-label="Next response"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 md:p-4">
                <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-3 md:p-4 rounded-xl">
                  <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="text-base">❓</span> Question
                  </div>
                  <p className="text-xs md:text-sm font-medium text-white break-words">{queryText.trim()}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-3 md:p-4 rounded-xl">
                  <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <span className="text-base">💡</span> AI Response
                  </div>
                  {(() => {
                    const providerResponseKey = `provider-${provider}-${currentIdx}`;
                    const isProviderResponseExpanded = expandedResponses[providerResponseKey];
                    const trimmedResponse = responseText?.trim() || '';
                    const responseLines = trimmedResponse.split('\n').filter(line => line.trim());
                    const shouldShowReadMore = responseLines.length > 4;

                    return (
                      <>
                        <div className={`text-xs md:text-sm text-slate-300 whitespace-pre-wrap break-words ${!isProviderResponseExpanded && shouldShowReadMore ? 'line-clamp-4' : ''}`}>
                          {trimmedResponse ? (
                            responseLines.map((paragraph, pIdx) => (
                              <p key={pIdx} className="mb-2">{paragraph}</p>
                            ))
                          ) : (
                            <p className="text-slate-500 italic">No response available</p>
                          )}
                        </div>
                        {shouldShowReadMore && (
                          <button
                            onClick={() => setExpandedResponses({
                              ...expandedResponses,
                              [providerResponseKey]: !isProviderResponseExpanded
                            })}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {isProviderResponseExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {responses.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQAIndex({ ...currentQAIndex, [provider]: index })}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIdx ? 'bg-blue-500 w-8' : 'bg-slate-500 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
