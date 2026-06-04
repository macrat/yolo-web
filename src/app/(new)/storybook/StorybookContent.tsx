"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import SegmentedControl from "@/components/SegmentedControl";
import ErrorMessage from "@/components/ErrorMessage";
import FileDropZone from "@/components/FileDropZone";
import {
  useCopyToClipboard,
  COPIED_LABEL,
} from "@/components/hooks/useCopyToClipboard";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import Pagination from "@/components/Pagination";
import ShareButtons from "@/components/ShareButtons";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import styles from "./page.module.css";

// カラースウォッチの定義
const COLOR_SECTIONS = [
  {
    title: "表面色 (Surface)",
    swatches: [
      { token: "--bg", role: "パネルの基本背景色" },
      { token: "--bg-soft", role: "画面全体の背景 / 標準ボタン色" },
      { token: "--bg-softer", role: "標準ボタンのホバー色" },
      { token: "--bg-invert", role: "primary ボタン色" },
      { token: "--bg-invert-soft", role: "primary ボタンのホバー色" },
    ],
  },
  {
    title: "文字色 (Text)",
    swatches: [
      { token: "--fg", role: "基本の文字色" },
      { token: "--fg-soft", role: "目立たない文字色（補足説明など）" },
      { token: "--fg-softer", role: "さらに目立たない（無効状態など）" },
      { token: "--fg-invert", role: "primary ボタンの文字色" },
      { token: "--fg-invert-soft", role: "primary ボタンのホバー文字色" },
    ],
  },
  {
    title: "境界線 (Border)",
    swatches: [
      { token: "--border", role: "基本の罫線色" },
      { token: "--border-strong", role: "フォーム要素の明示的な境界線" },
    ],
  },
  {
    title: "アクセント (Accent)",
    swatches: [
      { token: "--accent", role: "リンク・フォーカスのアクセントカラー" },
      { token: "--accent-strong", role: "アクセントの強いバージョン" },
      {
        token: "--accent-soft",
        role: "アクセントの柔らかいバージョン（背景）",
      },
    ],
  },
  {
    title: "ステータス (Status)",
    swatches: [
      { token: "--success", role: "成功・完了を示す色" },
      { token: "--success-strong", role: "success の強いバージョン" },
      { token: "--success-soft", role: "success の柔らかいバージョン（背景）" },
      { token: "--warning", role: "注意・警告を示す色" },
      { token: "--warning-strong", role: "warning の強いバージョン" },
      { token: "--warning-soft", role: "warning の柔らかいバージョン（背景）" },
      { token: "--danger", role: "危険・エラーを示す色" },
      { token: "--danger-strong", role: "danger の強いバージョン" },
      { token: "--danger-soft", role: "danger の柔らかいバージョン（背景）" },
    ],
  },
];

// Breadcrumb サンプルデータ
const BREADCRUMB_2 = [{ label: "ホーム", href: "/" }, { label: "ブログ" }];

const BREADCRUMB_3 = [
  { label: "ホーム", href: "/" },
  { label: "ツール", href: "/tools" },
  { label: "文字カウンター" },
];

const BREADCRUMB_1 = [{ label: "ホーム" }];

// FaqSection サンプルデータ
const SAMPLE_FAQ = [
  {
    question: "このツールはどのように動作しますか？",
    answer:
      "ブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
  },
  {
    question: "対応しているファイル形式は何ですか？",
    answer:
      "テキスト形式（.txt）および UTF-8 エンコードのファイルに対応しています。",
  },
];

// 目次アイテム（Header/Footer はページ上下に実物が表示されるためプレビューセクション不要）
const TOC_ITEMS = [
  { id: "overview", label: "1. 概要" },
  { id: "colors", label: "2. カラーパレット" },
  { id: "radius-elevation", label: "3. 角丸・影" },
  { id: "panel", label: "4. Panel" },
  { id: "button", label: "5. Button" },
  { id: "input", label: "6. Input" },
  { id: "breadcrumb", label: "7. Breadcrumb" },
  { id: "toggle-switch", label: "8. ToggleSwitch" },
  { id: "pagination", label: "9. Pagination" },
  { id: "share-buttons", label: "10. ShareButtons" },
  { id: "textarea", label: "11. Textarea" },
  { id: "select", label: "12. Select" },
  { id: "segmented-control", label: "13. SegmentedControl" },
  { id: "error-message", label: "14. ErrorMessage" },
  { id: "file-drop-zone", label: "15. FileDropZone" },
  { id: "use-copy-to-clipboard", label: "16. useCopyToClipboard" },
  { id: "input-date", label: "17. Input (type=date)" },
  { id: "faq-section", label: "18. FaqSection" },
  { id: "related-tools", label: "19. RelatedTools" },
  { id: "related-blog-posts", label: "20. RelatedBlogPosts" },
];

export default function StorybookContent() {
  // ToggleSwitch controlled state
  const [toggleOn, setToggleOn] = useState(false);
  // Controlled input state
  const [controlledText, setControlledText] = useState("controlled value");
  // SegmentedControl controlled state
  const [segmentValue, setSegmentValue] = useState("option-a");
  // useCopyToClipboard demo
  const { copy, copiedKey } = useCopyToClipboard();

  return (
    <div className={styles.container}>
      {/* === 1. 概要 === */}
      <section id="overview" className={styles.section}>
        <h1 className={styles.pageTitle}>Storybook（開発者向け）</h1>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: 概要</span>
          <div className={styles.notice}>
            <p>
              このページは新デザインシステムのコンポーネントカタログ。
              <code>@/components/</code>{" "}
              配下のコンポーネントを実機で動作確認できる開発者向けページ。
              来訪者の目に触れる想定はないため noindex を指定している。
            </p>
          </div>

          {/* 目次 */}
          <nav aria-label="ページ内目次">
            <div className={styles.toc}>
              <p className={styles.tocTitle}>目次</p>
              <ol className={styles.tocList}>
                {TOC_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.label}</a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        </Panel>
      </section>

      {/* === 2. カラーパレット === */}
      <section id="colors" className={styles.section}>
        <h2 className={styles.sectionTitle}>2. カラーパレット</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: カラーパレット</span>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--fg-soft)",
              marginBottom: "1.5rem",
            }}
          >
            ライト / ダークはブラウザのテーマ切替で両方確認できます。
          </p>
          {COLOR_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className={styles.subsectionTitle}>{section.title}</h3>
              <div className={styles.swatchGrid}>
                {section.swatches.map((swatch) => (
                  <div key={swatch.token} className={styles.swatch}>
                    <div
                      className={styles.swatchColor}
                      style={{ background: `var(${swatch.token})` }}
                    />
                    <div className={styles.swatchInfo}>
                      <div className={styles.swatchToken}>{swatch.token}</div>
                      <div className={styles.swatchRole}>{swatch.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Panel>
      </section>

      {/* === 3. 角丸・影 === */}
      <section id="radius-elevation" className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 角丸 / 影</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: 角丸・影</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            角丸（Border Radius）
          </h3>
          <div className={styles.radiusRow}>
            <div>
              <div
                className={styles.radiusSample}
                style={{ borderRadius: "var(--r-normal)" }}
              >
                サンプルテキスト
              </div>
              <div className={styles.radiusSampleLabel}>--r-normal (2px)</div>
              <div style={{ fontSize: "0.7rem", color: "var(--fg-softer)" }}>
                パネル・カード・タグ・モーダル等
              </div>
            </div>
            <div>
              <div
                className={styles.radiusSample}
                style={{ borderRadius: "var(--r-interactive)" }}
              >
                サンプルテキスト
              </div>
              <div className={styles.radiusSampleLabel}>
                --r-interactive (8px)
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--fg-softer)" }}>
                ボタン・入力欄・セレクト等
              </div>
            </div>
          </div>

          <h3 className={styles.subsectionTitle}>
            影 / エレベーション（Shadow）
          </h3>
          <div className={styles.shadowRow}>
            <div>
              <div
                className={styles.shadowSample}
                style={{ boxShadow: "var(--shadow-button)" }}
              >
                ボタンの影
              </div>
              <div className={styles.shadowSampleLabel}>--shadow-button</div>
              <div style={{ fontSize: "0.7rem", color: "var(--fg-softer)" }}>
                ボタンに適用
              </div>
            </div>
            <div>
              <div
                className={styles.shadowSample}
                style={{ boxShadow: "var(--shadow-dragging)" }}
              >
                ドラッグ中の影
              </div>
              <div className={styles.shadowSampleLabel}>--shadow-dragging</div>
              <div style={{ fontSize: "0.7rem", color: "var(--fg-softer)" }}>
                ドラッグ中の要素に適用
              </div>
            </div>
          </div>
        </Panel>
      </section>

      {/* === 4. Panel === */}
      <section id="panel" className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Panel</h2>
        {/*
         * DESIGN.md §4 では「パネルは原則として入れ子にしない」とあるが、
         * ここでは Panel コンポーネント自体のプレビューを目的とするため、
         * 例外的に外側 Panel の中にサンプル Panel を入れ子にしている。
         */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Panel</span>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Panel>
              <p>as=&quot;section&quot;（デフォルト）: 汎用コンテナパネル</p>
              <p style={{ color: "var(--fg-soft)", fontSize: "0.9rem" }}>
                DESIGN.md §4 準拠。パネルは入れ子にせず、影をつけない。
              </p>
            </Panel>

            <Panel as="article">
              <p>as=&quot;article&quot;: 記事コンテンツ向けパネル</p>
            </Panel>

            <Panel as="aside">
              <p>as=&quot;aside&quot;: 補足情報向けパネル</p>
            </Panel>

            <Panel as="div">
              <p>as=&quot;div&quot;: レイアウト上の理由で div が必要な場合</p>
            </Panel>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <p className={styles.subsectionTitle} style={{ marginTop: 0 }}>
              as prop の DOM 確認
            </p>
            <div className={styles.asPropGrid}>
              {(["section", "div", "article", "aside"] as const).map((tag) => (
                <div key={tag}>
                  <div className={styles.asPropLabel}>as=&quot;{tag}&quot;</div>
                  <Panel as={tag}>
                    <span style={{ fontSize: "0.85rem" }}>
                      &lt;{tag}&gt; としてレンダリング
                    </span>
                  </Panel>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </section>

      {/* === 5. Button === */}
      <section id="button" className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Button</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Button</span>

          <div className={styles.buttonMatrix}>
            {/* Primary */}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonGroupLabel}>primary</div>
              <Button
                variant="primary"
                onClick={() => console.log("primary default clicked")}
              >
                Primary Default
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => console.log("primary small clicked")}
              >
                Primary Small
              </Button>
              <Button variant="primary" disabled>
                Primary Disabled
              </Button>
            </div>

            {/* Default — --bg-soft 背景の標準ボタン */}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonGroupLabel}>default</div>
              <Button
                variant="default"
                onClick={() => console.log("default default clicked")}
              >
                Default Default
              </Button>
              <Button
                variant="default"
                size="small"
                onClick={() => console.log("default small clicked")}
              >
                Default Small
              </Button>
              <Button variant="default" disabled>
                Default Disabled
              </Button>
            </div>
          </div>
        </Panel>
      </section>

      {/* === 6. Input === */}
      <section id="input" className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Input</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Input</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            各 type
          </h3>
          <div className={styles.inputGrid}>
            {(
              [
                "text",
                "email",
                "number",
                "password",
                "search",
                "tel",
                "url",
              ] as const
            ).map((type) => (
              <div key={type} className={styles.inputItem}>
                <div className={styles.inputItemLabel}>
                  type=&quot;{type}&quot;
                </div>
                <Input
                  type={type}
                  placeholder={`type="${type}" の入力欄`}
                  aria-label={`type ${type} の入力欄`}
                />
              </div>
            ))}
          </div>

          <h3 className={styles.subsectionTitle}>特殊状態</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>error={"{true}"}</div>
              <Input
                defaultValue="エラー状態の入力値"
                error
                aria-label="エラー状態の入力欄"
              />
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>disabled</div>
              <Input
                value="無効状態の入力値"
                disabled
                readOnly
                aria-label="無効状態の入力欄"
              />
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>readOnly</div>
              <Input
                value="読み取り専用の入力値"
                readOnly
                aria-label="読み取り専用の入力欄"
              />
            </div>
          </div>

          <h3 className={styles.subsectionTitle}>Controlled / Uncontrolled</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                controlled (value + onChange)
              </div>
              <Input
                value={controlledText}
                onChange={(e) => setControlledText(e.target.value)}
                aria-label="controlled 入力欄"
              />
              <div style={{ fontSize: "0.8rem", color: "var(--fg-soft)" }}>
                現在の値: {controlledText}
              </div>
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                uncontrolled (defaultValue)
              </div>
              <Input defaultValue="初期値" aria-label="uncontrolled 入力欄" />
            </div>
          </div>
        </Panel>
      </section>

      {/* === 7. Breadcrumb === */}
      <section id="breadcrumb" className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Breadcrumb</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Breadcrumb</span>

          <div className={styles.breadcrumbSamples}>
            <div>
              <div
                className={styles.inputItemLabel}
                style={{ marginBottom: "0.5rem" }}
              >
                1 階層（現在位置のみ）
              </div>
              <Breadcrumb items={BREADCRUMB_1} />
            </div>
            <div>
              <div
                className={styles.inputItemLabel}
                style={{ marginBottom: "0.5rem" }}
              >
                2 階層
              </div>
              <Breadcrumb items={BREADCRUMB_2} />
            </div>
            <div>
              <div
                className={styles.inputItemLabel}
                style={{ marginBottom: "0.5rem" }}
              >
                3 階層
              </div>
              <Breadcrumb items={BREADCRUMB_3} />
            </div>
          </div>
        </Panel>
      </section>

      {/* === 8. ToggleSwitch === */}
      <section id="toggle-switch" className={styles.section}>
        <h2 className={styles.sectionTitle}>8. ToggleSwitch</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: ToggleSwitch</span>

          <div className={styles.toggleSamples}>
            <div className={styles.toggleItem}>
              <div className={styles.toggleItemLabel}>
                controlled (checked + onChange)
              </div>
              <ToggleSwitch
                label="通知を受け取る"
                checked={toggleOn}
                onChange={(e) => setToggleOn(e.target.checked)}
              />
              <div className={styles.toggleStatus}>
                現在の状態: {toggleOn ? "ON" : "OFF"}
              </div>
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleItemLabel}>
                uncontrolled (defaultChecked)
              </div>
              <ToggleSwitch
                label="メール配信（初期: ON）"
                defaultChecked
                name="email-notify"
              />
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleItemLabel}>disabled</div>
              <ToggleSwitch label="無効状態（OFF）" disabled />
            </div>

            <div className={styles.toggleItem}>
              <div className={styles.toggleItemLabel}>disabled + checked</div>
              <ToggleSwitch label="無効状態（ON）" disabled defaultChecked />
            </div>
          </div>
        </Panel>
      </section>
      {/* === 9. Pagination === */}
      <section id="pagination" className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Pagination</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Pagination</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            link モード（デフォルト）
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div className={styles.inputItemLabel}>
              5 ページ・現在ページ = 1（前へ disabled）
            </div>
            <Pagination currentPage={1} totalPages={5} basePath="/blog" />

            <div className={styles.inputItemLabel}>
              5 ページ・現在ページ = 3（中間）
            </div>
            <Pagination currentPage={3} totalPages={5} basePath="/blog" />

            <div className={styles.inputItemLabel}>
              5 ページ・現在ページ = 5（次へ disabled）
            </div>
            <Pagination currentPage={5} totalPages={5} basePath="/blog" />

            <div className={styles.inputItemLabel}>
              10 ページ・現在ページ = 1（省略あり）
            </div>
            <Pagination currentPage={1} totalPages={10} basePath="/blog" />

            <div className={styles.inputItemLabel}>
              10 ページ・現在ページ = 5（両側省略あり）
            </div>
            <Pagination currentPage={5} totalPages={10} basePath="/blog" />

            <div className={styles.inputItemLabel}>1 ページのみ（非表示）</div>
            <div style={{ color: "var(--fg-soft)", fontSize: "0.85rem" }}>
              （totalPages=1 のとき null が返るため何も表示されない）
            </div>
            <Pagination currentPage={1} totalPages={1} basePath="/blog" />
          </div>
        </Panel>
      </section>

      {/* === 10. ShareButtons === */}
      <section id="share-buttons" className={styles.section}>
        <h2 className={styles.sectionTitle}>10. ShareButtons</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: ShareButtons</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            デフォルト（全ボタン）
          </h3>
          <ShareButtons
            url="/blog/sample-post"
            title="サンプル記事 | yolos.net"
          />

          <h3 className={styles.subsectionTitle}>X のみ</h3>
          <ShareButtons
            url="/blog/sample-post"
            title="サンプル記事 | yolos.net"
            sns={["x"]}
          />

          <h3 className={styles.subsectionTitle}>コピーボタンのみ</h3>
          <ShareButtons
            url="/blog/sample-post"
            title="サンプル記事 | yolos.net"
            sns={["copy"]}
          />
        </Panel>
      </section>

      {/* === 11. Textarea === */}
      <section id="textarea" className={styles.section}>
        <h2 className={styles.sectionTitle}>11. Textarea</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Textarea</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            variant
          </h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                variant=&quot;default&quot;
              </div>
              <Textarea
                variant="default"
                rows={3}
                placeholder="通常テキスト入力（システムフォント）"
                aria-label="default variant のテキストエリア"
              />
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                variant=&quot;mono&quot;
              </div>
              <Textarea
                variant="mono"
                rows={3}
                placeholder="等幅フォント（コード・技術系テキスト）"
                aria-label="mono variant のテキストエリア"
                spellCheck={false}
              />
            </div>
          </div>

          <h3 className={styles.subsectionTitle}>特殊状態</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>readOnly</div>
              <Textarea
                value="読み取り専用の出力テキスト。多くのツールが入力欄と並べて出力を表示するパターンで使用する。"
                readOnly
                rows={3}
                aria-label="読み取り専用のテキストエリア"
              />
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>disabled</div>
              <Textarea
                value="無効状態のテキストエリア"
                disabled
                rows={3}
                aria-label="無効状態のテキストエリア"
              />
            </div>
          </div>
        </Panel>
      </section>

      {/* === 12. Select === */}
      <section id="select" className={styles.section}>
        <h2 className={styles.sectionTitle}>12. Select</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Select</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            通常
          </h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                children で option を受ける（uncontrolled）
              </div>
              <Select defaultValue="ja" aria-label="言語の選択">
                <option value="ja">日本語</option>
                <option value="en">英語</option>
                <option value="zh">中国語</option>
              </Select>
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>disabled</div>
              <Select disabled aria-label="無効状態のセレクト">
                <option value="a">選択肢 A</option>
                <option value="b">選択肢 B</option>
              </Select>
            </div>
          </div>
        </Panel>
      </section>

      {/* === 13. SegmentedControl === */}
      <section id="segmented-control" className={styles.section}>
        <h2 className={styles.sectionTitle}>13. SegmentedControl</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: SegmentedControl</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            controlled（value + onChange）
          </h3>
          <SegmentedControl
            options={[
              { label: "選択肢 A", value: "option-a" },
              { label: "選択肢 B", value: "option-b" },
              { label: "選択肢 C", value: "option-c" },
            ]}
            value={segmentValue}
            onChange={setSegmentValue}
            aria-label="サンプル選択"
          />
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--fg-soft)",
              marginTop: "0.5rem",
            }}
          >
            現在の値: {segmentValue}
          </div>

          <h3 className={styles.subsectionTitle}>2 択パターン</h3>
          <SegmentedControl
            options={[
              { label: "削除", value: "remove" },
              { label: "スペースに置換", value: "replace-space" },
            ]}
            value="remove"
            onChange={() => {}}
            aria-label="改行処理モード"
          />
        </Panel>
      </section>

      {/* === 14. ErrorMessage === */}
      <section id="error-message" className={styles.section}>
        <h2 className={styles.sectionTitle}>14. ErrorMessage</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: ErrorMessage</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            既定フォールバック（props 未指定）
          </h3>
          <ErrorMessage />

          <h3 className={styles.subsectionTitle}>message 指定</h3>
          <ErrorMessage message="ファイル形式が正しくありません。PNG・JPEG・GIF・WebP のみ対応しています。" />

          <h3 className={styles.subsectionTitle}>children（JSX）指定</h3>
          <ErrorMessage>
            変換に失敗しました。入力内容を確認してください。
          </ErrorMessage>
        </Panel>
      </section>

      {/* === 15. FileDropZone === */}
      <section id="file-drop-zone" className={styles.section}>
        <h2 className={styles.sectionTitle}>15. FileDropZone</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: FileDropZone</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            基本（accept + maxSizeBytes + description）
          </h3>
          <FileDropZone
            onFileSelect={(file) => console.log("selected:", file.name)}
            accept="image/*"
            maxSizeBytes={10 * 1024 * 1024}
            description="PNG, JPEG, GIF, WebP 対応（最大 10MB）"
          />

          <h3 className={styles.subsectionTitle}>制限なし</h3>
          <FileDropZone
            onFileSelect={(file) => console.log("selected:", file.name)}
          />
        </Panel>
      </section>

      {/* === 16. useCopyToClipboard === */}
      <section id="use-copy-to-clipboard" className={styles.section}>
        <h2 className={styles.sectionTitle}>16. useCopyToClipboard</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>
            Preview: useCopyToClipboard
          </span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            単一ターゲット（key 省略）
          </h3>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <Button
              variant="default"
              onClick={() => copy("クリップボードにコピーされるテキスト")}
            >
              {copiedKey ? COPIED_LABEL : "コピー"}
            </Button>
            <span
              aria-live="polite"
              style={{ fontSize: "0.85rem", color: "var(--fg-soft)" }}
            >
              {copiedKey ? COPIED_LABEL : ""}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--fg-soft)",
              marginTop: "0.5rem",
            }}
          >
            コピー内容: &quot;クリップボードにコピーされるテキスト&quot;（2
            秒後にリセット）
          </div>
        </Panel>
      </section>

      {/* === 17. Input (type=date) === */}
      <section id="input-date" className={styles.section}>
        <h2 className={styles.sectionTitle}>17. Input (type=date)</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>
            Preview: Input (type=date)
          </span>

          <div className={styles.inputGrid}>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>type=&quot;date&quot;</div>
              <Input
                type="date"
                defaultValue="2026-06-04"
                aria-label="日付入力欄"
              />
            </div>
            <div className={styles.inputItem}>
              <div className={styles.inputItemLabel}>
                type=&quot;date&quot; disabled
              </div>
              <Input
                type="date"
                value="2026-06-04"
                disabled
                readOnly
                aria-label="無効状態の日付入力欄"
              />
            </div>
          </div>
        </Panel>
      </section>

      {/* === 18. FaqSection === */}
      <section id="faq-section" className={styles.section}>
        <h2 className={styles.sectionTitle}>18. FaqSection</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: FaqSection</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            faq あり（2 件）
          </h3>
          <FaqSection faq={SAMPLE_FAQ} />

          <h3 className={styles.subsectionTitle}>
            faq が空配列のとき（null を返す）
          </h3>
          <div style={{ fontSize: "0.85rem", color: "var(--fg-soft)" }}>
            （空配列を渡すと何も表示されない）
          </div>
          <FaqSection faq={[]} />
        </Panel>
      </section>

      {/* === 19. RelatedTools === */}
      <section id="related-tools" className={styles.section}>
        <h2 className={styles.sectionTitle}>19. RelatedTools</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: RelatedTools</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            currentSlug=&quot;char-count&quot; / relatedSlugs に実在スラッグ 2
            件
          </h3>
          <RelatedTools
            currentSlug="char-count"
            relatedSlugs={["byte-counter", "text-diff"]}
          />

          <h3 className={styles.subsectionTitle}>
            一致なし（relatedSlugs が存在しないスラッグのとき null を返す）
          </h3>
          <div style={{ fontSize: "0.85rem", color: "var(--fg-soft)" }}>
            （一致なしのとき何も表示されない）
          </div>
          <RelatedTools
            currentSlug="char-count"
            relatedSlugs={["nonexistent-tool"]}
          />
        </Panel>
      </section>

      {/* === 20. RelatedBlogPosts === */}
      <section id="related-blog-posts" className={styles.section}>
        <h2 className={styles.sectionTitle}>20. RelatedBlogPosts</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: RelatedBlogPosts</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            toolSlug=&quot;business-email&quot;（関連記事あり）
          </h3>
          <RelatedBlogPosts toolSlug="business-email" />

          <h3 className={styles.subsectionTitle}>
            toolSlug=&quot;char-count&quot;（関連記事なし → null を返す）
          </h3>
          <div style={{ fontSize: "0.85rem", color: "var(--fg-soft)" }}>
            （関連記事なしのとき何も表示されない）
          </div>
          <RelatedBlogPosts toolSlug="char-count" />
        </Panel>
      </section>
    </div>
  );
}
