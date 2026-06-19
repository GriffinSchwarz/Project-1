"use client";

import React from "react";
import type { Agent, AgentMessage, AgentRole } from "@/lib/types";
import { StatusDot } from "./ui";

// A live "who's working with whom" map. The manager sits at the center; the
// specialists orbit it. Edges animate when a hand-off / message has flowed
// recently between two agents.
export default function Network({
  agents,
  messages,
  onPick,
}: {
  agents: Agent[];
  messages: AgentMessage[];
  onPick?: (role: AgentRole) => void;
}) {
  const W = 320;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const R = 110;

  const manager = agents.find((a) => a.role === "orchestrator");
  const specialists = agents.filter((a) => a.role !== "orchestrator");

  const pos: Record<AgentRole, { x: number; y: number }> = {
    orchestrator: { x: cx, y: cy },
  } as Record<AgentRole, { x: number; y: number }>;

  specialists.forEach((a, idx) => {
    const angle = (idx / specialists.length) * Math.PI * 2 - Math.PI / 2;
    pos[a.role] = { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R };
  });

  const now = Date.now();
  const recent = (a: AgentRole, b: AgentRole) =>
    messages.some(
      (m) =>
        now - m.createdAt < 7000 &&
        ((m.from === a && m.to === b) || (m.from === b && m.to === a)),
    );

  // Edges: manager↔each specialist + declared collaborator pairs.
  const edges: { a: AgentRole; b: AgentRole }[] = [];
  const seen = new Set<string>();
  const addEdge = (a: AgentRole, b: AgentRole) => {
    const key = [a, b].sort().join("-");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ a, b });
  };
  for (const s of specialists) addEdge("orchestrator", s.role);
  for (const a of agents)
    for (const c of a.collaborators) if (pos[c]) addEdge(a.role, c);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px]">
        {edges.map((e, i) => {
          const p1 = pos[e.a];
          const p2 = pos[e.b];
          const active = recent(e.a, e.b);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={active ? "#6366f1" : "#202a44"}
              strokeWidth={active ? 2 : 1.2}
              className={active ? "flow" : undefined}
              opacity={active ? 0.95 : 0.55}
            />
          );
        })}

        {agents.map((a) => {
          const p = pos[a.role];
          if (!p) return null;
          const isManager = a.role === "orchestrator";
          const r = isManager ? 30 : 24;
          const working = a.status === "working" || a.status === "collaborating";
          return (
            <g
              key={a.id}
              transform={`translate(${p.x},${p.y})`}
              style={{ cursor: onPick ? "pointer" : "default" }}
              onClick={() => onPick?.(a.role)}
            >
              {working && (
                <circle r={r + 6} fill="none" stroke={a.color} strokeWidth={1.2} opacity={0.35}>
                  <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                r={r}
                fill={a.active ? a.color + "22" : "#0c1322"}
                stroke={a.color}
                strokeWidth={isManager ? 2.2 : 1.6}
                opacity={a.active ? 1 : 0.4}
              />
              <text textAnchor="middle" dy="0.35em" fontSize={isManager ? 22 : 18}>
                {a.avatar}
              </text>
              <text
                textAnchor="middle"
                y={r + 14}
                fontSize={10}
                fill="#9fb0d0"
                fontWeight={600}
              >
                {a.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
        {(manager ? [manager, ...specialists] : specialists).map((a) => (
          <span key={a.id} className="inline-flex items-center gap-1">
            <StatusDot status={a.status} pulse />
            {a.name}
          </span>
        ))}
      </div>
    </div>
  );
}
