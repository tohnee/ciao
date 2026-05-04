import { mockProvider } from "@ciao/providers/mock";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are CIAO, an AI engineering agent. Interpret the user's intent and respond with a JSON object:

{
  "interpretedGoal": "brief description of what the user wants",
  "summary": "step-by-step plan to accomplish the task",
  "confidence": "high" | "medium" | "low",
  "changed": ["file1.ts", "file2.ts"],
  "risks": ["risk description"]
}`;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { rawInput: string; mode?: string };
  const { rawInput, mode = "ship" } = body;

  if (!rawInput?.trim()) {
    return Response.json({ error: "rawInput is required" }, { status: 400 });
  }

  const result = await mockProvider.generate({
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Mode: ${mode}\nIntent: ${rawInput}` }],
  });

  let parsed;
  try {
    parsed = JSON.parse(result.text.replace(/^```json\s*|```\s*$/gm, "").trim());
  } catch {
    parsed = {
      interpretedGoal: rawInput,
      summary: `Processing: ${rawInput}`,
      confidence: "medium",
      changed: [],
      risks: [],
    };
  }

  const outcome = {
    id: crypto.randomUUID(),
    title: parsed.interpretedGoal || rawInput,
    summary: parsed.summary || rawInput,
    confidence: parsed.confidence || "medium",
    changed: Array.isArray(parsed.changed) ? parsed.changed : [],
    risks: Array.isArray(parsed.risks) ? parsed.risks : [],
    costSummary: { label: mode === "thorough" ? "optimized" : "low", tokens: 142 },
    state: "pending",
    createdAt: new Date().toISOString(),
  };

  return Response.json({
    preview: {
      interpretedGoal: outcome.title,
      mode,
      confidence: outcome.confidence,
    },
    outcome,
  });
}

export async function GET() {
  return Response.json({
    message: "CIAO Trial API ready. POST with { rawInput, mode } to try it.",
    modes: ["ask", "draft", "act", "ship", "watch", "review"],
  });
}
