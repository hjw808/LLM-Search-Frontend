import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionTier?: string;
      subscriptionStatus?: string;
      testsRunThisMonth?: number;
      maxTestsPerMonth?: number;
      onboardingCompleted?: boolean;
      businessName?: string | null;
    };
  }

  interface User {
    id: string;
    subscriptionTier?: string;
    subscriptionStatus?: string;
    testsRunThisMonth?: number;
    maxTestsPerMonth?: number;
    onboardingCompleted?: boolean;
    businessName?: string | null;
  }
}
