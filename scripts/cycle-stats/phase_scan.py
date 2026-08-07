"""cycle-302 のサブエージェント一覧と、メインの tool_use を時系列で書き出す。
context に載せないため、要約だけを out/ に出す。"""
import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import _parse_iso, fmt_epoch, LOG_DIR

MAIN = os.path.join(LOG_DIR, "a0ac882e-cdc1-4f59-ac46-0a182432701e.jsonl")
SUBDIR = os.path.join(LOG_DIR, "a0ac882e-cdc1-4f59-ac46-0a182432701e", "subagents")
START = _parse_iso("2026-08-04T14:44:37+09:00")
END   = _parse_iso("2026-08-07T09:08:05+09:00")

rows = []
for p in sorted(glob.glob(os.path.join(SUBDIR, "*.jsonl"))):
    first_ts = last_ts = None
    prompt = ""
    n = 0
    with open(p, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line: continue
            try: d = json.loads(line)
            except Exception: continue
            n += 1
            t = d.get("timestamp")
            if t:
                try: ts = _parse_iso(t)
                except Exception: continue
                if first_ts is None or ts < first_ts: first_ts = ts
                if last_ts is None or ts > last_ts: last_ts = ts
            if not prompt and d.get("type") == "user":
                c = (d.get("message") or {}).get("content")
                if isinstance(c, str): prompt = c
                elif isinstance(c, list):
                    for b in c:
                        if isinstance(b, dict) and b.get("type") == "text":
                            prompt = b.get("text",""); break
    if first_ts is None: continue
    if not (START <= first_ts <= END): continue
    prompt = " ".join(prompt.split())[:400]
    rows.append((first_ts, last_ts, os.path.basename(p), n, prompt))

rows.sort()
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "subagents_302.txt")
with open(out, "w", encoding="utf-8") as fh:
    for i,(a,b,name,n,pr) in enumerate(rows,1):
        fh.write("%3d| %s -> %s | rec=%5d | %s\n     %s\n" % (i, fmt_epoch(a)[:19], fmt_epoch(b)[11:19], n, name[:12], pr))
print("subagents in window:", len(rows), "->", out)
