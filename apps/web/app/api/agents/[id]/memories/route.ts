import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getAgentMemories, createAgentMemory, deleteAgentMemory } from "@/lib/runtime-repository";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const memories = await getAgentMemories(params.id);
  return ok({ memories });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json()) as {
    content: string;
    type?: string;
    source?: string;
    confidence?: number;
    tags?: string[];
  };
  const memory = await createAgentMemory({ ...body, agentId: params.id });
  return ok({ memory }, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as { memoryId: string };
  await deleteAgentMemory(body.memoryId, workspaceId);
  return ok({ success: true });
}
