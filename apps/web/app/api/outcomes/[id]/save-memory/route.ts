import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { saveMemoryFromOutcome } from "@/lib/runtime-repository";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const memory = await saveMemoryFromOutcome(params.id, body, workspaceId);

  if (!memory) {
    return ok({ message: "Outcome not found." }, { status: 404 });
  }

  return ok({ message: "Memory saved.", memory });
}
