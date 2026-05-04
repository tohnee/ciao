"use client";

import { useState } from "react";
import type { OutcomeCard as OutcomeCardType } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { CostLabel } from "@/components/shared/CostLabel";
import { useHomeStore } from "@/stores/home";
import { CheckCircle2 } from "lucide-react";

export function OutcomeCard({ card }: { card: OutcomeCardType }) {
  const fetchHome = useHomeStore((state) => state.fetchHome);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [acceptState, setAcceptState] = useState<"idle" | "loading" | "done">("idle");
  const [revertState, setRevertState] = useState<"idle" | "loading" | "done">("idle");

  const handleAccept = async () => {
    setAcceptState("loading");
    try {
      await fetch(`/api/outcomes/${card.id}/accept`, { method: "POST" });
      setAcceptState("done");
      await fetchHome();
    } catch {
      setAcceptState("idle");
    }
  };

  const handleRevert = async () => {
    setRevertState("loading");
    try {
      await fetch(`/api/outcomes/${card.id}/revert`, { method: "POST" });
      setRevertState("done");
      await fetchHome();
    } catch {
      setRevertState("idle");
    }
  };

  return (
    <Card className="space-y-4 border-l-4 border-l-success animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium text-stone-800">
            {card.title}
          </h3>
          <p className="mt-0.5 text-sm leading-relaxed text-stone-600">
            {card.summary}
          </p>
        </div>
      </div>
      <CostLabel label={card.costLabel} />
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={handleAccept}
          disabled={acceptState !== "idle"}
        >
          {acceptState === "loading" ? "Accepting..." : acceptState === "done" ? "Accepted" : "Accept"}
        </Button>
        <Button onClick={() => window.location.href = `/outcomes/${card.id}`}>Review diff</Button>
        <Button
          onClick={handleRevert}
          disabled={revertState !== "idle"}
        >
          {revertState === "loading" ? "Reverting..." : revertState === "done" ? "Reverted" : "Revert"}
        </Button>
        <Button
          onClick={async () => {
            setSaveState("saving");
            const response = await fetch(
              `/api/outcomes/${card.id}/save-memory`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ title: card.title }),
              },
            );

            if (response.ok) {
              setSaveState("saved");
              await fetchHome();
              return;
            }

            setSaveState("idle");
          }}
        >
          {saveState === "saved"
            ? "Saved"
            : saveState === "saving"
              ? "Saving..."
              : "Save memory"}
        </Button>
      </div>
    </Card>
  );
}
