# inbox

Put new files here: transfers, notes, anything Claude should read.

Then tell Claude **"file the inbox"**. It will:

1. Move each file into `transfers/<date>/` under a clear name. It never edits the raw files.
2. Merge anything new into `STATE.md` and update its "As of" line.
3. List any conflicts it resolved.
4. Commit and push.

When it's done, this folder holds only this README.
