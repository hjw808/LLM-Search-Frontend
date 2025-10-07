"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Globe,
  Zap,
  RefreshCw,
  Settings,
  Building2,
  Plus,
  X,
  Save,
  Sparkles,
  FileText,
} from "lucide-react";

interface TestConfig {
  providers: string[];
  queryTypes: string[];
}

interface TestProgress {
  status: "idle" | "running" | "completed" | "error";
  currentProvider?: string;
  currentStep?: string;
  progress: number;
  results?: {
    provider: string;
    queries: number;
    completed: boolean;
    error?: string;
  }[];
}

interface BusinessConfig {
  name: string;
  url: string;
  locationType: "global" | "country" | "country_state" | "country_state_city";
  location: {
    country?: string;
    state?: string;
    city?: string;
  };
  aliases: string[];
  queries: {
    consumer: number;
    business: number;
  };
}

export default function TestPage() {
  const [config, setConfig] = useState<TestConfig>({
    providers: ["claude"],
    queryTypes: ["consumer", "business"],
  });

  const [testProgress, setTestProgress] = useState<TestProgress>({
    status: "idle",
    progress: 0,
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    name: "",
    url: "",
    locationType: "global",
    location: {},
    aliases: [],
    queries: {
      consumer: 10,
      business: 10,
    },
  });

  const [newAlias, setNewAlias] = useState("");
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // New state for query mode and custom queries
  const [queryMode, setQueryMode] = useState<"ai" | "custom">("ai");
  const [customQueries, setCustomQueries] = useState<{
    consumer: string[];
    business: string[];
  }>({
    consumer: [],
    business: [],
  });

  useEffect(() => {
    loadBusinessConfig();
  }, []);

  useEffect(() => {
    // Auto-open config modal if no business config exists
    if (isConfigLoaded && (!businessConfig || !businessConfig.name)) {
      setIsConfigModalOpen(true);
    }
  }, [isConfigLoaded, businessConfig]);

  // Initialize custom queries arrays when business config changes
  useEffect(() => {
    setCustomQueries({
      consumer: Array(businessConfig.queries.consumer).fill(""),
      business: Array(businessConfig.queries.business).fill(""),
    });
  }, [businessConfig.queries.consumer, businessConfig.queries.business]);

  const loadBusinessConfig = async () => {
    try {
      const response = await fetch('/api/config');
      if (response.ok) {
        const data = await response.json();
        // Convert old location format to new format
        if (data.location && typeof data.location === 'string') {
          const parts = data.location.split(',').map((s: string) => s.trim());
          const newConfig = {
            ...data,
            locationType: parts.length === 1 && parts[0] === 'Global' ? 'global' :
                          parts.length === 1 ? 'country' :
                          parts.length === 2 ? 'country_state' : 'country_state_city',
            location: {
              country: parts[0] !== 'Global' ? parts[0] : undefined,
              state: parts[1] || undefined,
              city: parts[2] || undefined,
            }
          };
          setBusinessConfig(newConfig);
        } else {
          setBusinessConfig(data);
        }
      }
    } catch (error) {
      console.error('Failed to load business config:', error);
    } finally {
      setIsConfigLoaded(true);
    }
  };

  const handleSaveConfig = async () => {
    setSaveStatus("saving");
    try {
      // Convert location to string format for backend
      let locationString = "Global";
      if (businessConfig.locationType !== "global") {
        const parts = [];
        if (businessConfig.location.country) parts.push(businessConfig.location.country);
        if (businessConfig.location.state) parts.push(businessConfig.location.state);
        if (businessConfig.location.city) parts.push(businessConfig.location.city);
        locationString = parts.join(', ');
      }

      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...businessConfig,
          location: locationString,
        }),
      });

      if (response.ok) {
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus("idle");
          setIsConfigModalOpen(false);
        }, 1000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const handleAddAlias = () => {
    if (newAlias.trim() && !businessConfig.aliases.includes(newAlias.trim())) {
      setBusinessConfig({
        ...businessConfig,
        aliases: [...businessConfig.aliases, newAlias.trim()],
      });
      setNewAlias("");
    }
  };

  const handleRemoveAlias = (alias: string) => {
    setBusinessConfig({
      ...businessConfig,
      aliases: businessConfig.aliases.filter((a) => a !== alias),
    });
  };

  const handleStartTest = async () => {
    // Validate business configuration
    if (!businessConfig || !businessConfig.name || !businessConfig.url) {
      setTestProgress({
        status: "error",
        progress: 0,
        currentStep: "Please configure your business details first. Click 'Configure Business' above.",
      });
      return;
    }

    // Validate custom queries if in custom mode
    if (queryMode === "custom") {
      const allQueries = [...customQueries.consumer, ...customQueries.business];
      const hasEmptyQueries = allQueries.some(q => !q.trim());

      if (hasEmptyQueries) {
        setTestProgress({
          status: "error",
          progress: 0,
          currentStep: "Please fill in all custom queries before starting the test.",
        });
        return;
      }
    }

    setTestProgress({
      status: "running",
      progress: 50,
      currentStep: "Running test scripts...",
      results: [],
    });

    try {
      const requestBody = {
        providers: config.providers,
        queryTypes: config.queryTypes,
        consumerQueries: businessConfig.queries.consumer,
        businessQueries: businessConfig.queries.business,
        ...(queryMode === "custom" && {
          customQueries: {
            consumer: customQueries.consumer,
            business: customQueries.business,
          },
        }),
      };

      const response = await fetch('/api/test/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to start test');
      }

      const data = await response.json();

      setTestProgress({
        status: "completed",
        progress: 100,
        currentStep: "Test completed successfully",
        results: data.results.map((r: { provider: string; totalQueries?: number; success: boolean; error?: string }) => ({
          provider: r.provider,
          queries: r.totalQueries || 0,
          completed: r.success,
          error: r.error,
        })),
      });

      // Auto-redirect to reports page after 2 seconds
      setTimeout(() => {
        window.location.href = '/reports';
      }, 2000);
    } catch {
      setTestProgress({
        status: "error",
        progress: 0,
        currentStep: "Failed to start test",
      });
    }
  };

  // Removed unused simulateTestProgress function
  /* const simulateTestProgress = () => {
    const providers = config.providers;
    const totalSteps = providers.length * 2; // 2 query types per provider
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;

      const currentProviderIndex = Math.floor((currentStep - 1) / 2);
      const currentProvider = providers[currentProviderIndex];
      const queryType = (currentStep - 1) % 2 === 0 ? "consumer" : "business";

      setTestProgress(prev => ({
        ...prev,
        progress,
        currentProvider,
        currentStep: `Running ${queryType} queries for ${currentProvider}...`,
      }));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setTestProgress({
          status: "completed",
          progress: 100,
          currentStep: "Test completed successfully",
          results: providers.map(provider => ({
            provider,
            queries: (businessConfig?.queries?.consumer || 0) + (businessConfig?.queries?.business || 0),
            completed: true,
          })),
        });
      }
    }, 2000);
  }; */

  const handleStopTest = () => {
    setTestProgress({
      status: "idle",
      progress: 0,
    });
  };

  const handleToggleProvider = (provider: string) => {
    setConfig(prev => {
      const isCurrentlyEnabled = prev.providers.includes(provider);

      if (isCurrentlyEnabled) {
        // Remove provider
        return {
          ...prev,
          providers: prev.providers.filter(p => p !== provider)
        };
      } else {
        // Add provider
        return {
          ...prev,
          providers: [...prev.providers, provider]
        };
      }
    });
  };

  if (!isConfigLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const isRunning = testProgress.status === "running";
  const hasEnabledProviders = config.providers.length > 0;

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      {/* Business Configuration and Provider Selection Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Business Configuration Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="break-words">Business:</span>
              <span className="text-blue-400 break-words">{businessConfig.name || "Not configured"}</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Click to configure your business details
            </p>
          </div>
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium text-xs md:text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[44px]"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configure Business</span>
          </button>
        </div>

        {/* Provider Selection Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-white flex flex-wrap items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span className="break-words">AI Providers:</span>
              <span className="text-purple-400 break-words">{config.providers.length > 0 ? `${config.providers.length} selected` : "None selected"}</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1 break-words">
              {config.providers.length > 0 ? config.providers.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(", ") : "Click to select AI providers for testing"}
            </p>
          </div>
          <button
            onClick={() => setIsProviderModalOpen(true)}
            className="px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium text-xs md:text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 whitespace-nowrap min-w-[44px]"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Configure Providers</span>
          </button>
        </div>
      </div>

      {/* Business Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="backdrop-blur-xl bg-slate-900 border-0 sm:border border-white/10 sm:rounded-2xl overflow-hidden max-w-4xl w-full min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col sm:my-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/95 border-b border-white/10 p-4 md:p-6">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <span className="break-words">Business Configuration</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Configure your business details for AI visibility testing
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleSaveConfig}
                    disabled={saveStatus === "saving"}
                    className={`px-3 md:px-4 py-2 rounded-xl font-medium text-xs md:text-sm transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 ${
                      saveStatus === "saved"
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                    }`}
                  >
                    {saveStatus === "saving" ? (
                      <span className="hidden sm:inline">Saving...</span>
                    ) : saveStatus === "saved" ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {saveStatus === "error" && (
                <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <p className="text-red-400 text-sm">
                      Failed to save configuration. Please try again.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="business-name" className="text-sm font-medium text-slate-300">Business Name</label>
                  <input
                    id="business-name"
                    value={businessConfig.name}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, name: e.target.value })}
                    placeholder="Enter your business name"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="business-url" className="text-sm font-medium text-slate-300">Business URL</label>
                  <input
                    id="business-url"
                    value={businessConfig.url}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, url: e.target.value })}
                    placeholder="https://yourwebsite.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location-type" className="text-sm font-medium text-slate-300">Location Type</label>
                <Select
                  value={businessConfig.locationType}
                  onValueChange={(value: "global" | "country" | "country_state" | "country_state_city") => setBusinessConfig({
                    ...businessConfig,
                    locationType: value,
                    location: {} // Reset location when type changes
                  })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl hover:bg-white/10 focus:ring-2 focus:ring-blue-500/50">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    <SelectItem value="global" className="hover:bg-white/10 focus:bg-white/10">Global</SelectItem>
                    <SelectItem value="country" className="hover:bg-white/10 focus:bg-white/10">Country</SelectItem>
                    <SelectItem value="country_state" className="hover:bg-white/10 focus:bg-white/10">Country & State</SelectItem>
                    <SelectItem value="country_state_city" className="hover:bg-white/10 focus:bg-white/10">Country, State & City</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {businessConfig.locationType !== "global" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="country" className="text-sm font-medium text-slate-300">Country</label>
                    <input
                      id="country"
                      value={businessConfig.location.country || ""}
                      onChange={(e) => setBusinessConfig({
                        ...businessConfig,
                        location: { ...businessConfig.location, country: e.target.value }
                      })}
                      placeholder="e.g., Australia"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    />
                  </div>

                  {(businessConfig.locationType === "country_state" || businessConfig.locationType === "country_state_city") && (
                    <div className="space-y-2">
                      <label htmlFor="state" className="text-sm font-medium text-slate-300">State/Province</label>
                      <input
                        id="state"
                        value={businessConfig.location.state || ""}
                        onChange={(e) => setBusinessConfig({
                          ...businessConfig,
                          location: { ...businessConfig.location, state: e.target.value }
                        })}
                        placeholder="e.g., Queensland"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  )}

                  {businessConfig.locationType === "country_state_city" && (
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-slate-300">City</label>
                      <input
                        id="city"
                        value={businessConfig.location.city || ""}
                        onChange={(e) => setBusinessConfig({
                          ...businessConfig,
                          location: { ...businessConfig.location, city: e.target.value }
                        })}
                        placeholder="e.g., Brisbane"
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Business Aliases</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={newAlias}
                    onChange={(e) => setNewAlias(e.target.value)}
                    placeholder="Add an alias"
                    onKeyDown={(e) => e.key === "Enter" && handleAddAlias()}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <button
                    onClick={handleAddAlias}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {businessConfig.aliases.map((alias) => (
                    <span
                      key={alias}
                      className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-sm flex items-center gap-2"
                    >
                      {alias}
                      <button
                        onClick={() => handleRemoveAlias(alias)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="consumer-queries" className="text-xs md:text-sm font-medium text-slate-300">Consumer Queries</label>
                  <input
                    id="consumer-queries"
                    type="number"
                    min="1"
                    max="50"
                    value={businessConfig.queries.consumer}
                    onChange={(e) =>
                      setBusinessConfig({
                        ...businessConfig,
                        queries: { ...businessConfig.queries, consumer: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <p className="text-xs text-slate-500">
                    Queries from customer perspective
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="business-queries" className="text-sm font-medium text-slate-300">Business Queries</label>
                  <input
                    id="business-queries"
                    type="number"
                    min="1"
                    max="50"
                    value={businessConfig.queries.business}
                    onChange={(e) =>
                      setBusinessConfig({
                        ...businessConfig,
                        queries: { ...businessConfig.queries, business: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                  <p className="text-xs text-slate-500">
                    B2B and research queries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provider Selection Modal */}
      {isProviderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="backdrop-blur-xl bg-slate-900 border-0 sm:border border-white/10 sm:rounded-2xl overflow-hidden max-w-4xl w-full min-h-screen sm:min-h-0 sm:max-h-[90vh] flex flex-col sm:my-8">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/95 border-b border-white/10 p-4 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
                    <span className="break-words">Provider Selection</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Select which AI providers to use for testing
                  </p>
                </div>
                <button
                  onClick={() => setIsProviderModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["openai", "claude", "gemini", "copilot"].map((provider) => {
                  const isEnabled = config.providers.includes(provider);

                  // Display names for providers
                  const displayNames: { [key: string]: string } = {
                    openai: "OpenAI",
                    claude: "Claude",
                    gemini: "Google Gemini",
                    copilot: "Microsoft Copilot"
                  };

                  return (
                    <div key={provider} className={`p-4 rounded-xl border transition-all ${
                      isEnabled
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                        : "bg-white/5 border-white/10"
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isEnabled
                              ? "bg-gradient-to-br from-blue-500 to-purple-600"
                              : "bg-white/5"
                          }`}>
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-white">{displayNames[provider]}</span>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={() => handleToggleProvider(provider)}
                          disabled={isRunning}
                          className="data-[state=checked]:bg-blue-500"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Status</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          isEnabled
                            ? "bg-green-500/20 text-green-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}>
                          {isEnabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Execution */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Test Execution
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Review your configuration and run AI visibility tests
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Query Mode Selection */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Query Mode</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setQueryMode("ai")}
                className={`p-4 rounded-xl border transition-all text-left ${
                  queryMode === "ai"
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">AI-Generated Queries</span>
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">Recommended</span>
                </div>
                <p className="text-xs text-slate-400">
                  Let AI automatically generate queries based on your business (Best for most users)
                </p>
              </button>

              <button
                onClick={() => setQueryMode("custom")}
                className={`p-4 rounded-xl border transition-all text-left ${
                  queryMode === "custom"
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Write My Own Queries</span>
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full font-medium">Advanced</span>
                </div>
                <p className="text-xs text-slate-400">
                  Manually write specific queries to test (Use when you have specific questions in mind)
                </p>
              </button>
            </div>
          </div>

          {/* Custom Query Textareas */}
          {queryMode === "custom" && (
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-300">
                  Write {businessConfig.queries.consumer} consumer queries and {businessConfig.queries.business} business queries below.
                </p>
              </div>

              {/* Consumer Queries */}
              {businessConfig.queries.consumer > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">
                    Consumer Queries ({businessConfig.queries.consumer})
                  </h5>
                  <div className="space-y-3">
                    {Array.from({ length: businessConfig.queries.consumer }).map((_, index) => (
                      <div key={`consumer-${index}`}>
                        <label htmlFor={`consumer-query-${index}`} className="text-xs text-slate-400 mb-1 block">
                          Consumer Query {index + 1}
                        </label>
                        <textarea
                          id={`consumer-query-${index}`}
                          value={customQueries.consumer[index] || ""}
                          onChange={(e) => {
                            const newConsumerQueries = [...customQueries.consumer];
                            newConsumerQueries[index] = e.target.value;
                            setCustomQueries({
                              ...customQueries,
                              consumer: newConsumerQueries,
                            });
                          }}
                          placeholder={`Enter consumer query ${index + 1}...`}
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Queries */}
              {businessConfig.queries.business > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-slate-300 mb-3">
                    Business Queries ({businessConfig.queries.business})
                  </h5>
                  <div className="space-y-3">
                    {Array.from({ length: businessConfig.queries.business }).map((_, index) => (
                      <div key={`business-${index}`}>
                        <label htmlFor={`business-query-${index}`} className="text-xs text-slate-400 mb-1 block">
                          Business Query {index + 1}
                        </label>
                        <textarea
                          id={`business-query-${index}`}
                          value={customQueries.business[index] || ""}
                          onChange={(e) => {
                            const newBusinessQueries = [...customQueries.business];
                            newBusinessQueries[index] = e.target.value;
                            setCustomQueries({
                              ...customQueries,
                              business: newBusinessQueries,
                            });
                          }}
                          placeholder={`Enter business query ${index + 1}...`}
                          rows={2}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Summary */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Test Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">Business</p>
                <p className="text-lg font-bold text-white">{businessConfig?.name || "Not configured"}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">Total Queries</p>
                <p className="text-lg font-bold text-white">{businessConfig.queries.consumer + businessConfig.queries.business}</p>
                <p className="text-xs text-slate-500 mt-1">{businessConfig.queries.consumer} consumer + {businessConfig.queries.business} business</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-1">AI Providers</p>
                <p className="text-lg font-bold text-white">{config.providers.length}</p>
                <p className="text-xs text-slate-500 mt-1">{config.providers.length === 0 ? "None selected" : "selected"}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10"></div>

          {/* Test Controls */}
          <div>
          {testProgress.status === "idle" && (
            <div className="flex items-center gap-4">
              <button
                onClick={handleStartTest}
                disabled={!hasEnabledProviders}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  hasEnabledProviders
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50"
                    : "bg-white/5 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Play className="w-4 h-4" />
                Start Test
              </button>
              {!hasEnabledProviders && (
                <p className="text-sm text-slate-400">
                  Enable at least one provider to run tests
                </p>
              )}
            </div>
          )}

          {testProgress.status === "running" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span className="text-sm font-medium text-white">Test in Progress</span>
                </div>
                <button
                  onClick={handleStopTest}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Stop Test
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{testProgress.currentStep}</span>
                  <span className="text-white font-medium">{Math.round(testProgress.progress)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${testProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {testProgress.status === "completed" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Test Completed Successfully</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testProgress.results?.map((result) => (
                  <div key={result.provider} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize text-white">{result.provider}</span>
                      {result.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {result.queries} queries generated
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartTest}
                  className="px-6 py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Run Another Test
                </button>
                <a
                  href="/reports"
                  className="px-6 py-3 rounded-xl font-medium text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                >
                  View Results
                </a>
              </div>
            </div>
          )}

          {testProgress.status === "error" && (
            <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="text-red-400 text-sm">
                  {testProgress.currentStep}
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}