# How to get files into this repo

There are three ways. The easiest is first.

> **Before you upload anything about work:** anyone on the internet can read a
> public repo. To make it private, open the repo on GitHub and go to
> **Settings** > **General**. Scroll to **Danger Zone**, click
> **Change repository visibility** and choose **Private**.

---

## 1. Attach the files to Claude (easiest, and what you did today)

1. Open the Claude session for this repo.
2. Drag the files into the message box, or click the paperclip.
3. Type: **"file these"**.

Claude saves the files in the right folder, updates `STATE.md`, commits and pushes.

- Good for: transfers, notes, and a handful of documents.
- Not good for: large binaries, or hundreds of files.

---

## 2. GitHub website (nothing to install)

1. Go to the repo page on github.com.
2. Click the **`inbox`** folder.
3. Click **Add file** > **Upload files**.
4. Drag files from File Explorer onto the page. In Chrome or Edge you can drag a whole folder.
5. At the bottom, under **Commit changes**:
   - Write a short message, for example `Add transfers 2026-09-26`.
   - Leave **Commit directly to the `main` branch** selected.
   - Click **Commit changes**.
6. In a Claude session, type: **"file the inbox"**.
   Claude moves the files into `transfers/<date>/`, merges them into `STATE.md`, and commits.

Limits: up to 100 files per upload and 25 MB per file.

The upload page may not apply `.gitignore`, so look at what you are dragging before you commit (see "What never goes in" below).

---

## 3. Git from your PC (later, and check with IT first)

Git for Windows is already on the PC; Claude Code's Git Bash uses it. A clone on W: can push changes with two commands. But GitHub pushes would be a new kind of network traffic from that machine, and Huntress has already flagged Helm once. **Ask IT before using this.**

Once IT says yes, in Git Bash:

```bash
cd "/w/AI Procedures"
git clone https://github.com/GriffinSchwarz/Project-1.git "Helm-notes"   # one time
cd "/w/AI Procedures/Helm-notes"
git pull                                         # get the latest first
cp "/w/AI Procedures/HELM/system/docs/TEAMS/TRANSFER 2026-09-26 - IMPLEMENTATION.md" inbox/
git add inbox
git commit -m "Add transfer 2026-09-26"
git push
```

---

## What never goes in (even in a private repo)

| Never upload | Why |
|---|---|
| Secrets: `secrets.json`, `*.token`, `*.key`, `*.secret`, passwords, anything from `%LOCALAPPDATA%\KeyGlass` | Anyone with repo access could use them |
| Real data: PO workbooks, snapshots, Smartsheet exports, customer files, bid prices | Company data stays in the company |
| `_scratch*` and `_backups` folders | Noise, and they sometimes hold real data |
| Private Claude transcripts | Same rule as on W: |

`.gitignore` blocks the common ones when you use git (option 3).

---

## What to upload next (most useful first)

1. The transfers from each new session (IMPLEMENTATION and SECURITY) at every stopping point. Use the short format in `docs/TRANSFER-TEMPLATE.md`.
2. The rule files: `GUARDRAILS.md`, `SECURITY.md`, `DECISIONS.md`, `GOALS.md` and `docs/BACKLOG.md` from the system root.
3. The full PM-DESK transfer. Only its one-page pointer came through today.
4. Later, if Claude should fix code directly: the code itself. Take the output of your code backup (`checks\code_backup.py`), not the live folder, so that secrets and data are already excluded.
