# CIAO v0.2 Findings

## Product Findings

- CIAO 的唯一人类角色是 `CAO`，主交互对象不是 task/agent，而是 `Intent`、`Signal`、`Decision`、`Outcome`、`Memory`
- 主界面核心结构固定为 `Command Bar`、`Now`、`Needs You`、`Outcomes`
- 成本表达必须抽象为 `Frugal`、`Balanced`、`Thorough`，默认不暴露 raw token ledger
- 高风险域包括 `auth`、`billing`、`permission`、`data migration`、`secrets`、`public API`、`destructive commands`
- UI 风格强调 calm control surface，不做看板、复杂表格、agent 员工列表

## Engineering Findings

- 详细设计指定技术栈：`Next.js 14`、`Tailwind CSS`、`Prisma`、`PostgreSQL`、`BullMQ`、`Redis`、`Zustand`
- 推荐目录采用 monorepo：`apps/web`、`packages/shared`、`packages/engine`、`packages/providers`、`workers`
- 实时通信优先 `SSE`，非 WebSocket
- API 分为两层：CAO-facing 和 internal worker-facing
- Loop Engine 采用 adaptive next-step，而不是固定 planner/executor/reviewer pipeline
- 对单机 MVP，`EventLog + lastEventId + EventSource` 可作为“页面刷新可恢复”的最小实时方案；是否升级为真正长连接 pub/sub，可延后到多客户端阶段
- 在 `Prisma + SQLite` 下，不应在 `$transaction` 内再通过全局 `prisma` 写 `EventLog`；事件追加应在事务提交后执行，否则容易触发锁等待
- 若测试或脚本会直接导入 `PrismaClient`，需要显式加载根 `.env`；不能依赖 Next 运行时替你注入 `DATABASE_URL`

## Repository Findings

- 当前 `/Users/tc/Downloads/ciao` 仅有两份文档，没有现存代码
- 当前目录不是 git 仓库
- 因无现有代码，本轮实现不存在“避免覆盖用户未提交代码”的冲突风险

## Scope Findings

- 用户已明确本轮目标为“完整工程骨架”
- 这意味着应优先保证目录、类型、页面、API、engine 入口完整，而非优先实现真实业务深度
- 当前阶段的产品推进方式已演进为：
  - 先打通“可演示单机闭环”
  - 再把关键对象与恢复语义持久化
  - 最后再补真实 worker/provider/auth 等产品级边界
