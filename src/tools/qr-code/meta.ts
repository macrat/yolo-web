import type { ToolMeta } from "@/tools/types";
import { maxChars } from "./capacity";

const LOW = maxChars("L");
const DEFAULT = maxChars("M");

/** 3桁ごとに区切った字の数。 */
function count(n: number): string {
  return n.toLocaleString("ja-JP");
}

export const meta: ToolMeta = {
  slug: "qr-code",
  name: "QRコード生成",
  nameEn: "QR Code Generator",
  description:
    "テキストやURLからQRコードを作り、PNG画像で保存できる無料ツール。日本語の文も正しく読み取れるQRコードになり、エラー訂正レベル（L/M/Q/H）も選べます。登録は不要です。",
  shortDescription: "テキストやURLからQRコードを生成",
  keywords: [
    "QRコード生成",
    "QRコード作成",
    "QRコードジェネレーター",
    "URL QRコード",
    "QRコード無料",
  ],
  category: "image",
  relatedSlugs: ["password-generator", "url-encode"],
  publishedAt: "2026-02-13T19:03:42+09:00",
  updatedAt: "2026-09-27T15:49:23+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "入力されたテキストやURLをQRコード規格でエンコードし、PNG画像としてブラウザ上に表示します。日本語の文はUTF-8でエンコードするので、スマートフォンの読み取りアプリで正しく読めます。エラー訂正レベル（L/M/Q/H）を選択でき、表示した画像をそのままPNG形式でダウンロードできます。生成処理はすべてブラウザ上で完結します。",
  faq: [
    {
      question: "エラー訂正レベルとは何ですか？",
      answer:
        "QRコードが汚れや破損で一部読めなくなった場合に復元できる割合を示します。L（7%）、M（15%）、Q（25%）、H（30%）の4段階があり、レベルが高いほど耐久性が上がりますがコードのサイズも大きくなります。",
    },
    {
      question: "生成したQRコードはどの形式でダウンロードできますか？",
      answer:
        "画像の下の「PNG画像をダウンロード」のボタンで、PNG形式で保存できます。画面に表示された画像がそのまま保存されます。",
    },
    {
      question: "QRコードに入力できるテキストの長さに制限はありますか？",
      answer: `あります。このツールは文をUTF-8で符号にするので、日本語は半角英数の約3倍の容量を使います。既定のエラー訂正レベル（M）では、半角英数（数字だけの文も同じ）なら${count(DEFAULT.ascii)}字、日本語なら${count(DEFAULT.japanese)}字まで入ります。いちばん低いレベル（L）にすると、半角英数なら${count(LOW.ascii)}字、日本語なら${count(LOW.japanese)}字まで増えます。レベルを上げるほど、入る字の数は減ります。`,
    },
  ],
};
