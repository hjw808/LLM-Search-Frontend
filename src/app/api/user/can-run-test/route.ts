import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRunTest, getTestsRemaining } from "@/lib/subscription";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        testsRunThisMonth: true,
        subscriptionTier: true,
        maxTestsPerMonth: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const canRun = canRunTest(user.testsRunThisMonth, user.subscriptionTier);
    const remaining = getTestsRemaining(
      user.testsRunThisMonth,
      user.subscriptionTier
    );

    return NextResponse.json({
      canRun: canRun.allowed,
      reason: canRun.reason,
      testsRunThisMonth: user.testsRunThisMonth,
      maxTestsPerMonth: user.maxTestsPerMonth,
      testsRemaining: remaining,
      tier: user.subscriptionTier,
    });
  } catch (error) {
    console.error("Error checking test eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
