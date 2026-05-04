export interface MarketplaceListing {
  id: string;
  agentId: string;
  price: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  description: string;
  rating: number;
  downloads: number;
  featured: boolean;
  status: "ACTIVE" | "UNLISTED";
  totalSubscribers: number;
  totalEarned: number;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceListingCard {
  id: string;
  agentId: string;
  agentName: string;
  agentDescription: string | null;
  agentAvatarUrl: string | null;
  price: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  rating: number;
  downloads: number;
  featured: boolean;
  totalSubscribers: number;
  tags: string | null;
  authorTier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | null;
}

export interface CreateListingInput {
  price: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  description: string;
  tags?: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  status: "pending" | "completed" | "refunded";
  createdAt: string;
  completedAt: string | null;
}

export interface SubscriptionInfo {
  id: string;
  listingId: string;
  agentName: string;
  agentDescription: string | null;
  authorName: string;
  plan: "WEEKLY" | "MONTHLY";
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PAST_DUE";
  priceAtSubscription: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  cancelledAt: string | null;
  createdAt: string;
}

export interface MarketplaceReviewInfo {
  id: string;
  listingId: string;
  reviewerName: string | null;
  rating: number;
  text: string | null;
  createdAt: string;
}

export interface AuthorProfileInfo {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  totalEarned: number;
  totalSubscribers: number;
  rating: number;
  ratingCount: number;
  commissionRate: number;
  displayName: string | null;
  bio: string | null;
}

export interface AuthorStats {
  totalEarned: number;
  activeSubscribers: number;
  monthlyIncome: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  rating: number;
  recentTransactions: CreditEntryInfo[];
}

export interface CreditEntryInfo {
  id: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: "CREDIT" | "DEBIT";
  referenceType: string | null;
  description: string | null;
  createdAt: string;
}

export interface SubscribeInput {
  listingId: string;
  plan: "WEEKLY" | "MONTHLY";
}

export interface SubscriptionResult {
  subscription: SubscriptionInfo;
  creditUsed: number;
  platformFee: number;
  authorEarned: number;
}
