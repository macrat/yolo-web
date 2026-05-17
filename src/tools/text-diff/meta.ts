import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "text-diff",
  name: "テキスト差分比較",
  nameEn: "Text Diff",
  description:
    "2つのテキストの差分を比較表示するツール。行単位・単語単位・文字単位の比較モードに対応。変更箇所がハイライト表示されます。登録不要・無料。",
  shortDescription: "2つのテキストの差分をハイライト表示",
  keywords: ["テキスト比較", "差分比較", "diff", "テキスト差分", "文章比較"],
  category: "text",
  relatedSlugs: ["char-count", "json-formatter", "line-break-remover"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  howItWorks:
    "2つのテキストを差分アルゴリズムで比較し、追加箇所を緑色、削除箇所を赤色でハイライト表示します。行単位・単語単位・文字単位の3つの比較モードに対応しており、用途に応じて使い分けられます。すべての処理はブラウザ上で完結し、入力データはサーバーに送信されません。",
  faq: [
    {
      question: "比較モードにはどのような種類がありますか？",
      answer:
        "行単位・単語単位・文字単位の3つの比較モードに対応しています。文章全体の構成変更を確認したい場合は行単位、細かい修正箇所を確認したい場合は文字単位がおすすめです。",
    },
    {
      question: "差分結果はどのように表示されますか？",
      answer:
        "追加された部分は緑色、削除された部分は赤色でハイライト表示されます。変更がない部分はそのまま表示されるため、どこが変わったかをひと目で確認できます。",
    },
    {
      question: "diffとは何ですか？",
      answer:
        "diffはファイルやテキストの差分を検出・表示する仕組みで、ソフトウェア開発やドキュメント管理で広く使われています。変更前後の内容を比較し、追加・削除・変更された箇所を明示します。",
    },
  ],
};
