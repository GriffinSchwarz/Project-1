import { NextResponse } from "next/server";
import { store, uid } from "@/lib/store";
import type { AgentRole, KnowledgeFile } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(store.get().files);
}

export async function POST(req: Request) {
  let body: { name?: string; content?: string; kind?: string; scope?: AgentRole[] | "all" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = (body.name || "").trim();
  const content = (body.content || "").trim();
  if (!name || !content) {
    return NextResponse.json({ error: "name and content are required" }, { status: 400 });
  }
  const file: KnowledgeFile = {
    id: uid("kf"),
    name,
    kind: body.kind?.trim() || "document",
    content,
    scope: body.scope && body.scope !== "all" && Array.isArray(body.scope) ? body.scope : "all",
    size: content.length,
    createdAt: Date.now(),
    usedCount: 0,
  };
  store.update((d) => {
    d.files.unshift(file);
    d.events.unshift({
      id: uid("evt"),
      at: Date.now(),
      level: "success",
      source: "system",
      text: `Knowledge added: ${name}. Agents will learn from it.`,
    });
  });
  return NextResponse.json(file);
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id query param required" }, { status: 400 });
  store.update((d) => {
    d.files = d.files.filter((f) => f.id !== id);
  });
  return NextResponse.json({ ok: true });
}
