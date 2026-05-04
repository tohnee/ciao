import { ok } from "@/lib/api-helpers";
import { updateMemory, deleteMemory } from "@/lib/runtime-repository";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    status?: string;
  };
  const memory = await updateMemory(params.id, body);
  return ok({ memory });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  await deleteMemory(params.id);
  return ok({ success: true });
}
