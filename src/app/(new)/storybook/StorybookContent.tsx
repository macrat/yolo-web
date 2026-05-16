"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import Pagination from "@/components/Pagination";
import ShareButtons from "@/components/ShareButtons";
import PrivacyBadge from "@/components/PrivacyBadge";
import AccordionItem from "@/tools/_components/AccordionItem";
import ResultCopyArea from "@/components/ResultCopyArea";
import LifecycleSection from "@/tools/_components/LifecycleSection";
import IdentityHeader from "@/tools/_components/IdentityHeader";
import TrustSection from "@/tools/_components/TrustSection";
import ToolInputArea from "@/tools/_components/ToolInputArea";
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
  { id: "privacy-badge", label: "11. PrivacyBadge" },
  { id: "accordion-item", label: "12. AccordionItem" },
  { id: "result-copy-area", label: "13. ResultCopyArea" },
  { id: "lifecycle-section", label: "14. LifecycleSection" },
  { id: "identity-header", label: "15. IdentityHeader" },
  { id: "trust-section", label: "16. TrustSection" },
  { id: "tool-input-area", label: "17. ToolInputArea" },
];

export default function StorybookContent() {
  // ToggleSwitch controlled state
  const [toggleOn, setToggleOn] = useState(false);
  // Controlled input state
  const [controlledText, setControlledText] = useState("controlled value");

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
                onClick={() => console.log("primary clicked")}
              >
                Primary
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
                onClick={() => console.log("default clicked")}
              >
                Default
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

      {/* === 11. PrivacyBadge === */}
      <section id="privacy-badge" className={styles.section}>
        <h2 className={styles.sectionTitle}>11. PrivacyBadge</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: PrivacyBadge</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            デフォルト（props なし）
          </h3>
          <PrivacyBadge />

          <h3 className={styles.subsectionTitle}>className 追加</h3>
          <PrivacyBadge className="storybook-example" />
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--fg-soft)",
              marginTop: "0.5rem",
            }}
          >
            className=&quot;storybook-example&quot; を付与（DOM で確認可能）
          </p>
        </Panel>
      </section>

      {/* === 12. AccordionItem === */}
      <section id="accordion-item" className={styles.section}>
        <h2 className={styles.sectionTitle}>12. AccordionItem</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: AccordionItem</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            デフォルト閉（defaultOpen なし）
          </h3>
          <AccordionItem title="デフォルト閉のアコーディオン">
            <p>
              クリックまたはキーボード（Space / Enter）で開閉できます。
              初期状態は閉じています。
            </p>
          </AccordionItem>

          <h3 className={styles.subsectionTitle}>
            デフォルト開（defaultOpen=true）
          </h3>
          <AccordionItem title="デフォルト開のアコーディオン" defaultOpen>
            <p>
              このアコーディオンは初期状態で開いています。
              クリックまたはキーボード（Space / Enter）で閉じることができます。
            </p>
          </AccordionItem>

          <h3 className={styles.subsectionTitle}>長い children</h3>
          <AccordionItem title="長い内容のアコーディオン">
            <p>
              このアコーディオンには長い内容が含まれています。
              スクロールが必要になるほど長い内容でも正しく表示できます。
            </p>
            <p>
              アクセシビリティ: aria-expanded / aria-controls / aria-labelledby
              を使って支援技術と正しく連携します。
            </p>
            <p>
              キーボード操作: button 要素のネイティブ動作により、Space キーと
              Enter キーで開閉できます。Tab キーでフォーカスを移動できます。
            </p>
            <ul>
              <li>リストアイテム 1</li>
              <li>リストアイテム 2</li>
              <li>リストアイテム 3</li>
            </ul>
          </AccordionItem>

          <h3 className={styles.subsectionTitle}>複数並べた場合</h3>
          <AccordionItem title="項目 A">
            <p>項目 A の内容。各 AccordionItem は独立して開閉できます。</p>
          </AccordionItem>
          <AccordionItem title="項目 B" defaultOpen>
            <p>項目 B の内容（初期状態: 開）。</p>
          </AccordionItem>
          <AccordionItem title="項目 C">
            <p>項目 C の内容。</p>
          </AccordionItem>
        </Panel>
      </section>

      {/* === 13. ResultCopyArea === */}
      <section id="result-copy-area" className={styles.section}>
        <h2 className={styles.sectionTitle}>13. ResultCopyArea</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: ResultCopyArea</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            短い value（デフォルトラベル）
          </h3>
          <ResultCopyArea value="Hello, World!" />

          <h3 className={styles.subsectionTitle}>
            長い value（label カスタム）
          </h3>
          <ResultCopyArea
            value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
            label="クリップボードにコピー"
          />
        </Panel>
      </section>

      {/* === 14. LifecycleSection === */}
      <section id="lifecycle-section" className={styles.section}>
        <h2 className={styles.sectionTitle}>14. LifecycleSection</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: LifecycleSection</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            公開日のみ
          </h3>
          <LifecycleSection publishedAt="2026-05-16" />

          <h3 className={styles.subsectionTitle}>公開日 + 更新日</h3>
          <LifecycleSection publishedAt="2026-01-01" updatedAt="2026-05-16" />
        </Panel>
      </section>

      {/* === 15. IdentityHeader === */}
      <section id="identity-header" className={styles.section}>
        <h2 className={styles.sectionTitle}>15. IdentityHeader</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: IdentityHeader</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            短い name / 短い shortDescription / category あり
          </h3>
          <IdentityHeader
            name="文字カウンター"
            shortDescription="テキストの文字数を数えるツール"
            category="テキスト"
          />

          <h3 className={styles.subsectionTitle}>
            長い shortDescription / category なし
          </h3>
          <IdentityHeader
            name="敬語リファレンス"
            shortDescription="動詞の敬語（尊敬語・謙譲語・丁寧語）をブラウザ内だけで素早く調べられるツールです。60件の動詞を内蔵しており、ネットワーク接続なしで使えます。"
          />

          <h3 className={styles.subsectionTitle}>
            最小構成（name + shortDescription のみ）
          </h3>
          <IdentityHeader name="ツール名" shortDescription="短い説明文" />
        </Panel>
      </section>

      {/* === 16. TrustSection === */}
      <section id="trust-section" className={styles.section}>
        <h2 className={styles.sectionTitle}>16. TrustSection</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: TrustSection</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            privacy あり（デフォルト）+ howItWorks のみ
          </h3>
          <TrustSection howItWorks="ブラウザ内の JavaScript で動詞データを検索します。入力内容は外部サーバーに送信されません。" />

          <h3 className={styles.subsectionTitle}>
            privacy なし（privacy=false）
          </h3>
          <TrustSection
            privacy={false}
            howItWorks="ブラウザ内の JavaScript で動詞データを検索します。入力内容は外部サーバーに送信されません。"
          />

          <h3 className={styles.subsectionTitle}>source あり</h3>
          <TrustSection
            howItWorks={
              "動詞の敬語形は内蔵データ（60件）を元に返します。\n検索はブラウザ内で完結します。"
            }
            source="文化庁「敬語の指針」(2007年) に基づく"
          />
        </Panel>
      </section>

      {/* === 17. ToolInputArea === */}
      <section id="tool-input-area" className={styles.section}>
        <h2 className={styles.sectionTitle}>17. ToolInputArea</h2>
        {/* DESIGN.md §1: すべてのコンテンツはパネルに収まった形で提供される */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: ToolInputArea</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            Button のみ
          </h3>
          <ToolInputArea>
            <Button variant="primary">実行</Button>
          </ToolInputArea>

          <h3 className={styles.subsectionTitle}>Input のみ</h3>
          <ToolInputArea>
            <Input
              placeholder="テキストを入力してください"
              aria-label="テキスト入力"
            />
          </ToolInputArea>

          <h3 className={styles.subsectionTitle}>Button + Input 組み合わせ</h3>
          <ToolInputArea>
            <Input
              placeholder="検索キーワードを入力..."
              aria-label="検索入力"
              type="search"
            />
            <Button variant="primary">検索</Button>
            <Button variant="default">クリア</Button>
          </ToolInputArea>

          <h3 className={styles.subsectionTitle}>
            Input + ToggleSwitch 組み合わせ
          </h3>
          <ToolInputArea>
            <Input placeholder="フィルタキーワード" aria-label="フィルタ入力" />
            <ToggleSwitch label="大文字・小文字を区別する" />
          </ToolInputArea>

          <h3 className={styles.subsectionTitle}>className 追加</h3>
          <ToolInputArea className="storybook-example">
            <Input
              placeholder="className 追加済み"
              aria-label="className テスト"
            />
          </ToolInputArea>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--fg-soft)",
              marginTop: "0.5rem",
            }}
          >
            className=&quot;storybook-example&quot; を付与（DOM で確認可能）
          </p>
        </Panel>
      </section>
    </div>
  );
}
