"use client";

import type { DecisionCard as DecisionCardType } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { useHomeStore } from "@/stores/home";
import { HelpCircle } from "lucide-react";

export function DecisionCard({ card }: { card: DecisionCardType }) {
  const fetchHome = useHomeStore((state) => state.fetchHome);

  return (
    <Card className="space-y-4 border-l-4 border-l-warning animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <HelpCircle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-stone-500">
            {card.intentTitle}
          </p>
          <h3 className="mt-0.5 text-base font-medium text-stone-800">
            {card.question}
          </h3>
          {card.recommendation ? (
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
              Recommended:{" "}
              <span className="font-medium text-stone-700">
                {card.recommendation}
              </span>
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {card.options.map((option, index) => (
          <Button
            key={option.id}
            variant={index === 0 ? "primary" : "secondary"}
            onClick={async () => {
              try {
                await fetch(`/api/decisions/${card.id}/resolve`, {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ optionId: option.id }),
                });
              } catch {
                // Resolve error handled by fetchHome
              }
              await fetchHome();
            }}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
