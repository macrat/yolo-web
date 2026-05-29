"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { filterEntries } from "./logic";
import type { KeigoCategory } from "./logic";

/**
 * 敬語早見表 タイル用 UI（kind=widget）。
 *
 * 参照・検索型タイル初回（Phase 8.1 第 17 弾 / cycle-216 T-3）:
 * - 「尊敬語と謙譲語どっちだっけ」という最大需要に直接応答
 * - レイアウト: 各行 = 普通語ヘッダ + 尊敬語/謙譲語 2列グリッド（各列にコピーボタン）
 *   T-1実測: sonkeigo最長27文字（実測値）は2列で折り返し許容設計にして可読性確保
 *   3列（普通語/尊敬語/謙譲語 横並び）はT-3実機確認で400px内に窮屈と判断→2列縦積み採用
 * - IME セーフ検索（compositionstart/end 監視）
 * - 逆引き対応の列横断ハイライト（ヒットしたカラムを <mark> 付与）
 * - 各敬語形（尊敬語 / 謙譲語）のワンタップ個別コピー（常時表示 / 論点 2）
 * - ゼロヒット時の促し分け（カテゴリ起因 / 検索語起因）
 *
 * AP-P21 役割分担（cycle-216 SSoT 新規確立 参照・検索型 N=1）:
 * - 操作側（flexShrink: 0）= 検索 input + クリアボタン + カテゴリ UI + コピーボタン + 詳細リンク
 *   (C) 操作側 40px 下限（cycle-210 SSoT (i) 引用適用）
 * - 膨張側（flex: 1 + overflowY: auto）= 結果リスト
 *   (A) 結果行 40px 下限 / (B) ゼロヒット時高さの通常状態との乖離なし
 *
 * AP-I11 setTimeout cleanup:
 * - コピーボタン文言復帰の 1 秒タイマーを useRef で保持
 * - useEffect cleanup で clearTimeout を呼び出す
 *
 * オートフォーカスは入れない（複数タイルが並ぶトップでの奪い合い防止 / cycle-216 論点参照）。
 *
 * localStorage 前回値保持（B-433）は参照・検索型には適用しない（cycle-216 論点 7）。
 *
 * CSS Module 不使用（codegen 制約）/ インラインスタイル方式（既存タイル同型）。
 */

/** コピー完了表示を元に戻すまでの時間 (ms): 1 秒（タスク要件） */
const COPY_FEEDBACK_DURATION_MS = 1000;

/** カテゴリ選択肢定義 */
const CATEGORY_OPTIONS = [
  { value: "all" as const, label: "すべて" },
  { value: "basic" as const, label: "基本動詞" },
  { value: "business" as const, label: "ビジネス" },
  { value: "service" as const, label: "接客" },
] satisfies { value: KeigoCategory | "all"; label: string }[];

/**
 * テキストをハイライト分割する。
 * query が空の場合はそのままテキストを返す。
 * query がテキストに含まれる場合は <mark> タグを付与する。
 */
function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}): React.ReactElement {
  if (!query) {
    return <span>{text}</span>;
  }
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerText.indexOf(lowerQuery);
  if (idx === -1) {
    return <span>{text}</span>;
  }
  return (
    <span>
      {text.slice(0, idx)}
      <mark
        style={{
          backgroundColor: "var(--accent-soft, rgba(59,130,246,0.15))",
          color: "inherit",
          borderRadius: "2px",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

/**
 * 軽量ソート: casual 完全一致 → casual 前方一致 → その他（データ定義順維持）
 * T-1 実測: casual 完全一致は 1 件ヒット多数 → 最短到達のため完全一致を先頭に
 */
function sortEntriesForTile(
  entries: ReturnType<typeof filterEntries>,
  query: string,
) {
  if (!query.trim()) return entries;
  const q = query.trim().toLowerCase();
  return [...entries].sort((a, b) => {
    const aExact = a.casual.toLowerCase() === q ? 0 : 1;
    const bExact = b.casual.toLowerCase() === q ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    const aStarts = a.casual.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.casual.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });
}

/**
 * 各敬語形ブロック（ラベル + コピーボタン横並び + テキスト）
 * コピーボタンはラベルと同行に常時表示（常時発見可能 / 論点 2）。
 * テキストが長くても折り返し許容設計（wordBreak: normal / overflowWrap: anywhere）。
 * wordBreak: break-all は中黒「・」や語境界を無視して割るため不採用（MINOR対応）。
 */
function KeigoFieldBlock({
  label,
  text,
  query,
  shouldHighlight,
  copyKey,
  copiedKey,
  onCopy,
}: {
  label: string;
  text: string;
  query: string;
  shouldHighlight: boolean;
  copyKey: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const isCopied = copiedKey === copyKey;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "2px",
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* ラベル行 + コピーボタン（横並び）*/}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4px",
        }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            color: "var(--fg-soft)",
            lineHeight: 1,
          }}
        >
          {label}
        </span>
        {/* コピーボタン（常時表示 / 論点 2 / AP-P21 (C)）*/}
        <button
          type="button"
          aria-label={`${label}をコピー: ${text}`}
          data-copied={isCopied || undefined}
          onClick={() => onCopy(text, copyKey)}
          style={{
            flexShrink: 0,
            padding: "1px 5px",
            fontSize: "0.58rem",
            borderRadius: "3px",
            border: `1px solid ${isCopied ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
            backgroundColor: isCopied ? "var(--accent)" : "transparent",
            color: isCopied ? "var(--fg-invert, var(--bg))" : "var(--fg-soft)",
            cursor: "pointer",
            fontFamily: "inherit",
            lineHeight: 1.4,
            transition: "background-color 0.15s, color 0.15s", // NIT: カテゴリボタンと統一（0.1s→0.15s）
            whiteSpace: "nowrap",
          }}
        >
          {isCopied ? "済み" : "コピー"}
        </button>
      </div>
      {/* テキスト行（折り返し許容 / 中黒・語境界を優先する指定 / MINOR対応）*/}
      <div
        style={{
          fontSize: "0.68rem",
          color: "var(--fg)",
          lineHeight: 1.4,
          wordBreak: "normal",
          overflowWrap: "anywhere",
        }}
      >
        {shouldHighlight && query ? (
          <HighlightText text={text} query={query} />
        ) : (
          text
        )}
      </div>
    </div>
  );
}

export default function KeigoReferenceTile() {
  /** 検索クエリ（IME 確定後のみフィルタ発火） */
  const [query, setQuery] = useState("");
  /** IME 変換中フラグ（compositionstart/compositionend で制御） */
  const [isComposing, setIsComposing] = useState(false);
  /** IME 変換中の未確定テキスト（input value = 変換中も表示するが query には反映しない） */
  const [inputValue, setInputValue] = useState("");
  /** カテゴリ絞り込み */
  const [category, setCategory] = useState<KeigoCategory | "all">("all");
  /** コピー完了状態: key は `${entryId}-${field}` */
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  /** コピー完了表示を元に戻す setTimeout ID（AP-I11 SSoT） */
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** AP-I11 cleanup: unmount 時に走行中の setTimeout をキャンセルする */
  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  /** フィルタ済みエントリ（軽量ソート適用） */
  const filteredEntries = useMemo(() => {
    const entries = filterEntries(query, category);
    return sortEntriesForTile(entries, query);
  }, [query, category]);

  /** 検索入力ハンドラ（IME セーフ）*/
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      // IME 変換中（compositionstart 後 compositionend 前）はフィルタを発火させない
      if (!isComposing) {
        setQuery(val);
      }
    },
    [isComposing],
  );

  /** IME 変換開始 */
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  /** IME 変換確定（compositionend）でフィルタを発火させる */
  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      setIsComposing(false);
      setQuery(e.currentTarget.value);
    },
    [],
  );

  /** クリアボタン */
  const handleClear = useCallback(() => {
    setInputValue("");
    setQuery("");
  }, []);

  /** コピーハンドラ（AP-I11 SSoT / 各敬語形の個別コピー） */
  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (copyTimerRef.current !== null) {
        clearTimeout(copyTimerRef.current);
      }
      // ID を ref に保持して unmount 時の clearTimeout でリーク防止（AP-I11）
      copyTimerRef.current = setTimeout(() => {
        setCopiedKey(null);
        copyTimerRef.current = null;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch {
      // Clipboard API not available — silent fail
    }
  }, []);

  /**
   * ゼロヒット時の状態判別:
   * - カテゴリ絞り込み中のゼロヒット → カテゴリ起因
   * - すべてカテゴリのゼロヒット → 検索語起因
   * 各カテゴリ単独は basic 26 / business 24 / service 10 件で 0 にならない（実測値）
   */
  const isZeroHit = filteredEntries.length === 0 && query.trim() !== "";
  const isZeroHitCategoryBound = isZeroHit && category !== "all";

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

      {/* 検索ボックス（操作側 = flexShrink: 0）
           AP-P21 (C): minHeight: 40px / IME セーフ */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          position: "relative",
        }}
      >
        <input
          type="text"
          aria-label="敬語を検索"
          value={inputValue}
          onChange={handleInputChange}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder="動詞を検索（例: 行く）"
          spellCheck={false}
          // オートフォーカスは入れない（複数タイルが並ぶトップで奪い合い防止 / 論点参照）
          style={{
            flex: 1,
            minHeight: 40, // AP-P21 (C): 操作側 40px 下限（cycle-210 SSoT (i) 引用適用）
            border: "1px solid var(--border, var(--fg-soft))",
            borderRadius: "4px",
            padding: "6px 30px 6px 8px",
            fontSize: "0.78rem",
            backgroundColor: "var(--bg)",
            color: "var(--fg)",
            boxSizing: "border-box",
          }}
        />
        {/* クリアボタン（×）: 検索語がある場合のみ表示 */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="クリア"
            style={{
              position: "absolute",
              right: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--fg-soft)",
              fontSize: "1rem",
              padding: "2px 4px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* カテゴリ絞り込み（操作側 = flexShrink: 0）
           コンパクトなボタン群（論点 1）
           AP-P21 (C): minHeight: 40px（操作側 40px 下限 / NIT対応）*/}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          gap: "4px",
          flexWrap: "nowrap",
          minHeight: 40, // AP-P21 (C): 操作側 40px 下限（NIT対応: 28px→40px）
        }}
      >
        {CATEGORY_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategory(value)}
            aria-pressed={category === value}
            style={{
              flex: "1 1 0",
              minHeight: 40, // AP-P21 (C): 操作側 40px 下限（NIT対応）
              padding: "2px 4px",
              fontSize: "0.65rem",
              borderRadius: "4px",
              border: `1px solid ${category === value ? "var(--accent)" : "var(--border, var(--fg-soft))"}`,
              backgroundColor:
                category === value ? "var(--accent)" : "transparent",
              color:
                category === value
                  ? "var(--fg-invert, var(--bg))"
                  : "var(--fg-soft)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: category === value ? 600 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              transition: "background-color 0.15s, color 0.15s", // NIT: 既存タイルと統一（0.1s→0.15s）
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* === 膨張側（flex: 1 + overflowY: auto）=== */}

      {/* 結果リスト（膨張側）
           AP-P21 (A): 各行 minHeight: 40px
           AP-P21 (B): ゼロヒット時も高さを維持（CLS 抑制） */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          minHeight: 0,
        }}
      >
        {isZeroHit ? (
          /* ゼロヒット空状態（高さは通常状態と乖離させない / AP-P21 (B) SSoT） */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              padding: "16px 8px",
              gap: "8px",
              color: "var(--fg-soft)",
              fontSize: "0.75rem",
              textAlign: "center",
            }}
          >
            <span>「{query}」に一致する動詞はありません</span>
            {isZeroHitCategoryBound ? (
              /* カテゴリ起因 → すべてのカテゴリに戻すを優先的に促す */
              <button
                type="button"
                onClick={() => setCategory("all")}
                style={{
                  background: "none",
                  border: "1px solid var(--accent)",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  color: "var(--accent)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                すべてのカテゴリで検索
              </button>
            ) : (
              /* 検索語起因 → 検索語の見直しを促す */
              <span style={{ fontSize: "0.7rem", color: "var(--fg-soft)" }}>
                別の言葉で試してみてください
              </span>
            )}
          </div>
        ) : (
          /* 結果行一覧: 普通語ヘッダ + 尊敬語/謙譲語 2 列グリッド（コピーボタン付）
             T-3実機確認: 3列横並び（普通語/尊敬語/謙譲語）は400pxに尊敬語27文字が収まらず
             → 普通語をヘッダに置き、尊敬語/謙譲語 2列グリッド + コピーボタンを採用 */
          filteredEntries.map((entry) => {
            /**
             * ヒットしたカラムを判別（逆引きハイライト対応 / CRIT-2 対応）
             * filterEntries は casual/sonkeigo/kenjogo/teineigo の4列を検索対象にする
             * （実装値 = logic.ts:1231-1237）。タイルは casual/sonkeigo/kenjogo を表示するが、
             * teineigo でのみヒットした行は表示列にハイライト対象がなく「なぜ出たか分からない」
             * 混乱が生じる（CRIT-2）。
             * 対応: teineigo ヒット行には補助行（「丁寧語: ○○」）を表示し、そこをハイライト。
             */
            const q = query.trim().toLowerCase();
            const hitCasual = q
              ? entry.casual.toLowerCase().includes(q)
              : false;
            const hitSonkeigo = q
              ? entry.sonkeigo.toLowerCase().includes(q)
              : false;
            const hitKenjogo = q
              ? entry.kenjogo.toLowerCase().includes(q)
              : false;
            const hitTeineigo = q
              ? entry.teineigo.toLowerCase().includes(q)
              : false;

            const sonkeigoCopyKey = `${entry.id}-sonkeigo`;
            const kenjogoCopyKey = `${entry.id}-kenjogo`;

            return (
              <div
                key={entry.id}
                data-keigo-row={entry.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                  padding: "5px 6px",
                  minHeight: 40, // AP-P21 (A): 結果行 40px 下限（参照・検索型 SSoT N=1）
                  flexShrink: 0, // CRIT-1: overflowY:auto コンテナ内で行が圧縮されないよう固定
                  borderBottom: "1px solid var(--border, rgba(0,0,0,0.08))",
                  boxSizing: "border-box",
                }}
              >
                {/* 普通語ヘッダ行（太字 / ヒット時は強調色） */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: hitCasual ? "var(--fg)" : "var(--fg-soft)",
                    lineHeight: 1.2,
                  }}
                >
                  {hitCasual && q ? (
                    <HighlightText text={entry.casual} query={query.trim()} />
                  ) : (
                    entry.casual
                  )}
                </div>
                {/* 尊敬語 / 謙譲語 2 列グリッド（各列: ラベル + テキスト + コピーボタン）*/}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px",
                  }}
                >
                  <KeigoFieldBlock
                    label="尊敬語"
                    text={entry.sonkeigo}
                    query={query.trim()}
                    shouldHighlight={hitSonkeigo}
                    copyKey={sonkeigoCopyKey}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                  <KeigoFieldBlock
                    label="謙譲語"
                    text={entry.kenjogo}
                    query={query.trim()}
                    shouldHighlight={hitKenjogo}
                    copyKey={kenjogoCopyKey}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                </div>
                {/* 丁寧語補助行（CRIT-2 対応）:
                    teineigo でのみヒットした行に「丁寧語: ○○」を弱色で表示し
                    ハイライト対象を確保する。常時表示しないことで高さ影響を限定。 */}
                {hitTeineigo && !hitCasual && !hitSonkeigo && !hitKenjogo && (
                  <div
                    style={{
                      fontSize: "0.62rem",
                      color: "var(--fg-soft)",
                      lineHeight: 1.3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.58rem",
                        marginRight: "3px",
                      }}
                    >
                      丁寧語:
                    </span>
                    <HighlightText text={entry.teineigo} query={query.trim()} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* === フッター（操作側 = flexShrink: 0）=== */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "6px",
          minHeight: 40, // AP-P21 (C): 操作側 40px 下限
          boxSizing: "border-box",
        }}
      >
        {/* 出典フッタ（文化庁「敬語の指針」2007 + 謙譲語注記 / 論点 6）*/}
        <span
          style={{
            fontSize: "0.58rem",
            color: "var(--fg-soft)",
            lineHeight: 1.3,
            flex: 1,
            overflow: "hidden",
          }}
        >
          出典: 文化庁「敬語の指針」2007
          <br />
          <span style={{ fontSize: "0.55rem" }}>
            謙譲語は自分側の行為に使う
          </span>
        </span>

        {/* 詳細リンク（AP-P21 (C): minHeight: 40px）*/}
        <Link
          href="/tools/keigo-reference"
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 40, // AP-P21 (C): 操作側 40px 下限（cycle-210 SSoT (i) 引用適用）
            fontSize: "0.7rem",
            color: "var(--accent)",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          詳細 →
        </Link>
      </div>
    </div>
  );
}
