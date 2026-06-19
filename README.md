# FleetView — Agent Operations

Activate, run, and supervise a fleet of work agents from anywhere — including your phone.

FleetView is a mobile-first control room for a team of AI agents tuned to a
construction / professional-services workflow: **proposals, estimating, client
email, and Smartsheet tracking** — all coordinated by a **manager agent** that
routes work, brokers hand-offs, and verifies the results.

> Works with **zero setup**. Without an API key it runs in a deterministic
> **simulation** so the whole product is live and explorable. Add an
> `ANTHROPIC_API_KEY` and the same agents do the work for real with Claude.

---

## The fleet

| Agent | Role | What it does |
|---|---|---|
| 🛰️ **Atlas** | Fleet Manager (orchestrator) | Routes each request to the right specialists, chains hand-offs, watches for stalls, and runs cross-cutting jobs itself. |
| ✍️ **Quill** | Proposal Writer | Drafts proposals & SOWs, reusing firm voice and folding in pricing from the Estimator. |
| 📐 **Ledger** | Estimator | Builds defensible cost estimates from scope using rate cards in the knowledge base. |
| ✉️ **Carrier** | Email & Comms | Turns work products into polished, on-brand client email. |
| 🗂️ **Grid** | Smartsheet Coordinator | Translates work into structured sheet change-sets and flags schedule risk. |

Agents **work with one another** (Atlas → Ledger → Quill → Carrier → Grid),
**learn from files** you upload to the knowledge base, **track every step** of
what they do, and **store analytics** you can pull at any time.

## What you can do

- **Launch a task** and either target a specialist or let Atlas auto-route it.
- **Watch it happen live** — a collaboration map lights up as agents hand off,
  and each run shows a step-by-step timeline (plan → learn → think → act →
  hand-off → verify) plus the final deliverable.
- **Edit any agent** — name, persona, instructions (system prompt), skills,
  model, accent color — and **activate / deactivate** them.
- **Feed the knowledge base** — drop in rate cards, voice guides, or past
  performance; agents cite them while they work and the usage is tracked.
- **Pull analytics** — runs, success rate, tokens, durations, hand-offs, and a
  12-hour activity timeline, per agent and across the fleet.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

To use real Claude-powered agents, copy `.env.example` to `.env.local` and set
`ANTHROPIC_API_KEY`. Optionally set `FLEETVIEW_MODEL` (defaults to
`claude-opus-4-8`). Restart the dev server. The header shows **Live model** vs
**Simulation**.

Add it to your phone home screen (it's a PWA) for a one-tap app.

## Architecture

```
app/
  page.tsx            → renders the dashboard
  api/                → state, tasks, agents, runs, files, reset (Node runtime)
components/
  Dashboard.tsx       → tabs, polling, launcher, all tab views
  Network.tsx         → live collaboration map (SVG)
  AgentEditor.tsx     → edit an agent
  RunDetail.tsx       → step timeline + deliverable
  ui.tsx              → shared primitives + a dependency-free Markdown renderer
lib/
  agents.ts           → the default roster & personas
  engine.ts           → orchestration: routing, pipelines, hand-offs, supervision
  llm.ts              → Claude wrapper + deterministic simulation fallback
  state.ts            → snapshot + analytics aggregation
  store.ts            → file-backed JSON store (no native deps)
  types.ts            → domain model
```

The runtime keeps live state in a module singleton and persists it to
`.data/store.json` (gitignored), so the UI feels live and survives restarts
without a database. The client polls `/api/state` to render progress.

### Where real integrations plug in

The `llm.ts` agent layer and the engine's hand-off points are the seams for
wiring real Smartsheet / Microsoft 365 / email connectors per agent — each
specialist already produces a structured change-set or draft ready to be
applied by an integration.

---

Built with Next.js (App Router), React, TypeScript, and Tailwind.
