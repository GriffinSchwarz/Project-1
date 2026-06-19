import { store, uid } from "./store";
import { runAgentLlm } from "./llm";
import type {
  Agent,
  AgentMessage,
  AgentRole,
  AgentStatus,
  KnowledgeFile,
  MessageKind,
  Run,
  RunStep,
  StepKind,
  SystemEvent,
  Task,
} from "./types";
import { ROLE_NAME } from "./agents";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Small mutation helpers
// ---------------------------------------------------------------------------

function logEvent(
  level: SystemEvent["level"],
  source: SystemEvent["source"],
  text: string,
) {
  store.update((d) => {
    d.events.unshift({ id: uid("evt"), at: Date.now(), level, source, text });
    if (d.events.length > 300) d.events.length = 300;
  });
}

function sendMessage(
  from: AgentRole,
  to: AgentRole,
  kind: MessageKind,
  text: string,
  runId?: string,
) {
  const msg: AgentMessage = {
    id: uid("msg"),
    from,
    to,
    kind,
    text,
    runId,
    createdAt: Date.now(),
  };
  store.update((d) => {
    d.messages.unshift(msg);
    if (d.messages.length > 400) d.messages.length = 400;
  });
}

function setAgentStatus(role: AgentRole, status: AgentStatus, note?: string) {
  store.update((d) => {
    const a = d.agents.find((x) => x.role === role);
    if (a) {
      a.status = status;
      if (note !== undefined) a.managerNote = note;
      a.updatedAt = Date.now();
    }
  });
}

function getAgent(role: AgentRole): Agent | undefined {
  return store.get().agents.find((a) => a.role === role);
}

function addStep(runId: string, step: Omit<RunStep, "id" | "startedAt">): string {
  const id = uid("step");
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    if (run) run.steps.push({ id, startedAt: Date.now(), ...step });
  });
  return id;
}

function endStep(runId: string, stepId: string, detail?: string, tokens?: number) {
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    const step = run?.steps.find((s) => s.id === stepId);
    if (step) {
      step.endedAt = Date.now();
      if (detail !== undefined) step.detail = detail;
      if (tokens !== undefined) step.tokens = tokens;
    }
  });
}

function knowledgeFor(role: AgentRole): KnowledgeFile[] {
  return store
    .get()
    .files.filter((f) => f.scope === "all" || (Array.isArray(f.scope) && f.scope.includes(role)));
}

function markFilesUsed(files: KnowledgeFile[]) {
  if (!files.length) return;
  const ids = new Set(files.map((f) => f.id));
  store.update((d) => {
    for (const f of d.files) if (ids.has(f.id)) f.usedCount += 1;
  });
}

// ---------------------------------------------------------------------------
// Routing — the manager decides which specialists handle a request.
// ---------------------------------------------------------------------------

function planPipeline(prompt: string, requested: AgentRole | "auto"): AgentRole[] {
  if (requested !== "auto" && requested !== "orchestrator") {
    // A specific specialist was targeted. Still prepend the estimator when a
    // proposal needs numbers.
    if (requested === "proposal") return ["estimating", "proposal"];
    return [requested];
  }

  const p = prompt.toLowerCase();
  const need = {
    estimate: /\b(estimate|cost|budget|price|pricing|rom|takeoff|quote)\b/.test(p),
    proposal: /\b(proposal|sow|scope of work|bid|rfp|rfq|pursuit)\b/.test(p),
    email: /\b(email|message|reply|respond|follow.?up|client|note|send)\b/.test(p),
    smartsheet: /\b(smartsheet|schedule|track|status|sheet|update|row|project plan)\b/.test(p),
  };

  const pipeline: AgentRole[] = [];
  if (need.estimate || need.proposal) pipeline.push("estimating");
  if (need.proposal) pipeline.push("proposal");
  if (need.email) pipeline.push("email");
  if (need.smartsheet) pipeline.push("smartsheet");

  // Nothing matched → run the full package (a common "put together a pursuit").
  if (pipeline.length === 0) return ["estimating", "proposal", "email", "smartsheet"];
  // De-dupe while preserving order.
  return Array.from(new Set(pipeline));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CreateTaskInput {
  title?: string;
  prompt: string;
  requestedRole: AgentRole | "auto";
}

export function createTask(input: CreateTaskInput): { task: Task; run: Run } {
  const requested = input.requestedRole;
  const pipeline = planPipeline(input.prompt, requested);

  // Owner: a targeted specialist owns its own run; otherwise the manager owns
  // and supervises a multi-agent pipeline.
  const ownerRole: AgentRole =
    requested !== "auto" && requested !== "orchestrator" ? requested : "orchestrator";
  const owner = getAgent(ownerRole)!;

  const collaborators = pipeline.filter((r) => r !== ownerRole);

  const taskId = uid("task");
  const runId = uid("run");
  const title = input.title?.trim() || deriveTitle(input.prompt);

  const task: Task = {
    id: taskId,
    title,
    prompt: input.prompt,
    requestedRole: requested,
    createdAt: Date.now(),
    runId,
    status: "queued",
  };

  const run: Run = {
    id: runId,
    taskId,
    agentId: owner.id,
    agentRole: ownerRole,
    title,
    status: "queued",
    steps: [],
    collaborators,
    startedAt: Date.now(),
    tokensUsed: 0,
    mode: process.env.ANTHROPIC_API_KEY ? "live" : "simulated",
  };

  store.update((d) => {
    d.tasks.unshift(task);
    d.runs.unshift(run);
  });

  logEvent("info", ownerRole, `New task accepted: “${title}”.`);

  // Fire-and-forget. The client polls /api/state to watch progress.
  void execute(runId, ownerRole, pipeline, input.prompt).catch((err) => {
    failRun(runId, (err as Error).message);
  });

  return { task, run };
}

function deriveTitle(prompt: string): string {
  const s = prompt.replace(/\s+/g, " ").trim();
  return s.length > 60 ? s.slice(0, 57) + "…" : s || "Untitled task";
}

function setRunStatus(runId: string, status: Run["status"]) {
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    if (run) {
      run.status = status;
      if (status === "succeeded" || status === "failed" || status === "cancelled") {
        run.endedAt = Date.now();
      }
    }
    const task = d.tasks.find((t) => t.runId === runId);
    if (task) task.status = status;
  });
}

function addTokens(runId: string, tokens: number) {
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    if (run) run.tokensUsed += tokens;
  });
}

function failRun(runId: string, message: string) {
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    if (run) {
      run.error = message;
      run.status = "failed";
      run.endedAt = Date.now();
    }
  });
  logEvent("error", "system", `Run failed: ${message}`);
}

// ---------------------------------------------------------------------------
// Execution — the manager runs the pipeline, brokering hand-offs.
// ---------------------------------------------------------------------------

async function execute(
  runId: string,
  ownerRole: AgentRole,
  pipeline: AgentRole[],
  prompt: string,
) {
  const supervised = ownerRole === "orchestrator";
  setRunStatus(runId, "running");
  setAgentStatus(ownerRole, supervised ? "working" : "working");

  // Manager planning step.
  if (supervised) {
    const planStep = addStep(runId, {
      kind: "plan",
      label: `Atlas routing across ${pipeline.length} agent(s)`,
      detail: `Pipeline: ${pipeline.map((r) => ROLE_NAME[r]).join(" → ")}`,
    });
    await sleep(500);
    endStep(runId, planStep, `Pipeline: ${pipeline.map((r) => ROLE_NAME[r]).join(" → ")}`);
    logEvent("info", "orchestrator", `Atlas planned: ${pipeline.map((r) => ROLE_NAME[r]).join(" → ")}.`);
  }

  const upstream: { role: AgentRole; text: string }[] = [];

  for (let i = 0; i < pipeline.length; i++) {
    const role = pipeline[i];
    const agent = getAgent(role);
    if (!agent || !agent.active) {
      logEvent("warn", "orchestrator", `${ROLE_NAME[role]} is offline; skipping.`);
      continue;
    }

    // Light up statuses: active agent works, others collaborate.
    setAgentStatus(role, "working");
    if (supervised) setAgentStatus(ownerRole, "collaborating");

    // Manager hands the work to the specialist.
    if (supervised) {
      sendMessage("orchestrator", role, "request", `Please handle: ${deriveTitle(prompt)}`, runId);
    } else if (i > 0) {
      sendMessage(pipeline[i - 1], role, "handoff", "Handing off upstream output.", runId);
    }

    await runSpecialist(runId, role, prompt, upstream);

    setAgentStatus(role, "idle");
    await sleep(250);
  }

  // Manager QA / wrap-up.
  if (supervised) {
    setAgentStatus(ownerRole, "working");
    const qa = addStep(runId, {
      kind: "result",
      label: "Atlas verifying hand-offs & assembling package",
    });
    await sleep(500);
    endStep(runId, qa, "All hand-offs coherent. Package assembled.");
    sendMessage("orchestrator", ownerRole, "supervision", "Verified pipeline output.", runId);
  }

  // Compose final output = the last specialist's product, plus a manifest.
  const finalText = composeOutput(runId, upstream, supervised);
  store.update((d) => {
    const run = d.runs.find((r) => r.id === runId);
    if (run) run.output = finalText;
  });

  setRunStatus(runId, "succeeded");
  setAgentStatus(ownerRole, "idle");
  logEvent("success", ownerRole, `Completed: “${deriveTitle(prompt)}”.`);
}

async function runSpecialist(
  runId: string,
  role: AgentRole,
  prompt: string,
  upstream: { role: AgentRole; text: string }[],
) {
  const agent = getAgent(role)!;

  // Learn from knowledge.
  const knowledge = knowledgeFor(role);
  if (knowledge.length) {
    const learn = addStep(runId, {
      kind: "learn",
      label: `${agent.name} reviewing ${knowledge.length} knowledge file(s)`,
      detail: knowledge.map((k) => k.name).join(", "),
    });
    await sleep(400);
    markFilesUsed(knowledge);
    endStep(runId, learn, knowledge.map((k) => k.name).join(", "));
  }

  // Think.
  const think = addStep(runId, { kind: "think", label: `${agent.name} planning approach` });
  await sleep(450);
  endStep(runId, think);

  // Act — the actual work product.
  const act = addStep(runId, { kind: "act", label: `${agent.name} producing work` });
  const result = await runAgentLlm({ agent, prompt, knowledge, upstream: [...upstream] });
  addTokens(runId, result.tokens);
  endStep(runId, act, truncate(result.text, 4000), result.tokens);

  // Push output into the upstream bag for the next agent.
  upstream.push({ role, text: result.text });

  logEvent("info", role, `${agent.name} produced output (${result.tokens} tok).`);
}

function composeOutput(
  runId: string,
  upstream: { role: AgentRole; text: string }[],
  supervised: boolean,
): string {
  if (upstream.length === 0) return "(no output produced)";
  if (upstream.length === 1) return upstream[0].text;

  // Multi-agent: present each agent's contribution under headers.
  const sections = upstream
    .map((u) => `### ${ROLE_NAME[u.role]} (${u.role})\n\n${u.text}`)
    .join("\n\n---\n\n");
  const header = supervised
    ? "# Fleet package\n\n_Assembled and verified by Atlas (Fleet Manager)._\n\n"
    : "";
  return header + sections;
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// ---------------------------------------------------------------------------
// Manager supervision sweep — flags stalled runs & offline agents. Called
// opportunistically when state is read.
// ---------------------------------------------------------------------------

let lastSweep = 0;
export function supervise() {
  const now = Date.now();
  if (now - lastSweep < 8000) return;
  lastSweep = now;

  const d = store.get();
  const stalled = d.runs.filter(
    (r) => r.status === "running" && now - r.startedAt > 90_000,
  );
  for (const r of stalled) {
    failRun(r.id, "Run exceeded time budget and was reclaimed by the manager.");
    sendMessage("orchestrator", r.agentRole, "alert", "Reclaimed stalled run.", r.id);
  }
}

export const _stepKinds: StepKind[] = [
  "plan",
  "think",
  "act",
  "handoff",
  "tool",
  "learn",
  "result",
  "error",
];
