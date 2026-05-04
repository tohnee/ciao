# CIAO A.2 Signals Memory Events Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 CIAO 单机 MVP 补齐 `Signal`、`Memory` 持久化，并将 Home 的 SSE 从进程内队列升级为基于 SQLite `EventLog` 的可恢复事件流。

**Architecture:** 保持现有 API / UI contract 基本不变，在 SQLite 中新增 `Signal`、`Memory`、`EventLog`。所有 intent 创建、decision 创建/解决、outcome 产生都遵循“写业务表 -> 写 signal -> 写 event”顺序；Home 初始快照继续从业务表聚合，SSE 端点根据 `lastEventId` 从 `EventLog` 做 catch-up 和增量推送。

**Tech Stack:** Prisma, SQLite, Next.js 14, TypeScript, Zustand, Vitest, Server-Sent Events

---

### Task 1: 扩展 SQLite schema 到 A.2 核心对象

**Files:**
- Modify: `apps/web/prisma/schema.prisma`
- Modify: `packages/shared/src/types/signal.ts`
- Test: `tests/a2-schema.test.ts`

**Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("A.2 schema", () => {
  it("includes Signal, Memory and EventLog models", () => {
    const schema = readFileSync("apps/web/prisma/schema.prisma", "utf8");
    expect(schema).toContain("model Signal");
    expect(schema).toContain("model Memory");
    expect(schema).toContain("model EventLog");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/a2-schema.test.ts`
Expected: FAIL because schema only includes `Workspace / Intent / Decision / Outcome`

**Step 3: Write minimal implementation**

- 在 SQLite schema 中新增：
  - `Signal`
  - `Memory`
  - `EventLog`
- `EventLog` 最小字段：
  - `id`
  - `workspaceId`
  - `stream`
  - `type`
  - `intentId?`
  - `payload`
  - `createdAt`
- 扩展共享 `Signal` 类型，允许 `workspaceId?`、`metadata?` 或必要最小字段

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/a2-schema.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/a2-schema.test.ts apps/web/prisma/schema.prisma packages/shared/src/types/signal.ts
git commit -m "feat: add signal memory and eventlog schema"
```

### Task 2: 建立持久化 event repository

**Files:**
- Create: `apps/web/lib/event-repository.ts`
- Test: `tests/event-repository.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { appendEvent, listEventsAfter, resetEventLog } from "../apps/web/lib/event-repository";

describe("event repository", () => {
  it("stores and replays events after a lastEventId cursor", async () => {
    await resetEventLog();
    const first = await appendEvent({
      workspaceSlug: "demo",
      stream: "home",
      type: "calm_state_changed",
      payload: { calmState: "working", summary: "CIAO is working quietly." },
    });
    await appendEvent({
      workspaceSlug: "demo",
      stream: "home",
      type: "loop_progress",
      payload: { intentId: "intent_1", message: "Running" },
    });

    const replay = await listEventsAfter({
      workspaceSlug: "demo",
      stream: "home",
      lastEventId: first.id,
    });

    expect(replay).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/event-repository.test.ts`
Expected: FAIL because repository does not exist

**Step 3: Write minimal implementation**

- 实现：
  - `appendEvent()`
  - `listEventsAfter()`
  - `resetEventLog()`
- 统一将 `payload` 存为 JSON string

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/event-repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/event-repository.test.ts apps/web/lib/event-repository.ts
git commit -m "feat: add persistent event repository"
```

### Task 3: 为 runtime repository 增加 Signal / Memory / EventLog 写入

**Files:**
- Modify: `apps/web/lib/runtime-repository.ts`
- Test: `tests/runtime-signals.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createStartedIntent, listSignalsForIntent, resetPersistence } from "../apps/web/lib/runtime-repository";

describe("runtime repository signals", () => {
  it("persists a signal when a started intent is created", async () => {
    await resetPersistence();
    const intent = await createStartedIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: false,
    });

    const signals = await listSignalsForIntent(intent.id);

    expect(signals.some((signal) => signal.kind === "progress")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/runtime-signals.test.ts`
Expected: FAIL because signals are not persisted

**Step 3: Write minimal implementation**

- `createStartedIntent()` 时写入 `Signal`
- `forceDecision: true` 时写 `decision` signal + event
- `resolveDecision()` 时写 `result` signal + `outcome_ready` event
- 新增：
  - `listSignalsForIntent()`
  - `listMemories()`
  - `saveMemoryFromOutcome()`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/runtime-signals.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/runtime-signals.test.ts apps/web/lib/runtime-repository.ts
git commit -m "feat: persist signals and memory candidates"
```

### Task 4: 将 `/api/events` 升级为数据库驱动的可恢复事件流

**Files:**
- Modify: `apps/web/app/api/events/route.ts`
- Modify: `apps/web/lib/sse.ts`
- Test: `tests/events-api.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("events api", () => {
  it("accepts lastEventId and returns newer persisted events", async () => {
    const mod = await import("../apps/web/app/api/events/route");
    const response = await mod.GET(
      new Request("http://localhost/api/events?stream=home&lastEventId=evt_1")
    );

    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/events-api.test.ts`
Expected: FAIL because route ignores query cursor or still drains in-memory queue only

**Step 3: Write minimal implementation**

- `GET /api/events?stream=home&lastEventId=...`
- 从 `EventLog` 查询 cursor 之后的事件
- 先发送 backlog，再短轮询/条件轮询一小段时间推送新增事件
- 保持单机 MVP 简单实现，不做 Redis pub/sub

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/events-api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/events-api.test.ts apps/web/app/api/events/route.ts apps/web/lib/sse.ts
git commit -m "feat: replay persisted home events"
```

### Task 5: 升级 Home 客户端为 lastEventId 可恢复消费

**Files:**
- Modify: `apps/web/stores/home.ts`
- Modify: `apps/web/hooks/useSSE.ts`
- Modify: `packages/shared/src/types/home.ts`
- Test: `tests/home-recovery.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { useHomeStore } from "../apps/web/stores/home";

describe("home recovery", () => {
  it("tracks the latest event id after applying an event", () => {
    useHomeStore.getState().handleEvent({
      id: "evt_2",
      type: "calm_state_changed",
      data: { calmState: "working", summary: "CIAO is working quietly." },
    } as any);

    expect(useHomeStore.getState().lastEventId).toBe("evt_2");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/home-recovery.test.ts`
Expected: FAIL because store does not track `lastEventId`

**Step 3: Write minimal implementation**

- 扩展 `SSEEvent` 为可携带 `id`
- Home store 增加 `lastEventId`
- `useSSE()` 连接时附带 `lastEventId`
- 收到事件后更新 `lastEventId`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/home-recovery.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/home-recovery.test.ts apps/web/stores/home.ts apps/web/hooks/useSSE.ts packages/shared/src/types/home.ts
git commit -m "feat: make home events recoverable"
```

### Task 6: 暴露 Memory 读写 API 并接通 Outcome -> Save Memory

**Files:**
- Create: `apps/web/app/api/memories/route.ts`
- Modify: `apps/web/app/api/outcomes/[id]/save-memory/route.ts`
- Modify: `apps/web/components/home/OutcomeCard.tsx`
- Test: `tests/memory-api.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("memory api", () => {
  it("persists a memory from an outcome", async () => {
    const mod = await import("../apps/web/app/api/outcomes/[id]/save-memory/route");
    const response = await mod.POST(
      new Request("http://localhost/api/outcomes/outcome_1/save-memory", {
        method: "POST",
        body: JSON.stringify({ title: "Use conservative auth path first" }),
        headers: { "content-type": "application/json" },
      }),
      { params: { id: "outcome_1" } },
    );

    expect(response.status).toBe(200);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/memory-api.test.ts`
Expected: FAIL because route is still placeholder

**Step 3: Write minimal implementation**

- `GET /api/memories`
- `POST /api/outcomes/:id/save-memory`
- `OutcomeCard` 的 Save Memory 按钮接到真实 API

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/memory-api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/memory-api.test.ts apps/web/app/api/memories/route.ts apps/web/app/api/outcomes/[id]/save-memory/route.ts apps/web/components/home/OutcomeCard.tsx
git commit -m "feat: persist memories from outcomes"
```

### Task 7: 验证 A.2 并更新 MVP 差距评估

**Files:**
- Modify: `progress.md`
- Modify: `findings.md`
- Modify: `task_plan.md`

**Step 1: Run focused tests**

Run: `npm test -- tests/a2-schema.test.ts tests/event-repository.test.ts tests/runtime-signals.test.ts tests/events-api.test.ts tests/home-recovery.test.ts tests/memory-api.test.ts`
Expected: PASS

**Step 2: Run workspace checks**

Run: `npm run prisma:generate --workspace @ciao/web`
Expected: PASS

Run: `npx prisma db push --schema apps/web/prisma/schema.prisma`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/shared && npm run typecheck --workspace @ciao/engine && npm run typecheck --workspace @ciao/providers && npm run typecheck --workspace @ciao/web`
Expected: PASS

**Step 3: Manual recovery verification**

Run: `npm run dev --workspace @ciao/web`
Expected:
- create intent
- Home receives live event
- refresh page
- Home reconnects with `lastEventId`
- missing events are replayed from `EventLog`
- save memory and verify it appears in `/api/memories`

**Step 4: Update MVP distance**

- 记录 A.2 完成后距离 MVP 的评估
- 明确剩余缺口：
  - Auth / workspace boundary
  - real worker / loop / provider chain
  - outcome artifact / trace depth
