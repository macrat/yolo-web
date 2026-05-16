import type { CheatsheetMeta } from "../types";

export const meta: CheatsheetMeta = {
  slug: "http-status-codes",
  name: "HTTPステータスコード チートシート",
  nameEn: "HTTP Status Codes Cheatsheet",
  description:
    "HTTPステータスコードの一覧チートシート。1xx〜5xxの全カテゴリをカバーし、各コードの意味・使い所・APIデザインのベストプラクティスを日本語で解説。",
  shortDescription: "1xx〜5xx全コードの意味と使い所",
  keywords: [
    "HTTPステータスコード",
    "HTTP status code",
    "ステータスコード 一覧",
    "404 意味",
    "500 エラー",
    "REST API ステータスコード",
    "チートシート",
  ],
  category: "developer",
  relatedToolSlugs: ["url-encode", "json-formatter"],
  relatedCheatsheetSlugs: ["git", "regex"],
  sections: [
    { id: "1xx", title: "1xx 情報レスポンス" },
    { id: "2xx", title: "2xx 成功レスポンス" },
    { id: "3xx", title: "3xx リダイレクト" },
    { id: "4xx", title: "4xx クライアントエラー" },
    { id: "5xx", title: "5xx サーバーエラー" },
    { id: "api-tips", title: "APIデザインでの使い分け" },
  ],
  publishedAt: "2026-03-01T21:38:13+09:00",
  valueProposition:
    "全HTTPステータスコードの意味と使い所を日本語でまとめて参照",
  usageExample: {
    input: "REST APIを実装中にどのステータスコードを返すべきか迷ったとき",
    output:
      "201（作成成功）・204（削除成功）・422（バリデーションエラー）など、用途に合ったコードをすぐ確認できる",
    description: "APIデザインのベストプラクティスも合わせて掲載",
  },
  faq: [
    {
      question: "401と403の違いは何ですか？",
      answer:
        "401 Unauthorizedは認証（Authentication）されていない状態で、ログインが必要であることを意味します。403 Forbiddenは認証済みだがアクセス権限（Authorization）がない状態です。ログインしていないユーザーには401、ログイン済みでも権限のないリソースへのアクセスには403を使います。",
    },
    {
      question: "301と302の違いは何ですか？",
      answer:
        "301 Moved Permanentlyは恒久的なリダイレクトで、SEOのランキング評価が新URLに引き継がれます。302 Foundは一時的なリダイレクトで、元のURLが将来復活する可能性がある場合に使います。301を誤って302で実装するとSEOに悪影響が出る場合があります。",
    },
    {
      question: "400と422の使い分けを教えてください",
      answer:
        "400 Bad Requestはリクエストの構文自体が不正な場合（JSONが壊れているなど）に使います。422 Unprocessable Contentはリクエストの構文は正しいが、内容が意味的に処理できない場合（バリデーションエラーなど）に使います。REST APIでは入力検証エラーには422が適切です。",
    },
  ],
};
