"use client";

/**
 * DummyTextTile — ダミーテキスト生成の単一正典タイル
 *
 * cycle-228 T-8 で DummyTextPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>。外部ラッパーなし。
 * - **1ツール n タイル = variant**: full / 2固定言語 は同一コンポーネントの
 *   設定差で表現。別実装を作らない（分裂ゼロ）。
 * - **id インスタンス一意化**: useId ベースで生成し、複数インスタンスが同一ページに
 *   同居しても id 重複・label 誤結合が起きない（A-6）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）。
 * - **logic.ts 共有エンジン**: generateText が唯一のロジック源（再実装・改変禁止）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): 言語 SegmentedControl を表示し、Lorem/日本語をユーザーが切り替えられる。
 * - `"lorem"`: 言語を Lorem Ipsum に固定し、SegmentedControl を非表示にする。
 * - `"japanese"`: 言語を日本語に固定し、SegmentedControl を非表示にする。
 *
 * 固定 variant でも段落数・文数コントロール・コピーボタンは維持（G-3 feature-preserving）。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - 出力 textarea は readOnly で表示専用
 * - role="status" aria-live="polite" の div にサマリテキストを置く
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 */

import { useId, useMemo, useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import Input from "@/components/Input";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
  type TextLanguage,
} from "./logic";
import styles from "./DummyTextTile.module.css";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type DummyTextTileVariant = "full" | "lorem" | "japanese";

/** 言語選択の options 配列（C-5: value は options 内の値であること） */
const LANGUAGE_OPTIONS: { label: string; value: TextLanguage }[] = [
  { label: "Lorem Ipsum", value: "lorem" },
  { label: "日本語", value: "japanese" },
];

export interface DummyTextTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": 言語 SegmentedControl 表示（ユーザーが Lorem/日本語を切り替え）
   * - "lorem": 言語を Lorem Ipsum に固定、SegmentedControl 非表示
   * - "japanese": 言語を日本語に固定、SegmentedControl 非表示
   */
  variant?: DummyTextTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function DummyTextTile({
  variant = "full",
  as = "section",
  className,
}: DummyTextTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  const uid = useId();
  const paragraphsId = `${uid}-paragraphs`;
  const sentencesId = `${uid}-sentences`;
  const outputId = `${uid}-output`;

  // ---------- variant から固定言語を決定 ----------
  // "full" は初期値 lorem で、ユーザーが切り替え可能。
  // "lorem" / "japanese" は固定（ユーザーが変更できない）。
  const fixedLanguage: TextLanguage | null =
    variant === "lorem" ? "lorem" : variant === "japanese" ? "japanese" : null;

  // ---------- State ----------
  // full の場合のみ言語を state で管理。固定 variant はその言語を直接使う。
  const [dynamicLanguage, setDynamicLanguage] = useState<TextLanguage>("lorem");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);

  const { copy, copiedKey } = useCopyToClipboard();

  // 実際に使う言語: fixed があればそれを使い、なければ state を使う
  const language = fixedLanguage ?? dynamicLanguage;

  // ---------- 即時生成（共有エンジン logic.ts を使用） ----------
  // 入力変更に即時反応して再生成（確定提示方式）
  const output = useMemo(
    () => generateText({ language, paragraphs, sentencesPerParagraph }),
    [language, paragraphs, sentencesPerParagraph],
  );

  const wordCount = useMemo(() => countGeneratedWords(output), [output]);
  const charCount = useMemo(() => countGeneratedChars(output), [output]);

  // C-3: スクリーンリーダーへ通知する統計サマリ（実テキストノード）
  // 日本語モードでは文字数のみ（文数は pool[0] の2文問題で入力値と一致せず廃止）
  // Lorem モードでは「単語数」を表示（英語はスペース区切りで単語数が有意味）
  const statusSummary =
    language === "japanese"
      ? `${paragraphs}段落・${charCount.toLocaleString()}文字`
      : `${paragraphs}段落・${charCount.toLocaleString()}文字・${wordCount.toLocaleString()}単語`;

  // ---------- ハンドラ ----------
  function handleLanguageChange(value: string): void {
    // fixedLanguage がある場合はここに到達しない（SegmentedControl が非表示）
    setDynamicLanguage(value as TextLanguage);
  }

  function handleParagraphsChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ): void {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 20) {
      setParagraphs(v);
    }
  }

  function handleSentencesChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 20) {
      setSentencesPerParagraph(v);
    }
  }

  async function handleCopy(): Promise<void> {
    if (!output) return;
    await copy(output);
  }

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）
  return (
    <Panel as={as} className={className}>
      {/* 言語切り替え: variant=full のみ SegmentedControl を表示。固定 variant は非表示。
          C-2: aria-label="テキスト言語" でアクセシブル名を付与（html-entity 正典と同じパターン）。 */}
      {fixedLanguage === null && (
        <div className={styles.languageControl}>
          <SegmentedControl
            options={LANGUAGE_OPTIONS}
            value={dynamicLanguage}
            onChange={handleLanguageChange}
            aria-label="テキスト言語"
          />
        </div>
      )}

      {/* 設定行: 段落数・文数（固定 variant でも維持: G-3 feature-preserving） */}
      <div className={styles.settingsRow}>
        <div className={styles.numberField}>
          <label htmlFor={paragraphsId} className={styles.numberLabel}>
            段落数
          </label>
          {/* Input コンポーネントを使用（共通部品の必須再利用） */}
          <Input
            id={paragraphsId}
            type="number"
            min={1}
            max={20}
            value={paragraphs}
            onChange={handleParagraphsChange}
            className={styles.numberInput}
            aria-label="段落数"
          />
        </div>
        <div className={styles.numberField}>
          <label htmlFor={sentencesId} className={styles.numberLabel}>
            段落あたりの文数
          </label>
          <Input
            id={sentencesId}
            type="number"
            min={1}
            max={20}
            value={sentencesPerParagraph}
            onChange={handleSentencesChange}
            className={styles.numberInput}
            aria-label="段落あたりの文数"
          />
        </div>
      </div>

      {/* 統計バー（段落数・文字数・単語数）
          日本語モードでは文字数のみを表示する（文数は廃止: pool[0]の2文問題）。
          Lorem モードでは単語数を表示（英語はスペース区切りで有意味）。 */}
      <div className={styles.statsBar} aria-hidden="true">
        <span>{paragraphs}段落</span>
        <span>{charCount.toLocaleString()}文字</span>
        {language !== "japanese" && (
          <span>{wordCount.toLocaleString()}単語</span>
        )}
      </div>

      {/* 出力エリア */}
      <div className={styles.outputSection}>
        <div className={styles.outputHeader}>
          <label htmlFor={outputId} className={styles.outputLabel}>
            生成結果
          </label>
          {/* T-4b: コピーボタンあり確定。出力が空のとき disabled（通常は空にならない） */}
          <Button
            size="small"
            onClick={handleCopy}
            disabled={!output}
            aria-label={copiedKey ? COPIED_LABEL : "コピー"}
          >
            {copiedKey ? COPIED_LABEL : "コピー"}
          </Button>
        </div>

        {/* C-3 準拠: readOnly textarea は role="status" 対象外。
            別途サマリ div を置いてスクリーンリーダーへ通知する */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.statusSummary}
        >
          {statusSummary}
        </div>

        {/* A-1: Textarea コンポーネント使用（readOnly 出力欄） */}
        <Textarea
          id={outputId}
          aria-label="生成結果"
          value={output}
          readOnly
          rows={12}
        />
      </div>
    </Panel>
  );
}
