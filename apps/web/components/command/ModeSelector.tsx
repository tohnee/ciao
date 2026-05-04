"use client";

import type { CostMode, IntentMode } from "@ciao/shared";
import clsx from "clsx";
import { Zap, Coins } from "lucide-react";

const modes: IntentMode[] = ["ask", "draft", "act", "ship", "watch", "review"];
const costModes: CostMode[] = ["frugal", "balanced", "thorough"];

export function ModeSelector({
  selectedMode,
  selectedCostMode,
  onModeChange,
  onCostModeChange,
}: {
  selectedMode: IntentMode | null;
  selectedCostMode: CostMode;
  onModeChange: (mode: IntentMode) => void;
  onCostModeChange: (mode: CostMode) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-stone-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Mode
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={clsx(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                selectedMode === mode
                  ? "bg-accent text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-700",
              )}
              onClick={() => onModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Coins className="h-3 w-3 text-stone-400" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Cost
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {costModes.map((mode) => (
            <button
              key={mode}
              type="button"
              className={clsx(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                selectedCostMode === mode
                  ? "bg-stone-800 text-white shadow-sm"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-700",
              )}
              onClick={() => onCostModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
