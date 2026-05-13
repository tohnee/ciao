import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { updateMemory, deleteMemory } from "@/lib/runtime-repository";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    status?: string;
  };
  const memory = await updateMemory(params.id, body, workspaceId);
  return ok({ memory });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  await deleteMemory(params.id, workspaceId);
  return ok({ success: true });
}
