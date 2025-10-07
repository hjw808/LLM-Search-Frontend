"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle, AlertCircle } from "lucide-react";

export default function DeepDiveApplyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    businessUrl: "",
    aiEngines: [] as string[],
    queryCount: 50,
    queryTypes: [] as string[],
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const aiEngineOptions = [
    { id: "claude", name: "Claude (Anthropic)" },
    { id: "openai", name: "ChatGPT (OpenAI)" },
    { id: "gemini", name: "Gemini (Google)" },
    { id: "copilot", name: "Copilot (Microsoft)" },
  ];

  const handleToggleEngine = (engine: string) => {
    setFormData(prev => ({
      ...prev,
      aiEngines: prev.aiEngines.includes(engine)
        ? prev.aiEngines.filter(e => e !== engine)
        : [...prev.aiEngines, engine]
    }));
  };

  const handleToggleQueryType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      queryTypes: prev.queryTypes.includes(type)
        ? prev.queryTypes.filter(t => t !== type)
        : [...prev.queryTypes, type]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.businessName || !formData.businessUrl) {
      setError("Please fill in business name and URL");
      return;
    }

    if (formData.aiEngines.length === 0) {
      setError("Please select at least one AI engine");
      return;
    }

    if (formData.queryTypes.length === 0) {
      setError("Please select at least one query type");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/deep-dive/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request");
      }

      const data = await response.json();

      // Redirect to tracking page with the new ID and success flag
      router.push(`/deep-dive/track?id=${data.request.id}&from=submit`);
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Failed to submit request. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          AI Visibility Deep Dive
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Get comprehensive competitive intelligence on how your business appears across AI platforms
        </p>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-slate-300 mb-2">
              Business Name *
            </label>
            <input
              id="businessName"
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="Enter your business name"
            />
          </div>

          {/* Business URL */}
          <div>
            <label htmlFor="businessUrl" className="block text-sm font-medium text-slate-300 mb-2">
              Business URL *
            </label>
            <input
              id="businessUrl"
              type="url"
              required
              value={formData.businessUrl}
              onChange={(e) => setFormData({ ...formData, businessUrl: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* AI Engines */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select AI Engines *
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Choose which AI platforms to analyze. Queries will be run on each selected platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiEngineOptions.map((engine) => {
                const isSelected = formData.aiEngines.includes(engine.id);
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => handleToggleEngine(engine.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{engine.name}</span>
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Query Count */}
          <div>
            <label htmlFor="queryCount" className="block text-sm font-medium text-slate-300 mb-2">
              Total Number of Queries *
            </label>
            <p className="text-xs text-slate-400 mb-3">
              This is the total number of queries across ALL selected AI engines and query types.
              <br />
              Example: 100 queries = 100 total queries distributed across your selections.
            </p>
            <input
              id="queryCount"
              type="number"
              min="10"
              max="500"
              required
              value={formData.queryCount}
              onChange={(e) => setFormData({ ...formData, queryCount: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <p className="text-xs text-slate-500 mt-2">💡 Recommended: 50-100 queries for comprehensive analysis</p>
          </div>

          {/* Query Types */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Query Types *
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Select which types of queries to include. Queries will be split across selected types.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["consumer", "business"].map((type) => {
                const isSelected = formData.queryTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleToggleQueryType(type)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white capitalize">{type} Queries</span>
                        <p className="text-xs text-slate-400 mt-1">
                          {type === "consumer" ? "Customer perspective searches" : "B2B and industry research"}
                        </p>
                      </div>
                      {isSelected && <CheckCircle className="w-5 h-5 text-blue-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary Box */}
          {formData.aiEngines.length > 0 && formData.queryTypes.length > 0 && (
            <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">Your Request Summary:</h3>
              <ul className="text-xs text-slate-300 space-y-1">
                <li>
                  <strong>{formData.queryCount} total queries</strong> across{" "}
                  <strong>{formData.aiEngines.length} AI platform{formData.aiEngines.length > 1 ? "s" : ""}</strong>
                </li>
                <li>
                  Query types: <strong>{formData.queryTypes.join(" & ")}</strong>
                </li>
                <li>
                  AI Platforms: <strong>{formData.aiEngines.map(id =>
                    aiEngineOptions.find(e => e.id === id)?.name.split(" ")[0]
                  ).join(", ")}</strong>
                </li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting Request..." : "Submit Deep Dive Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
