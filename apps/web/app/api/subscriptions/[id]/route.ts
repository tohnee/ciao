import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@ciao/payments";

export async function DELETE(
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

  const subscription = await cancelSubscription(prisma, params.id);
  return ok({ subscription });
}
