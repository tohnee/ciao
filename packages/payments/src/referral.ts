import type { PrismaTx } from "./types";
import { addCredits } from "./credit-ledger";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

export async function getOrCreateCode(prisma: PrismaTx, workspaceId: string) {
  const profile = await prisma.authorProfile.findUnique({
    where: { workspaceId },
  });
  if (profile?.displayName) return profile.displayName;

  const referral = await prisma.referral.findFirst({
    where: { referrerWorkspaceId: workspaceId },
    orderBy: { createdAt: "desc" },
  });
  if (referral) return referral.code;

  const code = generateCode();
  const profile2 = await getOrCreateProfile(prisma, workspaceId);
  await prisma.authorProfile.update({
    where: { id: profile2.id },
    data: { displayName: code },
  });
  return code;
}

async function getOrCreateProfile(prisma: PrismaTx, workspaceId: string) {
  return prisma.authorProfile.upsert({
    where: { workspaceId },
    create: { workspaceId },
    update: {},
  });
}

export async function applyReferral(
  prisma: PrismaTx,
  code: string,
  newWorkspaceId: string,
) {
  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral) throw new Error("Invalid referral code");
  if (referral.status !== "PENDING") throw new Error("Referral already used");
  if (referral.referrerWorkspaceId === newWorkspaceId) {
    throw new Error("Cannot refer yourself");
  }

  return prisma.referral.update({
    where: { id: referral.id },
    data: {
      refereeWorkspaceId: newWorkspaceId,
      status: "ACTIVE",
    },
  });
}

export async function rewardReferrer(
  prisma: PrismaTx,
  referralId: string,
  amount: number,
) {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
  });
  if (!referral) throw new Error("Referral not found");

  const reward = Math.round(amount * 0.1);

  await addCredits(
    prisma,
    referral.referrerWorkspaceId,
    reward,
    "referral",
    referralId,
    `Referral reward (10% of ${amount} credits)`,
  );

  return prisma.referral.update({
    where: { id: referralId },
    data: {
      rewardCredits: { increment: reward },
    },
  });
}
