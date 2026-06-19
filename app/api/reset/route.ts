import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Clears runs/tasks/messages/events back to a fresh demo state.
export async function POST() {
  store.reset();
  return NextResponse.json({ ok: true });
}
