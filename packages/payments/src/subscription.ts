import type { PrismaTx, SubscribeInput, SubscriptionResult } from "./types";
import { deductCredits, addCredits } from "./credit-ledger";
import { calculateFee } from "./commission";

function periodEnd(start: Date, plan: "WEEKLY" | "MONTHLY"): Date {
  const end = new Date(start);
  if (plan === "WEEKLY") end.setDate(end.getDate() + 7);
  else end.setMonth(end.getMonth() + 1);
  return end;
}

export async function subscribe(
  prisma: PrismaTx,
  input: SubscribeInput,
): Promise<SubscriptionResult> {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: input.listingId },
    include: { agent: true },
  });
  if (!listing) throw new Error("Listing not found");
  if (listing.agent.workspaceId === input.subscriberId) {
    throw new Error("Cannot subscribe to your own agent");
  }

  const price = input.plan === "WEEKLY"
    ? (listing.weeklyPrice ?? listing.price)
    : (listing.monthlyPrice ?? listing.price * 4);

  const profile = await prisma.authorProfile.findUnique({
    where: { workspaceId: input.authorId },
  });
  const tier = profile?.tier ?? "BRONZE";
  const feeRate = profile?.commissionRate ?? 0.2;
  const platformFee = Math.round(price * feeRate);
  const authorEarned = price - platformFee;

  await deductCredits(
    prisma,
    input.subscriberId,
    price,
    "subscription",
    input.listingId,
    `Subscription to ${listing.agent.name} (${input.plan})`,
  );

  await addCredits(
    prisma,
    input.authorId,
    authorEarned,
    "subscription",
    input.listingId,
    `Earnings from subscription (${input.plan})`,
  );

  const now = new Date();
  const currentPeriodEnd = periodEnd(now, input.plan);

  const subscription = await prisma.subscription.create({
    data: {
      subscriberWorkspaceId: input.subscriberId,
      authorWorkspaceId: input.authorId,
      listingId: input.listingId,
      plan: input.plan,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd,
      autoRenew: true,
      priceAtSubscription: price,
      platformFeePercent: feeRate,
    },
  });

  await prisma.marketplaceListing.update({
    where: { id: input.listingId },
    data: { totalSubscribers: { increment: 1 } },
  });

  await prisma.authorProfile.updateMany({
    where: { workspaceId: input.authorId },
    data: { totalSubscribers: { increment: 1 } },
  });

  return {
    subscription: {
      ...subscription,
      status: subscription.status as SubscriptionResult["subscription"]["status"],
    },
    creditUsed: price,
    platformFee,
    authorEarned,
  };
}

export async function renewSubscription(
  prisma: PrismaTx,
  subscriptionId: string,
) {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { listing: true },
  });
  if (!sub) throw new Error("Subscription not found");
  if (sub.status !== "ACTIVE" && sub.status !== "PAST_DUE") {
    throw new Error(`Cannot renew subscription in status: ${sub.status}`);
  }

  const price = sub.priceAtSubscription;
  const profile = await prisma.authorProfile.findUnique({
    where: { workspaceId: sub.authorWorkspaceId },
  });
  const tier = profile?.tier ?? "BRONZE";
  const feeRate = profile?.commissionRate ?? 0.2;
  const platformFee = Math.round(price * feeRate);
  const authorEarned = price - platformFee;

  try {
    await deductCredits(
      prisma,
      sub.subscriberWorkspaceId,
      price,
      "subscription_renewal",
      sub.id,
      `Auto-renewal of subscription`,
    );
  } catch {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "PAST_DUE" },
    });
    return { status: "PAST_DUE" as const, reason: "insufficient_balance" };
  }

  await addCredits(
    prisma,
    sub.authorWorkspaceId,
    authorEarned,
    "subscription_renewal",
    sub.id,
    `Auto-renewal earnings`,
  );

  const now = new Date();
  const newEnd = periodEnd(now, sub.plan as "WEEKLY" | "MONTHLY");

  return prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: newEnd,
    },
  });
}

export async function cancelSubscription(
  prisma: PrismaTx,
  subscriptionId: string,
) {
  const sub = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!sub) throw new Error("Subscription not found");
  if (sub.status !== "ACTIVE") {
    throw new Error(`Cannot cancel subscription in status: ${sub.status}`);
  }

  return prisma.subscription.update({
    where: { id: sub.id },
    data: {
      autoRenew: false,
      cancelledAt: new Date(),
      status: "CANCELLED",
    },
  });
}

export async function processRenewals(prisma: PrismaTx) {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const dueForRenewal = await prisma.subscription.findMany({
    where: {
      autoRenew: true,
      status: "ACTIVE",
      currentPeriodEnd: { lte: now },
    },
  });

  const results: Array<{ id: string; status: string }> = [];
  for (const sub of dueForRenewal) {
    const result = await renewSubscription(prisma, sub.id);
    results.push({ id: sub.id, status: typeof result === "object" ? result.status : "ACTIVE" });
  }

  await prisma.subscription.updateMany({
    where: {
      status: "PAST_DUE",
      currentPeriodEnd: { lte: threeDaysAgo },
    },
    data: { status: "EXPIRED" },
  });

  return { renewed: results.length, expired: dueForRenewal.length };
}

export async function getMySubscriptions(prisma: PrismaTx, workspaceId: string) {
  return prisma.subscription.findMany({
    where: { subscriberWorkspaceId: workspaceId },
    include: {
      listing: {
        include: {
          agent: { select: { name: true, description: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMySubscribers(prisma: PrismaTx, workspaceId: string) {
  return prisma.subscription.findMany({
    where: { authorWorkspaceId: workspaceId },
    include: {
      listing: {
        include: {
          agent: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
