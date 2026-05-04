import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { resolveDecision } from "@/lib/runtime-repository";

export async function POST(request: Request, context: { params: { id: string } }) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as { optionId?: string };
  const outcome = await resolveDecision(context.params.id, body.optionId ?? "minimal", workspaceId);

  return ok({
    message: "Decision resolved.",
    outcome,
  });
}
