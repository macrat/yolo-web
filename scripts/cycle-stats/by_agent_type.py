#!/usr/bin/env python3
"""サイクル別に「どのサブエージェント種別を何回起動したか」「どのツールを何回呼んだか」を数える。

数え方は METHOD.md の R3(レコード単位のサイクル割り当て) / R6(tool_use ブロック) /
R7(Agent|Task を起動とみなす) に完全に従う。追加した規則は本ファイル冒頭のみ:

  R11. サブエージェント種別 = tool_use ブロックの input.subagent_type。
       欠けている場合は "__NO_TYPE__"。Task ツールの場合も同じフィールドを見る。
  R12. ツール名 = tool_use ブロックの name。

使い方:
  python3 scripts/cycle-stats/by_agent_type.py cycle-297 cycle-298 ...
"""

import json
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402


def main():
    want = set(a for a in sys.argv[1:] if not a.startswith("--"))
    cycles = common.load_cycles()
    lookup = common.make_lookup(cycles)

    agent_types = {}   # cycle -> Counter
    tool_names = {}    # cycle -> Counter

    def cnt(d, c):
        if c not in d:
            d[c] = Counter()
        return d[c]

    files = []
    for m in common.list_main_sessions():
        files.append((m, "main"))
        for s in common.list_subagents(m):
            files.append((s, "sub"))

    for path, kind in files:
        seen_tool_ids = set()
        with open(path, encoding="utf-8", errors="replace") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    d = json.loads(line)
                except Exception:
                    continue
                if d.get("type") != "assistant":
                    continue
                ts_raw = d.get("timestamp")
                if not ts_raw:
                    continue
                try:
                    ts = common._parse_iso(ts_raw)
                except Exception:
                    continue
                cyc = common.assign_cycle(ts, lookup)
                if cyc is None or (want and cyc not in want):
                    continue
                msg = d.get("message") or {}
                content = msg.get("content")
                if not isinstance(content, list):
                    continue
                for blk in content:
                    if not isinstance(blk, dict) or blk.get("type") != "tool_use":
                        continue
                    bid = blk.get("id") or (str(msg.get("id")) + ":" + str(blk.get("name")))
                    if bid in seen_tool_ids:
                        continue
                    seen_tool_ids.add(bid)
                    name = blk.get("name")
                    cnt(tool_names, cyc)[name] += 1
                    if name in common.AGENT_TOOL_NAMES:
                        inp = blk.get("input")
                        st = None
                        if isinstance(inp, dict):
                            st = inp.get("subagent_type")
                        cnt(agent_types, cyc)[st or "__NO_TYPE__"] += 1

    out = {}
    for c in sorted(set(list(agent_types) + list(tool_names)),
                    key=lambda x: int(x.split("-")[1]) if x.startswith("cycle-") else 0):
        out[c] = {
            "subagent_types": dict(agent_types.get(c, {}).most_common()),
            "subagent_launches_total": sum(agent_types.get(c, {}).values()),
            "tool_names_top": dict(tool_names.get(c, {}).most_common(15)),
            "tool_calls_total": sum(tool_names.get(c, {}).values()),
        }
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
