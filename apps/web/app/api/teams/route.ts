import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listTeams, createTeam } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const teams = await listTeams(workspaceId);
  return ok({ teams });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name: string; description?: string };
  const workspaceId = await getRequiredWorkspaceId();
  const team = await createTeam({ ...body, workspaceId });
  return ok({ team }, { status: 201 });
}
