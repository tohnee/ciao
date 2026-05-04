import type { PrismaClient } from "@prisma/client";

export type PrismaTx = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$use" | "$transaction" | "$extends">;

export interface SubscribeInput {
  subscriberId: string;
  authorId: string;
  listingId: string;
  plan: "WEEKLY" | "MONTHLY";
}

export interface SubscriptionResult {
  subscription: {
    id: string;
    listingId: string;
    plan: "WEEKLY" | "MONTHLY";
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    autoRenew: boolean;
    priceAtSubscription: number;
    platformFeePercent: number;
    createdAt: Date;
  };
  creditUsed: number;
  platformFee: number;
  authorEarned: number;
}

export interface AuthorStats {
  totalEarned: number;
  activeSubscribers: number;
  monthlyIncome: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  rating: number;
  recentTransactions: Array<{
    id: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    type: "CREDIT" | "DEBIT";
    referenceType: string | null;
    description: string | null;
    createdAt: Date;
  }>;
}
