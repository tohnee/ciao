import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";

const traces: Array<{
  traceId: string;
  intentId: string;
  step: string;
  data: Record<string, unknown>;
  timestamp: string;
}> = [];

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { intentId, step, data } = body as {
    intentId?: string;
    step?: string;
    data?: Record<string, unknown>;
  };

  if (!intentId || !step) {
    return ok({ ok: false, error: "intentId and step are required" }, { status: 400 });
  }

  const entry = {
    traceId: `${intentId}_${step}_${Date.now()}`,
    intentId,
    step,
    data: data || {},
    timestamp: new Date().toISOString(),
  };

  traces.push(entry);
  if (traces.length > 10000) {
    traces.splice(0, traces.length - 10000);
  }

  return ok({ ok: true, trace: entry });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("intentId");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const filtered = intentId ? traces.filter((t) => t.intentId === intentId) : traces;

  return ok({
    ok: true,
    traces: filtered.slice(-Math.min(limit, 200)),
  });
}
