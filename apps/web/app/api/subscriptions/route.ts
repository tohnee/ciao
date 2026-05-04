import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { subscribe, getMySubscriptions } from "@ciao/payments";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const subscriptions = await getMySubscriptions(prisma, workspaceId);
  return ok({ subscriptions });
}

export async function POST(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as {
    listingId: string;
    authorId: string;
    plan: "WEEKLY" | "MONTHLY";
  };

  if (!body.listingId || !body.authorId || !body.plan) {
    return ok({ error: "listingId, authorId, and plan are required" }, { status: 400 });
  }

  if (body.plan !== "WEEKLY" && body.plan !== "MONTHLY") {
    return ok({ error: "plan must be WEEKLY or MONTHLY" }, { status: 400 });
  }

  try {
    const result = await subscribe(prisma, {
      subscriberId: workspaceId,
      authorId: body.authorId,
      listingId: body.listingId,
      plan: body.plan,
    });
    return ok(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Subscription failed";
    return ok({ error: message }, { status: 400 });
  }
}
