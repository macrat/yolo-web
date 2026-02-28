import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "traditional-color-palette",
  name: "伝統色カラーパレット",
  nameEn: "Traditional Color Palette Generator",
  description:
    "日本の伝統色250色から色彩調和パレットを自動生成。補色・類似色・トライアド・テトラド・分裂補色の5種類の配色を提案。Webデザインや和風デザインに活用できます。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "伝統色から色彩調和パレットを自動生成",
  keywords: [
    "伝統色 パレット",
    "和色 配色",
    "補色 伝統色",
    "カラーパレット 日本",
  ],
  category: "generator",
  relatedSlugs: ["color-converter"],
  publishedAt: "2026-02-28",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition:
    "伝統色を選ぶだけで補色・類似色・トライアド配色をすぐに確認できる",
  usageExample: {
    input: "鴇（#eea9a9）を選択",
    output:
      "補色: 青碧（#268785）/ 類似色: 梅紫・琥珀 / トライアド: 薄青・紅掛花",
    description: "ピンク系の伝統色から色彩調和パレットを生成する例",
  },
  faq: [
    {
      question: "どのような配色パターンを生成できますか？",
      answer:
        "補色（2色）・類似色（3色）・トライアド（3色）・テトラド（4色）・分裂補色（3色）の5種類の配色パターンを生成できます。",
    },
    {
      question: "無彩色（鉛・灰・黒など）を選んだ場合はどうなりますか？",
      answer:
        "無彩色は色相を持たないため色彩調和の計算ができません。無彩色を選んだ場合は明度の異なる無彩色の一覧を表示します。",
    },
    {
      question: "生成したパレットのカラーコードはコピーできますか？",
      answer:
        "はい。各色のHEX・RGB・HSLコードをワンクリックでクリップボードにコピーできます。",
    },
  ],
};
