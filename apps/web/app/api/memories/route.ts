import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listMemories } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const memories = await listMemories(workspaceId);
  return ok({ memories, total: memories.length });
}
