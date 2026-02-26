"use client";

import { useCallback, useState } from "react";
import styles from "./CodeBlock.module.css";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className={styles.container}>
      {language && <span className={styles.language}>{language}</span>}
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
        aria-label="コードをコピー"
      >
        {copied ? "コピー済み" : "コピー"}
      </button>
    </div>
  );
}
