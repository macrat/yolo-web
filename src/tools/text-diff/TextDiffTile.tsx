"use client";

/**
 * TextDiffTile — テキスト差分比較の単一正典タイル
 *
 * cycle-228 T-23 で TextDiffPage.tsx を Panel ルートのタイルへ移植。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / line / word / char は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する。
 * - **logic.ts 共有エンジン**: computeDiff / hasDifferences が唯一のロジック源。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl（行/単語/文字）を表示し
 *   ユーザーがモードを切り替えられる。
 * - `"line"`: モードを行単位に固定し、SegmentedControl を非表示にする。
 * - `"word"`: モードを単語単位に固定し、SegmentedControl を非表示にする。
 * - `"char"`: モードを文字単位に固定し、SegmentedControl を非表示にする。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 * - 差分結果 pre は role="region" aria-label="差分結果"
 * - SegmentedControl に aria-labelledby を設定（C-2 要件）
 *
 * ## 個別論点の解消（旧 TextDiffPage.tsx から継承）
 *
 * - ①-2: mode 別単位文字列（行/単語/文字）で件数・ラベルを一致させる
 * - ①-12: 両入力とも空のとき「差分なし」を誤表示しない
 * - ②-15: コピーボタンなし（知る対象）
 * - U-7: ignoreNewlineAtEof による末尾改行アーティファクト解消
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import { computeDiff, hasDifferences, type DiffMode } from "./logic";
import styles from "./TextDiffTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type TextDiffTileVariant = "full" | DiffMode;

export interface TextDiffTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": SegmentedControl を表示し、ユーザーがモードを選択できる
   * - "line": 行単位モードに固定、SegmentedControl 非表示
   * - "word": 単語単位モードに固定、SegmentedControl 非表示
   * - "char": 文字単位モードに固定、SegmentedControl 非表示
   */
  variant?: TextDiffTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

const DIFF_MODE_OPTIONS: { label: string; value: DiffMode }[] = [
  { label: "行単位", value: "line" },
  { label: "単語単位", value: "word" },
  { label: "文字単位", value: "char" },
];

export default function TextDiffTile({
  variant = "full",
  as = "section",
  className,
}: TextDiffTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const oldTextId = `${uid}-old`;
  const newTextId = `${uid}-new`;
  const modeLabelId = `${uid}-mode-label`;

  // ---------- variant からモード固定値を決定 ----------
  // "full" のみ動的切替可能。"line"/"word"/"char" はモード固定。
  const fixedMode: DiffMode | null =
    variant === "full" ? null : (variant as DiffMode);

  // ---------- State ----------
  // full の場合のみモードを state で管理。固定 variant は state 不使用。
  const [dynamicMode, setDynamicMode] = useState<DiffMode>("line");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");

  // 実際に使うモード: fixed があればそれを使い、なければ state を使う
  const mode = fixedMode ?? dynamicMode;

  // ---------- 即時計算（useMemo で依存値変化に応じて派生計算） ----------
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

  // ①-2: モード別の追加・削除カウント
  // line モード: part.value の改行カウント（hunk件数ではなく行数合算）
  // word/char モード: diff ライブラリの part.count を総和する
  const addedCount = useMemo(() => {
    if (mode === "line") {
      return diffParts
        .filter((p) => p.added)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        );
    }
    return diffParts
      .filter((p) => p.added)
      .reduce((sum, p) => sum + (p.count ?? p.value.length), 0);
  }, [diffParts, mode]);

  const removedCount = useMemo(() => {
    if (mode === "line") {
      return diffParts
        .filter((p) => p.removed)
        .reduce(
          (sum, p) => sum + p.value.split("\n").filter(Boolean).length,
          0,
        );
    }
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

  // ①-2: 差分本文に「+」「−」記号を付与（meta.ts howItWorks/FAQ との整合）
  // line モード: 各行の先頭に記号を付与
  // word/char モード: span 先頭に記号を付与
  const getDisplayValue = (part: {
    value: string;
    added: boolean;
    removed: boolean;
  }): string => {
    if (!part.added && !part.removed) return part.value;
    const prefix = part.added ? "+" : "−";
    if (mode === "line") {
      // "line1\nline2\n" → "+line1\n+line2\n"
      return part.value
        .split("\n")
        .map((line) => (line.length > 0 ? `${prefix}${line}` : line))
        .join("\n");
    }
    // word/char モード: span 先頭に記号を付与
    return `${prefix}${part.value}`;
  };

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 比較モード切替（variant=full のみ表示。固定 variant は非表示） */}
      {fixedMode === null && (
        <div className={styles.controls}>
          <span id={modeLabelId} className={styles.controlLabel}>
            比較モード:
          </span>
          <SegmentedControl
            options={DIFF_MODE_OPTIONS}
            value={dynamicMode}
            onChange={(v) => setDynamicMode(v as DiffMode)}
            aria-labelledby={modeLabelId}
          />
        </div>
      )}

      {/* 変更前・変更後テキスト入力（共通部品 Textarea） */}
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor={oldTextId} className={styles.panelLabel}>
            変更前テキスト
          </label>
          <Textarea
            id={oldTextId}
            variant="mono"
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="変更前のテキストを入力..."
            rows={10}
            spellCheck={false}
            aria-label="変更前テキスト"
          />
        </div>
        <div className={styles.panel}>
          <label htmlFor={newTextId} className={styles.panelLabel}>
            変更後テキスト
          </label>
          <Textarea
            id={newTextId}
            variant="mono"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
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
       * 長文 <pre> には aria-live なし / role="region" + aria-label のみ */}
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
    </Panel>
  );
}
