import { listOutcomes } from "@/lib/runtime-repository";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { OutcomeStream } from "@/components/outcome/OutcomeStream";

export default async function OutcomesPage() {
  const workspaceId = await getRequiredWorkspaceId();
  const outcomes = await listOutcomes(workspaceId);
  const cards = outcomes.map((o) => ({
    id: o.id,
    intentId: o.intentId,
    title: o.title,
    summary: o.summary,
    confidence: o.confidence,
    costLabel: o.costSummary.label,
    state: o.state,
    createdAt: o.createdAt,
  }));

  return <OutcomeStream outcomes={cards} />;
}
