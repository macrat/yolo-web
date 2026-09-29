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
import RadioGroup from "@/components/RadioGroup";
import ErrorMessage from "@/components/ErrorMessage";
import FileDropZone from "@/components/FileDropZone";
import CopyButton from "@/components/CopyButton";
import Breadcrumb from "@/components/Breadcrumb";
import Pagination from "@/components/Pagination";
import ShareButtons from "@/components/ShareButtons";
import FaqSection from "@/components/FaqSection";
import RelatedTools from "@/components/RelatedTools";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import LinkIndex, {
  type LinkIndexGroup,
  type LinkIndexItem,
} from "@/components/LinkIndex";
import Section from "@/components/Section";
import ResultBox, { type ResultHeading } from "@/components/ResultBox";
import ResultCard from "@/play/quiz/_components/ResultCard";
import type { QuizResult } from "@/play/quiz/types";
import PhrasedText from "@/components/PhrasedText";
import QuantityBars, { type QuantityBar } from "@/components/QuantityBars";
import type { HeadingFontAttr } from "@/lib/zen-antique-charset";
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
      { token: "--ink-2", role: "補足・補助情報の文字・キャプション" },
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
const BREADCRUMB_2 = [
  { label: "ホーム", href: "/" },
  { label: "ブログ", href: "/blog" },
];

const BREADCRUMB_3 = [
  { label: "ホーム", href: "/" },
  { label: "ツール", href: "/tools" },
  { label: "文字数カウント", href: "/tools/char-count" },
];

const BREADCRUMB_1 = [{ label: "ホーム", href: "/" }];

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
  { id: "radio-group", label: "13. RadioGroup" },
  { id: "error-message", label: "14. ErrorMessage" },
  { id: "file-drop-zone", label: "15. FileDropZone" },
  { id: "copy-button", label: "16. CopyButton" },
  { id: "input-date", label: "17. Input (type=date)" },
  { id: "faq-section", label: "18. Accordion・FaqSection" },
  { id: "related-tools", label: "19. RelatedTools" },
  { id: "related-blog-posts", label: "20. RelatedBlogPosts" },
  { id: "item-list", label: "21. ItemList" },
  { id: "link-index", label: "22. LinkIndex" },
  { id: "browsable-list", label: "23. BrowsableList" },
  { id: "result-box", label: "24. ResultBox" },
  { id: "quantity-bars", label: "25. QuantityBars" },
  { id: "phrased-text", label: "26. PhrasedText" },
  { id: "solved-screen", label: "27. 解き終えた画面（ResultCard）" },
];

// LinkIndex の見本。順を持たない分類（多い順・数を添える）と、見えない値で区切る索引。2語の名前は、名前の中の語の
// 切れ目で分けた並びで渡す（splitIntoPhrases の countedName と同じ分け方）。
const LINK_INDEX_TAGS: LinkIndexItem[] = [
  { name: ["Web", "開発"], href: "/blog/tag/Web開発", count: 35 },
  { name: ["設計", "パターン"], href: "/blog/tag/設計パターン", count: 20 },
  { name: "TypeScript", href: "/blog/tag/TypeScript", count: 12 },
  { name: "SQL", href: "/blog/tag/SQL", count: 4 },
];

const LINK_INDEX_STROKES: LinkIndexGroup[] = [
  {
    heading: "5画",
    items: ["氷", "永", "汁", "氾", "汀"].map((char) => ({
      name: char,
      href: `/dictionary/kanji/${char}`,
    })),
  },
  {
    heading: "6画",
    items: ["汚", "汗", "江", "池", "汐", "汎", "汝"].map((char) => ({
      name: char,
      href: `/dictionary/kanji/${char}`,
    })),
  },
];

// ItemList の見本。説明・種別・日付を持つ行、読みを持つ行、全件で種別が同じ行、色見本を持つ行、診断のタイプの行。
const ITEM_LIST_DESCRIBED: ItemListItem[] = [
  {
    name: "文字数カウント",
    href: "/tools/char-count",
    description: "文章の文字数と行数を、その場で数えます。",
    kind: "文章",
    facts: [{ text: "2026-02-13", dateTime: "2026-02-13" }],
  },
  {
    name: "Base64エンコード・デコード",
    href: "/tools/base64",
    description: "テキストをBase64形式に変換し、元に戻します。",
    kind: "データ",
    facts: [{ text: "2026-02-14", dateTime: "2026-02-14" }],
  },
  {
    name: "ナカマワケ",
    href: "/play/nakamawake",
    description: "16個の言葉を、共通点で4つのグループに分けるパズル。",
    kind: "パズル",
    facts: [{ text: "毎日更新" }],
  },
];

const ITEM_LIST_READINGS: ItemListItem[] = [
  {
    name: "水",
    href: "/dictionary/kanji/水",
    reading: "スイ・みず",
    kind: "小学1年",
    facts: [{ text: "4画" }],
  },
  {
    name: "海",
    href: "/dictionary/kanji/海",
    reading: "カイ・うみ",
    kind: "小学2年",
    facts: [{ text: "9画" }],
  },
  {
    name: "湖",
    href: "/dictionary/kanji/湖",
    reading: "コ・みずうみ",
    kind: "小学3年",
    facts: [{ text: "12画" }],
  },
];

const ITEM_LIST_SAME_KIND: ItemListItem[] = [
  {
    name: "一",
    href: "/dictionary/kanji/一",
    reading: "イチ・イツ・ひと・ひとつ",
    kind: "小学1年",
    facts: [{ text: "1画" }],
  },
  {
    name: "水",
    href: "/dictionary/kanji/水",
    reading: "スイ・みず",
    kind: "小学1年",
    facts: [{ text: "4画" }],
  },
  {
    name: "森",
    href: "/dictionary/kanji/森",
    reading: "シン・もり",
    kind: "小学1年",
    facts: [{ text: "12画" }],
  },
];

const ITEM_LIST_SWATCHES: ItemListItem[] = [
  {
    name: "鴇",
    href: "/dictionary/colors/toki",
    reading: "toki",
    facts: [{ text: "#eea9a9" }],
    swatch: "#eea9a9",
  },
  {
    name: "藍",
    href: "/dictionary/colors/ai",
    reading: "ai",
    facts: [{ text: "#0d5661" }],
    swatch: "#0d5661",
  },
  {
    name: "白練",
    href: "/dictionary/colors/shironeri",
    reading: "shironeri",
    facts: [{ text: "#fcfaf2" }],
    swatch: "#fcfaf2",
  },
];

// 解き終えた画面のすべてのタイプ。来訪者のタイプ（2行目）は、補助情報の位置に「あなたのタイプ」と添える。
const ITEM_LIST_TYPES: ItemListItem[] = [
  {
    name: "藍色",
    href: "/play/traditional-color/result/ai",
    reading: "あいいろ",
    swatch: "#0d5661",
  },
  {
    name: "朱色",
    href: "/play/traditional-color/result/shu",
    reading: "しゅいろ",
    facts: [{ text: "あなたのタイプ" }],
    swatch: "#ab3b3a",
  },
  {
    name: "若草色",
    href: "/play/traditional-color/result/wakakusa",
    reading: "わかくさいろ",
    swatch: "#C3D825",
  },
];

/** 見出しの区切りを付けたタイプ名の見本。区切りはサーバーの page.tsx が作る。 */
export interface PhrasedSample {
  id: string;
  title: string;
  phrases: readonly string[];
  headingFont: HeadingFontAttr;
  catchphrase?: string;
  description: string;
}

/** 診断の解き終えた画面の見本。見出しの区切りは、サーバーの page.tsx が全タイプぶん作る。 */
export interface SolvedScreenSample {
  quizTitle: string;
  quizSlug: string;
  results: QuizResult[];
  /** 補助情報と共有の文で言う診断の名前（短い名前があればそれ） */
  quizName: string;
  resultHeadings: Readonly<Record<string, ResultHeading>>;
  readingHeadings: Readonly<Record<string, readonly string[]>>;
}

/** 画像の結果の見本。size は画像の一辺の px。 */
export interface ImageSample {
  src: string;
  size: number;
}

// 値が並ぶ結果の見本（年齢計算の形）。
const AGE_ROWS = [
  { label: "満年齢", value: "34歳" },
  { label: "数え年", value: "35歳" },
  { label: "生まれてからの日数", value: "12,581日" },
  { label: "次の誕生日まで", value: "143日" },
];

// コードの結果の見本。1,000行（開き括弧と閉じ括弧の行と、998件の行）あり、コピーのボタンがボックスの頭の行に
// あることを長い結果で確かめる。
const CODE_ITEM_COUNT = 998;
const LONG_CODE = [
  "[",
  ...Array.from({ length: CODE_ITEM_COUNT }, (_, index) => {
    const id = index + 1;
    const separator = id < CODE_ITEM_COUNT ? "," : "";
    return `  { "id": ${id}, "name": "item-${id}" }${separator}`;
  }),
  "]",
].join("\n");

// 1続きの文字列の結果の見本（Base64 の形）。一語が1行に収まらないので、語の中で折れる。
const BASE64_SAMPLE =
  "44GT44KM44Gv44CB44OW44Op44Km44K244Gu5Lit44Gn5YuV44GP5bCP44GV44Gq6YGT5YW344Gn44GZ44CC5YWl5Yqb44GX44Gf5paH44KS44CB44Gd44Gu5aC044GnIEJhc2U2NCDjgavlpInjgYjjgb7jgZnjgII=";

// 統計の分布の見本（当てた回数を数える形）。今回の行と、値が0の行を含む。
const GUESS_DISTRIBUTION: QuantityBar[] = [
  { name: "1回目", value: 1, valueText: "1" },
  { name: "2回目", value: 4, valueText: "4" },
  { name: "3回目", value: 12, valueText: "12", current: true },
  { name: "4回目", value: 9, valueText: "9" },
  { name: "5回目", value: 0, valueText: "0" },
  { name: "6回目", value: 3, valueText: "3" },
];

// 名前の列がいちばん広い分布の見本（合計の点数の10の区分）。
const SCORE_DISTRIBUTION: QuantityBar[] = [
  { name: "0〜9点", value: 0, valueText: "0" },
  { name: "10〜19点", value: 1, valueText: "1" },
  { name: "20〜29点", value: 2, valueText: "2" },
  { name: "30〜39点", value: 5, valueText: "5" },
  { name: "40〜49点", value: 8, valueText: "8" },
  { name: "50〜59点", value: 14, valueText: "14" },
  { name: "60〜69点", value: 11, valueText: "11", current: true },
  { name: "70〜79点", value: 6, valueText: "6" },
  { name: "80〜89点", value: 3, valueText: "3" },
  { name: "90〜100点", value: 1, valueText: "1" },
];

// スコアの帯の見本（診断の軸）。値は満点に対する割合で、上限は 100%。
const AXIS_SCORES: QuantityBar[] = [
  { name: "理論", value: 75, valueText: "75%" },
  { name: "実験", value: 58, valueText: "58%" },
  { name: "数値化", value: 100, valueText: "100%" },
  { name: "観察", value: 24, valueText: "24%" },
  { name: "創造", value: 0, valueText: "0%" },
];

interface StorybookContentProps {
  /** RelatedBlogPosts（fs 依存のサーバー専用）の描画結果。server の page.tsx で
   * 描画して渡す。client component から直接 import できないため prop 化している。 */
  relatedBlogPostsWithPosts: React.ReactNode;
  relatedBlogPostsEmpty: React.ReactNode;
  /** BrowsableList の見本のページへの行。見本のデータは辞典のデータを読むので、server の page.tsx で組んで渡す。 */
  listSamples: ItemListItem[];
  /** 名前を持つ結果の見本のタイプ */
  nameResult: PhrasedSample;
  /** 名前を持つ結果の見本の診断名 */
  quizTitle: string;
  /** iOS の VoiceOver で見出しの読み方を聞き比べるタイプ名 */
  voiceOverSamples: PhrasedSample[];
  qrCode: ImageSample;
  /** 解き終えた画面の見本の診断。タイプを1つずつ選んで開く。 */
  solvedScreen: SolvedScreenSample;
}

export default function StorybookContent({
  relatedBlogPostsWithPosts,
  relatedBlogPostsEmpty,
  listSamples,
  nameResult,
  quizTitle,
  voiceOverSamples,
  qrCode,
  solvedScreen,
}: StorybookContentProps) {
  // Checkbox・Radio controlled state
  const [checkboxOn, setCheckboxOn] = useState(false);
  // 操作に応えて現れる結果のボックスの見本
  const [countRuns, setCountRuns] = useState(0);
  const [radioValue, setRadioValue] = useState("new");
  // Controlled input state
  const [controlledText, setControlledText] = useState("controlled value");
  // RadioGroup controlled state
  const [groupValue, setGroupValue] = useState("encode");
  const [longGroupValue, setLongGroupValue] = useState("hiragana-to-katakana");
  // Pagination button mode state
  const [paginationPage, setPaginationPage] = useState(1);
  // 解き終えた画面の見本で開いているタイプ
  const [solvedTypeId, setSolvedTypeId] = useState(solvedScreen.results[0].id);
  const solvedResult =
    solvedScreen.results.find((result) => result.id === solvedTypeId) ??
    solvedScreen.results[0];

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
                    <a
                      href={`#${item.id}`}
                      className={styles.tocLink}
                      data-text-box="inline"
                    >
                      {item.label}
                    </a>
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
                記事のタグと入力欄が使う（0px）
              </div>
            </div>
          </div>
        </Panel>
      </Section>

      {/* === 4. Panel === */}
      <Section id="panel">
        <h2 className={styles.sectionTitle}>4. Panel</h2>
        {/* ボックスは入れ子にしないので、Panel の見本だけは Panel に収めずに並べる。 */}
        <div>
          <span className={styles.previewLabel}>Preview: Panel</span>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Panel>
              <p>as=&quot;section&quot;（デフォルト）: 汎用コンテナパネル</p>
              <p style={{ color: "var(--ink-2)", fontSize: "0.9rem" }}>
                ボックスは入れ子にしない。
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
        </div>
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
                変換する
              </Button>
              <Button
                variant="default"
                disabled
                disabledReason="文字を入れると押せます"
              >
                変換する
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
            <Field
              label="無効"
              disabled
              disabledReason="「自分で決める」を選ぶと書き込めます"
            >
              {(control) => (
                <Input {...control} defaultValue="無効状態の入力値" />
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
            <Checkbox
              label="無効（未選択）"
              disabled
              disabledReason="通知を受け取ると選べます"
            />
            <Checkbox
              label="無効（選択済み）"
              disabled
              disabledReason="この項目は外せません"
              defaultChecked
            />
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
            <Radio
              name="storybook-order-disabled"
              label="無効"
              disabled
              disabledReason="記事が2件以上あると選べます"
            />
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
            <Field
              label="無効"
              disabled
              disabledReason="変換の結果が出ると書き込めます"
            >
              {(control) => (
                <Textarea
                  {...control}
                  value="無効状態のテキストエリア"
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
            <Field label="無効" disabled disabledReason="国を選ぶと選べます">
              {(control) => (
                <Select {...control}>
                  <option value="a">選択肢 A</option>
                  <option value="b">選択肢 B</option>
                </Select>
              )}
            </Field>
          </div>
        </Panel>
      </Section>

      {/* === 13. RadioGroup === */}
      <Section id="radio-group">
        <h2 className={styles.sectionTitle}>13. RadioGroup</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: RadioGroup</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            見出し（legend）と選択肢
          </h3>
          <RadioGroup
            legend="変換の向き"
            options={[
              { label: "エンコード", value: "encode" },
              { label: "デコード", value: "decode" },
            ]}
            value={groupValue}
            onChange={setGroupValue}
          />
          <p className={styles.demoStatus}>現在の値: {groupValue}</p>

          <h3 className={styles.subsectionTitle}>幅が足りなければ折り返す</h3>
          <RadioGroup
            legend="変換モード"
            options={[
              { label: "ひらがな → カタカナ", value: "hiragana-to-katakana" },
              { label: "カタカナ → ひらがな", value: "katakana-to-hiragana" },
              { label: "半角カナ → 全角カナ", value: "to-fullwidth-katakana" },
              { label: "全角カナ → 半角カナ", value: "to-halfwidth-katakana" },
            ]}
            value={longGroupValue}
            onChange={setLongGroupValue}
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

      {/* === 16. CopyButton === */}
      <Section id="copy-button">
        <h2 className={styles.sectionTitle}>16. CopyButton</h2>
        {/* 見本は Panel に収めて並べる */}
        <Panel as="div">
          <span className={styles.previewLabel}>Preview: CopyButton</span>

          <h3 className={styles.subsectionTitle} style={{ marginTop: 0 }}>
            既定（字の始まりを並びの左端にそろえる）
          </h3>
          <p>
            押すと面が「コピー済み」になり、写せなかったときは次に押すまで「コピー失敗」を出す。面の字が替わっても、ボタンと後ろの字は動かない。
          </p>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <CopyButton text="クリップボードに写す文" target="見本の文" />
            <span>後ろに続く字</span>
          </div>

          <h3 className={styles.subsectionTitle}>
            見出しの行の右に置く（align=&quot;end&quot;）
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>変換結果</span>
            <CopyButton text="変換した文" target="変換結果" align="end" />
          </div>

          <h3 className={styles.subsectionTitle}>
            何を写すかを面に出す（showTarget・primary・align=&quot;stretch&quot;）
          </h3>
          <CopyButton
            text={"件名: 見本\n\n本文の見本"}
            target="メール全文"
            showTarget
            variant="primary"
            align="stretch"
          />

          <h3 className={styles.subsectionTitle}>無効（写すものが無いとき）</h3>
          <CopyButton
            text=""
            target="出力"
            disabled
            disabledReason="変換すると写せます"
          />
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
            <Field
              label="無効"
              disabled
              disabledReason="「日付で指定」を選ぶと選べます"
            >
              {(control) => (
                <Input {...control} type="date" defaultValue="2026-06-04" />
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
            slug=&quot;business-email&quot;（関連記事あり）
          </h3>
          {relatedBlogPostsWithPosts}

          <h3 className={styles.subsectionTitle}>
            slug=&quot;char-count&quot;（関連記事なし → null を返す）
          </h3>
          <div style={{ fontSize: "0.85rem", color: "var(--ink-2)" }}>
            （関連記事なしのとき何も表示されない）
          </div>
          {relatedBlogPostsEmpty}
        </Panel>
      </Section>

      {/* === 21. ItemList === */}
      <Section id="item-list">
        <h2 className={styles.sectionTitle}>21. ItemList</h2>

        <h3 id="item-list-described" className={styles.subsectionTitle}>
          説明・種別・日付を持つ行（2行目が現在地）
        </h3>
        <ItemList
          labelledBy="item-list-described"
          items={ITEM_LIST_DESCRIBED}
          currentHref="/tools/base64"
        />

        <h3 id="item-list-readings" className={styles.subsectionTitle}>
          読みを持ち、説明を持たない行
        </h3>
        <ItemList labelledBy="item-list-readings" items={ITEM_LIST_READINGS} />

        <h3 id="item-list-same-kind" className={styles.subsectionTitle}>
          全件で種別が同じ行（種別「小学1年」を出さない）
        </h3>
        <ItemList
          labelledBy="item-list-same-kind"
          items={ITEM_LIST_SAME_KIND}
        />

        <h3 id="item-list-swatches" className={styles.subsectionTitle}>
          色見本を持つ行
        </h3>
        <ItemList labelledBy="item-list-swatches" items={ITEM_LIST_SWATCHES} />

        <h3 id="item-list-visitor-item" className={styles.subsectionTitle}>
          来訪者自身の結果にあたる行（2行目。太字で下線を残し、「あなたのタイプ」と添える）
        </h3>
        <ItemList
          labelledBy="item-list-visitor-item"
          items={ITEM_LIST_TYPES}
          currentItemHref="/play/traditional-color/result/shu"
        />

        <h3 id="item-list-types-current" className={styles.subsectionTitle}>
          同じ一覧で2行目が現在地（太字で下線を持たない）
        </h3>
        <ItemList
          labelledBy="item-list-types-current"
          items={ITEM_LIST_TYPES.map(({ name, href, reading, swatch }) => ({
            name,
            href,
            reading,
            swatch,
          }))}
          currentHref="/play/traditional-color/result/shu"
        />

        <h3 id="item-list-series" className={styles.subsectionTitle}>
          順に読む一覧（行の頭に番号・3行目が現在地）
        </h3>
        <ItemList
          labelledBy="item-list-series"
          items={ITEM_LIST_DESCRIBED.map(({ name, href }) => ({ name, href }))}
          currentHref="/play/nakamawake"
          ordered
        />

        <h3 id="item-list-unboxed" className={styles.subsectionTitle}>
          ボックスを持たない形（Panel の中）
        </h3>
        <Panel as="div">
          <ItemList
            labelledBy="item-list-unboxed"
            items={ITEM_LIST_DESCRIBED}
            boxed={false}
          />
        </Panel>
      </Section>

      <Section id="link-index">
        <h2 className={styles.sectionTitle}>22. LinkIndex</h2>

        <h3 id="link-index-tags" className={styles.subsectionTitle}>
          タグ（4）— 多い順に数を添える・2語目が現在地
        </h3>
        <LinkIndex
          labelledBy="link-index-tags"
          items={LINK_INDEX_TAGS}
          currentHref="/blog/tag/設計パターン"
        />

        <p className={styles.subsectionTitle}>
          漢字の詳細の同じ部首の漢字 —
          セクションの見出しの下に、画数の区切りの見出しつき
        </p>
        <PhrasedText
          as="h3"
          className={styles.sampleSectionHeading}
          phrases={["同じ", "部首の", "漢字", "（12字）"]}
        />
        <LinkIndex
          singleCharacters
          groups={LINK_INDEX_STROKES}
          groupHeadingLevel={4}
        />
      </Section>

      <Section id="browsable-list">
        <h2 className={styles.sectionTitle}>23. BrowsableList</h2>
        <p>
          一覧の状態は URL
          が持つので、見本は1つのページに1つの一覧を置き、それぞれ別のページで開く。
        </p>
        <h3 id="browsable-list-samples" className={styles.subsectionTitle}>
          見本のページ
        </h3>
        <ItemList labelledBy="browsable-list-samples" items={listSamples} />
      </Section>

      <Section id="result-box">
        <h2 className={styles.sectionTitle}>24. ResultBox</h2>
        <p>
          結果のボックス（§8）。囲むのは結果と、値を写すコピーのボタンだけで、中身の形ごとに組み方が決まる。
        </p>

        <p className={styles.subsectionTitle}>
          名前を持つ結果（診断のタイプ名を結果の見出しに）
        </p>
        <ResultBox
          caption={`${quizTitle}の結果`}
          heading={{ phrases: nameResult.phrases, ...nameResult.headingFont }}
        >
          <div className={styles.resultText}>
            {nameResult.catchphrase && <p>{nameResult.catchphrase}</p>}
            <p>{nameResult.description}</p>
          </div>
        </ResultBox>

        <p className={styles.subsectionTitle}>
          操作に応えて現れる結果（appear
          を渡し、登場の動きを持つ。ほかの見本は渡さないので動かない）
        </p>
        <Button onClick={() => setCountRuns((runs) => runs + 1)}>
          文字数を数える
        </Button>
        {countRuns > 0 && (
          <ResultBox key={countRuns} caption="数えた文字数の結果" appear>
            <p className={styles.resultNumber}>567文字</p>
          </ResultBox>
        )}

        <p className={styles.subsectionTitle}>数字</p>
        <ResultBox caption="文字数の結果">
          <p className={styles.resultNumber}>1,234文字</p>
        </ResultBox>

        <p className={styles.subsectionTitle}>
          値の並び（結果のボックスが表のボックス）
        </p>
        <ResultBox caption="年齢の計算の結果" kind="table">
          <table>
            <tbody>
              {AGE_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ResultBox>

        <p className={styles.subsectionTitle}>
          コード（1,000行。コピーのボタンを頭の行に持つ）
        </p>
        <ResultBox
          caption="整形した JSON"
          kind="code"
          copyButton={
            <CopyButton text={LONG_CODE} target="整形した JSON" align="end" />
          }
        >
          <pre>
            <code>{LONG_CODE}</code>
          </pre>
        </ResultBox>

        <p className={styles.subsectionTitle}>
          1続きの文字列（コピーのボタンを頭の行に持つ）
        </p>
        <ResultBox
          caption="Base64 に変えた文"
          copyButton={
            <CopyButton
              text={BASE64_SAMPLE}
              target="Base64 に変えた文"
              align="end"
            />
          }
        >
          <p className={styles.resultText}>{BASE64_SAMPLE}</p>
        </ResultBox>

        <p className={styles.subsectionTitle}>画像</p>
        <ResultBox caption="QR コード">
          {/* eslint-disable-next-line @next/next/no-img-element -- 描いた data URL をそのまま見せる */}
          <img
            src={qrCode.src}
            width={qrCode.size}
            height={qrCode.size}
            alt="https://yolos.net/storybook を符号にした QR コード"
          />
        </ResultBox>
      </Section>

      <Section id="quantity-bars">
        <h2 className={styles.sectionTitle}>25. QuantityBars</h2>
        <p>
          並べた量の帯（§5）。1行の組みで枠が並びの幅の半分に届かないときは、並び全体を2行の組みにする。
        </p>

        <p className={styles.subsectionTitle}>
          統計の分布（今回の行・値が0の行を含む）
        </p>
        <ResultBox caption="統計の分布の見本">
          <h3 id="bars-guess" className={styles.barsHeading}>
            当てた回数
          </h3>
          <QuantityBars labelledBy="bars-guess" items={GUESS_DISTRIBUTION} />
        </ResultBox>

        <p className={styles.subsectionTitle}>
          名前の列がいちばん広い分布（10行・「90〜100点」）
        </p>
        <ResultBox caption="合計の点数の分布の見本">
          <h3 id="bars-score" className={styles.barsHeading}>
            合計の点数
          </h3>
          <QuantityBars labelledBy="bars-score" items={SCORE_DISTRIBUTION} />
        </ResultBox>

        <p className={styles.subsectionTitle}>
          スコアの帯（上限は満点。「今回」の列を持たない）
        </p>
        <ResultBox caption="スコアの帯の見本">
          <h3 id="bars-axis" className={styles.barsHeading}>
            軸ごとのスコア
          </h3>
          <QuantityBars labelledBy="bars-axis" items={AXIS_SCORES} max={100} />
        </ResultBox>
      </Section>

      <Section id="phrased-text">
        <h2 className={styles.sectionTitle}>26. PhrasedText</h2>
        <p>
          見出しを文節で折る部品（§4）。下の見本は、同じタイプ名を3通りの区切り方で並べ、VoiceOver
          が見出しを1回で読むかを聞き比べるためのもの。区切りを持たない見出しと、ゼロ幅スペースで区切った見出しは、比べるためだけに置く。
        </p>
        {voiceOverSamples.map((sample) => (
          <div key={sample.id} className={styles.phrasedGroup}>
            <p className={styles.subsectionTitle}>{sample.id}</p>
            {(
              [
                ["section", "セクションの見出しの段"],
                ["main", "主見出しの段"],
              ] as const
            ).map(([step, stepLabel]) => {
              const stepClass =
                step === "main" ? styles.mainStepHeading : undefined;
              return (
                <div key={step} className={styles.phrasedStep}>
                  <p className={styles.phrasedLabel}>
                    {stepLabel}・&lt;wbr&gt; で区切ったもの（PhrasedText）
                  </p>
                  <PhrasedText
                    as="h2"
                    phrases={sample.phrases}
                    className={stepClass}
                    {...sample.headingFont}
                  />
                  <p className={styles.phrasedLabel}>
                    {stepLabel}・区切りを持たないもの
                  </p>
                  <h2 className={stepClass} {...sample.headingFont}>
                    {sample.title}
                  </h2>
                  <p className={styles.phrasedLabel}>
                    {stepLabel}・ゼロ幅スペースで区切ったもの
                  </p>
                  <h2
                    className={[styles.zeroWidthSpaced, stepClass]
                      .filter(Boolean)
                      .join(" ")}
                    {...sample.headingFont}
                  >
                    {sample.phrases.join("\u200B")}
                  </h2>
                </div>
              );
            })}
          </div>
        ))}
      </Section>

      <Section id="solved-screen">
        <h2 className={styles.sectionTitle}>
          27. 解き終えた画面（ResultCard）
        </h2>
        <p>
          {solvedScreen.quizTitle}
          を解き終えたときの画面。タイプを選ぶと、このセクションのあとに、そのタイプの結果と結果を共有する区画・このタイプについて・次はこれを試してみよう・すべてのタイプのセクションを、解き終えた画面と同じ部品で開く。
        </p>
        <Field label="開くタイプ">
          {(control) => (
            <Select
              {...control}
              value={solvedTypeId}
              onChange={(event) => setSolvedTypeId(event.target.value)}
            >
              {solvedScreen.results.map((result) => (
                <option key={result.id} value={result.id}>
                  {result.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Section>
      <ResultCard
        key={solvedResult.id}
        result={solvedResult}
        heading={solvedScreen.resultHeadings[solvedResult.id]}
        readingHeadings={solvedScreen.readingHeadings}
        quizType="personality"
        quizTitle={solvedScreen.quizTitle}
        quizName={solvedScreen.quizName}
        quizSlug={solvedScreen.quizSlug}
        onRetry={() => {}}
        detailedContent={solvedResult.detailedContent}
        allResults={solvedScreen.results}
      />
    </>
  );
}
