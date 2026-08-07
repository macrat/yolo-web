import json, os, sys, glob
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import _parse_iso, fmt_epoch, LOG_DIR
MAIN = os.path.join(LOG_DIR, "a0ac882e-cdc1-4f59-ac46-0a182432701e.jsonl")
SUB = os.path.join(LOG_DIR, "a0ac882e-cdc1-4f59-ac46-0a182432701e", "subagents")
START=_parse_iso("2026-08-04T14:44:37+09:00"); END=_parse_iso("2026-08-07T09:08:05+09:00")
def tss(p):
    out=[]
    with open(p,encoding="utf-8",errors="replace") as fh:
        for line in fh:
            line=line.strip()
            if not line: continue
            try: d=json.loads(line)
            except Exception: continue
            t=d.get("timestamp")
            if not t: continue
            try: ts=_parse_iso(t)
            except Exception: continue
            if START<=ts<=END: out.append(ts)
    return out
m=tss(MAIN); allts=list(m)
for p in sorted(glob.glob(os.path.join(SUB,"*.jsonl"))): allts+=tss(p)
def gaps(ts,label,thr):
    ts=sorted(ts); print("=== %s gaps > %ds ==="%(label,thr))
    tot=0
    for a,b in zip(ts,ts[1:]):
        if b-a>thr:
            print("  %s -> %s  %6.2fh"%(fmt_epoch(a)[:19],fmt_epoch(b)[:19],(b-a)/3600)); tot+=b-a
    print("  合計 %.2fh / span %.2fh"%(tot/3600,(ts[-1]-ts[0])/3600))
gaps(allts,"merged",900)
print()
gaps(m,"main-only",1800)
# sub#5 の分布
p5=os.path.join(SUB,"agent-a4b99e.jsonl")
if os.path.exists(p5):
    t5=sorted(tss(p5)); print("\nagent-a4b99e (計画レビュー4巡) n=%d"%len(t5))
    for a,b in zip(t5,t5[1:]):
        if b-a>600: print("   gap %s -> %s %.2fh"%(fmt_epoch(a)[:19],fmt_epoch(b)[:19],(b-a)/3600))
p33=os.path.join(SUB,"agent-ad9a1c.jsonl")
if os.path.exists(p33):
    t=sorted(tss(p33)); print("\nagent-ad9a1c (表の修正・実装) n=%d  %s -> %s"%(len(t),fmt_epoch(t[0])[:19],fmt_epoch(t[-1])[:19]))
    for a,b in zip(t,t[1:]):
        if b-a>1800: print("   gap %s -> %s %.2fh"%(fmt_epoch(a)[:19],fmt_epoch(b)[:19],(b-a)/3600))
