import type {
  CostMode,
  DecisionCard,
  DecisionOption,
  HomePayload,
  Intent,
  Memory,
  IntentMode,
  Outcome,
  OutcomeCard,
  Signal,
} from "@ciao/shared";
import { appendEvent } from "./event-repository";
import { prisma } from "./prisma";

type CreateIntentInput = {
  rawInput: string;
  mode: IntentMode;
  costMode: CostMode;
  forceDecision?: boolean;
};

type PreviewIntentInput = {
  rawInput: string;
  mode: IntentMode;
  costMode: CostMode;
};

type SaveMemoryInput = {
  title?: string;
};

function inferRiskLevel(rawInput: string): Intent["riskLevel"] {
  const normalized = rawInput.toLowerCase();
  if (normalized.includes("auth") || normalized.includes("oauth") || normalized.includes("billing")) {
    return "high";
  }
  return "medium";
}

function makeTitle(rawInput: string) {
  return rawInput.trim().slice(0, 60) || "Untitled intent";
}

function parseList(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return JSON.parse(value) as string[];
}

function parseOptions(value: string): DecisionOption[] {
  return JSON.parse(value) as DecisionOption[];
}

function parseObject(value: string | null): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }
  return JSON.parse(value) as Record<string, unknown>;
}

function formatIntentRecord(record: {
  id: string;
  workspaceId: string;
  rawInput: string;
  title: string;
  interpretedGoal: string;
  mode: string;
  costMode: string;
  state: string;
  importance: string;
  riskLevel: string;
  constraints: string | null;
  desiredOutcome: string | null;
  previewMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Intent {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    rawInput: record.rawInput,
    title: record.title,
    interpretedGoal: record.interpretedGoal,
    constraints: parseList(record.constraints),
    desiredOutcome: record.desiredOutcome ?? undefined,
    mode: record.mode as IntentMode,
    costMode: record.costMode as CostMode,
    state: record.state as Intent["state"],
    importance: record.importance as Intent["importance"],
    riskLevel: record.riskLevel as Intent["riskLevel"],
    previewMessage: record.previewMessage ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function formatDecisionCard(record: {
  id: string;
  intentId: string;
  title: string;
  question: string;
  recommendation: string | null;
  options: string;
  severity: string;
  state: string;
  createdAt: Date;
  intent: { title: string };
}): DecisionCard {
  return {
    id: record.id,
    intentId: record.intentId,
    intentTitle: record.intent.title,
    title: record.title,
    question: record.question,
    recommendation: record.recommendation,
    options: parseOptions(record.options),
    severity: record.severity as DecisionCard["severity"],
    state: record.state as DecisionCard["state"],
    createdAt: record.createdAt.toISOString(),
  };
}

function formatOutcome(record: {
  id: string;
  intentId: string;
  title: string;
  summary: string;
  changed: string | null;
  verified: string | null;
  risks: string | null;
  confidence: string;
  costSummary: string | null;
  receipt: string | null;
  state: string;
  createdAt: Date;
}): Outcome {
  const costSummary = parseObject(record.costSummary) as Outcome["costSummary"] | undefined;

  return {
    id: record.id,
    intentId: record.intentId,
    title: record.title,
    summary: record.summary,
    changed: parseList(record.changed),
    verified: parseList(record.verified),
    risks: parseList(record.risks),
    confidence: record.confidence as Outcome["confidence"],
    costSummary: costSummary ?? { mode: "balanced", label: "Balanced" },
    receipt: parseObject(record.receipt),
    state: record.state as Outcome["state"],
    createdAt: record.createdAt.toISOString(),
  };
}

function formatOutcomeCard(outcome: Outcome): OutcomeCard {
  return {
    id: outcome.id,
    intentId: outcome.intentId,
    title: outcome.title,
    summary: outcome.summary,
    confidence: outcome.confidence,
    costLabel: outcome.costSummary.label,
    state: outcome.state,
    createdAt: outcome.createdAt,
  };
}

function formatSignal(record: {
  id: string;
  intentId: string | null;
  kind: string;
  level: string;
  message: string;
  compact: boolean;
  createdAt: Date;
}): Signal {
  return {
    id: record.id,
    intentId: record.intentId ?? "",
    kind: record.kind as Signal["kind"],
    level: record.level as Signal["level"],
    message: record.message,
    compact: record.compact,
    createdAt: record.createdAt.toISOString(),
  };
}

function formatMemory(record: {
  id: string;
  workspaceId: string;
  outcomeId: string | null;
  title: string;
  trigger: string;
  compactRule: string;
  fullProcedure: string | null;
  examples: string | null;
  confidence: number;
  status: string;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Memory {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    outcomeId: record.outcomeId ?? undefined,
    title: record.title,
    trigger: record.trigger,
    compactRule: record.compactRule,
    fullProcedure: record.fullProcedure ?? undefined,
    examples: parseList(record.examples),
    confidence: record.confidence,
    status: record.status as Memory["status"],
    lastUsedAt: record.lastUsedAt?.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapOutcomeConfidence(confidence: Outcome["confidence"]) {
  if (confidence === "high") {
    return 0.85;
  }
  if (confidence === "medium") {
    return 0.65;
  }
  return 0.45;
}

export async function resetPersistence(workspaceId: string) {
  await prisma.eventLog.deleteMany({ where: { workspaceId } });
  await prisma.memory.deleteMany({ where: { workspaceId } });
  await prisma.signal.deleteMany({ where: { workspaceId } });
  await prisma.outcome.deleteMany({
    where: { intent: { workspaceId } },
  });
  await prisma.decision.deleteMany({
    where: { intent: { workspaceId } },
  });
  await prisma.intent.deleteMany({ where: { workspaceId } });
}

export async function previewIntent(input: PreviewIntentInput) {
  const now = new Date().toISOString();
  const intent: Intent = {
    id: `preview_${Math.random().toString(36).slice(2, 10)}`,
    workspaceId: "preview",
    rawInput: input.rawInput,
    title: makeTitle(input.rawInput),
    interpretedGoal: input.rawInput.trim(),
    constraints: ["Keep the surface calm", "Stay focused on the requested outcome"],
    desiredOutcome: "A calm, reviewable result",
    mode: input.mode,
    costMode: input.costMode,
    state: "understanding",
    importance: "normal",
    riskLevel: inferRiskLevel(input.rawInput),
    previewMessage: "CIAO understands the goal and is ready to begin on a focused path.",
    createdAt: now,
    updatedAt: now,
  };

  return {
    intent,
    preview: {
      title: intent.title,
      interpretedGoal: intent.interpretedGoal,
      mode: intent.mode,
      costMode: intent.costMode,
      constraints: intent.constraints,
      riskHints: intent.riskLevel === "high" ? ["auth-sensitive"] : [],
      previewMessage: intent.previewMessage ?? "",
    },
  };
}

export async function createStartedIntent(input: CreateIntentInput, workspaceId: string) {
  const preview = await previewIntent(input);

  const record = await prisma.intent.create({
    data: {
      workspaceId,
      rawInput: input.rawInput,
      title: preview.intent.title,
      interpretedGoal: preview.intent.interpretedGoal,
      mode: input.mode,
      costMode: input.costMode,
      state: input.forceDecision ? "needs_decision" : "working",
      importance: "normal",
      riskLevel: preview.intent.riskLevel,
      constraints: JSON.stringify(preview.intent.constraints),
      desiredOutcome: preview.intent.desiredOutcome,
      previewMessage: "CIAO is following a focused path and will ask only if needed.",
    },
  });

  await prisma.signal.create({
    data: {
      workspaceId,
      intentId: record.id,
      kind: "progress",
      level: "medium",
      message: input.forceDecision
        ? "CIAO found a high-risk branch and is preparing a decision."
        : "CIAO is moving through a focused execution loop.",
      compact: true,
    },
  });

  if (input.forceDecision) {
    const options: DecisionOption[] = [
      { id: "minimal", label: "Approve minimal", description: "Lower risk and faster." },
      { id: "broader", label: "Try broader", description: "Cleaner but touches more surface." },
      { id: "pause", label: "Pause", description: "Stop here and summarize." },
    ];

    const decision = await prisma.decision.create({
      data: {
        intentId: record.id,
        title: "Safer path available",
        question: "Should CIAO use the smaller fix first?",
        recommendation: "minimal",
        options: JSON.stringify(options),
        severity: "high",
        state: "open",
      },
    });

    await prisma.signal.create({
      data: {
        workspaceId,
        intentId: record.id,
        kind: "decision",
        level: "high",
        message: "CIAO needs a small judgment call before continuing.",
        compact: true,
      },
    });

    await appendEvent({
      workspaceId,
      stream: "home",
      type: "decision_created",
      intentId: record.id,
      payload: {
        id: decision.id,
        intentId: record.id,
        intentTitle: record.title,
        title: decision.title,
        question: decision.question,
        recommendation: decision.recommendation,
        options: parseOptions(decision.options),
        severity: decision.severity,
        state: decision.state,
        createdAt: decision.createdAt.toISOString(),
      },
    });
    await appendEvent({
      workspaceId,
      stream: "home",
      type: "calm_state_changed",
      intentId: record.id,
      payload: {
        calmState: "needs_you",
        summary: "One decision needs you.",
      },
    });
  } else {
    await appendEvent({
      workspaceId,
      stream: "home",
      type: "calm_state_changed",
      intentId: record.id,
      payload: {
        calmState: "working",
        summary: "CIAO is working quietly.",
      },
    });
    await appendEvent({
      workspaceId,
      stream: "home",
      type: "loop_progress",
      intentId: record.id,
      payload: {
        intentId: record.id,
        message: "CIAO is moving through a focused execution loop.",
      },
    });
  }

  return formatIntentRecord(record);
}

export async function listIntents(workspaceId: string) {
  const intents = await prisma.intent.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return intents.map(formatIntentRecord);
}

export async function listDecisions(workspaceId: string) {
  const decisions = await prisma.decision.findMany({
    where: { state: "open", intent: { workspaceId } },
    include: { intent: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return decisions.map(formatDecisionCard);
}

export async function listOutcomes(workspaceId: string) {
  const outcomes = await prisma.outcome.findMany({
    where: { intent: { workspaceId } },
    orderBy: { createdAt: "desc" },
  });

  return outcomes.map(formatOutcome);
}

export async function listSignalsForIntent(intentId: string) {
  const signals = await prisma.signal.findMany({
    where: { intentId },
    orderBy: { createdAt: "asc" },
  });

  return signals.map(formatSignal);
}

export async function listMemories(workspaceId: string) {
  const memories = await prisma.memory.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return memories.map(formatMemory);
}

export async function getHomeSnapshot(workspaceId: string): Promise<HomePayload> {
  const intents = await listIntents(workspaceId);
  const decisions = await listDecisions(workspaceId);
  const outcomes = await listOutcomes(workspaceId);

  const activeIntents = intents.filter((intent) => intent.state === "working" || intent.state === "needs_decision");
  const now = activeIntents.slice(0, 3).map((intent) => ({
    intentId: intent.id,
    title: intent.title,
    state: intent.state === "needs_decision" ? "Needs you" : "Working",
    message:
      intent.state === "needs_decision"
        ? "CIAO is waiting for a small judgment call."
        : "CIAO is moving through a focused execution loop.",
    costMode: intent.costMode[0].toUpperCase() + intent.costMode.slice(1),
    risk: intent.riskLevel === "high" ? "Auth-sensitive" : "Normal",
    confidence: intent.state === "needs_decision" ? ("medium" as const) : ("high" as const),
  }));

  return {
    greeting: "Good evening.",
    calmState: decisions.length > 0 ? "needs_you" : now.length > 0 ? "working" : "calm",
    summary:
      decisions.length > 0
        ? "One decision needs you."
        : now.length > 0
          ? "CIAO is working quietly."
          : "CIAO is calm.",
    now,
    backgroundLoopCount: Math.max(activeIntents.length - now.length, 0),
    decisions,
    outcomes: outcomes.slice(0, 5).map(formatOutcomeCard),
  };
}

export async function resolveDecision(decisionId: string, optionId: string, workspaceId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const decision = await tx.decision.findUnique({
      where: { id: decisionId },
      include: { intent: true },
    });

    if (!decision) {
      return null;
    }

    await tx.decision.update({
      where: { id: decisionId },
      data: {
        state: "resolved",
        resolvedOptionId: optionId,
        resolvedAt: new Date(),
      },
    });

    await tx.intent.update({
      where: { id: decision.intentId },
      data: {
        state: "ready",
      },
    });

    const outcome = await tx.outcome.create({
      data: {
        intentId: decision.intentId,
        title: `${decision.intent.title} ready`,
        summary: `CIAO applied the ${optionId} path and prepared the result for acceptance.`,
        changed: JSON.stringify(["Focused implementation path selected"]),
        verified: JSON.stringify(["Decision resolved and intent advanced"]),
        risks: JSON.stringify(["Real code changes are still mocked in this demo loop"]),
        confidence: "medium",
        costSummary: JSON.stringify({
          mode: "frugal",
          label: "Frugal · below normal",
        }),
        receipt: JSON.stringify({
          decisionId,
          optionId,
        }),
        state: "ready",
      },
    });

    await tx.signal.create({
      data: {
        workspaceId: decision.intent.workspaceId,
        intentId: decision.intentId,
        kind: "result",
        level: "medium",
        message: "CIAO has prepared a result ready for review.",
        compact: true,
      },
    });

    const formatted = formatOutcome(outcome);
    return {
      outcome: formatted,
      intentId: decision.intentId,
    };
  });

  if (!result) {
    return null;
  }

  await appendEvent({
    workspaceId,
    stream: "home",
    type: "outcome_ready",
    intentId: result.intentId,
    payload: {
      id: result.outcome.id,
      intentId: result.outcome.intentId,
      title: result.outcome.title,
      summary: result.outcome.summary,
      confidence: result.outcome.confidence,
      costLabel: result.outcome.costSummary.label,
      state: result.outcome.state,
      createdAt: result.outcome.createdAt,
    },
  });
  await appendEvent({
    workspaceId,
    stream: "home",
    type: "calm_state_changed",
    intentId: result.intentId,
    payload: {
      calmState: "working",
      summary: "CIAO has a result ready for review.",
    },
  });

  return result.outcome;
}

export async function acceptOutcome(outcomeId: string) {
  const outcome = await prisma.outcome.update({
    where: { id: outcomeId },
    data: { state: "accepted" },
  });

  return formatOutcome(outcome);
}

export async function revertOutcome(outcomeId: string) {
  const outcome = await prisma.outcome.update({
    where: { id: outcomeId },
    data: { state: "reverted" },
  });

  return formatOutcome(outcome);
}

export async function getOutcome(outcomeId: string) {
  const outcome = await prisma.outcome.findUnique({
    where: { id: outcomeId },
  });
  if (!outcome) return null;
  return formatOutcome(outcome);
}

export async function updateMemory(
  memoryId: string,
  data: { title?: string; status?: string },
) {
  const memory = await prisma.memory.update({
    where: { id: memoryId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });

  return formatMemory(memory);
}

export async function deleteMemory(memoryId: string) {
  await prisma.memory.delete({ where: { id: memoryId } });
  return { success: true };
}

export async function updateIntentState(
  intentId: string,
  state: Intent["state"],
) {
  const intent = await prisma.intent.update({
    where: { id: intentId },
    data: { state },
  });

  return formatIntentRecord(intent);
}

export async function saveMemoryFromOutcome(outcomeId: string, input: SaveMemoryInput = {}) {
  const outcome = await prisma.outcome.findUnique({
    where: { id: outcomeId },
    include: {
      intent: {
        select: {
          workspaceId: true,
          title: true,
        },
      },
    },
  });

  if (!outcome) {
    return null;
  }

  const title = input.title?.trim() || outcome.title;
  const changed = parseList(outcome.changed);
  const memory = await prisma.memory.create({
    data: {
      workspaceId: outcome.intent.workspaceId,
      outcomeId: outcome.id,
      title,
      trigger: outcome.summary,
      compactRule: title,
      fullProcedure: outcome.summary,
      examples: changed.length > 0 ? JSON.stringify(changed) : null,
      confidence: mapOutcomeConfidence(outcome.confidence as Outcome["confidence"]),
      status: "active",
    },
  });

  return formatMemory(memory);
}

// ─── Agent CRUD ────────────────────────────────────────────────

export async function listAgents(workspaceId: string) {
  const agents = await prisma.agent.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { skills: true, runs: true } },
    },
  });
  return agents.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    type: a.type,
    status: a.status,
    avatarUrl: a.avatarUrl,
    skillsCount: a._count.skills,
    runsCount: a._count.runs,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function getAgent(agentId: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      skills: {
        include: { skill: true },
      },
      _count: { select: { runs: true, memories: true } },
    },
  });
  if (!agent) return null;

  return {
    id: agent.id,
    workspaceId: agent.workspaceId,
    name: agent.name,
    description: agent.description,
    type: agent.type,
    status: agent.status,
    provider: agent.provider,
    model: agent.model,
    systemPrompt: agent.systemPrompt,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    price: agent.price,
    metadata: agent.metadata,
    avatarUrl: agent.avatarUrl,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
    skills: agent.skills.map((s) => ({
      id: s.skill.id,
      name: s.skill.name,
      enabled: s.enabled,
    })),
    runsCount: agent._count.runs,
    memoriesCount: agent._count.memories,
  };
}

export async function createAgent(data: {
  workspaceId: string;
  name: string;
  description?: string;
  type?: "system" | "custom" | "marketplace";
  systemPrompt?: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  price?: number;
  avatarUrl?: string;
}) {
  return prisma.agent.create({ data: data as any });
}

export async function updateAgent(
  agentId: string,
  data: {
    name?: string;
    description?: string;
    status?: "active" | "inactive" | "archived";
    systemPrompt?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    price?: number;
    avatarUrl?: string;
  },
) {
  return prisma.agent.update({ where: { id: agentId }, data: data as any });
}

export async function deleteAgent(agentId: string) {
  await prisma.agent.delete({ where: { id: agentId } });
  return { success: true };
}

// ─── Skill CRUD ────────────────────────────────────────────────

export async function listSkills(workspaceId: string) {
  const skills = await prisma.skill.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { agents: true } },
    },
  });
  return skills.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    version: s.version,
    agentsCount: s._count.agents,
  }));
}

export async function getSkill(skillId: string) {
  return prisma.skill.findUnique({ where: { id: skillId } });
}

export async function createSkill(data: {
  workspaceId: string;
  name: string;
  description?: string;
  content: string;
  category?: string;
  version?: string;
}) {
  return prisma.skill.create({ data });
}

export async function updateSkill(
  skillId: string,
  data: {
    name?: string;
    description?: string;
    content?: string;
    category?: string;
    version?: string;
  },
) {
  return prisma.skill.update({ where: { id: skillId }, data });
}

export async function deleteSkill(skillId: string) {
  await prisma.skill.delete({ where: { id: skillId } });
  return { success: true };
}

// ─── Agent-Skill binding ───────────────────────────────────────

export async function getAgentSkills(agentId: string) {
  return prisma.agentSkill.findMany({
    where: { agentId },
    include: { skill: true },
  });
}

export async function enableSkill(agentId: string, skillId: string) {
  const existing = await prisma.agentSkill.findUnique({
    where: { agentId_skillId: { agentId, skillId } },
  });
  if (existing) {
    return prisma.agentSkill.update({
      where: { agentId_skillId: { agentId, skillId } },
      data: { enabled: !existing.enabled },
    });
  }
  return prisma.agentSkill.create({ data: { agentId, skillId, enabled: true } });
}

export async function disableSkill(agentId: string, skillId: string) {
  await prisma.agentSkill.delete({
    where: { agentId_skillId: { agentId, skillId } },
  });
  return { success: true };
}

// ─── Team CRUD ─────────────────────────────────────────────────

export async function listTeams(workspaceId: string) {
  const teams = await prisma.team.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
    },
  });
  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    membersCount: t._count.members,
  }));
}

export async function getTeam(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          agent: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!team) return null;

  return {
    id: team.id,
    workspaceId: team.workspaceId,
    name: team.name,
    description: team.description,
    createdAt: team.createdAt.toISOString(),
    updatedAt: team.updatedAt.toISOString(),
    members: team.members.map((m) => ({
      id: m.id,
      teamId: m.teamId,
      agentId: m.agentId,
      role: m.role,
      agentName: m.agent.name,
      agentAvatarUrl: m.agent.avatarUrl,
    })),
  };
}

export async function createTeam(data: {
  workspaceId: string;
  name: string;
  description?: string;
}) {
  return prisma.team.create({ data });
}

export async function updateTeam(
  teamId: string,
  data: { name?: string; description?: string },
) {
  return prisma.team.update({ where: { id: teamId }, data });
}

export async function deleteTeam(teamId: string) {
  await prisma.team.delete({ where: { id: teamId } });
  return { success: true };
}

export async function addTeamMember(teamId: string, agentId: string, role: string = "member") {
  return prisma.teamMember.create({ data: { teamId, agentId, role } });
}

export async function removeTeamMember(memberId: string) {
  await prisma.teamMember.delete({ where: { id: memberId } });
  return { success: true };
}

export async function updateTeamMemberRole(memberId: string, role: string) {
  return prisma.teamMember.update({ where: { id: memberId }, data: { role } });
}

// ─── Agent Run ─────────────────────────────────────────────────

export async function createAgentRun(agentId: string, intentId: string) {
  return prisma.agentRun.create({ data: { agentId, intentId, status: "running" } });
}

export async function updateAgentRunStatus(runId: string, status: string) {
  const data: { status: string; completedAt?: Date } = { status };
  if (status === "completed" || status === "failed") {
    data.completedAt = new Date();
  }
  return prisma.agentRun.update({ where: { id: runId }, data });
}

export async function getAgentRuns(agentId: string) {
  const runs = await prisma.agentRun.findMany({
    where: { agentId },
    orderBy: { startedAt: "desc" },
    include: {
      intent: { select: { title: true } },
    },
  });
  return runs.map((r) => ({
    id: r.id,
    agentId: r.agentId,
    agentName: "",
    intentTitle: r.intent.title,
    status: r.status,
    startedAt: r.startedAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
    duration: r.completedAt
      ? Math.round((r.completedAt.getTime() - r.startedAt.getTime()) / 1000)
      : null,
  }));
}

// ─── Agent Memory ──────────────────────────────────────────────

export async function getAgentMemories(agentId: string) {
  const memories = await prisma.agentMemory.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
  });
  return memories.map((m) => ({
    id: m.id,
    agentId: m.agentId,
    content: m.content,
    type: m.type,
    source: m.source,
    confidence: m.confidence,
    tags: m.tags,
    createdAt: m.createdAt.toISOString(),
    lastAccess: m.lastAccess.toISOString(),
  }));
}

export async function createAgentMemory(data: {
  agentId: string;
  content: string;
  type?: string;
  source?: string;
  confidence?: number;
  tags?: string[];
}) {
  return prisma.agentMemory.create({
    data: {
      agentId: data.agentId,
      content: data.content,
      type: data.type ?? "observation",
      source: data.source,
      confidence: data.confidence ?? 0.5,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    },
  });
}

export async function deleteAgentMemory(memoryId: string) {
  await prisma.agentMemory.delete({ where: { id: memoryId } });
  return { success: true };
}

export async function searchAgentMemories(agentId: string, query: string) {
  const memories = await prisma.agentMemory.findMany({
    where: {
      agentId,
      content: { contains: query },
    },
    orderBy: { confidence: "desc" },
    take: 20,
  });
  return memories.map((m) => ({
    id: m.id,
    agentId: m.agentId,
    content: m.content,
    type: m.type,
    source: m.source,
    confidence: m.confidence,
    tags: m.tags,
    createdAt: m.createdAt.toISOString(),
    lastAccess: m.lastAccess.toISOString(),
  }));
}

// ─── Marketplace ───────────────────────────────────────────────

export async function getMyMarketplaceListings(workspaceId: string) {
  const listings = await prisma.marketplaceListing.findMany({
    where: { agent: { workspaceId } },
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { name: true, description: true, avatarUrl: true } },
    },
  });
  return listings.map((l) => ({
    id: l.id,
    agentId: l.agentId,
    agentName: l.agent.name,
    agentDescription: l.agent.description,
    agentAvatarUrl: l.agent.avatarUrl,
    price: l.price,
    rating: l.rating,
    downloads: l.downloads,
    featured: l.featured,
  }));
}

export async function getMarketplaceListings(options?: {
  sort?: string;
  tag?: string;
}) {
  const where: any = { status: "ACTIVE" };
  if (options?.tag) {
    where.tags = { contains: options.tag };
  }

  let orderBy: any = { createdAt: "desc" };
  if (options?.sort === "popular") orderBy = { downloads: "desc" };
  else if (options?.sort === "price_low") orderBy = { price: "asc" };
  else if (options?.sort === "price_high") orderBy = { price: "desc" };

  const listings = await prisma.marketplaceListing.findMany({
    where,
    orderBy,
    include: {
      agent: {
        select: {
          name: true,
          description: true,
          avatarUrl: true,
          workspace: {
            select: {
              authorProfile: { select: { tier: true } },
            },
          },
        },
      },
    },
  });
  return listings.map((l) => ({
    id: l.id,
    agentId: l.agentId,
    agentName: l.agent.name,
    agentDescription: l.agent.description,
    agentAvatarUrl: l.agent.avatarUrl,
    price: l.price,
    weeklyPrice: l.weeklyPrice,
    monthlyPrice: l.monthlyPrice,
    rating: l.rating,
    downloads: l.downloads,
    featured: l.featured,
    totalSubscribers: l.totalSubscribers,
    tags: l.tags,
    authorTier: l.agent.workspace.authorProfile?.tier ?? null,
  }));
}

export async function getMarketplaceListingById(id: string) {
  return prisma.marketplaceListing.findUnique({
    where: { id },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          description: true,
          avatarUrl: true,
          provider: true,
          model: true,
          workspace: {
            select: {
              authorProfile: {
                select: {
                  tier: true,
                  totalSubscribers: true,
                  rating: true,
                  displayName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createListing(data: {
  agentId: string;
  price: number;
  description: string;
  weeklyPrice?: number;
  monthlyPrice?: number;
  tags?: string;
}) {
  return prisma.marketplaceListing.create({
    data: {
      agentId: data.agentId,
      price: data.price,
      description: data.description,
      weeklyPrice: data.weeklyPrice,
      monthlyPrice: data.monthlyPrice,
      tags: data.tags,
    },
  });
}

export async function updateListing(
  id: string,
  workspaceId: string,
  data: { price?: number; weeklyPrice?: number; monthlyPrice?: number; description?: string; tags?: string },
) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: { agent: true },
  });
  if (!listing || listing.agent.workspaceId !== workspaceId) return null;

  return prisma.marketplaceListing.update({
    where: { id },
    data,
  });
}

export async function unlistListing(id: string, workspaceId: string) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    include: { agent: true },
  });
  if (!listing || listing.agent.workspaceId !== workspaceId) return null;

  return prisma.marketplaceListing.update({
    where: { id },
    data: { status: "UNLISTED" },
  });
}

export async function purchaseListing(listingId: string, buyerId: string) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.marketplaceListing.findUnique({
      where: { id: listingId },
      include: { agent: true },
    });
    if (!listing) return null;

    const txRecord = await tx.transaction.create({
      data: {
        listingId,
        buyerId,
        amount: listing.price,
        status: "completed",
        completedAt: new Date(),
      },
    });

    await tx.marketplaceListing.update({
      where: { id: listingId },
      data: { downloads: { increment: 1 } },
    });

    const clonedAgent = await tx.agent.create({
      data: {
        workspaceId: buyerId,
        name: `${listing.agent.name} (marketplace)`,
        description: listing.agent.description,
        type: "marketplace",
        systemPrompt: listing.agent.systemPrompt,
        provider: listing.agent.provider,
        model: listing.agent.model,
        temperature: listing.agent.temperature,
        maxTokens: listing.agent.maxTokens,
      },
    });

    return { transaction: txRecord, clonedAgent };
  });
}
