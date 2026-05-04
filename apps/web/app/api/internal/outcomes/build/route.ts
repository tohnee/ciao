import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { getBestProvider } from "@/lib/provider-factory";
import { summarizeResult } from "@ciao/engine/src/capabilities/summarize-result";
import { buildOutcomeSummary } from "@ciao/engine";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { intentId, goal, output } = body as {
    intentId?: string;
    goal?: string;
    output?: string;
  };

  if (!intentId) {
    return ok({ ok: false, error: "intentId is required" }, { status: 400 });
  }

  const intent = await prisma.intent.findUnique({ where: { id: intentId } });
  if (!intent) {
    return ok({ ok: false, error: "Intent not found" }, { status: 404 });
  }

  const provider = getBestProvider();
  const state = {
    goal: goal || intent.interpretedGoal || intent.rawInput,
    plan: "",
    output: output || "",
  };

  let summary: { summary: string; changed: string[]; verified: string[]; risks: string[]; confidence: string };
  try {
    const result = await summarizeResult(state, provider);
    summary = result;
  } catch {
    const fallback = buildOutcomeSummary(intent.title);
    summary = { ...fallback, changed: [], verified: [], risks: [], confidence: "medium" };
  }

  const outcome = await prisma.outcome.create({
    data: {
      intentId,
      title: `${(intent.title || "Task").trim().slice(0, 60)} ready`,
      summary: summary.summary,
      changed: JSON.stringify(summary.changed),
      verified: JSON.stringify(summary.verified),
      risks: JSON.stringify(summary.risks),
      confidence: summary.confidence as "low" | "medium" | "high",
      costSummary: JSON.stringify({ mode: "balanced", label: "Balanced" }),
      receipt: JSON.stringify({ intentId, goal: state.goal }),
      state: "ready",
    },
  });

  await prisma.intent.update({
    where: { id: intentId },
    data: { state: "ready" },
  });

  return ok({ ok: true, outcomeId: outcome.id });
}
