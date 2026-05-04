import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listAgents, createAgent } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const agents = await listAgents(workspaceId);
  return ok({ agents });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name: string;
    description?: string;
    type?: string;
    systemPrompt?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    avatarUrl?: string;
  };
  const workspaceId = await getRequiredWorkspaceId();
  const agent = await createAgent({ ...body, workspaceId } as any);
  return ok({ agent }, { status: 201 });
}
