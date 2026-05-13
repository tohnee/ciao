import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getSkill, updateSkill, deleteSkill } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const skill = await getSkill(params.id);
  if (!skill) return ok({ error: "Skill not found" }, { status: 404 });
  return ok({ skill });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = await request.json();
  const skill = await updateSkill(params.id, workspaceId, body);
  return ok({ skill });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  await deleteSkill(params.id, workspaceId);
  return ok({ success: true });
}
