"""cycle-stats 共通モジュール

セッションログ (JSONL) の走査と、サイクル期間への割り当てを行う。
数え方の規則は同ディレクトリの METHOD.md を参照。
"""

import glob
import json
import os
import re
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# 設定
# ---------------------------------------------------------------------------

PROJECT_DIR = "/mnt/data/yolo-web"
LOG_DIR = "/home/node/.claude/projects/-mnt-data-yolo-web"

# 無活動とみなす閾値 (秒)。連続するレコードの間隔がこれを超えたら
# 「動いていなかった」とみなして稼働時間に加算しない。METHOD.md 参照。
IDLE_GAP_SEC = 300

# サブエージェント起動とみなすツール名
AGENT_TOOL_NAMES = {"Agent", "Task"}

# サイクルに割り当てられなかったレコードの置き場 (JSON のキーにするため文字列)
UNASSIGNED = "__UNASSIGNED__"      # timestamp はあるが、どのサイクル期間にも入らない
NO_TIMESTAMP = "__NO_TIMESTAMP__"  # timestamp フィールドを持たない

USAGE_FIELDS = (
    "input_tokens",
    "output_tokens",
    "cache_creation_input_tokens",
    "cache_read_input_tokens",
)

CYCLE_RE = re.compile(r"cycle-(\d{1,4})")


# ---------------------------------------------------------------------------
# サイクル定義
# ---------------------------------------------------------------------------

def _parse_iso(s):
    """ISO-8601 文字列 -> UTC epoch 秒 (float)。"""
    s = s.strip().strip('"').strip("'")
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        raise ValueError("timezone-naive timestamp: %r" % s)
    return dt.astimezone(timezone.utc).timestamp()


def fmt_epoch(ep, tz_offset_hours=9):
    """epoch 秒 -> JST 表記の文字列。"""
    if ep is None:
        return "-"
    from datetime import timedelta
    tz = timezone(timedelta(hours=tz_offset_hours))
    return datetime.fromtimestamp(ep, tz).isoformat()


def load_cycles(project_dir=PROJECT_DIR):
    """docs/cycles/cycle-*/index.md (または cycle-*.md) の frontmatter から
    started_at / completed_at を読む。

    戻り値: [{"id": 301, "name": "cycle-301", "start": epoch, "end": epoch, "path": ...}, ...]
    開始時刻の昇順。completed_at が無いサイクルは end=None (未完了) として除外せずに残すが、
    レコード割り当てには使えないので end=None のものはスキップする。
    """
    cycles = []
    for p in glob.glob(os.path.join(project_dir, "docs/cycles/cycle-*")):
        base = os.path.basename(p)
        f = os.path.join(p, "index.md") if os.path.isdir(p) else p
        if not os.path.exists(f):
            continue
        name = base[:-3] if base.endswith(".md") else base
        m = re.match(r"cycle-(\d+)", name)
        if not m:
            continue
        with open(f, encoding="utf-8") as fh:
            head = fh.read(8000)
        s = re.search(r"^started_at:\s*(\S+)", head, re.M)
        c = re.search(r"^completed_at:\s*(\S+)", head, re.M)
        if not s:
            continue
        cycles.append({
            "id": int(m.group(1)),
            "name": name,
            "path": f,
            "start": _parse_iso(s.group(1)),
            "end": _parse_iso(c.group(1)) if c else None,
            "started_at": s.group(1),
            "completed_at": c.group(1) if c else None,
        })
    cycles.sort(key=lambda c: c["start"])
    return cycles


def build_cycle_index(cycles):
    """割り当てに使える (end があり end >= start の) サイクルだけを開始時刻順に返す。

    frontmatter が壊れているサイクル (completed_at < started_at) は除外する。
    実測では cycle-19 が該当 (2026-02 の古いサイクルで、セッションログの範囲外)。
    """
    out = []
    for c in cycles:
        if c["end"] is None:
            continue
        if c["end"] < c["start"]:
            c["invalid_window"] = True
            continue
        out.append(c)
    return out


def assign_cycle(ts, lookup):
    """timestamp(epoch) が属するサイクル名を返す。どこにも属さなければ None。

    区間は [started_at, completed_at] の閉区間。
    サイクル期間が重なっている場合 (実測では cycle-12/13 と cycle-194/195 の2組。
    いずれも 2026-02〜05 でセッションログの範囲外) は、
    **started_at がより遅いサイクル** を採用する (決定的にするための規則)。
    """
    import bisect
    starts = lookup["starts"]
    arr = lookup["list"]
    max_dur = lookup["max_dur"]
    i = bisect.bisect_right(starts, ts) - 1
    while i >= 0:
        c = arr[i]
        if c["start"] <= ts <= c["end"]:
            return c["name"]
        if c["start"] < ts - max_dur:
            break
        i -= 1
    return None


def make_lookup(cycles):
    usable = build_cycle_index(cycles)
    max_dur = max((c["end"] - c["start"]) for c in usable) if usable else 0
    return {"list": usable, "starts": [c["start"] for c in usable], "max_dur": max_dur}


# ---------------------------------------------------------------------------
# ログファイルの列挙
# ---------------------------------------------------------------------------

def list_main_sessions(log_dir=LOG_DIR):
    """メインセッションの JSONL パス一覧 (ソート済み)。"""
    return sorted(glob.glob(os.path.join(log_dir, "*.jsonl")))


def list_subagents(session_path):
    """あるメインセッションに属するサブエージェント JSONL パス一覧。"""
    sid = os.path.basename(session_path)[:-len(".jsonl")]
    return sorted(glob.glob(os.path.join(os.path.dirname(session_path), sid, "subagents", "*.jsonl")))


# ---------------------------------------------------------------------------
# 1ファイルの走査
# ---------------------------------------------------------------------------

class FileScan:
    """1つの JSONL ファイルを走査した結果。

    per_cycle: {cycle_name or None: {...集計...}}
    """

    def __init__(self, path):
        self.path = path
        self.total_lines = 0        # 空行を除く全行数
        self.parse_failures = 0
        self.records = 0            # JSON としてパースできたレコード数
        self.no_timestamp = 0       # timestamp フィールドを持たないレコード数
        self.assistant_records = 0
        self.assistant_no_usage = 0  # assistant なのに usage が無いレコード数
        self.usage_bearing = 0      # usage を持つ「レコード」数 (重複排除前)
        self.first_ts = None
        self.last_ts = None
        self.cycle_mentions = {}    # "cycle-301" -> 出現回数 (行テキストの正規表現マッチ)
        self.per_cycle = {}
        self.timeline = {}          # cycle -> [ts, ...] (稼働時間計算用)

    def bucket(self, cycle):
        b = self.per_cycle.get(cycle)
        if b is None:
            b = {
                "records": 0,
                "no_timestamp": 0,
                "user_messages": 0,
                "assistant_responses": 0,   # message.id で重複排除した数
                "assistant_records": 0,
                "tool_calls": 0,
                "subagent_launches": 0,
                "input_tokens": 0,
                "output_tokens": 0,
                "cache_creation_input_tokens": 0,
                "cache_read_input_tokens": 0,
            }
            self.per_cycle[cycle] = b
        return b


def scan_file(path, lookup, count_cycle_mentions=True):
    """JSONL を1本走査する。

    重要: Claude Code は 1回の API 応答を、content ブロックごとに複数の
    assistant レコードとして書き出す。それらは同じ message.id を持ち、
    usage オブジェクトも全く同じ内容が繰り返される。そのままレコード単位で
    足すとトークンが数倍に膨れるため、message.id 単位で1回だけ加算する。
    """
    sc = FileScan(path)
    seen_msg_ids = set()
    seen_tool_ids = set()

    with open(path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            sc.total_lines += 1

            if count_cycle_mentions:
                for m in CYCLE_RE.finditer(line):
                    key = "cycle-" + str(int(m.group(1)))
                    sc.cycle_mentions[key] = sc.cycle_mentions.get(key, 0) + 1

            try:
                d = json.loads(line)
            except Exception:
                sc.parse_failures += 1
                continue
            sc.records += 1

            ts_raw = d.get("timestamp")
            if ts_raw:
                try:
                    ts = _parse_iso(ts_raw)
                except Exception:
                    ts = None
            else:
                ts = None

            if ts is None:
                sc.no_timestamp += 1
                cycle = NO_TIMESTAMP
            else:
                if sc.first_ts is None or ts < sc.first_ts:
                    sc.first_ts = ts
                if sc.last_ts is None or ts > sc.last_ts:
                    sc.last_ts = ts
                cycle = assign_cycle(ts, lookup) or UNASSIGNED

            b = sc.bucket(cycle)
            b["records"] += 1
            if ts is None:
                b["no_timestamp"] += 1
            else:
                sc.timeline.setdefault(cycle, []).append(ts)

            t = d.get("type")
            if t == "user":
                b["user_messages"] += 1
            elif t == "assistant":
                sc.assistant_records += 1
                b["assistant_records"] += 1
                msg = d.get("message") or {}
                mid = msg.get("id")
                usage = msg.get("usage")
                if usage:
                    sc.usage_bearing += 1
                else:
                    sc.assistant_no_usage += 1
                # usage は message.id 単位で1回だけ加算
                key = mid if mid else ("uuid:" + str(d.get("uuid")))
                if key not in seen_msg_ids:
                    seen_msg_ids.add(key)
                    b["assistant_responses"] += 1
                    if usage:
                        for f in USAGE_FIELDS:
                            v = usage.get(f)
                            if isinstance(v, int):
                                b[f] += v
                # ツール呼び出しは content ブロック単位。ブロック id で重複排除。
                content = msg.get("content")
                if isinstance(content, list):
                    for blk in content:
                        if not isinstance(blk, dict) or blk.get("type") != "tool_use":
                            continue
                        bid = blk.get("id") or (str(mid) + ":" + str(blk.get("name")))
                        if bid in seen_tool_ids:
                            continue
                        seen_tool_ids.add(bid)
                        b["tool_calls"] += 1
                        if blk.get("name") in AGENT_TOOL_NAMES:
                            b["subagent_launches"] += 1
    return sc


def active_seconds(timestamps, idle_gap=IDLE_GAP_SEC):
    """タイムスタンプ列から「稼働していた秒数」を求める。

    昇順に並べ、隣り合うレコードの間隔が idle_gap 以下ならその間隔を加算、
    超えたら無活動とみなして加算しない (0秒扱い)。
    """
    if not timestamps:
        return 0.0
    ts = sorted(timestamps)
    total = 0.0
    for a, b in zip(ts, ts[1:]):
        gap = b - a
        if 0 <= gap <= idle_gap:
            total += gap
    return total
