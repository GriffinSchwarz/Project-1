# HELM main transcript notes — part 3

Source: Claude Code Remote session `session_0186ohJrC2NTxhriPAyRvj8a` ("HELM - main system").
Starting cursor: before_id = `f13672e8-fdc6-4d7e-a83a-f1b538f113f7` (the first_id of the earliest page covered by part 2, 2026-10-02 15:34 UTC).
Paging direction: BACKWARD in time toward the session start (2026-10-01 02:15 UTC). Page 1 is the latest, later pages are earlier.
Kinds read: user, assistant. Secrets, codes, contact details and PO dollar amounts deliberately omitted.

## Page 1 (times 15:30-15:34 UTC, 2026-10-02)
Mostly a context-compaction summary plus the PO 14954 recovery hand-off. Facts:
- **PO 14954 incident (SP26-150, Aldora)**: `smartsheet_client.create_po_row` POST timed out at 45 s but Smartsheet created the row; `api_issue` (server.py ~line 1199) aborted, so no amount/due date, no filing, no logs. Row exists on PO Log with Amount/Due Date blank. Recovery needs 4 answers from Missy (due date, descriptor, quote ref, quote file). **Missy must not press Issue again** (would create a second PO number 14955).
- **PO reliability audit findings** (docs/AUDIT/2026-10-02 - PO Generator reliability audit.md): (1) create timeout aborts silently (1 of 8 since 09-14); (2) failure after filing VOIDs a filed PO; (3) no server in-flight guard; "Nothing was issued" button can lead to a double number; (4) "Try again" wording; (5) po-audit.csv header has 14 names vs 15 values.
- Griffin decisions (DECISIONS.md 2026-10-02 11:3x): YES to a "POGen ref <draft id>" tag in PO Log Notes cell; YES to fixing po-audit.csv header (backup, header only).
- Reliability packet builder brief: on timeout/5xx after create, re-read newest PO Log rows for the exact tag; 1 match -> continue; 0 -> do not re-create, bounded re-checks then hand off; 2+ -> stop. Server-side "being issued" guard per draft; on-disk record of each Issue attempt (draft id, stage, row id, PO number, outcome) under app logs; never void a filed PO.
- Recovery packet `W:\AI Procedures\PO Generator\app\_staging\2026-10-02-po-14954-recovery\` (recover_14954.py, README, REVIEWS.md AWAITING, tests 23/23); exit codes 0 ready/done, 2 refused, 3 answers missing, 4 part-way. Refuses if code changed since build or row changed; second apply refuses.
- Helm Asks limits (engine/hub.py line 362-363): ASKS_TITLE_MAX 120, BODY 2000, NOTE 300, FROM 80, CHOICE 24 chars, choices 2-4. `engine/asks.py` is the sanctioned sender (create/status/wait; --to-email or --to-role admin/ops/staff/shop/field).
- Live shas at that moment: PO Generator server.py 3f94fd52530b, smartsheet_client.py 139f7d27e886, filing.py f2cc21a96581, poconfirm.py bc37e29d1cac, poown.py fad26a17696e, reissue.py 737ae71e5518, static/app.js e6c080ceea0a, static/index.html ec74072af685; pm-service server.py ad8edf1bcd98, bid_board.py a64b9c6b7526, leaderboard.py 2725c6a2aba1, pulse_read.py d36ec1828a8e; write-service server.py 8bd6375001cd; glass-service/server.py 395e9402b0ea (hold fix, Deploy pending); receiving-service/server.py dd0b7bff7549 (staged 6ad7c4f9df42); Job Setup desk server.py d6ac818dd263, index.html 29d6019f7ef8; hub.json 0cd7795ea6db.
- Logs: PO Generator `W:\AI Procedures\PO Generator\logs\` (po-audit.csv, po-refusals.jsonl, smartsheet-writes.jsonl, _drafts\*.xlsx expire ~2 h); hub run logs `%LOCALAPPDATA%\KeyGlass\hub\logs\<id>.log`.
- Smartsheet sheet ids: PO Log 7514082682136452, Upcoming Bid List 6246400938796932, Billings 6681042904999812, Small Job 7045971243755396, Field Measurements 6288997667000196 (56 columns).
- Held tools (po, jobsetup, write, glass, receiving) change only via Griffin's "Deploy now"; the session's browser tab is "this PC" look-only and deploy/restart APIs return 403 for it. Non-held services restart themselves after a quiet period. Hub restart only off-hours after `checks/pre_restart_check.py` SAFE.
- Standing OK (DECISIONS 2026-10-02 11:0x): session may land SECURITY-GO packets only on non-held, non-hub tools with no new write/money/sign-in/outside-service path.
- Landing scripts in `engine/_staging/_scratch-helm-2026-09-28/`: land_files.py, land_new_file.py, backup_kit.py, bump_stamp.py.
- Standing security rules restated: never delete/move; read-only by default (propose -> preview -> named approval -> execute -> verify -> 30-day undo); person takes last step on money/anything leaving the company; never read %LOCALAPPDATA%\KeyGlass secret files (users.json, passwords, sessions, codes, proxy.secret, asks.key, tokens); Smartsheet structure changes only after SECURITY review and made by Griffin; no new scheduled tasks/servers/listeners without IT; no scratch on C:; no recursive walks of drive roots.
- Agent slips logged: stray `desk/_staging/2-sp-lane-1-2-SUPERSEDED-placeholder.txt`, empty `docs/.v2_2d_new.txt`, `C:\Users\...\Temp\x`, `/tmp/o1.txt`, `guide_cmp.py` in scratchpad. Packets returned FIX and re-cut: bid-board (-2,-3), SP lane (-1-2..-1-4 for $10k rule G1), hold-page-files-2, leaderboard-improved.
- "This PC" sees Data problems and Billing in the menu (recorded as matching the pages themselves).

## Page 2 (times 15:30-15:30 UTC, 2026-10-02) — only 4 user/assistant events in the page
- Audit agent "Audit PO Generator for failure modes" result (report `W:\AI Procedures\HELM\system\docs\AUDIT\2026-10-02 - PO Generator reliability audit.md`, written 11:27 local; helper `_scratch-po-audit\logscan.py`, read-only, no fix staged):
  - Finding 1: a create that times out after Smartsheet made the row stops Issue with no recovery, no log line, no void (= 14954). Error ref 0d4c1046 is this timeout, not the AttributeError. 1 of 8 creates since 09-14.
  - Finding 2: any failure after filing (PO Amount write, vendor list save, audit CSV) marks the row VOID while the PO files stay in the job folder. 0 so far. Could be triggered by someone having `po-audit.csv` open in Excel.
  - Finding 3: no server "being issued" guard; two presses, two tabs, or the "Nothing was issued - I will check totals again" button can take two numbers; that button shows even while Issue is still running or after a timeout. 0 seen.
  - Finding 4: every Issue error says "try again" (14954 got exactly that); the 2-hour draft clean-up deletes the only copy of a half-issued PO's content.
  - Finding 5: `po-audit.csv` has 14 column names but the 3 newest of 10 rows carry 15 values (PDF path never added to header).
  - Already fixed in live code: "'str' has no attribute 'get'" crash (2x on 09-29) and "AI reader is unavailable" error; neither wrote to Smartsheet.
  - Timing: a normal create takes 10-20 s (one measurable create, PO 14950, ~20 s), so the 45 s limit is only 2-3x normal. Raising to 90 s makes it rarer but cannot stop it. Create must never be retried blind.
  - Reissue mostly safe: files first, writes PO Log last, re-reads row first, has "Finish the log update"; two low-level gaps in the report.
  - Fix plan: (1 M) timed-out create re-reads PO Log and completes or hands off; (2 M) server-side in-flight guard + on-disk record of each Issue surviving restarts; hide "Nothing was issued" while unsure; (3 M) never VOID a filed PO after number taken; (4 S) errors after a number was taken say so and hold the page; (5 S) logs with times and Smartsheet call durations; (6 S) handle Excel hanging; (7 S) safe writes for config files; (8 S) fix csv header (needs named approval, changes a W: data file); (9 S) small same-type crashes + what happens when a PO is moved out of the "job not on list" folder.
  - Not checkable: Smartsheet itself, whether anyone keeps po-audit.csv open in Excel, Cloudflare's timeout.
- Griffin asked via AskUserQuestion: Notes tag yes/no (six-field fallback match: job, vendor, materials, order date, initials, empty amount); CSV header fix yes/leave.

