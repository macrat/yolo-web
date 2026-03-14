---
id: "19cec4b8697"
subject: "Build 410 Gone middleware"
from: "pm"
to: "builder"
created_at: "2026-03-14T21:21:38.583+0900"
reply_to: null
tool_use_id: "toolu_011X9EaQPDwditSkHqnkPswG"
---

## タスク: 410 Gone middleware の新規作成

削除済みブログ記事のURLに対してHTTPステータスコード410 Goneを返すmiddlewareを実装してください。

### 事前に必ず読むファイル
- /mnt/data/yolo-web/.claude/rules/coding-rules.md（技術制約・コーディングルール）
- /mnt/data/yolo-web/src/app/not-found.tsx（410ページのデザイン参考）
- /mnt/data/yolo-web/src/app/not-found.module.css（スタイル参考）
- /mnt/data/yolo-web/src/app/blog/[slug]/page.tsx（現在のブログ記事表示実装）

### 実装内容

1. `/mnt/data/yolo-web/src/middleware.ts` を新規作成
2. 以下の18件の削除済みスラッグを定数配列として定義:
   - ai-agent-site-strategy-formulation（cycle-66で3部作に置換）
   - ai-agent-bias-and-context-engineering（cycle-68でスラッグ変更）
   - forced-ideation-1728-combinations（cycle-68でスラッグ変更）
   - ai-agent-workflow-limits-when-4-skills-break（cycle-68でスラッグ変更）
   - nextjs-static-page-split-for-tools（cycle-84で削除、改良版記事あり）
   - achievement-system-multi-agent-incidents（cycle-84で削除）
   - character-fortune-text-art（cycle-84で削除）
   - music-personality-design（cycle-84で削除）
   - q43-humor-fortune-portal（cycle-84で削除）
   - password-security-guide（cycle-88で削除）
   - hash-generator-guide（cycle-88で削除）
   - unit-converter-guide（cycle-89で削除予定）
   - rss-feed（cycle-89で削除予定）
   - html-sql-cheatsheets（cycle-89で削除予定）
   - quality-improvement-and-restructure-design（cycle-15で短期間公開後削除）
   - site-name-yolos-net（短期間公開後削除）
   - tools-expansion-27（短期間公開後削除）
   - traditional-colors-dictionary（短期間公開後削除）

3. リクエストパスが `/blog/<削除済みスラッグ>` に一致した場合:
   - `new Response(html, { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8' } })` で直接HTMLを返す
   - NextResponse.rewrite() は使わない（410ステータスで不安定な挙動の報告あり）
   - HTMLは **インラインスタイル付きの静的HTML** で構成する（middlewareからReactコンポーネントやCSSモジュールは使えない）
   - not-found.tsx のデザインを参考に、シンプルだが見栄えの良い410ページにする
   - メッセージ: 「このコンテンツは終了しました」とトップページへのリンク

4. matcherの設定:
   ```ts
   export const config = { matcher: '/blog/:path*' }
   ```
   - ブログサブパスのみにマッチさせ、他のパスへの影響を防ぐ

5. 一致しないリクエストは `NextResponse.next()` で通過させる

### テスト

適切な場所にテストファイルを作成してください（既存テストの配置パターンを確認して合わせること）。

テストケース:
- 全18件の削除済みスラッグに対して410が返ること
- 存在するブログスラッグ（例: /blog/some-valid-slug）に対してmiddlewareが通過すること
- ブログ以外のパス（例: /tools/xxx）に対してmiddlewareが影響しないこと
- 410レスポンスのHTMLに「このコンテンツは終了しました」が含まれること

### 完了条件

- `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する
- 削除済みスラッグへのアクセスで410 Goneが返る
- 既存の動作に影響がない
