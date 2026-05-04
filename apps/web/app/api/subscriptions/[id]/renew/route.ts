import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { renewSubscription } from "@ciao/payments";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const sub = await prisma.subscription.findUnique({
    where: { id: params.id },
  });
  if (!sub || sub.subscriberWorkspaceId !== workspaceId) {
    return ok({ error: "Subscription not found" }, { status: 404 });
  }

  try {
    const result = await renewSubscription(prisma, params.id);
    return ok({ subscription: result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Renewal failed";
    return ok({ error: message }, { status: 400 });
  }
}
