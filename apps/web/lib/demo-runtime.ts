import type { CostMode, DecisionCard, IntentMode, Outcome, OutcomeCard, SSEEvent } from "@ciao/shared";
import {
  createStartedIntent,
  getHomeSnapshot as getPersistentHomeSnapshot,
  listDecisions,
  listIntents,
  listOutcomes,
  previewIntent as previewPersistentIntent,
  resetPersistence,
  resolveDecision as resolvePersistentDecision,
} from "./runtime-repository";
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

type DemoRuntimeState = {
  events: SSEEvent[];
};

const globalForDemoRuntime = globalThis as typeof globalThis & {
  __ciaoDemoRuntime?: DemoRuntimeState;
  __ciaoTestWorkspaceId?: string;
};

const state =
  globalForDemoRuntime.__ciaoDemoRuntime ??
  (globalForDemoRuntime.__ciaoDemoRuntime = {
    events: [],
  });

async function getTestWorkspaceId(): Promise<string> {
  if (globalForDemoRuntime.__ciaoTestWorkspaceId) {
    return globalForDemoRuntime.__ciaoTestWorkspaceId;
  }
  const ws = await prisma.workspace.upsert({
    where: { slug: "test-workspace" },
    update: {},
    create: { name: "Test Workspace", slug: "test-workspace", settings: "{}" },
  });
  globalForDemoRuntime.__ciaoTestWorkspaceId = ws.id;
  return ws.id;
}

export function pushDemoEvents(...events: SSEEvent[]) {
  state.events.push(...events);
}

export async function previewDemoIntent(input: PreviewIntentInput) {
  return previewPersistentIntent(input);
}

export async function resetDemoRuntime() {
  const workspaceId = await getTestWorkspaceId();
  globalForDemoRuntime.__ciaoTestWorkspaceId = workspaceId;
  await resetPersistence(workspaceId);
  state.events = [];
}

export async function createDemoIntent(input: CreateIntentInput) {
  const workspaceId = await getTestWorkspaceId();
  const intent = await createStartedIntent(input, workspaceId);
  const preview = await previewPersistentIntent(input);

  if (input.forceDecision) {
    const decisions = await listDecisions(workspaceId);
    const createdDecision = decisions.find((decision: DecisionCard) => decision.intentId === intent.id);
    if (createdDecision) {
      pushDemoEvents(
        { type: "decision_created", data: createdDecision },
        {
          type: "calm_state_changed",
          data: { calmState: "needs_you", summary: "One decision needs you." },
        },
      );
    }
  } else {
    pushDemoEvents(
      {
        type: "calm_state_changed",
        data: { calmState: "working", summary: "CIAO is working quietly." },
      },
      {
        type: "loop_progress",
        data: {
          intentId: intent.id,
          message: "CIAO is moving through a focused execution loop.",
        },
      },
    );
  }

  return { intent, preview: preview.preview };
}

export async function getHomeSnapshot() {
  const workspaceId = await getTestWorkspaceId();
  return getPersistentHomeSnapshot(workspaceId);
}

export async function getOpenDecisions() {
  const workspaceId = await getTestWorkspaceId();
  return listDecisions(workspaceId);
}

export async function getIntentList() {
  const workspaceId = await getTestWorkspaceId();
  return listIntents(workspaceId);
}

export async function getDecisionCards() {
  const workspaceId = await getTestWorkspaceId();
  return listDecisions(workspaceId);
}

export async function resolveDecision(decisionId: string, optionId: string) {
  const workspaceId = await getTestWorkspaceId();
  const outcome = await resolvePersistentDecision(decisionId, optionId, workspaceId);
  if (outcome) {
    pushDemoEvents(
      {
        type: "outcome_ready",
        data: {
          id: outcome.id,
          intentId: outcome.intentId,
          title: outcome.title,
          summary: outcome.summary,
          confidence: outcome.confidence,
          costLabel: outcome.costSummary.label,
          state: outcome.state,
          createdAt: outcome.createdAt,
        },
      },
      {
        type: "calm_state_changed",
        data: { calmState: "working", summary: "CIAO has a result ready for review." },
      },
    );
  }
  return outcome;
}

export async function getOutcomeCards(): Promise<OutcomeCard[]> {
  const workspaceId = await getTestWorkspaceId();
  const outcomes = await listOutcomes(workspaceId);
  return outcomes.map((outcome: Outcome) => ({
    id: outcome.id,
    intentId: outcome.intentId,
    title: outcome.title,
    summary: outcome.summary,
    confidence: outcome.confidence,
    costLabel: outcome.costSummary.label,
    state: outcome.state,
    createdAt: outcome.createdAt,
  }));
}

export function drainDemoEvents(): SSEEvent[] {
  const queued = [...state.events];
  state.events = [];
  return queued;
}
