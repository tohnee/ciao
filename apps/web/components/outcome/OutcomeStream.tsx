import type { OutcomeCard } from "@ciao/shared";
import { OutcomeCard as OutcomeCardView } from "@/components/home/OutcomeCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function OutcomeStream({ outcomes }: { outcomes: OutcomeCard[] }) {
  if (outcomes.length === 0) {
    return <EmptyState title="No outcomes yet" description="Completed outcomes appear here when CIAO is ready for acceptance." />;
  }
  return (
    <div className="space-y-4">
      {outcomes.map((outcome) => (
        <OutcomeCardView key={outcome.id} card={outcome} />
      ))}
    </div>
  );
}
