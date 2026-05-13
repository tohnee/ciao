import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getAgent, updateAgent, deleteAgent } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const agent = await getAgent(params.id);
  if (!agent) return ok({ error: "Agent not found" }, { status: 404 });
  return ok({ agent });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = await request.json();
  const agent = await updateAgent(params.id, workspaceId, body);
  return ok({ agent });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  await deleteAgent(params.id, workspaceId);
  return ok({ success: true });
}
