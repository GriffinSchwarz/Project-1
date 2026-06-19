"use client";

import React, { useEffect, useState } from "react";
import type { Agent } from "@/lib/types";
import { Modal } from "./ui";

export default function AgentEditor({
  agent,
  open,
  onClose,
  onSaved,
}: {
  agent: Agent | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Agent>>({});
  const [skillsText, setSkillsText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name,
        title: agent.title,
        description: agent.description,
        instructions: agent.instructions,
        avatar: agent.avatar,
        color: agent.color,
        model: agent.model,
        active: agent.active,
      });
      setSkillsText(agent.skills.join(", "));
    }
  }, [agent]);

  if (!agent) return null;

  const set = <K extends keyof Agent>(k: K, v: Agent[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await fetch(`/api/agents/${agent!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]";
  const input =
    "w-full rounded-lg border border-[var(--border)] bg-[#0c1322] px-3 py-2 text-sm outline-none focus:border-indigo-400";

  return (
    <Modal open={open} onClose={onClose} wide title={`Edit ${agent.name} · ${agent.title}`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name</label>
          <input className={input} value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={label}>Title</label>
          <input className={input} value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div>
          <label className={label}>Avatar (emoji)</label>
          <input className={input} value={form.avatar || ""} onChange={(e) => set("avatar", e.target.value)} maxLength={4} />
        </div>
        <div>
          <label className={label}>Accent color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.color || "#6366f1"}
              onChange={(e) => set("color", e.target.value)}
              className="h-9 w-12 rounded border border-[var(--border)] bg-transparent"
            />
            <input className={input} value={form.color || ""} onChange={(e) => set("color", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className={label}>Description</label>
        <textarea
          className={input + " min-h-[60px]"}
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className={label}>Instructions (system prompt)</label>
        <textarea
          className={input + " min-h-[140px] font-mono text-[12px]"}
          value={form.instructions || ""}
          onChange={(e) => set("instructions", e.target.value)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Skills (comma separated)</label>
          <input className={input} value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
        </div>
        <div>
          <label className={label}>Model</label>
          <input className={input} value={form.model || ""} onChange={(e) => set("model", e.target.value)} />
        </div>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="h-4 w-4 accent-indigo-500"
        />
        Activated (allowed to pick up work)
      </label>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5">
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </Modal>
  );
}
