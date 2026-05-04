import { NextRequest } from "next/server";
import { ok } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { workspaceId, intentId, kind, level, message, compact } = body as {
    workspaceId?: string;
    intentId?: string;
    kind?: string;
    level?: string;
    message?: string;
    compact?: boolean;
  };

  if (!intentId || !kind) {
    return ok({ ok: false, error: "intentId and kind are required" }, { status: 400 });
  }

  const ws = workspaceId
    ? await prisma.workspace.findUnique({ where: { id: workspaceId } })
    : await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });

  const signal = await prisma.signal.create({
    data: {
      workspaceId: ws?.id || "workspace_demo",
      intentId,
      kind: kind || "progress",
      level: level || "medium",
      message: message || "",
      compact: compact ?? true,
    },
  });

  return ok({ ok: true, signalId: signal.id });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("intentId");
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  if (!intentId) {
    return ok({ ok: false, error: "intentId query param is required" }, { status: 400 });
  }

  const signals = await prisma.signal.findMany({
    where: { intentId },
    orderBy: { createdAt: "asc" },
    take: Math.min(limit, 100),
  });

  return ok({ ok: true, signals });
}
