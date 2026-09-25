"""reviews_write.py - write a packet's REVIEWS.md without the usual slips.

Every write this tool makes:
  * stamps the time from the clock at the moment of writing (never typed);
  * accepts printable ASCII + LF only (CRLF in the input becomes LF;
    TAB, BEL, a middle dot etc. are refused with their position);
  * refuses any path with a _scratch* or _backups* folder in it
    (the "ls *packet* | tail -1 picked a _scratch folder" slip);
  * refuses a REVIEWS.md with CRLF line ends (it writes LF only);
  * appends only - except `verdict`, which replaces exactly ONE
    "<WHO>-VERDICT: AWAITING" placeholder line and refuses if two exist
    (the "GO written under a stray AWAITING" slip);
  * re-reads the file and checks the old bytes survived unchanged.

Usage (python -B tools/reviews_write.py ...):
  hash    <packet_dir>                                    sha256[:12] of each file
  append  <packet_dir> --who SECURITY (--text T | --file F)
  verdict <packet_dir> --who SECURITY --verdict GO (--text T | --file F)

Use --file for anything with a backslash or more than one line: text typed
into a shell is where "\\t" turned into a TAB before.
"""
import argparse
import datetime
import hashlib
import os
import sys

REVIEWS = "REVIEWS.md"
BLOCKED = ("_scratch", "_backups")
VERDICTS = ("GO", "HOLD")


class Refused(Exception):
    pass


def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def read(path):
    with open(path, "rb") as f:
        return f.read()


def blocked_part(path):
    for part in os.path.abspath(path).replace(os.sep, "/").split("/"):
        if part.startswith(BLOCKED):
            return part
    return None


def reviews_path(packet):
    part = blocked_part(packet)
    if part:
        raise Refused("refusing a path inside %s: %s" % (part, packet))
    path = os.path.join(os.path.abspath(packet), REVIEWS)
    if not os.path.isfile(path):
        raise Refused("no %s in %s" % (REVIEWS, packet))
    return path


def clean(text):
    text = text.replace("\r\n", "\n").strip("\n")
    if not text.strip():
        raise Refused("empty text")
    for i, ch in enumerate(text):
        if ch != "\n" and not (" " <= ch <= "~"):
            raise Refused("character %r at position %d is not printable ASCII" % (ch, i))
    return text


def load(path):
    old = read(path)
    if b"\r" in old:
        raise Refused("%s has CR bytes; this tool writes LF only - fix by hand first" % path)
    return old


def commit(path, old, new, keep):
    """Write new, then prove it landed and that `keep` (old bytes) survived."""
    with open(path, "wb") as f:
        f.write(new)
    back = read(path)
    if back != new:
        raise Refused("re-read does not match what was written: %s" % path)
    for piece in keep:
        if piece not in back:
            raise Refused("old content changed while writing: %s" % path)


def joined(old, block):
    sep = b"" if not old or old.endswith(b"\n") else b"\n"
    return old + sep + b"\n" + block + b"\n"


def cmd_append(packet, who, text):
    path = reviews_path(packet)
    old = load(path)
    block = ("### %s %s\n\n%s" % (who, now(), clean(text))).encode("ascii")
    new = joined(old, block)
    commit(path, old, new, [old])
    return block.decode("ascii")


def cmd_verdict(packet, who, verdict, text):
    if verdict not in VERDICTS:
        raise Refused("verdict must be one of %s" % ", ".join(VERDICTS))
    path = reviews_path(packet)
    old = load(path)
    placeholder = ("%s-VERDICT: AWAITING" % who).encode("ascii")
    lines = old.split(b"\n")
    hits = [i for i, line in enumerate(lines) if line.strip().startswith(placeholder)]
    if len(hits) > 1:
        raise Refused("%d '%s' lines (at lines %s) - leave one, by an appended note, first"
                      % (len(hits), placeholder.decode(), ", ".join(str(i + 1) for i in hits)))
    block = ("%s-VERDICT: %s %s\n%s" % (who, verdict, now(), clean(text))).encode("ascii")
    if hits:
        i = hits[0]
        new = b"\n".join(lines[:i] + [block] + lines[i + 1:])
        keep = [b"\n".join(lines[:i]), b"\n".join(lines[i + 1:])]
    else:
        new = joined(old, block)
        keep = [old]
    if any(line.strip().startswith(placeholder) for line in new.split(b"\n")):
        raise Refused("a placeholder would remain")
    commit(path, old, new, keep)
    return block.decode("ascii")


def cmd_hash(packet):
    part = blocked_part(packet)
    if part:
        raise Refused("refusing a path inside %s: %s" % (part, packet))
    root_dir = os.path.abspath(packet)
    if not os.path.isdir(root_dir):
        raise Refused("not a folder: %s" % packet)
    out = []
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = sorted(d for d in dirs if not d.startswith(BLOCKED) and d != "__pycache__")
        for name in sorted(files):
            p = os.path.join(root, name)
            sha = hashlib.sha256(read(p)).hexdigest()[:12]
            out.append("%s  %s" % (sha, os.path.relpath(p, root_dir).replace(os.sep, "/")))
    return out


def text_arg(args):
    if args.file:
        with open(args.file, "rb") as f:
            raw = f.read()
        try:
            return raw.decode("ascii")
        except UnicodeDecodeError as e:
            raise Refused("%s is not ASCII (byte %d)" % (args.file, e.start))
    return args.text


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    h = sub.add_parser("hash")
    h.add_argument("packet")
    for name in ("append", "verdict"):
        p = sub.add_parser(name)
        p.add_argument("packet")
        p.add_argument("--who", default="SECURITY")
        if name == "verdict":
            p.add_argument("--verdict", required=True, choices=VERDICTS)
        g = p.add_mutually_exclusive_group(required=True)
        g.add_argument("--text")
        g.add_argument("--file")
    args = ap.parse_args(argv)
    try:
        if args.cmd == "hash":
            print("\n".join(cmd_hash(args.packet)))
        elif args.cmd == "append":
            print(cmd_append(args.packet, args.who, text_arg(args)))
        else:
            print(cmd_verdict(args.packet, args.who, args.verdict, text_arg(args)))
    except Refused as e:
        print("REFUSED: %s" % e, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
