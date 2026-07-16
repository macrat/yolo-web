# 4^12 = 16,777,216 通りの回答を全数列挙し、判定の真の性質を確定する(推定ではない)
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
        v=np.zeros(T,dtype=np.int16)
        for k,p in re.findall(r'"([a-z-]+)":\s*(\d+)', cm.group(1)): v[idx[k]]=int(p)
        ch.append(v)
    if ch: qs.append(np.stack(ch))
assert len(qs)==12 and all(q.shape[0]==4 for q in qs), [q.shape for q in qs]
print(f"設問12問x4択・タイプ{T} -> 全組合せ {4**12:,}通りを全数列挙")

def half(quests):
    acc=np.zeros((1,T),dtype=np.int16)
    for q in quests: acc=(acc[:,None,:]+q[None,:,:]).reshape(-1,T)
    return acc
A=half(qs[:6]); B=half(qs[6:])          # 4096 x 24 ずつ
print(f"前半{A.shape[0]:,}通り x 後半{B.shape[0]:,}通り = {A.shape[0]*B.shape[0]:,}")
wins=np.zeros(T,dtype=np.int64); ties=0; tie_wins=np.zeros(T,dtype=np.int64)
for i in range(A.shape[0]):
    tot=A[i][None,:]+B                   # 4096 x 24
    mx=tot.max(axis=1, keepdims=True)
    ismax=(tot==mx)
    nmax=ismax.sum(axis=1)
    win=ismax.argmax(axis=1)             # 配列順で最初の最大 = 実装の tie-break
    np.add.at(wins,win,1)
    t=nmax>1; ties+=int(t.sum()); np.add.at(tie_wins,win[t],1)
N=4**12
print(f"\n=== 全数検査の結果(推定でなく真値) ===")
print(f"同点(トップが複数)の組合せ: {ties:,} / {N:,} = {ties/N*100:.2f}%")
print(f"  -> この割合の回答は、配点でなく results 配列の並び順でタイプが決まる")
order=np.argsort(-wins)
print(f"\n当選率(公平なら各 {100/T:.2f}%)")
print("  上位6:")
for i in order[:6]: print(f"    {wins[i]/N*100:6.2f}%  {res_ids[i]}")
print("  下位6:")
for i in order[-6:]: print(f"    {wins[i]/N*100:6.2f}%  {res_ids[i]}")
print(f"\n最大/最小の比: {wins[order[0]]/max(wins[order[-1]],1):.0f}倍")
print(f"当選率0のタイプ: {[res_ids[i] for i in range(T) if wins[i]==0]}")
print(f"配列先頭 {res_ids[0]}: {wins[0]/N*100:.2f}%  / 同点勝ちで得た分 {tie_wins[0]/max(wins[0],1)*100:.0f}%")
