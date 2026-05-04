import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getOrCreateCode } from "@ciao/payments";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const code = await getOrCreateCode(prisma, workspaceId);
  return ok({ code });
}
