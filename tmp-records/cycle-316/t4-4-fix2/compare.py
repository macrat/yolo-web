# 前（c05d08e）と後の record.json を面・共有シートの有無・ボタンごとに比べる。
import json, sys, urllib.parse as up
before = json.load(open(sys.argv[1])); after = json.load(open(sys.argv[2]))
def norm(x): return json.loads(json.dumps(x).replace("localhost:3448", "localhost:3447").replace("localhost%3A3448", "localhost%3A3447"))
before, after = norm(before), norm(after)
key = lambda r: (r["surface"], r["webShare"])
B = {key(r): r for r in before}; A = {key(r): r for r in after}
for k in sorted(set(B) | set(A)):
    b, a = B.get(k), A.get(k)
    if not b or not a:
        print(k, "only in", "after" if a else "before"); continue
    diffs = []
    for f in ["shareVisible", "error", "clickErrors"]:
        if b.get(f) != a.get(f): diffs.append(f"{f}: {b.get(f)} -> {a.get(f)}")
    bg = [[x["text"] for x in g["buttons"]] for g in b["groups"]]
    ag = [[x["text"] for x in g["buttons"]] for g in a["groups"]]
    if bg != ag: diffs.append(f"buttons: {bg} -> {ag}")
    if b["aria"] != a["aria"]: diffs.append("aria differs")
    bc = {(c["group"], c["button"]): c for c in b.get("clicks", [])}
    ac = {(c["group"], c["button"]): c for c in a.get("clicks", [])}
    for ck in sorted(set(bc) | set(ac)):
        x, y = bc.get(ck), ac.get(ck)
        if not x or not y:
            diffs.append(f"click {ck} only in {'after' if y else 'before'}: " + json.dumps({f: (y or x)[f] for f in ['opened','copied','shared','gtag','status']}, ensure_ascii=False)); continue
        for f in ["opened", "copied", "shared", "gtag", "status"]:
            if x[f] != y[f]:
                diffs.append(f"click {ck} {f}: {json.dumps(x[f], ensure_ascii=False)} -> {json.dumps(y[f], ensure_ascii=False)}")
    print(k, "SAME" if not diffs else "")
    for d in diffs: print("   ", up.unquote(d))
