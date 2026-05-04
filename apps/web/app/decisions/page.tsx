import { listDecisions } from "@/lib/runtime-repository";
import { getRequiredWorkspaceId } from "@/lib/workspace";
import { DecisionInbox } from "@/components/decision/DecisionInbox";

export default async function DecisionsPage() {
  const workspaceId = await getRequiredWorkspaceId();
  const decisions = await listDecisions(workspaceId);
  return <DecisionInbox decisions={decisions} />;
}
