"use client";

import { useMemo } from "react";
import type { IntentPreview } from "@ciao/shared";
import { ModeSelector } from "@/components/command/ModeSelector";
import { IntentPreviewCard } from "@/components/command/IntentPreview";
import { useCommandStore } from "@/stores/command";

export function CommandBar({ onIntentStarted }: { onIntentStarted?: () => void }) {
  const {
    rawInput,
    mode,
    costMode,
    preview,
    isSubmitting,
    error,
    requestPreview,
    clearError,
    reset,
    setInput,
    setMode,
    setCostMode,
    startIntent,
  } = useCommandStore();
  const canPreview = useMemo(() => rawInput.trim().length > 0 && !preview, [preview, rawInput]);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-6 shadow-card">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
          <span className="mt-0.5 shrink-0 text-sm font-bold text-red-500">!</span>
          <div className="flex-1 text-sm text-red-700">{error}</div>
          <button
            type="button"
            onClick={clearError}
            className="text-sm font-medium text-red-400 transition-colors hover:text-red-600"
          >
            Dismiss
          </button>
        </div>
      )}
      <textarea
        className="min-h-28 w-full resize-none rounded-lg border border-border bg-stone-50 p-4 text-sm leading-relaxed outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-accent focus:bg-white focus:shadow-[0_0_0_3px_rgba(13,124,107,0.08)]"
        placeholder="What should CIAO take care of?"
        value={rawInput}
        onChange={(event) => {
          const value = event.target.value;
          setInput(value);
        }}
      />
      <ModeSelector
        selectedMode={mode}
        selectedCostMode={costMode}
        onModeChange={setMode}
        onCostModeChange={setCostMode}
      />
      {canPreview ? (
        <div className="flex justify-end">
          <button
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-accent-hover active:scale-[0.97]"
            type="button"
            onClick={() => void requestPreview()}
          >
            {isSubmitting ? "Preparing..." : "Preview"}
          </button>
        </div>
      ) : null}
      {preview ? (
        <IntentPreviewCard
          preview={preview as IntentPreview}
          isSubmitting={isSubmitting}
          onCancel={reset}
          onStart={() =>
            void startIntent().then(() => {
              onIntentStarted?.();
            })
          }
        />
      ) : null}
    </div>
  );
}
