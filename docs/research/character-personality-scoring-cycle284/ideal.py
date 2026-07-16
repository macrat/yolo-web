# 測度非依存の検証: 各タイプの点数を最大化する回答(=そのタイプ「本人」)が、
# 実際にそのタイプを受け取るか。回答分布の仮定を一切必要としない。
import re, numpy as np
from pathlib import Path as _P
_HERE = _P(__file__).resolve().parent            # __CY284_PATHS__
_ROOT = next(p for p in _HERE.parents if (p / "package.json").exists())

src=open(str(_ROOT / "src/play/quiz/data/character-personality.ts"),encoding="utf-8").read()
res_ids=[]
for f in ["batch1","batch2","batch3"]:
    b=open(str(_ROOT / f"src/play/quiz/data/character-personality-results-{f}.ts"),encoding="utf-8").read()
    res_ids+=re.findall(r'\n    id: "([a-z-]+)",\n    title:', b)
idx={t:i for i,t in enumerate(res_ids)}; T=len(res_ids)
qs=[]
for qm in re.finditer(r'id: "(q\d+)",\s*\n\s*text:.*?choices: \[(.*?)\n      \],', src, re.S):
    ch=[]
    for cm in re.finditer(r'points: \{(.*?)\}', qm.group(2), re.S):
        v=np.zeros(T,dtype=np.int32)
        for k,p in re.findall(r'"([a-z-]+)":\s*(\d+)', cm.group(1)): v[idx[k]]=int(p)
        ch.append(v)
    qs.append(np.stack(ch))
assert len(qs)==12
fails=[]
for ti,t in enumerate(res_ids):
    # そのタイプの点数を最大化する回答を各設問で選ぶ(=「本人」)
    total=np.zeros(T,dtype=np.int32)
    for q in qs: total += q[int(np.argmax(q[:,ti]))]
    best=total.max()
    winner=res_ids[int(np.argmax(total==best))]  # 配列順で最初の最大 = 実装
    tied=[res_ids[i] for i in range(T) if total[i]==best]
    if winner!=t:
        fails.append((t,total[ti],winner,best,tied))
print(f"=== 理想回答者テスト: 全{T}タイプ ===")
print(f"自分のタイプを受け取れない: {len(fails)} / {T}\n")
for t,own,w,b,tied in fails:
    print(f"  ✗ {t}")
    print(f"      本人の最高点 {own}点 -> 実際に返るのは「{w}」({b}点)")
    print(f"      同点だった: {tied}  (配列index: {[idx[x] for x in tied]})")
