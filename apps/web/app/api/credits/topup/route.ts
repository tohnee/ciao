import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@ciao/payments";

export async function POST(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as { amount: number; description?: string };
  if (!body.amount || body.amount <= 0) {
    return ok({ error: "Amount must be positive" }, { status: 400 });
  }

  const result = await addCredits(prisma, workspaceId, body.amount, "topup", undefined, body.description);
  return ok(result);
}
