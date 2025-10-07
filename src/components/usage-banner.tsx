"use client";

import { AlertCircle, Crown } from "lucide-react";
import Link from "next/link";

interface UsageBannerProps {
  testsUsed: number;
  maxTests: number;
  tier: string;
}

export function UsageBanner({ testsUsed, maxTests, tier }: UsageBannerProps) {
  const percentage = (testsUsed / maxTests) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = testsUsed >= maxTests;

  if (!isNearLimit) return null;

  return (
    <div
      className={`backdrop-blur-xl border rounded-xl p-4 mb-6 ${
        isAtLimit
          ? "bg-red-500/10 border-red-500/20"
          : "bg-yellow-500/10 border-yellow-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            isAtLimit ? "text-red-400" : "text-yellow-400"
          }`}
        />
        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-sm mb-1 ${
              isAtLimit ? "text-red-300" : "text-yellow-300"
            }`}
          >
            {isAtLimit
              ? "Test Limit Reached"
              : "Approaching Test Limit"}
          </h4>
          <p className="text-xs text-slate-300 mb-3">
            {isAtLimit
              ? `You've used all ${maxTests} tests for this month. Upgrade to continue testing.`
              : `You've used ${testsUsed} of ${maxTests} tests this month.`}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isAtLimit
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-yellow-500 to-yellow-600"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all whitespace-nowrap"
            >
              <Crown className="w-3 h-3" />
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
