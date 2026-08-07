#!/usr/bin/env python3
"""セッション -> サイクル の対応表を作る。

出力:
  scripts/cycle-stats/out/session_cycle_map.json   機械可読の対応表 (集計スクリプトが読む)
  scripts/cycle-stats/out/session_cycle_map.md     人が読む要約

使い方:
  python3 scripts/cycle-stats/build_map.py
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    cycles = common.load_cycles()
    lookup = common.make_lookup(cycles)
    sys.stderr.write("cycles with start/end: %d (%s .. %s)\n" % (
        len(lookup["list"]), lookup["list"][0]["name"], lookup["list"][-1]["name"]))

    sessions = []
    for i, path in enumerate(common.list_main_sessions(), 1):
        sid = os.path.basename(path)[: -len(".jsonl")]
        sys.stderr.write("[%d] %s\n" % (i, sid))
        sc = common.scan_file(path, lookup)

        subs = []
        for spath in common.list_subagents(path):
            ssc = common.scan_file(spath, lookup, count_cycle_mentions=False)
            subs.append({
                "file": os.path.basename(spath),
                "path": spath,
                "first_ts": ssc.first_ts,
                "last_ts": ssc.last_ts,
                "first_ts_jst": common.fmt_epoch(ssc.first_ts),
                "last_ts_jst": common.fmt_epoch(ssc.last_ts),
                "records": ssc.records,
                "total_lines": ssc.total_lines,
                "parse_failures": ssc.parse_failures,
                "no_timestamp": ssc.no_timestamp,
                "assistant_records": ssc.assistant_records,
                "assistant_no_usage": ssc.assistant_no_usage,
                "usage_bearing_records": ssc.usage_bearing,
                "per_cycle": ssc.per_cycle,
                "cycles": sorted(c for c in ssc.per_cycle
                                 if c not in (common.UNASSIGNED, common.NO_TIMESTAMP)),
                "timeline": {k: v for k, v in ssc.timeline.items()},
            })

        # 時刻ベースの判定: レコード数の多い順にサイクルを並べる
        by_records = sorted(
            ((c, b["records"]) for c, b in sc.per_cycle.items()
             if c not in (common.UNASSIGNED, common.NO_TIMESTAMP)),
            key=lambda x: -x[1])
        # サブエージェント側で触れているサイクルも合流させる
        sub_cycles = {}
        for s in subs:
            for c, b in s["per_cycle"].items():
                if c not in (common.UNASSIGNED, common.NO_TIMESTAMP):
                    sub_cycles[c] = sub_cycles.get(c, 0) + b["records"]

        # 文字列ベースの判定 (言及回数が多い上位)
        mentions = sorted(sc.cycle_mentions.items(), key=lambda x: -x[1])[:8]

        sessions.append({
            "session_id": sid,
            "path": path,
            "size_bytes": os.path.getsize(path),
            "first_ts": sc.first_ts,
            "last_ts": sc.last_ts,
            "first_ts_jst": common.fmt_epoch(sc.first_ts),
            "last_ts_jst": common.fmt_epoch(sc.last_ts),
            "total_lines": sc.total_lines,
            "records": sc.records,
            "parse_failures": sc.parse_failures,
            "no_timestamp": sc.no_timestamp,
            "assistant_records": sc.assistant_records,
            "assistant_no_usage": sc.assistant_no_usage,
            "usage_bearing_records": sc.usage_bearing,
            "per_cycle": sc.per_cycle,
            "timeline": sc.timeline,
            "cycles_by_time": [c for c, _ in by_records],
            "cycle_record_counts": dict(by_records),
            "straddles_cycles": len(by_records) > 1,
            "cycle_mentions_top": dict(mentions),
            "subagent_count": len(subs),
            "subagent_cycle_record_counts": sub_cycles,
            "subagents": subs,
        })

    data = {
        "generated_by": "scripts/cycle-stats/build_map.py",
        "log_dir": common.LOG_DIR,
        "idle_gap_sec": common.IDLE_GAP_SEC,
        "cycles": [{k: c[k] for k in ("id", "name", "started_at", "completed_at", "start", "end")}
                   for c in cycles],
        "sessions": sessions,
    }
    with open(os.path.join(OUT_DIR, "session_cycle_map.json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)

    write_markdown(data)
    sys.stderr.write("wrote %s\n" % os.path.join(OUT_DIR, "session_cycle_map.json"))


def write_markdown(data):
    lines = ["# セッション -> サイクル 対応表", "",
             "`build_map.py` が自動生成。数え方は METHOD.md を参照。", ""]
    lines += ["## メインセッション一覧", "",
              "| session_id | 最初のレコード(JST) | 最後のレコード(JST) | レコード数 | サブエージェント数 | 時刻判定のサイクル(レコード数) | 跨ぎ | 文字列 `cycle-XXX` 言及の上位 |",
              "| --- | --- | --- | --- | --- | --- | --- | --- |"]
    for s in data["sessions"]:
        cyc = ", ".join("%s(%d)" % (c, s["cycle_record_counts"][c]) for c in s["cycles_by_time"]) or "(なし)"
        men = ", ".join("%s:%d" % (k, v) for k, v in list(s["cycle_mentions_top"].items())[:4]) or "-"
        lines.append("| %s | %s | %s | %d | %d | %s | %s | %s |" % (
            s["session_id"][:8], s["first_ts_jst"], s["last_ts_jst"], s["records"],
            s["subagent_count"], cyc, "跨ぎ" if s["straddles_cycles"] else "", men))

    # サイクル -> セッション
    cyc_map = {}
    for s in data["sessions"]:
        for c, n in s["cycle_record_counts"].items():
            e = cyc_map.setdefault(c, {"sessions": [], "sub_records": 0, "subagents": 0})
            e["sessions"].append((s["session_id"], n))
        for sub in s["subagents"]:
            for c in sub["cycles"]:
                e = cyc_map.setdefault(c, {"sessions": [], "sub_records": 0, "subagents": 0})
                e["subagents"] += 1
                e["sub_records"] += sub["per_cycle"][c]["records"]

    lines += ["", "## サイクル -> セッション", "",
              "| cycle | メインセッション数 | サブエージェント本数(重複あり) | セッション(レコード数) |",
              "| --- | --- | --- | --- |"]
    for c in sorted(cyc_map, key=lambda x: int(x.split("-")[1]) if x.split("-")[-1].isdigit() else 0):
        e = cyc_map[c]
        ss = ", ".join("%s(%d)" % (sid[:8], n) for sid, n in e["sessions"])
        lines.append("| %s | %d | %d | %s |" % (c, len(e["sessions"]), e["subagents"], ss))

    with open(os.path.join(OUT_DIR, "session_cycle_map.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
