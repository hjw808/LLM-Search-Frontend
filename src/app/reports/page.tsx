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

export default function ReportsPage() {
  const [reports, setReports] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aiResponses, setAiResponses] = useState<{[provider: string]: Record<string, string>[]}>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentQAIndex, setCurrentQAIndex] = useState<{[provider: string]: number}>({});
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading reports...</p>
        </div>
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
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Test Report</h1>
          <p className="text-slate-400">
            Viewing report {currentIndex + 1} of {reports.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadReports}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => handleDownloadResponses(currentReport.id, 'csv')}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          {deleteConfirmId === currentReport.id ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDeleteReport(currentReport.id)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirmId(currentReport.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 p-6 rounded-2xl">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            currentIndex === 0
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Report
        </button>

        <div className="flex items-center gap-2">
          {reports.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-500 w-8' : 'bg-slate-500 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === reports.length - 1}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            currentIndex === reports.length - 1
              ? 'bg-white/5 text-slate-500 cursor-not-allowed'
              : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          Next Report
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Report Overview */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{currentReport.business_name}</h2>
              <p className="flex items-center gap-2 mt-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                {new Date(currentReport.timestamp).toLocaleDateString()} at{" "}
                {new Date(currentReport.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {currentReport.visibility_score}%
              </div>
              <div className="text-sm text-slate-400">Visibility Score</div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">{currentReport.total_queries}</div>
              <div className="text-sm text-slate-400">Total Queries</div>
            </div>
            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">{currentReport.business_mentions || 0}</div>
              <div className="text-sm text-slate-400">Business Mentions</div>
            </div>
            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">{currentReport.competitors_found || 0}</div>
              <div className="text-sm text-slate-400">Competitors Found</div>
            </div>
            <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">{currentReport.providers.length}</div>
              <div className="text-sm text-slate-400">
                {currentReport.providers.length === 1 ? 'AI Provider' : 'AI Providers'}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {currentReport.providers.map((provider) => (
              <span key={provider} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm capitalize">
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
            className="w-full p-6 hover:bg-white/5 transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  All Competitors Mentioned
                  <span className="text-sm font-normal text-slate-400">
                    ({currentReport.top_competitors.length} total)
                  </span>
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Click to {isCompetitorsExpanded ? 'hide' : 'view'} all competitors
                </p>
              </div>
              <ChevronRight className={`w-6 h-6 text-slate-400 transition-transform ${isCompetitorsExpanded ? 'rotate-90' : ''}`} />
            </div>
          </button>
          {isCompetitorsExpanded && (
            <div className="p-6 border-t border-white/10">
              <div className="space-y-3">
                {currentReport.top_competitors.map((competitor, index) => {
                const isExpanded = expandedCompetitor === competitor.name;

                // Find all responses that mention this competitor
                const mentioningResponses: Array<{query: string; response: string; provider: string}> = [];
                Object.keys(aiResponses).forEach(provider => {
                  aiResponses[provider]?.forEach(resp => {
                    const responseText = resp['Response Text\r'] || resp['Response Text'] || '';

                    // Check if this response has the analyzed Competitors_Mentioned field
                    const competitorsMentioned = resp['Competitors_Mentioned'];
                    let isCompetitorMentioned = false;

                    if (competitorsMentioned && competitorsMentioned !== 'None') {
                      // Use backend's analysis - split by semicolon and check if competitor is in the list
                      const competitors = competitorsMentioned.split(';').map((c: string) => c.trim().toLowerCase());
                      isCompetitorMentioned = competitors.includes(competitor.name.toLowerCase());
                    } else {
                      // Fallback to substring search for responses without analysis
                      isCompetitorMentioned = responseText.toLowerCase().includes(competitor.name.toLowerCase());
                    }

                    if (isCompetitorMentioned) {
                      mentioningResponses.push({
                        query: resp['Query Text'] || '',
                        response: responseText,
                        provider: provider
                      });
                    }
                  });
                });

                return (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedCompetitor(isExpanded ? null : competitor.name)}
                      className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-slate-400 w-6">{index + 1}</span>
                        <span className="font-medium text-white">{competitor.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${(competitor.count / currentReport.total_queries) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-400 w-16 text-right">
                          {competitor.count} times
                        </span>
                        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
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
                          return (
                            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
                              <div className="mb-3">
                                <span className="text-xs font-semibold text-blue-400 uppercase">{item.provider}</span>
                              </div>
                              <div className="mb-3 bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                                <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                                  <span className="text-base">❓</span> Question
                                </div>
                                <p className="text-sm text-white">{item.query}</p>
                              </div>
                              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                                  <span className="text-base">💡</span> AI Response
                                </div>
                                <div className="text-sm text-slate-300 whitespace-pre-wrap">
                                  {item.response.split('\n').map((paragraph, pIdx) => (
                                    paragraph.trim() ? <p key={pIdx} className="mb-2">{paragraph.trim()}</p> : null
                                  ))}
                                </div>
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
              className="w-full p-6 hover:bg-white/5 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    {provider.charAt(0).toUpperCase() + provider.slice(1)} AI Conversations
                    <span className="text-sm font-normal text-slate-400">
                      ({totalResponses} {totalResponses === 1 ? 'query' : 'queries'})
                    </span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Click to {isExpanded ? 'hide' : 'view'} all conversations
                  </p>
                </div>
                <ChevronRight className={`w-6 h-6 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-white/10">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Viewing {currentIdx + 1} of {totalResponses} query and response pairs
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={goToPreviousQA}
                        disabled={currentIdx === 0}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          currentIdx === 0
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={goToNextQA}
                        disabled={currentIdx === totalResponses - 1}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          currentIdx === totalResponses - 1
                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="mb-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <div className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                    <span className="text-base">❓</span> Question
                  </div>
                  <p className="text-sm font-medium text-white">{queryText.trim()}</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl">
                  <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-2">
                    <span className="text-base">💡</span> AI Response
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">
                    {responseText && responseText.trim() ? (
                      responseText.trim().split('\n').map((paragraph, pIdx) => (
                        paragraph.trim() ? <p key={pIdx} className="mb-2">{paragraph.trim()}</p> : null
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No response available</p>
                    )}
                  </div>
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
