"use client";

import { useState } from "react";

const MODES = [
  { value: "ask", label: "Ask", desc: "Research & answers" },
  { value: "draft", label: "Draft", desc: "Generate proposals" },
  { value: "act", label: "Act", desc: "Execute changes" },
  { value: "ship", label: "Ship", desc: "Full delivery" },
  { value: "watch", label: "Watch", desc: "Observe only" },
  { value: "review", label: "Review", desc: "Audit & feedback" },
] as const;

type Outcome = {
  id: string;
  title: string;
  summary: string;
  confidence: string;
  changed: string[];
  risks: string[];
  costSummary: { label: string; tokens: number };
  state: string;
  createdAt: string;
};

export default function TrialPage() {
  const [rawInput, setRawInput] = useState("");
  const [mode, setMode] = useState("ship");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ interpretedGoal: string; mode: string; confidence: string } | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setLoading(true);
    setError("");
    setPreview(null);
    setOutcome(null);

    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rawInput: rawInput.trim(), mode }),
      });

      if (!res.ok) {
        setError(`Error: ${res.status}`);
        return;
      }

      const data = await res.json();
      setPreview(data.preview);
      setOutcome(data.outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-emerald-600 text-xl font-bold text-white shadow-lg">
          C
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">Try CIAO</h1>
        <p className="mt-2 text-sm text-muted">
          Submit an intent below to see how CIAO interprets and processes it.
          No login required.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <textarea
          className="min-h-32 w-full resize-none rounded-xl border border-border bg-white p-5 text-sm leading-relaxed shadow-sm outline-none transition-colors placeholder:text-muted-light focus:border-accent focus:shadow-[0_0_0_3px_rgba(16,163,127,0.08)]"
          placeholder='e.g. "Fix the OAuth callback to handle expired tokens"'
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
        />

        {/* Mode selector */}
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
                mode === m.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-white text-muted hover:border-gray-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !rawInput.trim()}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </span>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {(preview || outcome) && (
        <div className="mt-8 space-y-5">
          {/* Preview */}
          {preview && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <span className="mb-2 inline-block rounded-md bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                PREVIEW
              </span>
              <h3 className="text-base font-medium text-gray-900">
                {preview.interpretedGoal}
              </h3>
              <div className="mt-2 flex gap-4 text-xs text-muted">
                <span>
                  Mode: <span className="font-medium text-gray-700">{preview.mode}</span>
                </span>
                <span>
                  Confidence:{" "}
                  <span className="font-medium text-gray-700">{preview.confidence}</span>
                </span>
              </div>
            </div>
          )}

          {/* Outcome */}
          {outcome && (
            <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <span className="mb-3 inline-block rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                OUTCOME
              </span>

              <p className="text-sm leading-relaxed text-gray-700">{outcome.summary}</p>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs text-muted">
                <div>
                  <span className="font-medium text-gray-700">Confidence:</span>{" "}
                  {outcome.confidence}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Cost:</span>{" "}
                  {outcome.costSummary.label} ({outcome.costSummary.tokens} tokens)
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span> {outcome.state}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>{" "}
                  {new Date(outcome.createdAt).toLocaleString()}
                </div>
              </div>

              {outcome.changed.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-medium text-gray-700">Files changed:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {outcome.changed.map((f, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-mono text-blue-600"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {outcome.risks.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-medium text-gray-700">Risks:</span>
                  <ul className="mt-1 space-y-1">
                    {outcome.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-amber-600">
                        <span>⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {!preview && !outcome && !error && (
        <div className="mt-10">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Try these examples
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Refactor the user authentication module to use JWT instead of session cookies",
              "Add rate limiting to the public API endpoints",
              "Write unit tests for the payment processing pipeline",
              "Optimize the database queries in the dashboard report generator",
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setRawInput(example)}
                className="rounded-lg border border-border bg-white px-4 py-3 text-left text-xs text-muted shadow-sm transition hover:border-accent hover:text-gray-700"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="mt-12 text-center text-xs text-muted">
        Trial mode uses mock AI responses.{" "}
        <a href="/register" className="text-accent hover:underline">
          Create an account
        </a>{" "}
        for the full experience with real AI providers.
      </p>
    </div>
  );
}
