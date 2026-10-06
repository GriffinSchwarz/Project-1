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
