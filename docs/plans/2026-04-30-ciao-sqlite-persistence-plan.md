# CIAO SQLite Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将当前基于内存态 `demo runtime` 的演示闭环迁移到 `Prisma + SQLite` 持久化，同时保持现有 API 和 UI 交互形状不变。

**Architecture:** 这轮只持久化闭环核心表：`Workspace`、`Intent`、`Decision`、`Outcome`。`apps/web/lib/demo-runtime.ts` 将被一个基于 Prisma 的 repository 层替代，API routes 仍保持现有 contract，`Home`、`CommandBar`、`DecisionCard` 无需感知底层从内存态切换为数据库。

**Tech Stack:** Prisma, SQLite, Next.js 14, TypeScript, Vitest

---

### Task 1: 收敛 Prisma schema 到 SQLite 兼容的闭环核心表

**Files:**
- Modify: `apps/web/prisma/schema.prisma`
- Modify: `.env.example`
- Test: `tests/prisma-schema-smoke.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("prisma schema", () => {
  it("targets sqlite for the local MVP persistence flow", () => {
    const schema = readFileSync("apps/web/prisma/schema.prisma", "utf8");
    expect(schema).toContain('provider = "sqlite"');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/prisma-schema-smoke.test.ts`
Expected: FAIL because schema still points to `postgresql`

**Step 3: Write minimal implementation**

- 将 datasource provider 切到 `sqlite`
- 设置 `DATABASE_URL="file:./dev.db"`
- 删除或简化本轮不需要、且对 SQLite 不友好的类型约束
- 只保留 `Workspace`、`Intent`、`Decision`、`Outcome` 及其闭环所需字段

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/prisma-schema-smoke.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/prisma-schema-smoke.test.ts apps/web/prisma/schema.prisma .env.example
git commit -m "feat: switch core schema to sqlite"
```

### Task 2: 启用真实 PrismaClient 并生成本地数据库

**Files:**
- Modify: `apps/web/lib/prisma.ts`
- Create: `apps/web/prisma/seed.ts`
- Test: `tests/prisma-client.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";

describe("prisma client", () => {
  it("exports a client-like object with workspace access", async () => {
    const mod = await import("../apps/web/lib/prisma");
    expect(typeof mod.prisma.workspace).toBe("object");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/prisma-client.test.ts`
Expected: FAIL because `prisma.ts` still exports placeholder object

**Step 3: Write minimal implementation**

- 恢复真实 `PrismaClient`
- 使用 `globalThis` 缓存避免 dev 模式重复实例化
- 加入基础 seed，确保存在默认 `workspace_demo`

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/prisma-client.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/prisma-client.test.ts apps/web/lib/prisma.ts apps/web/prisma/seed.ts
git commit -m "feat: enable prisma client for sqlite"
```

### Task 3: 建立 SQLite repository 替换 demo runtime 读写

**Files:**
- Create: `apps/web/lib/runtime-repository.ts`
- Modify: `apps/web/lib/demo-runtime.ts`
- Test: `tests/runtime-repository.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { createStartedIntent, getHomeSnapshot } from "../apps/web/lib/runtime-repository";

describe("runtime repository", () => {
  it("persists a started intent and returns it in the home snapshot", async () => {
    const intent = await createStartedIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: false,
    });

    const snapshot = await getHomeSnapshot();

    expect(intent.state).toBe("working");
    expect(snapshot.now.some((card) => card.intentId === intent.id)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/runtime-repository.test.ts`
Expected: FAIL because repository file/functions do not exist

**Step 3: Write minimal implementation**

- 新建 repository 层统一封装：
  - `getOrCreateWorkspace()`
  - `previewIntent()`
  - `createStartedIntent()`
  - `getHomeSnapshot()`
  - `listIntents()`
  - `listDecisions()`
  - `listOutcomes()`
- `demo-runtime.ts` 改为仅保留事件队列和少量纯函数，数据库读写迁移到 repository

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/runtime-repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/runtime-repository.test.ts apps/web/lib/runtime-repository.ts apps/web/lib/demo-runtime.ts
git commit -m "feat: persist runtime state with prisma repository"
```

### Task 4: 持久化 Decision resolve -> Outcome ready

**Files:**
- Modify: `apps/web/lib/runtime-repository.ts`
- Modify: `apps/web/app/api/decisions/[id]/resolve/route.ts`
- Modify: `apps/web/app/api/outcomes/route.ts`
- Test: `tests/sqlite-decision-resolution.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import {
  createStartedIntent,
  listDecisions,
  listOutcomes,
  resolveDecision,
} from "../apps/web/lib/runtime-repository";

describe("sqlite decision resolution", () => {
  it("marks the decision resolved and persists an outcome", async () => {
    await createStartedIntent({
      rawInput: "Fix OAuth callback test",
      mode: "ship",
      costMode: "frugal",
      forceDecision: true,
    });

    const decision = (await listDecisions())[0];
    await resolveDecision(decision.id, "minimal");

    expect(await listDecisions()).toHaveLength(0);
    expect(await listOutcomes()).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/sqlite-decision-resolution.test.ts`
Expected: FAIL because resolve flow is not yet backed by Prisma

**Step 3: Write minimal implementation**

- `resolveDecision()` 用事务更新 `Decision`、`Intent`、`Outcome`
- API route 切到 repository
- `GET /api/outcomes` 切到 repository

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/sqlite-decision-resolution.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/sqlite-decision-resolution.test.ts apps/web/lib/runtime-repository.ts apps/web/app/api/decisions/[id]/resolve/route.ts apps/web/app/api/outcomes/route.ts
git commit -m "feat: persist decision resolution to sqlite"
```

### Task 5: API routes 全部切到持久化 repository

**Files:**
- Modify: `apps/web/app/api/intents/route.ts`
- Modify: `apps/web/app/api/home/route.ts`
- Modify: `apps/web/app/api/decisions/route.ts`
- Modify: `apps/web/app/api/events/route.ts`
- Test: `tests/persistence-api-contract.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { POST as postIntent } from "../apps/web/app/api/intents/route";
import { GET as getHome } from "../apps/web/app/api/home/route";

describe("persistence-backed api contract", () => {
  it("keeps the same contract while reading from sqlite", async () => {
    await postIntent(
      new Request("http://localhost/api/intents", {
        method: "POST",
        body: JSON.stringify({
          rawInput: "Fix OAuth callback test",
          mode: "ship",
          costMode: "frugal",
          autoStart: true,
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await getHome();
    const body = await response.json();

    expect(Array.isArray(body.now)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/persistence-api-contract.test.ts`
Expected: FAIL because routes still depend on in-memory runtime behavior

**Step 3: Write minimal implementation**

- 所有 API routes 改用 repository 读写
- 事件队列仍保留在 `demo-runtime.ts`，但事件由 repository 操作后写入
- 保持前端无感知切换

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/persistence-api-contract.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/persistence-api-contract.test.ts apps/web/app/api/intents/route.ts apps/web/app/api/home/route.ts apps/web/app/api/decisions/route.ts apps/web/app/api/events/route.ts
git commit -m "feat: back demo apis with sqlite persistence"
```

### Task 6: 数据库生成与端到端验证

**Files:**
- Modify: `progress.md`
- Modify: `task_plan.md`

**Step 1: Generate client and database**

Run: `npm run prisma:generate --workspace @ciao/web`
Expected: PASS

Run: `npx prisma db push --schema apps/web/prisma/schema.prisma`
Expected: SQLite database created successfully

**Step 2: Run focused tests**

Run: `npm test -- tests/prisma-schema-smoke.test.ts tests/prisma-client.test.ts tests/runtime-repository.test.ts tests/sqlite-decision-resolution.test.ts tests/persistence-api-contract.test.ts`
Expected: PASS

**Step 3: Run workspace checks**

Run: `npm run typecheck --workspace @ciao/web`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/shared`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/engine`
Expected: PASS

Run: `npm run typecheck --workspace @ciao/providers`
Expected: PASS

**Step 4: Manual demo verification**

Run: `npm run dev --workspace @ciao/web`
Expected: restart app, create intent, reload page, state still exists in SQLite

**Step 5: Update progress**

- 写入 A.1 已完成
- 记录残余缺口：Signal / Memory 持久化、真实 SSE 跨进程、BullMQ / worker、Auth.js
