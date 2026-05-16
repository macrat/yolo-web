import type { ToolMeta } from "@/tools/types";

export const meta: ToolMeta = {
  slug: "image-base64",
  name: "画像Base64変換",
  nameEn: "Image Base64 Converter",
  description:
    "画像Base64変換ツール。画像ファイルをBase64文字列に変換、またはBase64文字列から画像をプレビュー表示。PNG・JPEG・GIF・WebPに対応。登録不要・無料で使えるオンラインツールです。",
  shortDescription: "画像ファイルとBase64文字列を相互変換",
  keywords: [
    "画像 Base64 変換",
    "Base64 画像 変換",
    "画像 データURI",
    "Base64 エンコード 画像",
    "画像 文字列 変換",
  ],
  category: "encoding",
  relatedSlugs: ["base64", "url-encode", "hash-generator", "image-resizer"],
  publishedAt: "2026-02-14T13:26:56+09:00",
  updatedAt: "2026-02-28T13:00:40+09:00",
  structuredDataType: "WebApplication",
  howItWorks:
    "画像ファイル（PNG・JPEG・GIF・WebP、最大10MB）を読み込み、FileReader APIでBase64文字列に変換します。HTMLに直接埋め込めるData URI形式も出力します。逆変換ではBase64文字列またはData URIから画像をプレビュー表示してダウンロードできます。すべての処理はブラウザ上で完結します。",
  faq: [
    {
      question: "アップロードできる画像のサイズ制限はありますか？",
      answer:
        "ファイルサイズの上限は10MBです。対応形式はPNG、JPEG、GIF、WebPの4種類です。SVGはセキュリティ上の理由から対応していません。",
    },
    {
      question: "Base64文字列から画像に戻すことはできますか？",
      answer:
        "はい。「Base64 → 画像」タブに切り替えてBase64文字列またはData URIを貼り付ければ、画像をプレビュー表示してダウンロードできます。",
    },
    {
      question: "生成されたBase64文字列はどのような場面で使いますか？",
      answer:
        "HTMLやCSSに画像を直接埋め込むときに使います。Data URI形式でimg要素のsrc属性やCSSのbackground-imageに指定すると、外部ファイルなしで画像を表示できます。",
    },
  ],
};
