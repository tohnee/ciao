import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { updateIntentState } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const intent = await updateIntentState(params.id, "working", workspaceId);
  return ok({ message: "Going deeper with stronger analysis.", intent });
}
