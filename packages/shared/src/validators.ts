import { z } from "zod";

export const intentModeSchema = z.enum(["ask", "draft", "act", "ship", "watch", "review"]);
export const costModeSchema = z.enum(["frugal", "balanced", "thorough"]);

export const createIntentSchema = z.object({
  rawInput: z.string().min(1),
  mode: intentModeSchema.optional(),
  costMode: costModeSchema.optional(),
  importance: z.enum(["low", "normal", "high"]).optional(),
  autoStart: z.boolean().optional(),
});
