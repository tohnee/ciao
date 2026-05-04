import { ok } from "@/lib/api-helpers";
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
  const body = await request.json();
  const agent = await updateAgent(params.id, body);
  return ok({ agent });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await deleteAgent(params.id);
  return ok({ success: true });
}
