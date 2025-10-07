"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, Trash2, ChevronDown, ChevronUp } from "lucide-react";

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

export default function AdminDeepDivePage() {
  const [requests, setRequests] = useState<DeepDiveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    competitorsMentioned: "",
    yourMentions: "",
    extractedQueries: "",
    recommendations: "",
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/deep-dive/admin/all");
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request: DeepDiveRequest) => {
    setEditingRequest(request.id);
    setFormData({
      competitorsMentioned: request.competitorsMentioned || "",
      yourMentions: request.yourMentions || "",
      extractedQueries: request.extractedQueries || "",
      recommendations: request.recommendations || "",
    });
  };

  const handleSave = async (id: string) => {
    try {
      const response = await fetch("/api/deep-dive/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          ...formData,
        }),
      });

      if (response.ok) {
        await fetchRequests();
        setEditingRequest(null);
        setFormData({
          competitorsMentioned: "",
          yourMentions: "",
          extractedQueries: "",
          recommendations: "",
        });
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    try {
      const response = await fetch(`/api/deep-dive/admin/delete?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const completedRequests = requests.filter(r => r.status === "completed");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4 md:px-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Deep Dive Admin Portal
        </h1>
        <p className="text-slate-400">
          Manage deep dive requests and add results
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-sm text-slate-400 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-white">{requests.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-sm text-yellow-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-400 mb-1">Completed</p>
          <p className="text-2xl font-bold text-white">{completedRequests.length}</p>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Pending Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-lg font-bold text-white">{request.businessName}</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{request.businessUrl}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                          ID: {request.id}
                        </span>
                        <span className="px-2 py-1 bg-white/10 text-slate-300 rounded">
                          {request.aiEngines.join(", ")}
                        </span>
                        <span className="px-2 py-1 bg-white/10 text-slate-300 rounded">
                          {request.queryCount} queries
                        </span>
                        <span className="px-2 py-1 bg-white/10 text-slate-300 rounded">
                          {request.queryTypes.join(", ")}
                        </span>
                      </div>
                      {request.notes && (
                        <p className="text-sm text-slate-400 mt-3">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExpandedRequest(expandedRequest === request.id ? null : request.id)
                        }
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        {expandedRequest === request.id ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Form
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Add Results
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(request.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Form */}
                {expandedRequest === request.id && (
                  <div className="p-6 space-y-4">
                    {editingRequest !== request.id && (
                      <button
                        onClick={() => handleEdit(request)}
                        className="w-full py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                      >
                        Edit Results
                      </button>
                    )}

                    {editingRequest === request.id && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Competitors Mentioned
                          </label>
                          <textarea
                            rows={4}
                            value={formData.competitorsMentioned}
                            onChange={(e) =>
                              setFormData({ ...formData, competitorsMentioned: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="List competitors mentioned in AI responses..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Your Business Mentions
                          </label>
                          <textarea
                            rows={4}
                            value={formData.yourMentions}
                            onChange={(e) =>
                              setFormData({ ...formData, yourMentions: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="How many times and where your business was mentioned..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Extracted AI Queries
                          </label>
                          <textarea
                            rows={8}
                            value={formData.extractedQueries}
                            onChange={(e) =>
                              setFormData({ ...formData, extractedQueries: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none font-mono text-sm"
                            placeholder="Paste extracted queries from AI backends..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Strategic Recommendations
                          </label>
                          <textarea
                            rows={6}
                            value={formData.recommendations}
                            onChange={(e) =>
                              setFormData({ ...formData, recommendations: e.target.value })
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="Strategic advice on how to use this intelligence..."
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSave(request.id)}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                          >
                            Save & Mark Complete
                          </button>
                          <button
                            onClick={() => setEditingRequest(null)}
                            className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Completed Requests</h2>
          <div className="space-y-4">
            {completedRequests.map((request) => (
              <div
                key={request.id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-bold text-white">{request.businessName}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{request.businessUrl}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                        ID: {request.id}
                      </span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                        Completed {new Date(request.completedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">No deep dive requests yet</p>
        </div>
      )}
    </div>
  );
}
