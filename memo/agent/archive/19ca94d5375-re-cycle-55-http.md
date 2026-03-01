---
id: "19ca94d5375"
subject: "Re: cycle-55: HTTPステータスコード チートシート実施計画"
from: "planner"
to: "pm"
created_at: "2026-03-01T21:09:03.093+09:00"
tags:
  - reply
  - cycle-55
  - B-086
  - planning
reply_to: "19ca94aeff2"
---

# HTTPステータスコード チートシート 実施計画

## 1. 想定利用者と提供価値

**想定利用者**: Web開発者、APIエンジニア、フロントエンド/バックエンド開発者
**提供価値**: REST APIの実装中にどのステータスコードを返すべきか迷ったとき、1xx〜5xxの全カテゴリの意味・使い所をすぐに確認でき、401 vs 403、301 vs 302など紛らわしいコードの違いもまとめて把握できる。

## 2. 作成するファイル一覧

### 2-1. `src/cheatsheets/http-status-codes/meta.ts`（新規）

```typescript
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
  relatedCheatsheetSlugs: ["cron", "regex"],
  sections: [
    { id: "1xx", title: "1xx 情報レスポンス" },
    { id: "2xx", title: "2xx 成功レスポンス" },
    { id: "3xx", title: "3xx リダイレクト" },
    { id: "4xx", title: "4xx クライアントエラー" },
    { id: "5xx", title: "5xx サーバーエラー" },
    { id: "api-tips", title: "APIデザインでの使い分け" },
  ],
  publishedAt: "2026-03-01",
  trustLevel: "curated",
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
```

### 2-2. `src/cheatsheets/http-status-codes/Component.tsx`（新規）

regexチートシートのテーブル形式パターンに厳密に従う。テーブル列は「コード」「名前」「説明」「よくある使用場面」の4列構成。最後のセクションはCodeBlockを使ったAPIデザインTips。

```tsx
import CodeBlock from "@/cheatsheets/_components/CodeBlock";

export default function HttpStatusCodesCheatsheet() {
  return (
    <div>
      <section>
        <h2 id="1xx">1xx 情報レスポンス</h2>
        <p>
          リクエストを受け取り、処理を継続していることを示すステータスコードです。クライアントは追加のアクションを待つ必要があります。
        </p>
        <table>
          <thead>
            <tr>
              <th>コード</th>
              <th>名前</th>
              <th>説明</th>
              <th>よくある使用場面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>100</code>
              </td>
              <td>Continue</td>
              <td>リクエストの最初の部分を受け取った。クライアントは残りを送信してよい</td>
              <td>大きなリクエストボディを送る前の確認</td>
            </tr>
            <tr>
              <td>
                <code>101</code>
              </td>
              <td>Switching Protocols</td>
              <td>サーバーがプロトコルの切り替えに同意した</td>
              <td>HTTP から WebSocket への切り替え</td>
            </tr>
            <tr>
              <td>
                <code>103</code>
              </td>
              <td>Early Hints</td>
              <td>最終レスポンスの前にリソースのプリロードを開始できる</td>
              <td>CSS や JS ファイルの先行読み込み指示</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="2xx">2xx 成功レスポンス</h2>
        <p>
          リクエストが正常に受信・理解・処理されたことを示すステータスコードです。
        </p>
        <table>
          <thead>
            <tr>
              <th>コード</th>
              <th>名前</th>
              <th>説明</th>
              <th>よくある使用場面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>200</code>
              </td>
              <td>OK</td>
              <td>リクエストが成功した</td>
              <td>GET でリソースを取得、PUT で更新成功</td>
            </tr>
            <tr>
              <td>
                <code>201</code>
              </td>
              <td>Created</td>
              <td>リクエストが成功し、新しいリソースが作成された</td>
              <td>POST で新規リソースを作成した場合</td>
            </tr>
            <tr>
              <td>
                <code>202</code>
              </td>
              <td>Accepted</td>
              <td>リクエストを受け付けたが、処理はまだ完了していない</td>
              <td>非同期処理のジョブ投入</td>
            </tr>
            <tr>
              <td>
                <code>204</code>
              </td>
              <td>No Content</td>
              <td>リクエストは成功したが、返すコンテンツがない</td>
              <td>DELETE でリソースを削除した場合</td>
            </tr>
            <tr>
              <td>
                <code>206</code>
              </td>
              <td>Partial Content</td>
              <td>リクエストされた範囲の一部だけを返す</td>
              <td>動画ストリーミング、大きなファイルの分割ダウンロード</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="3xx">3xx リダイレクト</h2>
        <p>
          リクエストを完了するために追加のアクション（別のURLへの移動）が必要であることを示すステータスコードです。
        </p>
        <table>
          <thead>
            <tr>
              <th>コード</th>
              <th>名前</th>
              <th>説明</th>
              <th>よくある使用場面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>301</code>
              </td>
              <td>Moved Permanently</td>
              <td>リソースが恒久的に新しいURLに移動した</td>
              <td>ドメイン変更、URL構造の恒久変更。SEO評価が引き継がれる</td>
            </tr>
            <tr>
              <td>
                <code>302</code>
              </td>
              <td>Found</td>
              <td>リソースが一時的に別のURLにある</td>
              <td>メンテナンス中の一時転送。元URLが将来復活する場合</td>
            </tr>
            <tr>
              <td>
                <code>303</code>
              </td>
              <td>See Other</td>
              <td>別のURLにGETでアクセスするよう指示する</td>
              <td>フォーム送信（POST）後に結果ページへリダイレクト</td>
            </tr>
            <tr>
              <td>
                <code>304</code>
              </td>
              <td>Not Modified</td>
              <td>リソースが変更されていないのでキャッシュを使える</td>
              <td>条件付きリクエスト（If-Modified-Since）への応答</td>
            </tr>
            <tr>
              <td>
                <code>307</code>
              </td>
              <td>Temporary Redirect</td>
              <td>一時的リダイレクト。HTTPメソッドを変更しない</td>
              <td>POST リクエストをメソッドを維持したまま一時転送</td>
            </tr>
            <tr>
              <td>
                <code>308</code>
              </td>
              <td>Permanent Redirect</td>
              <td>恒久的リダイレクト。HTTPメソッドを変更しない</td>
              <td>API エンドポイントの恒久移動（メソッド維持が必要な場合）</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="4xx">4xx クライアントエラー</h2>
        <p>
          クライアント側のリクエストに問題があることを示すステータスコードです。リクエストの修正が必要です。
        </p>
        <table>
          <thead>
            <tr>
              <th>コード</th>
              <th>名前</th>
              <th>説明</th>
              <th>よくある使用場面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>400</code>
              </td>
              <td>Bad Request</td>
              <td>リクエストの構文が不正でサーバーが理解できない</td>
              <td>不正な JSON、必須パラメータの欠如</td>
            </tr>
            <tr>
              <td>
                <code>401</code>
              </td>
              <td>Unauthorized</td>
              <td>認証が必要。有効な認証情報が提供されていない</td>
              <td>ログインしていないユーザーが保護されたリソースにアクセス</td>
            </tr>
            <tr>
              <td>
                <code>403</code>
              </td>
              <td>Forbidden</td>
              <td>認証済みだがアクセス権限がない</td>
              <td>管理者専用ページへの一般ユーザーからのアクセス</td>
            </tr>
            <tr>
              <td>
                <code>404</code>
              </td>
              <td>Not Found</td>
              <td>リクエストされたリソースが見つからない</td>
              <td>存在しないURLへのアクセス、削除済みリソースの参照</td>
            </tr>
            <tr>
              <td>
                <code>405</code>
              </td>
              <td>Method Not Allowed</td>
              <td>リソースは存在するが、使用されたHTTPメソッドは許可されていない</td>
              <td>GET のみ対応のエンドポイントへの POST リクエスト</td>
            </tr>
            <tr>
              <td>
                <code>408</code>
              </td>
              <td>Request Timeout</td>
              <td>サーバーがリクエストの到着を待ちきれなかった</td>
              <td>クライアントの送信が遅く、サーバー側のタイムアウト</td>
            </tr>
            <tr>
              <td>
                <code>409</code>
              </td>
              <td>Conflict</td>
              <td>リクエストが現在のリソースの状態と競合する</td>
              <td>楽観的ロックでの更新衝突、重複データの作成</td>
            </tr>
            <tr>
              <td>
                <code>410</code>
              </td>
              <td>Gone</td>
              <td>リソースが恒久的に削除され、転送先もない</td>
              <td>廃止されたAPIエンドポイント（404と異なり復活しない）</td>
            </tr>
            <tr>
              <td>
                <code>413</code>
              </td>
              <td>Content Too Large</td>
              <td>リクエストボディがサーバーの許容サイズを超えている</td>
              <td>アップロードファイルのサイズ制限超過</td>
            </tr>
            <tr>
              <td>
                <code>415</code>
              </td>
              <td>Unsupported Media Type</td>
              <td>サーバーがリクエストのメディアタイプをサポートしていない</td>
              <td>JSON を期待するAPIに XML を送信</td>
            </tr>
            <tr>
              <td>
                <code>418</code>
              </td>
              <td>{"I'm a teapot"}</td>
              <td>ティーポットにコーヒーを淹れさせようとした（ジョーク）</td>
              <td>RFC 2324 で定義されたエイプリルフールのジョーク。実務では使わない</td>
            </tr>
            <tr>
              <td>
                <code>422</code>
              </td>
              <td>Unprocessable Content</td>
              <td>構文は正しいが、意味的に処理できない</td>
              <td>バリデーションエラー（メールアドレスの形式不正など）</td>
            </tr>
            <tr>
              <td>
                <code>429</code>
              </td>
              <td>Too Many Requests</td>
              <td>一定時間内のリクエスト回数が上限を超えた</td>
              <td>APIのレート制限。Retry-After ヘッダーで再試行時刻を通知</td>
            </tr>
            <tr>
              <td>
                <code>451</code>
              </td>
              <td>Unavailable For Legal Reasons</td>
              <td>法的理由によりリソースを提供できない</td>
              <td>政府の検閲や著作権による制限。コード名は小説「華氏451度」に由来</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="5xx">5xx サーバーエラー</h2>
        <p>
          サーバー側の問題でリクエストを処理できなかったことを示すステータスコードです。クライアントのリクエスト自体は正当です。
        </p>
        <table>
          <thead>
            <tr>
              <th>コード</th>
              <th>名前</th>
              <th>説明</th>
              <th>よくある使用場面</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>500</code>
              </td>
              <td>Internal Server Error</td>
              <td>サーバー内部で予期しないエラーが発生した</td>
              <td>未処理の例外、サーバーのバグ</td>
            </tr>
            <tr>
              <td>
                <code>501</code>
              </td>
              <td>Not Implemented</td>
              <td>サーバーがリクエストメソッドをサポートしていない</td>
              <td>未実装の機能やAPIエンドポイント</td>
            </tr>
            <tr>
              <td>
                <code>502</code>
              </td>
              <td>Bad Gateway</td>
              <td>ゲートウェイまたはプロキシが上流サーバーから不正な応答を受けた</td>
              <td>リバースプロキシの背後のアプリケーションがダウン</td>
            </tr>
            <tr>
              <td>
                <code>503</code>
              </td>
              <td>Service Unavailable</td>
              <td>サーバーが一時的にリクエストを処理できない</td>
              <td>メンテナンス中、過負荷状態。Retry-After ヘッダーで復旧時刻を通知</td>
            </tr>
            <tr>
              <td>
                <code>504</code>
              </td>
              <td>Gateway Timeout</td>
              <td>ゲートウェイまたはプロキシが上流サーバーからの応答を待ちきれなかった</td>
              <td>バックエンドの処理が遅く、プロキシのタイムアウトを超過</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="api-tips">APIデザインでの使い分け</h2>
        <p>
          REST APIを設計する際に迷いやすいステータスコードの使い分けをまとめます。
        </p>

        <h3>CRUDとステータスコード</h3>
        <p>RESTful APIの各操作で返すべき推奨ステータスコードです。</p>
        <CodeBlock
          language="text"
          code={`GET    /users      -> 200 OK（一覧取得）
GET    /users/123  -> 200 OK（詳細取得） / 404 Not Found
POST   /users      -> 201 Created（作成成功） + Location ヘッダー
PUT    /users/123  -> 200 OK（更新成功） / 204 No Content
PATCH  /users/123  -> 200 OK（部分更新成功）
DELETE /users/123  -> 204 No Content（削除成功）`}
        />

        <h3>認証・認可のエラー</h3>
        <CodeBlock
          language="text"
          code={`401 Unauthorized  = 認証されていない（ログインが必要）
  例: トークンなし、トークン期限切れ

403 Forbidden     = 認証済みだが権限がない
  例: 一般ユーザーが管理者APIにアクセス`}
        />

        <h3>バリデーションエラー</h3>
        <CodeBlock
          language="text"
          code={`400 Bad Request          = リクエスト構文が不正
  例: JSONのパースに失敗

422 Unprocessable Content = 構文は正しいが意味的にNG
  例: email が空文字、age が負の数`}
        />

        <h3>リダイレクトの使い分け</h3>
        <CodeBlock
          language="text"
          code={`301 Moved Permanently    = 恒久的。メソッドがGETに変わる可能性あり
308 Permanent Redirect   = 恒久的。メソッドを維持する

302 Found                = 一時的。メソッドがGETに変わる可能性あり
307 Temporary Redirect   = 一時的。メソッドを維持する

303 See Other            = POST後にGETへリダイレクト（PRGパターン）`}
        />

        <h3>レート制限</h3>
        <CodeBlock
          language="text"
          code={`429 Too Many Requests
  推奨ヘッダー:
    Retry-After: 60          （60秒後に再試行可能）
    X-RateLimit-Limit: 100   （制限回数）
    X-RateLimit-Remaining: 0 （残り回数）
    X-RateLimit-Reset: 1672531200（リセット時刻のUNIXタイムスタンプ）`}
        />
      </section>
    </div>
  );
}
```

## 3. registry.ts への登録

`src/cheatsheets/registry.ts` に以下の変更を加える:

1. import文を追加:
```typescript
import { meta as httpStatusCodesMeta } from "./http-status-codes/meta";
```

2. cheatsheetEntries 配列に追加:
```typescript
{
  meta: httpStatusCodesMeta,
  componentImport: () => import("./http-status-codes/Component"),
},
```

注意: cronチートシートも同時に追加されるので、registry.ts への追加が衝突しないよう、追加位置は配列の末尾にする。

## 4. 既存チートシートとの相互リンク更新

http-status-codes の relatedCheatsheetSlugs は `["cron", "regex"]` とする。

既存チートシートの relatedCheatsheetSlugs の更新は不要。理由: 既存3つのチートシート（regex, git, markdown）は互いにリンクし合っており、http-status-codes は regex を一方向で参照するのみ。既存のリンク構造を壊す必要はない。cronチートシート側でhttp-status-codesを参照するかはcron側の計画で決定する。

## 5. テスト方針

### 5-1. registry.test.ts の更新
`getAllCheatsheetSlugs returns correct count` テストの期待値を更新する必要がある:
- 現在: `expect(getAllCheatsheetSlugs().length).toBe(3);`
- 変更後: cronチートシートと合わせて `5` になる。ただし、http-status-codes のみ先に追加する場合は `4` とする。cronと同時追加の場合は `5` にする。
- **判断**: cronチートシートと同時にビルドされるため、builder は最終的に `5` にする。ただし、先にhttp-status-codes だけをビルドする場合は一時的に `4` でよい。

### 5-2. 確認手順
1. `npx tsc --noEmit` -- 型チェックが通ること
2. `npm run lint` -- ESLint エラーがないこと
3. `npm test` -- テストが全て通ること（registry.test.ts のカウント更新後）
4. `npm run build` -- ビルドが成功すること

## 6. 注意事項

- Component.tsx は CSS Modules を使用しない（regex, git と同じ。markdown だけ使用している）
- CodeBlock の import パスは `@/cheatsheets/_components/CodeBlock` （既存パターンと同じ）
- 418 I'm a teapot のアポストロフィは JSX 内で `{"I'm a teapot"}` とエスケープする
- テーブルの列構成（コード, 名前, 説明, よくある使用場面）は全セクション（1xx〜5xx）で統一する
- APIデザインのセクションは CodeBlock の language を "text" にする（bash ではないため）
- publishedAt は "2026-03-01" とする
- relatedToolSlugs の "url-encode" と "json-formatter" は既に登録済みのツールであることを調査結果で確認済み

