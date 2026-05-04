import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getStats } from "@ciao/payments";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const stats = await getStats(prisma, workspaceId);
  return ok(stats);
}
