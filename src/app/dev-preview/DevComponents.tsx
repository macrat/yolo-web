/**
 * DevComponents — dev-preview/ 動作確認ページ用のクライアントコンポーネント群
 *
 * Input・Textarea など state を持つフォーム部品はクライアント側で描画する必要があるため、
 * このファイルに分離する。page.tsx は Server Component のままにして metadata のエクスポートを維持する。
 */
"use client";

import { useState } from "react";
import Button from "@/components/design-system/Button";
import Input from "@/components/design-system/Input";
import Textarea from "@/components/design-system/Textarea";
import Panel from "@/components/design-system/Panel";
import SectionHead from "@/components/design-system/SectionHead";
import SiteHeader from "@/components/design-system/SiteHeader";
import SiteFooter from "@/components/design-system/SiteFooter";
import ArticleArea from "@/components/design-system/ArticleArea";
import styles from "./DevComponents.module.css";

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

/** 関連リンクのサンプルデータ */
const RELATED_ITEMS = [
  { href: "/tools", label: "ツール一覧", tag: "ツール" },
  { href: "/blog", label: "ブログ記事一覧", tag: "ブログ" },
];

/** 使い方ステップのサンプルデータ */
const HOW_TO_STEPS = [
  "コンポーネントを選ぶ",
  "プロップを確認する",
  "ページに組み込む",
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
      <section className={styles.section} aria-labelledby="section-header">
        <SectionHead
          title="SiteHeader"
          meta="chrome / header"
          level={2}
          id="section-header"
        />
        <div className={styles.preview}>
          <p className={styles.label}>
            siteName デフォルト（&ldquo;yolos.net&rdquo;）
          </p>
          <SiteHeader navLinks={NAV_LINKS} />
        </div>
        <div className={styles.preview}>
          <p className={styles.label}>siteName カスタム</p>
          <SiteHeader navLinks={NAV_LINKS} siteName="カスタム名" />
        </div>
      </section>

      {/* ================================================
          Button
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-button">
        <SectionHead
          title="Button"
          meta="variant × size"
          level={2}
          id="section-button"
        />

        <div className={styles.preview}>
          <p className={styles.label}>variant: primary / ghost / danger</p>
          <div className={styles.row}>
            <Button variant="primary">primary</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="danger">danger</Button>
          </div>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>size: sm / md / lg</p>
          <div className={styles.row}>
            <Button size="sm">sm</Button>
            <Button size="md">md</Button>
            <Button size="lg">lg</Button>
          </div>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>disabled / loading / loading トグル</p>
          <div className={styles.row}>
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
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>fullWidth=true</p>
          <Button fullWidth>全幅ボタン</Button>
        </div>
      </section>

      {/* ================================================
          Input
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-input">
        <SectionHead
          title="Input"
          meta="text / email / search / error"
          level={2}
          id="section-input"
        />

        <div className={styles.preview}>
          <p className={styles.label}>通常（hint あり）</p>
          <Input
            label="名前"
            placeholder="山田 太郎"
            hint="フルネームで入力してください"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>type=email / required</p>
          <Input
            label="メールアドレス"
            type="email"
            placeholder="user@example.com"
            required
          />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>error 状態</p>
          <Input
            label="パスワード"
            type="password"
            error="8文字以上で入力してください"
            defaultValue="abc"
          />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>size: sm / md / lg</p>
          <div className={styles.column}>
            <Input label="sm サイズ" size="sm" placeholder="small" />
            <Input label="md サイズ" size="md" placeholder="medium" />
            <Input label="lg サイズ" size="lg" placeholder="large" />
          </div>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>disabled / readOnly</p>
          <div className={styles.column}>
            <Input label="disabled" disabled defaultValue="入力不可" />
            <Input label="readOnly" readOnly defaultValue="読み取り専用" />
          </div>
        </div>
      </section>

      {/* ================================================
          Textarea
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-textarea">
        <SectionHead
          title="Textarea"
          meta="rows / error / disabled"
          level={2}
          id="section-textarea"
        />

        <div className={styles.preview}>
          <p className={styles.label}>通常（hint あり）</p>
          <Textarea
            label="コメント"
            placeholder="ここにコメントを入力..."
            hint="500 文字以内で記入してください"
            rows={4}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
          />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>error 状態</p>
          <Textarea label="本文" error="必須項目です" rows={3} required />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>disabled / readOnly</p>
          <div className={styles.column}>
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
        </div>
      </section>

      {/* ================================================
          Panel
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-panel">
        <SectionHead
          title="Panel"
          meta="default / flush / inset"
          level={2}
          id="section-panel"
        />

        <div className={styles.preview}>
          <p className={styles.label}>variant: default</p>
          <Panel>
            <p>default パネル — 白背景 + border。標準的な用途。</p>
          </Panel>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>variant: flush</p>
          <Panel variant="flush">
            <p style={{ padding: "1rem" }}>
              flush パネル — padding なし。内側で独自 padding を持つとき。
            </p>
          </Panel>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>variant: inset</p>
          <Panel variant="inset">
            <p>inset パネル — bg-soft 背景。沈んだ表現が必要なとき。</p>
          </Panel>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>as=section（セマンティクス変更）</p>
          <Panel as="section">
            <p>section 要素として描画される Panel。</p>
          </Panel>
        </div>
      </section>

      {/* ================================================
          SectionHead
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-sectionhead">
        <SectionHead
          title="SectionHead"
          meta="level × meta"
          level={2}
          id="section-sectionhead"
        />

        <div className={styles.preview}>
          <p className={styles.label}>level=2（デフォルト）</p>
          <SectionHead title="セクションタイトル" />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>level=2 + meta</p>
          <SectionHead title="セクションタイトル" meta="12 件" />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>level=3</p>
          <SectionHead title="サブセクション" level={3} />
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>level=4</p>
          <SectionHead title="詳細見出し" level={4} meta="補足情報" />
        </div>
      </section>

      {/* ================================================
          ArticleArea
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-article">
        <SectionHead
          title="ArticleArea"
          meta="title / steps / related"
          level={2}
          id="section-article"
        />

        <div className={styles.preview}>
          <p className={styles.label}>全スロット使用</p>
          <ArticleArea
            title="テキストカウンター"
            meta="ツール"
            steps={HOW_TO_STEPS}
            related={RELATED_ITEMS}
          >
            <Panel>
              <p style={{ padding: "1rem" }}>
                ツール本体エリア（children スロット）
              </p>
            </Panel>
          </ArticleArea>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>title / children のみ</p>
          <ArticleArea title="シンプルな記事">
            <p>本文コンテンツ。steps・related なし。</p>
          </ArticleArea>
        </div>

        <div className={styles.preview}>
          <p className={styles.label}>children のみ（タイトルなし）</p>
          <ArticleArea>
            <p>タイトルを持たない最小構成。</p>
          </ArticleArea>
        </div>
      </section>

      {/* ================================================
          SiteFooter
          ================================================ */}
      <section className={styles.section} aria-labelledby="section-footer">
        <SectionHead
          title="SiteFooter"
          meta="chrome / footer"
          level={2}
          id="section-footer"
        />
        <div className={styles.preview}>
          <p className={styles.label}>デフォルト disclaimer</p>
          <SiteFooter linkGroups={FOOTER_LINK_GROUPS} />
        </div>
        <div className={styles.preview}>
          <p className={styles.label}>カスタム disclaimer</p>
          <SiteFooter
            linkGroups={FOOTER_LINK_GROUPS}
            disclaimer="カスタム免責文: このページは動作確認専用です。"
          />
        </div>
      </section>
    </div>
  );
}
