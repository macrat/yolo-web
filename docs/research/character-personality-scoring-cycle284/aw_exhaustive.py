# 全数検査: 4^12 = 16,777,216 通りの回答を全列挙し、新配点の真の性質を確定する(推定ではない)。
# meet-in-the-middle: 前半6問 4096通り x 後半6問 4096通り。
#
# 「同点(ambiguous)」の定義 = その回答に対して、判定規則が一意にタイプを決められない場合。
#   - 1位が複数 -> 主軸/副軸の選び方が不定。ただし逆順フォールバックにより同じタイプに落ちるなら一意。
#   - 1位が唯一で gap<th、かつ2位が複数 -> 副軸が不定。
#   - gap>=th なら副軸は無関係なので一意(X×X)。
# これが現行実装の「results配列の並び順で勝者が決まる」36.20% に対応する指標。
import sys, itertools, numpy as np
from aw_common import ARCH, DEFINED, lookup, load_weights

W = load_weights("tmp/cycle-284/archetype-weights.json")  # (12,4,6)
TYPES = sorted({lookup(x, y) for x in ARCH for y in ARCH})
TI = {t: i for i, t in enumerate(TYPES)}
NT = len(TYPES)


def build_tables(th):
    """mask(1位集合) -> (一意か, タイプid) / (勝者, 2位集合mask) -> (一意か, タイプid)"""
    tie_tab = np.full(64, -1, dtype=np.int16)   # 1位が複数のとき
    tie_amb = np.zeros(64, dtype=bool)
    for m in range(64):
        idx = [i for i in range(6) if m >> i & 1]
        if len(idx) < 2:
            continue
        ts = {lookup(ARCH[a], ARCH[b]) for a, b in itertools.permutations(idx, 2)}
        tie_amb[m] = len(ts) > 1
        tie_tab[m] = TI[sorted(ts)[0]] if ts else -1
    sec_tab = np.full((6, 64), -1, dtype=np.int16)  # 1位唯一 & gap<th のとき
    sec_amb = np.zeros((6, 64), dtype=bool)
    for x in range(6):
        for m in range(64):
            idx = [i for i in range(6) if m >> i & 1 and i != x]
            if not idx:
                continue
            ts = {lookup(ARCH[x], ARCH[b]) for b in idx}
            sec_amb[x, m] = len(ts) > 1
            sec_tab[x, m] = TI[sorted(ts)[0]]
    same = np.array([TI[lookup(a, a)] for a in ARCH], dtype=np.int16)
    return tie_tab, tie_amb, sec_tab, sec_amb, same


def half(qs):
    acc = np.zeros((1, 6), dtype=np.int16)
    for q in qs:
        acc = (acc[:, None, :] + q[None, :, :]).reshape(-1, 6)
    return acc


def run(th):
    tie_tab, tie_amb, sec_tab, sec_amb, same = build_tables(th)
    A, B = half(W[:6]), half(W[6:])
    N = A.shape[0] * B.shape[0]
    wins = np.zeros(NT, dtype=np.int64)
    amb = 0
    bit = (1 << np.arange(6)).astype(np.int16)
    for i in range(A.shape[0]):
        tot = A[i][None, :] + B                      # 4096 x 6
        mx = tot.max(1)
        ismax = tot == mx[:, None]
        nmax = ismax.sum(1)
        mask1 = (ismax * bit).sum(1)
        # 2位(1位を除いた最大)
        t2 = np.where(ismax, np.int16(-32000), tot)
        m2 = t2.max(1)
        mask2 = ((t2 == m2[:, None]) * bit).sum(1)
        winner = tot.argmax(1)
        gap = mx - m2

        multi = nmax > 1
        big = (~multi) & (gap >= th)
        small = (~multi) & (gap < th)

        res = np.empty(tot.shape[0], dtype=np.int16)
        a = np.zeros(tot.shape[0], dtype=bool)
        res[multi] = tie_tab[mask1[multi]]
        a[multi] = tie_amb[mask1[multi]]
        res[big] = same[winner[big]]
        res[small] = sec_tab[winner[small], mask2[small]]
        a[small] = sec_amb[winner[small], mask2[small]]
        np.add.at(wins, res, 1)
        amb += int(a.sum())
    return N, wins, amb


if __name__ == "__main__":
    for th in (10, 11):
        N, wins, amb = run(th)
        print(f"===== 閾値 th={th} / 全 {N:,} 通り =====")
        print(f"同点(タイプが一意に決まらない): {amb:,} / {N:,} = {amb/N*100:.2f}%   (現行実装は 36.20%)")
        order = np.argsort(-wins)
        zero = [TYPES[i] for i in range(NT) if wins[i] == 0]
        print(f"到達不能タイプ: {len(zero)} 件 {zero}")
        print(f"当選率(公平なら各 {100/NT:.2f}%)  最大 {wins[order[0]]/N*100:.2f}% ({TYPES[order[0]]})"
              f" / 最小 {wins[order[-1]]/N*100:.2f}% ({TYPES[order[-1]]})"
              f" / 比 {wins[order[0]]/max(wins[order[-1]],1):.1f}倍")
        for i in order:
            print(f"    {wins[i]/N*100:6.2f}%  {TYPES[i]}")
        print()
