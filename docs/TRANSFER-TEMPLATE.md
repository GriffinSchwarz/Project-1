# Shorter transfers: write a DELTA, not a full copy

Today's eight transfers add up to about 156 KB, and most of it repeats itself. Most of that repetition came from sessions re-stating the same live shas, rules and queue.

Now `STATE.md` holds all of that once. A transfer only needs to say **what changed since STATE.md's "As of" line**.

## Paste this into a session when it reaches a stopping point

```
Write a DELTA transfer against STATE.md (the copy in the GitHub repo, "As of" <paste the line>).
Include ONLY:
1. Changed since then: what landed, was lined, cut, superseded or parked - one line each, with shas.
2. Griffin's new decisions, verbatim, with the time.
3. New questions for Griffin.
4. New rulings or gotchas that a fresh session would get wrong without.
5. Where you stopped, and the very next step.
Do not repeat anything already in STATE.md. Plain ASCII. Aim for under 80 lines.
Save it as docs\TEAMS\TRANSFER <yyyy-mm-dd> <hhmm> - <SESSION>.md, with the time taken from the clock.
```

## Then

1. Upload the file to `inbox/` (see `HOW-TO-UPLOAD.md`).
2. Tell Claude "file the inbox".
3. Start the new session with: *"Read STATE.md in the repo, then the newest transfer in transfers/. Continue from 'Next step'."*
