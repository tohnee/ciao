import { ok } from "@/lib/api-helpers";
import { getBestProvider } from "@/lib/provider-factory";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { orchestrateIntent } from "@/lib/loop-orchestrator";
import { createStartedIntent, listIntents, previewIntent } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const intents = await listIntents(workspaceId);
  return ok({ intents, total: intents.length });
}

export async function POST(request: Request) {
  const workspaceId = await getRequiredWorkspaceId();
  const body = (await request.json()) as {
    rawInput: string;
    mode?: "ask" | "draft" | "act" | "ship" | "watch" | "review";
    costMode?: "frugal" | "balanced" | "thorough";
    autoStart?: boolean;
    forceDecision?: boolean;
    agentId?: string;
  };

  const payload = {
    rawInput: body.rawInput,
    mode: body.mode ?? "ship",
    costMode: body.costMode ?? "balanced",
  } as const;

  if (body.autoStart) {
    const intent = await createStartedIntent({
      ...payload,
      forceDecision: body.forceDecision,
    }, workspaceId);

    const preview = (await previewIntent(payload)).preview;

    // Fire orchestrator in background for non-decision path
    if (!body.forceDecision) {
      const provider = getBestProvider();
      orchestrateIntent(intent, provider, workspaceId, body.agentId).catch((err) => {
        console.error("Orchestrator error:", err);
      });
    }

    return ok({ intent, preview: preview });
  }

  const result = await previewIntent(payload);
  return ok(result);
}
