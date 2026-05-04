# Implementation Plan: Marketplace Subscription Platform

**Date:** 2026-05-03
**Based on:** `docs/superpowers/specs/2026-05-03-marketplace-subscription-platform-design.md`

## Overview

Two phases this sprint: Phase 1 (Foundation — data model + payments package + API) and Phase 2 (UI — revised Sell/Buy pages + subscription management). Phase 3 (discovery) and Phase 4 (fiat) are deferred.

---

## Phase 1: Foundation

### 1.1 Prisma Schema

**File:** `apps/web/prisma/schema.prisma`

Add models:
- `CreditAccount` — `id`, `workspaceId` (unique, FK → Workspace), `balance`, `createdAt`, `updatedAt`
- `CreditEntry` — `id`, `accountId` (FK), `amount`, `balanceBefore`, `balanceAfter`, `type` (CREDIT/DEBIT), `referenceType?`, `referenceId?`, `description?`, `createdAt`
- `Subscription` — `id`, `subscriberWorkspaceId`, `authorWorkspaceId`, `listingId`, `plan` (WEEKLY/MONTHLY), `status` (ACTIVE/EXPIRED/CANCELLED/PAST_DUE), `currentPeriodStart`, `currentPeriodEnd`, `autoRenew`, `priceAtSubscription`, `platformFeePercent`, `cancelledAt?`, `createdAt`, `updatedAt`
- `AuthorProfile` — `id`, `workspaceId` (unique), `tier` (BRONZE/SILVER/GOLD/PLATINUM), `totalEarned`, `totalSubscribers`, `rating`, `ratingCount`, `commissionRate`, `joinedAt`, `lastPayoutAt?`
- `MarketplaceReview` — `id`, `listingId`, `reviewerWorkspaceId`, `rating` (1-5), `text?`, `createdAt`, unique constraint on `[listingId, reviewerWorkspaceId]`

Extend `MarketplaceListing`:
- Add `weeklyPrice Int?`, `monthlyPrice Int?`, `status ListingStatus @default(ACTIVE)`, `totalSubscribers Int @default(0)`, `totalEarned Int @default(0)`, `tags String?`
- Add `ListingStatus` enum: `ACTIVE`, `UNLISTED`

Also add `creditAccount` relation to `Workspace` model.

**Migration:**
```sh
cd apps/web && npx prisma migrate dev --name add-marketplace-subscription-models
```

### 1.2 Package: `packages/payments/`

**Scaffold:**
```
packages/payments/
├── package.json          # name: "@ciao/payments", main: "./src/index.ts", types: "./src/index.ts"
├── tsconfig.json         # extends root tsconfig
├── src/
│   ├── index.ts
│   ├── credit-ledger.ts
│   ├── subscription.ts
│   ├── author-profile.ts
│   ├── referral.ts
│   ├── commission.ts
│   └── types.ts
```

Update root `package.json` or turbo.json to include `packages/payments` in workspaces.

**`src/credit-ledger.ts`:**
```ts
export function addCredits(prisma, workspaceId, amount, type, refType?, refId?, desc?)
export function deductCredits(prisma, workspaceId, amount, type, refType?, refId?, desc?)
export function getBalance(prisma, workspaceId): Promise<number>
export function getHistory(prisma, workspaceId, limit?, offset?)
```
- `addCredits`/`deductCredits` do UPSERT on `CreditAccount` then INSERT `CreditEntry`
- `deductCredits` throws if insufficient balance
- All functions take `prisma` as first param (DI-friendly)

**`src/subscription.ts`:**
```ts
export async function subscribe(prisma, { subscriberId, authorId, listingId, plan })
export async function renewSubscription(prisma, subscriptionId)
export async function cancelSubscription(prisma, subscriptionId)
export async function processRenewals(prisma)  // cron: find period-ended subs
export async function getMySubscriptions(prisma, workspaceId)
export async function getMySubscribers(prisma, workspaceId)
```
- `subscribe` validates price, calls `deductCredits`, creates `Subscription`, adds credits to author, deducts fee
- `renewSubscription` checks balance, calls `deductCredits`/`addCredits`
- `processRenewals`: auto-renew if balance sufficient, PAST_DUE if not (retry up to 3 days)

**`src/author-profile.ts`:**
```ts
export function getOrCreateProfile(prisma, workspaceId)
export function recalculateTier(prisma, workspaceId)
export function getStats(prisma, workspaceId)
```
- Tier thresholds: BRONZE=0, SILVER=100, GOLD=500, PLATINUM=2000 (in dollars/credits)

**`src/commission.ts`:**
```ts
export function calculateFee(amount: number, tier: AuthorTier): number
export function getRate(tier: AuthorTier): number
```
- BRONZE=0.20, SILVER=0.15, GOLD=0.12, PLATINUM=0.10

**`src/referral.ts`:**
```ts
export function generateCode(prisma, workspaceId)
export function applyReferral(prisma, code, newWorkspaceId)
export function rewardReferrer(prisma, referralId, amount)
```

**`src/types.ts`:**
```ts
export type SubscribeInput = { subscriberId, authorId, listingId, plan }
export type SubscriptionResult = { subscription, creditUsed, platformFee, authorEarned }
export type AuthorStats = { totalEarned, activeSubscribers, monthlyIncome, tier, rating }
export type CreditEntryResult = { id, amount, balanceBefore, balanceAfter, type, referenceType, description, createdAt }
```

### 1.3 API Routes

#### `/api/credits/balance` — GET
- Returns `{ balance: number }`
- Uses `getBalance(prisma, workspaceId)`

#### `/api/credits/transactions` — GET
- Returns `{ transactions: CreditEntry[], total: number }`
- Support `?limit=20&offset=0`

#### `/api/credits/topup` — POST
- Body: `{ amount: number, description?: string }`
- Calls `addCredits(prisma, workspaceId, amount, 'CREDIT', 'topup')`
- Returns `{ entry, balance }`

#### `/api/subscriptions` — GET
- Returns `{ subscriptions: Subscription[] }` for current user
- Include listing info (agent name, price)

#### `/api/subscriptions` — POST
- Body: `{ listingId: string, plan: "weekly"|"monthly" }`
- Calls `subscribe()` from payments package
- Returns the subscription result

#### `/api/subscriptions/[id]` — DELETE
- Cancel subscription
- Returns `{ subscription }`

#### `/api/subscriptions/[id]/renew` — POST
- Manually renew an expired subscription
- Calls `renewSubscription()`

#### `/api/author/stats` — GET
- Returns AuthorStats for current user

#### `/api/author/profile` — GET/PATCH
- Get or update author profile (bio, display name)

#### `/api/referrals/code` — GET
- Get existing or generate new referral code

#### `/api/referrals` — GET
- List referral earnings

#### `/api/marketplace/[id]/reviews` — GET
- List reviews for a listing

#### `/api/marketplace/[id]/reviews` — POST
- Body: `{ rating: number, text?: string }`
- Create review, update `AuthorProfile.rating`

#### Marketplace API updates (`/api/marketplace`)
- **GET**: Add `?sort=popular|recent|price_low|price_high` and `?tag=web-scraping` query params. Include new fields in response.
- **POST**: Accept `weeklyPrice`, `monthlyPrice`, `tags`. On create, ensure AuthorProfile exists via `getOrCreateProfile()`.
- **GET [id]**: Full detail with reviews, author profile.

---

## Phase 2: UI

### 2.1 Revised `/buy` Page

**File:** `apps/web/app/buy/page.tsx`

Changes from existing:
- Redesign listing cards: show rating stars, author name + tier badge, subscriber count
- Display both weekly and monthly pricing
- Subscribe button → opens confirmation dialog
- Search bar + sort dropdown + tag filter chips
- "My Subscriptions" link in page header
- States: loading, empty (with search/no results variants), error, populated grid

New components:
- `MarketplaceCard` (extend existing): add tier badge, subscriber count, price toggle
- `SubscriptionDialog`: confirmation modal with plan selector, balance display, confirm/cancel
- `TagFilter`: horizontal scrollable tag chips
- `SortDropdown`: popular/recent/price low/price high

### 2.2 Revised `/sell` Page

**File:** `apps/web/app/sell/page.tsx`

Three-tab layout using local state:
- **Tab: "My Agents"** — list of published agents (existing cards upgraded with subscriber count, earnings, stats link). [Unlist] button calls DELETE. [Edit] opens inline form for price/description.
- **Tab: "Income"** — fetch from `/api/author/stats`, render dashboard: total earned card, monthly income trend, recent transactions table.
- **Tab: "Payout"** — placeholder screen: "Fiat payout coming soon. You've earned X credits so far."

"Publish New Agent" form still accessible.

### 2.3 `/subscriptions` Page

**File:** `apps/web/app/subscriptions/page.tsx`

List of subscribed agents with:
- Agent name, author, price
- Status badge (Active / Expired / Cancelled)
- Period info (next billing date, or date expired)
- [Cancel] button for active subs, [Renew] for expired
- Empty state: "No subscriptions yet."
- States: loading, empty, populated, error

### 2.4 `/marketplace/[id]` Detail Page

**File:** `apps/web/app/marketplace/[id]/page.tsx`

Full agent detail:
- Agent name, description, author info with tier badge
- Pricing display: weekly / monthly with subscribe CTA
- Subscriber count, total earnings
- Reviews section: list of reviews with ratings, submit review form
- States: loading, not found, error, populated

New components:
- `ReviewCard` — rating stars, text, date, reviewer name
- `ReviewForm` — star picker + textarea + submit
- `AuthorInfoBanner` — avatar, name, tier badge, join date

### 2.5 Credit Balance in Header

**File:** `apps/web/components/layout/Header.tsx`

Add credit balance display:
- Fetch from `/api/credits/balance` on mount
- Show as "X Credits" in the header
- Clickable → open top-up modal or navigate

### 2.6 Nav Updates

**File:** `apps/web/components/layout/Nav.tsx`

- Add "Subscriptions" link under Agents section

---

## Files Summary

### Phase 1 — New Files (14)
1. `packages/payments/package.json`
2. `packages/payments/tsconfig.json`
3. `packages/payments/src/index.ts`
4. `packages/payments/src/credit-ledger.ts`
5. `packages/payments/src/subscription.ts`
6. `packages/payments/src/author-profile.ts`
7. `packages/payments/src/referral.ts`
8. `packages/payments/src/commission.ts`
9. `packages/payments/src/types.ts`
10. `apps/web/app/api/credits/balance/route.ts`
11. `apps/web/app/api/credits/transactions/route.ts`
12. `apps/web/app/api/credits/topup/route.ts`
13. `apps/web/app/api/author/stats/route.ts`
14. `apps/web/app/api/referrals/code/route.ts`

### Phase 1 — Modified Files (5)
1. `apps/web/prisma/schema.prisma`
2. `apps/web/app/api/marketplace/route.ts`
3. `apps/web/app/api/marketplace/[id]/route.ts`
4. Root `package.json` (workspaces)
5. `apps/web/package.json` (add @ciao/payments dependency)

### Phase 2 — New Files (5+)
1. `apps/web/app/subscriptions/page.tsx`
2. `apps/web/app/marketplace/[id]/page.tsx`
3. `apps/web/components/marketplace/SubscriptionDialog.tsx`
4. `apps/web/components/marketplace/ReviewCard.tsx`
5. `apps/web/components/marketplace/ReviewForm.tsx`
6. `apps/web/components/marketplace/TagFilter.tsx`
7. `apps/web/components/marketplace/SortDropdown.tsx`

### Phase 2 — Modified Files (4)
1. `apps/web/app/buy/page.tsx`
2. `apps/web/app/sell/page.tsx`
3. `apps/web/components/layout/Header.tsx`
4. `apps/web/components/layout/Nav.tsx`

---

## Implementation Order

1. Prisma schema + migration
2. `packages/payments/` scaffold + implementation
3. Credit API routes (balance, transactions, topup)
4. Author/stats API route + referrals
5. Subscription API routes
6. Marketplace API updates (sort, tag, pricing, reviews)
7. Revised `/buy` page
8. Revised `/sell` page
9. `/subscriptions` page
10. `/marketplace/[id]` detail page
11. Header credit balance + nav updates
