# Phase 1 - Helm system map (as understood on 2026-10-06, before code access)

Status: DRAFT from secondhand evidence. Every fact below comes from the
HELM main session transcript (2026-10-05 11:51 UTC to 2026-10-06 20:06 UTC)
or the archived desk sessions, as mined into review/research/. Nothing has
been checked against the code. Items marked [VERIFY] are the questions
Phase 1 must settle with HELM before Phase 2 findings are trusted.

## 1. What Helm is

Helm is an internal web hub for Key Glass, a Florida commercial glazing
subcontractor. It runs on one Windows PC (hostname KG-GSCHWARZ, Griffin's
desk) as a Windows scheduled task "Key Glass Hub", listens on
127.0.0.1:8888, and is reachable from outside through a Cloudflare tunnel
at helm.keyglassapps.fyi. Office staff (five or six PMs, Missy, Griffin as
the only admin) and field crews use it from browsers and phones.

Its job is to put the company's operational data (the Smartsheet Purchase
Order Log and six other sheets, CompanyCam photos, job folders on the W:
share, drawings) behind one sign-in, with controlled write paths and
Claude-assisted reading of documents. Built by Claude Opus 5.5 in Claude
Code sessions on that PC between 2026-09-12 and now, with a strict
packet-and-review change process.

## 2. Topology

```
 phones / office PCs                         Griffin's PC (KG-GSCHWARZ)
 ----------------------                      ---------------------------------
 helm.keyglassapps.fyi --cloudflared--> hub.py :8888 (engine/, scheduled task)
                                           |  mounts from engine/hub.json
                                           |  sign-in, roles, ticks, Helm bar
                                           |  X-KG-* identity headers + proxy
                                           |  secret to tools with identity:true
                                           +-- /pm      pm-service  (PM Reports, Leaderboard, Pulse)
                                           +-- /write   write-service (Write Desk: the ONE Smartsheet write path)
                                           +-- /po      PO Generator (W:\AI Procedures\PO Generator\app)
                                           +-- /jobsetup Job Setup desk (System files\Job Setup Agent\desk)
                                           +-- /field   field-service :8796 (CompanyCam data, Vantage API)
                                           +-- /vantage static vantage-preview\ (board, old prototype)
                                           +-- /receiving, /shop, /glass, /insights, /public,
                                               /map, /board, /search, /deadlines, /calc, /measure
                                           |
            Smartsheet API <---------------+ (reads: pm-service snapshot; writes: Write Desk
                                           |  service-account token; PO Generator issue path)
            CompanyCam API <---------------+ (read-only, field-service)
            Claude (claude -p, Griffin's  <-+ (Helm relay / helm_claude.py; PO Generator reads,
              signed-in Claude on the PC)     Job Setup, planned Vantage plan reading)
            W: share (\\KGDC) <------------+ (code, packets, logs, job folders, PO drafts)
            %LOCALAPPDATA%\KeyGlass <------+ (secrets, users store, features.json, hub.log,
                                              Write Desk logs, pm_people.json; off-limits to Claude)
```

Hub tool ids seen in /api/hub/state: pm, map, board, po, jobsetup, field,
write, insights, public, pulse, glass, receiving, shop, search, deadlines,
calc, vantage, measure (18). Hub version string "2.2 (2026-09-16)".

## 3. Components

| Component | Where | Role | Notes |
|---|---|---|---|
| hub.py | engine/ | Reverse proxy, static server, sign-in, roles/ticks, feature registry, admin pages, held-tool deploy, self-switch-over | Single file, ~374 KB (sha d321298de8a2 on 10-05). Functions named: `_me`, `access()`, `_inject` (Helm bar), features routes ~4248. |
| hub.json | engine/ | Mount table: id, mount path, dir or service, identity flag, data_files, deploy timings, owner_email | 22 KB. `/vantage` mount ~line 447. |
| hub_deployed.py | engine/ | Held-tool fingerprint logic | |
| lib/kghttp.py | lib/ | Shared HTTP helpers for services | Watched by all five held tools (a lib change needs five Deploy now presses). |
| lib/kgfeatures.py | lib/ | Service-side read of the feature registry | Fail-closed, os.stat per call, test override needs two env vars. |
| pm-service | pm-service/ | PM Reports: ops board, Leaderboard, Data problems, Pulse, billing, bids, weekly meeting | Non-held, auto-restarts on disk change. Reads Smartsheet into a snapshot (~16 s read). Inline script pinned by sha in CSP (OPS_SCRIPT_SHA). |
| write-service | write-service/ | Write Desk: propose -> preview -> approve -> execute one cell at a time -> read back -> 30-day undo | Held. Service-account token to 7 sheets. All limits in server.py. Logs in %LOCALAPPDATA%. |
| PO Generator | PO Generator/app | PM drops quote + takeoff, Claude reads them (caps $1.50/read, $15/person/day), builds the PO workbook from vendor templates, issues to Smartsheet, files PDFs on W: | Held. Modules: server, smartsheet_client, extract (loads secrets at import), filing, pocontinue, reissue, pobuild, mine_history, poown, poconfirm, stamp_quote, jobs, helm_claude, excel_finish.ps1. Logs: smartsheet-writes.jsonl, po-audit.csv, reads.log, _drafts/. |
| Job Setup desk | System files\Job Setup Agent\desk | Seven-step job setup with a `claude -p` run; SP (small project) lane | Held. sp_lane.py/json. |
| field-service | field-service/ (port 8796) | Crew tool over CompanyCam data; now hosts Vantage API (vantage/api.py, reader.py, marks.py, progress.py, photo_import.py) | Non-held until V-E. Hub watcher does not watch vantage/ subfolder. Red ~1 min after every hub restart. |
| vantage-preview | vantage-preview/ | Static: landing (meta refresh to board), board/ (24186 completion board, self-hosted kit + 19 plan JPEGs), old.html (prototype) | Access: admin or "vantage" tick. No CSP header until V-E. |
| receiving-service, shop-service, glass, insights, pulse, public, map, board, search, deadlines, calc, measure | various | Named only in this period | [VERIFY] purpose, held status, code size. |
| checks/ | checks/ | pre_restart_check.py, backup_state.py, code_backup.py, ai_probe.py, ask.py, billing_months.py, cert_expiry.py, column_usage.py | Operational scripts. |
| Landing tools | engine/_staging/_scratch-helm-2026-09-28/ | land_files.py, land_new_file.py (sha-checked copy + _backups) | Live tooling in a scratch folder. |

## 4. Identity and access (as described)

- Sign-in at the hub; users store is a DPAPI envelope (`engine\users.json`
  per HUB RUNBOOK; subagent briefs say %LOCALAPPDATA%\KeyGlass) [VERIFY].
- Roles: admin, PM, staff, ops, shop, field. Per-user "ticks" (Field,
  Vantage, ...) set on Admin -> People. Griffin is the only admin.
- "This PC" auto-admin: a loopback request with no forwarding headers and a
  local Host name is treated as admin (hub.py ~3606-3610, ~3677-3681).
  Cloudflare always adds forwarding headers, so tunnel visitors sign in.
  Known consequence: any program on the PC is admin for look-only routes.
  SECURITY flagged that once Field gets identity:true the hub must not
  sign the this-PC admin as a person for Field.
- Hub-to-tool identity: tools with `identity: true` receive X-KG-* headers
  (email, role) plus a proxy secret; the hub strips inbound X-KG-* headers
  for every other tool. field-service `person_of()` trusts only the signed
  identity; "loopback is never a person".
- Feature switches: hub writes %LOCALAPPDATA%\KeyGlass\hub\features.json;
  services read it via kgfeatures (fail closed). Write Desk checks
  `lb_fixit` server-side with its own check because `feature_gate()` lets
  unknown ids through. PM Reports' `pm_today`/`pm_chase` are checked on the
  page only.
- Money rules live in GUARDRAILS.md (four approved exceptions; PO Amount
  $1 to $1,000,000, 20-row batches, rehearsal first, one approver, refused
  on received/Complete/VOID). Limits are in code, not settings, on purpose.

## 5. Data stores

| Store | Owner | Readers | Notes |
|---|---|---|---|
| Smartsheet PO Log (41->42 columns) + 6 sheets | Smartsheet | pm-service (snapshot), Write Desk, PO Generator, Receiving, Job Setup, Pulse | Columns by name/id never position. New "POGen Ref" column 10-06. |
| pm-service snapshot + W: static copy (app\PM Reports\data.js, 1.75 MB, every 15 min) | pm-service | PM Reports pages; the W: copy holds every PM's money views | Retire if unused (open). |
| Leaderboard history file | pm-service | Leaderboard | In protected folder; "written safely?" asked by SECURITY. |
| pm_people.json | Griffin (hand-written) | Write Desk, pm-service (acts_for) | Hostile-file guards added after a 200 KB nested file crashed the board. |
| features.json, hub.log, deployed/<id>.json, users-store.json | hub | services (features only) | %LOCALAPPDATA%\KeyGlass\hub. |
| PO Generator logs and _drafts | PO Generator | Audits | reads.log holds model and round per read; drafts may hold prices. |
| Vantage maps (field-service/vantage/maps/<job>/v1), event store (planned) | field-service | Vantage API | Event store location (W: vs local) was an open SECURITY question. |
| Job folders on \\KGDC\KeyGlass\Projects\Active\... | W: share | PO Generator filing, Receiving | UNC paths appear in API answers. |

## 6. Change process (the system's strongest asset)

Packet in `<service>/_staging/<date>-<name>/`: base/, staged/, DIFF, README
("STAGED ONLY - not live", landing order, undo), SHAS.txt ("Written ..."),
REVIEWS.md (line 1 "SECURITY-VERDICT: AWAITING"), tests red-first with a
positive "twin" per refusal test, N mutants. A SECURITY subagent (opus)
re-runs tests, adds its own mutants, appends `## SECURITY-READ` +
`SECURITY-VERDICT: GO|FIX|BLOCK`. Builder appends "BUILDER RE-CUT" under
each FIX. IMPLEMENTATION lands with land_files.py (sha12 of live must
equal base; _backups copy), appends an EXECUTION RECORD, proves "as
served" by curl. Held tools need Griffin's "Deploy now"; the hub needs
"Switch Helm over" (120 s quiet, 600 s force, 30 min give-up) or
Stop-Process + Start-ScheduledTask. "Standing OK" (DECISIONS 2026-10-02):
a SECURITY-GO packet on a non-held, non-hub tool with no new write, money,
sign-in or outside path may land without Griffin's press.

## 7. Stack (partial) [VERIFY all]

Python 3 (version unknown), apparently stdlib-heavy (own HTTP lib
kghttp.py; no framework named). Front end: hand-written HTML/CSS/JS with a
shared "kg" theme kit (self-hosted Barlow/Inter fonts, light/dark/sun/large
modes), no framework named. Excel via COM/PowerShell (excel_finish.ps1).
Headless Edge for page tests. Claude via `claude -p` (Claude Code CLI) on
Griffin's login, not an API key. Smartsheet via a service-account token
(Write Desk) and the Smartsheet MCP connector (IMPLEMENTATION only).
CompanyCam read-only token. Cloudflare tunnel (cloudflared). Windows
scheduled task for the hub; tools run in the hub's job object.

## 8. In flight on 2026-10-06 (do not plan over these)

- PO Generator: POGen Ref column change copied, not deployed; no-quote +
  More info packet in SECURITY review; one Deploy now ships all three.
- Vantage: V-A, V-B, V-C, V-D live; tab swap landed 15:22 EDT; V-E, V-F,
  V-H building in parallel (hub restart, Field becomes held, CSP + pages
  list on /vantage); GUARDRAILS row for plan sheets pending Griffin.
- PM Reports: pm-fixes, batch undo, Today + chase landed 10-06; pick-many
  and weekly sheet next; dual CSP pin to drop by 10-13.

## 9. Questions for HELM (Phase 1 close-out)

1. Where is users.json really stored, and who can read it?
2. Full mount table with access rules (hub.json), and which tools have
   identity:true today.
3. Which routes are reachable as "this PC" without sign-in, and which of
   them carry money, row ids or UNC paths (the /po/api/recent case).
4. hub.py structure: how many routes, how many lines, what sections; is
   there any test suite for the hub itself?
5. Python version and any third-party packages; how kghttp.py serves
   (threads? one request at a time?); request timeouts.
6. Logging: levels, rotation, what is in hub.log vs per-service logs; can
   Claude read any of them (today: no, protected folder).
7. Backups: what backup_state.py and code_backup.py cover, frequency,
   restore drill ever done?
8. What happens on PC reboot: scheduled task start, tunnel, held tools
   staying down until Deploy now?
9. Concurrency: pm-service snapshot read (16 s) vs save wait; Write Desk
   lock; PO Generator "issuing" counter; any shared-state races?
10. GOALS.md success criteria, docs/BACKLOG.md top items, SECURITY.md.
