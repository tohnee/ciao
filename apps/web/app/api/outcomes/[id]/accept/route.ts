import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { acceptOutcome } from "@/lib/runtime-repository";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const outcome = await acceptOutcome(params.id, workspaceId);
  return ok({ message: "Outcome accepted.", outcome });
}
