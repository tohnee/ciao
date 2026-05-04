import { prisma } from "../apps/web/lib/prisma";
import { getBestProvider } from "../apps/web/lib/provider-factory";
import { orchestrateIntent } from "../apps/web/lib/loop-orchestrator";

/**
 * Background worker that picks up intents in "working" state and
 * drives them through the governor loop via orchestrateIntent.
 *
 * Called by cron, BullMQ, or direct invocation.
 */
export async function processNextIntent() {
  const intent = await prisma.intent.findFirst({
    where: { state: "working" },
    orderBy: { createdAt: "asc" },
  });

  if (!intent) {
    return { processed: false, reason: "no pending intents" };
  }

  const provider = getBestProvider();
  const intentObj = {
    id: intent.id,
    workspaceId: intent.workspaceId,
    rawInput: intent.rawInput,
    title: intent.title,
    interpretedGoal: intent.interpretedGoal,
    constraints: JSON.parse(intent.constraints || "[]") as string[],
    mode: intent.mode as import("@ciao/shared").IntentMode,
    costMode: intent.costMode as import("@ciao/shared").CostMode,
    state: intent.state as import("@ciao/shared").Intent["state"],
    importance: "normal" as const,
    riskLevel: intent.riskLevel as import("@ciao/shared").Intent["riskLevel"],
    createdAt: intent.createdAt.toISOString(),
    updatedAt: intent.updatedAt.toISOString(),
  };

  await orchestrateIntent(intentObj, provider);

  return { processed: true, intentId: intent.id };
}

export async function processAllPending() {
  const intents = await prisma.intent.findMany({
    where: { state: "working" },
    orderBy: { createdAt: "asc" },
  });

  const results = [];
  for (const intent of intents) {
    const provider = getBestProvider();
    const intentObj = {
      id: intent.id,
      workspaceId: intent.workspaceId,
      rawInput: intent.rawInput,
      title: intent.title,
      interpretedGoal: intent.interpretedGoal,
      constraints: JSON.parse(intent.constraints || "[]") as string[],
      mode: intent.mode as import("@ciao/shared").IntentMode,
      costMode: intent.costMode as import("@ciao/shared").CostMode,
      state: intent.state as import("@ciao/shared").Intent["state"],
      importance: "normal" as const,
      riskLevel: intent.riskLevel as import("@ciao/shared").Intent["riskLevel"],
      createdAt: intent.createdAt.toISOString(),
      updatedAt: intent.updatedAt.toISOString(),
    };

    await orchestrateIntent(intentObj, provider);
    results.push({ intentId: intent.id });
  }

  return { processed: results.length, results };
}
