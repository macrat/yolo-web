# -*- coding: utf-8 -*-
"""cycle-302 をフェーズに分解して集計する。規則は REPORT-cycle-302-phases.md 参照。"""
import json, os, sys, glob, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import _parse_iso, fmt_epoch, LOG_DIR, USAGE_FIELDS, AGENT_TOOL_NAMES, active_seconds, IDLE_GAP_SEC

SID = "a0ac882e-cdc1-4f59-ac46-0a182432701e"
MAIN = os.path.join(LOG_DIR, SID + ".jsonl")
SUBDIR = os.path.join(LOG_DIR, SID, "subagents")
CSTART = _parse_iso("2026-08-04T14:44:37+09:00")
CEND   = _parse_iso("2026-08-07T09:08:05+09:00")

T = _parse_iso
# (キー, ラベル, [(区間開始, 区間終了), ...])  区間は [start, end) の半開区間。最後だけ閉区間。
PHASES = [
 ("P1","計画・GA実測・計画レビュー(1〜4巡)",
    [("2026-08-04T14:44:37+09:00","2026-08-04T16:02:55+09:00"),
     ("2026-08-05T07:48:03+09:00","2026-08-05T08:12:00+09:00")]),
 ("P2","判定基準の較正(ゲートG-a・実寸判定ルール)",
    [("2026-08-04T16:02:55+09:00","2026-08-04T16:21:35+09:00")]),
 ("GAP","(夜間の停止・レコードなし)",
    [("2026-08-04T16:21:35+09:00","2026-08-05T07:48:03+09:00")]),
 ("P3","E0(禁止色の除去)＋機械計器 icon-metrics.ts",
    [("2026-08-05T08:12:00+09:00","2026-08-05T10:15:00+09:00")]),
 ("P4","favicon記事の執筆と11巡のレビュー(＋完了手続きAP点検1回目)",
    [("2026-08-05T10:15:00+09:00","2026-08-05T19:16:00+09:00")]),
 ("P5","【計画外】ブログ本文の表の修正(サイト全体)と実装レビュー",
    [("2026-08-05T19:16:00+09:00","2026-08-06T18:33:14+09:00")]),
 ("P6","終盤: 表の記事＋pre-pushフック修理＋AP点検2回目(同時進行)",
    [("2026-08-06T18:33:14+09:00","2026-08-07T06:44:58+09:00")]),
 ("P7","出荷・CI・脆弱性対応・完了記録",
    [("2026-08-07T06:44:58+09:00","2026-08-07T09:08:06+09:00")]),
]
PH_INT = [(k, [(T(a), T(b)) for a, b in segs]) for k, _l, segs in PHASES]

def phase_of(ts):
    for k, segs in PH_INT:
        for a, b in segs:
            if a <= ts < b:
                return k
    return None

# サブエージェント -> フェーズ (起動順の通し番号で指定)。分類根拠は最初のプロンプト。
SUB_PHASE = {}
for i in range(1, 6):   SUB_PHASE[i] = "P1"
SUB_PHASE[6] = "P2"
for i in (7, 8, 9):     SUB_PHASE[i] = "P3"
for i in list(range(10, 33)) + [35, 37, 39, 40, 42, 13]: SUB_PHASE[i] = "P4"
for i in [33, 34, 36, 38, 41] + list(range(43, 52)):     SUB_PHASE[i] = "P5"
for i in range(52, 70): SUB_PHASE[i] = "P6"
# 終盤の内訳ラベル
TAIL_KIND = {}
for i in (52, 55, 57, 59, 61): TAIL_KIND[i] = "表の記事"
for i in (54, 56, 58, 60, 62, 63, 64, 65, 66, 67, 68, 69): TAIL_KIND[i] = "pre-pushフック"
TAIL_KIND[53] = "完了手続きAP点検2回目"

def blank():
    d = {f: 0 for f in USAGE_FIELDS}
    d.update(records=0, assistant_responses=0, tool_calls=0, subagent_launches=0,
             user_messages=0, ts=[], sub_ts=[], subagents=0)
    return d

def scan(path, force_phase=None):
    """1ファイルを走査し、phase -> 集計 を返す。force_phase 指定時は全レコードをそこへ。"""
    res = {}
    seen_msg, seen_tool = set(), set()
    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line: continue
            try: d = json.loads(line)
            except Exception: continue
            t = d.get("timestamp")
            if not t: continue
            try: ts = _parse_iso(t)
            except Exception: continue
            if not (CSTART <= ts <= CEND): continue
            ph = force_phase or phase_of(ts)
            if ph is None: continue
            b = res.setdefault(ph, blank())
            b["records"] += 1; b["ts"].append(ts)
            if d.get("type") == "user": b["user_messages"] += 1
            if d.get("type") != "assistant": continue
            msg = d.get("message") or {}
            mid = msg.get("id") or ("uuid:" + str(d.get("uuid")))
            if mid not in seen_msg:
                seen_msg.add(mid); b["assistant_responses"] += 1
                u = msg.get("usage") or {}
                for f in USAGE_FIELDS:
                    v = u.get(f)
                    if isinstance(v, int): b[f] += v
            c = msg.get("content")
            if isinstance(c, list):
                for blk in c:
                    if not isinstance(blk, dict) or blk.get("type") != "tool_use": continue
                    bid = blk.get("id") or (str(mid) + ":" + str(blk.get("name")))
                    if bid in seen_tool: continue
                    seen_tool.add(bid)
                    b["tool_calls"] += 1
                    if blk.get("name") in AGENT_TOOL_NAMES: b["subagent_launches"] += 1
    return res

# --- メイン ---
main_res = scan(MAIN)

# --- サブエージェント（起動時刻順に番号付け） ---
subs = []
for p in sorted(glob.glob(os.path.join(SUBDIR, "*.jsonl"))):
    first = None
    with open(p, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line: continue
            try: d = json.loads(line)
            except Exception: continue
            t = d.get("timestamp")
            if t:
                try: first = _parse_iso(t)
                except Exception: pass
                break
    if first is None or not (CSTART <= first <= CEND): continue
    subs.append((first, p))
subs.sort()
assert len(subs) == 69, len(subs)

sub_res = {}
tail_break = {}
for idx, (first, p) in enumerate(subs, 1):
    ph = SUB_PHASE[idx]
    r = scan(p, force_phase=ph)
    for k, v in r.items():
        b = sub_res.setdefault(k, blank())
        for f in USAGE_FIELDS: b[f] += v[f]
        for f in ("records","assistant_responses","tool_calls","subagent_launches","user_messages"):
            b[f] += v[f]
        b["ts"] += v["ts"]
    sub_res.setdefault(ph, blank())["subagents"] += 1
    if idx in TAIL_KIND:
        tb = tail_break.setdefault(TAIL_KIND[idx], blank())
        v = r.get(ph, blank())
        for f in USAGE_FIELDS: tb[f] += v[f]
        for f in ("records","assistant_responses","tool_calls"): tb[f] += v[f]
        tb["subagents"] += 1
        tb["ts"] += v["ts"]

# --- git ---
log = subprocess.run(["git","-C","/mnt/data/yolo-web","log","--pretty=format:@@%H|%ct","--numstat",
                      "--since","2026-08-04T14:44:37+0900","--until","2026-08-07T09:08:05+0900"],
                     capture_output=True, text=True).stdout
commits = []
cur = None
for line in log.split("\n"):
    if line.startswith("@@"):
        h, ct = line[2:].split("|"); cur = {"sha": h[:8], "ct": float(ct), "ins":0, "del":0, "files":0,
                                            "ins_docs":0,"del_docs":0,"ins_code":0,"del_code":0}
        commits.append(cur)
    elif line.strip() and cur is not None:
        parts = line.split("\t")
        if len(parts) == 3:
            a, dd, f = parts
            ai = int(a) if a.isdigit() else 0; di = int(dd) if dd.isdigit() else 0
            cur["ins"] += ai; cur["del"] += di; cur["files"] += 1
            if f.startswith("docs/"): cur["ins_docs"] += ai; cur["del_docs"] += di
            else: cur["ins_code"] += ai; cur["del_code"] += di
gitph = {}
for c in commits:
    ph = phase_of(c["ct"])
    if ph is None: ph = "OUT"
    g = gitph.setdefault(ph, {"n":0,"ins":0,"del":0,"files":0,"ins_docs":0,"del_docs":0,"ins_code":0,"del_code":0})
    g["n"] += 1
    for k in ("ins","del","files","ins_docs","del_docs","ins_code","del_code"): g[k] += c[k]

# --- 出力 ---
def hm(s):
    s = int(round(s)); return "%dh%02dm" % (s//3600, (s%3600)//60)

order = [k for k,_l,_s in PHASES]
labels = {k:l for k,l,_s in PHASES}
rows = []
tot = blank()
for k in order:
    m = main_res.get(k, blank()); s = sub_res.get(k, blank())
    wall = sum(b-a for a,b in dict(PH_INT)[k])
    merged = active_seconds(m["ts"] + s["ts"])
    mainact = active_seconds(m["ts"])
    g = gitph.get(k, {"n":0,"ins":0,"del":0,"files":0,"ins_docs":0,"del_docs":0,"ins_code":0,"del_code":0})
    rows.append((k, labels[k], m, s, wall, merged, mainact, g))
    for f in USAGE_FIELDS: tot[f] += m[f] + s[f]
    for f in ("records","assistant_responses","tool_calls","subagent_launches"): tot[f] += m[f]+s[f]
    tot["subagents"] += s["subagents"]

print("="*118)
print("%-4s %-52s %9s %9s %9s %8s %8s"%("","フェーズ","out(main)","out(sub)","out(計)","経過","稼働merged"))
print("="*118)
for k,l,m,s,wall,merged,mainact,g in rows:
    print("%-4s %-52s %9d %9d %9d %8s %8s"%(k,l[:52],m["output_tokens"],s["output_tokens"],
          m["output_tokens"]+s["output_tokens"], hm(wall), hm(merged)))
print("-"*118)
print("%-4s %-52s %9d %9d %9d %8s %8s"%("計","",sum(r[2]["output_tokens"] for r in rows),
      sum(r[3]["output_tokens"] for r in rows), tot["output_tokens"], hm(CEND-CSTART), ""))
print()
print("%-4s %11s %11s %14s %6s %6s %6s %6s %6s %6s %8s"%("","cc(main)","cc(sub)","cache_read計","resp_m","resp_s","tool_m","tool_s","subs","commit","±行"))
for k,l,m,s,wall,merged,mainact,g in rows:
    print("%-4s %11d %11d %14d %6d %6d %6d %6d %6d %6d %8s"%(k,m["cache_creation_input_tokens"],
        s["cache_creation_input_tokens"], m["cache_read_input_tokens"]+s["cache_read_input_tokens"],
        m["assistant_responses"],s["assistant_responses"],m["tool_calls"],s["tool_calls"],s["subagents"],
        g["n"], "+%d/-%d"%(g["ins"],g["del"])))
print()
print("合計検算:")
print("  output   main=%d sub=%d 計=%d"%(sum(r[2]["output_tokens"] for r in rows),
      sum(r[3]["output_tokens"] for r in rows), tot["output_tokens"]))
print("  cache_creation 計=%d  cache_read 計=%d"%(tot["cache_creation_input_tokens"], tot["cache_read_input_tokens"]))
print("  input 計=%d"%tot["input_tokens"])
print("  assistant_responses main=%d sub=%d"%(sum(r[2]["assistant_responses"] for r in rows), sum(r[3]["assistant_responses"] for r in rows)))
print("  tool_calls main=%d sub=%d"%(sum(r[2]["tool_calls"] for r in rows), sum(r[3]["tool_calls"] for r in rows)))
print("  subagents=%d  commits=%d (OUT=%d)"%(tot["subagents"], sum(g["n"] for g in gitph.values()), gitph.get("OUT",{"n":0})["n"]))
print("  経過の合計=%s (サイクル実時間=%s)"%(hm(sum(sum(b-a for a,b in d[1]) for d in PH_INT)), hm(CEND-CSTART)))
allts=[]
for k in order: allts += main_res.get(k,blank())["ts"] + sub_res.get(k,blank())["ts"]
print("  稼働merged(全体・再計算)=%s  各フェーズの和=%s"%(hm(active_seconds(allts)), hm(sum(r[5] for r in rows))))
mts=[]
for k in order: mts += main_res.get(k,blank())["ts"]
print("  稼働main-only(全体)=%s  各フェーズの和=%s"%(hm(active_seconds(mts)), hm(sum(r[6] for r in rows))))
print()
print("--- P6(終盤) のサブエージェント内訳 ---")
for kind, b in sorted(tail_break.items(), key=lambda x:-x[1]["output_tokens"]):
    print("  %-24s 本数%3d  out %7d  cc %9d  cr %12d  resp %4d  tool %4d"%(
        kind, b["subagents"], b["output_tokens"], b["cache_creation_input_tokens"],
        b["cache_read_input_tokens"], b["assistant_responses"], b["tool_calls"]))
print()
print("--- コミットの内訳(docs/ とそれ以外) ---")
for k,l,m,s,wall,merged,mainact,g in rows:
    print("  %-4s commit=%2d files=%3d  docs +%5d/-%5d   code +%5d/-%5d"%(k,g["n"],g["files"],
        g["ins_docs"],g["del_docs"],g["ins_code"],g["del_code"]))
print()
print("--- 単価 ---")
for k,l,m,s,wall,merged,mainact,g in rows:
    o = m["output_tokens"]+s["output_tokens"]
    print("  %-4s out計=%8d  commit=%2d  out/commit=%9s  稼働merged=%8s  main-only=%8s"%(
        k,o,g["n"], ("%.0f"%(o/g["n"])) if g["n"] else "-", hm(merged), hm(mainact)))
