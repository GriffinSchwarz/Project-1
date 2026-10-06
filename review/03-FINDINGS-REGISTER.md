# Findings register (provisional, transcript-evidenced, code-unverified)

Severity is provisional until Phase 2 sees the code. "Evidence" cites the
research notes (review/research/) page numbers: M = helm-main-transcript-
notes.md. Each finding carries a plan id (P-nn) used in review/plans/.
Nothing here is an instruction to HELM; plans go out only after Phase 5
validation with HELM and Griffin.

## Severity key
CRITICAL = blocks safe operation today. HIGH = fix before the next wave of
users (crews at V-E/V-F). MEDIUM = next cycle. LOW = polish.

| id | Finding | Sev (prov.) | Evidence | Phase 2 verification | Plan |
|---|---|---|---|---|---|
| F-01 | "This PC" look-only access answers money-bearing routes without sign-in: GET /po/api/recent returned PO totals, vendors, Smartsheet row ids and UNC job-folder paths to a loopback request. Any local process (builder subagents included) can read it. | HIGH | M p59, Index 2 | List every hub route and every tool route reachable as this-PC; classify by data class (money, row ids, paths, PII). Read hub.py `_me`/`access()` ~3606-3681 and PO Generator server.py route guards. | P-01 |
| F-02 | This-PC auto-admin will become a signed person for Field once `identity: true` is set at V-E, making any local program a Vantage admin. SECURITY flagged; V-E must prove the negative. | MEDIUM (V-E SECURITY GO 20:24 UTC 10-06: tests P6/P7/P8 catch "treat loopback as a person"; one single-barrier mutant survives) | M p27, p28, p4; HELM transcript 20:24 | Read the V-E packet tests; confirm the surviving single-barrier mutant is covered after landing. | P-02 |
| F-03 | /vantage mount sends no CSP header and has no "pages" list; one wrong tick shows crews the board and the old prototype (which embeds school data). | HIGH | M p6, p33, p35, p48 | hub.json mount entry; V-E patch `hub-json-VE-patch.json`. | P-02 |
| F-04 | Feature switches are not uniformly server-side: PM Reports' pm_today/pm_chase are checked on the page only; `feature_gate()` lets unknown ids through, so the Write Desk had to write its own check. The registry contract ("a switch is a boundary") is violated by design drift. | MEDIUM | M p13, p54-56 | lib/kgfeatures.py, pm-service server.py routes for /api/today and /api/chase, write-service fixit_switch_on. | P-03 |
| F-05 | CSP regression gap: a mutant adding `https:` to PM Reports' script-src survived; a temporary dual OPS_SCRIPT_SHA pin must be removed by 10-13 and nothing enforces the date. | MEDIUM | M p18, Index 4 | pm-service server.py CSP builder; tests. | P-04 |
| F-06 | PM Reports writes a static copy of every PM's money views (app\PM Reports\data.js, ~1.75 MB) to the W: share every 15 min; its readership on the share is unknown and the "last opened" heartbeat cannot tell if anyone uses it. | MEDIUM (HIGH if the share is broadly readable) | M p18, p19, p31 | publisher.py; share ACL (Griffin/IT); decide retire. | P-05 |
| F-07 | hub.py is one ~374 KB file (>3,600 lines) with no hub test suite mentioned; identity, access, deploy, features, static serving and admin UI are in one unit. Every change is a hub restart with a public-address drop. | HIGH (maintainability, blast radius) | M p41, p58, Index 7 | Count routes/functions; find any engine tests; map sections. | P-06 |
| F-08 | Landing tools live in a scratch folder (engine\_staging\_scratch-helm-2026-09-28\land_files.py, land_new_file.py); land_files.py backup-folder name collides within one second (FileExistsError). Scratch folders are also where builders are told leftovers go. | MEDIUM | M p6, p58, Index 6 | Read both scripts; their tests (none mentioned). | P-07 |
| F-09 | Held-tool deploy window: page files of a held tool serve the instant they are copied while server.py waits for Deploy now, so buttons appear that do not work (09:47-14:00 on 10-06). Release 1 added a page-version marker for PO Generator only. | MEDIUM (UX + support load) | M p10, p12, p14, p17 | hub.json held-tool static handling; "hold-page-files-2" packet (exists?). | P-08 |
| F-10 | Hub restart watcher does not watch field-service/vantage/, so landing Vantage code does not restart Field; Field exposes a loaded-vs-on-disk self-check but nothing alerts on mismatch. A 30 s debounce means two-file landings can restart twice. | MEDIUM | M p24, p25-26, p30, p35 | hub.json watch globs; hub watcher code. | P-09 |
| F-11 | Observability: service logs sit in a protected folder Claude cannot read; the Write Desk batch-save abort (WinError 10053, 09:22 10-06) could not be diagnosed; health endpoints carry no error counters or last-error summaries. | MEDIUM | M p10, p39, Index 5 | Each service's /api/health; logging config. | P-10 |
| F-12 | Startup coupling: Field is red ~55-60 s after every hub restart because it waits for PM Reports' first snapshot; the hub reports it as unhealthy during that time. | LOW | M p58, Index 7 | field-service startup; health semantics. | P-09 |
| F-13 | Deploy now on a DOWN held tool skips preflight (compile check), so a broken held change can be deployed into a down tool with no check. | MEDIUM | M p58 | hub_deployed.py / hub.py deploy path. | P-11 |
| F-14 | A change under lib\ needs five separate Deploy now presses (all held tools watch lib\*.py); path spelling differs per tool (relative vs absolute W:). | LOW | M p58 | hub.json watch lists. | P-11 |
| F-15 | PO Generator release-1 QA harness is stale: 16 failures on both live and staged "suite-age failures"; the acceptance harness used is a copy inside a packet. Test truth is drifting from live code. | MEDIUM | M p2, p9 | _staging/2026-10-02-po-release-qa/run_acceptance.py vs live. | P-12 |
| F-16 | extract.py loads secrets at import time, so every import (tests, tools, SECURITY reads) must first redirect LOCALAPPDATA; a slip reads real secrets. | MEDIUM | M p7, p2 | PO Generator extract.py top-level. | P-13 |
| F-17 | Leaderboard: opening the page saves the day's score (a GET with a side effect); history file "written safely?" was asked by SECURITY and not answered in the transcript. | MEDIUM | M p32, p52 | leaderboard.py history write; atomicity. | P-14 |
| F-18 | Front-end state loss on redraw recurs: Home page 10-02 ("a redraw rebuilt the inputs before reading them"), Leaderboard 10-05 (typed prices wiped on refresh). Fixed case by case; no shared pattern or test. | MEDIUM (UX) | M p39, p40, p49 | kg/*.js redraw paths; AS_NOTE pattern in engine/static/home.html. | P-15 |
| F-19 | Performance: Smartsheet read ~16 s with no margin against the post-save wait; PM Reports loads 23 files (720 KB); Calendar and Quick views each fetch the same ~650 KB bundle. | LOW-MEDIUM | M p31, p19 | pm-service caching headers, bundle sharing. | P-16 |
| F-20 | pm-service `/pm/api/pm` lacks the not-signed-in check newer routes have and caps at 25 POs (model.py:935); newer features had to add parallel uncapped routes. | MEDIUM | M p27, p28, p52 | pm-service server.py route guards. | P-01 |
| F-21 | Data exposure outside Helm: the claude.ai 24186 board artifact shared "anyone with the link" carries Rev. 5 shop drawings; repeatedly flagged, still open. | HIGH (not code) | M p33, p46-47, p50 | Griffin action. | P-17 |
| F-22 | Process: builder subagents left six stray files on C: against rules; the main session cannot delete; recursive-search rule violations. | LOW | M p14, p17, p29 | n/a | P-18 |
| F-23 | Users store location is stated two ways (engine\users.json DPAPI envelope vs %LOCALAPPDATA%\KeyGlass); if it is on the W: share, the envelope is the only protection. | VERIFY | M p58, p34 | hub.py users store path. | P-01 |
| F-24 | "Hub and Write Desk run as the same Windows user" (needed for the notices file) is assumed, never verified. | LOW | M p59 | Scheduled task identity; child process env. | P-11 |
| F-25 | Chase-email scrub still copies "costing 85"; residual person-name risk accepted. Documented decision; residual only. | LOW | M p11, p13 | n/a | - |

## Strengths to preserve (so plans do not regress them)
- Packet ritual with red-first tests, twins, mutants, independent SECURITY read, sha-checked landings with backups and EXECUTION RECORDs.
- Fail-closed feature registry; limits in code not settings; columns by name/id; one write path (Write Desk) with preview, read-back and 30-day undo.
- Self-hosted assets; CSP with pinned inline scripts; identity headers stripped unless identity:true; Cloudflare-forwarded requests always sign in.
- Decisions and rules kept in dated, human-edited files (GUARDRAILS, DECISIONS) that Claude never writes.
