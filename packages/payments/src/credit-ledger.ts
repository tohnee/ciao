import type { PrismaTx } from "./types";
import type { CreditEntryType } from "@prisma/client";

export async function getOrCreateAccount(prisma: PrismaTx, workspaceId: string) {
  return prisma.creditAccount.upsert({
    where: { workspaceId },
    create: { workspaceId, balance: 0 },
    update: {},
  });
}

export async function getBalance(prisma: PrismaTx, workspaceId: string): Promise<number> {
  const account = await getOrCreateAccount(prisma, workspaceId);
  return account.balance;
}

export async function addCredits(
  prisma: PrismaTx,
  workspaceId: string,
  amount: number,
  referenceType?: string,
  referenceId?: string,
  description?: string,
) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const account = await getOrCreateAccount(prisma, workspaceId);
  const balanceAfter = account.balance + amount;

  const entry = await prisma.creditEntry.create({
    data: {
      accountId: account.id,
      amount,
      balanceBefore: account.balance,
      balanceAfter,
      type: "CREDIT" as CreditEntryType,
      referenceType,
      referenceId,
      description,
    },
  });

  await prisma.creditAccount.update({
    where: { id: account.id },
    data: { balance: balanceAfter },
  });

  return { entry, balance: balanceAfter };
}

export async function deductCredits(
  prisma: PrismaTx,
  workspaceId: string,
  amount: number,
  referenceType?: string,
  referenceId?: string,
  description?: string,
) {
  if (amount <= 0) throw new Error("Amount must be positive");

  const account = await getOrCreateAccount(prisma, workspaceId);
  if (account.balance < amount) {
    throw new Error(
      `Insufficient credits: have ${account.balance}, need ${amount}`,
    );
  }

  const balanceAfter = account.balance - amount;

  const entry = await prisma.creditEntry.create({
    data: {
      accountId: account.id,
      amount: -amount,
      balanceBefore: account.balance,
      balanceAfter,
      type: "DEBIT" as CreditEntryType,
      referenceType,
      referenceId,
      description,
    },
  });

  await prisma.creditAccount.update({
    where: { id: account.id },
    data: { balance: balanceAfter },
  });

  return { entry, balance: balanceAfter };
}

export async function getHistory(
  prisma: PrismaTx,
  workspaceId: string,
  limit = 20,
  offset = 0,
) {
  const account = await getOrCreateAccount(prisma, workspaceId);

  const [entries, total] = await Promise.all([
    prisma.creditEntry.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.creditEntry.count({
      where: { accountId: account.id },
    }),
  ]);

  return { entries, total };
}
