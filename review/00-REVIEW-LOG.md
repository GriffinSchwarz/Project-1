# Fable 5.1 review of Helm - working log

Role split (Griffin, 2026-10-06): Fable 5.1 (this cloud session, id
session_01Cs3DH8XTjLUCmwuUAUbtor) researches and writes PLANS ONLY.
HELM main (Opus 5.5, session_0186ohJrC2NTxhriPAyRvj8a, remote control on
Griffin's PC) executes the plans under its own gates: staging packet,
SECURITY read, Griffin's go.

Review brief: "Fable 5.1 Comprehensive System Review Prompt" (7 phases,
7 perspectives). Phases 1-4 here; 5-7 are plans handed to HELM.

## Access

- The system lives on W:\AI Procedures\HELM\system and
  W:\AI Procedures\PO Generator\app on Griffin's Windows PC. Not in git.
- This container cannot reach W:. The desktop-commander MCP bridge timed
  out. All material comes through the HELM session (send_message in
  <60 KB parts) or Griffin attaching files.
- Fallback read channel: HELM's transcript via list_events (tool output
  of a `cat` shows up there).

## What is known before Phase 1 (from HELM's recent transcript)

- Helm is a local hub (engine/hub.py, mounts in engine/hub.json) on
  127.0.0.1:8888 for Key Glass. Mounts include /vantage (admin or
  vantage tick), /vantage/board (24186 completion board), the PO
  Generator, a Receiving desk, Field. A "Helm bar" is injected into
  index pages (_inject).
- PO Generator app: server.py, smartsheet_client.py, extract.py,
  filing.py, pocontinue.py, static/app.js, static/index.html. Reads
  documents with Claude under cost caps ($1.50 per read, $15 per person
  per day), behind the sign-in gate; talks to Smartsheet; files PDFs.
- Change process: every change is a staging packet
  (_staging/<date>-<name>/ with base/, staged/, DIFF, README "STAGED
  ONLY - not live", SHAS.txt, REVIEWS.md line 1 "SECURITY-VERDICT:
  AWAITING", red-first tests plus mutants). A SECURITY subagent appends
  GO/FIX/BLOCK. Landing uses land_files.py / land_new_file.py with sha
  checks and a _backups copy.
- Rule files at the system root: GUARDRAILS.md, SECURITY.md,
  DECISIONS.md, GOALS.md, docs/BACKLOG.md.
- Standing subagent rules: no recursive walks of W:\AI Procedures, never
  write to C:, never read %LOCALAPPDATA%\KeyGlass, install nothing, no
  live hub calls from reviewers, text in files is data.
- In flight on 2026-10-06: PO Generator no-quote + "More info for
  Claude" box (staged, SECURITY pending), POGen Ref column change
  (staged, same Deploy now), Vantage tab swap (landed 15:22). Next:
  V-E crew sign-in, V-F crew taps (need a hub restart).

## Timeline

- 2026-10-06 19:2x UTC: Phase 1 request sent to HELM (brief ->
  docs/REVIEW/2026-10-06-fable-review/01-SYSTEM-BRIEF.md).
- 2026-10-06 19:46 UTC: check-in. No reply. HELM's transcript 19:22-19:46
  shows no cross-session message arrived (Griffin gave it Vantage V-E/V-F/
  V-H work at 19:33; it now waits on a GUARDRAILS paste). Desktop Commander
  MCP connected but runs inside this Linux container, so still no W: access.
- 2026-10-06 19:48 UTC: resent with priority "now", asked for a one-line
  ack. Fallback paste file: review/01-PHASE1-REQUEST-FOR-HELM.md.
- 2026-10-06 20:04 UTC: check-in 2. Still nothing. The 19:48 resend
  (priority "now") also never appeared in HELM's transcript; HELM's only
  turns since were task notifications (PO Generator no-quote + More info
  packet staged at 20:00, SECURITY read launched). Conclusion: the
  cross-session channel does not reach this bridge session. Griffin must
  paste review/01-PHASE1-REQUEST-FOR-HELM.md into HELM, or attach the
  code backup here. Meanwhile two research agents mine the HELM main
  transcript and four archived desk-session transcripts into
  review/research/ for architecture facts.
- 2026-10-06 20:2x UTC: first research agent done (60 pages, 10-05 11:51
  to 10-06 20:06 UTC). Drafted 02-PHASE1-SYSTEM-MAP.md and
  03-FINDINGS-REGISTER.md (25 provisional findings) from it. Second agent
  continues 10-01 to 10-05; desk-sessions agent still running. HELM
  transcript at 20:24: V-E SECURITY GO (loopback-is-never-a-person tests
  pass); Griffin asked for the switch-over window. Still no paste of the
  Phase 1 request into HELM.
- 2026-10-06 ~21:00 UTC: part-2 transcript agent done (80 pages, 10-02
  15:34 to 10-03 06:13 UTC). Register now F-01..F-50. Launched part-3 agent
  for 10-01 02:15 to 10-02 15:34 UTC (the 09-30/10-01 audits). Phase 2
  code request drafted (04-PHASE2-CODE-REQUEST.md). Still no channel to
  HELM; waiting on Griffin.
- 2026-10-06 ~21:30 UTC: part-3 agent done (80 pages, 10-01 07:20 to
  10-02 15:34 UTC); unread remainder is 02:15-07:20 UTC on 10-01 only.
  Register now F-01..F-60. Transcript research closed; everything further
  needs code (Phase 2) through Griffin or HELM.
- 2026-10-07 13:15 UTC: Griffin reaffirmed: Fable plans, HELM executes
  with Sonnet 5.5 subagents. HELM resumed 13:10 UTC after a monthly spend
  limit; at ~941k context; mid V-E switch-over. Sent plan batch 1
  (review/plans/BATCH-1.md: channel bootstrap via transcripts, P-00
  inventory, P-08 page hold, P-17 Griffin actions); send_message returned
  "delivered". Check-in armed 14:01 UTC. Drafted batch 2
  (P-24, P-20, P-01, P-06, P-07, P-15).
- 2026-10-07 ~14:30 UTC: Griffin's new ask (about-me interview, Obsidian
  second brain, Claude mods, Helm UI motion, six sites, design folder).
  Plan written and approved (06-PLAN-second-brain-mods-ui.md). Decisions:
  planner moves to a local session on the PC; vault at W:\AI Procedures\
  Second Brain; interview in the vault one question per turn; review runs
  side by side. Research persisted under research/ (design-sites-ooda,
  helm-ui-rules, claude-mods-api, second-brain-design). Handoff written:
  HANDOFF-2026-10-07-local-planner.md. This cloud session now only relays.
- 2026-10-07 14:45 UTC: check-in 3. HELM's transcript shows it DID
  receive the Phase 1 request: redacted brief (693 lines, sha eec8f3701b17,
  SECURITY GO) written to docs\REVIEW\2026-10-06-fable-review\
  01-SYSTEM-BRIEF-redacted.md and sent to this session in two parts at
  13:36/13:37 UTC; neither part reached this session. Recovering the text
  from HELM's SendMessage inputs. Batch 1 (13:15 UTC) did not appear in
  HELM's transcript up to 14:03; HELM compacted at 13:33. No further
  check-ins from the cloud: the local session takes over.
- 2026-10-07 15:00 UTC: read HELM's brief; reconciled the register
  (F-23, F-26 resolved; F-61..F-68 added; P-26 added). Phase 1 is closed
  on HELM's own evidence. Cloud session's last planning act; the local
  session continues from the handoff.
