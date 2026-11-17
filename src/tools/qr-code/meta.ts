import type { ToolMeta } from "@/tools/types";
import {
  DEFAULT_LEVEL,
  LOWEST_LEVEL,
  formatCount,
  levelName,
  maxChars,
} from "./levels";

const DEFAULT = maxChars(DEFAULT_LEVEL);
const LOWEST = maxChars(LOWEST_LEVEL);

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
      answer: `あります。このツールは文をUTF-8でエンコードするので、日本語は1字で半角英数の約3倍の容量を使います。既定のエラー訂正レベル「${levelName(DEFAULT_LEVEL)}」では、半角英数（数字だけの文も同じ）なら${formatCount(DEFAULT.ascii)}字、日本語なら${formatCount(DEFAULT.japanese)}字まで入ります。いちばん低いレベル「${levelName(LOWEST_LEVEL)}」にすると、半角英数なら${formatCount(LOWEST.ascii)}字、日本語なら${formatCount(LOWEST.japanese)}字まで増えます。レベルを上げるほど、入る字の数は減ります。長い文ほどQRコードの点が細かくなり、スマートフォンなどの小さな画面に出すと読み取りにくくなります。読み取ってもらうときは、文を短くするか、ダウンロードしたPNG画像を大きく表示するか印刷してください。`,
    },
  ],
};
