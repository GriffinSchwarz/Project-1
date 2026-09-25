"""Tests for reviews_write.py.

Run: python -B -W error::SyntaxWarning tools/test_reviews_write.py
Scratch goes to tools/test-runs/ (or RW_TEST_DIR) - never the system TEMP,
and nothing is deleted.
"""
import datetime
import os
import re
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import reviews_write as rw  # noqa: E402

BASE = os.environ.get("RW_TEST_DIR") or os.path.join(HERE, "test-runs")
STAMP = re.compile(r"\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}")


def packet(body=b"# REVIEWS\n\nSECURITY-VERDICT: AWAITING\n", name="2026-09-25-demo"):
    os.makedirs(BASE, exist_ok=True)
    d = os.path.join(tempfile.mkdtemp(dir=BASE), name)
    os.makedirs(d)
    with open(os.path.join(d, "REVIEWS.md"), "wb") as f:
        f.write(body)
    return d


def reviews(d):
    return rw.read(os.path.join(d, "REVIEWS.md"))


class Append(unittest.TestCase):
    def test_appends_block_with_clock_time_and_keeps_old_bytes(self):
        d = packet(b"# REVIEWS\nold line\n")
        before = datetime.datetime.now().replace(microsecond=0)
        rw.cmd_append(d, "SECURITY", "delta read done")
        after = datetime.datetime.now()
        data = reviews(d)
        self.assertTrue(data.startswith(b"# REVIEWS\nold line\n"))
        stamp = STAMP.search(data.decode()).group(0)
        t = datetime.datetime.strptime(stamp, "%Y-%m-%d %H:%M:%S")
        self.assertTrue(before <= t <= after)
        self.assertTrue(data.endswith(b"delta read done\n"))

    def test_adds_newline_when_file_lacks_one(self):
        d = packet(b"no newline at end")
        rw.cmd_append(d, "SECURITY", "x")
        self.assertTrue(reviews(d).startswith(b"no newline at end\n\n### SECURITY "))

    def test_refuses_tab_bel_and_non_ascii(self):
        for bad in ("a\tb", "a\x07b", "a·b", "a\rb"):
            d = packet()
            with self.assertRaises(rw.Refused):
                rw.cmd_append(d, "SECURITY", bad)
            self.assertEqual(reviews(d), b"# REVIEWS\n\nSECURITY-VERDICT: AWAITING\n")

    def test_crlf_input_becomes_lf(self):
        d = packet(b"x\n")
        rw.cmd_append(d, "SECURITY", "one\r\ntwo")
        self.assertNotIn(b"\r", reviews(d))
        self.assertIn(b"one\ntwo\n", reviews(d))

    def test_refuses_empty_text(self):
        with self.assertRaises(rw.Refused):
            rw.cmd_append(packet(), "SECURITY", "\n  \n")

    def test_refuses_crlf_reviews_file(self):
        d = packet(b"a\r\nb\r\n")
        with self.assertRaises(rw.Refused):
            rw.cmd_append(d, "SECURITY", "x")
        self.assertEqual(reviews(d), b"a\r\nb\r\n")


class Verdict(unittest.TestCase):
    def test_replaces_the_one_placeholder(self):
        d = packet(b"# REVIEWS\n\n## SECURITY\nSECURITY-VERDICT: AWAITING\n\n## after\nkeep\n")
        rw.cmd_verdict(d, "SECURITY", "GO", "reproduced; 22/22")
        data = reviews(d).decode()
        self.assertNotIn("AWAITING", data)
        self.assertRegex(data, r"## SECURITY\nSECURITY-VERDICT: GO " + STAMP.pattern + r"\nreproduced; 22/22\n\n## after\nkeep\n$")

    def test_refuses_two_placeholders_and_changes_nothing(self):
        body = b"SECURITY-VERDICT: AWAITING\nx\nSECURITY-VERDICT: AWAITING\n"
        d = packet(body)
        with self.assertRaisesRegex(rw.Refused, r"^2 'SECURITY-VERDICT: AWAITING' lines \(at lines 1, 3\)"):
            rw.cmd_verdict(d, "SECURITY", "GO", "x")
        self.assertEqual(reviews(d), body)

    def test_no_placeholder_appends(self):
        d = packet(b"# REVIEWS\n## SECURITY\n")
        rw.cmd_verdict(d, "SECURITY", "HOLD", "FBL 1 open")
        data = reviews(d)
        self.assertTrue(data.startswith(b"# REVIEWS\n## SECURITY\n"))
        self.assertRegex(data.decode(), r"\nSECURITY-VERDICT: HOLD " + STAMP.pattern + r"\nFBL 1 open\n$")

    def test_other_roles_placeholder_untouched(self):
        d = packet(b"DESIGN-VERDICT: AWAITING\nSECURITY-VERDICT: AWAITING\n")
        rw.cmd_verdict(d, "SECURITY", "GO", "ok")
        self.assertTrue(reviews(d).startswith(b"DESIGN-VERDICT: AWAITING\nSECURITY-VERDICT: GO "))

    def test_refuses_unknown_verdict(self):
        with self.assertRaises(rw.Refused):
            rw.cmd_verdict(packet(), "SECURITY", "AWAITING", "x")


class Folders(unittest.TestCase):
    def test_refuses_scratch_and_backups(self):
        for name in ("_scratch-helm-2026-09-25", "_backups"):
            d = packet(name=name)
            with self.assertRaises(rw.Refused):
                rw.cmd_append(d, "SECURITY", "x")
            with self.assertRaises(rw.Refused):
                rw.cmd_hash(d)

    def test_refuses_missing_reviews(self):
        os.makedirs(BASE, exist_ok=True)
        with self.assertRaises(rw.Refused):
            rw.cmd_append(tempfile.mkdtemp(dir=BASE), "SECURITY", "x")

    def test_hash_lists_files_and_skips_scratch(self):
        d = packet(b"r\n")
        os.makedirs(os.path.join(d, "tests"))
        os.makedirs(os.path.join(d, "_scratch-x"))
        with open(os.path.join(d, "tests", "t.py"), "wb") as f:
            f.write(b"abc")
        with open(os.path.join(d, "_scratch-x", "junk"), "wb") as f:
            f.write(b"junk")
        out = rw.cmd_hash(d)
        self.assertEqual([line.split("  ")[1] for line in out], ["REVIEWS.md", "tests/t.py"])
        self.assertEqual(out[1].split("  ")[0], "ba7816bf8f01")  # sha256("abc")[:12]


class Cli(unittest.TestCase):
    def test_exit_code_2_on_refusal(self):
        self.assertEqual(rw.main(["append", packet(name="_scratch-y"), "--text", "x"]), 2)

    def test_file_argument_must_be_ascii(self):
        d = packet()
        f = os.path.join(d, "..", "note.txt")
        with open(f, "wb") as fh:
            fh.write("café".encode("utf-8"))
        self.assertEqual(rw.main(["append", d, "--file", f]), 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
