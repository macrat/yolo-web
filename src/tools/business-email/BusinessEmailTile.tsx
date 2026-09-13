"use client";

/**
 * BusinessEmailTile — ビジネスメール作成の単一正典タイル
 *
 * cycle-228 T-30: BusinessEmailPage.tsx を Panel ルートのタイルへ作り直したもの。
 *
 * ## 設計原則
 *
 * - **タイル = ツール実装そのもののルート**: 最上位要素が <Panel>（A-1）。
 * - **1ツール 1タイル = variant**: full のみ（カテゴリ固定バリエーションは不要）。
 * - **id インスタンス一意化**: useId ベースで生成し、動的フィールド（field-${key}）も
 *   ${uid}-field-${key} 形式にして複数インスタンスが同居しても id 重複・label 誤結合が起きない（A-6）。
 * - **ToolPageLayout 非依存**: タイル単体で機能が完結する（A-2）。
 * - **logic.ts 共有エンジン**: generateEmail/getCategories/getTemplatesByCategory/fillTemplate
 *   が唯一のロジック源（D-3）。
 *
 * ## variant
 *
 * - `"full"` (デフォルト): SegmentedControl 5カテゴリ + テンプレート Select + 動的フィールド
 *   + プレビュー + コピー3ターゲット（件名/本文/全体）。
 *
 * ## アクセシビリティ（C-3 準拠）
 *
 * - SegmentedControl に aria-label="メールカテゴリ"（C-2）
 * - role="status" aria-live="polite" の div にサマリテキストを置く（C-3）
 *   （readOnly textarea は値変化をスクリーンリーダーが読み上げないため）
 * - 動的フィールドの label↔input 関連: htmlFor={`${uid}-field-${key}`} ←→ id={`${uid}-field-${key}`}
 */

import { useId, useState, useMemo, useCallback } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import {
  getCategories,
  getTemplatesByCategory,
  generateEmail,
  COMMON_FIELD_KEYS,
  type EmailCategory,
} from "./logic";
import styles from "./BusinessEmailTile.module.css";

// カテゴリ一覧（モジュールレベルで一度だけ取得）
const categories = getCategories();

// SegmentedControl の options 配列（EmailCategory の文字列値を使用）
const categoryOptions = categories.map((cat) => ({
  label: cat.name,
  value: cat.id,
}));

// コピーターゲットのキー（T-4b: 3ターゲット確定）
const COPY_KEY_SUBJECT = "subject";
const COPY_KEY_BODY = "body";
const COPY_KEY_ALL = "all";

/** variant prop: 表示バリエーションの設定差。別実装ではない。 */
export type BusinessEmailTileVariant = "full";

export interface BusinessEmailTileProps {
  /**
   * 表示バリエーション（デフォルト: "full"）
   * - "full": SegmentedControl 5カテゴリ + テンプレート Select + 動的フィールド
   *   + プレビュー + コピー3ターゲット
   */
  variant?: BusinessEmailTileVariant;
  /** Panel の as prop に透過される HTML タグ（デフォルト: "section"） */
  as?: "section" | "div" | "article" | "aside";
  /** 追加クラス */
  className?: string;
}

export default function BusinessEmailTile({
  // variant は現在 "full" のみ。将来バリエーションを追加するときに使う（A-5）。
  variant: _variant = "full", // eslint-disable-line @typescript-eslint/no-unused-vars
  as = "section",
  className,
}: BusinessEmailTileProps = {}) {
  // ---------- id インスタンス一意化（複数同居時の重複 id・label 誤結合防止） ----------
  // A-6: 全ての DOM id と htmlFor は useId ベースで一意化（動的 field-${key} 含む）
  const uid = useId();
  const templateSelectId = `${uid}-template-select`;
  const previewSubjectId = `${uid}-preview-subject`;
  const previewBodyId = `${uid}-preview-body`;

  // ---------- State ----------
  const [selectedCategory, setSelectedCategory] =
    useState<EmailCategory>("thanks");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => getTemplatesByCategory("thanks")[0].id,
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  // C-3: スクリーンリーダーへ通知するための短いサマリテキスト
  const [statusSummary, setStatusSummary] = useState("");

  // T-4b: コピーあり確定。key-based tracking で3つのコピーターゲットを識別する
  const { copy, copiedKey } = useCopyToClipboard();

  // ---------- 派生状態 ----------
  const templatesInCategory = useMemo(
    () => getTemplatesByCategory(selectedCategory),
    [selectedCategory],
  );

  const selectedTemplate = useMemo(
    () =>
      templatesInCategory.find((t) => t.id === selectedTemplateId) ??
      templatesInCategory[0],
    [templatesInCategory, selectedTemplateId],
  );

  const generated = useMemo(() => {
    // フィールド値が未入力の場合のフォールバック優先順位:
    //   1. ユーザー入力値 (fieldValues[field.key])
    //   2. テンプレートのデフォルト値 (field.defaultValue)
    //   3. プレースホルダー (field.placeholder) ← 空文字にしないための是正 (U-2)
    //      空文字で差し込むと「様/です。/について」等の破綻文になるため、
    //      初期状態でも一貫した見本メールを表示できるようにする。
    const mergedValues: Record<string, string> = {};
    for (const field of selectedTemplate.fields) {
      const userVal = fieldValues[field.key];
      mergedValues[field.key] =
        userVal !== undefined && userVal !== ""
          ? userVal
          : (field.defaultValue ?? field.placeholder);
    }
    return generateEmail(selectedTemplate, mergedValues);
  }, [selectedTemplate, fieldValues]);

  const bodyCharCount = generated.body.length;

  // ---------- U-01: 共通フィールドの値を保持して返す ----------
  const preserveCommonFields = useCallback(
    (currentFieldValues: Record<string, string>): Record<string, string> => {
      const preserved: Record<string, string> = {};
      for (const key of COMMON_FIELD_KEYS) {
        if (currentFieldValues[key]) {
          preserved[key] = currentFieldValues[key];
        }
      }
      return preserved;
    },
    [],
  );

  // ---------- ハンドラ ----------
  const handleCategoryChange = useCallback(
    (category: string) => {
      setSelectedCategory(category as EmailCategory);
      const templates = getTemplatesByCategory(category as EmailCategory);
      setSelectedTemplateId(templates[0].id);
      // U-01: カテゴリ変更時に共通フィールド（相手先会社名・氏名・差出人名）を保持
      setFieldValues(preserveCommonFields(fieldValues));
      setStatusSummary("");
    },
    [fieldValues, preserveCommonFields],
  );

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);
      // U-01: テンプレート変更時も共通フィールドを保持
      setFieldValues(preserveCommonFields(fieldValues));
      setStatusSummary("");
    },
    [fieldValues, preserveCommonFields],
  );

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    // C-3: フィールド入力のたびにサマリを更新してスクリーンリーダーに通知
    setStatusSummary("入力内容を更新しました");
  }, []);

  const handleCopySubject = useCallback(async () => {
    if (!generated.subject) return;
    await copy(generated.subject, COPY_KEY_SUBJECT);
    setStatusSummary("件名をコピーしました");
  }, [generated.subject, copy]);

  const handleCopyBody = useCallback(async () => {
    if (!generated.body) return;
    await copy(generated.body, COPY_KEY_BODY);
    setStatusSummary("本文をコピーしました");
  }, [generated.body, copy]);

  const handleCopyAll = useCallback(async () => {
    const fullText = `件名: ${generated.subject}\n\n${generated.body}`;
    await copy(fullText, COPY_KEY_ALL);
    setStatusSummary("メール全文をコピーしました");
  }, [generated.subject, generated.body, copy]);

  // ---------- Render ----------
  // タイルのルートが Panel（= DESIGN.md §1 パネル準拠・タイル = ツール実装そのもの）（A-1）
  return (
    <Panel as={as} className={className}>
      {/* C-3: role="status" aria-live="polite" — 実テキストノードのサマリを置く。
          readOnly textarea をラップするだけでは SR に読み上げられないため分離する。 */}
      <div
        role="status"
        aria-live="polite"
        aria-label="操作結果サマリ"
        className={styles.srOnly}
      >
        {statusSummary}
      </div>

      {/* A-3: SegmentedControl でカテゴリ切替（C-2: aria-label 必須） */}
      <div className={styles.categorySection}>
        <SegmentedControl
          options={categoryOptions}
          value={selectedCategory}
          onChange={handleCategoryChange}
          aria-label="メールカテゴリ"
        />
      </div>

      {/* テンプレート選択 */}
      <div className={styles.templateSection}>
        <label htmlFor={templateSelectId} className={styles.label}>
          テンプレート
        </label>
        {/* 共通部品 Select コンポーネント再利用 */}
        <Select
          id={templateSelectId}
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
          aria-label="テンプレート"
        >
          {templatesInCategory.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <p className={styles.templateDescription}>
          {selectedTemplate.description}
        </p>
      </div>

      {/* 入力フォーム — 2カラムグリッド（テキストエリアは全幅） */}
      <div className={styles.formGrid}>
        {selectedTemplate.fields.map((field) => (
          <div
            key={field.key}
            className={
              field.type === "textarea"
                ? styles.fieldGroupWide
                : styles.fieldGroup
            }
          >
            {/* A-6: 動的フィールドの htmlFor を ${uid}-field-${key} で一意化 */}
            <label
              htmlFor={`${uid}-field-${field.key}`}
              className={styles.label}
            >
              {field.label}
              {field.required && (
                <span className={styles.required} aria-hidden="true">
                  {" "}
                  *
                </span>
              )}
            </label>
            {field.type === "textarea" ? (
              // 共通部品 Textarea コンポーネント再利用
              <Textarea
                id={`${uid}-field-${field.key}`}
                value={fieldValues[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-required={field.required}
                rows={3}
              />
            ) : (
              // 共通部品 Input コンポーネント再利用
              <Input
                id={`${uid}-field-${field.key}`}
                type="text"
                value={fieldValues[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-required={field.required}
              />
            )}
          </div>
        ))}
      </div>

      {/* プレビューセクション */}
      <div className={styles.previewSection}>
        {/* 件名プレビュー */}
        <div className={styles.previewRow}>
          <div className={styles.previewHeader}>
            <label htmlFor={previewSubjectId} className={styles.label}>
              件名プレビュー
            </label>
            {/* T-4b: 件名コピーボタン — 空のとき disabled */}
            <Button
              size="small"
              onClick={handleCopySubject}
              disabled={!generated.subject}
              aria-label={
                copiedKey === COPY_KEY_SUBJECT ? COPIED_LABEL : "件名をコピー"
              }
            >
              {copiedKey === COPY_KEY_SUBJECT ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          <Input
            id={previewSubjectId}
            type="text"
            value={generated.subject}
            readOnly
            aria-label="件名プレビュー"
            className={styles.subjectInput}
          />
        </div>

        {/* 本文プレビュー */}
        <div className={styles.previewRow}>
          <div className={styles.previewHeader}>
            <label htmlFor={previewBodyId} className={styles.label}>
              本文プレビュー
            </label>
            {/* T-4b: 本文コピーボタン — 空のとき disabled */}
            <Button
              size="small"
              onClick={handleCopyBody}
              disabled={!generated.body}
              aria-label={
                copiedKey === COPY_KEY_BODY ? COPIED_LABEL : "本文をコピー"
              }
            >
              {copiedKey === COPY_KEY_BODY ? COPIED_LABEL : "コピー"}
            </Button>
          </div>
          {/* 共通部品 Textarea コンポーネント再利用（readOnly 出力欄） */}
          <Textarea
            id={previewBodyId}
            value={generated.body}
            readOnly
            aria-label="本文プレビュー"
            rows={10}
          />
          <p className={styles.charCount}>{bodyCharCount}文字</p>
        </div>

        {/* 全文コピーボタン */}
        <Button
          variant="primary"
          onClick={handleCopyAll}
          aria-label={
            copiedKey === COPY_KEY_ALL ? COPIED_LABEL : "メール全文をコピー"
          }
          className={styles.copyAllButton}
        >
          {copiedKey === COPY_KEY_ALL ? COPIED_LABEL : "メール全文をコピー"}
        </Button>
      </div>
    </Panel>
  );
}
