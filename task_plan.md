# CIAO v0.2 完整工程骨架任务计划

## Goal

基于 `PRD` 与详细设计文档，在当前空目录中落地一个可运行、可扩展的 CIAO v0.2 工程骨架，覆盖 `web`、`shared`、`engine`、`providers`、`worker` 与基础数据模型。

## Current Status

- 状态：`completed`
- 范围：`完整工程骨架`
- 实现策略：优先做 monorepo 与骨架代码，功能层先以 mock / 占位实现为主，保证目录、类型、页面、API、engine 入口齐备

## Phases

### Phase 1: 规划与初始化

- [completed] 归纳产品与工程设计
- [completed] 建立 `task_plan.md`、`findings.md`、`progress.md`
- [completed] 输出详细实现计划到 `docs/plans/`

### Phase 2: 工程基础设施

- [completed] 初始化根目录 `package.json`、`turbo.json`、`tsconfig.base.json`
- [completed] 初始化 `apps/web` 的 Next.js 14 + Tailwind + TypeScript 结构
- [completed] 初始化 `packages/shared`、`packages/engine`、`packages/providers`
- [completed] 初始化 `workers/loop-worker.ts`
- [completed] 初始化 `.env.example`、`README.md`、`docker-compose.yml`

### Phase 3: 数据模型与共享契约

- [completed] 写入 Prisma schema
- [completed] 建立共享类型与常量
- [completed] 建立 API payload / domain validators

### Phase 4: Web Surface 骨架

- [completed] 实现 `app/` 路由结构
- [completed] 实现 `Shell`、导航、页面布局
- [completed] 实现 `CalmStatus`、`NowCard`、`DecisionCard`、`OutcomeCard`
- [completed] 实现 `CommandBar`、`IntentPreview`、`ControlGestures`
- [completed] 实现 Zustand stores 与 hooks 骨架

### Phase 5: API 与 Engine 骨架

- [completed] 实现 CAO-facing API 占位
- [completed] 实现 internal API 占位
- [completed] 实现 `governor`、`cost-governor`、`risk-sentinel`、`model-router`
- [completed] 实现 mock provider 与 capability 入口

### Phase 6: 验证

- [completed] 安装依赖
- [completed] 运行类型检查 / lint
- [completed] 运行 diagnostics 并修复明显问题

## Key Decisions

- 采用详细设计文档中的 monorepo 结构，不额外扩展新子系统
- 本轮以“工程骨架完整”为目标，不尝试完成真实 AI provider、真实 worker 流转与完整认证
- 所有 CAO-facing 文案优先遵循 PRD 的 calm / minimal 语言风格

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| `planning-with-files` 的 `session-catchup.py` 路径不存在 | 1 | 直接在项目目录手动创建规划文件并继续 |
| 当前目录不是 git 仓库，无法创建 worktree | 1 | 在原目录继续实现，如有需要后续补 `git init` |
| 根目录首次批量生成命令被 shell quoting 打碎 | 1 | 改为稳定的脚本生成与分步 patch |
| `zsh` 将 `[id]` 路径解释为 glob | 1 | 改为 `python` 创建目录，绕开 shell 展开 |
| 初次 `web` typecheck 缺失 `Next` 类型依赖 | 1 | 在骨架生成后重新执行根目录 `npm install` |
| `turbo` 默认访问系统级缓存目录被 sandbox 提示限制 | 1 | 改为项目内 `.turbo/cache`，并记录该环境残余提示 |

## Post-Foundation Delivery Slices

### Slice A: 可演示 MVP 闭环

- [completed] 串起 `POST /api/intents`
- [completed] 串起 `Home` 快照与 SSE 增量更新
- [completed] 串起 `Decision resolve -> Outcome ready`

### Slice A.1: SQLite 持久化

- [completed] 将 `Workspace / Intent / Decision / Outcome` 切到 Prisma + SQLite
- [completed] 保持现有 API contract 基本不变

### Slice A.2: Signal / Memory / Recoverable SSE

- [completed] 持久化 `Signal`
- [completed] 持久化 `Memory`
- [completed] 持久化 `EventLog`
- [completed] 将 `/api/events` 升级为 `lastEventId` 可恢复 backlog
- [completed] 升级 Home store 与 `useSSE()` 支持 cursor 恢复
- [completed] 接通 `Outcome -> Save Memory`

### Suggested Next Product Slices

- [completed] A.3 `real worker / loop / provider chain`
- [pending] A.4 `Auth.js + workspace isolation`
- [pending] A.5 `BullMQ worker + outcome artifacts`
- [pending] A.6 `memory retrieval / curation / feedback loop`
