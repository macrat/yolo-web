import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "image-resizer",
  name: "画像リサイズ",
  nameEn: "Image Resizer",
  description:
    "画像リサイズツール。ブラウザ上で画像のサイズを変更。アスペクト比ロック、幅・高さ指定、パーセント指定に対応。PNG・JPEG・WebP出力対応。サーバー送信なしで安全。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "ブラウザ上で画像をリサイズ・変換",
  keywords: [
    "画像 リサイズ オンライン",
    "画像 サイズ変更",
    "画像 縮小",
    "画像 拡大",
    "画像 変換",
  ],
  category: "generator",
  relatedSlugs: ["image-base64", "base64", "qr-code"],
  publishedAt: "2026-02-14",
  structuredDataType: "WebApplication",
  trustLevel: "verified",
  valueProposition: "画像をドロップするだけでリサイズ・形式変換ができる",
  usageExample: {
    input: "1920x1080のPNG画像 / 幅800px指定",
    output: "800x450のPNG画像（アスペクト比維持）",
    description: "フルHD画像を幅800pxにリサイズする例",
  },
  faq: [
    {
      question: "対応している画像形式と最大ファイルサイズは？",
      answer:
        "入力はPNG、JPEG、GIF、WebPに対応しており、最大20MBまでのファイルを処理できます。出力形式はPNG、JPEG、WebPから選択できます。",
    },
    {
      question: "アスペクト比を維持したままリサイズできますか？",
      answer:
        "はい。アスペクト比ロック機能があり、幅または高さの一方を指定するともう一方が自動計算されます。ロックを解除すれば自由な比率でリサイズすることも可能です。",
    },
    {
      question: "画像データはサーバーに送信されますか？",
      answer:
        "いいえ。すべての処理はブラウザ内で完結しており、画像データがサーバーに送信されることはありません。プライバシーを気にせず安心して利用できます。",
    },
  ],
};
