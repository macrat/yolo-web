"use client";

import { useState } from "react";
import Panel from "@/components/Panel";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Field from "@/components/Field";
import Checkbox from "@/components/Checkbox";
import Radio from "@/components/Radio";
import Accordion from "@/components/Accordion";
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
import Pagination from "@/components/Pagination";
import ShareButtons from "@/components/ShareButtons";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import Section from "@/components/Section";
import styles from "./page.module.css";

// カラースウォッチの定義。
const COLOR_SECTIONS = [
  {
    title: "地 (Paper)",
    swatches: [
      { token: "--paper", role: "地" },
      {
        token: "--paper-2",
        role: "一段沈む面（区画・コード・広告区画）",
      },
    ],
  },
  {
    title: "文字 (Ink)",
    swatches: [
      { token: "--ink", role: "本文・見出し" },
      { token: "--ink-2", role: "補足・値札の文字・キャプション" },
    ],
  },
  {
    title: "罫 (Rule)",
    swatches: [
      { token: "--rule", role: "罫線（構造の主役）" },
      { token: "--rule-strong", role: "強い罫（のれん罫・区切りの主格）" },
    ],
  },
  {
    title: "アクセント (Accent)",
    swatches: [
      {
        token: "--accent",
        role: "リンク・主ボタン・現在地・記入印。--ink を指す",
      },
      {
        token: "--accent-weak",
        role: "hover/selected の座布団。--paper-2 を指す",
      },
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
  { id: "radius-elevation", label: "3. 角丸" },
  { id: "panel", label: "4. Panel" },
  { id: "button", label: "5. Button" },
  { id: "input", label: "6. Input・Field" },
  { id: "breadcrumb", label: "7. Breadcrumb" },
  { id: "checkbox-radio", label: "8. Checkbox・Radio" },
  { id: "pagination", label: "9. Pagination" },
  { id: "share-buttons", label: "10. ShareButtons" },
  { id: "textarea", label: "11. Textarea" },
  { id: "select", label: "12. Select" },
  { id: "segmented-control", label: "13. SegmentedControl" },
  { id: "error-message", label: "14. ErrorMessage" },
  { id: "file-drop-zone", label: "15. FileDropZone" },
  { id: "use-copy-to-clipboard", label: "16. useCopyToClipboard" },
  { id: "input-date", label: "17. Input (type=date)" },
  { id: "faq-section", label: "18. Accordion・FaqSection" },
  { id: "related-tools", label: "19. RelatedTools" },
  { id: "related-blog-posts", label: "20. RelatedBlogPosts" },
];

interface StorybookContentProps {
  /** RelatedBlogPosts（fs 依存のサーバー専用）の描画結果。server の page.tsx で
   * 描画して渡す。client component から直接 import できないため prop 化している。 */
  relatedBlogPostsWithPosts: React.ReactNode;
  relatedBlogPostsEmpty: React.ReactNode;
}

export default function StorybookContent({
  relatedBlogPostsWithPosts,
  relatedBlogPostsEmpty,
}: StorybookContentProps) {
  // Checkbox・Radio controlled state
  const [checkboxOn, setCheckboxOn] = useState(false);
  const [radioValue, setRadioValue] = useState("new");
  // Controlled input state
  const [controlledText, setControlledText] = useState("controlled value");
  // SegmentedControl controlled state
  const [segmentValue, setSegmentValue] = useState("option-a");
  // Pagination button mode state
  const [paginationPage, setPaginationPage] = useState(1);
  // useCopyToClipboard demo
  const { copy, copiedKey } = useCopyToClipboard();

  return (
    <>
      {/* === 1. 概要 === */}
      <Section id="overview">
        <h1 className={styles.pageTitle}>Storybook（開発者向け）</h1>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: 概要</span>
          <div className={styles.notice}>
            <p>
              このページはデザインシステムのコンポーネントカタログ。
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
      </Section>

      {/* === 2. カラーパレット === */}
      <Section id="colors">
        <h2 className={styles.sectionTitle}>2. カラーパレット</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: カラーパレット</span>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--ink-2)",
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
      </Section>

      {/* === 3. 角丸 === */}
      {/* 影は持たないので影のトークンは無く、角丸だけを展示する（DESIGN.md §5）。 */}
      <Section id="radius-elevation">
        <h2 className={styles.sectionTitle}>3. 角丸</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: 角丸</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            角丸（Border Radius）
          </h3>
          <div className={styles.radiusRow}>
            <div>
              <div
                className={styles.radiusSample}
                style={{ borderRadius: "var(--radius)" }}
              >
                サンプルテキスト
              </div>
              <div className={styles.radiusSampleLabel}>--radius (0px)</div>
              <div style={{ fontSize: "0.7rem", color: "var(--ink-2)" }}>
                0px 基調。パネル・カード・タグ・モーダル等すべて
              </div>
            </div>
            <div>
              <div
                className={styles.radiusSample}
                style={{ borderRadius: "var(--radius-sm)" }}
              >
                サンプルテキスト
              </div>
              <div className={styles.radiusSampleLabel}>--radius-sm</div>
              <div style={{ fontSize: "0.7rem", color: "var(--ink-2)" }}>
                値札ラベルと入力欄が使う（0px）
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* === 4. Panel === */}
      <Section id="panel">
        <h2 className={styles.sectionTitle}>4. Panel</h2>
        {/*
         * Panel は入れ子にしないが、ここは Panel そのものの見本なので、
         * 外側 Panel の中にサンプル Panel を入れ子にしている。
         */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Panel</span>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Panel>
              <p>as=&quot;section&quot;（デフォルト）: 汎用コンテナパネル</p>
              <p style={{ color: "var(--ink-2)", fontSize: "0.9rem" }}>
                パネルは入れ子にせず、影をつけない。
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
      </Section>

      {/* === 5. Button === */}
      <Section id="button">
        <h2 className={styles.sectionTitle}>5. Button</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Button</span>

          <div className={styles.buttonMatrix}>
            {/* 1ページに1つまでの反転のボタン */}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonGroupLabel}>primary</div>
              <Button
                variant="primary"
                onClick={() => console.log("primary clicked")}
              >
                計算する
              </Button>
              <Button
                variant="primary"
                disabled
                disabledReason="生年月日を入れると押せます"
              >
                計算する
              </Button>
            </div>

            {/* プライマリでない、実行するボタン */}
            <div className={styles.buttonGroup}>
              <div className={styles.buttonGroupLabel}>default</div>
              <Button
                variant="default"
                onClick={() => console.log("default clicked")}
              >
                結果をコピー
              </Button>
              <Button
                variant="default"
                disabled
                disabledReason="結果が出ると押せます"
              >
                結果をコピー
              </Button>
            </div>
          </div>
        </Panel>
      </Section>

      {/* === 6. Input・Field === */}
      <Section id="input">
        <h2 className={styles.sectionTitle}>6. Input・Field</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Input・Field</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            ラベル・必須・エラー（Field）
          </h3>
          <div className={styles.fieldStack}>
            <Field label="名前">
              {(control) => <Input {...control} autoComplete="name" />}
            </Field>
            <Field label="メールアドレス" required>
              {(control) => (
                <Input {...control} type="email" autoComplete="email" />
              )}
            </Field>
            <Field label="年齢" error="数字で入力してください。例: 30">
              {(control) => (
                <Input {...control} inputMode="numeric" defaultValue="三十" />
              )}
            </Field>
          </div>

          <h3 className={styles.subsectionTitle}>各 type</h3>
          <div className={styles.fieldStack}>
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
              <Field key={type} label={`type="${type}"`}>
                {(control) => (
                  <Input
                    {...control}
                    type={type}
                    placeholder={`type="${type}" の入力欄`}
                  />
                )}
              </Field>
            ))}
          </div>

          <h3 className={styles.subsectionTitle}>無効・読み取り専用</h3>
          <div className={styles.fieldStack}>
            <Field label="無効">
              {(control) => (
                <Input {...control} defaultValue="無効状態の入力値" disabled />
              )}
            </Field>
            <Field label="読み取り専用">
              {(control) => (
                <Input {...control} value="読み取り専用の入力値" readOnly />
              )}
            </Field>
          </div>

          <h3 className={styles.subsectionTitle}>Controlled / Uncontrolled</h3>
          <div className={styles.fieldStack}>
            <div>
              <Field label="controlled（value + onChange）">
                {(control) => (
                  <Input
                    {...control}
                    value={controlledText}
                    onChange={(e) => setControlledText(e.target.value)}
                  />
                )}
              </Field>
              <p className={styles.demoStatus}>現在の値: {controlledText}</p>
            </div>
            <Field label="uncontrolled（defaultValue）">
              {(control) => <Input {...control} defaultValue="初期値" />}
            </Field>
          </div>
        </Panel>
      </Section>

      {/* === 7. Breadcrumb === */}
      <Section id="breadcrumb">
        <h2 className={styles.sectionTitle}>7. Breadcrumb</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Breadcrumb</span>

          <div className={styles.breadcrumbSamples}>
            <div>
              <div
                className={styles.demoCaption}
                style={{ marginBottom: "0.5rem" }}
              >
                1 階層（現在位置のみ）
              </div>
              <Breadcrumb items={BREADCRUMB_1} />
            </div>
            <div>
              <div
                className={styles.demoCaption}
                style={{ marginBottom: "0.5rem" }}
              >
                2 階層
              </div>
              <Breadcrumb items={BREADCRUMB_2} />
            </div>
            <div>
              <div
                className={styles.demoCaption}
                style={{ marginBottom: "0.5rem" }}
              >
                3 階層
              </div>
              <Breadcrumb items={BREADCRUMB_3} />
            </div>
          </div>
        </Panel>
      </Section>

      {/* === 8. Checkbox・Radio === */}
      <Section id="checkbox-radio">
        <h2 className={styles.sectionTitle}>8. Checkbox・Radio</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Checkbox・Radio</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            チェックボックス
          </h3>
          <fieldset className={styles.choiceGroup}>
            <legend className={styles.choiceLegend}>通知の設定</legend>
            <Checkbox
              label="通知を受け取る"
              checked={checkboxOn}
              onChange={(e) => setCheckboxOn(e.target.checked)}
            />
            <Checkbox label="メール配信（初期: 選択済み）" defaultChecked />
            <Checkbox label="ラベルが長く、狭い画面で2行に折り返しても、四角は1行目の字の中央に並ぶ" />
            <Checkbox label="無効（未選択）" disabled />
            <Checkbox label="無効（選択済み）" disabled defaultChecked />
          </fieldset>
          <p className={styles.demoStatus}>
            「通知を受け取る」: {checkboxOn ? "選択済み" : "未選択"}
          </p>

          <h3 className={styles.subsectionTitle}>ラジオボタン</h3>
          <fieldset className={styles.choiceGroup}>
            <legend className={styles.choiceLegend}>並び順</legend>
            {(
              [
                ["new", "新しい順"],
                ["old", "古い順"],
                ["name", "名前の順"],
              ] as const
            ).map(([value, label]) => (
              <Radio
                key={value}
                name="storybook-order"
                value={value}
                label={label}
                checked={radioValue === value}
                onChange={() => setRadioValue(value)}
              />
            ))}
            <Radio name="storybook-order-disabled" label="無効" disabled />
          </fieldset>

          <h3 className={styles.subsectionTitle}>横に並べる</h3>
          <fieldset className={styles.choiceGroupInline}>
            <legend className={styles.choiceLegend}>変換対象</legend>
            <Checkbox label="英数字" defaultChecked />
            <Checkbox label="カタカナ" defaultChecked />
            <Checkbox label="記号" />
          </fieldset>
        </Panel>
      </Section>
      {/* === 9. Pagination === */}
      <Section id="pagination">
        <h2 className={styles.sectionTitle}>9. Pagination</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Pagination</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            link モード（デフォルト）
          </h3>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div className={styles.demoCaption}>
              5 ページ・現在ページ = 1（前へを置かない）
            </div>
            <Pagination currentPage={1} totalPages={5} basePath="/blog" />

            <div className={styles.demoCaption}>
              5 ページ・現在ページ = 3（中間）
            </div>
            <Pagination currentPage={3} totalPages={5} basePath="/blog" />

            <div className={styles.demoCaption}>
              5 ページ・現在ページ = 5（次へを置かない）
            </div>
            <Pagination currentPage={5} totalPages={5} basePath="/blog" />

            <div className={styles.demoCaption}>
              10 ページ・現在ページ = 1（省略あり）
            </div>
            <Pagination currentPage={1} totalPages={10} basePath="/blog" />

            <div className={styles.demoCaption}>
              10 ページ・現在ページ = 5（両側省略あり）
            </div>
            <Pagination currentPage={5} totalPages={10} basePath="/blog" />

            <div className={styles.demoCaption}>1 ページのみ（非表示）</div>
            <div style={{ color: "var(--ink-2)", fontSize: "0.85rem" }}>
              （totalPages=1 のとき null が返るため何も表示されない）
            </div>
            <Pagination currentPage={1} totalPages={1} basePath="/blog" />
          </div>

          <h3 className={styles.subsectionTitle}>button モード</h3>
          <Pagination
            mode="button"
            currentPage={paginationPage}
            totalPages={10}
            onPageChange={setPaginationPage}
          />
        </Panel>
      </Section>

      {/* === 10. ShareButtons === */}
      <Section id="share-buttons">
        <h2 className={styles.sectionTitle}>10. ShareButtons</h2>
        {/* 見本は Panel に収めて並べる */}
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
      </Section>

      {/* === 11. Textarea === */}
      <Section id="textarea">
        <h2 className={styles.sectionTitle}>11. Textarea</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Textarea</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            variant
          </h3>
          <div className={styles.fieldStack}>
            <Field label='variant="default"'>
              {(control) => (
                <Textarea
                  {...control}
                  variant="default"
                  rows={3}
                  placeholder="本文の書体で書く欄"
                />
              )}
            </Field>
            <Field label='variant="mono"'>
              {(control) => (
                <Textarea
                  {...control}
                  variant="mono"
                  rows={3}
                  placeholder="等幅の書体で書く欄（コード）"
                  spellCheck={false}
                />
              )}
            </Field>
          </div>

          <h3 className={styles.subsectionTitle}>エラー・読み取り専用・無効</h3>
          <div className={styles.fieldStack}>
            <Field
              label="本文"
              required
              error="本文が空です。1文字以上入力してください。"
            >
              {(control) => <Textarea {...control} rows={3} />}
            </Field>
            <Field label="読み取り専用（出力）">
              {(control) => (
                <Textarea
                  {...control}
                  value="読み取り専用の出力テキスト。多くのツールが入力欄と並べて出力を表示するパターンで使用する。"
                  readOnly
                  rows={3}
                />
              )}
            </Field>
            <Field label="無効">
              {(control) => (
                <Textarea
                  {...control}
                  value="無効状態のテキストエリア"
                  disabled
                  rows={3}
                />
              )}
            </Field>
          </div>
        </Panel>
      </Section>

      {/* === 12. Select === */}
      <Section id="select">
        <h2 className={styles.sectionTitle}>12. Select</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: Select</span>

          <div className={styles.fieldStack}>
            <Field label="言語">
              {(control) => (
                <Select {...control} defaultValue="ja">
                  <option value="ja">日本語</option>
                  <option value="en">英語</option>
                  <option value="zh">中国語</option>
                </Select>
              )}
            </Field>
            <Field label="都道府県" required error="都道府県を選んでください。">
              {(control) => (
                <Select {...control} defaultValue="">
                  <option value="">選んでください</option>
                  <option value="tokyo">東京都</option>
                  <option value="osaka">大阪府</option>
                </Select>
              )}
            </Field>
            <Field label="無効">
              {(control) => (
                <Select {...control} disabled>
                  <option value="a">選択肢 A</option>
                  <option value="b">選択肢 B</option>
                </Select>
              )}
            </Field>
          </div>
        </Panel>
      </Section>

      {/* === 13. SegmentedControl === */}
      <Section id="segmented-control">
        <h2 className={styles.sectionTitle}>13. SegmentedControl</h2>
        {/* 見本は Panel に収めて並べる */}
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
              color: "var(--ink-2)",
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
      </Section>

      {/* === 14. ErrorMessage === */}
      <Section id="error-message">
        <h2 className={styles.sectionTitle}>14. ErrorMessage</h2>
        {/* 見本は Panel に収めて並べる */}
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
      </Section>

      {/* === 15. FileDropZone === */}
      <Section id="file-drop-zone">
        <h2 className={styles.sectionTitle}>15. FileDropZone</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: FileDropZone</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            基本（accept + maxSizeBytes + description）
          </h3>
          <FileDropZone
            label="画像ファイル"
            onFileSelect={(file) => console.log("selected:", file.name)}
            accept="image/*"
            maxSizeBytes={10 * 1024 * 1024}
            description="PNG, JPEG, GIF, WebP 対応（最大 10MB）"
          />

          <h3 className={styles.subsectionTitle}>制限なし</h3>
          <FileDropZone
            label="ファイル"
            onFileSelect={(file) => console.log("selected:", file.name)}
          />
        </Panel>
      </Section>

      {/* === 16. useCopyToClipboard === */}
      <Section id="use-copy-to-clipboard">
        <h2 className={styles.sectionTitle}>16. useCopyToClipboard</h2>
        {/* 見本は Panel に収めて並べる */}
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
              style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}
            >
              {copiedKey ? COPIED_LABEL : ""}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--ink-2)",
              marginTop: "0.5rem",
            }}
          >
            コピー内容: &quot;クリップボードにコピーされるテキスト&quot;（2
            秒後にリセット）
          </div>
        </Panel>
      </Section>

      {/* === 17. Input (type=date) === */}
      <Section id="input-date">
        <h2 className={styles.sectionTitle}>17. Input (type=date)</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>
            Preview: Input (type=date)
          </span>

          <div className={styles.fieldStack}>
            <Field label="生年月日" required>
              {(control) => (
                <Input {...control} type="date" defaultValue="2026-06-04" />
              )}
            </Field>
            <Field
              label="基準日"
              error="基準日が生年月日より前です。生年月日より後の日付を選んでください。"
            >
              {(control) => (
                <Input {...control} type="date" defaultValue="2000-01-01" />
              )}
            </Field>
            <Field label="無効">
              {(control) => (
                <Input
                  {...control}
                  type="date"
                  defaultValue="2026-06-04"
                  disabled
                />
              )}
            </Field>
          </div>
        </Panel>
      </Section>

      {/* === 18. Accordion・FaqSection === */}
      <Section id="faq-section">
        <h2 className={styles.sectionTitle}>18. Accordion・FaqSection</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>
            Preview: Accordion・FaqSection
          </span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            Accordion
          </h3>
          <Accordion summary="目次">
            <p>開いたときに出る中身。</p>
          </Accordion>
          <Accordion summary="ラベルが長く、狭い画面で2行に折り返しても、三角は1行目の字の中央に並ぶ">
            <p>開いたときに出る中身。</p>
          </Accordion>

          <h3 className={styles.subsectionTitle}>FaqSection（2 件）</h3>
          <FaqSection faq={SAMPLE_FAQ} />

          <h3 className={styles.subsectionTitle}>
            faq が空配列のとき（null を返す）
          </h3>
          <p className={styles.demoStatus}>
            （空配列を渡すと何も表示されない）
          </p>
          <FaqSection faq={[]} />
        </Panel>
      </Section>

      {/* === 19. RelatedTools === */}
      <Section id="related-tools">
        <h2 className={styles.sectionTitle}>19. RelatedTools</h2>
        {/* 見本は Panel に収めて並べる */}
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
          <div style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>
            （一致なしのとき何も表示されない）
          </div>
          <RelatedTools
            currentSlug="char-count"
            relatedSlugs={["nonexistent-tool"]}
          />
        </Panel>
      </Section>

      {/* === 20. RelatedBlogPosts === */}
      <Section id="related-blog-posts">
        <h2 className={styles.sectionTitle}>20. RelatedBlogPosts</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: RelatedBlogPosts</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            toolSlug=&quot;business-email&quot;（関連記事あり）
          </h3>
          {relatedBlogPostsWithPosts}

          <h3 className={styles.subsectionTitle}>
            toolSlug=&quot;char-count&quot;（関連記事なし → null を返す）
          </h3>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>
            （関連記事なしのとき何も表示されない）
          </div>
          {relatedBlogPostsEmpty}
        </Panel>
      </Section>
    </>
  );
}
