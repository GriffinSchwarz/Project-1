import { NextResponse } from "next/server";
import { createTask } from "@/lib/engine";
import type { AgentRole } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: (AgentRole | "auto")[] = [
  "auto",
  "orchestrator",
  "proposal",
  "estimating",
  "email",
  "smartsheet",
];

export async function POST(req: Request) {
  let body: { prompt?: string; title?: string; requestedRole?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body.prompt || "").trim();
  if (!prompt) {
    return NextResponse.json({ error: "A prompt is required." }, { status: 400 });
  }

  const requestedRole = (
    VALID.includes(body.requestedRole as AgentRole) ? body.requestedRole : "auto"
  ) as AgentRole | "auto";

  const { task, run } = createTask({
    prompt,
    title: body.title,
    requestedRole,
  });

  return NextResponse.json({ task, run });
}
