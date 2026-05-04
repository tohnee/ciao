import { ok } from "@/lib/api-helpers";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { listOutcomes } from "@/lib/runtime-repository";

export async function GET() {
  const workspaceId = await getRequiredWorkspaceId();
  const outcomes = await listOutcomes(workspaceId);
  return ok({
    outcomes: outcomes.map((outcome) => ({
      id: outcome.id,
      intentId: outcome.intentId,
      title: outcome.title,
      summary: outcome.summary,
      confidence: outcome.confidence,
      costLabel: outcome.costSummary.label,
      state: outcome.state,
      createdAt: outcome.createdAt,
    })),
  });
}
