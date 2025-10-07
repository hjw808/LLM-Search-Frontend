export const TIER_LIMITS = {
  free: {
    maxTestsPerMonth: 5,
    maxQueriesPerTest: 10,
    maxCompetitors: 3,
    features: {
      basicReports: true,
      competitorAnalysis: true,
      advancedAnalytics: false,
      apiAccess: false,
      prioritySupport: false,
      customQueries: false,
    },
  },
  pro: {
    maxTestsPerMonth: 50,
    maxQueriesPerTest: 50,
    maxCompetitors: 10,
    features: {
      basicReports: true,
      competitorAnalysis: true,
      advancedAnalytics: true,
      apiAccess: false,
      prioritySupport: true,
      customQueries: true,
    },
  },
  enterprise: {
    maxTestsPerMonth: -1, // Unlimited
    maxQueriesPerTest: -1, // Unlimited
    maxCompetitors: -1, // Unlimited
    features: {
      basicReports: true,
      competitorAnalysis: true,
      advancedAnalytics: true,
      apiAccess: true,
      prioritySupport: true,
      customQueries: true,
    },
  },
};

export type SubscriptionTier = keyof typeof TIER_LIMITS;

export function getTierLimits(tier: string) {
  return TIER_LIMITS[tier as SubscriptionTier] || TIER_LIMITS.free;
}

export function canRunTest(
  testsRunThisMonth: number,
  tier: string
): { allowed: boolean; reason?: string } {
  const limits = getTierLimits(tier);

  if (limits.maxTestsPerMonth === -1) {
    return { allowed: true };
  }

  if (testsRunThisMonth >= limits.maxTestsPerMonth) {
    return {
      allowed: false,
      reason: `You've reached your ${tier} tier limit of ${limits.maxTestsPerMonth} tests per month`,
    };
  }

  return { allowed: true };
}

export function getTestsRemaining(
  testsRunThisMonth: number,
  tier: string
): number | "unlimited" {
  const limits = getTierLimits(tier);

  if (limits.maxTestsPerMonth === -1) {
    return "unlimited";
  }

  return Math.max(0, limits.maxTestsPerMonth - testsRunThisMonth);
}

export function getTierPrice(tier: SubscriptionTier): string {
  switch (tier) {
    case "free":
      return "$0";
    case "pro":
      return "$49";
    case "enterprise":
      return "Custom";
    default:
      return "$0";
  }
}

export function getTierName(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
