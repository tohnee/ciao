# Marketplace Subscription Platform Design

**Date:** 2026-05-03
**Status:** Approved
**Project:** CIAO — Intent-driven AI Agent System

## Overview

Transform the existing Buy/Sell marketplace pages (v0.1 skeleton) into a full subscription-based platform where users can publish AI agents, earn passive income through subscriptions, and discover/rent agents from the community. Payments use a platform credit system ("Credits") at launch, with fiat top-up (Stripe/PayPal/Alipay/WeChat) deferred to a later phase.

## Core Principles

- **Credit-first:** All transactions happen in platform credits. Fiat integration is later.
- **Subscription-only:** Agents are rented (weekly/monthly), never bought outright.
- **Tiered commission:** Platform fee decreases as author reputation grows.
- **Double-entry ledger:** Every credit movement is auditable.
- **Existing patterns:** Follows monorepo structure, Prisma schemas, Next.js API routes.

---

## 1. Data Model (Prisma)

### 1.1 CreditAccount

```prisma
model CreditAccount {
  id          String   @id @default(cuid())
  workspaceId String   @unique
  balance     Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace Workspace    @relation(fields: [workspaceId], references: [id])
  entries   CreditEntry[]
}
```

### 1.2 CreditEntry

```prisma
enum CreditEntryType { CREDIT DEBIT }

model CreditEntry {
  id            String          @id @default(cuid())
  accountId     String
  amount        Int
  balanceBefore Int
  balanceAfter  Int
  type          CreditEntryType
  referenceType String? // "subscription" | "referral" | "reward" | "topup" | "payout" | "template_sale" | "fee"
  referenceId   String?
  description   String?
  createdAt     DateTime        @default(now())

  account CreditAccount @relation(fields: [accountId], references: [id])
  @@index([accountId, createdAt])
}
```

### 1.3 Subscription

```prisma
enum SubscriptionPlan { WEEKLY MONTHLY }
enum SubscriptionStatus { ACTIVE EXPIRED CANCELLED PAST_DUE }

model Subscription {
  id                    String             @id @default(cuid())
  subscriberWorkspaceId String
  authorWorkspaceId     String
  listingId             String
  plan                  SubscriptionPlan
  status                SubscriptionStatus
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  autoRenew             Boolean            @default(true)
  priceAtSubscription   Int
  platformFeePercent    Float
  cancelledAt           DateTime?
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  listing MarketplaceListing @relation(fields: [listingId], references: [id])
  @@index([subscriberWorkspaceId, status])
  @@index([authorWorkspaceId, status])
}
```

### 1.4 AuthorProfile

```prisma
enum AuthorTier { BRONZE SILVER GOLD PLATINUM }

model AuthorProfile {
  id              String     @id @default(cuid())
  workspaceId     String     @unique
  tier            AuthorTier @default(BRONZE)
  totalEarned     Int        @default(0)
  totalSubscribers Int       @default(0)
  rating          Float      @default(0)
  ratingCount     Int        @default(0)
  commissionRate  Float      @default(0.20)
  joinedAt        DateTime   @default(now())
  lastPayoutAt    DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id])
}
```

### 1.5 Referral

```prisma
enum ReferralStatus { PENDING ACTIVE COMPLETED EXPIRED }

model Referral {
  id                  String         @id @default(cuid())
  referrerWorkspaceId String
  refereeWorkspaceId  String         @unique
  code                String         @unique
  status              ReferralStatus @default(PENDING)
  rewardCredits       Int            @default(0)
  expiresAt           DateTime?
  createdAt           DateTime       @default(now())

  @@index([referrerWorkspaceId])
}
```

### 1.6 MarketplaceListing (Extended Fields)

```prisma
// New fields on existing MarketplaceListing:
// weeklyPrice    Int?
// monthlyPrice   Int?
// status         ListingStatus @default(ACTIVE)
// totalSubscribers Int @default(0)
// totalEarned    Int @default(0)
// tags           String? // JSON array

enum ListingStatus { ACTIVE UNLISTED }
```

### 1.7 MarketplaceReview

```prisma
model MarketplaceReview {
  id                  String   @id @default(cuid())
  listingId           String
  reviewerWorkspaceId String
  rating              Int
  text                String?
  createdAt           DateTime @default(now())

  listing MarketplaceListing @relation(fields: [listingId], references: [id])
  @@unique([listingId, reviewerWorkspaceId])
}
```

---

## 2. Package: `packages/payments/`

```
packages/payments/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Public API
│   ├── credit-ledger.ts      # Balance, add, deduct, history
│   ├── subscription.ts       # CRUD, renew, expire, auto-renew cron
│   ├── author-profile.ts     # Tier recalc, earnings stats
│   ├── referral.ts           # Code gen, apply, reward
│   ├── commission.ts         # Fee calculation per tier
│   ├── pricing.ts            # Price validation
│   └── types.ts
```

### Key Functions

```ts
// credit-ledger.ts
addCredits(workspaceId, amount, type, refType?, refId?, desc?): CreditEntry
deductCredits(workspaceId, amount, type, refType?, refId?, desc?): CreditEntry
getBalance(workspaceId): number
getHistory(workspaceId, limit?, offset?): CreditEntry[]

// subscription.ts
subscribe(subscriberId, authorId, listingId, plan): Subscription
renew(subscriptionId): Subscription
cancel(subscriptionId): Subscription
processRenewals(): void
getMySubscriptions(workspaceId): Subscription[]
getMySubscribers(workspaceId): Subscription[]

// author-profile.ts
recalculateTier(workspaceId): AuthorTier
getStats(workspaceId): AuthorStats

// commission.ts
calculateFee(amount, tier): number
getRate(tier): number

// referral.ts
generateCode(workspaceId): string
applyReferral(code, newWorkspaceId): Referral
rewardReferrer(referralId, amount): void
```

---

## 3. API Routes

### 3.1 Marketplace (Modified)

| Method | Route | Change |
|---|---|---|
| GET | `/api/marketplace` | Include `weeklyPrice`, `monthlyPrice`, `tags`, `totalSubscribers`. Support `?sort=` & `?tag=` |
| POST | `/api/marketplace` | Accept subscription pricing fields. Upsert AuthorProfile |
| GET | `/api/marketplace/[id]` | Full detail with reviews, author info |
| PATCH | `/api/marketplace/[id]` | Edit listing (price frozen for existing subs) |
| DELETE | `/api/marketplace/[id]` | Unlist (soft delete, existing subs continue) |

### 3.2 Subscriptions

| Method | Route | Description |
|---|---|---|
| GET | `/api/subscriptions` | List user's active subscriptions |
| POST | `/api/subscriptions` | Subscribe (deduct credits, create subscription) |
| DELETE | `/api/subscriptions/[id]` | Cancel subscription |
| POST | `/api/subscriptions/[id]/renew` | Manually renew expired subscription |

### 3.3 Credits

| Method | Route | Description |
|---|---|---|
| GET | `/api/credits/balance` | Current balance |
| GET | `/api/credits/transactions` | Paginated history |
| POST | `/api/credits/topup` | Admin top-up (placeholder) |

### 3.4 Author

| Method | Route | Description |
|---|---|---|
| GET | `/api/author/stats` | Income dashboard |
| GET/PATCH | `/api/author/profile` | Profile, tier info |

### 3.5 Referrals

| Method | Route | Description |
|---|---|---|
| GET | `/api/referrals/code` | Get/generate referral link |
| GET | `/api/referrals` | List referral earnings |

### 3.6 Reviews

| Method | Route | Description |
|---|---|---|
| GET | `/api/marketplace/[id]/reviews` | List reviews |
| POST | `/api/marketplace/[id]/reviews` | Submit review |

---

## 4. UI Pages

### 4.1 `/buy` (Revised)
- Redesigned listing cards: subscription pricing, rating stars, author info, subscriber count
- Search + sort + tag filters
- Subscribe button per card
- "My Subscriptions" tab in nav

### 4.2 `/sell` (Revised)
Three-tab layout:
- **My Agents** — published agents with subscriber count, earnings, [Edit]/[Unlist]
- **Income** — dashboard with totals, trends, recent transactions
- **Payout** — placeholder for future fiat payout

### 4.3 `/subscriptions` (New)
List all subscribed agents with status (active/expired/cancelled) and renewal dates.

### 4.4 `/marketplace/[id]` (New detail page)
Screenshots, author info, subscription options, reviews section, subscribe CTA.

---

## 5. Subscription Lifecycle

```
Subscribe → deduct credits → ACTIVE
     │
     ├── Period ends, autoRenew=true
     │   ├── Balance sufficient → renew (deduct) → ACTIVE
     │   └── Insufficient → PAST_DUE (retry 3× → EXPIRE)
     │
     ├── Cancel → CANCELLED (valid until period end)
     │
     └── Period ends, autoRenew=false → EXPIRED
```

## 6. Author Tier Progression

| Tier | Threshold | Platform Fee |
|---|---|---|
| BRONZE | $0 | 20% |
| SILVER | $100 | 15% |
| GOLD | $500 | 12% |
| PLATINUM | $2,000 | 10% |

Downgrade: 30-day grace period after falling below threshold.

## 7. Implementation Order

### Phase 1: Foundation (this sprint)
1. Prisma models + migration
2. `packages/payments/` with ledger, subscription, commission
3. Credit top-up API (admin/manual)
4. Subscribe API (deduct, create subscription)

### Phase 2: UI (this sprint)
1. Revise Buy page (subscription cards, search/sort/tags)
2. Revise Sell page (My Agents / Income tabs)
3. `/subscriptions` page
4. `/marketplace/[id]` detail page
5. Credit balance in header

### Phase 3: Discovery & Incentives (next)
1. Reviews & ratings
2. Referral system
3. Author tier badges
4. Template/skill pack store

### Phase 4: Monetization (future)
1. Stripe fiat top-up
2. PayPal / Alipay / WeChat providers
3. Automated author payouts
4. New-author escrow
