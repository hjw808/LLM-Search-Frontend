import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { TIER_LIMITS } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier as "pro" | "enterprise";

        if (!userId || !tier) {
          throw new Error("Missing userId or tier in metadata");
        }

        // Get tier limits
        const limits = TIER_LIMITS[tier];

        // Update user subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: "active",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            maxTestsPerMonth: limits.maxTestsPerMonth,
            subscriptionStartDate: new Date(),
          },
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;

        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionStatus:
              subscription.status === "active" ? "active" : "past_due",
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        // Downgrade to free tier
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            subscriptionTier: "free",
            subscriptionStatus: "cancelled",
            maxTestsPerMonth: TIER_LIMITS.free.maxTestsPerMonth,
            stripeSubscriptionId: null,
          },
        });

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
