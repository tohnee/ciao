import { ok } from "@/lib/api-helpers";
import { getBestProvider } from "@/lib/provider-factory";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { orchestrateIntent } from "@/lib/loop-orchestrator";
import { createStartedIntent, listIntents, previewIntent, updateIntentState } from "@/lib/runtime-repository";
import { prisma } from "@/lib/prisma";

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
      orchestrateIntent(intent, provider, workspaceId, body.agentId).catch(async (err) => {
        console.error("Orchestrator error:", err);
        try {
          await updateIntentState(intent.id, "paused", workspaceId);
          await prisma.signal.create({
            data: {
              workspaceId,
              intentId: intent.id,
              kind: "blocker",
              level: "high",
              message: `Execution failed: ${err instanceof Error ? err.message : "Unknown error"}`,
              compact: false,
            },
          });
        } catch (signalErr) {
          console.error("Failed to record orchestrator failure:", signalErr);
        }
      });
    }

    return ok({ intent, preview: preview });
  }

  const result = await previewIntent(payload);
  return ok(result);
}
