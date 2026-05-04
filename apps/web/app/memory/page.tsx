import { listMemories } from "@/lib/runtime-repository";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { MemoryList } from "@/components/memory/MemoryList";

export default async function MemoryPage() {
  const workspaceId = await getRequiredWorkspaceId();
  const memories = await listMemories(workspaceId);
  return <MemoryList memories={memories} />;
}
