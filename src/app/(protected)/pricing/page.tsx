"use client";

import { useSession } from "next-auth/react";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: Sparkles,
    iconColor: "text-blue-400",
    bgGradient: "from-blue-500/20 to-blue-600/20",
    borderColor: "border-blue-500/20",
    features: [
      "5 tests per month",
      "10 queries per test",
      "Track up to 3 competitors",
      "Basic reports",
      "Competitor analysis",
      "Email support",
    ],
    cta: "Current Plan",
    current: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    icon: Zap,
    iconColor: "text-purple-400",
    bgGradient: "from-purple-500/20 to-purple-600/20",
    borderColor: "border-purple-500/20",
    recommended: true,
    features: [
      "50 tests per month",
      "50 queries per test",
      "Track up to 10 competitors",
      "Advanced analytics",
      "Custom query types",
      "Priority support",
      "Export reports (CSV, PDF)",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    icon: Crown,
    iconColor: "text-yellow-400",
    bgGradient: "from-yellow-500/20 to-yellow-600/20",
    borderColor: "border-yellow-500/20",
    features: [
      "Unlimited tests",
      "Unlimited queries",
      "Unlimited competitors",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Team collaboration",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const userTier = session?.user?.subscriptionTier || "free";
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const handleUpgrade = async (tierName: string) => {
    if (tierName === "Pro") {
      setUpgrading("pro");
      try {
        const response = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: "pro" }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          console.error("Failed to create checkout session");
          setUpgrading(null);
        }
      } catch (error) {
        console.error("Error creating checkout:", error);
        setUpgrading(null);
      }
    } else if (tierName === "Enterprise") {
      window.location.href = "mailto:sales@example.com?subject=Enterprise Plan Inquiry";
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Choose Your Plan
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Scale your AI visibility testing as you grow
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isCurrent = userTier === tier.name.toLowerCase();

          return (
            <div
              key={tier.name}
              className={`relative backdrop-blur-xl bg-white/5 border ${
                tier.recommended
                  ? "border-purple-500/50 shadow-lg shadow-purple-500/20"
                  : "border-white/10"
              } rounded-2xl p-6 md:p-8 transition-all hover:border-white/20 ${
                tier.recommended ? "md:scale-105" : ""
              }`}
            >
              {/* Recommended Badge */}
              {tier.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    RECOMMENDED
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tier.bgGradient} border ${tier.borderColor} mb-6`}>
                <Icon className={`w-6 h-6 ${tier.iconColor}`} />
              </div>

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-slate-400">
                      {tier.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(tier.name)}
                disabled={isCurrent || upgrading === tier.name.toLowerCase()}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                  isCurrent || upgrading === tier.name.toLowerCase()
                    ? "bg-white/10 text-slate-400 cursor-not-allowed"
                    : tier.recommended
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                    : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {upgrading === tier.name.toLowerCase()
                  ? "Redirecting..."
                  : isCurrent
                  ? "Current Plan"
                  : tier.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-4">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-white mb-1">
              Can I upgrade or downgrade anytime?
            </h4>
            <p className="text-slate-400">
              Yes! You can change your plan at any time. Upgrades take effect
              immediately, and downgrades take effect at the end of your current
              billing cycle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">
              What happens if I exceed my tier limits?
            </h4>
            <p className="text-slate-400">
              You'll be prompted to upgrade to continue running tests. Your
              existing reports and data will remain accessible.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">
              Do you offer refunds?
            </h4>
            <p className="text-slate-400">
              We offer a 14-day money-back guarantee for Pro plans. Enterprise
              plans have custom terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
