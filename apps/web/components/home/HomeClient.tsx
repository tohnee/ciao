"use client";

import { useEffect } from "react";
import { CommandBar } from "@/components/command/CommandBar";
import { CalmStatus } from "@/components/home/CalmStatus";
import { DecisionCard } from "@/components/home/DecisionCard";
import { NowCard } from "@/components/home/NowCard";
import { OutcomeCard } from "@/components/home/OutcomeCard";
import { useSSE } from "@/hooks/useSSE";
import { useHomeStore } from "@/stores/home";

export function HomeClient() {
  const { summary, now, decisions, outcomes, isLoading, error, fetchHome } = useHomeStore();

  useSSE();

  useEffect(() => {
    void fetchHome();
  }, [fetchHome]);

  return (
    <div className="space-y-8">
      <CalmStatus summary={summary} />

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            type="button"
            onClick={() => void fetchHome()}
            className="ml-3 font-medium text-red-600 underline hover:text-red-800"
          >
            Retry
          </button>
        </div>
      )}

      <CommandBar onIntentStarted={() => void fetchHome()} />

      {/* Loading state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-accent" />
          Loading...
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-base font-medium text-stone-800">Now</h2>
            {now.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {now.map((card) => (
                  <NowCard key={card.intentId} card={card} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-stone-500">
                No active intents. Type a task above to get started.
              </p>
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-base font-medium text-stone-800">Needs You</h2>
            {decisions.length > 0 ? (
              <div className="space-y-4">
                {decisions.map((card) => (
                  <DecisionCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-stone-500">
                No pending decisions.
              </p>
            )}
          </section>
          <section className="space-y-4">
            <h2 className="text-base font-medium text-stone-800">Outcomes</h2>
            {outcomes.length > 0 ? (
              <div className="space-y-4">
                {outcomes.map((card) => (
                  <OutcomeCard key={card.id} card={card} />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-stone-500">
                No outcomes yet. Completed intents will appear here.
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
