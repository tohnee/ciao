import type { ProviderAdapter } from "@ciao/providers";
import { determineNextStep, buildAgentSystemPrompt, withAgentSystemPrompt } from "@ciao/engine";
import type { GovernorContext, NextStep } from "@ciao/engine/src/types";
import { interpretIntent } from "@ciao/engine/src/capabilities/interpret-intent";
import { planChange } from "@ciao/engine/src/capabilities/plan-change";
import { editCode } from "@ciao/engine/src/capabilities/edit-code";
import { runTests } from "@ciao/engine/src/capabilities/run-tests";
import { reviewDiff } from "@ciao/engine/src/capabilities/review-diff";
import { selectFiles } from "@ciao/engine/src/capabilities/select-files";
import { monitorSignal } from "@ciao/engine/src/capabilities/monitor-signal";
import { summarizeResult } from "@ciao/engine/src/capabilities/summarize-result";
import type { Intent, Loop, LoopKind, Signal } from "@ciao/shared";
import { prisma } from "./prisma";
import { appendEvent } from "./event-repository";

const CAPABILITY_TO_LOOP_KIND: Record<string, LoopKind> = {
  interpret_intent: "understand",
  plan_change: "plan",
  edit_code: "edit",
  run_tests: "test",
  review_diff: "review",
  summarize_result: "summarize",
  select_files: "search",
  extract_memory: "remember",
  monitor_signal: "monitor",
};

const PROVIDER_TIMEOUT_MS = 120_000;

type OrchestratorState = {
  goal: string;
  plan: string;
  output: string;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timeout after ${ms}ms: ${label}`)), ms),
    ),
  ]);
}

function providerWithTimeout(provider: ProviderAdapter, ms: number): ProviderAdapter {
  const origGenerate = provider.generate.bind(provider);
  return {
    ...provider,
    generate: (prompt) => withTimeout(origGenerate(prompt), ms, provider.name),
  };
}

async function signalProgress(workspaceId: string, intentId: string, message: string) {
  await prisma.signal.create({
    data: {
      workspaceId,
      intentId,
      kind: "progress",
      level: "medium",
      message,
      compact: true,
    },
  });
}

async function failIntent(workspaceId: string, intentId: string, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown orchestrator error";
  await prisma.intent.update({
    where: { id: intentId },
    data: { state: "paused" },
  });
  await prisma.signal.create({
    data: {
      workspaceId,
      intentId,
      kind: "blocker",
      level: "high",
      message: `Execution paused: ${message}`,
      compact: false,
    },
  });
  await appendEvent({
    workspaceId,
    stream: "home",
    type: "calm_state_changed",
    payload: { calmState: "needs_you", summary: `CIAO paused: ${message}` },
  });
}

export async function orchestrateIntent(
  intent: Intent,
  provider: ProviderAdapter,
  workspaceId: string,
  agentId?: string,
): Promise<void> {
  const timedProvider = providerWithTimeout(provider, PROVIDER_TIMEOUT_MS);
  const loops: Loop[] = [];
  const signals: Signal[] = [];
  const state: OrchestratorState = {
    goal: intent.interpretedGoal,
    plan: "",
    output: "",
  };

  try {
    if (agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        include: {
          skills: {
            include: { skill: true },
            where: { enabled: true },
          },
        },
      });

      if (agent) {
        const skills = agent.skills.map((as) => ({
          name: as.skill.name,
          content: as.skill.content,
          version: as.skill.version,
        }));
        const agentSystemPrompt = buildAgentSystemPrompt(
          { systemPrompt: agent.systemPrompt, provider: agent.provider, model: agent.model, temperature: agent.temperature, maxTokens: agent.maxTokens },
          skills,
        );

        if (agentSystemPrompt) {
          const originalGenerate = timedProvider.generate.bind(timedProvider) as (
            prompt: { system?: string; messages: { role: string; content: string }[] },
          ) => Promise<{ text: string; usage?: { inputTokens?: number; outputTokens?: number } }>;
          Object.assign(timedProvider, {
            generate: withAgentSystemPrompt(agentSystemPrompt, originalGenerate) as ProviderAdapter["generate"],
          });
        }

        await prisma.agentRun.create({
          data: {
            agentId,
            intentId: intent.id,
            status: "running",
          },
        });
      }
    }

    await appendEvent({
      workspaceId,
      stream: "home",
      type: "calm_state_changed",
      payload: { calmState: "working", summary: "CIAO is interpreting your intent." },
    });

    const interpretation = await interpretIntent(intent.rawInput, timedProvider);
    state.goal = interpretation.interpretedGoal;
    await prisma.intent.update({
      where: { id: intent.id },
      data: {
        title: interpretation.title,
        interpretedGoal: interpretation.interpretedGoal,
        constraints: JSON.stringify(interpretation.constraints),
      },
    });

    await signalProgress(workspaceId, intent.id, "CIAO understood the goal and is starting work.");
    loops.push({ kind: "understand", state: "completed" } as unknown as Loop);

    let steps = 0;
    const maxSteps = 10;

    while (steps < maxSteps) {
      const context: GovernorContext = {
        intent: { ...intent, constraints: [] as unknown as string[] } as unknown as Intent,
        loops,
        signals,
        confidence: 0.7,
      };

      const next: NextStep = determineNextStep(context);

      if (next.type === "build_outcome") {
        const summary = await summarizeResult(state, timedProvider);
        await buildOutcome(intent.id, state.goal, summary);
        await appendEvent({
          workspaceId,
          stream: "home",
          type: "calm_state_changed",
          payload: { calmState: "calm", summary: "CIAO completed the work." },
        });
        return;
      }

      if (next.type === "ask_decision") {
        await prisma.decision.create({
          data: {
            intentId: intent.id,
            title: next.title,
            question: next.question,
            recommendation: "minimal",
            options: JSON.stringify([
              { id: "minimal", label: "Approve minimal", description: "Lower risk and faster." },
              { id: "broader", label: "Try broader", description: "Cleaner but touches more surface." },
              { id: "pause", label: "Pause", description: "Stop here and summarize." },
            ]),
            severity: "high",
            state: "open",
          },
        });

        await signalProgress(workspaceId, intent.id, next.question);
        await appendEvent({
          workspaceId,
          stream: "home",
          type: "decision_created",
          payload: { intentId: intent.id, title: next.title },
        });
        await appendEvent({
          workspaceId,
          stream: "home",
          type: "calm_state_changed",
          payload: { calmState: "needs_you", summary: "One decision needs you." },
        });

        await prisma.intent.update({
          where: { id: intent.id },
          data: { state: "needs_decision" },
        });
        return;
      }

      if (next.type === "run_capability") {
        await runCapability(workspaceId, next.capability, intent, state, timedProvider);

        const loopKind = CAPABILITY_TO_LOOP_KIND[next.capability] ?? next.capability.replace("_", "");
        loops.push({
          kind: loopKind,
          state: "completed",
        } as unknown as Loop);

        await signalProgress(workspaceId, intent.id, `CIAO finished ${next.capability}.`);
        await appendEvent({
          workspaceId,
          stream: "home",
          type: "loop_progress",
          payload: { intentId: intent.id, message: `CIAO completed ${next.capability}.` },
        });
      }

      if (next.type === "pause") {
        await prisma.intent.update({
          where: { id: intent.id },
          data: { state: "paused" },
        });
        return;
      }

      steps++;
    }
  } catch (err) {
    await failIntent(workspaceId, intent.id, err);
  }
}

async function runCapability(
  workspaceId: string,
  capability: string,
  intent: Intent,
  state: OrchestratorState,
  provider: ProviderAdapter,
): Promise<void> {
  switch (capability) {
    case "interpret_intent": {
      const interpretation = await interpretIntent(intent.rawInput, provider);
      state.goal = interpretation.interpretedGoal;
      await prisma.intent.update({
        where: { id: intent.id },
        data: {
          title: interpretation.title,
          interpretedGoal: interpretation.interpretedGoal,
          constraints: JSON.stringify(interpretation.constraints),
        },
      });
      break;
    }
    case "plan_change": {
      const plan = await planChange(state.goal, provider);
      state.plan = plan.steps.join("\n");
      break;
    }
    case "edit_code": {
      const edit = await editCode(state.goal, state.plan, provider);
      state.output = edit.changes.join("\n");
      await signalProgress(workspaceId, intent.id, `CIAO planned ${edit.files.length} file changes.`);
      break;
    }
    case "run_tests": {
      const test = runTests();
      state.output += `\n${test.summary}`;
      await signalProgress(workspaceId, intent.id, test.passed ? "Tests passed." : `Tests had issues: ${test.summary}`);
      break;
    }
    case "review_diff": {
      const review = reviewDiff(state.output);
      state.output += `\nReview: ${review.feedback.join("; ")}`;
      if (review.risks.length > 0) {
        await signalProgress(workspaceId, intent.id, `Review found risks: ${review.risks.join(", ")}`);
      }
      break;
    }
    case "summarize_result": {
      // buildOutcome is handled by the build_outcome next step
      break;
    }
    default:
      state.output += `\n[capability:${capability}] Executed.`;
  }
}

async function buildOutcome(
  intentId: string,
  goal: string,
  summary: { summary: string; changed: string[]; verified: string[]; risks: string[]; confidence: string },
): Promise<void> {
  const confidence = summary.confidence as "low" | "medium" | "high";

  await prisma.outcome.create({
    data: {
      intentId,
      title: `${goal.trim().slice(0, 60)} ready`,
      summary: summary.summary,
      changed: JSON.stringify(summary.changed),
      verified: JSON.stringify(summary.verified),
      risks: JSON.stringify(summary.risks),
      confidence,
      costSummary: JSON.stringify({
        mode: "balanced",
        label: "Balanced",
      }),
      receipt: JSON.stringify({ intentId, goal }),
      state: "ready",
    },
  });

  await prisma.intent.update({
    where: { id: intentId },
    data: { state: "ready" },
  });
}
