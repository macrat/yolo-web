"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Breadcrumb from "@/components/Breadcrumb";
import ToggleSwitch from "@/components/ToggleSwitch";
import styles from "./page.module.css";

// カラースウォッチの定義
const COLOR_SECTIONS = [
  {
    title: "表面色 (Surface)",
    swatches: [
      { token: "--bg", role: "パネルの基本背景色" },
      { token: "--bg-soft", role: "画面全体の背景 / ghost ボタン色" },
      { token: "--bg-softer", role: "ghost ボタンのホバー色" },
      { token: "--bg-invert", role: "primary ボタン色 / フッター背景" },
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
    swatches: [{ token: "--border", role: "基本の罫線色" }],
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
];

export default function StorybookPage() {
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
              このページは開発者向けの参照ページで、来訪者の目に触れる想定はありません。
            </p>
            <p>
              <strong>
                ページ全体の上下に表示されている Header と Footer
                は、新コンポーネント（<code>@/components/Header</code>、
                <code>@/components/Footer</code>）の実物
              </strong>
              です。layout.tsx に手を入れず、Route Group <code>(legacy)/</code>{" "}
              と <code>(new)/</code> で root layout を分離することで、
              <code>/storybook</code> URL では旧コンポーネントが DOM
              に出ない構造を実現しています。これが cycle-172
              以降のページ単位の段階的移行の枠組みになります。
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

            {/* Default */}
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

            {/* Ghost */}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonGroupLabel}>ghost</div>
              <Button
                variant="ghost"
                onClick={() => console.log("ghost default clicked")}
              >
                Ghost Default
              </Button>
              <Button
                variant="ghost"
                size="small"
                onClick={() => console.log("ghost small clicked")}
              >
                Ghost Small
              </Button>
              <Button variant="ghost" disabled>
                Ghost Disabled
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
    </div>
  );
}
