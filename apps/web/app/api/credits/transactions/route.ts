import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getHistory } from "@ciao/payments";

export async function GET(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const result = await getHistory(prisma, workspaceId, limit, offset);
  return ok(result);
}
