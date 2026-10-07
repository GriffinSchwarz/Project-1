FABLE-PLAN BATCH 2 (DRAFT, not yet sent; final after P-00's ROUTES.md)

Same rules as batch 1: proposals, not orders; HELM's gates stand; one
Sonnet builder per packet; Opus only for SECURITY reads; Griffin's go
where the standing OK does not apply.

== P-24  WRITE DESK OWNER CHECKS + USERS-STORE WRITE SAFETY (HIGH) ======

Why: the 10-02 audit found live Write Desk generic edits with no owner
check (any signed-in admin/staff/ops could edit any row on every editable
sheet), /api/board leaking money, and VOID POs still editable. Cross-PM
edits (10-05) added a confirm-and-flag for PO rows only. The users store
(s6-1, landed 09-29 without a formal GO) trusts an older encrypted
users.json put back on W: and loses one of two concurrent writes; a
plain-text migration copy sits on C:. Crews sign in at V-E/V-F, so the
population and the blast radius grow now.

Proposal, two packets:
 24a write-service: a single `may_edit(person, sheet, row, column)` used
     by every write route (propose, approve, batch, undo), with the rule
     table in server.py (not config): owner PM or Griffin for PO rows;
     per-sheet owner column for the other six sheets (bids, billings,
     cos, materials, tasks, turnover); VOID/received/Complete refused
     for money columns (fourth exception), and for every column unless
     Griffin says otherwise; cross-PM confirm-and-flag stays as the
     override path. /api/board and any Write Desk read that carries
     money: sign-in required, no this-PC exception.
 24b hub users store: a monotonic version counter inside the envelope
     (not mtime: W: has 1 s granularity); load refuses a file whose
     version is lower than the last one it wrote (logs "older users file
     refused", answers 503 for admin writes until Griffin looks); writes
     take a lock file in STATE and re-read before write; the migration
     copy on C: is deleted by Griffin (P-17.3) and the hub refuses to
     start migration again if a plain copy exists.
Tests (red first, twins): 24a - staff edits another PM's bid row ->
  refused (red on base), owner edits own row -> ok (twin); VOID PO date
  edit -> refused; batch of 20 mixed rows stops at the first refused row
  (GUARDRAILS s3); cross-PM confirm path still works; /api/board without
  sign-in from loopback -> 403 (red on base), signed admin -> 200.
  24b - older file swapped in -> refused and logged; two writers -> both
  changes survive or the second is refused with a clear 409; a torn file
  -> last good copy used and health says so. Mutants: >= 20 per packet.
Landing: 24a is a held tool (Deploy now); 24b a hub window. Both need
  Griffin's go (money and sign-in paths; not standing OK). Builder: Sonnet.
Decisions for Griffin: the owner rule per sheet (who owns a bid, a CO, a
  turnover row); whether staff may edit non-money columns on others' rows.

== P-20  PO GENERATOR MONEY PATH (HIGH) ===================================

Why: three defects in one path. (1) SECURITY.md 8n: excel_finish.ps1
finds totals by exact label text, first hit, rightmost number, so a
description line equal to a label ("FREIGHT") can be read as the freight
total; the fix po-totals-labels (c1c7acb3917f -> ba31e252a681) was frozen
on 09-25 and I cannot see it landed. (2) PO 14954 (10-02): create_po_row
timed out at 45 s after Smartsheet had created the row; api_issue aborted
leaving Amount and Due Date blank, nothing filed, no log line; POs 14876
and 14877 (10-01) were issued with no PO Log row at all. Release 1 added
the POGen ref tag, in-flight guard and background Issue; what is still
missing is a local write-ahead record. (3) Templates and excel_finish.ps1
run from disk per request, so a held tool's behaviour changes without
Deploy now (hold gap 8k-2).

Proposal, one packet on PO Generator (held):
 - Issue path keeps a local write-ahead ledger (SQLite on the PC disk,
   never W:, per the ERP direction): one row per Issue attempt with draft
   id, POGen ref, job, vendor, state machine (started -> row-created ->
   amount-written -> filed -> done | failed-at-<step>), timestamps. Every
   Smartsheet call is preceded by a ledger write and followed by one. A
   restart or a timeout resumes from the ledger; the lost-create search
   (POGen ref column, then Notes) is the fallback, not the first resort.
   Timeout for create_po_row set above measured p95 (collect 50 real
   timings from smartsheet-writes.jsonl first; state the number in README).
 - A health field `issues_incomplete` and a /po/api/recent-style owner
   page listing incomplete Issues, so a stall is visible in Helm within a
   minute, not found by a spine check days later.
 - Land po-totals-labels or its current equivalent: totals found by the
   template's named cells or a label in the label column only, never a
   description line; a test with a "FREIGHT" description line.
 - Pinned copies: the server loads templates and excel_finish.ps1 from a
   start-time copy under STATE (as it already does for static files),
   recorded in the deployed fingerprint.
Tests (red first, twins): timeout after Smartsheet created the row ->
  resume completes amount, due date and filing with no second row (red on
  base); genuine create failure -> ledger says failed-at-row-created, no
  PO number consumed twice; "FREIGHT" description -> freight total not
  taken from it; template changed on disk -> served PO unchanged until
  Deploy now. Mutants >= 25; release-1 acceptance A,B still green.
Landing: Deploy now on PO Generator (held), after the current no-quote
  release has proven out on one real PO; not the same press. Griffin's go
  (money). Builder: Sonnet. SECURITY: Opus.

== P-01  ROUTE GATING BY DATA CLASS (HIGH; after P-00) ==================

Why: the "this PC" rule makes any local process (every Claude run
included) an admin for look-only routes; audits found money, row ids and
UNC paths answered on loopback without sign-in (F-01, F-36, F-43, F-52).
Proposal: using ROUTES.md, Griffin signs a one-page policy: this-PC may
  read counts, health and snapshots needed by services (allow-list of
  callers: hub probe, Field's poll, pm-service's /api/field, Pulse);
  everything that returns money, row ids, UNC paths or person data needs
  a signed person; writes always. Then one packet per service that
  applies the policy with `kghttp.require_person()` from lib (one shared
  guard, one test suite; F-58), and the hub stops signing this-PC as
  admin for any tool with identity:true (already done for Field in V-E).
Tests: per route in ROUTES.md, a refusal test and a twin. Mutants per
  service >= 10. Landing: per service in its own gate; lib change needs
  the five presses once. Griffin's decision: the policy page.

== P-06  HUB TEST NET (step 0 of any hub refactor) =======================

Why: hub.py is ~374 KB (65758b7033a5 today), carries identity, access,
deploy, watcher, CSP, admin UI and static serving, and has no test suite
I can find; every change is a public-address drop. Splitting it without
a net would be the riskiest thing in this review.
Proposal: a packet that adds engine\tests\ running in-process against the
  current hub.py with a fake users store and fake tools: the this-PC rule
  (loopback + no forwarding headers + local Host -> admin; any Cloudflare
  header -> sign in), X-KG-* stripping and signing by identity flag,
  role/tick access per mount, held-tool fingerprint and Deploy now,
  watcher debounce and depth, CSP per mount, body caps, login lock and
  weak-password rules. No hub code change. Target: 80 tests, 40 mutants,
  under 60 s. Lands under the standing OK (tests only). Builder: Sonnet.
  Then and only then: P-06b extracts one module per hub window (identity
  first), each behind the net.

== P-07  THE GATE'S OWN TOOLING ==========================================

Why: land_files.py and land_new_file.py live in a scratch folder and
collide on backup names within a second; helm_verdict/helm_record had FIX
items (GO despite unreadable later blocks, non-atomic REPORT rewrite);
packetkit-4's live-root guard only covers HELM\system; most pre-10-01
packets have no verdict line.
Proposal: move the landing scripts to tools\ with tests (backup name
  with microseconds plus a counter; refuse when the live sha differs;
  dry-run flag); fix the verdict tool items if helm-tools-2 did not land;
  extend packetkit's live_root() to PO Generator, Job Setup and
  Calculator; a one-off report listing every live sha with no verdict
  line, for Griffin to accept retroactively or not.
Tests: red first per defect; mutants >= 15. Standing OK (tools only).

== P-15  ONE REDRAW-SAFE INPUT PATTERN (MEDIUM, three incidents) =======

Why: Home 10-02 (redraw rebuilt inputs before reading them), Ask note
lost 10-02 (every Ask note ever sent was blank), Leaderboard 10-05 (typed
prices wiped on refresh). Each was fixed in place; nothing stops the
fourth.
Proposal: one helper in the kg kit (`kgForm.keep(root)`) that snapshots
  typed values by stable row id before any redraw and restores them
  after, plus a "you have unsaved typing" guard on reload; applied to
  home.html, ops.html, leaderboard pages; a headless-Edge test that types,
  triggers a redraw and asserts the value survives. Never stores money in
  browser storage (page memory only). Standing OK for pm-service pages;
  hub window for home.html.

== Decisions this batch needs from Griffin ===============================
1. P-24: owner rule per sheet; staff edits on others' non-money columns.
2. P-20: the create_po_row timeout number after measurement; approve a
   local SQLite ledger on the PC disk (ERP direction says yes).
3. P-01: sign the one-page this-PC policy once ROUTES.md exists.
