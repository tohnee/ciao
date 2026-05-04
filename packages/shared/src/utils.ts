import type { CostMode } from "./types/cost";

export function formatCostModeLabel(mode: CostMode) {
  if (mode === "frugal") return "Frugal";
  if (mode === "thorough") return "Thorough";
  return "Balanced";
}
