#!/usr/bin/env python3
"""6サイクルの横断比較。cycle_stats.json + git + サブエージェント種別 を突き合わせる。

追加した規則（METHOD.md の R1-R10 に加えて本ファイルで定義するもの）:

  R13. コミット数・変更行数（主）= `git log --grep="^cycle-NNN"`。
       サイクルの成果物は「コミットメッセージ先頭のサイクル名」で自己申告されているので
       それを正とする。frontmatter の時刻窓（R14）だと、completed_at より後に
       commit されたもの（cycle-297/299 で実在）を取りこぼす。
  R14. コミット数・変更行数（従・検算用）= committer date が [started_at, completed_at] に入るもの。
  R15. 変更行数 = `--numstat` の insertions + deletions の総和。
       バイナリ（numstat が "-"）は 0 行として数える。merge commit は
       実測 0 件なので二重計上の懸念はない。
  R16. レビュー巡数 = tool_use の Agent/Task のうち input.subagent_type == "reviewer" の数。
       review-log.md の `^## ` 見出し数は書式がサイクルごとに違う（後述）ので比較に使えない。

出力: 標準出力に表 + tmp/cycle-stats/out/compare.json
"""

import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
PROJ = "/mnt/data/yolo-web"

CYCLES = ["cycle-297", "cycle-298", "cycle-299", "cycle-300", "cycle-301", "cycle-302"]
TARGET = "cycle-302"
BASE = [c for c in CYCLES if c != TARGET]

# by_agent_type.py の出力（reviewer 起動数）。再計算が重いので値を検算付きで持つ。
REVIEWER = {"cycle-297": 3, "cycle-298": 24, "cycle-299": 6,
            "cycle-300": 19, "cycle-301": 33, "cycle-302": 47}


def git_numstat(args):
    """commits, insertions, deletions を返す。R15。"""
    p = subprocess.run(["git", "-C", PROJ, "log", "--numstat",
                        "--pretty=format:@%H"] + args,
                       capture_output=True, text=True, check=True)
    nc = ins = dele = 0
    for line in p.stdout.splitlines():
        if line.startswith("@"):
            nc += 1
            continue
        f = line.split("\t")
        if len(f) == 3:
            if f[0] != "-":
                ins += int(f[0])
            if f[1] != "-":
                dele += int(f[1])
    return nc, ins, dele


def main():
    stats = json.load(open(os.path.join(OUT, "cycle_stats.json"), encoding="utf-8"))["cycles"]
    rows = {}
    for c in CYCLES:
        s = stats[c]
        num = c.split("-")[1]
        pc, pi, pd = git_numstat(["--grep=^cycle-%s" % num])          # R13
        wc_, wi, wd = git_numstat(["--since=%s" % s["started_at"],
                                   "--until=%s" % s["completed_at"]])  # R14
        r = {
            "started_at": s["started_at"], "completed_at": s["completed_at"],
            "out_main": s["main"]["output_tokens"],
            "out_sub": s["sub"]["output_tokens"],
            "out_total": s["total"]["output_tokens"],
            "in_total": s["total"]["input_tokens"],
            "cc_total": s["total"]["cache_creation_input_tokens"],
            "cr_total": s["total"]["cache_read_input_tokens"],
            "wall_s": s["wall_clock_seconds"],
            "active_merged_s": s["active_seconds_merged"],
            "active_main_s": s["active_seconds_main_only"],
            "assistant_responses": s["total"]["assistant_responses"],
            "tool_calls": s["total"]["tool_calls"],
            "subagents": s["total"]["subagent_launches"],
            "subagent_files": s["subagent_files"],
            "reviewer_launches": REVIEWER[c],
            "commits_prefix": pc, "lines_prefix": pi + pd,
            "ins_prefix": pi, "del_prefix": pd,
            "commits_window": wc_, "lines_window": wi + wd,
        }
        # 派生（分母 0 は None）
        def per(v, d):
            return round(v / d, 1) if d else None
        r["out_per_commit"] = per(r["out_total"], r["commits_prefix"])
        r["out_per_line"] = per(r["out_total"], r["lines_prefix"])
        r["out_per_reviewer"] = per(r["out_total"], r["reviewer_launches"])
        r["out_per_subagent"] = per(r["out_total"], r["subagents"])
        r["out_per_response"] = per(r["out_total"], r["assistant_responses"])
        r["active_min_per_commit"] = per(r["active_merged_s"] / 60.0, r["commits_prefix"])
        r["active_s_per_line"] = per(r["active_merged_s"], r["lines_prefix"])
        r["cr_per_response"] = per(r["cr_total"], r["assistant_responses"])
        r["tools_per_subagent"] = per(r["tool_calls"], r["subagents"])
        r["responses_per_commit"] = per(r["assistant_responses"], r["commits_prefix"])
        r["active_merged_over_wall"] = per(100.0 * r["active_merged_s"] / r["wall_s"], 1)
        rows[c] = r

    def median(vals):
        v = sorted(x for x in vals if x is not None)
        n = len(v)
        return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2.0

    keys = [k for k in rows[TARGET] if isinstance(rows[TARGET][k], (int, float))]
    ratio = {}
    for k in keys:
        m = median([rows[c][k] for c in BASE])
        t = rows[TARGET][k]
        ratio[k] = {"median_297_301": m, "cycle_302": t,
                    "x": round(t / m, 2) if m else None}

    result = {"rows": rows, "ratio_vs_median_297_301": ratio}
    json.dump(result, open(os.path.join(OUT, "compare.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=2)

    w = sys.stdout.write
    cols = CYCLES
    def line(label, key, fmt="{:,}"):
        w("%-26s" % label)
        for c in cols:
            v = rows[c][key]
            w("%16s" % ("-" if v is None else fmt.format(v)))
        w("\n")

    w("%-26s" % "" + "".join("%16s" % c for c in cols) + "\n")
    for lbl, k in [("output main", "out_main"), ("output sub", "out_sub"),
                   ("output total", "out_total"),
                   ("cache_creation", "cc_total"), ("cache_read", "cr_total"),
                   ("wall clock (h)", "wall_s"), ("active merged (h)", "active_merged_s"),
                   ("active main-only (h)", "active_main_s"),
                   ("assistant_responses", "assistant_responses"),
                   ("tool_calls", "tool_calls"), ("subagent_launches", "subagents"),
                   ("  of which reviewer", "reviewer_launches"),
                   ("commits (prefix R13)", "commits_prefix"),
                   ("lines +/- (prefix R13)", "lines_prefix"),
                   ("commits (window R14)", "commits_window"),
                   ("lines +/- (window R14)", "lines_window"),
                   ("out/commit", "out_per_commit"), ("out/line", "out_per_line"),
                   ("out/reviewer", "out_per_reviewer"),
                   ("out/subagent", "out_per_subagent"),
                   ("out/response", "out_per_response"),
                   ("active min/commit", "active_min_per_commit"),
                   ("active s/line", "active_s_per_line"),
                   ("cache_read/response", "cr_per_response"),
                   ("tools/subagent", "tools_per_subagent"),
                   ("responses/commit", "responses_per_commit"),
                   ("active/wall %", "active_merged_over_wall")]:
        if k in ("wall_s", "active_merged_s", "active_main_s"):
            w("%-26s" % lbl)
            for c in cols:
                w("%16s" % ("%.2f" % (rows[c][k] / 3600.0)))
            w("\n")
        else:
            line(lbl, k, "{:,.1f}" if isinstance(rows[cols[0]][k], float) else "{:,}")

    w("\n---- cycle-302 / median(297..301) ----\n")
    for k in sorted(ratio, key=lambda x: -(ratio[x]["x"] or 0)):
        r = ratio[k]
        w("  %-24s median=%14s  302=%14s  x%s\n"
          % (k, "{:,.1f}".format(r["median_297_301"]), "{:,.1f}".format(r["cycle_302"]), r["x"]))


if __name__ == "__main__":
    main()
