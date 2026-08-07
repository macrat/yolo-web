#!/usr/bin/env python3
"""集計の検算。build_map.py / aggregate.py とは独立の経路で数えて突き合わせる。

使い方:
  python3 tmp/cycle-stats/verify.py
"""

import collections
import json
import os
import random
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")


def main():
    cycles_all = common.load_cycles()
    lookup = common.make_lookup(cycles_all)
    usable = lookup["list"]

    print("== 1. サイクル定義の健全性 ==")
    print("  docs/cycles から読めたサイクル       : %d" % len(cycles_all))
    print("  started_at/completed_at が有効       : %d" % len(usable))
    bad = [c["name"] for c in cycles_all if c.get("invalid_window")]
    print("  completed_at < started_at (除外)     : %s" % (", ".join(bad) or "なし"))
    ov = [(a["name"], b["name"]) for a, b in zip(usable, usable[1:]) if a["end"] > b["start"]]
    print("  期間が重なる隣接サイクル             : %s" % (str(ov) or "なし"))
    print()

    print("== 2. ファイル本数 ==")
    mains = common.list_main_sessions()
    subs = []
    for m in mains:
        subs += common.list_subagents(m)
    import glob
    all_sub_glob = sorted(glob.glob(os.path.join(common.LOG_DIR, "*", "subagents", "*.jsonl")))
    print("  メインセッション .jsonl              : %d" % len(mains))
    print("  親セッション経由で辿れたサブエージェント: %d" % len(subs))
    print("  glob で見つかる全サブエージェント      : %d" % len(all_sub_glob))
    orphan = sorted(set(all_sub_glob) - set(subs))
    print("  親の .jsonl が存在しない孤児          : %d %s" % (len(orphan), orphan[:5]))
    print()

    print("== 3. 行数の検算 (wc -l と突き合わせ) ==")
    with open(os.path.join(OUT_DIR, "session_cycle_map.json"), encoding="utf-8") as f:
        m = json.load(f)
    scanned_lines = sum(s["total_lines"] for s in m["sessions"]) + \
        sum(sub["total_lines"] for s in m["sessions"] for sub in s["subagents"])
    scanned_records = sum(s["records"] for s in m["sessions"]) + \
        sum(sub["records"] for s in m["sessions"] for sub in s["subagents"])
    parse_fail = sum(s["parse_failures"] for s in m["sessions"]) + \
        sum(sub["parse_failures"] for s in m["sessions"] for sub in s["subagents"])
    files = mains + subs
    wc = 0
    for i in range(0, len(files), 200):
        out = subprocess.run(["wc", "-l"] + files[i:i + 200],
                             capture_output=True, text=True).stdout.strip().splitlines()
        for ln in out:
            parts = ln.split()
            if parts and parts[0].isdigit() and (len(out) == 1 or not ln.strip().endswith("total")):
                wc += int(parts[0])
    print("  wc -l 合計 (末尾改行なしの最終行は数えない): %d" % wc)
    print("  スキャンした非空行                    : %d" % scanned_lines)
    print("  JSON パース成功レコード               : %d" % scanned_records)
    print("  JSON パース失敗                       : %d" % parse_fail)
    print("  ※ ログは追記中のため実行タイミングで数行ずれることがある")
    print()

    print("== 4. サイクル割り当ての検算 (総当たり vs 二分探索) ==")
    rnd = random.Random(42)
    sample = []
    for s in m["sessions"]:
        for tl in s["timeline"].values():
            sample += rnd.sample(tl, min(30, len(tl)))
    mismatch = 0
    for ts in sample:
        brute = None
        hits = [c["name"] for c in usable if c["start"] <= ts <= c["end"]]
        if hits:
            brute = max(hits, key=lambda nm: next(c["start"] for c in usable if c["name"] == nm))
        fast = common.assign_cycle(ts, lookup)
        if brute != fast:
            mismatch += 1
    print("  サンプル %d 点、不一致 %d 点" % (len(sample), mismatch))
    print()

    print("== 5. usage の重複排除の効果 (cycle-301 / cycle-302 のメインセッション) ==")
    for sid, label in (("f5485b6a-96af-491b-9013-25121f7ab71a", "cycle-301 main"),
                       ("a0ac882e-cdc1-4f59-ac46-0a182432701e", "cycle-302 main")):
        path = os.path.join(common.LOG_DIR, sid + ".jsonl")
        naive = collections.Counter()
        dedup = collections.Counter()
        seen = set()
        for line in open(path, encoding="utf-8", errors="replace"):
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("type") != "assistant":
                continue
            msg = d.get("message") or {}
            u = msg.get("usage") or {}
            for f in common.USAGE_FIELDS:
                naive[f] += u.get(f, 0) or 0
            mid = msg.get("id")
            if mid in seen:
                continue
            seen.add(mid)
            for f in common.USAGE_FIELDS:
                dedup[f] += u.get(f, 0) or 0
        print("  %s" % label)
        for f in common.USAGE_FIELDS:
            ratio = (naive[f] / dedup[f]) if dedup[f] else 0
            print("    %-32s 素朴=%15d  重複排除=%15d  倍率 x%.2f"
                  % (f, naive[f], dedup[f], ratio))
    print()

    print("== 6. usage を持たないレコードの内訳 (全ファイル) ==")
    by_type = collections.Counter()
    with_usage = collections.Counter()
    for p in files:
        for line in open(p, encoding="utf-8", errors="replace"):
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except Exception:
                by_type["PARSE_FAIL"] += 1
                continue
            t = d.get("type") or "(none)"
            by_type[t] += 1
            if t == "assistant" and (d.get("message") or {}).get("usage"):
                with_usage[t] += 1
    total = sum(by_type.values())
    print("  %-22s %10s %10s %8s" % ("type", "件数", "usage有", "割合"))
    for t, c in by_type.most_common():
        print("  %-22s %10d %10d %7.2f%%" % (t, c, with_usage[t], 100.0 * c / total))
    nu = total - sum(with_usage.values())
    print("  ---")
    print("  usage を持たないレコード: %d / %d = %.2f%%" % (nu, total, 100.0 * nu / total))


if __name__ == "__main__":
    main()
