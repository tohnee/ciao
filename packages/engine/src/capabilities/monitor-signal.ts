import type { ProviderAdapter } from "@ciao/providers";

export type MonitorResult = {
  status: "calm" | "watching" | "alert";
  message: string;
  action?: string;
};

export async function monitorSignal(
  signals: { kind: string; level: string; message: string }[],
  provider: ProviderAdapter,
): Promise<MonitorResult> {
  if (signals.length === 0) {
    return { status: "calm", message: "No signals to monitor." };
  }

  const recent = signals.slice(-5);
  const signalSummary = recent
    .map((s) => `[${s.level}] ${s.kind}: ${s.message}`)
    .join("\n");

  const result = await provider.generate({
    system:
      "You monitor execution signals for anomalies. Given recent signals, assess if the system is running calmly or needs attention. Respond in JSON: { status: \"calm\"|\"watching\"|\"alert\", message: string, action?: string }",
    messages: [{ role: "user", content: `Recent signals:\n${signalSummary}` }],
  });

  try {
    return JSON.parse(result.text) as MonitorResult;
  } catch {
    const hasHigh = recent.some((s) => s.level === "high");
    return {
      status: hasHigh ? "watching" : "calm",
      message: `${recent.length} signals monitored, no anomalies detected.`,
    };
  }
}
