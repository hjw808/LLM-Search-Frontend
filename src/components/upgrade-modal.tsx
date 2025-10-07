"use client";

import { Crown, X, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  testsUsed: number;
  maxTests: number;
  tier: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  testsUsed,
  maxTests,
  tier,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="backdrop-blur-xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Upgrade Required
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-300 mb-4">
              You've reached your {tier} tier limit of{" "}
              <span className="font-bold text-white">
                {maxTests} tests per month
              </span>
              .
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Tests Used</span>
                <span className="text-sm font-bold text-white">
                  {testsUsed} / {maxTests}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${(testsUsed / maxTests) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {tier === "free" && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-white mb-3">
                Upgrade to Pro and get:
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>50 tests per month (10x more!)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Custom query types</span>
                </li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all text-center"
            >
              View Pricing Plans
            </Link>
            <button
              onClick={onClose}
              className="w-full bg-white/5 text-slate-300 font-semibold py-3 px-6 rounded-xl hover:bg-white/10 transition-all border border-white/10"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
