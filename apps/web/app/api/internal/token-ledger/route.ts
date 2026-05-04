import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";

const ledger: Array<{
  intentId: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  timestamp: string;
}> = [];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { intentId, inputTokens, outputTokens, model } = body as {
    intentId?: string;
    inputTokens?: number;
    outputTokens?: number;
    model?: string;
  };

  if (!intentId) {
    return ok({ ok: false, error: "intentId is required" }, { status: 400 });
  }

  const entry = {
    intentId,
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
    model: model || "unknown",
    timestamp: new Date().toISOString(),
  };

  ledger.push(entry);
  if (ledger.length > 10000) {
    ledger.splice(0, ledger.length - 10000);
  }

  return ok({ ok: true, entry });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("intentId");

  const filtered = intentId ? ledger.filter((e) => e.intentId === intentId) : ledger;

  const totals = filtered.reduce(
    (acc, e) => ({
      inputTokens: acc.inputTokens + e.inputTokens,
      outputTokens: acc.outputTokens + e.outputTokens,
      calls: acc.calls + 1,
    }),
    { inputTokens: 0, outputTokens: 0, calls: 0 },
  );

  return ok({ ok: true, entries: filtered.slice(-100), totals });
}
