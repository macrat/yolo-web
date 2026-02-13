"use client";

import { useState, useMemo } from "react";
import { renderMarkdown } from "./logic";
import styles from "./Component.module.css";

const SAMPLE_MARKDOWN = `# Heading 1
## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log("Hello");
\`\`\`

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;

export default function MarkdownPreviewTool() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN);

  const result = useMemo(() => renderMarkdown(input), [input]);

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <label htmlFor="md-input" className={styles.panelLabel}>
            Markdown
          </label>
          <textarea
            id="md-input"
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Markdownを入力..."
            spellCheck={false}
          />
        </div>
        <div className={styles.panel}>
          <span className={styles.panelLabel}>プレビュー</span>
          {result.error ? (
            <div className={styles.error} role="alert">
              {result.error}
            </div>
          ) : (
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
