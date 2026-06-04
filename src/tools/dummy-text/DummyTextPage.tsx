"use client";

import { useState, useMemo } from "react";
import {
  generateText,
  countGeneratedWords,
  countGeneratedChars,
  type TextLanguage,
} from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import SegmentedControl from "@/components/SegmentedControl";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import styles from "./DummyTextPage.module.css";

/** 言語選択の options 配列（C-5: value は options 内の値であること） */
const LANGUAGE_OPTIONS: { label: string; value: TextLanguage }[] = [
  { label: "Lorem Ipsum", value: "lorem" },
  { label: "日本語", value: "japanese" },
];

/**
 * DummyTextPage — ダミーテキスト生成の単一実装。
 *
 * 機能:
 * - 言語切り替え（Lorem Ipsum / 日本語）— SegmentedControl
 * - 段落数・段落あたりの文数を指定（数値入力）
 * - テキスト生成（入力変更時に即時再生成）
 * - 文字数・単語数の統計表示
 * - コピーボタン（useCopyToClipboard）
 * - ARIA: C-3 準拠（role="status" に実テキストサマリ）
 *
 * 設計方針:
 * - 確定提示方式: ページ表示直後から出力が見える
 * - AP-I11: setTimeout は useCopyToClipboard フック内で useRef+cleanup 済み
 * - C-3: readOnly textarea をラップするだけでは SR に読み上げられないため、
 *   別途 role="status" 領域に実テキストサマリを配置する
 * - T-4b: dummy-text はコピーボタンあり確定（モック・原稿に貼る＝持ち帰り対象）
 * - hydration 安全: 生成はクライアントのみで実行（SSR/CSR 不整合なし）
 *   useMemo は純粋関数なので SSR/CSR 両方で同一の初期値が得られるが、
 *   generateText は定数データから決定論的に生成するため hydration 不整合にはならない
 */
export default function DummyTextPage() {
  const [language, setLanguage] = useState<TextLanguage>("lorem");
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);

  // T-4b: コピーあり確定。useCopyToClipboard フックを使用（独自実装しない）
  const { copy, copiedKey } = useCopyToClipboard();

  // 入力変更に即時反応して再生成（確定提示方式）
  const output = useMemo(
    () => generateText({ language, paragraphs, sentencesPerParagraph }),
    [language, paragraphs, sentencesPerParagraph],
  );

  const wordCount = useMemo(() => countGeneratedWords(output), [output]);
  const charCount = useMemo(() => countGeneratedChars(output), [output]);

  // C-3: スクリーンリーダーへ通知する統計サマリ（実テキストノード）
  // 段落数・文字数・単語数を人間可読テキストとして role="status" 領域に配置する
  const statusSummary = `${paragraphs}段落・${charCount.toLocaleString()}文字・${wordCount.toLocaleString()}単語`;

  const handleLanguageChange = (value: string) => {
    setLanguage(value as TextLanguage);
  };

  const handleParagraphsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 20) {
      setParagraphs(v);
    }
  };

  const handleSentencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 1 && v <= 20) {
      setSentencesPerParagraph(v);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await copy(output);
  };

  return (
    <div className={styles.container}>
      {/* 言語切り替え（A-3: SegmentedControl 使用・C-2: aria-label 必須） */}
      <SegmentedControl
        options={LANGUAGE_OPTIONS}
        value={language}
        onChange={handleLanguageChange}
        aria-label="テキスト言語"
      />

      {/* 設定行: 段落数・文数 */}
      <div className={styles.settingsRow}>
        <div className={styles.numberField}>
          <label htmlFor="dummy-paragraphs" className={styles.numberLabel}>
            段落数
          </label>
          <input
            id="dummy-paragraphs"
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
          <label htmlFor="dummy-sentences" className={styles.numberLabel}>
            段落あたりの文数
          </label>
          <input
            id="dummy-sentences"
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

      {/* C-3: role="status" aria-live="polite" — 実テキストノードのサマリを置く。
          readOnly textarea をラップするだけでは SR に読み上げられないため分離する。
          統計（段落数・文字数・単語数）を実テキストとして配置し SR に通知する。 */}
      <div
        role="status"
        aria-live="polite"
        aria-label="生成結果サマリ"
        className={styles.srOnly}
      >
        {statusSummary}
      </div>

      {/* 統計バー（視覚的な補助情報） */}
      <div className={styles.statsBar} aria-hidden="true">
        <span>{paragraphs}段落</span>
        <span>{charCount.toLocaleString()}文字</span>
        <span>{wordCount.toLocaleString()}単語</span>
      </div>

      {/* 出力欄 */}
      <div className={styles.outputSection}>
        <div className={styles.outputHeader}>
          <label htmlFor="dummy-output" className={styles.outputLabel}>
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
        {/* A-1: Textarea コンポーネント使用（readOnly 出力欄） */}
        <Textarea
          id="dummy-output"
          aria-label="生成結果"
          value={output}
          readOnly
          rows={12}
        />
      </div>
    </div>
  );
}
