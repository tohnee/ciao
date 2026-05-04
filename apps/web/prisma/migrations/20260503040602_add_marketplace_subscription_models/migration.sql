-- CreateTable
CREATE TABLE "CreditAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CreditAccount_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreditEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "CreditAccount" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuthorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSubscribers" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "commissionRate" REAL NOT NULL DEFAULT 0.20,
    "displayName" TEXT,
    "bio" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPayoutAt" DATETIME,
    CONSTRAINT "AuthorProfile_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriberWorkspaceId" TEXT NOT NULL,
    "authorWorkspaceId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "priceAtSubscription" INTEGER NOT NULL,
    "platformFeePercent" REAL NOT NULL,
    "cancelledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MarketplaceReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "reviewerWorkspaceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MarketplaceReview_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "MarketplaceListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerWorkspaceId" TEXT NOT NULL,
    "refereeWorkspaceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewardCredits" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_referrerWorkspaceId_fkey" FOREIGN KEY ("referrerWorkspaceId") REFERENCES "AuthorProfile" ("workspaceId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarketplaceListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "weeklyPrice" INTEGER,
    "monthlyPrice" INTEGER,
    "description" TEXT NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalSubscribers" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketplaceListing_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MarketplaceListing" ("agentId", "createdAt", "description", "downloads", "featured", "id", "price", "rating", "updatedAt") SELECT "agentId", "createdAt", "description", "downloads", "featured", "id", "price", "rating", "updatedAt" FROM "MarketplaceListing";
DROP TABLE "MarketplaceListing";
ALTER TABLE "new_MarketplaceListing" RENAME TO "MarketplaceListing";
CREATE UNIQUE INDEX "MarketplaceListing_agentId_key" ON "MarketplaceListing"("agentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CreditAccount_workspaceId_key" ON "CreditAccount"("workspaceId");

-- CreateIndex
CREATE INDEX "CreditEntry_accountId_createdAt_idx" ON "CreditEntry"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorProfile_workspaceId_key" ON "AuthorProfile"("workspaceId");

-- CreateIndex
CREATE INDEX "Subscription_subscriberWorkspaceId_status_idx" ON "Subscription"("subscriberWorkspaceId", "status");

-- CreateIndex
CREATE INDEX "Subscription_authorWorkspaceId_status_idx" ON "Subscription"("authorWorkspaceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceReview_listingId_reviewerWorkspaceId_key" ON "MarketplaceReview"("listingId", "reviewerWorkspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refereeWorkspaceId_key" ON "Referral"("refereeWorkspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_referrerWorkspaceId_idx" ON "Referral"("referrerWorkspaceId");
