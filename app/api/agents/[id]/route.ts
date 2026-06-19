import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { Agent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Fields the user is allowed to edit from the UI.
const EDITABLE: (keyof Agent)[] = [
  "name",
  "title",
  "description",
  "instructions",
  "avatar",
  "color",
  "active",
  "skills",
  "model",
  "managerNote",
];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let body: Partial<Agent>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updated = store.update((d) => {
    const agent = d.agents.find((a) => a.id === id);
    if (!agent) return null;
    for (const key of EDITABLE) {
      if (key in body && body[key] !== undefined) {
        // @ts-expect-error narrowed by EDITABLE allow-list
        agent[key] = body[key];
      }
    }
    if (body.active === false) agent.status = "offline";
    if (body.active === true && agent.status === "offline") agent.status = "idle";
    agent.updatedAt = Date.now();
    return agent;
  });

  if (!updated) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const agent = store.get().agents.find((a) => a.id === id);
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  return NextResponse.json(agent);
}
