import { notFound } from "next/navigation";
import { IntentDetail } from "@/components/intent/IntentDetail";
import { getIntentDetail } from "@/hooks/useIntent";

export default async function IntentPage({ params }: { params: { id: string } }) {
  const detail = await getIntentDetail(params.id);
  if (!detail) {
    notFound();
  }

  return (
    <IntentDetail
      intent={detail.intent}
      signals={detail.currentSignals}
      outcomes={detail.outcomes}
    />
  );
}
