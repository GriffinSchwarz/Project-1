"use client";

import React from "react";
import type { AgentStatus, RunStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function durationLabel(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${Math.round(s % 60)}s`;
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return String(n);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

const STATUS_COLOR: Record<AgentStatus, string> = {
  idle: "#64748b",
  working: "#22c55e",
  collaborating: "#06b6d4",
  error: "#ef4444",
  offline: "#475569",
};

export function StatusDot({ status, pulse }: { status: AgentStatus; pulse?: boolean }) {
  const color = STATUS_COLOR[status];
  const active = status === "working" || status === "collaborating";
  return (
    <span
      className={pulse && active ? "pulse" : undefined}
      style={{
        display: "inline-block",
        width: 9,
        height: 9,
        borderRadius: 999,
        background: color,
      }}
      aria-label={status}
    />
  );
}

const RUN_COLOR: Record<RunStatus, string> = {
  queued: "#a78bfa",
  running: "#22d3ee",
  succeeded: "#22c55e",
  failed: "#ef4444",
  cancelled: "#94a3b8",
};

export function RunBadge({ status }: { status: RunStatus }) {
  return (
    <span
      style={{
        color: RUN_COLOR[status],
        background: RUN_COLOR[status] + "1a",
        border: `1px solid ${RUN_COLOR[status]}44`,
      }}
      className="rounded-full px-2 py-0.5 text-[11px] font-medium capitalize"
    >
      {status}
    </span>
  );
}

export function Pill({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: color || "#9fb0d0",
        background: (color || "#9fb0d0") + "14",
        border: `1px solid ${(color || "#9fb0d0") + "33"}`,
      }}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sparkline / bar chart
// ---------------------------------------------------------------------------

export function Sparkline({
  values,
  width = 220,
  height = 44,
  color = "#6366f1",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...values);
  const n = values.length;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(1, n - 1)) * width;
      const y = height - (v / max) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => {
        const x = (i / Math.max(1, n - 1)) * width;
        const y = height - (v / max) * (height - 6) - 3;
        return <circle key={i} cx={x} cy={y} r={1.6} fill={color} />;
      })}
    </svg>
  );
}

export function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#0c1322]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal / Drawer
// ---------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  children,
  title,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`glass fadein max-h-[92vh] w-full overflow-y-auto rounded-t-2xl sm:rounded-2xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
        style={{ background: "var(--panel)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)] px-4 py-3">
          <div className="text-sm font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[var(--muted)] hover:bg-white/5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Minimal Markdown renderer (headings, bold, code, lists, tables, hr, quotes)
// ---------------------------------------------------------------------------

function inline(text: string): React.ReactNode {
  // bold + inline code
  const nodes: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) nodes.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else nodes.push(<code key={k++}>{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = (text || "").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table
    if (line.includes("|") && lines[i + 1] && /^\s*\|?\s*:?-+/.test(lines[i + 1])) {
      const header = line.split("|").map((s) => s.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map((s) => s.trim()).filter((_, idx, arr) => !(idx === 0 && arr[0] === "") && !(idx === arr.length - 1 && arr[arr.length - 1] === "")));
        i++;
      }
      blocks.push(
        <table key={key++}>
          <thead>
            <tr>
              {header.map((h, x) => (
                <th key={x}>{inline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, y) => (
              <tr key={y}>
                {r.map((c, x) => (
                  <td key={x}>{inline(c)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      );
      continue;
    }

    if (/^### /.test(line)) {
      blocks.push(<h3 key={key++}>{inline(line.slice(4))}</h3>);
      i++;
      continue;
    }
    if (/^## /.test(line)) {
      blocks.push(<h2 key={key++}>{inline(line.slice(3))}</h2>);
      i++;
      continue;
    }
    if (/^# /.test(line)) {
      blocks.push(<h1 key={key++}>{inline(line.slice(2))}</h1>);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      blocks.push(<blockquote key={key++}>{inline(line.replace(/^>\s?/, ""))}</blockquote>);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }
    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((it, x) => (
            <li key={x}>{inline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((it, x) => (
            <li key={x}>{inline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    blocks.push(<p key={key++}>{inline(line)}</p>);
    i++;
  }

  return <div className="md text-[13px] text-[#d6deef]">{blocks}</div>;
}
