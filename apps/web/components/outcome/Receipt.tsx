import type { Outcome } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Expandable } from "@/components/shared/Expandable";

export function Receipt({ outcome }: { outcome: Outcome }) {
  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-base font-medium text-gray-900">{outcome.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{outcome.summary}</p>
      </div>
      <Expandable>
        <pre className="overflow-auto text-xs text-gray-500">{JSON.stringify(outcome.receipt, null, 2)}</pre>
      </Expandable>
    </Card>
  );
}
