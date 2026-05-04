import type { Intent, Outcome, IntentMode } from "@ciao/shared";
import { listSignalsForIntent } from "@/lib/runtime-repository";
import { prisma } from "@/lib/prisma";

type OutcomeConfidence = Outcome["confidence"];
type OutcomeState = Outcome["state"];

export async function getIntentDetail(intentId: string) {
  const intent = await prisma.intent.findUnique({ where: { id: intentId } });
  if (!intent) {
    return null;
  }

  const currentSignals = await listSignalsForIntent(intentId);
  const outcomes = await prisma.outcome.findMany({
    where: { intentId },
    orderBy: { createdAt: "desc" },
  });

  const formatRecord = (r: {
    id: string; intentId: string; title: string; summary: string;
    changed: string | null; verified: string | null; risks: string | null;
    confidence: string; costSummary: string | null; receipt: string | null;
    state: string; createdAt: Date;
  }): Outcome => ({
    id: r.id, intentId: r.intentId, title: r.title, summary: r.summary,
    changed: JSON.parse(r.changed ?? "[]") as string[],
    verified: JSON.parse(r.verified ?? "[]") as string[],
    risks: JSON.parse(r.risks ?? "[]") as string[],
    confidence: r.confidence as OutcomeConfidence,
    costSummary: JSON.parse(r.costSummary ?? "{}") as Outcome["costSummary"],
    receipt: JSON.parse(r.receipt ?? "null") as Outcome["receipt"],
    state: r.state as OutcomeState,
    createdAt: r.createdAt.toISOString(),
  });

  return {
    intent: {
      id: intent.id, workspaceId: intent.workspaceId,
      rawInput: intent.rawInput, title: intent.title,
      interpretedGoal: intent.interpretedGoal,
      constraints: JSON.parse(intent.constraints ?? "[]") as string[],
      mode: intent.mode as IntentMode,
      costMode: intent.costMode as "frugal" | "balanced" | "thorough",
      state: intent.state as Intent["state"],
      importance: intent.importance as "low" | "normal" | "high",
      riskLevel: intent.riskLevel as "unknown" | "low" | "medium" | "high",
      previewMessage: intent.previewMessage ?? undefined,
      createdAt: intent.createdAt.toISOString(),
      updatedAt: intent.updatedAt.toISOString(),
      desiredOutcome: intent.desiredOutcome ?? undefined,
    },
    currentSignals,
    activeLoopSummary: currentSignals.length > 0 ? currentSignals[currentSignals.length - 1].message : "",
    decisions: [],
    outcomes: outcomes.map(formatRecord),
  };
}
