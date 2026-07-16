# cycle-284: アーキタイプ配点の共通ロジック(判定規則の実装)
# 規則: 12問の回答 -> 6アーキタイプ得点 -> 1位=主軸, 2位=副軸
#       gap(1位-2位) >= 閾値 なら 主軸×主軸(同型強化), そうでなければ 主軸×副軸
import json, itertools, numpy as np
from pathlib import Path as _P
_HERE = _P(__file__).resolve().parent            # __CY284_PATHS__
_ROOT = next(p for p in _HERE.parents if (p / "package.json").exists())


ARCH = ["commander", "professor", "dreamer", "trickster", "guardian", "artist"]
AI = {a: i for i, a in enumerate(ARCH)}

# コード註 (// #N — A × B) から確定した順序対 -> タイプ
DEFINED = {
    ("commander", "professor"): "blazing-strategist",     # #1
    ("commander", "dreamer"): "blazing-poet",             # #2
    ("commander", "trickster"): "blazing-schemer",        # #3
    ("commander", "guardian"): "blazing-warden",          # #4
    ("commander", "artist"): "blazing-canvas",            # #5
    ("professor", "dreamer"): "dreaming-scholar",         # #6
    ("professor", "trickster"): "contrarian-professor",   # #7
    ("professor", "guardian"): "careful-scholar",         # #8
    ("professor", "artist"): "academic-artist",           # #9
    ("dreamer", "trickster"): "star-chaser",              # #10
    ("dreamer", "guardian"): "tender-dreamer",            # #11
    ("dreamer", "artist"): "dreaming-canvas",             # #12
    ("trickster", "guardian"): "clever-guardian",         # #13
    ("trickster", "artist"): "creative-disruptor",        # #14
    ("guardian", "artist"): "gentle-fortress",            # #15
    ("commander", "commander"): "ultimate-commander",     # #16
    ("professor", "professor"): "endless-researcher",     # #17
    ("dreamer", "dreamer"): "eternal-dreamer",            # #18
    ("trickster", "trickster"): "ultimate-trickster",     # #19
    ("guardian", "guardian"): "ultimate-guardian",        # #20
    ("artist", "artist"): "ultimate-artist",              # #21
    ("guardian", "professor"): "data-fortress",           # #22 (#8の逆順)
    ("artist", "trickster"): "vibe-rebel",                # #23 (#14の逆順)
    ("guardian", "commander"): "guardian-charger",        # #24 (#4の逆順)
}
ALL_TYPES = sorted(set(DEFINED.values()))
assert len(ALL_TYPES) == 24


def lookup(x, y):
    """主軸x・副軸y -> タイプ。順序対が無ければ逆順で引く。"""
    return DEFINED.get((x, y)) or DEFINED[(y, x)]


# 36通りすべてが実在タイプに写像できることを確認
assert all(lookup(x, y) in ALL_TYPES for x in ARCH for y in ARCH)
assert len({lookup(x, y) for x in ARCH for y in ARCH}) == 24


def load_weights(path=str(_HERE / "archetype-weights.json")):
    w = json.load(open(path, encoding="utf-8"))
    qs = []
    for q in range(1, 13):
        block = []
        for c in "abcd":
            key = f"q{q}-{c}"
            assert key in w, f"欠落: {key}"
            d = w[key]
            assert set(d) <= set(ARCH), f"未知のアーキタイプ: {key} {d}"
            v = np.zeros(6, dtype=np.int32)
            for a, p in d.items():
                v[AI[a]] = p
            block.append(v)
        qs.append(np.stack(block))
    assert len(w) == 48, f"選択肢数 {len(w)} != 48"
    return np.stack(qs)  # (12, 4, 6)


def classify(scores, th):
    """得点ベクトル -> 決定されうるタイプの集合(同点を潰さない・正直な集合)"""
    s = list(scores)
    m1 = max(s)
    A = [i for i in range(6) if s[i] == m1]
    if len(A) >= 2:
        # 1位が同点 -> gap=0 なので必ず 主軸×副軸。主軸/副軸の選び方が不定。
        return {lookup(ARCH[x], ARCH[y]) for x, y in itertools.permutations(A, 2)}
    x = A[0]
    rest = [s[i] for i in range(6) if i != x]
    m2 = max(rest)
    if m1 - m2 >= th:
        return {lookup(ARCH[x], ARCH[x])}
    B = [i for i in range(6) if i != x and s[i] == m2]
    return {lookup(ARCH[x], ARCH[y]) for y in B}
