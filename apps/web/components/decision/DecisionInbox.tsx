import type { DecisionCard } from "@ciao/shared";
import { DecisionCard as DecisionCardView } from "@/components/home/DecisionCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function DecisionInbox({ decisions }: { decisions: DecisionCard[] }) {
  if (decisions.length === 0) {
    return <EmptyState title="No decisions waiting" description="CIAO only interrupts when a judgment call matters." />;
  }
  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <DecisionCardView key={decision.id} card={decision} />
      ))}
    </div>
  );
}
