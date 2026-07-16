# 理想回答者テスト(測度非依存): 各タイプ X×Y の「本人」がそのタイプを受け取るか。
#
# 「本人」のモデル(線形効用は使わない):
#   一点物(3点)の選択肢が並ぶ設問では、λ*w[X]+(1-λ)*w[Y] の最大化は λ>0.5 なら常に X を選んでしまい、
#   「X寄りとY寄りを併せて選ぶ人」を表現できない(検証で確認済み)。そこで分割モデルを使う。
#
#   X が「取れる」設問 = その設問で w[X] が最大の選択肢が存在し、その値が3(=主)である設問。
#     Q_X    : X だけ取れる      -> X-max を選ぶ
#     Q_Y    : Y だけ取れる      -> Y-max を選ぶ
#     Q_both : 両方取れる        -> X と Y に振り分ける(主軸 X に多い方を割り当てる)
#     Q_none : どちらも取れない  -> w[X]+w[Y] が最大の選択肢
#   Q_both の振り分け方は恣意的なので、ceil(|Q_both|/2) 個を X に割り当てる全組合せを試し、
#   「そのすべてで X×Y が一意に返る」ことを合格条件とする(最も厳しい取り方)。
#
#   X×X の本人 = 全12問で w[X] が最大の選択肢を選ぶ人。
#
# 判定が同点で複数タイプを返しうる場合は不合格(正直な判定)。
import itertools, numpy as np
from aw_common import ARCH, AI, DEFINED, lookup, load_weights, classify
from pathlib import Path as _P
_HERE = _P(__file__).resolve().parent            # __CY284_PATHS__
_ROOT = next(p for p in _HERE.parents if (p / "package.json").exists())


W = load_weights(str(_HERE / "archetype-weights.json"))  # (12,4,6)


def maxchoice(q, x, tiebreak):
    """設問qで w[x] を最大化する選択肢(同点は tiebreak の重みが高い方)"""
    b = W[q]
    m = int(b[:, AI[x]].max())
    cand = [i for i in range(4) if int(b[i][AI[x]]) == m]
    return max(cand, key=lambda i: (int(b[i][AI[tiebreak]]), -i))


def avail(q, x):
    return int(W[q][:, AI[x]].max()) >= 3


def scores_same(x):
    return sum(W[q][maxchoice(q, x, x)] for q in range(12))


def partition(x, y):
    QX, QY, QB, QN = [], [], [], []
    for q in range(12):
        ax, ay = avail(q, x), avail(q, y)
        (QB if (ax and ay) else QX if ax else QY if ay else QN).append(q)
    return QX, QY, QB, QN


def kmin(QX, QY, QB):
    """主軸 X の人は X寄りの回答数が Y寄りの回答数を上回る。それを満たす最小の k
    (k = Q_both のうち X に振る数)。最小 = 最も X×Y に寄った(最も厳しい)本人。"""
    k = (len(QY) - len(QX) + len(QB)) // 2 + 1
    return max(0, min(k, len(QB)))


def run(th, verbose=True):
    ok, fails = 0, []
    for x in ARCH:
        for y in ARCH:
            if (x, y) not in DEFINED:
                continue  # 逆順フォールバックのみの対は「本人」が一意に定まらないので対象外
            t = lookup(x, y)
            if x == y:
                s = scores_same(x)
                got = classify(s, th)
                if got == {t}:
                    ok += 1
                else:
                    fails.append((t, x, y, 0.0, dict(zip(ARCH, s.tolist())), sorted(got)))
                continue
            QX, QY, QB, QN = partition(x, y)
            base = np.zeros(6, dtype=np.int32)
            for q in QX:
                base = base + W[q][maxchoice(q, x, y)]
            for q in QY:
                base = base + W[q][maxchoice(q, y, x)]
            for q in QN:
                b = W[q]
                v = b[:, AI[x]] + b[:, AI[y]]
                base = base + b[int(np.argmax(v))]
            k = kmin(QX, QY, QB)  # X-answer 数が Y-answer 数を上回る最小の割り当て
            npass, bad, n = 0, None, 0
            for S in itertools.combinations(QB, k):
                tot = base.copy()
                for q in QB:
                    tot = tot + W[q][maxchoice(q, x, y) if q in S else maxchoice(q, y, x)]
                n += 1
                got = classify(tot, th)
                if got == {t}:
                    npass += 1
                elif bad is None:
                    bad = (dict(zip(ARCH, tot.tolist())), sorted(got))
            if npass == n:
                ok += 1
            else:
                fails.append((t, x, y, npass / n, bad[0], bad[1]))
    if verbose:
        print(f"--- th={th}: 理想回答者テスト 合格 {ok}/24 ---")
        for t, x, y, rate, s, got in fails:
            top = " ".join(f"{k}:{v}" for k, v in sorted(s.items(), key=lambda kv: -kv[1]))
            print(f"  x {t}  ({x} × {y})  合格率 {rate*100:.0f}%")
            print(f"      不合格例 {top}")
            print(f"      -> 返るタイプ {got}")
    return ok, fails


def gaps():
    same, cross = [], []
    for x in ARCH:
        for y in ARCH:
            if (x, y) not in DEFINED:
                continue
            if x == y:
                s = sorted(scores_same(x).tolist(), reverse=True)
                same.append((s[0] - s[1], lookup(x, y)))
            else:
                QX, QY, QB, QN = partition(x, y)
                base = np.zeros(6, dtype=np.int32)
                for q in QX:
                    base = base + W[q][maxchoice(q, x, y)]
                for q in QY:
                    base = base + W[q][maxchoice(q, y, x)]
                for q in QN:
                    b = W[q]
                    base = base + b[int(np.argmax(b[:, AI[x]] + b[:, AI[y]]))]
                k = kmin(QX, QY, QB)
                for S in itertools.combinations(QB, k):
                    tot = base.copy()
                    for q in QB:
                        tot = tot + W[q][maxchoice(q, x, y) if q in S else maxchoice(q, y, x)]
                    o = sorted(tot.tolist(), reverse=True)
                    cross.append((o[0] - o[1], lookup(x, y)))
    same.sort(); cross.sort()
    print(f"同型強化(X×X)の本人の gap: 最小 {same[0]}  最大 {same[-1]}")
    print(f"異型(X×Y)の本人の gap:     最小 {cross[0]}  最大 {cross[-1]}")
    lo, hi = cross[-1][0] + 1, same[0][0]
    print(f"-> th は max(異型gap)={cross[-1][0]} < th <= min(同型gap)={same[0][0]} が必要")
    print(f"-> 成立する th: {list(range(lo, hi+1)) if lo <= hi else 'なし(分離できていない)'}")


if __name__ == "__main__":
    print("アーキタイプ別 総配点(全48選択肢の合計):")
    tot = W.reshape(-1, 6).sum(0)
    for a in ARCH:
        print(f"  {a:10s} {tot[AI[a]]}  (主=3点の設問数 {sum(1 for q in range(12) if avail(q,a))})")
    print()
    gaps()
    print()
    best = None
    for th in range(3, 26):
        ok, _ = run(th, verbose=False)
        print(f"  th={th:2d} -> {ok}/24")
        if best is None or ok > best[0]:
            best = (ok, th)
    print(f"\n最良: th={best[1]} で {best[0]}/24\n")
    run(best[1])
