import type { PrismaTx, AuthorStats } from "./types";
import { tierFromEarnings } from "./commission";
import type { AuthorTier } from "@prisma/client";

export async function getOrCreateProfile(prisma: PrismaTx, workspaceId: string) {
  return prisma.authorProfile.upsert({
    where: { workspaceId },
    create: { workspaceId },
    update: {},
  });
}

export async function recalculateTier(prisma: PrismaTx, workspaceId: string) {
  const profile = await prisma.authorProfile.findUnique({
    where: { workspaceId },
  });
  if (!profile) return null;

  const newTier = tierFromEarnings(profile.totalEarned);
  if (newTier !== profile.tier) {
    return prisma.authorProfile.update({
      where: { workspaceId },
      data: { tier: newTier as AuthorTier },
    });
  }
  return profile;
}

export async function getStats(prisma: PrismaTx, workspaceId: string): Promise<AuthorStats> {
  const profile = await prisma.authorProfile.findUnique({
    where: { workspaceId },
  });

  const activeSubs = await prisma.subscription.count({
    where: { authorWorkspaceId: workspaceId, status: "ACTIVE" },
  });

  const monthlyIncome = activeSubs * 4;

  const recentEntries = await prisma.creditEntry.findMany({
    where: {
      account: { workspaceId },
      referenceType: { in: ["subscription", "subscription_renewal"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    totalEarned: profile?.totalEarned ?? 0,
    activeSubscribers: profile?.totalSubscribers ?? 0,
    monthlyIncome,
    tier: (profile?.tier ?? "BRONZE") as AuthorStats["tier"],
    rating: profile?.rating ?? 0,
    recentTransactions: recentEntries.map((e) => ({
      id: e.id,
      amount: e.amount,
      balanceBefore: e.balanceBefore,
      balanceAfter: e.balanceAfter,
      type: e.amount >= 0 ? "CREDIT" : "DEBIT",
      referenceType: e.referenceType,
      description: e.description,
      createdAt: e.createdAt,
    })),
  };
}
