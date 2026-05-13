import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getTeam, updateTeam, deleteTeam } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const team = await getTeam(params.id);
  if (!team) return ok({ error: "Team not found" }, { status: 404 });
  return ok({ team });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = await request.json();
  const team = await updateTeam(params.id, workspaceId, body);
  return ok({ team });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  await deleteTeam(params.id, workspaceId);
  return ok({ success: true });
}
