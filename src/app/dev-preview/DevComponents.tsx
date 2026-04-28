/**
 * DevComponents — dev-preview/ 動作確認ページ用のクライアントコンポーネント群
 *
 * Input・Textarea など state を持つフォーム部品はクライアント側で描画する必要があるため、
 * このファイルに分離する。page.tsx は Server Component のままにして metadata のエクスポートを維持する。
 *
 * ## cycle-170 C-1 での変更
 * B-1 判定（候補 66-71）に従い、独自要素をすべて design-system 部品またはインライン HTML に置き換え:
 * - .section ラッパー → Panel(as="section") に置き換え
 * - .preview ラッパー → Panel(variant="inset") に置き換え（未定義変数 --radius-md を排除）
 * - .row / .column / .label → インライン style（B-1 候補 69-71「インライン HTML + 既存変数で済む」判定通り）
 *   インライン style オブジェクトは LABEL_STYLE / ROW_STYLE / COLUMN_STYLE 定数として定義
 * - ArticleArea TODO コメント → インライン <article>（B-1 パターン β 決定に伴う実装）
 * - <p style={{ padding: "1rem" }}> → 削除
 *
 * ## cycle-170 C-1 rev1 修正
 * B-1 候補 69-71「インライン HTML + 既存変数で済む」に実装を一致させるため、
 * .row / .column / .label を CSS Modules から撤去し、インライン style 定数に移行した（M-2 対応）。
 * DevComponents.module.css には dev-preview 固有レイアウト指定（.root / .sectionPanel /
 * .flushDemo / .articleDemo）のみを残す。
 *
 * ## SectionHead level=1 について（M-3）
 * B-1 候補 67 判定書では「SectionHead(level=1) で達成」と記載されているが、
 * SectionHead の型定義は level: 2 | 3 | 4 のみを受け付ける（level=1 はコンパイルエラー）。
 * このため pageTitle には SectionHead を使わずインライン <h1> を採用した（page.tsx 参照）。
 * 判定書 candidate 67 は技術検証不足のミスであり、本実装で正しく対応している。
 */
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Button from "@/components/design-system/Button";
import Input from "@/components/design-system/Input";
import Textarea from "@/components/design-system/Textarea";
import Panel from "@/components/design-system/Panel";
import SectionHead from "@/components/design-system/SectionHead";
import SiteHeader from "@/components/design-system/SiteHeader";
import SiteFooter from "@/components/design-system/SiteFooter";
import styles from "./DevComponents.module.css";

/**
 * B-1 候補 71「.label → インライン <p> + globals.css 変数で済む」判定に従い定数化。
 * globals.css 定義済み変数 --fs-12 / --font-mono / --fg-softer / --sp-2 / --border のみ使用。
 */
const LABEL_STYLE: CSSProperties = {
  fontSize: "var(--fs-12)",
  color: "var(--fg-softer)",
  fontFamily: "var(--font-mono)",
  paddingBottom: "var(--sp-2)",
  borderBottom: "1px solid var(--border)",
  marginBottom: "var(--sp-2)",
};

/**
 * B-1 候補 69「.row → インライン HTML + 既存変数で済む」判定に従い定数化。
 * globals.css 定義済み変数 --sp-3 のみ使用。
 */
const ROW_STYLE: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--sp-3)",
  alignItems: "center",
};

/**
 * B-1 候補 70「.column → インライン HTML + 既存変数で済む」判定に従い定数化。
 * globals.css 定義済み変数 --sp-3 のみ使用。
 */
const COLUMN_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--sp-3)",
};

/** ナビゲーションのサンプルデータ */
const NAV_LINKS = [
  { href: "/tools", label: "ツール" },
  { href: "/blog", label: "ブログ" },
  { href: "/play", label: "あそぶ" },
];

/** フッターリンクのサンプルデータ */
const FOOTER_LINK_GROUPS = [
  {
    heading: "コンテンツ",
    links: [
      { href: "/tools", label: "ツール一覧" },
      { href: "/blog", label: "ブログ" },
      { href: "/play", label: "あそぶ" },
    ],
  },
  {
    heading: "サイト情報",
    links: [
      { href: "/about", label: "このサイトについて" },
      { href: "/privacy", label: "プライバシーポリシー" },
    ],
  },
];

export default function DevComponents() {
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleLoadingToggle() {
    setIsLoading((prev) => !prev);
  }

  return (
    <div className={styles.root}>
      {/* ================================================
          SiteHeader
          ================================================ */}
      {/*
        B-1 候補 69-71 判定に従い:
        - <section className={styles.section}> → Panel(as="section") に置き換え
        - <div className={styles.preview}> → Panel(variant="inset") に置き換え
        - <p style={LABEL_STYLE}> → インライン <p>（globals.css 定義済み変数）
        - <div style={ROW_STYLE}> → インライン <div> style で display:flex
        - <div style={COLUMN_STYLE}> → インライン <div> style で flex-direction:column
      */}
      <Panel
        as="section"
        aria-labelledby="section-header"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="SiteHeader"
          meta="chrome / header"
          level={2}
          id="section-header"
        />
        <Panel variant="inset">
          <p style={LABEL_STYLE}>
            siteName デフォルト（&ldquo;yolos.net&rdquo;）
          </p>
          <SiteHeader navLinks={NAV_LINKS} />
        </Panel>
        <Panel variant="inset">
          <p style={LABEL_STYLE}>siteName カスタム</p>
          <SiteHeader navLinks={NAV_LINKS} siteName="カスタム名" />
        </Panel>
      </Panel>

      {/* ================================================
          Button
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-button"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="Button"
          meta="variant × size"
          level={2}
          id="section-button"
        />

        <Panel variant="inset">
          <p style={LABEL_STYLE}>variant: primary / ghost / danger</p>
          <div style={ROW_STYLE}>
            <Button variant="primary">primary</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="danger">danger</Button>
          </div>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>size: sm / md / lg</p>
          <div style={ROW_STYLE}>
            <Button size="sm">sm</Button>
            <Button size="md">md</Button>
            <Button size="lg">lg</Button>
          </div>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>disabled / loading / loading トグル</p>
          <div style={ROW_STYLE}>
            <Button disabled>disabled</Button>
            <Button loading>loading</Button>
            <Button
              variant="ghost"
              loading={isLoading}
              onClick={handleLoadingToggle}
            >
              {isLoading ? "読み込み中..." : "loading トグル"}
            </Button>
          </div>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>fullWidth=true</p>
          <Button fullWidth>全幅ボタン</Button>
        </Panel>
      </Panel>

      {/* ================================================
          Input
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-input"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="Input"
          meta="text / email / search / error"
          level={2}
          id="section-input"
        />

        <Panel variant="inset">
          <p style={LABEL_STYLE}>通常（hint あり）</p>
          <Input
            label="名前"
            placeholder="山田 太郎"
            hint="フルネームで入力してください"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>type=email / required</p>
          <Input
            label="メールアドレス"
            type="email"
            placeholder="user@example.com"
            required
          />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>error 状態</p>
          <Input
            label="パスワード"
            type="password"
            error="8文字以上で入力してください"
            defaultValue="abc"
          />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>size: sm / md / lg</p>
          <div style={COLUMN_STYLE}>
            <Input label="sm サイズ" size="sm" placeholder="small" />
            <Input label="md サイズ" size="md" placeholder="medium" />
            <Input label="lg サイズ" size="lg" placeholder="large" />
          </div>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>disabled / readOnly</p>
          <div style={COLUMN_STYLE}>
            <Input label="disabled" disabled defaultValue="入力不可" />
            <Input label="readOnly" readOnly defaultValue="読み取り専用" />
          </div>
        </Panel>
      </Panel>

      {/* ================================================
          Textarea
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-textarea"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="Textarea"
          meta="rows / error / disabled"
          level={2}
          id="section-textarea"
        />

        <Panel variant="inset">
          <p style={LABEL_STYLE}>通常（hint あり）</p>
          <Textarea
            label="コメント"
            placeholder="ここにコメントを入力..."
            hint="500 文字以内で記入してください"
            rows={4}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
          />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>error 状態</p>
          <Textarea label="本文" error="必須項目です" rows={3} required />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>disabled / readOnly</p>
          <div style={COLUMN_STYLE}>
            <Textarea
              label="disabled"
              disabled
              defaultValue="入力不可のテキストエリア"
              rows={2}
            />
            <Textarea
              label="readOnly"
              readOnly
              defaultValue="読み取り専用のテキストエリア"
              rows={2}
            />
          </div>
        </Panel>
      </Panel>

      {/* ================================================
          Panel
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-panel"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="Panel"
          meta="default / flush / inset"
          level={2}
          id="section-panel"
        />

        <Panel variant="inset">
          <p style={LABEL_STYLE}>variant: default</p>
          <Panel>
            <p>default パネル — 白背景 + border。標準的な用途。</p>
          </Panel>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>variant: flush</p>
          <Panel variant="flush">
            {/*
              C-1: <p style={{ padding: "1rem" }}> を削除（インライン style 撤去）。
              flush パネルは padding を持たないため、内側コンテンツを Panel(default) でラップして
              パネルの視覚をデモする。説明テキストは plain <p> として表示。
            */}
            <p className={styles.flushDemo}>
              flush パネル — padding なし。内側で独自 padding を持つとき。
            </p>
          </Panel>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>variant: inset</p>
          <Panel variant="inset">
            <p>inset パネル — bg-soft 背景。沈んだ表現が必要なとき。</p>
          </Panel>
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>as=section（セマンティクス変更）</p>
          <Panel as="section">
            <p>section 要素として描画される Panel。</p>
          </Panel>
        </Panel>
      </Panel>

      {/* ================================================
          SectionHead
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-sectionhead"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="SectionHead"
          meta="level × meta"
          level={2}
          id="section-sectionhead"
        />

        <Panel variant="inset">
          <p style={LABEL_STYLE}>level=2（デフォルト）</p>
          <SectionHead title="セクションタイトル" />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>level=2 + meta</p>
          <SectionHead title="セクションタイトル" meta="12 件" />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>level=3</p>
          <SectionHead title="サブセクション" level={3} />
        </Panel>

        <Panel variant="inset">
          <p style={LABEL_STYLE}>level=4</p>
          <SectionHead title="詳細見出し" level={4} meta="補足情報" />
        </Panel>
      </Panel>

      {/* ================================================
          ArticleArea — B-1 パターン β で削除済み（cycle-170 C-2）
          ================================================ */}
      {/*
        B-1 候補 62 判定: ArticleArea は不採用（パターン β）。
        C-2 でファイルごと削除された。dev-preview では代わりにインライン <article> を使用して
        --max-width-article（globals.css 定義済み変数）での本文幅制御を展示する。
        steps / related props は不採用になったため展示しない。
      */}
      <Panel
        as="section"
        aria-labelledby="section-article-area"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="ArticleArea（削除済み）"
          meta="B-1 パターン β により C-2 で削除"
          level={2}
          id="section-article-area"
        />
        <Panel variant="inset">
          <p style={LABEL_STYLE}>
            インライン &lt;article&gt; + --max-width-article（代替展示）
          </p>
          <article className={styles.articleDemo}>
            <p>
              ArticleArea は B-1 判定でパターン
              β（ファイル削除）に確定し、cycle-170 C-2
              で削除された。本文幅の一貫保証は globals.css の
              --max-width-article 変数が担う。
            </p>
          </article>
        </Panel>
      </Panel>

      {/* ================================================
          SiteFooter
          ================================================ */}
      <Panel
        as="section"
        aria-labelledby="section-footer"
        className={styles.sectionPanel}
      >
        <SectionHead
          title="SiteFooter"
          meta="chrome / footer"
          level={2}
          id="section-footer"
        />
        <Panel variant="inset">
          <p style={LABEL_STYLE}>デフォルト disclaimer</p>
          <SiteFooter linkGroups={FOOTER_LINK_GROUPS} />
        </Panel>
        <Panel variant="inset">
          <p style={LABEL_STYLE}>カスタム disclaimer</p>
          <SiteFooter
            linkGroups={FOOTER_LINK_GROUPS}
            disclaimer="カスタム免責文: このページは動作確認専用です。"
          />
        </Panel>
      </Panel>
    </div>
  );
}
