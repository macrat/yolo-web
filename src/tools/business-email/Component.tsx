"use client";

import { useState, useMemo, useCallback } from "react";
import {
  getCategories,
  getTemplatesByCategory,
  generateEmail,
  COMMON_FIELD_KEYS,
  type EmailCategory,
} from "./logic";
import styles from "./Component.module.css";

const categories = getCategories();

export default function BusinessEmailTool() {
  const [selectedCategory, setSelectedCategory] =
    useState<EmailCategory>("thanks");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    () => getTemplatesByCategory("thanks")[0].id,
  );
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const templatesInCategory = useMemo(
    () => getTemplatesByCategory(selectedCategory),
    [selectedCategory],
  );

  const selectedTemplate = useMemo(
    () => templatesInCategory.find((t) => t.id === selectedTemplateId)!,
    [templatesInCategory, selectedTemplateId],
  );

  const generated = useMemo(
    () => generateEmail(selectedTemplate, fieldValues),
    [selectedTemplate, fieldValues],
  );

  const bodyCharCount = useMemo(() => generated.body.length, [generated.body]);

  const handleCategoryChange = useCallback(
    (category: EmailCategory) => {
      setSelectedCategory(category);
      const templates = getTemplatesByCategory(category);
      setSelectedTemplateId(templates[0].id);

      // Preserve common field values (U-01)
      const preserved: Record<string, string> = {};
      for (const key of COMMON_FIELD_KEYS) {
        if (fieldValues[key]) {
          preserved[key] = fieldValues[key];
        }
      }
      setFieldValues(preserved);
      setCopiedSubject(false);
      setCopiedBody(false);
      setCopiedAll(false);
    },
    [fieldValues],
  );

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);

      // Preserve common field values (U-01)
      const preserved: Record<string, string> = {};
      for (const key of COMMON_FIELD_KEYS) {
        if (fieldValues[key]) {
          preserved[key] = fieldValues[key];
        }
      }
      setFieldValues(preserved);
      setCopiedSubject(false);
      setCopiedBody(false);
      setCopiedAll(false);
    },
    [fieldValues],
  );

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setCopiedSubject(false);
    setCopiedBody(false);
    setCopiedAll(false);
  }, []);

  const handleCopySubject = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generated.subject);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [generated.subject]);

  const handleCopyBody = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generated.body);
      setCopiedBody(true);
      setTimeout(() => setCopiedBody(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [generated.body]);

  const handleCopyAll = useCallback(async () => {
    const fullText = `件名: ${generated.subject}\n\n${generated.body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [generated.subject, generated.body]);

  return (
    <div className={styles.container}>
      {/* Category tabs */}
      <div
        className={styles.categoryTabs}
        role="tablist"
        aria-label="メールカテゴリ"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat.id}
            className={`${styles.tab} ${selectedCategory === cat.id ? styles.activeTab : ""}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Template select */}
      <div className={styles.templateSection}>
        <label htmlFor="template-select" className={styles.label}>
          テンプレート
        </label>
        <select
          id="template-select"
          className={styles.select}
          value={selectedTemplateId}
          onChange={(e) => handleTemplateChange(e.target.value)}
        >
          {templatesInCategory.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className={styles.templateDescription}>
          {selectedTemplate.description}
        </p>
      </div>

      {/* Input form */}
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
              {field.required && " *"}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={`field-${field.key}`}
                className={styles.textarea}
                value={fieldValues[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-required={field.required}
              />
            ) : (
              <input
                id={`field-${field.key}`}
                type="text"
                className={styles.input}
                value={fieldValues[field.key] ?? field.defaultValue ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                aria-required={field.required}
              />
            )}
          </div>
        ))}
      </div>

      {/* Preview section */}
      <div className={styles.previewSection} aria-live="polite">
        <div className={styles.previewHeader}>
          <span className={styles.label}>件名プレビュー</span>
          <button
            type="button"
            onClick={handleCopySubject}
            className={styles.copyButton}
          >
            {copiedSubject ? "コピー済み" : "コピー"}
          </button>
        </div>
        <input
          type="text"
          className={styles.previewSubjectInput}
          value={generated.subject}
          readOnly
        />

        <div className={styles.previewHeader}>
          <span className={styles.label}>本文プレビュー</span>
          <button
            type="button"
            onClick={handleCopyBody}
            className={styles.copyButton}
          >
            {copiedBody ? "コピー済み" : "コピー"}
          </button>
        </div>
        <textarea
          className={styles.previewTextarea}
          value={generated.body}
          readOnly
        />

        <div className={styles.charCount}>{bodyCharCount}文字</div>

        <button
          type="button"
          onClick={handleCopyAll}
          className={styles.copyAllButton}
        >
          {copiedAll ? "コピー済み" : "メール全文をコピー"}
        </button>
      </div>
    </div>
  );
}
