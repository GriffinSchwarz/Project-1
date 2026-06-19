import Anthropic from "@anthropic-ai/sdk";
import type { Agent, AgentRole, KnowledgeFile } from "./types";
import { DEFAULT_MODEL } from "./agents";

export function isLive(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export interface LlmResult {
  text: string;
  tokens: number;
  mode: "live" | "simulated";
}

interface RunContext {
  agent: Agent;
  prompt: string;
  /** Knowledge snippets the agent learned from. */
  knowledge: KnowledgeFile[];
  /** Outputs handed off from upstream agents, keyed by role. */
  upstream?: { role: AgentRole; text: string }[];
}

/**
 * Ask an agent to produce its work product. Uses the real Claude API when
 * ANTHROPIC_API_KEY is set; otherwise returns a high-quality deterministic
 * simulation so the whole product is usable with zero setup.
 */
export async function runAgentLlm(ctx: RunContext): Promise<LlmResult> {
  if (!isLive()) {
    return simulate(ctx);
  }
  try {
    const system = buildSystem(ctx);
    const userText = buildUser(ctx);
    const resp = await getClient().messages.create({
      model: ctx.agent.model || DEFAULT_MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system,
      messages: [{ role: "user", content: userText }],
    });
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const tokens =
      (resp.usage?.input_tokens ?? 0) + (resp.usage?.output_tokens ?? 0);
    return { text: text || "(no content)", tokens, mode: "live" };
  } catch (err) {
    // Fall back to simulation rather than failing the whole run.
    const sim = simulate(ctx);
    sim.text =
      `> ⚠️ Live model unavailable (${(err as Error).message}); showing simulated output.\n\n` +
      sim.text;
    return sim;
  }
}

function buildSystem(ctx: RunContext): string {
  return [
    ctx.agent.instructions,
    "",
    "Format your output cleanly in Markdown. Be specific and concise. If you needed an input you didn't have, note it under a short 'Open items' list at the end.",
  ].join("\n");
}

function buildUser(ctx: RunContext): string {
  const parts: string[] = [`# Task\n${ctx.prompt}`];
  if (ctx.upstream && ctx.upstream.length) {
    parts.push("\n# Hand-offs from other agents");
    for (const u of ctx.upstream) {
      parts.push(`\n## From ${u.role}\n${u.text}`);
    }
  }
  if (ctx.knowledge.length) {
    parts.push("\n# Knowledge base (learn from these)");
    for (const k of ctx.knowledge) {
      parts.push(`\n## ${k.name} (${k.kind})\n${truncate(k.content, 2000)}`);
    }
  }
  return parts.join("\n");
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// ---------------------------------------------------------------------------
// Simulation engine: deterministic, role-aware, and good enough to demo the
// entire product without an API key.
// ---------------------------------------------------------------------------

function simulate(ctx: RunContext): LlmResult {
  const { agent, prompt } = ctx;
  const knowledgeNote = ctx.knowledge.length
    ? `_Referenced ${ctx.knowledge.length} knowledge file(s): ${ctx.knowledge
        .map((k) => k.name)
        .join(", ")}._`
    : "_No knowledge files in scope._";
  const upstreamNote = ctx.upstream?.length
    ? "\n\n**Inputs used:** " +
      ctx.upstream.map((u) => `${u.role}`).join(", ")
    : "";

  let body = "";
  switch (agent.role) {
    case "estimating":
      body = simEstimate(prompt, ctx.knowledge);
      break;
    case "proposal":
      body = simProposal(prompt, ctx.upstream);
      break;
    case "email":
      body = simEmail(prompt, ctx.upstream);
      break;
    case "smartsheet":
      body = simSmartsheet(prompt);
      break;
    case "orchestrator":
      body = simOrchestrator(prompt);
      break;
  }

  const text = `${body}\n\n---\n${knowledgeNote}${upstreamNote}`;
  // Rough deterministic token estimate.
  const tokens = Math.round((prompt.length + text.length) / 3.6) + 220;
  return { text, tokens, mode: "simulated" };
}

function subject(prompt: string): string {
  const cleaned = prompt.replace(/\s+/g, " ").trim();
  return cleaned.length > 70 ? cleaned.slice(0, 67) + "…" : cleaned || "Project";
}

function simEstimate(prompt: string, knowledge: KnowledgeFile[]): string {
  const usesRates = knowledge.some((k) => k.kind === "rate-card");
  return [
    `## Cost Estimate — ${subject(prompt)}`,
    "",
    "Rough order of magnitude (ROM), ±15% at this stage.",
    "",
    "| Line item | Qty | Unit | Unit cost | Extended |",
    "|---|---:|---|---:|---:|",
    "| Project management | 320 | hr | $165 | $52,800 |",
    "| Site supervision | 480 | hr | $140 | $67,200 |",
    "| Concrete (3000psi) | 210 | cy | $185 | $38,850 |",
    "| Structural steel | 28 | ton | $3,200 | $89,600 |",
    "| General labor | 1,200 | hr | $95 | $114,000 |",
    "",
    "**Direct subtotal:** $362,450",
    "**Overhead (12%):** $43,494",
    "**Profit (8%):** $32,476",
    "**Total (ROM):** **$438,420**",
    "",
    "### Assumptions",
    "- Prevailing-wage labor; weather-protected schedule.",
    "- Excludes permits, hazmat abatement, and owner-furnished equipment.",
    usesRates
      ? "- Unit costs pulled from the firm Rate Card 2026."
      : "- Unit costs are placeholder industry averages (no rate card in scope).",
    "",
    "**Confidence:** Medium — refine after takeoff and subcontractor quotes.",
  ].join("\n");
}

function simProposal(
  prompt: string,
  upstream?: { role: AgentRole; text: string }[],
): string {
  const priced = upstream?.find((u) => u.role === "estimating");
  return [
    `## Proposal — ${subject(prompt)}`,
    "",
    "### Executive summary",
    "We are pleased to present our approach to deliver this scope on schedule and on budget. Our design-build team provides a single point of accountability from preconstruction through closeout, with an in-house estimating database spanning 400+ projects.",
    "",
    "### Our understanding",
    `You need ${subject(prompt).toLowerCase()}. We have aligned our team and methods to your outcome, not just the deliverable.`,
    "",
    "### Approach & scope",
    "1. Preconstruction & validation of program",
    "2. Phased delivery to minimize disruption",
    "3. Continuous value-engineering reviews",
    "4. Closeout with full documentation and warranty support",
    "",
    "### Pricing",
    priced
      ? "Pricing reflects the estimate prepared by our estimating team (see hand-off). Total ROM: **$438,420**, ±15%."
      : "_Pending estimate hand-off from Ledger._",
    "",
    "### Why us",
    "- Design-build delivery that typically compresses schedule by ~15%.",
    "- Demonstrated past performance (e.g., Riverside Civic Center — delivered 3 weeks early).",
    "- One accountable team, start to finish.",
  ].join("\n");
}

function simEmail(
  prompt: string,
  upstream?: { role: AgentRole; text: string }[],
): string {
  const hasProposal = upstream?.some((u) => u.role === "proposal");
  return [
    `**Subject:** ${subject(prompt)} — proposal & next steps`,
    "",
    "Hi [Client],",
    "",
    `Thank you for the opportunity to support ${subject(prompt).toLowerCase()}. ${
      hasProposal
        ? "Attached is our full proposal, including approach, team, and pricing."
        : "We're preparing a full proposal and wanted to confirm a couple of details first."
    }`,
    "",
    "A few highlights:",
    "- Single accountable design-build team from preconstruction to closeout.",
    "- A phased plan that keeps your operations running throughout.",
    "- Transparent, defensible pricing from our in-house estimating team.",
    "",
    "Could we grab 30 minutes this week to walk through it and answer questions? I'm happy to work around your schedule.",
    "",
    "Best regards,",
    "[Your name]",
    "",
    "_Open items: confirm recipient name and preferred meeting times before sending._",
  ].join("\n");
}

function simSmartsheet(prompt: string): string {
  return [
    `## Smartsheet change-set — ${subject(prompt)}`,
    "",
    "**Sheet:** `Active Projects`",
    "",
    "| Row | Column | New value |",
    "|---|---|---|",
    "| Proposal: " + subject(prompt) + " | Status | In Progress |",
    "| Proposal: " + subject(prompt) + " | Owner | Quill (Proposal) |",
    "| Proposal: " + subject(prompt) + " | Due | +5 business days |",
    "| Estimate | Status | Draft complete |",
    "| Estimate | % Complete | 80% |",
    "| Client email | Status | Ready to send |",
    "",
    "### Risk flags",
    "- ⚠️ Estimate depends on subcontractor quotes still outstanding.",
    "",
    "_Apply this change-set via the Smartsheet integration or hand to a coordinator._",
  ].join("\n");
}

function simOrchestrator(prompt: string): string {
  return [
    `## Coordination plan — ${subject(prompt)}`,
    "",
    "Routing this request across the fleet:",
    "1. **Ledger (Estimator)** → build the cost basis.",
    "2. **Quill (Proposal)** → assemble the proposal using Ledger's numbers.",
    "3. **Carrier (Email)** → draft the client-facing message.",
    "4. **Grid (Smartsheet)** → update project state.",
    "",
    "I'll verify each hand-off is coherent and flag any missing inputs before returning the package.",
  ].join("\n");
}
