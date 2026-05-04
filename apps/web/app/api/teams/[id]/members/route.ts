import { ok } from "@/lib/api-helpers";
import { addTeamMember, removeTeamMember } from "@/lib/runtime-repository";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { agentId, role } = (await request.json()) as { agentId: string; role?: string };
  const member = await addTeamMember(params.id, agentId, role);
  return ok({ member }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { memberId } = (await request.json()) as { memberId: string };
  await removeTeamMember(memberId);
  return ok({ success: true });
}
