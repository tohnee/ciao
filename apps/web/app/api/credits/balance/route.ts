import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getBalance } from "@ciao/payments";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const balance = await getBalance(prisma, workspaceId);
  return ok({ balance });
}
