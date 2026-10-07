# Plan index (draft; each plan becomes its own file once Phase 2 confirms the findings)

Every plan is a packet brief for HELM (IMPLEMENTATION) in Helm's own
ritual: base/staged/DIFF, README "STAGED ONLY", SHAS.txt, REVIEWS.md with
SECURITY-VERDICT: AWAITING, red-first tests with twins, mutants, SECURITY
read, Griffin's go where the standing OK does not apply. Fable writes the
brief; HELM owns sequencing, builders and landing. No plan here is final
until Phase 5 (validation with HELM and Griffin).

| Plan | Title | Findings | Gate | Why this order |
|---|---|---|---|---|
| P-01 | "This PC" data-class audit and route gating | F-01, F-20, F-23, F-36, F-43 | hub + tools; Griffin's go | Decides the trust model everything else sits on. Inventory first (read-only), then gate money/row-id/path routes behind sign-in, keep look-only health and counts open. |
| P-02 | /vantage mount hardening (CSP header, pages list, this-PC never a person) | F-02, F-03 | hub window (V-E) | Already in V-E; the plan only adds the surviving single-barrier mutant test and a served check. |
| P-03 | Feature registry: fail closed on unknown ids; server-side checks for pm_today/pm_chase | F-04 | pm-service (standing OK) + lib (five presses) | Small, closes a contract gap before more switches are added. |
| P-04 | CSP regression tests and pin hygiene (drop dual pin by 10-13; hub pages CSP) | F-05, F-48 | pm-service; hub for engine pages | Dated debt; cheap test. |
| P-05 | Retire or protect the W: static copy of PM Reports money views | F-06 | Griffin decision + pm-service | Data at rest on a share; needs an ACL answer first. |
| P-06 | hub.py decomposition behind a test net | F-07 | hub windows, several | Largest architectural item. Step 0 is a hub test suite (identity, access, this-PC, deploy, watcher) run against the current file; only then extract modules one window at a time. |
| P-07 | Promote and test the landing and verdict tooling (land_files.py, land_new_file.py, packetkit live-root guard, helm_verdict/record) | F-08, F-34, F-45 | tools (standing OK) | The gate's own tools need the gate. |
| P-08 | Held-tool page files held with the server; `?v=` on injected statics | F-09, F-35 | hub window | Removes the half-deployed UI window. |
| P-09 | Watcher coverage for field-service/vantage and startup ordering (Field after PM Reports) | F-10, F-12 | hub.json change | Small hub.json edit plus a health semantic. |
| P-10 | Observability: redacted error summaries in every /api/health, failed-Issue alert, correlation id, identify the once-a-minute caller | F-11, F-47, F-49 | per service | Makes the next incident diagnosable without Griffin reading logs by hand. |
| P-11 | Deploy ergonomics: preflight on down tools, one "Deploy all held" with per-tool preflight, verify hub/Write Desk run as the same user | F-13, F-14, F-24, F-46 | hub window | Reduces the single-person deploy cost. |
| P-12 | PO Generator test truth: refresh the release QA harness; cap-and-refuse tests for every truncation point | F-15, F-44 | po (held) | Keeps the money tool's tests honest. |
| P-13 | Lazy secrets and resource hygiene in shared libs (extract.py import-time secrets; po_lines.py workbook close) | F-16, F-31 | lib (five presses) + po | Small, mechanical, high leverage for testability. |
| P-14 | Leaderboard history write atomicity; GET without side effects | F-17 | pm-service | Correctness of a scoring record. |
| P-15 | One redraw-safe input pattern for all kg pages, with a shared test | F-18, F-42 | pm-service, hub static | Three incidents from one bug class. |
| P-16 | PM Reports load: shared bundle, cache headers, snapshot margin | F-19 | pm-service | Measured before/after. |
| P-17 | Griffin actions, no code: rotate the tunnel token; make the claude.ai board private; check the shop/field ticks for V-E | F-21, F-26 | Griffin | Listed so they are not lost. |
| P-18 | Builder-brief hardening: C: hygiene, time from `date`, ASCII-only REVIEWS writes via reviews_write.py | F-22, F-39 | process | Memory/brief text, no code. |
| P-19 | Job Setup write path: route through the Write Desk or give it its own reviewed credential; clean_prose control-char refusal | F-27, F-30 | jobsetup (held) + Griffin | Second write path with a shared secret. |
| P-20 | PO totals-by-label defect, pinned templates and excel_finish.ps1, Issue path write-ahead record | F-28, F-29, F-41 | po (held) | Money correctness. |
| P-21 | Glass uploads retention vs "never delete" | F-32 | glass (held) + Griffin | Policy decision then code. |
| P-22 | Receiving: group-folder search, ledger first receipt, PO number typing | F-33 | receiving (held) | Known broken user path. |
| P-23 | Documentation truth: TOOLS.md, SECURITY map, one limits table | F-37, F-50 | docs | Cheap, prevents the next wrong assumption. |
| P-24 | Write Desk owner checks on every editable sheet; session cookie and people-list protection | F-40, F-48 | write (held) + hub | Money write authorisation. |
| P-26 | Move Smartsheet, CompanyCam and CRM tokens out of user environment variables and URLs into the hub's local state store (kgsecrets.py) | F-63 | lib (five presses) + each service; Griffin | Same root as the this-PC trust: every local process inherits them today. |
