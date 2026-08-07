#!/usr/bin/env python3
"""対応表 (out/session_cycle_map.json) を使ってサイクルごとに集計する。

使い方:
  python3 scripts/cycle-stats/aggregate.py                 # 全サイクル
  python3 scripts/cycle-stats/aggregate.py cycle-301 cycle-302
  python3 scripts/cycle-stats/aggregate.py --json          # JSON で出力

出力:
  標準出力にテキストの表
  scripts/cycle-stats/out/cycle_stats.json  に全サイクル分の集計

数え方は METHOD.md を参照。
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
MAP_PATH = os.path.join(OUT_DIR, "session_cycle_map.json")

TOKEN_FIELDS = list(common.USAGE_FIELDS)
COUNT_FIELDS = ["records", "user_messages", "assistant_responses",
                "assistant_records", "tool_calls", "subagent_launches"]


def empty_side():
    d = {f: 0 for f in TOKEN_FIELDS}
    d.update({f: 0 for f in COUNT_FIELDS})
    return d


def add(dst, src):
    for k in TOKEN_FIELDS + COUNT_FIELDS:
        dst[k] += src.get(k, 0)


def build(idle_gap=common.IDLE_GAP_SEC):
    with open(MAP_PATH, encoding="utf-8") as f:
        data = json.load(f)

    cycles = {c["name"]: c for c in data["cycles"]}
    stats = {}

    def cyc(name):
        s = stats.get(name)
        if s is None:
            s = {
                "cycle": name,
                "main": empty_side(),
                "sub": empty_side(),
                "main_sessions": [],
                "subagent_files": 0,
                "timeline": [],
                "main_timeline": [],
            }
            stats[name] = s
        return s

    # 全レコード数の検算用
    total_records = 0
    total_no_ts = 0
    total_assistant_records = 0
    total_assistant_no_usage = 0

    for s in data["sessions"]:
        total_records += s["records"]
        total_no_ts += s["no_timestamp"]
        total_assistant_records += s["assistant_records"]
        total_assistant_no_usage += s["assistant_no_usage"]
        for name, b in s["per_cycle"].items():
            c = cyc(name)
            add(c["main"], b)
            if b["records"]:
                c["main_sessions"].append(s["session_id"])
        for name, tl in s["timeline"].items():
            cyc(name)["timeline"].extend(tl)
            cyc(name)["main_timeline"].extend(tl)

        for sub in s["subagents"]:
            total_records += sub["records"]
            total_no_ts += sub["no_timestamp"]
            total_assistant_records += sub["assistant_records"]
            total_assistant_no_usage += sub["assistant_no_usage"]
            touched = set()
            for name, b in sub["per_cycle"].items():
                c = cyc(name)
                add(c["sub"], b)
                if b["records"]:
                    touched.add(name)
            for name, tl in sub["timeline"].items():
                cyc(name)["timeline"].extend(tl)
            for key in touched:
                cyc(key)["subagent_files"] += 1

    for name, s in stats.items():
        s["main_sessions"] = sorted(set(s["main_sessions"]))
        s["main_session_count"] = len(s["main_sessions"])
        s["active_seconds_merged"] = round(common.active_seconds(s["timeline"], idle_gap), 1)
        s["active_seconds_main_only"] = round(common.active_seconds(s["main_timeline"], idle_gap), 1)
        c = cycles.get(name)
        if c and c.get("end"):
            s["wall_clock_seconds"] = round(c["end"] - c["start"], 1)
            s["started_at"] = c["started_at"]
            s["completed_at"] = c["completed_at"]
        else:
            s["wall_clock_seconds"] = None
            s["started_at"] = None
            s["completed_at"] = None
        s["first_record_jst"] = common.fmt_epoch(min(s["timeline"])) if s["timeline"] else None
        s["last_record_jst"] = common.fmt_epoch(max(s["timeline"])) if s["timeline"] else None
        s["total"] = empty_side()
        add(s["total"], s["main"])
        add(s["total"], s["sub"])
        del s["timeline"]
        del s["main_timeline"]

    verification = {
        "total_records_all_files": total_records,
        "records_no_timestamp": total_no_ts,
        "records_assigned_to_a_cycle": sum(
            v["main"]["records"] + v["sub"]["records"]
            for k, v in stats.items()
            if k not in (common.UNASSIGNED, common.NO_TIMESTAMP)),
        "records_unassigned_between_cycles": (
            stats.get(common.UNASSIGNED, {"main": empty_side(), "sub": empty_side()})["main"]["records"]
            + stats.get(common.UNASSIGNED, {"main": empty_side(), "sub": empty_side()})["sub"]["records"]),
        "records_without_timestamp_bucket": (
            stats.get(common.NO_TIMESTAMP, {"main": empty_side(), "sub": empty_side()})["main"]["records"]
            + stats.get(common.NO_TIMESTAMP, {"main": empty_side(), "sub": empty_side()})["sub"]["records"]),
        "assistant_records": total_assistant_records,
        "assistant_records_without_usage": total_assistant_no_usage,
        "idle_gap_sec": idle_gap,
    }
    v = verification
    v["sum_of_buckets"] = (v["records_assigned_to_a_cycle"]
                           + v["records_unassigned_between_cycles"]
                           + v["records_without_timestamp_bucket"])
    v["balanced"] = (v["sum_of_buckets"] == v["total_records_all_files"])
    v["records_with_usage_pct"] = round(
        100.0 * (total_assistant_records - total_assistant_no_usage) / total_records, 2)
    v["records_without_usage_pct"] = round(
        100.0 - v["records_with_usage_pct"], 2)

    return {"verification": verification, "cycles": stats}


def hms(sec):
    if sec is None:
        return "-"
    sec = int(sec)
    return "%dh%02dm%02ds" % (sec // 3600, (sec % 3600) // 60, sec % 60)


def n(x):
    return "{:,}".format(x)


def render(s):
    lines = []
    lines.append("=" * 78)
    lines.append("%s   %s -> %s" % (s["cycle"], s["started_at"] or "-", s["completed_at"] or "-"))
    lines.append("=" * 78)
    lines.append("  メインセッション : %d 本  %s" % (s["main_session_count"], ", ".join(x[:8] for x in s["main_sessions"])))
    lines.append("  サブエージェント : %d 本" % s["subagent_files"])
    lines.append("  レコード範囲     : %s .. %s" % (s["first_record_jst"], s["last_record_jst"]))
    lines.append("")
    lines.append("  経過時間 (frontmatter の実時間)      : %s" % hms(s["wall_clock_seconds"]))
    lines.append("  稼働時間 (メイン+サブ 合流タイムライン): %s" % hms(s["active_seconds_merged"]))
    lines.append("  稼働時間 (メインのみ)                 : %s" % hms(s["active_seconds_main_only"]))
    lines.append("")
    lines.append("  %-32s %14s %14s %14s" % ("", "メイン", "サブエージェント", "合計"))
    for f in TOKEN_FIELDS:
        lines.append("  %-32s %14s %14s %14s" % (
            f, n(s["main"][f]), n(s["sub"][f]), n(s["total"][f])))
    lines.append("")
    for f in COUNT_FIELDS:
        lines.append("  %-32s %14s %14s %14s" % (
            f, n(s["main"][f]), n(s["sub"][f]), n(s["total"][f])))
    return "\n".join(lines)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv

    result = build()
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "cycle_stats.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    if as_json:
        sel = {k: v for k, v in result["cycles"].items() if not args or k in args}
        print(json.dumps({"verification": result["verification"], "cycles": sel},
                         ensure_ascii=False, indent=2))
        return

    v = result["verification"]
    print("---- 検証 ----")
    print("  全レコード数                        : %s" % n(v["total_records_all_files"]))
    print("  サイクルに割り当てられたレコード    : %s" % n(v["records_assigned_to_a_cycle"]))
    print("  どのサイクルにも属さない (期間外)   : %s" % n(v["records_unassigned_between_cycles"]))
    print("  timestamp を持たないレコード        : %s" % n(v["records_without_timestamp_bucket"]))
    print("  合計                                : %s  -> 一致: %s"
          % (n(v["sum_of_buckets"]), "OK" if v["balanced"] else "NG"))
    print("  usage を持つレコードの割合          : %.2f%% (usage 無し %.2f%%)"
          % (v["records_with_usage_pct"], v["records_without_usage_pct"]))
    print("  assistant レコード %s のうち usage 無し %s"
          % (n(v["assistant_records"]), n(v["assistant_records_without_usage"])))
    print("  無活動とみなす閾値 (IDLE_GAP_SEC)   : %d 秒" % v["idle_gap_sec"])
    print()

    names = args or sorted(
        (k for k in result["cycles"] if k.startswith("cycle-")),
        key=lambda x: int(x.split("-")[1]))
    for nm in names:
        s = result["cycles"].get(nm)
        if s is None:
            print("(%s: 該当レコードなし)" % nm)
            continue
        print(render(s))
        print()


if __name__ == "__main__":
    main()
