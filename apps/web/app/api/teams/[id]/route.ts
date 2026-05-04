import { ok } from "@/lib/api-helpers";
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
  const body = await request.json();
  const team = await updateTeam(params.id, body);
  return ok({ team });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await deleteTeam(params.id);
  return ok({ success: true });
}
