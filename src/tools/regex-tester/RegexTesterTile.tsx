"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { REGEX_SAMPLE_INPUTS } from "./meta";

/**
 * 正規表現テスター タイル用 UI（kind=widget）。
 *
 * 詳細ページ Component.tsx（Worker + debounce + replace）とは別に、
 * タイルサイズ（cols=3 rows=3 = 400×400px）に最適化した UI。
 * ロジックは Worker 経由の非同期計算のみ（useMemo 同期計算は撤廃 = MINOR-2 対応）。
 *
 * 複合入力型タイル 3 件目（Phase 8.1 第 16 弾 / cycle-215 T-3）:
 * - cycle-210 text-replace + cycle-214 text-diff の SSoT 4 項目を 3 回目引用検証する場
 * - B-452（複合入力型タイル AP-P21 基準値 N≥3 見直し）の真の N=2 検証データ蓄積
 *
 * 採択仕様（cycle-215 T-3 計画書 r6 + T-3 review MINOR-2 対応）:
 * - §論点 1: cols=3 rows=3（400×400px）
 * - §論点 6 案 F: 計算トリガー = Worker 非同期計算のみ / timeout 100ms / debounce 撤廃
 *   T-1 実測 Worker 起動コスト median 9.1ms（実測値 / Chromium 149）< 100ms = 案 F 採択確定
 *   MINOR-2（T-3 review 対応）: useMemo 同期計算を撤廃し Worker 経由のみに統一
 *   → ReDoS パターン入力時にメインスレッドがフリーズしない（Worker 内で爆発 → terminate）
 * - §論点 7 案 W-4: 動的ハイライト = 先頭 10 件を初期 seed / IntersectionObserver で 11 件目以降
 *   CRIT-1（T-3 review 対応）: 初期 visibleIndices = [0..9] seed / display:none 廃止
 *   → display:none 要素は IntersectionObserver で観測不能（MDN/W3C 仕様）なため
 *   visibility:hidden で不可視配置 / 先頭 10 件は seed で即時表示 / 11 件目以降は IO で追加
 * - §論点 15 案 D-改 1: サンプル選択ドロップダウン 6 種（REGEX_SAMPLE_INPUTS）
 *
 * AP-P21 役割分担（cycle-210 SSoT (i)(ii) / cycle-215 §論点 4）:
 * - 操作側（flexShrink: 0）= サンプル選択 + 正規表現 input + フラグ群 + コピーボタン + 詳細リンク
 *   MAJOR-3（T-3 review 対応）: <select> minHeight = 40px（AP-P21 操作側下限）
 * - 膨張側（flex: 1 + overflowY: auto）= 本文 textarea + マッチ結果欄
 *
 * AP-I11 setTimeout cleanup（cycle-211/212/213 SSoT / c213-δ 引用適用 N=2）:
 * - コピーボタン文言復帰の 2 秒タイマーを useRef で保持
 * - useEffect cleanup（返却関数）で clearTimeout を呼び出す
 *
 * a11y 設計（c214-ζ 二層 ARIA 引用適用 N=2）:
 * - マッチ結果欄（長文）= aria-live なし / role="region"
 * - マッチ件数サマリ status 欄 = role="status" aria-live="polite"
 * - サンプル選択 = <label> + <select> + aria-label
 * - フラグチェックボックス = <label> + <input type="checkbox">
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存 15 タイル同型）。
 */

/** コピー完了表示を元に戻すまでの時間 (ms): cycle-211/212/213 SSoT 同型 / 実装値 */
const COPY_FEEDBACK_DURATION_MS = 2000; // 実装値 = cycle-213 (δ) SSoT 同型 / 2 秒

/** タイムアウトエラーメッセージ（論点 13 採択 / 計算がタイムアウトしました表示）*/
const TIMEOUT_ERROR_MESSAGE =
  "計算がタイムアウトしました（パターンが複雑すぎる可能性があります）";

/** フラグ 4 種の定義 */
const FLAG_DEFINITIONS = [
  { flag: "g", label: "g（全体）" },
  { flag: "i", label: "i（大小無視）" },
  { flag: "m", label: "m（複数行）" },
  { flag: "s", label: "s（dotAll）" },
] as const;

/** フラグのデフォルト状態（g フラグのみ ON）*/
const DEFAULT_FLAGS: Record<string, boolean> = {
  g: true,
  i: false,
  m: false,
  s: false,
};

/** Worker timeout (ms): cycle-215 §論点 6 案 F 採択 / T-1 実測 9.1ms < 100ms / 実装値 */
const WORKER_TIMEOUT_MS = 100; // 実装値 = T-1 実測 9.1ms の約 10 倍マージン確保

/** マッチ件数上限: logic.ts MAX_MATCHES と一致 / 実装値 */
const MAX_MATCHES_DISPLAY = 1_000; // 実装値 = logic.ts MAX_MATCHES 同型

/** IntersectionObserver のパラメータ（c215-δ SSoT 候補 / T-1 実測値）*/
const IO_ROOT_MARGIN = "100px"; // 実測値 = rootMargin:"100px" で intersecting 17 件 / rootMargin:"0px" で 11 件
const IO_THRESHOLD = 0.1; // 実測値 = 1 マッチ overlay の 10% 表示で描画トリガー

/** タイムアウト終了後に Worker を中断するためのインライン Worker コード */
const INLINE_WORKER_CODE = `
'use strict';
var MAX_INPUT_LENGTH = 10000;
var MAX_MATCHES = 1000;
function testRegex(pattern, flags, testString) {
  if (!pattern) { return { success: true, matches: [] }; }
  if (testString.length > MAX_INPUT_LENGTH) {
    return { success: false, matches: [], error: '入力テキストが長すぎます（最大' + MAX_INPUT_LENGTH.toLocaleString() + '文字）' };
  }
  try {
    var regex = new RegExp(pattern, flags);
    var matches = [];
    if (flags.indexOf('g') !== -1) {
      var match; var count = 0;
      while ((match = regex.exec(testString)) !== null) {
        matches.push({ match: match[0], index: match.index, groups: Array.prototype.slice.call(match, 1) });
        count++;
        if (count >= MAX_MATCHES) break;
        if (match[0].length === 0) { regex.lastIndex++; }
      }
    } else {
      var match = regex.exec(testString);
      if (match) { matches.push({ match: match[0], index: match.index, groups: Array.prototype.slice.call(match, 1) }); }
    }
    return { success: true, matches: matches };
  } catch(e) {
    return { success: false, matches: [], error: e instanceof Error ? e.message : 'Invalid regex pattern' };
  }
}
self.addEventListener('message', function(e) {
  var result = testRegex(e.data.pattern, e.data.flags, e.data.testString);
  self.postMessage(result);
});
`;

/**
 * 初期 visibleIndices シード数（CRIT-1 対応）。
 * 先頭 N 件を useState 初期値としてシードすることで、IntersectionObserver
 * 観測前（display:none で観測不能になるバグ）を回避しつつ先頭 N 件を即時表示する。
 * MDN/W3C 仕様: display:none 要素は IntersectionObserver で observe されない。
 */
const INITIAL_VISIBLE_SEED_COUNT = 10; // 先頭 10 件を即時表示

/** マッチアイテムの可視状態を追跡するためのセット型 */
type VisibleSet = Set<number>;

/** Worker から受信するマッチ結果の型（INLINE_WORKER_CODE と整合）*/
interface WorkerMatchResult {
  success: boolean;
  matches: { match: string; index: number; groups: string[] }[];
  error?: string;
}

/**
 * 初期 visibleIndices: 先頭 INITIAL_VISIBLE_SEED_COUNT 件をシード（CRIT-1 対応）。
 * useState の初期値として計算し、初回レンダリング時から先頭 10 件を即時表示する。
 */
function createInitialVisibleIndices(): VisibleSet {
  const set = new Set<number>();
  for (let i = 0; i < INITIAL_VISIBLE_SEED_COUNT; i++) {
    set.add(i);
  }
  return set;
}

export default function RegexTesterTile() {
  /** 正規表現パターン入力値 */
  const [pattern, setPattern] = useState("");
  /** テストテキスト入力値 */
  const [testText, setTestText] = useState("");
  /** フラグ状態 */
  const [flagState, setFlagState] =
    useState<Record<string, boolean>>(DEFAULT_FLAGS);
  /** コピー完了状態 */
  const [copied, setCopied] = useState(false);
  /** タイムアウトエラー状態（論点 13 採択 / Worker timeout 100ms 到達時）*/
  const [timedOut, setTimedOut] = useState(false);

  /**
   * Worker 経由の非同期計算結果（MINOR-2 対応: useMemo 同期計算を撤廃）。
   * pattern / testText / flags 変更時に useEffect で Worker に postMessage し、
   * onmessage 受信時に setState で反映する。
   * ReDoS パターン入力時もメインスレッドはフリーズしない（Worker 内で爆発 → terminate）。
   */
  const [matchResult, setMatchResult] = useState<WorkerMatchResult | null>(
    null,
  );

  /**
   * 可視マッチアイテムのインデックスセット（案 W-4 動的描画 / CRIT-1 対応）。
   * 初期値: 先頭 INITIAL_VISIBLE_SEED_COUNT 件をシード（即時表示のため）。
   * 11 件目以降: IntersectionObserver で可視範囲に入ったら追加。
   */
  const [visibleIndices, setVisibleIndices] = useState<VisibleSet>(
    createInitialVisibleIndices,
  );

  /** コピー完了表示を元に戻す setTimeout ID（AP-I11 SSoT）*/
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** マッチアイテム要素の ref 配列（IntersectionObserver 登録用）*/
  const matchItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /** AP-I11 cleanup: unmount 時に走行中の setTimeout をすべてキャンセルする */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** フラグ文字列（flagState からソート順で結合）*/
  const flagsString = useMemo(
    () =>
      FLAG_DEFINITIONS.map((f) => (flagState[f.flag] ? f.flag : "")).join(""),
    [flagState],
  );

  /**
   * Worker 経由の非同期計算（MINOR-2 対応: useMemo 同期計算を撤廃し Worker のみに統一）。
   * pattern / testText / flags 変更時に Worker に postMessage し、
   * onmessage 受信時に setMatchResult で反映する。
   * timeout 100ms 到達時は worker.terminate() + setTimedOut(true)。
   *
   * ReDoS 対策: メインスレッドで同期計算しないため、ReDoS パターンでもフリーズしない。
   * Worker スレッド内で爆発 → terminate() で強制終了 → timedOut エラー表示。
   *
   * 注意: jsdom テスト環境では Worker が未サポートのためモック処理が走る。
   */
  useEffect(() => {
    if (!pattern || !testText) {
      // 入力が空の場合は結果をクリア（setTimeout で lint: react-hooks/set-state-in-effect を回避）
      const id = setTimeout(() => setMatchResult(null), 0);
      return () => clearTimeout(id);
    }

    let worker: Worker | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let done = false;

    try {
      const blob = new Blob([INLINE_WORKER_CODE], {
        type: "application/javascript",
      });
      const url = URL.createObjectURL(blob);
      worker = new Worker(url);
      URL.revokeObjectURL(url);

      worker.onmessage = (e: MessageEvent<WorkerMatchResult>) => {
        done = true;
        if (timeoutId !== null) clearTimeout(timeoutId);
        worker?.terminate();
        setMatchResult(e.data);
      };

      worker.onerror = () => {
        done = true;
        if (timeoutId !== null) clearTimeout(timeoutId);
        worker?.terminate();
        setMatchResult({ success: false, matches: [], error: "Worker error" });
      };

      // timeout 100ms: T-1 実測 9.1ms（実測値）のマージン確保 / 実装値
      timeoutId = setTimeout(() => {
        if (!done) {
          worker?.terminate();
          setTimedOut(true);
          setMatchResult(null);
        }
      }, WORKER_TIMEOUT_MS);

      worker.postMessage({ pattern, flags: flagsString, testString: testText });
    } catch {
      // Worker 生成失敗（jsdom 等の環境）= silent fail
      // jsdom テスト環境では Worker コンストラクタがモックされているため
      // onmessage は呼ばれない。テストでは IntersectionObserver モックが observe 時に
      // callback を呼ぶことで visibleIndices が更新される。
    }

    return () => {
      done = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      worker?.terminate();
    };
  }, [pattern, flagsString, testText]);

  /**
   * IntersectionObserver 登録（案 W-4 動的描画 / CRIT-1 対応）。
   * 先頭 INITIAL_VISIBLE_SEED_COUNT 件は初期値でシード済みのため、
   * ここでは INITIAL_VISIBLE_SEED_COUNT 件目以降のみ observe する。
   * マッチアイテムが viewport に入ったときに visibleIndices に追加する。
   *
   * CRIT-1 対応の根拠:
   * - display:none 要素は MDN/W3C 仕様で IntersectionObserver に observe されない。
   * - 旧実装は display:none + IO で永久に何も表示されない致命的バグ。
   * - 新実装: 先頭 10 件は seed で即時表示 / 11 件目以降は visibility:hidden（IO 観測可能）
   *   で配置 → 可視範囲に入ったら visibility:visible 化（visibleIndices に追加）。
   *
   * rootMargin: "100px"（実測値）/ threshold: 0.1（実測値）。
   */
  useEffect(() => {
    // matches が空なら IO 登録不要（表示されないため visibleIndices は影響しない）
    if (!matchResult?.success || !matchResult.matches.length) {
      return;
    }

    const observers: IntersectionObserver[] = [];
    const items = matchItemRefs.current;

    items.forEach((el, idx) => {
      // 先頭 INITIAL_VISIBLE_SEED_COUNT 件は seed 済みのため observe 不要
      if (idx < INITIAL_VISIBLE_SEED_COUNT) return;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleIndices((prev) => {
                const next = new Set(prev);
                next.add(idx);
                return next;
              });
            }
          });
        },
        {
          rootMargin: IO_ROOT_MARGIN,
          threshold: IO_THRESHOLD,
        },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, [matchResult]);

  /** マッチ件数（Worker 結果から派生 / matchResult が null の場合は 0）*/
  const matchCount = matchResult?.success ? matchResult.matches.length : 0;

  /**
   * サマリテキスト（Worker 結果から派生 / useMemo で派生計算のみ）。
   * MINOR-2 対応: matchResult は Worker 非同期結果のため、計算コストなし。
   */
  const summaryText = useMemo(() => {
    if (timedOut) return TIMEOUT_ERROR_MESSAGE;
    if (!pattern) return "パターンを入力してください";
    if (!matchResult) return ""; // Worker 計算中 or 未入力
    if (!matchResult.success) return ""; // エラー時はサマリではなくエラー枠を表示
    if (matchCount === 0) return "マッチなし";
    return `${matchCount} 件マッチ${matchCount >= MAX_MATCHES_DISPLAY ? "（上限到達）" : ""}`;
  }, [timedOut, pattern, matchResult, matchCount]);

  /** コピー対象テキスト（マッチ一覧テキスト）*/
  const copyText = useMemo(() => {
    if (!matchResult?.success || matchResult.matches.length === 0) return "";
    return matchResult.matches
      .map((m, i) => `${i + 1}: ${m.match}（位置 ${m.index}）`)
      .join("\n");
  }, [matchResult]);

  /** コピーハンドラ（AP-I11 SSoT / cycle-211/212/213 同型）*/
  const handleCopy = useCallback(async () => {
    if (!copyText) return;
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      // ID を ref に保持して unmount 時の clearTimeout でリーク防止（AP-I11）
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, [copyText]);

  /** フラグトグルハンドラ */
  const handleFlagToggle = useCallback((flag: string) => {
    setFlagState((prev) => ({ ...prev, [flag]: !prev[flag] }));
    setTimedOut(false);
  }, []);

  /** サンプル選択ハンドラ（論点 15 案 D-改 1）*/
  const handleSampleSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const idx = parseInt(e.target.value, 10);
      if (isNaN(idx) || idx < 0 || idx >= REGEX_SAMPLE_INPUTS.length) return;
      const sample = REGEX_SAMPLE_INPUTS[idx];
      setPattern(sample.pattern);
      setTestText(sample.testText);
      // flags 文字列から各フラグ ON/OFF を復元
      const newFlags: Record<string, boolean> = {
        g: false,
        i: false,
        m: false,
        s: false,
      };
      for (const flag of sample.flags.split("")) {
        if (flag in newFlags) newFlags[flag] = true;
      }
      setFlagState(newFlags);
      setTimedOut(false);
    },
    [],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        padding: "10px",
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        fontFamily: "inherit",
      }}
    >
      {/* === 操作側（flexShrink: 0）=== */}

      {/* サンプル選択ドロップダウン（論点 15 案 D-改 1 / 操作側）
           AP-P21 (i): flexShrink:0 / minHeight:40px */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <label
          htmlFor="regex-tile-sample"
          style={{
            fontSize: "0.7rem",
            color: "var(--fg-soft)",
            whiteSpace: "nowrap",
          }}
        >
          サンプル
        </label>
        <select
          id="regex-tile-sample"
          aria-label="サンプルを選択"
          onChange={handleSampleSelect}
          defaultValue=""
          style={{
            flex: 1,
            minHeight: 40, // MAJOR-3 訂正: AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）
            fontSize: "0.75rem",
            border: "1px solid var(--border, var(--fg-soft))",
            borderRadius: "4px",
            padding: "2px 4px",
            backgroundColor: "var(--bg)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          <option value="" disabled>
            選択してください
          </option>
          {REGEX_SAMPLE_INPUTS.map((sample, i) => (
            <option key={sample.label} value={i}>
              {sample.label}
            </option>
          ))}
        </select>
      </div>

      {/* 正規表現 input（操作側 = flexShrink: 0）
           AP-P21 (i): minHeight: 40px / 操作側の下限高さ確保 */}
      <input
        type="text"
        aria-label="正規表現パターン"
        value={pattern}
        onChange={(e) => {
          setPattern(e.target.value);
          setTimedOut(false);
        }}
        placeholder="例: \d{4}-\d{2}-\d{2}"
        spellCheck={false}
        style={{
          flexShrink: 0,
          width: "100%",
          minHeight: 40, // 実装値 = AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）
          border: "1px solid var(--border, var(--fg-soft))",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "0.8rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
        }}
      />

      {/* フラグチェックボックス群（操作側 = flexShrink: 0）
           a11y: <label> + <input type="checkbox"> / c214-ζ 引用適用
           AP-P21 (i) MAJOR-1: フラグ label に minHeight:40px + padding-block でタップ領域確保 */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
        }}
      >
        {FLAG_DEFINITIONS.map(({ flag, label }) => (
          <label
            key={flag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              minHeight: 40, // MAJOR-1: AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）
              fontSize: "0.7rem",
              color: "var(--fg-soft)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              aria-label={flag}
              checked={flagState[flag] ?? false}
              onChange={() => handleFlagToggle(flag)}
              style={{ accentColor: "var(--accent)", cursor: "pointer" }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* === 膨張側（flex: 1 + overflowY: auto）=== */}

      {/* 本文 textarea（膨張側 / AP-P21）*/}
      <textarea
        aria-label="テストテキスト"
        value={testText}
        onChange={(e) => {
          setTestText(e.target.value);
          setTimedOut(false);
        }}
        placeholder="テストするテキストを入力"
        spellCheck={false}
        style={{
          flex: 1,
          width: "100%",
          resize: "none",
          border: "1px solid var(--border, var(--fg-soft))",
          borderRadius: "4px",
          padding: "6px 8px",
          fontSize: "0.8rem",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
          boxSizing: "border-box",
          fontFamily:
            "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
          lineHeight: 1.4,
          minHeight: 0,
        }}
      />

      {/* マッチ件数サマリ status 欄（操作側 = flexShrink: 0）
           c214-ζ ARIA 二層構成: 短文のみ aria-live="polite" */}
      <div
        role="status"
        aria-live="polite"
        aria-label="マッチ件数サマリ"
        style={{
          flexShrink: 0,
          fontSize: "0.7rem",
          color: timedOut ? "var(--danger)" : "var(--fg-soft)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {summaryText}
      </div>

      {/* エラー枠（無効パターン / 入力長超過 / 論点 13 採択）
           role="alert" / AP-I08: --danger トークン使用 */}
      {!timedOut &&
        matchResult &&
        !matchResult.success &&
        matchResult.error && (
          <div
            role="alert"
            style={{
              flexShrink: 0,
              fontSize: "0.75rem",
              color: "var(--danger)",
              backgroundColor: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              borderRadius: "4px",
              padding: "6px 8px",
              fontFamily:
                "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
              wordBreak: "break-all",
            }}
          >
            {matchResult.error}
          </div>
        )}

      {/* タイムアウトエラー枠（論点 13 採択 / Worker timeout 100ms 到達時）*/}
      {timedOut && (
        <div
          role="alert"
          style={{
            flexShrink: 0,
            fontSize: "0.75rem",
            color: "var(--danger)",
            backgroundColor: "var(--danger-soft)",
            border: "1px solid var(--danger)",
            borderRadius: "4px",
            padding: "6px 8px",
          }}
        >
          {TIMEOUT_ERROR_MESSAGE}
        </div>
      )}

      {/* マッチ結果欄（膨張側 = flex: 1 + overflowY: auto）
           c214-ζ ARIA 二層構成: 長文 = role="region" + aria-label のみ / aria-live なし */}
      {matchResult?.success && matchResult.matches.length > 0 && (
        <div
          role="region"
          aria-label="マッチ結果"
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minHeight: 0,
          }}
        >
          {matchResult.matches.map((m, i) => (
            <div
              key={i}
              ref={(el) => {
                matchItemRefs.current[i] = el;
              }}
              data-match-item="true"
              style={{
                // CRIT-1 対応: display:none → visibility:hidden に変更。
                // display:none は IntersectionObserver で observe されない（MDN/W3C 仕様）。
                // visibility:hidden は observe 可能 → スクロール時に visibleIndices に追加される。
                // 先頭 INITIAL_VISIBLE_SEED_COUNT 件は初期値でシード済みのため即時表示される。
                display: "flex",
                visibility: visibleIndices.has(i) ? "visible" : "hidden",
                alignItems: "baseline",
                gap: "4px",
                flexWrap: "wrap",
                padding: "2px 4px",
                fontSize: "0.72rem",
                borderRadius: "3px",
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--fg-soft)",
                  fontSize: "0.68rem",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
                  backgroundColor: "var(--success-soft)", // c215-β SSoT: --success-soft 採用
                  padding: "0 3px",
                  borderRadius: "2px",
                  color: "var(--success-strong)",
                  wordBreak: "break-all",
                }}
              >
                {m.match}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "var(--fg-soft)",
                  flexShrink: 0,
                }}
              >
                pos:{m.index}
              </span>
              {m.groups.length > 0 && (
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--fg-soft)",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace",
                  }}
                >
                  [{m.groups.join(", ")}]
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* フッター: コピーボタン + 詳細リンク（操作側 = flexShrink: 0）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* コピーボタン（マッチ一覧テキストをコピー / 論点 8 採択）
             文言変化: 「コピー」→「コピー済み」（AP-I11 SSoT 同型）
             AP-P21 (i) MAJOR-1: minHeight:40px でタップ領域確保 */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!copyText}
          style={{
            minHeight: 40, // MAJOR-1: AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）
            boxSizing: "border-box",
            padding: "4px 8px",
            fontSize: "0.75rem",
            borderRadius: "4px",
            border: "1px solid var(--border, var(--fg-soft))",
            backgroundColor: copied ? "var(--accent)" : "transparent",
            color: copied ? "var(--fg-invert, var(--bg))" : "var(--fg)",
            cursor: copyText ? "pointer" : "default",
            fontFamily: "inherit",
            fontWeight: copied ? 600 : 400,
            opacity: copyText ? 1 : 0.4,
            transition: "background-color 0.15s, color 0.15s",
            display: "flex",
            alignItems: "center",
          }}
        >
          {copied ? "コピー済み" : "コピー"}
        </button>

        {/* 詳細リンク（MAJOR-1 訂正 / §論点 9 採択 案 B = 「フラグ切替・置換などの詳細機能を使う →」）
             タイル UI はフラグ全件省略・置換不在のため、詳細ページに何があるかを具体的に伝える
             AP-P21 (i) MAJOR-1: minHeight:40px + paddingBlock でタップ領域確保・テキスト中央配置 */}
        <Link
          href="/tools/regex-tester"
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 40, // MAJOR-1: AP-P21 操作側下限 40px（cycle-210 SSoT (i) 引用適用）
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
          }}
        >
          フラグ切替・置換などの詳細機能を使う →
        </Link>
      </div>
    </div>
  );
}
