"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  User,
  Building2,
  CreditCard,
  BarChart3,
  LogOut,
  Crown,
} from "lucide-react";
import { getTierName, getTestsRemaining } from "@/lib/subscription";

export default function AccountPage() {
  const { data: session } = useSession();
  const [usageData, setUsageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch("/api/user/can-run-test");
      if (response.ok) {
        const data = await response.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tierColors = {
    free: "from-blue-500 to-blue-600",
    pro: "from-purple-500 to-purple-600",
    enterprise: "from-yellow-500 to-yellow-600",
  };

  const tier = session?.user?.subscriptionTier || "free";

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Account Settings
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Manage your profile and subscription
        </p>
      </div>

      {/* Profile Section */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-full h-full rounded-full"
              />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white mb-1">
              {session?.user?.name || "User"}
            </h2>
            <p className="text-slate-400 text-sm break-all">
              {session?.user?.email}
            </p>
          </div>
        </div>

        {session?.user?.businessName && (
          <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
            <Building2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Business Name</p>
              <p className="text-sm font-medium text-white">
                {session.user.businessName}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Section */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Subscription</h2>
        </div>

        {/* Current Plan */}
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${tierColors[tier as keyof typeof tierColors]} text-white font-semibold mb-4`}>
            <Crown className="w-4 h-4" />
            {getTierName(tier)} Plan
          </div>
          <p className="text-slate-400 text-sm">
            {tier === "free" && "Start with 5 free tests per month"}
            {tier === "pro" && "Advanced features and 50 tests per month"}
            {tier === "enterprise" && "Unlimited access to all features"}
          </p>
        </div>

        {/* Usage Stats */}
        {!loading && usageData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-slate-400">Tests This Month</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {usageData.testsRunThisMonth}
                <span className="text-sm text-slate-400 font-normal">
                  {" "}/ {usageData.maxTestsPerMonth === -1 ? "∞" : usageData.maxTestsPerMonth}
                </span>
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <p className="text-xs text-slate-400">Tests Remaining</p>
              </div>
              <p className="text-2xl font-bold text-white">
                {usageData.testsRemaining === "unlimited" ? "∞" : usageData.testsRemaining}
              </p>
            </div>
          </div>
        )}

        {/* Upgrade Button */}
        {tier !== "enterprise" && (
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            <Crown className="w-4 h-4" />
            {tier === "free" ? "Upgrade to Pro" : "Upgrade to Enterprise"}
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 font-semibold rounded-xl hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
