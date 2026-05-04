import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listSkills, createSkill } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const skills = await listSkills(workspaceId);
  return ok({ skills });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name: string;
    content: string;
    description?: string;
    category?: string;
    version?: string;
  };
  const workspaceId = await getRequiredWorkspaceId();
  const skill = await createSkill({ ...body, workspaceId });
  return ok({ skill }, { status: 201 });
}
