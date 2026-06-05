"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCategories,
  getTemplatesByCategory,
  generateEmail,
  COMMON_FIELD_KEYS,
  type EmailCategory,
} from "./logic";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";
import styles from "./BusinessEmailPage.module.css";

const categories = getCategories();

// SegmentedControl の options 配列（EmailCategory の文字列値を使用）
const categoryOptions = categories.map((cat) => ({
  label: cat.name,
  value: cat.id,
}));

// コピーターゲットのキー
const COPY_KEY_SUBJECT = "subject";
const COPY_KEY_BODY = "body";
const COPY_KEY_ALL = "all";

/**
 * BusinessEmailPage — ビジネスメール作成の単一実装。
 *
 * 機能:
 * - カテゴリ選択（5種: お礼/お詫び/依頼/お断り/挨拶）
 * - テンプレート選択（計12種）
 * - 入力フィールド（テキスト・テキストエリア）
 * - 件名・本文プレビュー（readOnly）
 * - コピーボタン（件名・本文・全文）
 * - ARIA: C-3 準拠（role="status" に実テキストサマリ）
 * - カテゴリ/テンプレート変更時に共通フィールド値を保持（U-01）
 *
 * 設計方針:
 * - T-4b: business-email はコピーボタンあり確定（メール本文＝持ち帰り対象）
 * - AP-I11: setTimeout は useCopyToClipboard フック内で useRef+cleanup 済み
 * - C-3: readOnly textarea をラップするだけでは SR に読み上げられないため、
 *   別途 role="status" 領域に実テキストサマリを配置する
 * - A-3: SegmentedControl でカテゴリ切替（旧 role="tablist" パターンを排除）
 */
export default function BusinessEmailPage() {
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

  /** U-01: 共通フィールドの値を保持して返す */
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

  return (
    <div className={styles.container}>
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
      <SegmentedControl
        options={categoryOptions}
        value={selectedCategory}
        onChange={handleCategoryChange}
        aria-label="メールカテゴリ"
      />

      {/* テンプレート選択 */}
      <div className={styles.templateSection}>
        <label htmlFor="template-select" className={styles.label}>
          テンプレート
        </label>
        {/* A-2: Select コンポーネント使用 */}
        <Select
          id="template-select"
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
            <label htmlFor={`field-${field.key}`} className={styles.label}>
              {field.label}
              {field.required && (
                <span className={styles.required} aria-hidden="true">
                  {" "}
                  *
                </span>
              )}
            </label>
            {field.type === "textarea" ? (
              // A-1: Textarea コンポーネント使用
              <Textarea
                id={`field-${field.key}`}
                value={fieldValues[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-required={field.required}
                rows={3}
              />
            ) : (
              // A-7: Input コンポーネント使用（text フィールド）
              <Input
                id={`field-${field.key}`}
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
            <label htmlFor="preview-subject" className={styles.label}>
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
            id="preview-subject"
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
            <label htmlFor="preview-body" className={styles.label}>
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
          {/* A-1: Textarea コンポーネント使用（readOnly 出力欄） */}
          <Textarea
            id="preview-body"
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
    </div>
  );
}
