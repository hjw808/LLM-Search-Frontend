import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Add custom user fields to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionTier: true,
            subscriptionStatus: true,
            testsRunThisMonth: true,
            maxTestsPerMonth: true,
            onboardingCompleted: true,
            businessName: true,
          },
        });
        if (dbUser) {
          session.user.subscriptionTier = dbUser.subscriptionTier;
          session.user.subscriptionStatus = dbUser.subscriptionStatus;
          session.user.testsRunThisMonth = dbUser.testsRunThisMonth;
          session.user.maxTestsPerMonth = dbUser.maxTestsPerMonth;
          session.user.onboardingCompleted = dbUser.onboardingCompleted;
          session.user.businessName = dbUser.businessName;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
      });

      // If new user, set up Free tier defaults
      if (!existingUser && user.email) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            subscriptionTier: "free",
            subscriptionStatus: "active",
            maxTestsPerMonth: 5,
            testsRunThisMonth: 0,
            onboardingCompleted: false,
          },
        });
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};
