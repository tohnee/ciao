# CIAO v0.2 Progress Log

## 2026-04-30

### Session Start

- 已完整阅读 `ciao_prd_engineering_design-2.md`
- 已完整阅读 `详细设计.md`
- 已确认当前目录只有文档，没有现成代码
- 已向用户确认范围：`完整工程骨架`

### Planning

- 已创建项目级规划文件：`task_plan.md`
- 已创建发现记录：`findings.md`
- 已创建进度记录：`progress.md`
- 已输出正式 implementation plan：`docs/plans/2026-04-30-ciao-v0.2-foundation-plan.md`

### Scaffold

- 已初始化根工作区：`package.json`、`turbo.json`、`tsconfig.base.json`、`.gitignore`
- 已初始化 `apps/web`：App Router、页面路由、组件、stores、hooks、API routes、Prisma schema
- 已初始化 `packages/shared`：领域类型、常量、validators、导出入口
- 已初始化 `packages/engine`：governor、cost-governor、risk-sentinel、model-router、capabilities、prompts
- 已初始化 `packages/providers`：`mock`、`openai`、`anthropic` adapter 占位
- 已初始化 `workers/loop-worker.ts`

### Verification

- `npm test -- tests/foundation.test.ts` 通过
- `npm run typecheck --workspace @ciao/shared` 通过
- `npm run typecheck --workspace @ciao/engine` 通过
- `npm run prisma:generate --workspace @ciao/web` 通过
- `npm run typecheck --workspace @ciao/web` 通过
- `npm run typecheck` 经 `turbo` 成功跑完全部包，但 sandbox 仍提示其尝试触碰系统级目录；命令主体验证成功

### Remaining Gaps

- 真实 Auth.js 集成仍未接入
- 真实 Redis/BullMQ worker 调度仍为骨架占位
- 真实 Provider 调用、SSE pub/sub、数据库写入逻辑仍为 mock / placeholder
- 尚未初始化 git 仓库

### MVP Loop Closure

- 已新增实现计划：`docs/plans/2026-04-30-ciao-mvp-loop-closure-plan.md`
- 已实现 `apps/web/lib/demo-runtime.ts`，作为进程内演示状态仓
- 已打通 `POST /api/intents`：
  - `autoStart: false` 返回动态 preview 与 `understanding`
  - `autoStart: true` 写入 runtime 并进入 `working` / `needs_decision`
- 已将 `GET /api/home`、`GET /api/intents`、`GET /api/decisions`、`GET /api/outcomes` 切到 runtime 数据源
- 已将 `Home` 改为客户端拉取 + SSE 增量更新
- 已将 `DecisionCard` 接到真实 resolve API
- 已实现 `resolveDecision()` 后生成 `Outcome`
- 已实现 runtime 事件队列：`decision_created`、`outcome_ready`、`calm_state_changed`、`loop_progress`
- 已将 runtime 状态提升到 `globalThis`，修复 Next dev server 下路由间内存不共享的问题
- 已将 `next.config.ts` 改为 `next.config.mjs`，修复本地 `next dev` 启动失败

### MVP Loop Verification

- `npm test -- tests/demo-runtime.test.ts tests/intents-api.test.ts tests/home-api.test.ts tests/decision-resolution.test.ts tests/runtime-events.test.ts` 通过
- `npm run typecheck --workspace @ciao/shared` 通过
- `npm run typecheck --workspace @ciao/engine` 通过
- `npm run typecheck --workspace @ciao/providers` 通过
- `npm run typecheck --workspace @ciao/web` 通过
- `npm run dev --workspace @ciao/web` 成功启动，监听 `http://localhost:3000/`
- 已通过本地 HTTP 请求手动验证闭环：
  - 初始 `GET /api/home` 返回 calm
  - `POST /api/intents` preview 返回 `understanding`
  - `POST /api/intents` start 返回 `needs_decision`
  - `GET /api/home` 与 `GET /api/decisions` 看到 decision
  - `POST /api/decisions/:id/resolve` 返回 outcome
  - `GET /api/home` 与 `GET /api/outcomes` 看到 ready outcome

### A.1 SQLite Persistence

- 已新增实现计划：`docs/plans/2026-04-30-ciao-sqlite-persistence-plan.md`
- 已将 `apps/web/prisma/schema.prisma` 从 `postgresql` 收敛为 `sqlite`，仅保留闭环核心表：
  - `Workspace`
  - `Intent`
  - `Decision`
  - `Outcome`
- 已将 `.env.example` 切到 `DATABASE_URL="file:./dev.db"`，并生成本地 `.env`
- 已启用真实 `PrismaClient`：`apps/web/lib/prisma.ts`
- 已新增持久化 repository：`apps/web/lib/runtime-repository.ts`
- 已将以下路由切到 SQLite 持久化读写：
  - `GET/POST /api/intents`
  - `GET /api/home`
  - `GET /api/decisions`
  - `POST /api/decisions/:id/resolve`
  - `GET /api/outcomes`
- 已将 `demo-runtime.ts` 收敛为事件队列与 repository 包装层，保留现有 SSE 演示链路
- 已将 `vitest` 配置为文件串行执行，修复共享 SQLite 数据库导致的并发污染

### A.1 Verification

- `npm run prisma:generate --workspace @ciao/web` 通过
- `npx prisma db push --schema apps/web/prisma/schema.prisma` 通过
- `npm test -- tests/prisma-schema-smoke.test.ts tests/prisma-client.test.ts tests/runtime-repository.test.ts tests/sqlite-decision-resolution.test.ts tests/persistence-api-contract.test.ts tests/demo-runtime.test.ts tests/decision-resolution.test.ts tests/runtime-events.test.ts` 通过
- `npm run typecheck --workspace @ciao/shared` 通过
- `npm run typecheck --workspace @ciao/engine` 通过
- `npm run typecheck --workspace @ciao/providers` 通过
- `npm run typecheck --workspace @ciao/web` 通过
- `GetDiagnostics` 返回空
- 已完成持久化手动验收：
  - 启动 `http://localhost:3000/`
  - 通过 `POST /api/intents` 创建唯一标记 `sqlite-persist-1777592645`
  - `GET /api/intents` 能读到该记录
  - 重启 `next dev`
  - 再次 `GET /api/intents` 仍能读到同一条记录，确认已从内存态切到 SQLite

### A.1 Remaining Gaps

- `Signal / Memory` 尚未持久化
- SSE 仍是单进程事件队列，不是跨进程 pub/sub
- `Loop / Worker / BullMQ` 仍未接入真实持久化执行链
- 仍未接入真实 Auth.js 登录态

### A.2 Signals Memory Event Recovery

- 已新增实现计划：`docs/plans/2026-04-30-ciao-a2-signals-memory-events-plan.md`
- 已将 SQLite schema 扩展到：
  - `Signal`
  - `Memory`
  - `EventLog`
- 已新增持久化事件仓：`apps/web/lib/event-repository.ts`
  - `appendEvent()`
  - `listEventsAfter()`
  - `resetEventLog()`
- 已扩展 `runtime-repository.ts`：
  - `createStartedIntent()` 持久化 progress / decision `Signal`
  - `resolveDecision()` 持久化 result `Signal`
  - `listSignalsForIntent()`
  - `listMemories()`
  - `saveMemoryFromOutcome()`
- 已将 `GET /api/events` 切到 SQLite `EventLog`：
  - 支持 `stream`
  - 支持 `lastEventId`
  - 返回带 `id:` 的 SSE backlog
- 已升级 Home 客户端恢复语义：
  - `SSEEvent` 允许携带 `id`
  - `home` store 记录 `lastEventId`
  - `useSSE()` 重连时会带上 `lastEventId`
- 已接通 `Memory` 读写链路：
  - `GET /api/memories`
  - `POST /api/outcomes/:id/save-memory`
  - `OutcomeCard` 的 `Save memory` 按钮已连接真实 API
- 已修复一个 A.2 过程中暴露的真实持久化问题：
  - `resolveDecision()` 原先在 Prisma SQLite transaction 内调用全局 `appendEvent()`
  - 这会在事务内外双写 SQLite 时触发锁等待并导致测试超时
  - 已将 `appendEvent()` 移出 transaction，仅保留业务表写入在 transaction 内
- 已修复测试环境稳定性问题：
  - `Vitest` 直接导入 `PrismaClient` 时不会像 Next 运行时那样自动加载根 `.env`
  - 已在 `apps/web/lib/prisma.ts` 中补上环境加载兜底，消除对 shell 泄漏 `DATABASE_URL` 的依赖

### A.2 Verification

- `npm test -- tests/a2-schema.test.ts tests/event-repository.test.ts tests/runtime-signals.test.ts tests/events-api.test.ts tests/home-recovery.test.ts tests/memory-api.test.ts tests/sqlite-decision-resolution.test.ts` 通过
- `npm run prisma:generate --workspace @ciao/web` 通过
- `npx prisma db push --schema apps/web/prisma/schema.prisma --skip-generate` 通过
- `npm run typecheck --workspace @ciao/shared` 通过
- `npm run typecheck --workspace @ciao/engine` 通过
- `npm run typecheck --workspace @ciao/providers` 通过
- `npm run typecheck --workspace @ciao/web` 通过
- `GetDiagnostics` 在本轮修改文件上返回空
- 本地 `next dev` 可启动，但在当前 sandbox 中未稳定完成 HTTP 手动验收：
  - 自动化测试已覆盖事件回放、cursor 恢复、memory 持久化和 decision->outcome 链路
  - 因环境内 `localhost` 验收不稳定，本轮以自动化验证作为主要可信证据

### MVP Distance After A.2

- 当前整体完成度估计：`70%` 左右
- 相比 A.1 前的 `55%`，A.2 已明显补齐“单机可恢复闭环”的产品骨架
- 已达到的层级：
  - 本地单机演示闭环可持久化
  - 页面刷新后可通过 `EventLog` 回放恢复 Home 状态
  - `Signal / Decision / Outcome / Memory` 已进入同一 SQLite 生命周期
- 距离真正产品 MVP 仍缺的核心块：
  - `Auth / workspace boundary`
  - `真实 worker / loop / provider` 执行链，而不是 demo 驱动
  - `Outcome artifact / diff / trace` 的真实产物，而非摘要卡片
  - `Memory` 的完整生命周期：编辑、禁用、命中反馈、去重、检索注入
  - 更稳的实时分发模型：当前是数据库 backlog + EventSource 重连，不是多客户端一致性的实时总线

### Recommended Next Slice

- A.3 首选做 `真实 loop-worker + provider adapter + outcome artifact`
- 若更偏产品可用性，则优先做 `Auth.js + workspace isolation`
- 若更偏”记忆闭环”，则优先做 `memory retrieval + memory curation`

### A.3 Real Provider Bridge + Loop Orchestration

- 已安装 `@anthropic-ai/sdk` 和 `openai` 到 `packages/providers`
- 已升级 `ProviderAdapter` 类型支持结构化 prompt（system + messages）
- 已实现真实 Anthropic provider adapter（可回退到 mock）
- 已实现真实 OpenAI provider adapter（可回退到 mock）
- 已新增 `apps/web/lib/provider-factory.ts`：根据环境变量自动选择可用 provider
- 已更新 engine capabilities 使用 provider 进行真实内容生成：
  - `interpret-intent`：调用 provider 解析用户意图 → 标题、约束、风险提示
  - `plan-change`：调用 provider 生成执行计划
  - `summarize-result`：调用 provider 总结执行结果
- 已新增 `apps/web/lib/loop-orchestrator.ts`：
  - Phase 1：调用 provider 解释 intent，更新意图记录
  - Phase 2：进入 governor 循环（determineNextStep），依次执行 capabilities
  - 处理 `ask_decision`：创建 decision + 信号 + 事件 → 暂停等待
  - 处理 `build_outcome`：调用 provider 总结结果 → 写入 outcome → 标记 ready
  - 整个过程通过 EventLog 推送实时事件，SSE 端点自动分发
- 已将 `POST /api/intents` 路由改为 fire-and-forget 触发 orchestrator（非 `forceDecision` 路径）
- 已将 resolve route 中的 `pushDemoEvents` 清理为仅依赖 DB EventLog
- 已更新以下页面从 mock 数据切换到真实数据库查询：
  - `outcomes/page.tsx` → 使用 `listOutcomes()`
  - `intents/page.tsx` → 使用 `listIntents()`
  - `memory/page.tsx` → 使用 `listMemories()`
  - `intents/[id]/page.tsx` → 使用真实 intent detail（带 id 路由参数）
- 已修复 `home-api.test.ts` 的 `resetDemoRuntime()` 未 await 导致的测试失败

### A.3 Verification

- `npm test` → 17 test files, 18 tests, 全部通过
- `npm run typecheck --workspace @ciao/shared` → 通过
- `npm run typecheck --workspace @ciao/engine` → 通过
- `npm run typecheck --workspace @ciao/providers` → 通过
- `npm run typecheck --workspace @ciao/web` → 通过

### MVP Distance After A.3

- 当前整体完成度估计：`80-85%` 左右
- A.3 已补齐最关键的缺失块：系统现在可以在有 API key 时使用真实 AI provider 执行 intent
- 新增的真实能力：
  - `ANTHROPIC_API_KEY` 设置后，intent 会被 Claude 真实解释、计划、总结
  - 无 API key 时优雅降级到 mock，不影响演示
  - 所有页面显示真实数据而非 mock 数据
  - 决策解决路径完全使用 DB EventLog，不再依赖内存事件队列
- 距离真正产品 MVP 仍缺的核心块：
  - `Auth.js + workspace isolation`
  - `BullMQ + Redis` 后台 worker 取代当前 `fire-and-forget`
  - `Outcome artifact / diff / trace` 的真实产物展示
  - `Memory` 的完整生命周期：编辑、禁用、命中反馈、检索注入
  - Provider 配置 UI（当前仅从环境变量读取）

### Recommended Next Slice (After A.3)

- A.4 首选做 `Auth.js + workspace isolation`（真正的用户边界和数据隔离）
- A.5 次选做 `BullMQ worker + outcome artifacts`（让 background loop 可观察、产物可审查）
- A.6: `Memory curation & retrieval`（记忆闭环）

### Issues

- `planning-with-files` 所需本地 catchup 脚本缺失，已记录并绕过
- 当前目录不是 git 仓库，无法使用 worktree，已记录
