import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "qr-code",
  name: "QRコード生成",
  nameEn: "QR Code Generator",
  description:
    "テキストやURLからQRコードを生成するツール。SVG形式で高品質なQRコードを作成。エラー訂正レベルの設定に対応。登録不要・無料。",
  shortDescription: "テキストやURLからQRコードを生成",
  keywords: [
    "QRコード生成",
    "QRコード作成",
    "QRコードジェネレーター",
    "URL QRコード",
    "QRコード無料",
  ],
  category: "generator",
  relatedSlugs: ["password-generator", "url-encode"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "入力されたテキストやURLをQRコード規格でエンコードし、SVG形式でブラウザ上に高品質なQRコードを表示します。エラー訂正レベル（L/M/Q/H）を選択でき、PNG形式でダウンロードすることも可能です。生成処理はすべてブラウザ上で完結します。",
  faq: [
    {
      question: "エラー訂正レベルとは何ですか？",
      answer:
        "QRコードが汚れや破損で一部読めなくなった場合に復元できる割合を示します。L（7%）、M（15%）、Q（25%）、H（30%）の4段階があり、レベルが高いほど耐久性が上がりますがコードのサイズも大きくなります。",
    },
    {
      question: "生成したQRコードはどの形式でダウンロードできますか？",
      answer:
        "PNG形式でダウンロードできます。画面上ではSVG形式で高品質に表示されるため、そのままスクリーンショットで保存することも可能です。",
    },
    {
      question: "QRコードに入力できるテキストの長さに制限はありますか？",
      answer:
        "QRコードの規格上、数字のみなら最大7,089文字、英数字なら4,296文字、バイナリデータなら2,953バイトまで格納できます。ただしエラー訂正レベルが高いほど格納できるデータ量は少なくなります。",
    },
  ],
};
