# Plan: move the planner local, build the second brain, two Claude mods, and Helm UI motion

## Context

Griffin asked for four things on 2026-10-07, before more Helm review work goes out:
an about-me document built from 50 in-depth questions asked one at a time; a true
second brain in Obsidian for all context, projects, tasks and docs; Claude Code
"mods" that make the terminal useful (a second-brain dashboard and a board of
running agents); and a UI motion language for Helm (headline rise-in with an
underline draw, cards that stack on scroll, magnetic buttons that become a
confirm), with six design sites OODA'd and a design-rules folder analysed.

Decisions taken in this planning session (Griffin's answers):
- This is a cloud session with no path to W: or HELM. **Move the planner to a
  local Claude Code session on the PC** (Fable 5.1), with a handoff prepared here.
- The work vault is **new, at `W:\AI Procedures\Second Brain`**, readable by office
  staff (non-technical, told not to touch). The personal "Brain Dump" vault on
  OneDrive stays separate.
- The about-me note lives **in the vault**, answered **one question per turn**.
- The Helm review (batch 1 already with HELM) **runs side by side** with this work.
- The design-rules folder did not reach the cloud; Griffin **gives the local
  session its path**.
- Research done here (verdicts on the six sites, Helm's UI rules, the mod API) is
  committed on branch `claude/review-agent-planning-akb4yu` under `review/` and
  summarised below so the local session does not redo it.

Constraints that shape everything: no secrets, prices, customer names, PO rows or
user data in the vault (office staff can read W:); Helm pages serve their own
assets under a strict CSP with no inline styles, no emoji, four theme modes,
375 px first, reduced motion respected; HELM's gates (packet, SECURITY read,
Griffin's Deploy now) stay; Griffin hit the monthly spend limit on 10-06, so
builds use one Sonnet 5.5 subagent per packet and Opus only for SECURITY reads.

## Step 0. Hand the planner to a local session (first, ~30 min)

Files to create on the review branch (this cloud session, after plan approval):
- `review/HANDOFF-2026-10-07-local-planner.md` in the `anthropic-skills:handoff`
  format (kickoff blockquote; original ask; decisions and constraints; current
  state with exact paths; completed; next steps in order; open questions). It
  points at: `review/02-PHASE1-SYSTEM-MAP.md`, `03-FINDINGS-REGISTER.md` (60
  findings), `05-PHASE3-SYNTHESIS.md`, `plans/README.md`, `plans/BATCH-1.md`
  (sent to HELM 13:15 UTC), `plans/BATCH-2-DRAFT.md`, `04-PHASE2-CODE-REQUEST.md`,
  the three research note sets, and this plan.
- The local session cannot `git clone` (IT has not approved GitHub traffic from
  that PC). Transfer: Griffin downloads the branch as a zip from GitHub and
  unzips it to `W:\AI Procedures\Second Brain\_import\review-2026-10-07\`, or
  reads it via the cloud transcript (`list_events` on this session id) if the
  local session runs Remote Control. Zip is simpler; say so in the handoff.

Griffin's steps on the PC (put verbatim in the handoff):
1. Open a terminal in `W:\AI Procedures\Second Brain` (create the folder first).
2. `claude --model claude-fable-5-1 --effort high` (if the model is not
   available on the account, `/model` lists what is).
3. `/remote-control` so the session gets `send_message`/`list_events` and can be
   followed from the app; peer messaging to HELM then works via `ListAgents`.
4. Paste the kickoff blockquote from the handoff. Its first line tells the
   session to read `_import\review-2026-10-07\review\HANDOFF-...md`, then the
   plan, then start the interview.
5. Give it the design-rules folder path when it asks.

After the handoff lands, this cloud session only relays anything HELM sends here
and stops planning. (The 14:01 UTC check-in on batch 1 still fires; it reports
and stops.)

## Step 1. The about-me interview (50 questions, one per turn)

Where: `W:\AI Procedures\Second Brain\10 Areas\Griffin\About Griffin.md`
(frontmatter `type: person`, `status: growing`, `summary:` one line; the vault
section below fixes the path once the layout is final). The local session asks
one question per message, writes the answer under the matching heading
immediately (never batches), and after every ten answers appends a short
"what this changes about how I work with you" note at the end of the file.
Answers are Griffin's words lightly tidied; nothing paraphrased into claims he
did not make. Personal or sensitive answers (health, family, money) are not
asked; if offered, they go to the OneDrive Brain Dump, not W:.

The 50 questions, ten categories of five. Ask in this order; skip any Griffin
says is already answered elsewhere and record the pointer instead.

A. Role and day
1. What is your job at Key Glass in one paragraph, and what did it look like
   before Helm existed?
2. Walk me through yesterday hour by hour: where did Helm, Smartsheet, email
   and the field take your time?
3. Which three recurring tasks do you most want off your plate, and which
   three would you never hand off?
4. Who depends on you daily (roles, not personal details), and for what?
5. What does a bad week look like, and what usually causes it?

B. The company and its people
6. Describe Key Glass: size, kinds of jobs, who the customers are, the busy
   seasons.
7. Who are the PMs, office staff, field managers and crews as roles, and what
   does each group need from Helm that they do not get from Smartsheet?
8. What is the hierarchy for approvals: who can spend, who can commit the
   company, who signs?
9. Which outside systems are untouchable (Smartsheet structure, accounting,
   IT policy) and why?
10. What has IT said yes and no to so far (GitHub traffic, installs, the
    Huntress flag), and how do you want future asks to IT framed?

C. Helm: why and what
11. Why did you build Helm instead of buying something, and what would make
    you buy something later?
12. Which Helm tools are in daily use, which are experiments, and which would
    you retire tomorrow?
13. Which Helm feature has saved the most time or caught the most mistakes,
    with an example?
14. What is Helm's biggest embarrassment or near-miss so far, and what did it
    change?
15. If Helm vanished for a week, what breaks first and what carries on?

D. Goals and measures
16. What should Helm make true by 31 October, by year end, and by this time
    next year?
17. How will you know PM adoption is real (what you will look at, how often)?
18. What is the one number you would put on the wall for the company?
19. Which goal would you drop first if forced, and which never?
20. What does "done" mean for the review I am running, in your words?

E. Risk, money and rules
21. Where is the money risk in Helm today in your own ranking (POs, amounts,
    sign-in, the PC, the share)?
22. How much outage can Helm have before it matters: minutes, an hour, a day?
23. What must never leave the company, and what is fine to send to Claude?
24. When a rule in GUARDRAILS blocks something useful, how do you want that
    raised and decided?
25. What have you decided once that keeps getting re-asked, so we can write it
    down and stop?

F. How you decide and work with Claude
26. When you say "go", "whatever you recommend", "hold" or "later", what
    exactly do each of those mean, and when should Claude still ask?
27. Which decisions do you want in a question with options, and which do you
    want made for you and reported?
28. How many things can run in parallel before it stops helping you?
29. What should a session do when you have gone quiet for an hour, and for a
    day?
30. What has a Claude session done that annoyed you most, and what has
    delighted you?

G. How you like answers
31. Short status or full detail: when each, and what is the ideal length of a
    status message?
32. Tables, bullets or sentences: which do you read fastest on the phone, and
    which at the desk?
33. Which words or tones put you off (jargon, hedging, cheerleading), and
    which phrasing of a bad-news message would you accept?
34. When you ask a yes/no question, do you want the reasoning before or after
    the answer?
35. What should every session say in its first message and its last?

H. Tools, devices and habits
36. Which devices and apps do you use through the day (PC, phone, Outlook,
    Obsidian, the Claude app), and which one are you on when you message?
37. How do you want to be interrupted for a decision: a question in the
    session, a push notification, an email, or a note to read later?
38. What do you already keep in the Brain Dump vault, and what should stay
    there rather than in the work vault?
39. What recurring times are sacred (meetings, site visits, the Wednesday
    crown), and what windows are good for restarts and deploys?
40. What do you want to see first when you open the second brain in the
    morning?

I. Quality, design and taste
41. Show or name three interfaces you admire and say what you admire about
    each.
42. What does "fast and accurate" mean for a crew on a phone in the sun?
43. Which Helm page looks best today and which looks worst, and why?
44. How much motion do you want: none, subtle, or show-off, and where?
45. What is your rule for when a feature is finished: tests, a PM using it,
    or you using it?

J. Looking ahead
46. Which part of the business do you want Helm to reach next (estimating,
    shop, inventory, field, closeout), and why that order?
47. What would you build if a second person could maintain Helm with you?
48. What would make you trust a session to deploy without your press?
49. What should the next review look at that this one did not?
50. What question should I have asked and did not?

## Step 2. The W: second brain (vault at `W:\AI Procedures\Second Brain`)

Built by the local Fable session on day one (skeleton), then filled.

Layout:
```
Home.md                 Home MOC: the single entry point (links the ten MOCs, About, Dashboard, INDEX; nothing else)
CLAUDE.md               rules for any Claude session (below)
Dashboard.md            type dashboard; embeds the Bases views
00 Inbox/               the only folder the mods create in; Griffin files out
01 Helm/  Architecture/  Decisions/  Rules/  Findings/  Plans/  Sessions/  Backlog mirror.md
02 Projects/            one note per project (Helm, Vantage, ERP direction, Second Brain, ...)
03 Tasks/               one note per task (Bases needs notes, not checkboxes)
04 People/              roles only (PM, Receiving, Owner); no names, phones, e-mails
05 Reference/           kit rules, packet ritual, glossary, how-tos
06 About/Griffin - about me.md
_Templates/             note, decision, session handoff, project, plan, finding, task list
_System/  INDEX.md  TAGS.md  sanitise.py  sanitise-rules.json  index_check.py  bases/*.base
99 Archive/
```
Sub-MOCs, each `type: moc`: Helm, Projects, People, Decisions, Rules, Findings,
Plans, Sessions, Tasks (embeds the task Base), Reference.

Frontmatter contract (flat scalars and lists so a line parser works):
`id` (YYYYMMDD-slug, never changes), `title`, `aliases`, `tags` (only from
TAGS.md), `type` (note|moc|dashboard|template|person|project|decision|session|
plan|finding|task), `created`, `updated`, `status` (active|open|done|parked|
superseded|archived), `summary` (one sentence), `related` (wikilinks), `owner`
(fable|helm|griffin: who may edit the body). Per-type extras: project `area,
lead_role, next_step`; decision `decided, decided_by, source (DECISIONS.md
heading), supersedes`; session `session (HELM|FABLE), date, context_pct,
landed, pending, next`; plan `plan_id, gate, findings, packet, batch`; finding
`finding_id, severity, plan, verified`; task `project, due, priority, source`.

Controlled tags (start): moc, helm, helm/hub, helm/po, helm/write, helm/field,
helm/pm, helm/kit, security, money-rule, process, decision, rule, finding,
plan, session, task, project, reference, about, inbox. New tags go into
TAGS.md first; the sanitiser refuses unknown ones.

Template bodies: Note `What / Why it matters / Links`. Decision `Decision (one
sentence) / Context / Options considered / Consequences / Source`. Session
handoff `State at handoff (context %, live shas by name only) / Landed today /
In flight / Blocked on Griffin / Next three steps / Gotchas learned`. Project
`Goal / Status / Decisions / Plans / Tasks (embedded Base filtered to this
project) / Reference`. Plan `Why / Proposal / Findings covered (### F-ids) /
Tests / Landing / Gate and Griffin's decision / HELM reply`. Finding `Finding /
Evidence (transcript page, never file contents) / Verification / Plan`.

Dashboard views (Bases, native, no plugin; syntax verified on Griffin's
Obsidian before the .base files are written): tasks "Open by project" (status
!= done, sort due asc, overdue column, group by project); decisions "Recent"
(15); findings "By severity" (open only); plans "By status" (plan_id, gate,
batch); sessions "This week".

Ingestion rules:
- Fable owns `01 Helm/{Architecture,Findings,Plans}`, `02 Projects`,
  `05 Reference`, `06 About` (interview writes; later edits only on Griffin's
  request), `_System`.
- HELM owns `01 Helm/Sessions` (one note per day from its own handoff ritual,
  sanitised first) and three one-way mirrors regenerated by a small script
  `HELM\system\tools\brain_mirror.py`: `Decisions/DECISIONS mirror.md`,
  `Backlog mirror.md`, `Rules/GUARDRAILS summary.md`. Never the reverse:
  nothing in the vault is ever copied into DECISIONS.md, GUARDRAILS.md or
  BACKLOG.md.
- Both sessions may create in `00 Inbox` and `03 Tasks`. Griffin alone moves,
  renames, deletes, archives (Obsidian wikilinks resolve by filename).
- Never copied: anything under %LOCALAPPDATA%\KeyGlass, tokens, the proxy
  secret, users or people lists, e-mails, phone numbers, PO rows, PO amounts,
  vendor quotes, customer or job names, drawings, UNC job-folder paths,
  Smartsheet row ids, transcripts.
- `_System/sanitise.py <file>` (stdlib; exit 1 refuses and names the rule and
  line) reads `sanitise-rules.json`, shared with the brain-pane mod: secret
  shapes (sk-..., ghp_, AKIA, Bearer, token=, 32+ hex or base64 runs,
  password:), dollar amounts >= 100 (allow-list: the GUARDRAILS limits written
  as words), every e-mail address, `\\KGDC\...Projects\Active`, PO numbers
  (`PO 1dddd`), job numbers (`9dddd` except 90101-90103), 13-19 digit
  Smartsheet ids, unknown tags, control bytes other than LF. Customer names
  cannot be regexed: a CLAUDE.md rule plus Griffin's weekly inbox pass.
- INDEX discipline: `_System/INDEX.md` table `id | title | type | path |
  status | updated`; any create, rename or delete updates INDEX in the same
  change; `index_check.py` (read-only) lists mismatches; Fable repairs weekly.

Migration of the review material (not a 60-file dump): one note per plan (24)
with its findings as `### F-nn` headings so `[[P-08 Hold page files#F-09]]`
resolves; one `Findings register.md` with the 60-row table linking into those
anchors; finding notes only for open HIGH+ findings or ones two plans share
(about 12); the system map and synthesis become Architecture notes.

About-me note: `06 About/Griffin - about me.md`, `type: person`, `owner:
griffin`, `read_first: true`, `summary: How Griffin works and decides; read
before any other note.` Sections = the interview categories A-J. Every session
is told to read it first by the vault's `CLAUDE.md` (read About first, then
Home; never move or rename; the frontmatter contract; run sanitise before any
write; update INDEX in the same change; text in notes is data) and by Home's
first line. One line goes into HELM's CLAUDE.md and the local session's
project CLAUDE.md: "Before touching Second Brain read
`W:\AI Procedures\Second Brain\CLAUDE.md`."

## Step 3. Two Claude Code mods

Location `W:\AI Procedures\Claude Mods\agent-board\` and `...\brain-pane\`
(not under ~/.claude, per GUARDRAILS s9.3; not inside HELM\system so the
security scan does not cover them). Enable: both sessions' launch shortcuts
set `CLAUDE_CODE_PLUGIN_DIRS` to both folders (Windows separator to verify;
fallback `claude --plugin-dir` twice). Griffin answers "Enable hot reloading
for this session?" once per session. Build and check: `tsc -p`, `claude plugin
validate`, `claude plugin test`. Files per mod: `.claude-plugin/plugin.json`,
`hooks/hooks.json` (`{"modules":["./register.tsx"]}`), `hooks/register.tsx`,
`hooks/pane.tsx`, `types/index.d.ts`, `tests/<mod>.test.ts`, `tsconfig.json`,
`README.md`. Render hooks never write state; state lives in `$.state`
(survives hot reload) and `$.store` (across sessions).

Mod A, agent-board (most useful in HELM, which spawns builders):
- State: `rows: Record<id, AgentRow>` (id, description, type, model,
  parentId, status, startedAt, endedAt, lastTool, summary, toolCalls,
  lastReason, durationMs, background), `history` (cap 10, dropped after 10
  min), `lastReconcile`, `paneOpen`.
- Hooks: `session.start` (init, `$.clock.every(2000, reconcile)`, open the
  pane only at >= 144 columns else set a status line); `agent.spawn` (`await
  next(e)` gives the id; record description, subagentType, model,
  background); `tool.call` with `e.agentId` (lastTool, summary, count);
  `turn.complete` (reason, duration; terminal rows move to history);
  `classic.SubagentStart/Stop` as fallback; reconcile from `$.agent.list()`.
- `summarise()` is a pure function: Bash -> its description, else the first
  60 chars of the command with secret shapes masked `***`; file tools -> the
  last 60 chars of the path; others -> the tool name.
- Pane (24 rows): title with counts and reconcile age; header; live rows
  `status elapsed type/model description(28) tool summary`; a rule; dimmed
  history; keys. `/agents` toggles, `/agents clear` empties history. Status
  line `agents 2 run 1 wait`.
- Test: spawn + tool.call + turn.complete yields one row with a masked
  summary <= 60 chars; an empty reconcile moves it to history; `summarise` on
  a curl with a Bearer header contains no token.

Mod B, brain-pane (both sessions):
- State: `vaultRoot`, `tasks[]` (id, title, project, due, priority, status,
  path, overdue), `handoff` (date, session, path, status missing|written),
  `rules[]` from sanitise-rules.json, `lastError`, `paneOpen`. Store:
  vaultRoot, session, last 20 writes.
- Hooks: `session.start` (load rules, scan `03 Tasks` with a flat frontmatter
  parser, check today's session note, `$.clock.every(60000, refresh)`);
  `turn.complete` (re-check handoff; band warns "No handoff note yet today"
  after 18:00); `tool.call` on a file write inside the vault but outside the
  session's owned folders -> toast naming the owner (observe, never block).
- Commands: `/brain` toggle; `/brain task <text> #project due:YYYY-MM-DD`;
  `/brain decision <text>`; `/brain open <id|title>` prints the W: path and an
  `obsidian://open?vault=Second%20Brain&file=...` URI (mods cannot launch
  programs).
- Write path: build the note from the contract (`type` task|decision, `owner:
  griffin`, `source: mod`, id YYYYMMDD-slug), run every sanitise rule over
  the full text in-process; any hit -> toast naming the rule, nothing written;
  else `$.fs.write("00 Inbox/<id>.md")` and append one INDEX row.
- Band: `Brain  4 open tasks (1 overdue)  handoff written 16:02`. Pane: open
  tasks by project (overdue first), today's handoff, the three quick actions,
  last error, keys.
- Test: sanitise refuses `sk-`+40 chars, `$12,500`, an e-mail, a KGDC UNC
  path, `PO 14954`, `91234`; accepts `$1.50 per read` and `90101`; frontmatter
  output equals the contract byte for byte; writes only under `00 Inbox`.

## Step 4. Helm UI motion packet (P-25) and the six-site verdicts

Sent to HELM as a FABLE-PLAN in the batch-1 voice; HELM builds it with one
Sonnet subagent; SECURITY read (Opus) because `/brand` is public and
`build_theme.py` changes.

Deliverable: `theme/kg-motion.css` and `theme/kg-motion.js` (new kit pair,
listed in build_theme.py's fan-out set), a "Motion" section in `theme/KIT.md`,
`theme/tests/motion-fixture.html` (file:///) and `theme/tests/test_motion.py`.
Rules: CSS custom properties only from kg-theme tokens; no inline style
attributes (classes and data- attributes only; JS may set custom properties
through the CSSOM); no innerHTML; DOM built with createElement/textContent;
one IIFE `KGMotion {init, state}`; init is a no-op under
`prefers-reduced-motion: reduce`; no literal route, name, amount or job in
the file (it is served from the public /brand).

(a) Headline rise-in + underline draw: opt-in `.kg-rise` on an h1/h2; JS
splits by LINE (Range rects after fonts load, never by letter), wraps each
line, rises 0.6 em with an 80 ms stagger; key words the page marks with
`<mark class="kg-under">` get a background-size underline (0% -> 100%, 2 px,
`--kg-accent`) after the last line. Reduced motion and large type: final
state at once. Re-split on resize, debounced.
(b) Card stacking on scroll: opt-in `.kg-stack` container with `.kg-card`
children; `position: sticky`, `top` = `--kg-stack-top` + index * 12 px via
nth-child rules up to 12 cards; JS adds `.kg-stack-on` only after checks:
viewport height >= 600, no `data-kg-size=large`, every card opaque, no
ancestor with overflow other than visible; any failure leaves it static.
(c) Magnetic button + confirm: opt-in `data-kg-magnet`; mouse only, inert for
coarse pointers, hover:none and reduced motion; within 1.5x the box,
translate toward the cursor by at most 25% of the distance (transform only),
spring back on leave. Opt-in `data-kg-confirm="Verb"` gives the kit's
two-press shape: first press changes the text to "Press again to <verb>" and
sets aria-pressed, an aria-live=polite region announces it, Escape or blur
restores, no auto-revert timer, the second press fires the page's handler.
State shown by text and outline, never colour alone. Motion never touches a
button kg-ux.js manages (its save/outcomeOf path stays the owner).

First placements (conservative): (a) the Home h1 with one `<mark>`; (b) the
/guide page sections (a long vertical page; the tool index grid is
unsuitable); (c) magnet on Home tool-card "Open" buttons; confirm only on
Pulse "Collect now" (non-held, writes only Helm's own reading). Not on Deploy
now, Issue, Save, Approve, Undo or anything in a held tool until a later
packet with its own SECURITY read.

Folded-in site verdicts: undraw ADOPT (self-hosted, hand-cleaned inline SVG,
`fill="currentColor"`, under `theme/illustrations/`, first use the Home empty
state, decorative ones aria-hidden); css-loaders ADOPT the technique (one
`.kg-loader`, conic-gradient mask, tokens only, slows rather than freezes
under reduced motion; confirm its licence first); glassmorphism ADAPT
sparingly (backdrop-filter only on sticky chrome, `@supports` with an opaque
fallback, off in sun and large modes); aceternity ADAPT as an idea catalogue
only (its licence bars redistributing ported source; re-implement in 20
lines each); jsoncrack SKIP (hosted tool is a data-privacy risk, self-host
needs Node; a 40-line `<details>` tree viewer covers Helm's needs); devdocs
SKIP for Helm and its builders (needs a download or Docker; fine as a human
bookmark).

Tests (red first, twins; headless Edge on the fixture; js_parse): reduced
motion -> no rise lines, underline at 100%, magnet translate 0, confirm still
changes text; large type -> `.kg-stack-on` never set (twin: default fixture
at 900 px sets it); 500 px high -> no stack; coarse pointer stub -> mousemove
leaves transform none (twin: fine pointer moves it, never beyond 25%);
confirm -> text "Press again to Collect", aria-live holds the same, Escape
restores, no revert after 10 s; no element carries a style attribute; source
has no innerHTML; six looks render without console errors. Mutants >= 15
(drop each guard, cap 25 -> 100, invert the pointer test, split by letter,
text unchanged on press, Escape ignored, a 3 s revert timer, no aria-live,
translucent cards allowed, overflow ancestors ignored, inline style write,
innerHTML write).

Landing: 1 theme/ packet with SECURITY read. 2 `build_theme.py --deploy` to
the non-held tools; files land inert. 3 Home and /guide opt-in (engine
statics serve live with ?v=, no restart). 4 Pulse Collect-now opt-in under
the standing OK. 5 Held tools receive the files only at their next planned
Deploy now (never a standalone press). Griffin's go: the first placements
only. Effort: one Sonnet run, about three hours, plus the read.

The design-rules folder: when Griffin gives the path, the local session
reads it, writes `05 Reference/Design rules.md` (what the folder says, what
Helm already does, what to adopt), and amends P-25 before it is sent.

## Risks and open items

- Bases syntax varies by Obsidian version; verify on Griffin's install before
  writing .base files. Tasks-as-notes needs a monthly archive pass.
- `CLAUDE_CODE_PLUGIN_DIRS` separator and the dev-mods path on Windows are
  unverified; `--plugin-dir` is the fallback. Mods cannot open Obsidian.
- INDEX appends from two sessions can interleave; append-only rows and
  `index_check.py` repair it. The sanitiser cannot catch customer names.
- `--force-prefers-reduced-motion` must be confirmed on the installed Edge.
- `brain_mirror.py` under HELM\system is a tool and needs its own packet.
- Neither `Claude Mods\` nor the vault is in `code_backup.py`'s sources; add
  them or back them up separately.
- HELM is at ~94% context and the account hit a spend limit on 10-06; keep
  every brief to one Sonnet run and let HELM write its handoff note first.

## Sequencing and ownership

| Order | Work | Who executes | Gate |
|---|---|---|---|
| 0 | Handoff file + zip transfer; start local Fable session | cloud Fable, then Griffin | none |
| 1 | Vault skeleton (folders, Home MOC, templates, CLAUDE.md, sanitiser) | local Fable | Griffin opens it in Obsidian |
| 2 | Interview starts (one question per turn), parallel with everything below | local Fable + Griffin | none |
| 3 | Migrate review material into the vault (map, findings, plans, synthesis) | local Fable | sanitiser green |
| 4 | Mod A agent-board, then Mod B brain-pane; enable in the local session | local Fable (code), Griffin (enable) | `claude plugin validate/test` |
| 5 | UI motion packet brief to HELM; HELM builds with a Sonnet subagent | HELM | SECURITY GO; Deploy now for held tools |
| 6 | Design-rules folder analysis once the path is given; fold into STYLE notes and the packet | local Fable | none |
| side | Batch 1 / batch 2 of the Helm review continue with HELM | HELM | as planned |

## Verification

- Step 0: the local session reads the handoff and answers "what are the 60
  findings about" correctly from the imported files; `ListAgents` shows HELM.
- Step 1: `About Griffin.md` grows by one heading per turn; frontmatter valid;
  file opens in Obsidian with no broken links.
- Step 2: Obsidian opens the vault; Home MOC links every MOC; Bases Dashboard
  renders; `python -I sanitiser.py --check` over the vault returns 0 findings;
  a planted secret-shaped string is refused.
- Step 3: `claude plugin validate` and `claude plugin test` pass; spawning a
  Sonnet subagent shows a row in the pane within one turn; completing it fades
  the row; a hot reload keeps the board (state in `$.state`).
- Step 4: HELM's packet tests pass (reduced-motion shows final state; stacking
  off in large text and under 600 px; magnet inert on coarse pointers; confirm
  state changes text, Escape cancels); renders at 375 and 1920 in all four
  modes; SECURITY GO; served sha matches.
