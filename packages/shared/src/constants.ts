import type { CostMode, ModelTier } from "./types/cost";
import type { IntentMode } from "./types/intent";
import type { LoopKind } from "./types/loop";

export const INTENT_MODES: IntentMode[] = ["ask", "draft", "act", "ship", "watch", "review"];
export const COST_MODES: CostMode[] = ["frugal", "balanced", "thorough"];
export const LOOP_KINDS: LoopKind[] = ["understand", "plan", "search", "edit", "test", "review", "summarize", "remember", "monitor"];
export const MODEL_TIERS: ModelTier[] = ["small", "medium", "strong"];
