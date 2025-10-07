"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Clock, CheckCircle, Copy, Check, X } from "lucide-react";

export const dynamic = 'force-dynamic';

interface DeepDiveRequest {
  id: string;
  businessName: string;
  businessUrl: string;
  aiEngines: string[];
  queryCount: number;
  queryTypes: string[];
  notes?: string;
  status: "pending" | "completed";
  competitorsMentioned?: string;
  yourMentions?: string;
  extractedQueries?: string;
  recommendations?: string;
  createdAt: string;
  completedAt?: string;
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");
  const fromSubmit = searchParams.get("from") === "submit";

  const [trackingId, setTrackingId] = useState(urlId || "");
  const [request, setRequest] = useState<DeepDiveRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [showSuccessBanner, setShowSuccessBanner] = useState(fromSubmit);

  const handleTrack = async (id?: string) => {
    const searchId = id || trackingId;

    if (!searchId) {
      setError("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/deep-dive/track/${searchId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError("Request not found. Please check your tracking ID.");
        } else {
          setError("Failed to fetch request");
        }
        setRequest(null);
        return;
      }

      const data = await response.json();
      setRequest(data.request);
    } catch (err) {
      console.error("Error fetching request:", err);
      setError("Failed to fetch request");
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlId) {
      handleTrack(urlId);
    }
    // Auto-dismiss success banner after 5 seconds
    if (showSuccessBanner) {
      const timer = setTimeout(() => {
        setShowSuccessBanner(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlId, showSuccessBanner]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFields({ ...copiedFields, [field]: true });
    setTimeout(() => {
      setCopiedFields({ ...copiedFields, [field]: false });
    }, 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Success Banner */}
      {showSuccessBanner && urlId && (
        <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-400 font-semibold mb-1">Deep Dive Request Submitted Successfully!</p>
              <p className="text-green-300 text-sm">
                Your tracking ID is: <span className="font-mono font-bold">{urlId}</span>
              </p>
              <p className="text-green-300 text-xs mt-1">
                Save this ID to check your results later. Results typically take 2-3 business days.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="text-green-400 hover:text-green-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Track Your Deep Dive Request
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Enter your tracking ID to check the status of your request
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="Enter tracking ID (e.g., DD-1234567890)"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <button
              onClick={() => handleTrack()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Track</span>
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}

          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2 text-sm">
            <p className="flex items-start gap-2 text-blue-300">
              <span className="text-base flex-shrink-0">💡</span>
              <span>Your tracking ID was provided when you submitted your request (format: DD-1234567890)</span>
            </p>
            <p className="flex items-start gap-2 text-blue-300">
              <span className="text-base flex-shrink-0">⏱️</span>
              <span>Results typically take 2-3 business days to complete</span>
            </p>
            <p className="flex items-start gap-2 text-blue-300">
              <span className="text-base flex-shrink-0">❓</span>
              <span>Check your email for your tracking ID, or contact support if you need assistance</span>
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      {request && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Card */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              {request.status === "pending" ? (
                <Clock className="w-12 h-12 text-yellow-400 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-12 h-12 text-green-400 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {request.status === "pending" ? "Analysis In Progress" : "Analysis Complete"}
                </h2>
                <p className="text-slate-400 mb-4">
                  {request.status === "pending"
                    ? "We're currently analyzing your business visibility across AI platforms. This typically takes 2-3 business days."
                    : "Your deep dive analysis is ready! Review the insights below."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-slate-400">Business:</span>
                    <span className="text-white font-medium ml-2">{request.businessName}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-slate-400">Submitted:</span>
                    <span className="text-white font-medium ml-2">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results (Only if completed) */}
          {request.status === "completed" && (
            <div className="space-y-4">
              {/* Competitors Mentioned */}
              {request.competitorsMentioned && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Competitors Mentioned</h3>
                    <button
                      onClick={() => copyToClipboard(request.competitorsMentioned!, "competitors")}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {copiedFields.competitors ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words bg-white/5 rounded-xl p-4">
                    {request.competitorsMentioned}
                  </pre>
                </div>
              )}

              {/* Your Mentions */}
              {request.yourMentions && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Your Business Mentions</h3>
                    <button
                      onClick={() => copyToClipboard(request.yourMentions!, "mentions")}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {copiedFields.mentions ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words bg-white/5 rounded-xl p-4">
                    {request.yourMentions}
                  </pre>
                </div>
              )}

              {/* Extracted Queries */}
              {request.extractedQueries && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Extracted AI Queries</h3>
                    <button
                      onClick={() => copyToClipboard(request.extractedQueries!, "queries")}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {copiedFields.queries ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words bg-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
                    {request.extractedQueries}
                  </pre>
                </div>
              )}

              {/* Recommendations */}
              {request.recommendations && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Strategic Recommendations</h3>
                    <button
                      onClick={() => copyToClipboard(request.recommendations!, "recommendations")}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      {copiedFields.recommendations ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap break-words bg-white/5 rounded-xl p-4">
                    {request.recommendations}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DeepDiveTrackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  );
}
