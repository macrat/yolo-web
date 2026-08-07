import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import _parse_iso, fmt_epoch, LOG_DIR
MAIN = os.path.join(LOG_DIR, "a0ac882e-cdc1-4f59-ac46-0a182432701e.jsonl")
START = _parse_iso("2026-08-04T14:44:37+09:00"); END = _parse_iso("2026-08-07T09:08:05+09:00")
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out", "main_tools_302.txt")
n=0
with open(MAIN, encoding="utf-8", errors="replace") as fh, open(out,"w",encoding="utf-8") as w:
    for line in fh:
        line=line.strip()
        if not line: continue
        try: d=json.loads(line)
        except Exception: continue
        if d.get("type")!="assistant": continue
        t=d.get("timestamp")
        if not t: continue
        try: ts=_parse_iso(t)
        except Exception: continue
        if not (START<=ts<=END): continue
        c=(d.get("message") or {}).get("content")
        if not isinstance(c,list): continue
        for b in c:
            if not isinstance(b,dict) or b.get("type")!="tool_use": continue
            nm=b.get("name"); inp=b.get("input") or {}
            tgt = inp.get("file_path") or inp.get("path") or inp.get("pattern") or inp.get("command") or inp.get("prompt") or inp.get("description") or ""
            if not isinstance(tgt,str): tgt=str(tgt)
            tgt=" ".join(tgt.split())[:150]
            w.write("%s\t%s\t%s\n" % (fmt_epoch(ts)[:19], nm, tgt)); n+=1
print("rows", n, out)
