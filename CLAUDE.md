# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # Start all apps/packages in dev mode (Turborepo)
npm run build        # Build all packages and apps
npm run test         # Run all tests via Vitest
npm run lint         # Lint all workspaces
npm run typecheck    # Type-check all workspaces
npm run prisma:generate          # Generate Prisma client
```

### Single test / watch mode

```sh
npx vitest run tests/foundation.test.ts           # Run a single test file
npx vitest --watch tests/home-api.test.ts          # Watch mode for a single file
```

### Infrastructure

```sh
docker compose up -d    # Start PostgreSQL + Redis (optional — SQLite is default)
```

### Setup

```sh
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

## Architecture

CIAO is an intent-driven AI agent system (v0.2). Users submit intents (e.g. `"/ship fix the OAuth callback"`), the system interprets, executes a governor-driven loop, raises decisions when stuck, and produces outcomes.

### Monorepo structure (npm workspaces + Turborepo)

```
apps/web/          — Next.js 14 (App Router) frontend + API routes
packages/shared/   — Shared TypeScript types, validators, constants
packages/engine/   — Core engine: governor, decision-engine, signal-engine, etc.
packages/providers/— LLM provider wrappers (Anthropic, OpenAI, mock)
packages/payments/ — Payment processing & billing
workers/           — Background workers (loop-worker.ts)
tests/             — Top-level integration tests (Vitest)
scripts/           — Scaffold generators
docs/              — Design docs (plans/, superpowers/)
```

### Core type model (all in `packages/shared/src/types/`)

- **Intent** — `id | rawInput | title | interpretedGoal | mode | costMode | state | constraints[]`
- **IntentState** — `understanding → working → needs_decision → ready → accepted | paused | blocked | archived`
- **IntentMode** — `ask | draft | act | ship | watch | review`
- **Decision** — `intentId | title | question | options[] | severity | state`
- **Outcome** — `intentId | summary | changed[] | verified[] | risks[] | costSummary | confidence`
- **Signal** — `intentId | kind (progress|risk|cost|confidence|blocker|decision|result) | level | message`
- **HomePayload** — `calmState (calm|working|needs_you|attention) | now[] | decisions[] | outcomes[]`
- **CostMode** — `frugal | balanced | thorough`

### Provider interface (`packages/providers/src/types.ts`)

```ts
type ProviderAdapter = {
  name: string;
  generate: (prompt: { system?: string; messages: { role: "user"|"assistant"; content: string }[] })
    => Promise<{ text: string; usage?: { inputTokens?: number; outputTokens?: number } }>;
};
```

Provider selection via `getBestProvider()` in `apps/web/lib/provider-factory.ts`: Anthropic → OpenAI → mock (based on which env vars are set).

### Agent subsystem (`packages/engine/src/agent/`)

Custom agents with skill bindings, separate from the core intent loop:

- **AgentConfig** — `systemPrompt | provider | model | temperature | maxTokens`
- **AgentSkillDef** — `name | content | version` — skill content injected into agent system prompt
- **Registry** (`agent-registry.ts`) — `buildAgentSystemPrompt(agent, skills)` compiles system prompt from agent config + mounted skills
- **Dispatcher** (`agent-dispatcher.ts`) — `withAgentSystemPrompt(basePrompt, generate)` wraps provider calls to prepend agent prompt
- **Memory Engine** (`agent-memory-engine.ts`) — `formatMemoriesForContext(memories, max)` formats agent memories into prompt fragments
- **Skill Injector** (`skill-injector.ts`) — `buildSkillsPrompt(bindings)` renders enabled skills as named sections

### Engine subsystems (`packages/engine/src/`)

- **Cost governor** (`cost-governor.ts`) — Maps `CostMode` (frugal|balanced|thorough) → `CostPolicy` (maxContextTokens, preferredModelTier, maxLoops, allowModelEscalation, reviewRequired)
- **Model router** (`model-router.ts`) — Maps `(provider, ModelTier)` → concrete model name per provider (small/medium/strong tiers)
- **Risk sentinel** (`risk-sentinel.ts`) — Regex-based risk assessment on intent text (auth, billing, delete → high risk, DB/schema/deploy → medium, requiresDecision flag)
- **Context compiler** (`context-compiler.ts`) — `compileContext(refs)` builds compact prompt from reference list with token estimation
- **Memory curator** (`memory-curator.ts`) — `extractMemory(title, compactRule)` creates memory entries from outcomes

### Governor types (`packages/engine/src/types.ts`)

```ts
type NextStep =
  | { type: "run_capability"; capability: string }
  | { type: "ask_decision"; title: string; question: string }
  | { type: "build_outcome" }
  | { type: "pause"; reason: string };
```

## Data flow

1. User submits raw input via command bar → `POST /api/intents`
2. Engine previews/reasons → `runtime-repository.ts` persists intent via Prisma (SQLite)
3. If `autoStart`: `createStartedIntent` persists intent, initial signal, and SSE events
4. For non-decision path: `loop-orchestrator.ts` fires in background:
   - Phase 1: interprets intent via provider → updates intent record
   - Phase 2: governor loop → executes capabilities → produces outcome
   - Events pushed to EventLog DB for each step
5. For decision path: intent waits at `needs_decision` until user resolves
6. Home page polls `GET /api/home` for snapshot; SSE at `/api/events` pushes live updates
7. User resolves decision → `createOutcome` → outcome stored, intent → `ready`

## API routes

**Public (CAO-facing):**
- `GET /api/home` — Dashboard snapshot (HomePayload with now/decisions/outcomes)
- `GET /api/events?stream=home&lastEventId=...` — SSE stream with replay
- `POST /api/intents` — Create + optionally start an intent
- `GET /api/intents` — List all intents
- `GET /api/intents/[id]` — Get intent detail with signals
- `POST /api/intents/[id]/explore` — Broaden scope
- `POST /api/intents/[id]/deeper` — Deepen scope
- `POST /api/intents/[id]/pause` — Pause execution
- `POST /api/intents/[id]/stop` — Stop execution
- `POST /api/intents/[id]/tighten` — Tighten scope
- `GET /api/decisions` — List open decisions
- `POST /api/decisions/[id]/resolve` — Resolve a decision (creates outcome)
- `GET /api/outcomes` — List outcomes
- `POST /api/outcomes/[id]/accept` — Accept outcome
- `POST /api/outcomes/[id]/revert` — Revert outcome
- `POST /api/outcomes/[id]/save-memory` — Save memory from outcome
- `GET /api/memories` — List memories
- `DELETE /api/memories/[id]` — Delete memory

**Internal (worker-facing):**
- `POST /api/internal/loops` — Continue loop for an intent
- `POST /api/internal/capabilities/run` — Run a specific capability
- `POST /api/internal/outcomes/build` — Build outcome from state
- `POST /api/internal/signals` — Push signal
- `POST /api/internal/context/compile` — Compile context
- `POST /api/internal/token-ledger` — Record token usage
- `POST /api/internal/trace` — Record execution trace

## Frontend architecture

- **State management**: Zustand stores in `apps/web/stores/` (`home.ts`, `command.ts`)
- **Data fetching hooks**: `useHome()` (full snapshot), `useIntent(id)` (detail+signals)
- **Real-time**: `useSSE()` hook connects to `/api/events?stream=home` as EventSource, dispatches events to `useHomeStore.handleEvent()`
- **Home page** renders from `HomePayload` — calm state banner, Now cards (active intents), Decision inbox, Outcome cards
- **Layout**: `Shell` → `Header` + `Nav` sidebar + main content area
- **Components live in** `apps/web/components/`: `home/`, `command/`, `decision/`, `intent/`, `outcome/`, `memory/`, `shared/`, `layout/`

## Key source files

- **`apps/web/lib/runtime-repository.ts`** — Main data access layer, all Prisma queries live here
- **`apps/web/lib/event-repository.ts`** — SSE event persistence and retrieval (appendEvent, listEventsAfter)
- **`apps/web/lib/loop-orchestrator.ts`** — Connects governor + provider + capabilities to execute intents
- **`apps/web/lib/provider-factory.ts`** — Selects Anthropic/OpenAI/mock provider based on env vars
- **`apps/web/lib/sse.ts`** — `createSSEMessage()` helper for formatting SSE wire protocol
- **`apps/web/lib/prisma.ts`** — Singleton PrismaClient with env loading for non-Next contexts
- **`apps/web/stores/home.ts`** — Zustand store for home page state + SSE event handling
- **`apps/web/hooks/useSSE.ts`** — React hook connecting EventSource to Zustand store
- **`packages/engine/src/governor.ts`** — Orchestrates execution loop, emits NextStep decisions
- **`packages/engine/src/cost-governor.ts`** — Maps CostMode to CostPolicy (token/model/loop budgets)
- **`packages/engine/src/model-router.ts`** — Selects concrete model per provider + ModelTier
- **`packages/engine/src/risk-sentinel.ts`** — Assesses risk level from intent text patterns
- **`packages/engine/src/context-compiler.ts`** — Compiles context refs into compact prompt
- **`packages/engine/src/decision-engine.ts`** — Builds decision prompts when the model needs input
- **`packages/engine/src/outcome-builder.ts`** — Structures final outcome (changes, verification, risks)
- **`packages/engine/src/signal-engine.ts`** — Generates progress/decision/result signals
- **`packages/engine/src/memory-curator.ts`** — Creates memory entries from outcomes
- **`packages/engine/src/capabilities/`** — 10 capabilities: interpret-intent, plan-change, edit-code, run-tests, review-diff, summarize-result, compile-context, select-files, extract-memory, monitor-signal
- **`packages/engine/src/agent/`** — Agent subsystem: registry, dispatcher, memory engine, skill injector
- **`apps/web/lib/auth.ts`** & **`apps/web/lib/auth.config.ts`** — Auth.js (NextAuth) configuration
- **`apps/web/lib/workspace.ts`** — Workspace context/identification helpers
- **`apps/web/lib/redis.ts`** — Redis client for background job queues
- **`packages/providers/src/`** — LLM providers: anthropic.ts (real SDK), openai.ts (real SDK), mock.ts (fallback)

### Provider setup

Set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in `.env` for real AI execution.
Without keys, the system falls back to mock responses.

```env
# Database (SQLite by default)
DATABASE_URL="file:./dev.db"

# DeepSeek (via Anthropic-compatible endpoint)
ANTHROPIC_API_KEY="sk-..."
ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
ANTHROPIC_MODEL="deepseek-chat"

# Or OpenAI-compatible
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o"

# Redis (optional, for background job queues)
REDIS_URL="redis://localhost:6379"

# Auth.js (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me"
```

Model selection: `ANTHROPIC_MODEL` (default: claude-sonnet-4-20250514), `OPENAI_MODEL` (default: gpt-4o).

### Database (Prisma + SQLite)

Schema at `apps/web/prisma/schema.prisma`. Core models: Workspace, Intent, Decision, Outcome, Signal, Memory, EventLog, User, Agent, Skill, Team, AgentRun, AgentMemory. Marketplace models: MarketplaceListing, Transaction, Subscription, MarketplaceReview, CreditAccount, CreditEntry, AuthorProfile, Referral. SQLite dev database at `apps/web/prisma/dev.db` (also symlinked at root `dev.db`).

### Real-time updates

Server-Sent Events via `/api/events?stream=home`. Events are persisted in EventLog table. Clients reconnect with `lastEventId` for replay. The `useSSE` hook dispatches events to Zustand stores.

### Testing

Vitest with `fileParallelism: false` (sequential — tests share SQLite state). Tests import API route handlers directly and call GET/POST as functions (not HTTP). They rely on `getOrCreateWorkspace()` upserting the demo workspace. `vitest.setup.ts` uses `process.loadEnvFile()` (Node 21+) to load `.env`.

### Design docs

- `详细设计.md` — Chinese-language detailed design doc
- `ciao_prd_engineering_design-2.md` — PRD + engineering design in English
- `findings.md` — Product, engineering, and scope findings from the research phase

## Current Status — MVP ~80-85%

Completed slices:
- **Foundation** — Monorepo scaffold, all packages, Prisma schema, routing, components, stores
- **A.1 (SQLite Persistence)** — Workspace/Intent/Decision/Outcome persisted via Prisma + SQLite
- **A.2 (Signals/Memory/Event Recovery)** — Signal/Memory/EventLog tables, SSE with `lastEventId` replay, memory save-from-outcome flow
- **A.3 (Real Provider + Loop Orchestration)** — Real Anthropic SDK + OpenAI SDK adapters, `loop-orchestrator.ts` connecting governor → provider → capabilities → database, DeepSeek verified via Anthropic-compatible endpoint

## Next steps

| Slice | Priority | Description |
|-------|----------|-------------|
| A.4 | High | **Auth.js + workspace isolation** — user boundaries, data isolation, login flow |
| A.5 | Medium | **BullMQ worker + outcome artifacts** — background job observability, artifact diff/trace views |
| A.6 | Medium | **Memory curation & retrieval** — edit/disable memories, hit feedback, retrieval injection into context |

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
