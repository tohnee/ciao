import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = "/Users/tc/Downloads/ciao";

async function write(relativePath, content) {
  const filePath = join(root, relativePath);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

const files = {
  "apps/web/package.json": `{
  "name": "@ciao/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "prisma:generate": "prisma generate"
  },
  "dependencies": {
    "@ciao/engine": "0.1.0",
    "@ciao/providers": "0.1.0",
    "@ciao/shared": "0.1.0",
    "@prisma/client": "^6.7.0",
    "clsx": "^2.1.1",
    "ioredis": "^5.8.2",
    "next": "^14.2.33",
    "next-auth": "^5.0.0-beta.25",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.25.76",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@types/react": "^18.3.26",
    "@types/react-dom": "^18.3.7",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.1",
    "eslint-config-next": "^14.2.33",
    "postcss": "^8.5.6",
    "prisma": "^6.7.0",
    "tailwindcss": "^3.4.17"
  }
}
`,
  "apps/web/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@ciao/shared": ["../../packages/shared/src/index.ts"],
      "@ciao/shared/*": ["../../packages/shared/src/*"],
      "@ciao/engine": ["../../packages/engine/src/index.ts"],
      "@ciao/engine/*": ["../../packages/engine/src/*"],
      "@ciao/providers": ["../../packages/providers/src/index.ts"],
      "@ciao/providers/*": ["../../packages/providers/src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
  "apps/web/next-env.d.ts": `/// <reference types="next" />
/// <reference types="next/image-types/global" />
`,
  "apps/web/next.config.ts": `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ciao/shared", "@ciao/engine", "@ciao/providers"],
};

export default nextConfig;
`,
  "apps/web/postcss.config.js": `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`,
  "apps/web/tailwind.config.ts": `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#FFFFFF",
        background: "#F9FAFB",
        border: "#F3F4F6",
        accent: "#3B82F6",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      borderRadius: {
        card: "12px",
        button: "8px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)"
      }
    }
  },
  plugins: [],
};

export default config;
`,
  "apps/web/.eslintrc.json": `{
  "extends": ["next/core-web-vitals"]
}
`,
  "apps/web/styles/globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  background: #f9fafb;
  color: #111827;
}

body {
  min-height: 100vh;
}
`,
  "apps/web/lib/api-helpers.ts": `import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
`,
  "apps/web/lib/prisma.ts": `import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
`,
  "apps/web/lib/redis.ts": `import Redis from "ioredis";

export function getRedisClient() {
  return new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });
}
`,
  "apps/web/lib/auth.ts": `export const authConfig = {
  providers: [],
};
`,
  "apps/web/lib/sse.ts": `export function createSSEMessage(event: unknown) {
  return \`data: \${JSON.stringify(event)}\\n\\n\`;
}
`,
  "apps/web/lib/mock-data.ts": `import type {
  DecisionCard,
  HomePayload,
  Intent,
  Outcome,
  OutcomeCard,
  Signal,
} from "@ciao/shared";

export const mockHomePayload: HomePayload = {
  greeting: "Good evening.",
  calmState: "needs_you",
  summary: "One decision needs you. Two loops are running quietly.",
  backgroundLoopCount: 2,
  now: [
    {
      intentId: "intent_oauth",
      title: "OAuth callback stability",
      state: "Working",
      message: "CIAO is testing a minimal patch.",
      costMode: "Frugal",
      risk: "Auth-sensitive",
      confidence: "medium",
    },
  ],
  decisions: [
    {
      id: "decision_oauth_path",
      intentId: "intent_oauth",
      intentTitle: "Fix OAuth callback stability",
      title: "Safer path available",
      question: "Should CIAO use the smaller fix first?",
      recommendation: "minimal",
      options: [
        { id: "minimal", label: "Approve minimal", description: "Lower risk and faster." },
        { id: "refactor", label: "Try broader", description: "Cleaner but riskier." },
        { id: "pause", label: "Pause", description: "Stop here and summarize." }
      ],
      severity: "high",
      createdAt: new Date().toISOString(),
    },
  ],
  outcomes: [
    {
      id: "outcome_oauth",
      intentId: "intent_oauth",
      title: "OAuth callback flow stabilized",
      summary: "CIAO prepared a conservative fix and verification path.",
      confidence: "medium",
      costLabel: "Frugal · 41% below normal",
      state: "ready",
      createdAt: new Date().toISOString(),
    },
  ],
};

export const mockIntent: Intent = {
  id: "intent_oauth",
  workspaceId: "workspace_demo",
  rawInput: "/ship 修复 OAuth callback test，不能改 public API，预算低，今天完成",
  title: "Fix OAuth callback stability",
  interpretedGoal: "Stabilize the OAuth callback flow without changing the public API.",
  constraints: ["Keep public API stable", "Prefer low-cost execution"],
  desiredOutcome: "A verified patch prepared for acceptance",
  mode: "ship",
  costMode: "frugal",
  state: "working",
  importance: "high",
  riskLevel: "high",
  previewMessage: "CIAO will take the conservative path and only interrupt for key judgment calls.",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockSignals: Signal[] = [
  {
    id: "signal_progress",
    intentId: "intent_oauth",
    kind: "progress",
    level: "medium",
    message: "CIAO is working through a focused auth-safe patch.",
    compact: true,
    createdAt: new Date().toISOString(),
  },
];

export const mockOutcome: Outcome = {
  id: "outcome_oauth",
  intentId: "intent_oauth",
  title: "OAuth callback flow stabilized",
  summary: "Prepared a calm, low-risk delivery path for the auth callback fix.",
  changed: ["Callback handler", "Regression test"],
  verified: ["Targeted auth regression checks prepared"],
  risks: ["Auth-sensitive area still requires review before shipping"],
  costSummary: {
    mode: "frugal",
    label: "Frugal · 41% below normal",
  },
  receipt: {
    intent: "Fix OAuth callback stability",
    mode: "ship",
    costMode: "frugal",
  },
  confidence: "medium",
  state: "ready",
  createdAt: new Date().toISOString(),
};

export const mockOutcomes: OutcomeCard[] = mockHomePayload.outcomes;
export const mockDecisions: DecisionCard[] = mockHomePayload.decisions;
`,
  "apps/web/stores/home.ts": `"use client";

import { create } from "zustand";
import type { HomePayload, SSEEvent } from "@ciao/shared";
import { mockHomePayload } from "@/lib/mock-data";

type HomeState = HomePayload & {
  isLoading: boolean;
  fetchHome: () => Promise<void>;
  handleEvent: (event: SSEEvent) => void;
};

export const useHomeStore = create<HomeState>((set) => ({
  ...mockHomePayload,
  isLoading: false,
  fetchHome: async () => {
    set({ ...mockHomePayload, isLoading: false });
  },
  handleEvent: (event) => {
    if (event.type === "calm_state_changed") {
      set({ calmState: event.data.calmState, summary: event.data.summary });
    }
  },
}));
`,
  "apps/web/stores/command.ts": `"use client";

import { create } from "zustand";
import type { CostMode, IntentMode, IntentPreview } from "@ciao/shared";

type CommandState = {
  isOpen: boolean;
  rawInput: string;
  mode: IntentMode | null;
  costMode: CostMode;
  preview: IntentPreview | null;
  open: () => void;
  close: () => void;
  setInput: (value: string) => void;
  setMode: (value: IntentMode) => void;
  setCostMode: (value: CostMode) => void;
  setPreview: (preview: IntentPreview | null) => void;
};

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  rawInput: "",
  mode: null,
  costMode: "balanced",
  preview: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setInput: (rawInput) => set({ rawInput }),
  setMode: (mode) => set({ mode }),
  setCostMode: (costMode) => set({ costMode }),
  setPreview: (preview) => set({ preview }),
}));
`,
  "apps/web/hooks/useSSE.ts": `"use client";

import { useEffect } from "react";

export function useSSE() {
  useEffect(() => {
    const source = new EventSource("/api/events");
    return () => source.close();
  }, []);
}
`,
  "apps/web/hooks/useHome.ts": `"use client";

import { useHomeStore } from "@/stores/home";

export function useHome() {
  return useHomeStore();
}
`,
  "apps/web/hooks/useIntent.ts": `import { mockIntent, mockSignals, mockOutcome } from "@/lib/mock-data";

export async function getIntentDetail() {
  return {
    intent: mockIntent,
    currentSignals: mockSignals,
    activeLoopSummary: "Testing a minimal patch",
    decisions: [],
    outcomes: [mockOutcome],
  };
}
`,
  "apps/web/components/shared/Card.tsx": `import type { PropsWithChildren } from "react";
import clsx from "clsx";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return <div className={clsx("rounded-card bg-white p-6 shadow-card", className)}>{children}</div>;
}
`,
  "apps/web/components/shared/Button.tsx": `import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: Variant;
};

const styles: Record<Variant, string> = {
  primary: "bg-accent text-white",
  secondary: "border border-gray-200 bg-white text-gray-900",
  ghost: "bg-transparent text-gray-600",
};

export function Button({ className, variant = "secondary", children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx("rounded-button px-3 py-2 text-sm font-medium transition", styles[variant], className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
`,
  "apps/web/components/shared/Badge.tsx": `import type { PropsWithChildren } from "react";
import clsx from "clsx";

type BadgeProps = PropsWithChildren<{
  tone?: "neutral" | "success" | "warning" | "danger";
}>;

const tones = {
  neutral: "bg-gray-100 text-gray-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

export function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={clsx("rounded-full px-2 py-1 text-xs", tones[tone])}>{children}</span>;
}
`,
  "apps/web/components/shared/Expandable.tsx": `import type { PropsWithChildren } from "react";

export function Expandable({ children }: PropsWithChildren) {
  return <details className="text-sm text-gray-600"><summary>Show details</summary><div className="mt-3">{children}</div></details>;
}
`,
  "apps/web/components/shared/EmptyState.tsx": `export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-gray-200 p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
`,
  "apps/web/components/shared/CostLabel.tsx": `import { Badge } from "@/components/shared/Badge";

export function CostLabel({ label }: { label: string }) {
  return <Badge>{label}</Badge>;
}
`,
  "apps/web/components/layout/Nav.tsx": `import Link from "next/link";

const items = [
  { href: "/home", label: "Home" },
  { href: "/decisions", label: "Decisions" },
  { href: "/outcomes", label: "Outcomes" },
  { href: "/memory", label: "Memory" },
  { href: "/advanced", label: "Advanced" },
];

export function Nav() {
  return (
    <nav className="flex flex-col gap-3">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="text-sm text-gray-600 transition hover:text-gray-900">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
`,
  "apps/web/components/layout/Header.tsx": `export function Header() {
  return (
    <header className="mb-10 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">CIAO</p>
        <h1 className="text-2xl font-light text-gray-900">Calm control surface</h1>
      </div>
      <div className="rounded-full bg-white px-3 py-2 text-sm text-gray-500 shadow-card">⌘K</div>
    </header>
  );
}
`,
  "apps/web/components/layout/Shell.tsx": `import type { PropsWithChildren } from "react";
import { Header } from "@/components/layout/Header";
import { Nav } from "@/components/layout/Nav";

export function Shell({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-10 px-6 py-8">
      <aside className="hidden w-44 shrink-0 lg:block">
        <Nav />
      </aside>
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </div>
  );
}
`,
  "apps/web/components/home/CalmStatus.tsx": `export function CalmStatus({ summary }: { summary: string }) {
  return <p className="text-3xl font-light tracking-tight text-gray-900">{summary}</p>;
}
`,
  "apps/web/components/home/NowCard.tsx": `import type { NowCard as NowCardType } from "@ciao/shared";
import { Badge } from "@/components/shared/Badge";
import { Card } from "@/components/shared/Card";

export function NowCard({ card }: { card: NowCardType }) {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900">{card.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{card.message}</p>
      </div>
      <div className="flex gap-2">
        <Badge>{card.costMode}</Badge>
        <Badge tone="warning">{card.risk}</Badge>
        <Badge>{card.confidence}</Badge>
      </div>
    </Card>
  );
}
`,
  "apps/web/components/home/DecisionCard.tsx": `import type { DecisionCard as DecisionCardType } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";

export function DecisionCard({ card }: { card: DecisionCardType }) {
  return (
    <Card className="space-y-4 border-l-4 border-amber-400">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">{card.intentTitle}</p>
        <h3 className="mt-2 text-base font-medium text-gray-900">{card.question}</h3>
        {card.recommendation ? (
          <p className="mt-2 text-sm text-gray-600">Recommended: {card.recommendation}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {card.options.map((option, index) => (
          <Button key={option.id} variant={index === 0 ? "primary" : "secondary"}>
            {option.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}
`,
  "apps/web/components/home/OutcomeCard.tsx": `import type { OutcomeCard as OutcomeCardType } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { CostLabel } from "@/components/shared/CostLabel";

export function OutcomeCard({ card }: { card: OutcomeCardType }) {
  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-900">{card.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{card.summary}</p>
      </div>
      <CostLabel label={card.costLabel} />
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">Accept</Button>
        <Button>Review diff</Button>
        <Button>Revert</Button>
        <Button>Save memory</Button>
      </div>
    </Card>
  );
}
`,
  "apps/web/components/command/ModeSelector.tsx": `"use client";

import type { CostMode, IntentMode } from "@ciao/shared";

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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={selectedMode === mode ? "rounded-full bg-accent px-3 py-1 text-sm text-white" : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"}
            onClick={() => onModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {costModes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={selectedCostMode === mode ? "rounded-full bg-gray-900 px-3 py-1 text-sm text-white" : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"}
            onClick={() => onCostModeChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}
`,
  "apps/web/components/command/IntentPreview.tsx": `import type { IntentPreview } from "@ciao/shared";
import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";

export function IntentPreviewCard({ preview }: { preview: IntentPreview }) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">CIAO understands</p>
        <h3 className="mt-2 text-lg font-medium text-gray-900">{preview.interpretedGoal}</h3>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Mode: {preview.mode}</p>
        <p>Cost: {preview.costMode}</p>
        <ul className="list-disc pl-5">
          {preview.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
        <Button variant="primary">Start</Button>
        <Button>Adjust</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </Card>
  );
}
`,
  "apps/web/components/command/CommandBar.tsx": `"use client";

import { useMemo } from "react";
import { ModeSelector } from "@/components/command/ModeSelector";
import { IntentPreviewCard } from "@/components/command/IntentPreview";
import { useCommandStore } from "@/stores/command";

export function CommandBar() {
  const {
    rawInput,
    mode,
    costMode,
    preview,
    setInput,
    setMode,
    setCostMode,
    setPreview,
  } = useCommandStore();

  const computedPreview = useMemo(() => {
    if (!rawInput.trim()) {
      return null;
    }
    return {
      title: "Intent preview",
      interpretedGoal: rawInput.trim(),
      mode: mode ?? "ship",
      costMode,
      constraints: ["Keep the surface calm", "Stay focused on the requested outcome"],
      riskHints: rawInput.toLowerCase().includes("auth") ? ["auth"] : [],
      previewMessage: "CIAO will begin with a focused, conservative path.",
    } as const;
  }, [costMode, mode, rawInput]);

  return (
    <div className="space-y-4 rounded-card bg-white p-6 shadow-card">
      <textarea
        className="min-h-28 w-full resize-none rounded-card border border-gray-100 p-4 text-base outline-none"
        placeholder="What should CIAO take care of?"
        value={rawInput}
        onChange={(event) => {
          const value = event.target.value;
          setInput(value);
          setPreview(null);
        }}
      />
      <ModeSelector
        selectedMode={mode}
        selectedCostMode={costMode}
        onModeChange={setMode}
        onCostModeChange={setCostMode}
      />
      {computedPreview ? <IntentPreviewCard preview={preview ?? computedPreview} /> : null}
    </div>
  );
}
`,
  "apps/web/components/intent/ControlGestures.tsx": `import { Button } from "@/components/shared/Button";

const actions = ["Pause", "Tighten", "Explore", "Go deeper", "Stop"];

export function ControlGestures() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button key={action}>{action}</Button>
      ))}
    </div>
  );
}
`,
  "apps/web/components/intent/SignalFeed.tsx": `import type { Signal } from "@ciao/shared";

export function SignalFeed({ signals }: { signals: Signal[] }) {
  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <div key={signal.id} className="rounded-card bg-white p-4 shadow-card">
          <p className="text-sm font-medium text-gray-900">{signal.kind}</p>
          <p className="mt-1 text-sm text-gray-600">{signal.message}</p>
        </div>
      ))}
    </div>
  );
}
`,
  "apps/web/components/intent/IntentDetail.tsx": `import type { Intent, Outcome, Signal } from "@ciao/shared";
import { ControlGestures } from "@/components/intent/ControlGestures";
import { SignalFeed } from "@/components/intent/SignalFeed";
import { Receipt } from "@/components/outcome/Receipt";

export function IntentDetail({
  intent,
  signals,
  outcomes,
}: {
  intent: Intent;
  signals: Signal[];
  outcomes: Outcome[];
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-card bg-white p-6 shadow-card">
        <p className="text-sm text-gray-500">{intent.mode} · {intent.costMode} · {intent.riskLevel}</p>
        <h2 className="mt-2 text-2xl font-light text-gray-900">{intent.title}</h2>
        <p className="mt-3 text-sm text-gray-600">{intent.previewMessage}</p>
      </section>
      <ControlGestures />
      <SignalFeed signals={signals} />
      {outcomes.map((outcome) => (
        <Receipt key={outcome.id} outcome={outcome} />
      ))}
    </div>
  );
}
`,
  "apps/web/components/decision/DecisionInbox.tsx": `import type { DecisionCard } from "@ciao/shared";
import { DecisionCard as DecisionCardView } from "@/components/home/DecisionCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function DecisionInbox({ decisions }: { decisions: DecisionCard[] }) {
  if (decisions.length === 0) {
    return <EmptyState title="No decisions waiting" description="CIAO only interrupts when a judgment call matters." />;
  }
  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <DecisionCardView key={decision.id} card={decision} />
      ))}
    </div>
  );
}
`,
  "apps/web/components/outcome/Receipt.tsx": `import type { Outcome } from "@ciao/shared";
import { Card } from "@/components/shared/Card";
import { Expandable } from "@/components/shared/Expandable";

export function Receipt({ outcome }: { outcome: Outcome }) {
  return (
    <Card className="space-y-3">
      <div>
        <h3 className="text-base font-medium text-gray-900">{outcome.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{outcome.summary}</p>
      </div>
      <Expandable>
        <pre className="overflow-auto text-xs text-gray-500">{JSON.stringify(outcome.receipt, null, 2)}</pre>
      </Expandable>
    </Card>
  );
}
`,
  "apps/web/components/outcome/OutcomeStream.tsx": `import type { OutcomeCard } from "@ciao/shared";
import { OutcomeCard as OutcomeCardView } from "@/components/home/OutcomeCard";
import { EmptyState } from "@/components/shared/EmptyState";

export function OutcomeStream({ outcomes }: { outcomes: OutcomeCard[] }) {
  if (outcomes.length === 0) {
    return <EmptyState title="No outcomes yet" description="Completed outcomes appear here when CIAO is ready for acceptance." />;
  }
  return (
    <div className="space-y-4">
      {outcomes.map((outcome) => (
        <OutcomeCardView key={outcome.id} card={outcome} />
      ))}
    </div>
  );
}
`,
  "apps/web/components/memory/MemoryList.tsx": `import type { Memory } from "@ciao/shared";
import { EmptyState } from "@/components/shared/EmptyState";

export function MemoryList({ memories }: { memories: Memory[] }) {
  if (memories.length === 0) {
    return <EmptyState title="No learned patterns yet" description="Memory suggestions appear after successful outcomes." />;
  }
  return (
    <div className="space-y-4">
      {memories.map((memory) => (
        <div key={memory.id} className="rounded-card bg-white p-6 shadow-card">
          <h3 className="text-base font-medium text-gray-900">{memory.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{memory.compactRule}</p>
        </div>
      ))}
    </div>
  );
}
`,
  "apps/web/app/layout.tsx": `import type { Metadata } from "next";
import "@/styles/globals.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "CIAO",
  description: "Calm control surface for an agentic engineering organization.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
`,
  "apps/web/app/page.tsx": `import { redirect } from "next/navigation";

export default function IndexPage() {
  redirect("/home");
}
`,
  "apps/web/app/home/page.tsx": `import { CommandBar } from "@/components/command/CommandBar";
import { CalmStatus } from "@/components/home/CalmStatus";
import { DecisionCard } from "@/components/home/DecisionCard";
import { NowCard } from "@/components/home/NowCard";
import { OutcomeCard } from "@/components/home/OutcomeCard";
import { mockHomePayload } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <CalmStatus summary={mockHomePayload.summary} />
      <CommandBar />
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Now</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockHomePayload.now.map((card) => (
            <NowCard key={card.intentId} card={card} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Needs You</h2>
        <div className="space-y-4">
          {mockHomePayload.decisions.map((card) => (
            <DecisionCard key={card.id} card={card} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Outcomes</h2>
        <div className="space-y-4">
          {mockHomePayload.outcomes.map((card) => (
            <OutcomeCard key={card.id} card={card} />
          ))}
        </div>
      </section>
    </div>
  );
}
`,
  "apps/web/app/command/page.tsx": `import { CommandBar } from "@/components/command/CommandBar";

export default function CommandPage() {
  return <CommandBar />;
}
`,
  "apps/web/app/intents/page.tsx": `import Link from "next/link";
import { mockIntent } from "@/lib/mock-data";

export default function IntentsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium text-gray-900">Intents</h2>
      <Link className="text-sm text-accent" href={\`/intents/\${mockIntent.id}\`}>
        {mockIntent.title}
      </Link>
    </div>
  );
}
`,
  "apps/web/app/intents/[id]/page.tsx": `import { IntentDetail } from "@/components/intent/IntentDetail";
import { getIntentDetail } from "@/hooks/useIntent";

export default async function IntentPage() {
  const detail = await getIntentDetail();
  return <IntentDetail intent={detail.intent} signals={detail.currentSignals} outcomes={detail.outcomes} />;
}
`,
  "apps/web/app/decisions/page.tsx": `import { DecisionInbox } from "@/components/decision/DecisionInbox";
import { mockDecisions } from "@/lib/mock-data";

export default function DecisionsPage() {
  return <DecisionInbox decisions={mockDecisions} />;
}
`,
  "apps/web/app/outcomes/page.tsx": `import { OutcomeStream } from "@/components/outcome/OutcomeStream";
import { mockOutcomes } from "@/lib/mock-data";

export default function OutcomesPage() {
  return <OutcomeStream outcomes={mockOutcomes} />;
}
`,
  "apps/web/app/memory/page.tsx": `import { MemoryList } from "@/components/memory/MemoryList";

export default function MemoryPage() {
  return <MemoryList memories={[]} />;
}
`,
  "apps/web/app/advanced/page.tsx": `export default function AdvancedPage() {
  return (
    <div className="rounded-card bg-white p-6 shadow-card">
      <h2 className="text-xl font-medium text-gray-900">Advanced</h2>
      <p className="mt-2 text-sm text-gray-600">Raw logs, providers, runtimes, and policies stay tucked away here.</p>
    </div>
  );
}
`,
  "apps/web/app/api/home/route.ts": `import { mockHomePayload } from "@/lib/mock-data";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok(mockHomePayload);
}
`,
  "apps/web/app/api/intents/route.ts": `import { mockIntent } from "@/lib/mock-data";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok({ intents: [mockIntent], total: 1 });
}

export async function POST() {
  return ok({
    intent: mockIntent,
    preview: {
      title: mockIntent.title,
      interpretedGoal: mockIntent.interpretedGoal,
      mode: mockIntent.mode,
      costMode: mockIntent.costMode,
      constraints: mockIntent.constraints,
      riskHints: ["auth"],
      previewMessage: mockIntent.previewMessage ?? "",
    },
  });
}
`,
  "apps/web/app/api/intents/[id]/route.ts": `import { mockIntent, mockOutcome, mockSignals } from "@/lib/mock-data";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok({
    intent: mockIntent,
    currentSignals: mockSignals,
    activeLoopSummary: "Testing a minimal patch",
    decisions: [],
    outcomes: [mockOutcome],
  });
}
`,
  "apps/web/app/api/decisions/route.ts": `import { mockDecisions } from "@/lib/mock-data";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok({ decisions: mockDecisions });
}
`,
  "apps/web/app/api/decisions/[id]/resolve/route.ts": `import { ok } from "@/lib/api-helpers";

export async function POST() {
  return ok({ message: "Decision resolved. Loop resuming." });
}
`,
  "apps/web/app/api/outcomes/route.ts": `import { mockOutcomes } from "@/lib/mock-data";
import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok({ outcomes: mockOutcomes });
}
`,
  "apps/web/app/api/memories/route.ts": `import { ok } from "@/lib/api-helpers";

export async function GET() {
  return ok({ memories: [], total: 0 });
}
`,
  "apps/web/app/api/memories/[id]/route.ts": `import { ok } from "@/lib/api-helpers";

export async function PATCH() {
  return ok({ memory: null });
}

export async function DELETE() {
  return ok({ success: true });
}
`,
  "apps/web/app/api/events/route.ts": `import { createSSEMessage } from "@/lib/sse";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(createSSEMessage({
        type: "calm_state_changed",
        data: { calmState: "working", summary: "CIAO is working quietly." },
      })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
`,
  "apps/web/prisma/schema.prisma": `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cao {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  settings  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  intents   Intent[]
  memories  Memory[]
}

model Intent {
  id              String   @id @default(cuid())
  workspaceId     String
  rawInput        String
  title           String
  interpretedGoal String
  mode            String
  costMode        String   @default("balanced")
  state           String   @default("understanding")
  importance      String   @default("normal")
  riskLevel       String   @default("unknown")
  constraints     Json?
  desiredOutcome  String?
  previewMessage  String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  signals   Signal[]
  decisions Decision[]
  outcomes  Outcome[]
  loops     Loop[]
}

model Signal {
  id        String   @id @default(cuid())
  intentId  String
  kind      String
  level     String
  message   String
  compact   Boolean  @default(true)
  metadata  Json?
  createdAt DateTime @default(now())

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)
}

model Decision {
  id               String    @id @default(cuid())
  intentId         String
  title            String
  question         String
  recommendation   String?
  options          Json
  severity         String    @default("medium")
  state            String    @default("open")
  resolvedOptionId String?
  resolvedAt       DateTime?
  expiresAt        DateTime?
  createdAt        DateTime  @default(now())

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)
}

model Outcome {
  id          String   @id @default(cuid())
  intentId    String
  title       String
  summary     String
  changed     Json?
  verified    Json?
  risks       Json?
  confidence  String
  costSummary Json?
  receipt     Json?
  state       String   @default("ready")
  createdAt   DateTime @default(now())

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)
}

model Memory {
  id            String   @id @default(cuid())
  workspaceId   String
  title         String
  trigger       String
  compactRule   String
  fullProcedure String?
  examples      Json?
  confidence    Float    @default(0.5)
  status        String   @default("active")
  lastUsedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}

model Loop {
  id              String   @id @default(cuid())
  intentId        String
  kind            String
  state           String   @default("queued")
  parentLoopId    String?
  costMode        String
  modelTier       String?
  contextBundleId String?
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())

  intent Intent @relation(fields: [intentId], references: [id], onDelete: Cascade)
}

model CapabilityRun {
  id          String   @id @default(cuid())
  loopId      String
  kind        String
  provider    String?
  model       String?
  state       String   @default("queued")
  inputRef    String?
  outputRef   String?
  usage       Json?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())
}

model ContextBundle {
  id               String   @id @default(cuid())
  intentId         String
  loopId           String?
  phase            String
  compactPrompt    String   @db.Text
  refs             Json?
  estimatedTokens  Int
  compressionLevel Int      @default(0)
  createdAt        DateTime @default(now())
}

model TechnicalTrace {
  id               String   @id @default(cuid())
  intentId         String
  loopId           String?
  kind             String
  title            String
  content          Json
  visibleByDefault Boolean  @default(false)
  createdAt        DateTime @default(now())
}

model TokenLedger {
  id               String   @id @default(cuid())
  workspaceId      String
  intentId         String?
  loopId           String?
  capabilityRunId  String?
  provider         String
  model            String
  phase            String
  inputTokens      Int      @default(0)
  outputTokens     Int      @default(0)
  cacheReadTokens  Int      @default(0)
  cacheWriteTokens Int      @default(0)
  estimatedUsd     Decimal? @db.Decimal(10, 6)
  createdAt        DateTime @default(now())
}

model ProviderConfig {
  id          String   @id @default(cuid())
  workspaceId String
  provider    String
  apiKey      String
  models      Json?
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`,
  "packages/shared/package.json": `{
  "name": "@ciao/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "zod": "^3.25.76"
  }
}
`,
  "packages/shared/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}
`,
  "packages/shared/src/types/cost.ts": `export type CostMode = "frugal" | "balanced" | "thorough";
export type ModelTier = "small" | "medium" | "strong";
`,
  "packages/shared/src/types/intent.ts": `import type { CostMode } from "./cost";

export type IntentMode = "ask" | "draft" | "act" | "ship" | "watch" | "review";
export type IntentState =
  | "understanding"
  | "working"
  | "needs_decision"
  | "ready"
  | "accepted"
  | "paused"
  | "blocked"
  | "archived";

export type Intent = {
  id: string;
  workspaceId: string;
  rawInput: string;
  title: string;
  interpretedGoal: string;
  constraints: string[];
  desiredOutcome?: string;
  mode: IntentMode;
  costMode: CostMode;
  state: IntentState;
  importance: "low" | "normal" | "high";
  riskLevel: "unknown" | "low" | "medium" | "high";
  previewMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export type IntentPreview = {
  title: string;
  interpretedGoal: string;
  mode: IntentMode;
  costMode: CostMode;
  constraints: string[];
  riskHints: string[];
  previewMessage: string;
};
`,
  "packages/shared/src/types/loop.ts": `import type { CostMode, ModelTier } from "./cost";

export type LoopKind = "understand" | "plan" | "search" | "edit" | "test" | "review" | "summarize" | "remember" | "monitor";

export type Loop = {
  id: string;
  intentId: string;
  kind: LoopKind;
  state: "queued" | "running" | "completed" | "failed" | "paused";
  costMode: CostMode;
  modelTier?: ModelTier;
};
`,
  "packages/shared/src/types/signal.ts": `export type SignalKind = "progress" | "risk" | "cost" | "confidence" | "blocker" | "decision" | "result";
export type SignalLevel = "low" | "medium" | "high";

export type Signal = {
  id: string;
  intentId: string;
  kind: SignalKind;
  level: SignalLevel;
  message: string;
  compact: boolean;
  createdAt: string;
};
`,
  "packages/shared/src/types/decision.ts": `export type DecisionOption = {
  id: string;
  label: string;
  description?: string;
  impact?: {
    cost?: "lower" | "normal" | "higher";
    risk?: "lower" | "normal" | "higher";
    speed?: "slower" | "normal" | "faster";
  };
};

export type Decision = {
  id: string;
  intentId: string;
  title: string;
  question: string;
  recommendation?: string | null;
  options: DecisionOption[];
  severity: "low" | "medium" | "high";
  state: "open" | "resolved" | "dismissed" | "expired";
  createdAt: string;
};

export type DecisionCard = Decision & {
  intentTitle: string;
};
`,
  "packages/shared/src/types/outcome.ts": `export type Outcome = {
  id: string;
  intentId: string;
  title: string;
  summary: string;
  changed: string[];
  verified: string[];
  risks: string[];
  costSummary: {
    mode: "frugal" | "balanced" | "thorough";
    label: string;
  };
  receipt?: Record<string, unknown>;
  confidence: "low" | "medium" | "high";
  state: "ready" | "accepted" | "reverted" | "archived";
  createdAt: string;
};

export type OutcomeCard = {
  id: string;
  intentId: string;
  title: string;
  summary: string;
  confidence: "low" | "medium" | "high";
  costLabel: string;
  state: string;
  createdAt: string;
};
`,
  "packages/shared/src/types/memory.ts": `export type Memory = {
  id: string;
  workspaceId: string;
  title: string;
  trigger: string;
  compactRule: string;
  fullProcedure?: string;
  examples?: string[];
  confidence: number;
  status: "active" | "disabled" | "archived";
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
};
`,
  "packages/shared/src/types/home.ts": `import type { DecisionCard } from "./decision";
import type { OutcomeCard } from "./outcome";

export type NowCard = {
  intentId: string;
  title: string;
  state: string;
  message: string;
  costMode: string;
  risk: string;
  confidence: "low" | "medium" | "high";
};

export type HomePayload = {
  greeting: string;
  calmState: "calm" | "working" | "needs_you" | "attention";
  summary: string;
  now: NowCard[];
  backgroundLoopCount: number;
  decisions: DecisionCard[];
  outcomes: OutcomeCard[];
};

export type SSEEvent =
  | { type: "signal"; data: unknown }
  | { type: "decision_created"; data: DecisionCard }
  | { type: "outcome_ready"; data: OutcomeCard }
  | { type: "intent_state_changed"; data: { intentId: string; state: string } }
  | { type: "calm_state_changed"; data: { calmState: HomePayload["calmState"]; summary: string } }
  | { type: "loop_progress"; data: { intentId: string; message: string } };
`,
  "packages/shared/src/constants.ts": `import type { CostMode, ModelTier } from "./types/cost";
import type { IntentMode } from "./types/intent";
import type { LoopKind } from "./types/loop";

export const INTENT_MODES: IntentMode[] = ["ask", "draft", "act", "ship", "watch", "review"];
export const COST_MODES: CostMode[] = ["frugal", "balanced", "thorough"];
export const LOOP_KINDS: LoopKind[] = ["understand", "plan", "search", "edit", "test", "review", "summarize", "remember", "monitor"];
export const MODEL_TIERS: ModelTier[] = ["small", "medium", "strong"];
`,
  "packages/shared/src/utils.ts": `import type { CostMode } from "./types/cost";

export function formatCostModeLabel(mode: CostMode) {
  if (mode === "frugal") return "Frugal";
  if (mode === "thorough") return "Thorough";
  return "Balanced";
}
`,
  "packages/shared/src/validators.ts": `import { z } from "zod";

export const intentModeSchema = z.enum(["ask", "draft", "act", "ship", "watch", "review"]);
export const costModeSchema = z.enum(["frugal", "balanced", "thorough"]);

export const createIntentSchema = z.object({
  rawInput: z.string().min(1),
  mode: intentModeSchema.optional(),
  costMode: costModeSchema.optional(),
  importance: z.enum(["low", "normal", "high"]).optional(),
  autoStart: z.boolean().optional(),
});
`,
  "packages/shared/src/index.ts": `export * from "./constants";
export * from "./utils";
export * from "./validators";
export * from "./types/cost";
export * from "./types/intent";
export * from "./types/loop";
export * from "./types/signal";
export * from "./types/decision";
export * from "./types/outcome";
export * from "./types/memory";
export * from "./types/home";
`,
  "packages/engine/package.json": `{
  "name": "@ciao/engine",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@ciao/shared": "0.1.0"
  }
}
`,
  "packages/engine/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}
`,
  "packages/engine/src/types.ts": `import type { Intent, Loop, Signal } from "@ciao/shared";

export type GovernorContext = {
  intent: Intent;
  loops: Loop[];
  signals: Signal[];
  confidence: number;
};

export type NextStep =
  | { type: "run_capability"; capability: string }
  | { type: "ask_decision"; title: string; question: string }
  | { type: "build_outcome" }
  | { type: "pause"; reason: string };
`,
  "packages/engine/src/cost-governor.ts": `import type { CostMode, ModelTier } from "@ciao/shared";

export type CostPolicy = {
  maxContextTokens: number;
  preferredModelTier: ModelTier;
  maxLoopsPerIntent: number;
  allowModelEscalation: boolean;
  reviewRequired: boolean;
};

export function getCostPolicy(costMode: CostMode): CostPolicy {
  if (costMode === "frugal") {
    return {
      maxContextTokens: 4000,
      preferredModelTier: "small",
      maxLoopsPerIntent: 5,
      allowModelEscalation: false,
      reviewRequired: false,
    };
  }

  if (costMode === "thorough") {
    return {
      maxContextTokens: 64000,
      preferredModelTier: "strong",
      maxLoopsPerIntent: 25,
      allowModelEscalation: true,
      reviewRequired: true,
    };
  }

  return {
    maxContextTokens: 16000,
    preferredModelTier: "medium",
    maxLoopsPerIntent: 12,
    allowModelEscalation: true,
    reviewRequired: false,
  };
}
`,
  "packages/engine/src/risk-sentinel.ts": `export type RiskAssessment = {
  level: "low" | "medium" | "high";
  domain: string | null;
  requiresDecision: boolean;
};

const highRiskPatterns = [/auth/i, /oauth/i, /billing/i, /payment/i, /secret/i, /public.?api/i, /delete/i];
const mediumRiskPatterns = [/database/i, /schema/i, /deploy/i, /config/i];

export function assessRisk(text: string): RiskAssessment {
  for (const pattern of highRiskPatterns) {
    if (pattern.test(text)) {
      return { level: "high", domain: pattern.source, requiresDecision: true };
    }
  }

  for (const pattern of mediumRiskPatterns) {
    if (pattern.test(text)) {
      return { level: "medium", domain: pattern.source, requiresDecision: false };
    }
  }

  return { level: "low", domain: null, requiresDecision: false };
}
`,
  "packages/engine/src/model-router.ts": `import type { ModelTier } from "@ciao/shared";

const MODEL_MAP: Record<string, Record<ModelTier, string>> = {
  openai: {
    small: "gpt-4o-mini",
    medium: "gpt-4o",
    strong: "o1",
  },
  anthropic: {
    small: "claude-3-haiku-20240307",
    medium: "claude-sonnet-4-20250514",
    strong: "claude-opus-4-20250514",
  },
};

export function selectModel(provider: string, preferredTier: ModelTier, confidence: number) {
  const resolvedTier = confidence < 0.4 && preferredTier !== "strong"
    ? preferredTier === "small"
      ? "medium"
      : "strong"
    : preferredTier;

  return {
    tier: resolvedTier,
    model: MODEL_MAP[provider]?.[resolvedTier] ?? MODEL_MAP.openai[resolvedTier],
  };
}
`,
  "packages/engine/src/governor.ts": `import type { IntentMode, LoopKind } from "@ciao/shared";
import type { GovernorContext, NextStep } from "./types";

function hasCompletedLoop(context: GovernorContext, kind: LoopKind) {
  return context.loops.some((loop) => loop.kind === kind && loop.state === "completed");
}

function handleShipMode(context: GovernorContext): NextStep {
  if (!hasCompletedLoop(context, "plan")) {
    return { type: "run_capability", capability: "plan_change" };
  }
  if (!hasCompletedLoop(context, "edit")) {
    return { type: "run_capability", capability: "edit_code" };
  }
  if (!hasCompletedLoop(context, "test")) {
    return { type: "run_capability", capability: "run_tests" };
  }
  if (!hasCompletedLoop(context, "review")) {
    return { type: "run_capability", capability: "review_diff" };
  }
  return { type: "build_outcome" };
}

function handleMode(mode: IntentMode, context: GovernorContext): NextStep {
  if (mode === "ask") {
    return { type: "run_capability", capability: "summarize_result" };
  }
  if (mode === "review") {
    return { type: "run_capability", capability: "review_diff" };
  }
  if (mode === "watch") {
    return { type: "run_capability", capability: "monitor_signal" };
  }
  return handleShipMode(context);
}

export function determineNextStep(context: GovernorContext): NextStep {
  if (context.intent.riskLevel === "high" && context.intent.state !== "needs_decision") {
    return {
      type: "ask_decision",
      title: "High-risk area detected",
      question: "Should CIAO take the smaller path first?",
    };
  }

  return handleMode(context.intent.mode, context);
}
`,
  "packages/engine/src/context-compiler.ts": `export function compileContext(refs: string[]) {
  return {
    compactPrompt: refs.join("\\n"),
    refs,
    estimatedTokens: refs.length * 120,
  };
}
`,
  "packages/engine/src/signal-engine.ts": `export function summarizeSignal(message: string) {
  return {
    kind: "progress",
    level: "medium",
    message,
    detailsHidden: true,
  };
}
`,
  "packages/engine/src/decision-engine.ts": `export function buildDecision(question: string) {
  return {
    title: "Decision needed",
    question,
    recommendation: "minimal",
  };
}
`,
  "packages/engine/src/outcome-builder.ts": `export function buildOutcomeSummary(title: string) {
  return {
    title,
    summary: "CIAO prepared a concise delivery summary for review.",
  };
}
`,
  "packages/engine/src/memory-curator.ts": `export function extractMemory(title: string, compactRule: string) {
  return {
    title,
    compactRule,
    confidence: 0.5,
  };
}
`,
  "packages/engine/src/prompts/intent-interpreter.ts": `export function buildIntentInterpreterPrompt(rawInput: string) {
  return \`Interpret the CAO input into a structured intent. Input: \${rawInput}\`;
}
`,
  "packages/engine/src/prompts/signal-summarizer.ts": `export function buildSignalSummarizerPrompt(state: string) {
  return \`Summarize this state calmly for the CAO: \${state}\`;
}
`,
  "packages/engine/src/prompts/decision-builder.ts": `export function buildDecisionPrompt(question: string) {
  return \`Create the smallest possible decision card for: \${question}\`;
}
`,
  "packages/engine/src/prompts/outcome-builder.ts": `export function buildOutcomePrompt(title: string) {
  return \`Turn internal traces into a concise outcome card: \${title}\`;
}
`,
  "packages/engine/src/capabilities/interpret-intent.ts": `export function interpretIntent(input: string) {
  return {
    title: "Interpreted intent",
    interpretedGoal: input,
  };
}
`,
  "packages/engine/src/capabilities/compile-context.ts": `export { compileContext } from "../context-compiler";
`,
  "packages/engine/src/capabilities/select-files.ts": `export function selectFiles(candidates: string[]) {
  return candidates.slice(0, 5);
}
`,
  "packages/engine/src/capabilities/plan-change.ts": `export function planChange(goal: string) {
  return { title: "Focused plan", goal };
}
`,
  "packages/engine/src/capabilities/edit-code.ts": `export function editCode(summary: string) {
  return { summary };
}
`,
  "packages/engine/src/capabilities/run-tests.ts": `export function runTests() {
  return { passed: true, verified: ["foundation"] };
}
`,
  "packages/engine/src/capabilities/review-diff.ts": `export function reviewDiff() {
  return { approved: true };
}
`,
  "packages/engine/src/capabilities/summarize-result.ts": `export { buildOutcomeSummary as summarizeResult } from "../outcome-builder";
`,
  "packages/engine/src/capabilities/extract-memory.ts": `export { extractMemory } from "../memory-curator";
`,
  "packages/engine/src/capabilities/monitor-signal.ts": `export function monitorSignal() {
  return { status: "watching" };
}
`,
  "packages/engine/src/index.ts": `export * from "./types";
export * from "./governor";
export * from "./cost-governor";
export * from "./risk-sentinel";
export * from "./model-router";
export * from "./context-compiler";
export * from "./signal-engine";
export * from "./decision-engine";
export * from "./outcome-builder";
export * from "./memory-curator";
`,
  "packages/providers/package.json": `{
  "name": "@ciao/providers",
  "version": "0.1.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "lint": "tsc -p tsconfig.json --noEmit",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
`,
  "packages/providers/tsconfig.json": `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*.ts"]
}
`,
  "packages/providers/src/types.ts": `export type ProviderResult = {
  text: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
};

export type ProviderAdapter = {
  name: string;
  generate: (prompt: string) => Promise<ProviderResult>;
};
`,
  "packages/providers/src/mock.ts": `import type { ProviderAdapter } from "./types";

export const mockProvider: ProviderAdapter = {
  name: "mock",
  async generate(prompt) {
    return {
      text: \`Mock response for: \${prompt}\`,
      usage: {
        inputTokens: Math.max(1, prompt.length / 4),
        outputTokens: 42,
      },
    };
  },
};
`,
  "packages/providers/src/openai.ts": `import type { ProviderAdapter } from "./types";

export const openAIProvider: ProviderAdapter = {
  name: "openai",
  async generate(prompt) {
    return { text: \`OpenAI adapter placeholder for: \${prompt}\` };
  },
};
`,
  "packages/providers/src/anthropic.ts": `import type { ProviderAdapter } from "./types";

export const anthropicProvider: ProviderAdapter = {
  name: "anthropic",
  async generate(prompt) {
    return { text: \`Anthropic adapter placeholder for: \${prompt}\` };
  },
};
`,
  "packages/providers/src/index.ts": `export * from "./types";
export * from "./mock";
export * from "./openai";
export * from "./anthropic";
`,
  "workers/loop-worker.ts": `import { determineNextStep } from "@ciao/engine";
import { mockIntent } from "../apps/web/lib/mock-data";

export async function resumeIntent() {
  return determineNextStep({
    intent: mockIntent,
    loops: [],
    signals: [],
    confidence: 0.7,
  });
}
`,
};

const gestureRoutes = {
  "pause": "Paused.",
  "tighten": "Tightened. Using more conservative approach.",
  "explore": "Exploring more options.",
  "deeper": "Going deeper with stronger analysis.",
  "stop": "Stopped. Summary generated.",
};

for (const [action, message] of Object.entries(gestureRoutes)) {
  files[`apps/web/app/api/intents/[id]/${action}/route.ts`] = `import { ok } from "@/lib/api-helpers";

export async function POST() {
  return ok({ message: "${message}" });
}
`;
}

const outcomeRoutes = {
  accept: "Accepted.",
  revert: "Reverted.",
  "save-memory": "Memory saved.",
};

for (const [action, message] of Object.entries(outcomeRoutes)) {
  files[`apps/web/app/api/outcomes/[id]/${action}/route.ts`] = `import { ok } from "@/lib/api-helpers";

export async function POST() {
  return ok({ message: "${message}" });
}
`;
}

const internalRoutes = [
  "loops",
  "signals",
  "trace",
  "token-ledger",
  "outcomes/build",
  "context/compile",
  "capabilities/run",
];

for (const segment of internalRoutes) {
  files[`apps/web/app/api/internal/${segment}/route.ts`] = `import { ok } from "@/lib/api-helpers";

export async function POST() {
  return ok({ ok: true, route: "${segment}" });
}
`;
}

await Promise.all(
  Object.entries(files).map(([relativePath, content]) => write(relativePath, content)),
);
