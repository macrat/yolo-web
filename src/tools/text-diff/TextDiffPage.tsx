"use client";

import { useState, useMemo } from "react";
import Textarea from "@/components/Textarea";
import SegmentedControl from "@/components/SegmentedControl";
import { computeDiff, hasDifferences, type DiffMode } from "./logic";
import styles from "./TextDiffPage.module.css";

/**
 * TextDiffPage — テキスト差分比較ツールの単一実装（フル機能のページ本体）。
 *
 * cycle-225 / B-490 T-6 で Component.tsx を廃止し、本ファイルに一本化した。
 *
 * 個別論点の解消:
 *   ①-2 件数・ラベル一致: mode 別単位文字列（行/単語/文字）と
 *     line モード時は行数合算（hunk件数ではなく part.value の改行カウント）で
 *     表示ラベルと実際の計算ロジックを一致させる。
 *   ①-12 空入力「差分なし」誤表示解消: 両入力とも空（未入力）のとき、
 *     「差分なし」ではなく入力待ち状態として扱い、差分なしメッセージを表示しない。
 *   ②-15 コピー削除: text-diff は「知る対象」（出力を読んで確認する）のため
 *     コピーボタンなし（T-4b 方針確定）。
 *
 * C-3 ライブリージョン実テキストノード要件:
 *   サマリを div[role=status] 内に実テキストノードで配置する。
 *   readOnly textarea を role="status" でラップするパターンは不可
 *   （フォーム値の変化はスクリーンリーダーに読み上げられないため）。
 *
 * 共通部品の再利用:
 *   - Textarea: 変更前・変更後テキスト入力欄
 *   - SegmentedControl: 比較モード切替（行/単語/文字）
 *   - ToolPageLayout は page.tsx で外側から使用（本コンポーネントはツール本体のみ）
 */
export default function TextDiffPage() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [mode, setMode] = useState<DiffMode>("line");

  // 即時計算（useMemo で依存値変化に応じて派生計算。debounce なし）
  const diffParts = useMemo(
    () => computeDiff(oldText, newText, mode),
    [oldText, newText, mode],
  );
  const hasDiff = hasDifferences(diffParts);

  // ①-12: 両入力とも空のとき「差分なし」を表示しない（未入力状態と区別）
  const isEmptyInput = oldText === "" && newText === "";

  // モード別単位文字列（①-2: 件数・ラベル一致）
  const modeUnit = useMemo(() => {
    switch (mode) {
      case "line":
        return "行";
      case "word":
        return "単語";
      case "char":
        return "文字";
    }
  }, [mode]);

  // ①-2: モード別の追加・削除カウント（reviewer 指摘修正済み）
  // line モード: part.value の改行カウント（hunk件数ではなく行数合算）
  // word/char モード: diff ライブラリの part.count を総和する（hunk件数ではなく実際の単語数/文字数）
  //   例: diffWords("hello world foo", "hello earth bar baz")
  //     → added part に count:3、removed part に count:2 が設定される
  //     → addedCount=3, removedCount=2（hunk件数=1 ではない）
  const addedCount = useMemo(() => {
    if (mode === "line") {
      // line モード: 行数合算（part.value の非空行数を合算）
      return diffParts
        .filter((p) => p.added)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        );
    }
    // word/char モード: part.count の総和（diff ライブラリが返す正確な要素数）
    // count が undefined の場合のフォールバックとして value.length を使用
    return diffParts
      .filter((p) => p.added)
      .reduce((sum, p) => sum + (p.count ?? p.value.length), 0);
  }, [diffParts, mode]);

  const removedCount = useMemo(() => {
    if (mode === "line") {
      // line モード: 行数合算
      return diffParts
        .filter((p) => p.removed)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        );
    }
    // word/char モード: part.count の総和
    return diffParts
      .filter((p) => p.removed)
      .reduce((sum, p) => sum + (p.count ?? p.value.length), 0);
  }, [diffParts, mode]);

  // C-3: ライブリージョンに入れる実テキストノードのサマリ
  // ①-12: isEmptyInput のとき空文字（「差分なし」誤表示しない）
  const summaryText = useMemo(() => {
    if (isEmptyInput) return ""; // 両方空 = 入力待ち状態
    if (hasDiff)
      return `+${addedCount} ${modeUnit} / −${removedCount} ${modeUnit}`;
    return "差分なし"; // 入力あり・差分ゼロの場合のみ表示
  }, [isEmptyInput, hasDiff, addedCount, removedCount, modeUnit]);

  // ①-2 / reviewer 指摘: 差分本文に「+」「−」記号を付与
  // meta.ts howItWorks/FAQ の記述「+記号・−記号で表示」と実装を一致させる。
  // line モード: 各行の先頭に記号を付与（複数行を含む part に対応）
  // word/char モード: part 先頭に記号を付与
  const getDisplayValue = (part: {
    value: string;
    added: boolean;
    removed: boolean;
  }): string => {
    if (!part.added && !part.removed) return part.value;
    const prefix = part.added ? "+" : "−";
    if (mode === "line") {
      // line モード: 各行の先頭に記号を付ける
      // "line1\nline2\n" → "+line1\n+line2\n"
      return part.value
        .split("\n")
        .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
        .join("\n");
    }
    // word/char モード: span 先頭に記号を付与
    return `${prefix}${part.value}`;
  };

  const diffModeOptions = [
    { label: "行単位", value: "line" },
    { label: "単語単位", value: "word" },
    { label: "文字単位", value: "char" },
  ];

  return (
    <div className={styles.container}>
      {/* 比較モード切替（共通部品 SegmentedControl・A-3 要件） */}
      <div className={styles.controls}>
        <span id="diff-mode-label" className={styles.controlLabel}>
          比較モード:
        </span>
        <SegmentedControl
          options={diffModeOptions}
          value={mode}
          onChange={(v) => setMode(v as DiffMode)}
          aria-labelledby="diff-mode-label"
        />
      </div>

      {/* 変更前・変更後テキスト入力（共通部品 Textarea） */}
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="diff-old" className={styles.panelLabel}>
            変更前テキスト
          </label>
          <Textarea
            id="diff-old"
            variant="mono"
            value={oldText}
            onChange={(e) => {
              setOldText(e.target.value);
            }}
            placeholder="変更前のテキストを入力..."
            rows={10}
            spellCheck={false}
            aria-label="変更前テキスト"
          />
        </div>
        <div className={styles.panel}>
          <label htmlFor="diff-new" className={styles.panelLabel}>
            変更後テキスト
          </label>
          <Textarea
            id="diff-new"
            variant="mono"
            value={newText}
            onChange={(e) => {
              setNewText(e.target.value);
            }}
            placeholder="変更後のテキストを入力..."
            rows={10}
            spellCheck={false}
            aria-label="変更後テキスト"
          />
        </div>
      </div>

      {/* C-3: ライブリージョン（サマリのみ aria-live。長文 pre には aria-live なし）
       * 実テキストノードのサマリを直接配置（readOnly textarea ラップ不可）
       * ①-12: isEmptyInput のとき summaryText="" で「差分なし」誤表示しない */}
      <div
        role="status"
        aria-live="polite"
        aria-label="差分サマリ"
        className={styles.summary}
      >
        {summaryText}
      </div>

      {/* 差分結果（入力あり時のみ表示）
       * §論点 13 M1'': 長文 <pre> には aria-live なし / role="region" + aria-label のみ */}
      {!isEmptyInput && (
        <div className={styles.result}>
          <h3 className={styles.resultHeading}>差分結果</h3>
          {!hasDiff ? (
            <p className={styles.noDiff}>テキストに差分はありません。</p>
          ) : (
            <pre
              className={styles.diffOutput}
              role="region"
              aria-label="差分結果"
            >
              {diffParts.map((part, i) => (
                <span
                  key={i}
                  className={
                    part.added
                      ? styles.added
                      : part.removed
                        ? styles.removed
                        : styles.unchanged
                  }
                >
                  {getDisplayValue(part)}
                </span>
              ))}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
