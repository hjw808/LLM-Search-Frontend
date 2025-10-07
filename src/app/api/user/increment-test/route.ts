import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        testsRunThisMonth: {
          increment: 1,
        },
      },
      select: {
        testsRunThisMonth: true,
        maxTestsPerMonth: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      success: true,
      testsRunThisMonth: user.testsRunThisMonth,
      maxTestsPerMonth: user.maxTestsPerMonth,
      tier: user.subscriptionTier,
    });
  } catch (error) {
    console.error("Error incrementing test count:", error);
    return NextResponse.json(
      { error: "Failed to increment test count" },
      { status: 500 }
    );
  }
}
