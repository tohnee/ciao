import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { getBestProvider } from "@/lib/provider-factory";
import { resolveDecision, getIntent } from "@/lib/runtime-repository";
import { orchestrateIntent } from "@/lib/loop-orchestrator";

export async function POST(request: Request, context: { params: { id: string } }) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as { optionId?: string };
  const result = await resolveDecision(context.params.id, body.optionId ?? "minimal", workspaceId);

  if (result) {
    const intent = await getIntent(result.intentId);
    if (intent) {
      const provider = getBestProvider();
      orchestrateIntent(intent, provider, workspaceId).catch((err) => {
        console.error("Orchestrator error after decision resume:", err);
      });
    }
    return ok({ message: "Decision resolved, resuming execution." });
  }

  return ok({ message: "Decision not found.", outcome: null });
}
