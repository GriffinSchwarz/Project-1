import { store } from "./store";
import { supervise } from "./engine";
import { isLive } from "./llm";
import type { AgentAnalytics, AgentRole, FleetState, Run } from "./types";

const ROLES: AgentRole[] = ["orchestrator", "proposal", "estimating", "email", "smartsheet"];

function durationMs(r: Run): number {
  if (!r.endedAt) return Date.now() - r.startedAt;
  return r.endedAt - r.startedAt;
}

export function buildState(): FleetState {
  // Let the manager run its supervision sweep on read.
  supervise();

  const d = store.get();

  const perAgent: AgentAnalytics[] = ROLES.map((role) => {
    const runs = d.runs.filter((r) => r.agentRole === role);
    const succeeded = runs.filter((r) => r.status === "succeeded").length;
    const failed = runs.filter((r) => r.status === "failed").length;
    const tokens = runs.reduce((s, r) => s + r.tokensUsed, 0);
    const durations = runs.filter((r) => r.endedAt).map(durationMs);
    const avgDurationMs = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const handoffs = d.messages.filter(
      (m) => (m.from === role || m.to === role) && m.kind === "handoff",
    ).length;
    const filesLearned = d.files.filter(
      (f) => f.scope === "all" || (Array.isArray(f.scope) && f.scope.includes(role)),
    ).length;
    return { role, runs: runs.length, succeeded, failed, tokens, avgDurationMs, handoffs, filesLearned };
  });

  const totals = {
    runs: d.runs.length,
    succeeded: d.runs.filter((r) => r.status === "succeeded").length,
    failed: d.runs.filter((r) => r.status === "failed").length,
    tokens: d.runs.reduce((s, r) => s + r.tokensUsed, 0),
    activeAgents: d.agents.filter((a) => a.active).length,
    handoffs: d.messages.filter((m) => m.kind === "handoff").length,
    filesLearned: d.files.length,
  };

  // Build an hourly timeline for the last 12 hours.
  const now = Date.now();
  const hour = 3600_000;
  const timeline: { t: number; runs: number; tokens: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const bucketStart = Math.floor(now / hour) * hour - i * hour;
    const bucketEnd = bucketStart + hour;
    const inBucket = d.runs.filter((r) => r.startedAt >= bucketStart && r.startedAt < bucketEnd);
    timeline.push({
      t: bucketStart,
      runs: inBucket.length,
      tokens: inBucket.reduce((s, r) => s + r.tokensUsed, 0),
    });
  }

  return {
    agents: d.agents,
    // Cap the payload — keep the most recent items.
    runs: d.runs.slice(0, 60),
    tasks: d.tasks.slice(0, 60),
    messages: d.messages.slice(0, 80),
    files: d.files,
    events: d.events.slice(0, 60),
    analytics: { perAgent, totals, timeline },
    mode: isLive() ? "live" : "simulated",
    serverTime: now,
  };
}
