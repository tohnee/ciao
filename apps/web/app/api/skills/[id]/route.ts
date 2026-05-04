import { ok } from "@/lib/api-helpers";
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
  const body = await request.json();
  const skill = await updateSkill(params.id, body);
  return ok({ skill });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await deleteSkill(params.id);
  return ok({ success: true });
}
