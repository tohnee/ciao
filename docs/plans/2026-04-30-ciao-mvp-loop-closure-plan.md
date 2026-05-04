# CIAO MVP Loop Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前静态骨架推进为一个本地可演示的 MVP 闭环，串起 `POST /api/intents`、`Intent Preview -> Start`、`Home` 实时刷新、`Decision resolve`、`Outcome ready`。

**Architecture:** 采用进程内 `demo runtime store` 作为临时数据层，避免在本轮引入数据库写读复杂度。`Home` 通过 `GET /api/home` 获取快照，并通过 `SSE` 接收增量事件；`CommandBar` 创建 intent preview 后点击 `Start` 触发服务端状态机，状态机会在 `working -> needs_decision -> ready` 之间推进。

**Tech Stack:** Next.js 14, React 18, Zustand, TypeScript, Server-Sent Events, Vitest

---

### Task 1: 建立演示运行时状态仓

**Files:**
- Create: `apps/web/lib/demo-runtime.ts`
- Modify: `apps/web/lib/mock-data.ts`
- Test: `tests/demo-runtime.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createDemoIntent, getHomeSnapshot, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

describe("demo runtime", () => {
  it("creates a working intent and exposes it in the home snapshot", () => {
    resetDemoRuntime();
    const created = createDemoIntent({
      rawInput: "Fix OAuth callback test without changing public API",
      mode: "ship",
      costMode: "frugal",
    });

    const snapshot = getHomeSnapshot();

    expect(created.intent.state).toBe("working");
    expect(snapshot.now.some((card) => card.intentId === created.intent.id)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/demo-runtime.test.ts`
Expected: FAIL with missing module or missing exported function

**Step 3: Write minimal implementation**

- 实现内存态 arrays/maps 存储 `intents`、`decisions`、`outcomes`
- 实现 `resetDemoRuntime()`、`createDemoIntent()`、`getHomeSnapshot()`
- 默认 `createDemoIntent()` 创建一个 `working` 的 intent，并生成对应 `NowCard`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/demo-runtime.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/demo-runtime.test.ts apps/web/lib/demo-runtime.ts apps/web/lib/mock-data.ts
git commit -m "feat: add demo runtime store"
```

### Task 2: 打通 `POST /api/intents` 与 preview/start

**Files:**
- Modify: `apps/web/app/api/intents/route.ts`
- Modify: `apps/web/components/command/CommandBar.tsx`
- Modify: `apps/web/components/command/IntentPreview.tsx`
- Modify: `apps/web/stores/command.ts`
- Test: `tests/intents-api.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("intents api contract", () => {
  it("returns a generated preview from raw input", async () => {
    const mod = await import("../apps/web/app/api/intents/route");
    const response = await mod.POST(
      new Request("http://localhost/api/intents", {
        method: "POST",
        body: JSON.stringify({
          rawInput: "Fix OAuth callback test",
          mode: "ship",
          costMode: "frugal",
          autoStart: false,
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const body = await response.json();

    expect(body.preview.interpretedGoal).toContain("Fix OAuth callback test");
    expect(body.intent.state).toBe("understanding");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/intents-api.test.ts`
Expected: FAIL because `POST` ignores request body or returns static mock data

**Step 3: Write minimal implementation**

- `POST /api/intents` 解析 body
- `autoStart: false` 时返回 preview + `understanding` intent
- `autoStart: true` 时写入 runtime 并进入 `working`
- `CommandBar` 分离 `Preview` 和 `Start` 两步
- `IntentPreviewCard` 暴露 `onStart`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/intents-api.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/intents-api.test.ts apps/web/app/api/intents/route.ts apps/web/components/command/CommandBar.tsx apps/web/components/command/IntentPreview.tsx apps/web/stores/command.ts
git commit -m "feat: wire intent preview and start flow"
```

### Task 3: 打通 Home 快照与客户端刷新

**Files:**
- Modify: `apps/web/app/api/home/route.ts`
- Modify: `apps/web/stores/home.ts`
- Modify: `apps/web/hooks/useSSE.ts`
- Create: `apps/web/components/home/HomeClient.tsx`
- Modify: `apps/web/app/home/page.tsx`
- Test: `tests/home-store.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { useHomeStore } from "../apps/web/stores/home";

describe("home store", () => {
  it("updates summary from a calm_state_changed event", () => {
    useHomeStore.setState({
      greeting: "Hi",
      calmState: "calm",
      summary: "CIAO is calm.",
      now: [],
      backgroundLoopCount: 0,
      decisions: [],
      outcomes: [],
      isLoading: false,
      fetchHome: async () => {},
      handleEvent: () => {},
    });

    useHomeStore.getState().handleEvent({
      type: "calm_state_changed",
      data: { calmState: "needs_you", summary: "One decision needs you." },
    });

    expect(useHomeStore.getState().summary).toBe("One decision needs you.");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/home-store.test.ts`
Expected: FAIL if store ignores events or cannot be initialized safely in test

**Step 3: Write minimal implementation**

- `GET /api/home` 改为读 `demo runtime store`
- `fetchHome()` 从接口拉取
- `useSSE()` 接入 `handleEvent()`
- `HomePage` 改为 server shell + client content 组合

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/home-store.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/home-store.test.ts apps/web/app/api/home/route.ts apps/web/stores/home.ts apps/web/hooks/useSSE.ts apps/web/components/home/HomeClient.tsx apps/web/app/home/page.tsx
git commit -m "feat: refresh home from runtime snapshot"
```

### Task 4: 打通 Decision resolve -> Outcome ready 状态推进

**Files:**
- Modify: `apps/web/app/api/decisions/[id]/resolve/route.ts`
- Modify: `apps/web/lib/demo-runtime.ts`
- Modify: `apps/web/app/api/outcomes/route.ts`
- Modify: `apps/web/app/api/events/route.ts`
- Test: `tests/decision-resolution.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createDemoIntent, getOpenDecisions, resolveDecision, resetDemoRuntime } from "../apps/web/lib/demo-runtime";

describe("decision resolution", () => {
  it("moves an intent from needs_decision to ready and creates an outcome", () => {
    resetDemoRuntime();
    createDemoIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: true,
    });

    const decision = getOpenDecisions()[0];
    resolveDecision(decision.id, "minimal");

    const snapshot = getOpenDecisions();
    expect(snapshot).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/decision-resolution.test.ts`
Expected: FAIL because runtime store does not yet create or resolve decisions

**Step 3: Write minimal implementation**

- runtime store 支持创建 decision
- `resolveDecision()` 将 intent 推进到 `ready`
- 生成 `Outcome`
- `GET /api/outcomes` 返回最新结果

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/decision-resolution.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/decision-resolution.test.ts apps/web/lib/demo-runtime.ts apps/web/app/api/decisions/[id]/resolve/route.ts apps/web/app/api/outcomes/route.ts apps/web/app/api/events/route.ts
git commit -m "feat: resolve decisions into outcomes"
```

### Task 5: SSE 事件流和演示刷新闭环

**Files:**
- Modify: `apps/web/lib/demo-runtime.ts`
- Modify: `apps/web/app/api/events/route.ts`
- Modify: `apps/web/stores/home.ts`
- Modify: `apps/web/components/home/DecisionCard.tsx`
- Modify: `apps/web/components/home/OutcomeCard.tsx`
- Test: `tests/home-events.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { useHomeStore } from "../apps/web/stores/home";

describe("home event handling", () => {
  it("adds a new outcome when outcome_ready arrives", () => {
    const initial = useHomeStore.getState();
    initial.handleEvent({
      type: "outcome_ready",
      data: {
        id: "outcome_1",
        intentId: "intent_1",
        title: "OAuth callback fixed",
        summary: "Prepared for acceptance",
        confidence: "high",
        costLabel: "Frugal · below normal",
        state: "ready",
        createdAt: new Date().toISOString(),
      },
    });

    expect(useHomeStore.getState().outcomes[0]?.id).toBe("outcome_1");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/home-events.test.ts`
Expected: FAIL because store does not yet merge `outcome_ready` or decision events

**Step 3: Write minimal implementation**

- runtime store 增加事件队列 / 订阅机制
- `SSE` 端点循环推送新事件
- `home` store 处理 `decision_created`、`outcome_ready`、`loop_progress`
- `DecisionCard` 触发 resolve API 后刷新

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/home-events.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/home-events.test.ts apps/web/lib/demo-runtime.ts apps/web/app/api/events/route.ts apps/web/stores/home.ts apps/web/components/home/DecisionCard.tsx apps/web/components/home/OutcomeCard.tsx
git commit -m "feat: stream runtime events to home"
```

### Task 6: 端到端验证

**Files:**
- Modify: `progress.md`
- Modify: `task_plan.md`

**Step 1: Run focused tests**

Run: `npm test -- tests/demo-runtime.test.ts tests/intents-api.test.ts tests/home-store.test.ts tests/decision-resolution.test.ts tests/home-events.test.ts`
Expected: PASS

**Step 2: Run workspace checks**

Run: `npm run prisma:generate --workspace @ciao/web`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/web`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/shared`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/engine`
Expected: PASS

**Step 3: Manual demo verification**

Run: `npm run dev --workspace @ciao/web`
Expected: 能在浏览器中完成：
- 输入 intent
- 看到 preview
- 点击 `Start`
- Home 出现 `Now`
- 出现 decision
- resolve 后出现 outcome

**Step 4: Update progress**

- 记录验证命令输出
- 标注剩余缺口：真实持久化、真正的队列 worker、跨进程 SSE、真实 provider
