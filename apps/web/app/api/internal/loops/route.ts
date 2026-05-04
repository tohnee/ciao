import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { orchestrateIntent } from "@/lib/loop-orchestrator";
import { getBestProvider } from "@/lib/provider-factory";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { intentId } = body as { intentId?: string };

  if (!intentId) {
    return ok({ ok: false, error: "intentId is required" }, { status: 400 });
  }

  const intent = await prisma.intent.findUnique({ where: { id: intentId } });
  if (!intent) {
    return ok({ ok: false, error: "Intent not found" }, { status: 404 });
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

  await orchestrateIntent(intentObj, provider, intent.workspaceId);

  return ok({ ok: true, intentId });
}
