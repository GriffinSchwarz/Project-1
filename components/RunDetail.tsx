"use client";

import React from "react";
import type { Run, StepKind } from "@/lib/types";
import { Markdown, Modal, Pill, RunBadge, durationLabel, fmt } from "./ui";
import { ROLE_NAME } from "@/lib/agents";

const STEP_ICON: Record<StepKind, string> = {
  plan: "🧭",
  think: "💭",
  act: "⚙️",
  handoff: "🔀",
  tool: "🛠️",
  learn: "📚",
  result: "✅",
  error: "⛔",
};

export default function RunDetail({
  run,
  open,
  onClose,
}: {
  run: Run | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!run) return null;
  const dur = (run.endedAt || Date.now()) - run.startedAt;

  return (
    <Modal open={open} onClose={onClose} wide title={run.title}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <RunBadge status={run.status} />
        <Pill color="#818cf8">{ROLE_NAME[run.agentRole]}</Pill>
        <Pill>{run.mode === "live" ? "Live model" : "Simulated"}</Pill>
        <Pill color="#34d399">{fmt(run.tokensUsed)} tokens</Pill>
        <Pill color="#fbbf24">{durationLabel(dur)}</Pill>
        {run.collaborators.length > 0 && (
          <Pill color="#22d3ee">
            +{run.collaborators.map((r) => ROLE_NAME[r]).join(", ")}
          </Pill>
        )}
      </div>

      {run.error && (
        <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {run.error}
        </div>
      )}

      <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
        Activity timeline
      </div>
      <ol className="mt-2 space-y-2">
        {run.steps.map((s) => {
          const running = !s.endedAt;
          const d = (s.endedAt || Date.now()) - s.startedAt;
          return (
            <li
              key={s.id}
              className="rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>{STEP_ICON[s.kind]}</span>
                  <span className={running ? "text-cyan-300" : ""}>{s.label}</span>
                  {running && (
                    <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
                  )}
                </div>
                <span className="text-[11px] text-[var(--muted)]">
                  {s.tokens ? `${fmt(s.tokens)} tok · ` : ""}
                  {durationLabel(d)}
                </span>
              </div>
              {s.detail && s.kind === "act" ? (
                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] text-[var(--muted)] hover:text-white">
                    view output
                  </summary>
                  <div className="mt-2 border-t border-[var(--border)] pt-2">
                    <Markdown text={s.detail} />
                  </div>
                </details>
              ) : s.detail ? (
                <div className="mt-1 text-[11px] text-[var(--muted)]">{s.detail}</div>
              ) : null}
            </li>
          );
        })}
        {run.steps.length === 0 && (
          <li className="text-sm text-[var(--muted)]">Queued…</li>
        )}
      </ol>

      {run.output && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
              Final deliverable
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(run.output || "")}
              className="rounded-md px-2 py-1 text-[11px] text-[var(--muted)] hover:bg-white/5"
            >
              Copy
            </button>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[#0c1322] p-3">
            <Markdown text={run.output} />
          </div>
        </div>
      )}
    </Modal>
  );
}
