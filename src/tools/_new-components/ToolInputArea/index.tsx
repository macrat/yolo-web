"use client";

import { useCallback } from "react";
import Input from "@/components/Input";
import Button from "@/components/Button";
import styles from "./ToolInputArea.module.css";

interface ToolInputAreaProps {
  /** 現在の入力値 */
  value: string;
  /** 入力変更コールバック */
  onChange: (value: string) => void;
  /** 入力欄のプレースホルダ（"何を入力するか" の最短ヒント） */
  placeholder?: string;
  /** 入力例テキスト（指定時に「入力例を試す」ボタンが表示される） */
  exampleText?: string;
  /** 入力例ボタンのラベル（デフォルト: "入力例を試す"） */
  exampleButtonLabel?: string;
  /** リセットボタンのラベル（デフォルト: "クリア"） */
  clearButtonLabel?: string;
  /** エラー状態 */
  error?: boolean;
  /** 無効状態 */
  disabled?: boolean;
  /** input の aria-label */
  "aria-label"?: string;
  /** 追加クラス */
  className?: string;
}

/**
 * ToolInputArea — ツール詳細ページ専用の入力エリアコンポーネント。
 *
 * 既存の Input コンポーネントをベースに以下の入力支援機能を追加:
 * - リセット（クリア）ボタン: ワンクリックで入力値を空にする
 * - 入力例挿入ボタン（オプショナル）: サンプルテキストを自動入力
 *
 * 設計:
 * - 入力バリデーション / 入力モード切替 / 複数入力欄連動はツール側個別実装の責務
 * - LocalPersistenceAdapter との連携は呼び出し元のツールで行う
 * - DESIGN.md §5: Input / Button コンポーネントを活用
 */
function ToolInputArea({
  value,
  onChange,
  placeholder,
  exampleText,
  exampleButtonLabel = "入力例を試す",
  clearButtonLabel = "クリア",
  error = false,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: ToolInputAreaProps) {
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleExample = useCallback(() => {
    if (exampleText !== undefined) {
      onChange(exampleText);
    }
  }, [exampleText, onChange]);

  return (
    <div className={[styles.container, className].filter(Boolean).join(" ")}>
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        aria-label={ariaLabel}
        className={styles.input}
      />
      <div className={styles.actions}>
        {/* 入力例挿入ボタン（exampleText が指定されている場合のみ表示） */}
        {exampleText !== undefined && (
          <Button
            variant="default"
            size="small"
            onClick={handleExample}
            disabled={disabled}
          >
            {exampleButtonLabel}
          </Button>
        )}
        {/* リセットボタン（常時表示） */}
        <Button
          variant="default"
          size="small"
          onClick={handleClear}
          disabled={disabled || !value}
          aria-label={clearButtonLabel}
        >
          {clearButtonLabel}
        </Button>
      </div>
    </div>
  );
}

export default ToolInputArea;
