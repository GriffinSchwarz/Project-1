# Phase 2 code request (ready to send once the HELM channel works)

Ordered by review value. HELM (or Griffin via checks\code_backup.py output)
sends each file verbatim with its sha12 and line count. Secrets never:
nothing from %LOCALAPPDATA%\KeyGlass, no *.json under config\ that holds
tokens, no users store, no logs with row contents.

## Tier 1 - identity, access, deploy (hub)
1. engine/hub.json (whole file; 22 KB)
2. engine/hub.py: the sections for `_me`, `access()`, the this-PC rule
   (~3606-3681), the X-KG-* identity signing and stripping, `_inject`,
   static serving and cache headers, CSP handling per mount, the deploy /
   held-tool code, `/api/hub/features*`, the restart watcher (debounce,
   watch globs), request body caps, the Claude relay `/api/relay`. If
   sending the whole 374 KB file is easier, send it in ~60 KB parts.
3. engine/hub_deployed.py, engine/hub_security_light.py,
   engine/hub_shop_crew.py, lib/kghttp.py, lib/kgfeatures.py
4. checks/pre_restart_check.py, checks/security_check.py,
   checks/code_backup.py, engine/_staging/_lib/packetkit.py,
   engine/_staging/_scratch-helm-2026-09-28/land_files.py and
   land_new_file.py
5. Any test files for the hub (engine/tests? HELM/system/tests/*.py)

## Tier 2 - money paths
6. write-service/server.py, write-service/config.json (editable columns,
   limits), write-service/static/app.js
7. PO Generator/app: server.py, smartsheet_client.py, extract.py,
   filing.py, pocontinue.py, reissue.py, pobuild.py, poown.py,
   poconfirm.py, stamp_quote.py, jobs.py, helm_claude.py,
   excel_finish.ps1, config/settings.json (redacted), static/app.js,
   static/index.html
8. lib/po_lines.py, lib/po_read.py
9. Job Setup desk: server.py, kgjob.py, sheetdoor.py, tool/Smartsheet.py,
   tool/PmRows.py, sp_lane.py (redact owner lists)

## Tier 3 - reads and pages
10. pm-service: server.py, model.py, smartsheet_read.py, publisher.py,
    leaderboard.py, board.py, board2.py, data_problems.py, pm_today.py,
    config.json (redacted), static/ops.html, static/leaderboard.html,
    static/kg/*.js and *.css
11. field-service: server.py, config.json, vantage/api.py, reader.py,
    marks.py, progress.py, photo_import.py, MARKS-CONTRACT.md
12. receiving-service: server.py, po_read.py, packet.py, ack_read.py
13. glass-service: server.py, glass.py, uploads_owner.py, rules.json
14. pulse-service and shop-service server.py; engine/static/helm-bar.js,
    home.html, admin.html, brand/kg-nav.js, kg-theme.js

## Tier 4 - rules and state docs
15. GUARDRAILS.md, SECURITY.md (root), HUB RUNBOOK.md, WRITE RULES.md,
    TOOLS.md, GOALS.md, DECISIONS.md (last 30 days), docs/BACKLOG.md,
    CLAUDE.md, AGENTS.md
16. The latest TRANSFER / HANDOFF documents in docs/TEAMS and docs/
17. `python --version`; `pip list` (or the statement "stdlib only");
    the scheduled task definition for "Key Glass Hub" (XML export,
    redacted)

## Also wanted (no code)
- Output of /api/hub/state (redact e-mails) and each tool's /api/health.
- hub.log line counts by level for the last 7 days (counts only).
