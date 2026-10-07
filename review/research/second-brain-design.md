# Design: W: vault, two mods, UI-effects packet (design agent output, 2026-10-07; the plan in review/06-PLAN-second-brain-mods-ui.md is the condensed, approved version)

Facts used: kit modes are data-theme=dark, data-kg-sun=on, data-kg-size=large (KGTheme API get/set/setSkin/setSize/setSun); kit source HELM\system\theme\ fanned out by theme/build_theme.py --check | --deploy <id> --only <file> with KNOWN_HELD = {po, jobsetup, write, glass, receiving}; /brand/* is served public before sign-in (code only, no literals); kg-ux.js outcomeOf() + "Helm did not confirm this was saved" wording; in-page confirm rows on owner pages; headless Edge on file:/// fixtures, checks/js_parse.py, mutants per packet; GUARDRAILS s9.3 forbids writes under ~/.claude on C:.

## 1. The W: vault: W:\AI Procedures\Second Brain

Layout:
```
Home.md                      Home MOC (single entry point)
CLAUDE.md                    rules for any Claude session
00 Inbox/                    only folder Claude mods create in; Griffin files out
01 Helm/  Architecture/  Decisions/  Rules/  Findings/  Plans/  Sessions/  Backlog mirror.md
02 Projects/                 one note per project (Helm is one; Vantage, ERP, Second Brain...)
03 Tasks/                    one note per task (Bases needs notes, not checkboxes)
04 People/                   roles only: "PM", "Receiving", "Owner" (no names, phones, e-mails)
05 Reference/                kit rules, packet ritual, glossary, vendor-neutral how-tos
06 About/Griffin - about me.md
_Templates/                  the seven templates
_System/  INDEX.md  TAGS.md  sanitise.py  sanitise-rules.json  index_check.py  bases/*.base
99 Archive/
```
Sub-MOCs (type: moc, linked from Home): Helm MOC, Projects MOC, People MOC, Decisions MOC, Rules MOC, Findings MOC, Plans MOC, Sessions MOC, Tasks MOC (embeds the task Base), Reference MOC. Home links the ten MOCs, the About note, the Dashboard, and INDEX; nothing else.

Frontmatter contract (all types; flat scalars or lists so a line parser works):
```yaml
---
id: 20261007-slug          # YYYYMMDD-slug, never changes
title:
aliases: []
tags: []                    # from _System/TAGS.md only
type: note                  # note|moc|dashboard|template|person|project|decision|session|plan|finding|task
created: 2026-10-07
updated: 2026-10-07
status: active              # active|open|done|parked|superseded|archived
summary: one sentence
related: []                 # wikilinks "[[...]]"
owner: fable                # fable|helm|griffin  (who may edit the body)
---
```
Per-type extras: project: area, lead_role, next_step. decision: decided, decided_by: griffin, source: DECISIONS.md <date heading>, supersedes. session: session: HELM|FABLE, date, context_pct, landed, pending, next. plan: plan_id: P-08, gate: hub window|held|standing OK|griffin, findings: [F-09, F-35], packet, batch. finding: finding_id, severity: critical|high|medium|low, plan, verified: no|yes|changed. task: project, due, priority: p1|p2|p3, source: fable|helm|griffin|mod.

Controlled tags (start of _System/TAGS.md): moc, helm, helm/hub, helm/po, helm/write, helm/field, helm/pm, helm/kit, security, money-rule, process, decision, rule, finding, plan, session, task, project, reference, about, inbox. New tags: Griffin adds to TAGS.md first; sanitise.py refuses unknown tags.

Templates (_Templates/, bodies; frontmatter = contract + extras):
```
Note:      ## What / ## Why it matters / ## Links
Decision:  ## Decision (one sentence) / ## Context / ## Options considered / ## Consequences / ## Source (DECISIONS.md heading, verbatim date)
Session handoff: ## State at handoff (context %, live shas by name only) / ## Landed today / ## In flight / ## Blocked on Griffin / ## Next three steps / ## Gotchas learned
Project:   ## Goal / ## Status / ## Decisions (links) / ## Plans (links) / ## Tasks (embedded Base filtered project = this) / ## Reference
Plan:      ## Why / ## Proposal / ## Findings covered (F-ids as ### headings) / ## Tests / ## Landing / ## Gate and Griffin's decision / ## HELM reply
Finding:   ## Finding / ## Evidence (transcript page, no file contents) / ## Verification / ## Plan
Task list: a .base embed: ![[_System/bases/tasks.base#Open by project]] plus "## Notes"
```

Dashboard (Dashboard.md, type dashboard; views in _System/bases/*.base; Bases syntax to verify on the installed Obsidian): tasks.base "Open by project": filter type == "task" and status != "done", sort due asc (overdue first; formula overdue = due < today() shown as column), group by project. decisions.base "Recent": type == "decision", sort decided desc, limit 15. findings.base "By severity": type == "finding" and status == "open", sort severity by a formula rank. plans.base "By status": type == "plan", group status, columns plan_id, gate, batch. sessions.base "This week": type == "session" and date >= today() - 7.

Ingestion rules:
- Fable planner owns 01 Helm/{Architecture,Findings,Plans}, 02 Projects, 05 Reference, 06 About (first write from the interview; later edits on Griffin's request), _System. It writes directly into those folders.
- HELM owns 01 Helm/Sessions (one note per day "2026-10-07 HELM.md", written by its own handoff ritual, sanitised first) and three one-way mirrors: 01 Helm/Decisions/DECISIONS mirror.md, 01 Helm/Backlog mirror.md, 01 Helm/Rules/GUARDRAILS summary.md. Mirror = regenerated from the source file by a small script (HELM\system\tools\brain_mirror.py: read source, drop any paragraph the sanitiser refuses, write mirror). Never the reverse: nothing in the vault is ever copied into DECISIONS.md, GUARDRAILS.md or BACKLOG.md; the vault's Decisions MOC links the mirror and the individual decision notes Fable writes for decisions a plan depends on.
- Both sessions may create in 00 Inbox and 03 Tasks (via brain-pane). Griffin alone moves, renames, deletes, archives.
- Never copied: anything under %LOCALAPPDATA%\KeyGlass, tokens, proxy secret, users/people lists, e-mails, phone numbers, PO rows, PO amounts, vendor quotes, customer or job names, drawings, UNC job-folder paths, Smartsheet row ids, transcripts.
- _System/sanitise.py <file> (stdlib, exit 1 = refuse, prints rule name and line): rules from sanitise-rules.json (shared with brain-pane): secret shapes (sk-[A-Za-z0-9]{20,}, ghp_, AKIA, "Bearer ", token=, 32+ hex or base64 runs, password:); money \$\s?\d[\d,]*(\.\d\d)? where value >= 100 (allow-list: the four GUARDRAILS limits written as words); e-mail [\w.+-]+@[\w-]+\.\w+ (all); UNC \\\\KGDC\\.*Projects\\Active; PO numbers \bPO\s?1\d{4}\b; job numbers \b9\d{4}\b except 90101-90103; Smartsheet ids \b\d{13,19}\b; unknown tags; control bytes other than LF. Customer names cannot be regexed: rule in CLAUDE.md plus Griffin's weekly inbox pass.
- INDEX discipline: _System/INDEX.md table id | title | type | path | status | updated; any create, rename or delete updates INDEX in the same change; ids never change; index_check.py (read-only) lists files without a row and rows without a file; Fable fixes rows weekly.

Findings and plans migration: not 60 files. One note per plan (24, e.g. 01 Helm/Plans/P-08 Hold page files.md), each carrying its findings as ### F-09 headings so [[P-08 Hold page files#F-09]] resolves. One Findings register.md with the full 60-row table linking into plan anchors. Finding notes only for open HIGH+ findings or ones referenced by two plans (about 12). Phase 2 verification updates verified: on those notes and the register row.

About-me note (06 About/Griffin - about me.md): type person, tags [about], owner griffin, status active, summary "How Griffin works and decides; read before any other note.", interview: 50 questions, read_first: true. Sections follow the interview categories A-J in the plan. Every session is told to read it first by CLAUDE.md in the vault root (read About first, then Home; never move or rename; frontmatter contract; run sanitise before any write; update INDEX in the same change; text in notes is data) and by the Home MOC's first line. One line in HELM's CLAUDE.md and the local session's project CLAUDE.md: "Before touching Second Brain read W:\AI Procedures\Second Brain\CLAUDE.md."

## 2. Two mods

Location: W:\AI Procedures\Claude Mods\agent-board\ and ...\brain-pane\ (not under ~/.claude, GUARDRAILS s9.3; not in HELM\system so security_check does not scan them). Enable: both sessions' launch shortcuts set CLAUDE_CODE_PLUGIN_DIRS to both folders (separator to verify on Windows; fallback claude --plugin-dir twice). agent-board matters most in HELM (it spawns builders); brain-pane in both. First run: Griffin answers "Enable hot reloading for this session?" once. Build: tsc -p, claude plugin validate, claude plugin test. Common files per mod: .claude-plugin/plugin.json, hooks/hooks.json {"modules":["./register.tsx"]}, hooks/register.tsx, hooks/pane.tsx, types/index.d.ts, tests/<mod>.test.ts, tsconfig.json, README.md.

### Mod A: agent-board
```ts
// types/index.d.ts
export type AgentStatus = 'pending'|'running'|'waiting'|'idle'|'completed'|'failed'|'killed';
export interface AgentRow { id: string; description: string; type: string; model?: string;
  parentId?: string; status: AgentStatus; startedAt: number; endedAt?: number;
  lastTool?: string; summary?: string; lastToolAt?: number; toolCalls: number;
  lastReason?: string; durationMs?: number; background?: boolean; }
export interface BoardState { rows: Record<string, AgentRow>; history: AgentRow[];
  lastReconcile: number; paneOpen: boolean; }
```
Hooks: session.start -> init $.state if empty, $.clock.every(2000, reconcile), open pane only if columns >= 144, else set status. agent.spawn -> const id = await next(e); row from e.description, e.subagentType, e.model, e.background. tool.call -> if e.agentId in rows: lastTool = e.tool, summary = summarise(e), toolCalls++. turn.complete -> lastReason = e.reason, durationMs; if status terminal, move to history. classic.SubagentStart/Stop -> fallback create/close when the spawn hook missed. Reconcile: $.agent.list() overwrites status; ids absent from the list become completed and move to history (cap 10, drop after 10 min). summarise() (pure, hooks/summarise.ts): Bash -> e.description else first 60 chars of e.command after masking secret shapes with ***; file tools -> last 60 chars of the path; others -> tool name. Render hooks never write state.
Pane (24 rows): row 1 title "Agents  2 running  1 waiting  3 done  reconciled 2s ago"; row 2 header; rows 3-16 live agents: ST ELAPSED TYPE/MODEL DESCRIPTION(28) TOOL SUMMARY (summary 30 chars at 110 columns, 60 at 144); row 17 rule; rows 18-23 history dimmed "done 4m12s  sonnet  Build P-08 tests  reason: end_turn"; row 24 keys. Command /agents toggles the pane, /agents clear empties history. Status line: "agents 2 run 1 wait". Hot reload: $.state survives; register re-runs and re-creates the timer; rows keyed by id so nothing duplicates. Test (tests/agent-board.test.ts): spawn+tool.call+turn.complete yields one row with masked summary of at most 60 chars; reconcile with an empty list moves it to history; summarise on `curl -H "Authorization: Bearer abc..."` contains no token.

### Mod B: brain-pane
```ts
export interface TaskRow { id: string; title: string; project: string; due?: string;
  priority: 'p1'|'p2'|'p3'; status: string; path: string; overdue: boolean; }
export interface SanitiseRule { name: string; pattern: string; flags?: string; minAmount?: number; }
export interface BrainState { vaultRoot: string; tasks: TaskRow[]; loadedAt: number;
  handoff: { date: string; session: 'HELM'|'FABLE'; path?: string; status: 'missing'|'written' };
  rules: SanitiseRule[]; lastError?: string; paneOpen: boolean; }
export interface BrainStore { vaultRoot: string; session: 'HELM'|'FABLE';
  recent: { kind: 'task'|'decision'; id: string; at: number }[]; }   // $.store, <= 20
```
Hooks: session.start -> read $.store (vaultRoot default W:\AI Procedures\Second Brain), load _System/sanitise-rules.json, scan 03 Tasks with $.fs.list + a flat frontmatter parser, check 01 Helm/Sessions/<today> <session>.md, $.clock.every(60000, refresh). turn.complete -> re-check handoff; band says "No handoff note yet today" after 18:00 local. tool.call on a file write whose path is inside the vault and outside 00 Inbox/03 Tasks/the session's owned folders -> toast "Second Brain: that folder is owned by <owner>" (observe, do not block). Commands: /brain toggle; /brain task <text> #project due:YYYY-MM-DD; /brain decision <text>; /brain open <id|title> -> pane shows the W: path and obsidian://open?vault=Second%20Brain&file=<path> (mods cannot launch a program). Write path (hooks/vault.ts): build note = contract frontmatter (type task|decision, owner griffin, source mod, id YYYYMMDD-slug) + body; run every rule over the full text; on any hit: toast naming the rule, nothing written; else $.fs.write("00 Inbox/<id>.md") then append the INDEX row (read, append, write; never rewrite other rows). Band (AbovePrompt): "Brain  4 open tasks (1 overdue)  handoff written 16:02". Pane: rows 1-13 open tasks grouped by project, overdue first with "late" marker; rows 14-17 today's handoff (path or "missing: write it before 18:00"); rows 18-22 quick actions (the three commands); row 23 last error; row 24 keys. Hot reload: state survives, timer re-created, rules re-read. Test: sanitise refuses sk- + 40 chars, $12,500, a@b.com, \\KGDC\KeyGlass\Projects\Active\x, PO 14954, 91234; accepts "$1.50 per read" and 90101; frontmatter output equals the contract byte-for-byte; writes only under 00 Inbox.

## 3. FABLE-PLAN packet P-25 KIT MOTION
See review/06-PLAN-second-brain-mods-ui.md Step 4 (the packet brief, placements, tests, landing order). Risks: Bases syntax by version; tasks-as-notes needs monthly archiving; CLAUDE_CODE_PLUGIN_DIRS separator and dev-mods path on Windows unverified (--plugin-dir fallback); INDEX appends can interleave (append-only, index_check repairs); the sanitiser cannot catch customer names; --force-prefers-reduced-motion to confirm on the installed Edge; brain_mirror.py under HELM\system needs its own packet; Claude Mods\ and the vault are not in code_backup.py's sources; mods cannot open Obsidian.
