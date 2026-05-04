import type { IntentPreview } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { Target, ListChecks } from "lucide-react";

export function IntentPreviewCard({
  preview,
  onStart,
  onCancel,
  isSubmitting,
}: {
  preview: IntentPreview;
  onStart: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card className="space-y-5 border-l-4 border-l-accent animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-light">
          <Target className="h-4 w-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-stone-500">
            CIAO understands
          </p>
          <h3 className="mt-0.5 text-base font-medium text-stone-800">
            {preview.interpretedGoal}
          </h3>
        </div>
      </div>
      <div className="flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
          Mode: {preview.mode}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
          Cost: {preview.costMode}
        </span>
      </div>
      {preview.constraints.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <ListChecks className="h-3.5 w-3.5 text-stone-400" />
            Constraints
          </div>
          <ul className="space-y-1.5">
            {preview.constraints.map((constraint) => (
              <li
                key={constraint}
                className="flex items-start gap-2 text-sm text-stone-600"
              >
                <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/40" />
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Button variant="primary" onClick={onStart}>
          {isSubmitting ? "Starting..." : "Start"}
        </Button>
        <Button>Adjust</Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
