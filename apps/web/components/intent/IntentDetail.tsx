import type { Intent, Outcome, Signal } from "@ciao/shared";
import { ControlGestures } from "@/components/intent/ControlGestures";
import { SignalFeed } from "@/components/intent/SignalFeed";
import { Receipt } from "@/components/outcome/Receipt";

export function IntentDetail({
  intent,
  signals,
  outcomes,
}: {
  intent: Intent;
  signals: Signal[];
  outcomes: Outcome[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-white p-6 shadow-card">
        <p className="text-sm text-gray-500">{intent.mode} · {intent.costMode} · {intent.riskLevel}</p>
        <h2 className="mt-2 text-2xl font-light text-gray-900">{intent.title}</h2>
        <p className="mt-3 text-sm text-gray-600">{intent.previewMessage}</p>
      </section>
      <ControlGestures />
      <SignalFeed signals={signals} />
      {outcomes.map((outcome) => (
        <Receipt key={outcome.id} outcome={outcome} />
      ))}
    </div>
  );
}
