# Phase 3 - Adversarial synthesis (provisional; on transcript evidence)

Purpose: find where the sixty findings pull against each other and against
Griffin's stated direction, decide which side wins, and fix the order so a
fix does not create the next incident. Re-run after Phase 2 confirms the
code.

## 1. Contradictions and how they resolve

| Tension | Side A | Side B | Resolution (provisional) |
|---|---|---|---|
| "This PC" convenience vs least privilege | Everything on the PC (hub health probes, Field's poll, pm-service's /api/field calls, Griffin's own browser, every Claude run) relies on loopback-as-admin; removing it breaks the service mesh and Griffin's daily use. | Any local process reads money, row ids, UNC paths and can forge identity with proxy.secret (F-01, F-36, F-43, F-52). | Keep loopback trust for service-to-service calls (counts, health, snapshots) and REMOVE it for money- and identity-bearing reads and all writes. Classify routes by data class (P-01 step 1) before touching code. Long term: a per-process credential for Claude runs so the AI operators are not Griffin. Security wins on money; convenience wins on health. |
| Held tools (Deploy now) vs pages served live from W: | The held-tool fingerprint is the safety net Griffin relies on. | Four held tools serve page and kit files live, and kg-ux.js (every Write Desk call) is unwatched (F-51, F-09, F-35). The net has a hole exactly where the money UI is. | Close the hole in the hub, not per tool: hold page files with the server for held tools (P-08), watch static\kg, record kg-ux.js. Do it before more PM-facing features land. |
| Rigour of the packet ritual vs single-person deploy throughput | Every change waits for SECURITY plus Griffin's press; the ritual has caught real defects (money scrub, writes_on, people-list crash). | Fixes wait 19 h for a press; builders over-run budgets; the gate's own tools had holes (F-45, F-46, F-56). | Keep the ritual; make it cheaper: preflight on down tools, one "Deploy all held" with per-tool preflight, verdict tooling under test (P-07, P-11). Never widen the standing OK to money or sign-in. |
| hub.py as one file vs restart cost | One file is simple to land and back up; the switch-over is already tooled. | 374 KB with identity, deploy, admin UI and static serving in one unit; no hub tests; every change drops the public address (F-07). | Do not split first. First build a hub test net that runs against the current file (identity, access, this-PC rule, deploy, watcher, CSP). Split only behind that net, one window at a time (P-06). Tests win over structure. |
| "Never delete" host rule vs retention | The rule exists because deletes have cost real data and because EDR watches the PC. | Glass sweeps uploads after 7 days; scratch folders hold plain money copies for weeks (F-32, F-60). | Make retention explicit per store (Griffin's decision), then code it with an audit line. Until decided, no automatic deletes anywhere. |
| Adoption first (ERP direction, F-59) vs hardening | Griffin wants PMs using Helm daily by 31 Oct; features win attention. | The money-write authorisation gaps (F-40, F-48, F-53) and the live-from-W: hole (F-51) grow in blast radius with every new user. | Sequence hardening into the feature windows: each hub window carries one hardening item alongside the feature (V-E carries the CSP; the next carries page-hold). No standalone "security sprint" that stalls adoption. |
| Smartsheet as the record vs Helm-side state | No new store on W:; Smartsheet stays the record. | Duplicate-PO protection, issue recovery and ledgers need a local write-ahead record (F-41, F-54). | A small local SQLite on the PC disk (already the ERP direction) for write-ahead and idempotency keys only; never a second copy of sheet data. |
| Per-service host guards vs shared lib | Each service owns its guard; landing lib needs five presses (F-14). | Guards drift (Pulse had none until 10-01, F-58). | One guard in lib with one test suite; accept the five presses once. |

## 2. Systemic consistency (what repeats)

- Redraw-before-read UI bug: three incidents (F-18, F-42). One pattern, one
  shared test (P-15).
- Silent truncation: quote pages dropped, Notepad clause cut, note length
  caps (F-44, F-46). Rule: every cap refuses loudly or shows what was cut.
- Timeouts shorter than the dependency: 45 s vs Smartsheet latency, 16 s
  read vs 16 s wait (F-41, F-19). Rule: measure, then set timeout above p95
  with a write-ahead record before the remote call.
- Feature switches that are page-only: pm_today/pm_chase, earlier
  board_v2 (F-04). Rule: the service that answers checks the switch.
- The gate's tooling outside the gate: landing scripts in scratch, verdict
  parser quirks, unverdicted live packets (F-08, F-45, F-56).
- Documentation that says one write path when there are three (F-27, F-37).

## 3. Cascade effects and ordering

1. P-01 (route data-class audit) is read-only and informs P-24, P-20,
   P-08. Do it first; nothing lands from it until Griffin sees the table.
2. P-08 (hold page files, watch kg) must land before more Write Desk UI
   changes, or every later packet inherits the hole.
3. P-24 (owner checks, users-store write lock) before crews sign in at
   V-E/V-F, because the user population grows then.
4. P-06 step 0 (hub tests) before any hub refactor and ideally before the
   V-E hub window, so the window has a regression net.
5. P-20 (PO totals, write-ahead record, pinned templates) rides the next
   PO Generator Deploy now after the no-quote release proves out; not the
   same press (keep the release's blast radius small).
6. P-07, P-11 (tooling, deploy ergonomics) any time; they reduce the cost
   of everything above.
7. P-17 (Griffin's two actions: rotate the tunnel token, make the
   claude.ai board private) today; no dependency.

## 4. What could go wrong with the fixes

- Gating loopback reads can break Field's startup poll and pm-service's
  /api/field calls: the audit must list service-to-service callers (the
  V-E SECURITY read already named four) and keep them on an allow-list.
- Holding page files for held tools changes the landing order every
  builder brief assumes; HUB RUNBOOK s3 and the briefs must change in the
  same packet.
- A users-store write lock on a share with 1 s mtime granularity needs a
  version counter inside the file, not mtime.
- Splitting hub.py while the switch-over tool backs up "the NEW file, not
  a rollback" (RUNBOOK) means the first split needs a real rollback copy.
