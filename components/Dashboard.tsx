"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Agent,
  AgentRole,
  FleetState,
  Run,
  SystemEvent,
} from "@/lib/types";
import {
  Bar,
  Modal,
  Pill,
  RunBadge,
  Sparkline,
  StatusDot,
  durationLabel,
  fmt,
  timeAgo,
} from "./ui";
import Network from "./Network";
import AgentEditor from "./AgentEditor";
import RunDetail from "./RunDetail";
import { ROLE_LABEL, ROLE_NAME } from "@/lib/agents";

type Tab = "overview" | "agents" | "activity" | "analytics" | "knowledge";

// ---------------------------------------------------------------------------
// State polling hook
// ---------------------------------------------------------------------------

function useFleet() {
  const [state, setState] = useState<FleetState | null>(null);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const r = await fetch("/api/state", { cache: "no-store" });
      if (r.ok) setState(await r.json());
    } catch {
      // ignore transient errors
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 1500);
    return () => clearInterval(id);
  }, [refresh]);

  return { state, refresh };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const { state, refresh } = useFleet();
  const [tab, setTab] = useState<Tab>("overview");
  const [launcher, setLauncher] = useState<{ open: boolean; role: AgentRole | "auto" }>({
    open: false,
    role: "auto",
  });
  const [editing, setEditing] = useState<Agent | null>(null);
  const [openRunId, setOpenRunId] = useState<string | null>(null);

  const openRun = useMemo(
    () => state?.runs.find((r) => r.id === openRunId) || null,
    [state, openRunId],
  );

  if (!state) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        <div className="animate-pulse text-sm">Booting FleetView…</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "▦" },
    { id: "agents", label: "Agents", icon: "🤖" },
    { id: "activity", label: "Activity", icon: "📡" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "knowledge", label: "Knowledge", icon: "📚" },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-3 pb-28 sm:px-5 sm:pb-10">
      <Header state={state} onNew={() => setLauncher({ open: true, role: "auto" })} onReset={refresh} />

      {/* Desktop tabs */}
      <nav className="mt-4 hidden gap-1 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1 sm:flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id ? "bg-indigo-500/20 text-white" : "text-[var(--muted)] hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="mt-4">
        {tab === "overview" && (
          <Overview
            state={state}
            onPickRole={(role) => setLauncher({ open: true, role })}
            onOpenRun={(id) => setOpenRunId(id)}
          />
        )}
        {tab === "agents" && (
          <AgentsTab
            state={state}
            onEdit={(a) => setEditing(a)}
            onRun={(role) => setLauncher({ open: true, role })}
            onRefresh={refresh}
          />
        )}
        {tab === "activity" && <ActivityTab state={state} onOpenRun={(id) => setOpenRunId(id)} />}
        {tab === "analytics" && <AnalyticsTab state={state} />}
        {tab === "knowledge" && <KnowledgeTab state={state} onRefresh={refresh} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur sm:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              tab === t.id ? "text-indigo-300" : "text-[var(--muted)]"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Floating "new task" button (mobile) */}
      <button
        onClick={() => setLauncher({ open: true, role: "auto" })}
        className="fixed bottom-16 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-2xl text-white shadow-lg shadow-indigo-500/30 sm:hidden"
        aria-label="New task"
      >
        +
      </button>

      <TaskLauncher
        open={launcher.open}
        role={launcher.role}
        state={state}
        onClose={() => setLauncher((l) => ({ ...l, open: false }))}
        onLaunched={(runId) => {
          setLauncher((l) => ({ ...l, open: false }));
          refresh();
          setTab("activity");
          setOpenRunId(runId);
        }}
      />

      <AgentEditor agent={editing} open={!!editing} onClose={() => setEditing(null)} onSaved={refresh} />
      <RunDetail run={openRun} open={!!openRun} onClose={() => setOpenRunId(null)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header({
  state,
  onNew,
  onReset,
}: {
  state: FleetState;
  onNew: () => void;
  onReset: () => void;
}) {
  const working = state.agents.filter(
    (a) => a.status === "working" || a.status === "collaborating",
  ).length;

  async function reset() {
    if (!confirm("Clear all runs, tasks, and activity? (Agents & knowledge are kept.)")) return;
    await fetch("/api/reset", { method: "POST" });
    onReset();
  }

  return (
    <header className="sticky top-0 z-30 -mx-3 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--bg)]/85 px-3 py-3 backdrop-blur sm:mx-0 sm:rounded-b-none sm:border-0 sm:bg-transparent sm:px-0">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
          🛰️
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">FleetView</div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                state.mode === "live" ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {state.mode === "live" ? "Live model" : "Simulation"} · {working} active
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="hidden rounded-lg border border-[var(--border)] px-2.5 py-2 text-xs text-[var(--muted)] hover:bg-white/5 sm:block"
        >
          Reset
        </button>
        <button
          onClick={onNew}
          className="hidden rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-400 sm:block"
        >
          + New task
        </button>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function Tile({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-xl px-3 py-3">
      <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-[var(--muted)]">{sub}</div>}
    </div>
  );
}

function Overview({
  state,
  onPickRole,
  onOpenRun,
}: {
  state: FleetState;
  onPickRole: (r: AgentRole) => void;
  onOpenRun: (id: string) => void;
}) {
  const t = state.analytics.totals;
  const successRate = t.runs ? Math.round((t.succeeded / t.runs) * 100) : 0;
  const running = state.runs.filter((r) => r.status === "running" || r.status === "queued");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total runs" value={fmt(t.runs)} sub={`${t.succeeded} ok · ${t.failed} failed`} />
        <Tile label="Success" value={`${successRate}%`} color="#34d399" />
        <Tile label="Tokens" value={fmt(t.tokens)} sub="across fleet" color="#818cf8" />
        <Tile label="Hand-offs" value={fmt(t.handoffs)} sub="agent ↔ agent" color="#22d3ee" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="glass rounded-2xl p-4">
          <h2 className="mb-1 text-sm font-semibold">Live collaboration</h2>
          <p className="mb-2 text-[11px] text-[var(--muted)]">
            Tap an agent to assign work. Links light up as agents hand off.
          </p>
          <Network agents={state.agents} messages={state.messages} onPick={onPickRole} />
        </section>

        <section className="glass rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-semibold">Fleet status</h2>
          <div className="space-y-2">
            {state.agents.map((a) => (
              <button
                key={a.id}
                onClick={() => onPickRole(a.role)}
                className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2 text-left hover:border-indigo-400/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{a.avatar}</span>
                  <div>
                    <div className="text-sm font-medium">
                      {a.name} <span className="text-[var(--muted)]">· {a.title}</span>
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">
                      {a.managerNote || a.skills.slice(0, 2).join(", ")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] capitalize text-[var(--muted)]">
                  <StatusDot status={a.status} pulse />
                  {a.active ? a.status : "off"}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {running.length > 0 && (
        <section className="glass rounded-2xl p-4">
          <h2 className="mb-2 text-sm font-semibold">In progress</h2>
          <div className="space-y-2">
            {running.map((r) => (
              <RunRow key={r.id} run={r} onOpen={onOpenRun} />
            ))}
          </div>
        </section>
      )}

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-2 text-sm font-semibold">Activity feed</h2>
        <ul className="space-y-1.5">
          {state.events.slice(0, 12).map((e) => (
            <EventRow key={e.id} e={e} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function EventRow({ e }: { e: SystemEvent }) {
  const color =
    e.level === "success"
      ? "#34d399"
      : e.level === "warn"
        ? "#fbbf24"
        : e.level === "error"
          ? "#f87171"
          : "#7c89a8";
  return (
    <li className="flex items-start gap-2 text-[12px]">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="flex-1 text-[#c7d0e3]">{e.text}</span>
      <span className="shrink-0 text-[11px] text-[var(--muted)]">{timeAgo(e.at)}</span>
    </li>
  );
}

function RunRow({ run, onOpen }: { run: Run; onOpen: (id: string) => void }) {
  const last = run.steps[run.steps.length - 1];
  return (
    <button
      onClick={() => onOpen(run.id)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2 text-left hover:border-indigo-400/50"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{run.title}</div>
        <div className="truncate text-[11px] text-[var(--muted)]">
          {ROLE_NAME[run.agentRole]}
          {run.status === "running" && last ? ` · ${last.label}` : ""}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] text-[var(--muted)]">{fmt(run.tokensUsed)} tok</span>
        <RunBadge status={run.status} />
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Agents tab
// ---------------------------------------------------------------------------

function AgentsTab({
  state,
  onEdit,
  onRun,
  onRefresh,
}: {
  state: FleetState;
  onEdit: (a: Agent) => void;
  onRun: (r: AgentRole) => void;
  onRefresh: () => void;
}) {
  async function toggle(a: Agent) {
    await fetch(`/api/agents/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !a.active }),
    });
    onRefresh();
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {state.agents.map((a) => {
        const stats = state.analytics.perAgent.find((p) => p.role === a.role);
        return (
          <div key={a.id} className="glass rounded-2xl p-4" style={{ borderColor: a.color + "55" }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-xl"
                  style={{ background: a.color + "22" }}
                >
                  {a.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    {a.name}
                    {a.role === "orchestrator" && <Pill color="#818cf8">manager</Pill>}
                  </div>
                  <div className="text-[12px] text-[var(--muted)]">{a.title}</div>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" checked={a.active} onChange={() => toggle(a)} className="peer sr-only" />
                <div className="h-5 w-9 rounded-full bg-[#2a3550] after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
              </label>
            </div>

            <p className="mt-2.5 text-[12px] leading-relaxed text-[#b9c2d8]">{a.description}</p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {a.skills.map((s) => (
                <Pill key={s} color={a.color}>
                  {s}
                </Pill>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="runs" value={fmt(stats?.runs || 0)} />
              <MiniStat label="tokens" value={fmt(stats?.tokens || 0)} />
              <MiniStat
                label="avg"
                value={stats?.avgDurationMs ? durationLabel(stats.avgDurationMs) : "—"}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] capitalize text-[var(--muted)]">
                <StatusDot status={a.status} pulse /> {a.active ? a.status : "offline"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(a)}
                  className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRun(a.role)}
                  disabled={!a.active}
                  className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400 disabled:opacity-40"
                >
                  Run
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#0c1322] py-1.5">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[10px] uppercase text-[var(--muted)]">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity tab
// ---------------------------------------------------------------------------

function ActivityTab({ state, onOpenRun }: { state: FleetState; onOpenRun: (id: string) => void }) {
  if (state.runs.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-sm text-[var(--muted)]">
        No runs yet. Launch a task to see the fleet work.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {state.runs.map((r) => (
        <button
          key={r.id}
          onClick={() => onOpenRun(r.id)}
          className="glass flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left hover:border-indigo-400/50"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{r.title}</div>
            <div className="truncate text-[11px] text-[var(--muted)]">
              {ROLE_NAME[r.agentRole]}
              {r.collaborators.length ? ` + ${r.collaborators.map((c) => ROLE_NAME[c]).join(", ")}` : ""}
              {" · "}
              {timeAgo(r.startedAt)}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <RunBadge status={r.status} />
            <span className="text-[11px] text-[var(--muted)]">
              {fmt(r.tokensUsed)} tok · {r.steps.length} steps
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analytics tab
// ---------------------------------------------------------------------------

function AnalyticsTab({ state }: { state: FleetState }) {
  const t = state.analytics.totals;
  const per = state.analytics.perAgent;
  const maxRuns = Math.max(1, ...per.map((p) => p.runs));
  const maxTokens = Math.max(1, ...per.map((p) => p.tokens));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Runs" value={fmt(t.runs)} />
        <Tile label="Succeeded" value={fmt(t.succeeded)} color="#34d399" />
        <Tile label="Failed" value={fmt(t.failed)} color="#f87171" />
        <Tile label="Tokens" value={fmt(t.tokens)} color="#818cf8" />
      </div>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-1 text-sm font-semibold">Runs over time</h2>
        <p className="mb-2 text-[11px] text-[var(--muted)]">Last 12 hours</p>
        <Sparkline values={state.analytics.timeline.map((b) => b.runs)} width={620} height={56} />
        <div className="mt-1 flex justify-between text-[10px] text-[var(--muted)]">
          <span>12h ago</span>
          <span>now</span>
        </div>
      </section>

      <section className="glass rounded-2xl p-4">
        <h2 className="mb-3 text-sm font-semibold">Per-agent performance</h2>
        <div className="space-y-3">
          {per.map((p) => {
            const agent = state.agents.find((a) => a.role === p.role)!;
            const rate = p.runs ? Math.round((p.succeeded / p.runs) * 100) : 0;
            return (
              <div key={p.role}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span>{agent.avatar}</span>
                    {agent.name} <span className="text-[var(--muted)]">· {ROLE_LABEL[p.role]}</span>
                  </span>
                  <span className="text-[var(--muted)]">
                    {p.runs} runs · {rate}% ok · {fmt(p.tokens)} tok
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="mb-0.5 text-[10px] text-[var(--muted)]">runs</div>
                    <Bar value={p.runs} max={maxRuns} color={agent.color} />
                  </div>
                  <div>
                    <div className="mb-0.5 text-[10px] text-[var(--muted)]">tokens</div>
                    <Bar value={p.tokens} max={maxTokens} color={agent.color + "aa"} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Knowledge tab
// ---------------------------------------------------------------------------

function KnowledgeTab({ state, onRefresh }: { state: FleetState; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState("document");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, kind, content }),
      });
      setName("");
      setContent("");
      setKind("document");
      setOpen(false);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/files?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  const input = "w-full rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2 text-sm outline-none focus:border-indigo-400";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[var(--muted)]">
          Files agents learn from. Drop in rate cards, voice guides, past performance — agents cite
          them while they work.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
        >
          + Add
        </button>
      </div>

      {state.files.map((f) => (
        <div key={f.id} className="glass rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{f.name}</span>
                <Pill>{f.kind}</Pill>
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--muted)]">
                {f.size} chars · learned {f.usedCount}× · {f.scope === "all" ? "all agents" : (f.scope as string[]).join(", ")}
              </div>
            </div>
            <button onClick={() => remove(f.id)} className="text-[var(--muted)] hover:text-red-400" aria-label="Delete">
              🗑️
            </button>
          </div>
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-[var(--muted)] hover:text-white">preview</summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[#0c1322] p-2 text-[11px] text-[#c7d0e3]">
              {f.content}
            </pre>
          </details>
        </div>
      ))}

      <Modal open={open} onClose={() => setOpen(false)} title="Add knowledge">
        <div className="space-y-3">
          <input className={input} placeholder="File name (e.g. Rate Card 2026.csv)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={input} placeholder="Kind (rate-card, guidelines, past-project…)" value={kind} onChange={(e) => setKind(e.target.value)} />
          <textarea
            className={input + " min-h-[160px] font-mono text-[12px]"}
            placeholder="Paste the content agents should learn from…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5">
              Cancel
            </button>
            <button
              onClick={add}
              disabled={saving}
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
            >
              {saving ? "Adding…" : "Add file"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task launcher
// ---------------------------------------------------------------------------

const EXAMPLES = [
  "Put together a proposal for a 30,000 SF medical office fit-out, design-build.",
  "Build a ROM estimate for replacing the roof on a 2-story warehouse.",
  "Draft a follow-up email to the client about the schedule slip on the civic center.",
  "Update Smartsheet with this week's status across the active pursuits.",
];

function TaskLauncher({
  open,
  role,
  state,
  onClose,
  onLaunched,
}: {
  open: boolean;
  role: AgentRole | "auto";
  state: FleetState;
  onClose: () => void;
  onLaunched: (runId: string) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [requestedRole, setRequestedRole] = useState<AgentRole | "auto">(role);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setRequestedRole(role);
  }, [open, role]);

  async function launch() {
    if (!prompt.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, requestedRole }),
      });
      const data = await r.json();
      setPrompt("");
      onLaunched(data.run?.id);
    } finally {
      setBusy(false);
    }
  }

  const roleOptions: { value: AgentRole | "auto"; label: string }[] = [
    { value: "auto", label: "Auto — let Atlas route it" },
    ...state.agents.map((a) => ({ value: a.role, label: `${a.avatar} ${a.name} · ${a.title}` })),
  ];

  const input = "w-full rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2 text-sm outline-none focus:border-indigo-400";

  return (
    <Modal open={open} onClose={onClose} title="Launch a task">
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            Assign to
          </label>
          <select
            className={input}
            value={requestedRole}
            onChange={(e) => setRequestedRole(e.target.value as AgentRole | "auto")}
          >
            {roleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[var(--muted)]">
            {requestedRole === "auto"
              ? "Atlas picks the right specialists and chains the hand-offs."
              : `${ROLE_NAME[requestedRole as AgentRole]} will own it (and pull in collaborators if needed).`}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            What do you need?
          </label>
          <textarea
            autoFocus
            className={input + " min-h-[110px]"}
            placeholder="Describe the work…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:border-indigo-400/50 hover:text-white"
            >
              {ex.length > 42 ? ex.slice(0, 40) + "…" : ex}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5">
            Cancel
          </button>
          <button
            onClick={launch}
            disabled={busy || !prompt.trim()}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            {busy ? "Launching…" : "▶ Run task"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
