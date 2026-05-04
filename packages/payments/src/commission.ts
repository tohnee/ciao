import type { AuthorTier } from "@prisma/client";

const RATES: Record<AuthorTier, number> = {
  BRONZE: 0.20,
  SILVER: 0.15,
  GOLD: 0.12,
  PLATINUM: 0.10,
};

const TIER_THRESHOLDS: { tier: AuthorTier; minEarnings: number }[] = [
  { tier: "PLATINUM", minEarnings: 2000 },
  { tier: "GOLD", minEarnings: 500 },
  { tier: "SILVER", minEarnings: 100 },
  { tier: "BRONZE", minEarnings: 0 },
];

export function getRate(tier: AuthorTier): number {
  return RATES[tier];
}

export function calculateFee(amount: number, tier: AuthorTier): number {
  return Math.round(amount * RATES[tier]);
}

export function tierFromEarnings(totalEarned: number): AuthorTier {
  for (const t of TIER_THRESHOLDS) {
    if (totalEarned >= t.minEarnings) return t.tier;
  }
  return "BRONZE";
}

export function netAfterFee(amount: number, tier: AuthorTier): number {
  return amount - calculateFee(amount, tier);
}
