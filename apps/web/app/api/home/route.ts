import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getHomeSnapshot } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  return ok(await getHomeSnapshot(workspaceId));
}
