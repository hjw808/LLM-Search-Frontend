"use client";

import Link from "next/link";
import { Sparkles, Search, TrendingUp, Target, ArrowRight } from "lucide-react";

export default function DeepDivePage() {
  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-75"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          AI Visibility Deep Dive
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-8">
          Get comprehensive competitive intelligence on how your business appears across AI platforms, including extracted queries and strategic recommendations
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/deep-dive/apply"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
          >
            Request Deep Dive
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/deep-dive/track"
            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Track Request
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Competitor Analysis</h3>
          <p className="text-slate-400 text-sm">
            Discover which competitors are being mentioned in AI responses when users search for solutions in your industry
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Search className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Extracted Queries</h3>
          <p className="text-slate-400 text-sm">
            Get access to the actual queries users are asking AI engines in your industry - invaluable market intelligence
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Strategic Recommendations</h3>
          <p className="text-slate-400 text-sm">
            Receive expert advice on how to leverage these insights to improve your AI visibility and market position
          </p>
        </div>
      </div>

      {/* What You Get */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          What's Included in Your Deep Dive
        </h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Comprehensive Competitor Mapping</h4>
              <p className="text-sm text-slate-400">
                Identify all competitors mentioned alongside your business in AI responses
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Your Visibility Metrics</h4>
              <p className="text-sm text-slate-400">
                Detailed breakdown of how often and in what context your business is mentioned
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Extracted User Queries</h4>
              <p className="text-sm text-slate-400">
                Access to real queries from AI platform backends - understand what your market is asking
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-400 font-bold">4</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Actionable Recommendations</h4>
              <p className="text-sm text-slate-400">
                Strategic guidance on optimizing your content and presence for better AI visibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Dive Deep?
        </h2>
        <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
          Submit your deep dive request today and gain insights that will transform your AI visibility strategy
        </p>
        <Link
          href="/deep-dive/apply"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all"
        >
          Get Started Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
