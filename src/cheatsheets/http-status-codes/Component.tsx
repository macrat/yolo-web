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
              <td>
                リクエストの最初の部分を受け取った。クライアントは残りを送信してよい
              </td>
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
              <td>
                リソースは存在するが、使用されたHTTPメソッドは許可されていない
              </td>
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
              <td>
                RFC 2324
                で定義されたエイプリルフールのジョーク。実務では使わない
              </td>
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
              <td>
                政府の検閲や著作権による制限。コード名は小説「華氏451度」に由来
              </td>
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
              <td>
                ゲートウェイまたはプロキシが上流サーバーから不正な応答を受けた
              </td>
              <td>リバースプロキシの背後のアプリケーションがダウン</td>
            </tr>
            <tr>
              <td>
                <code>503</code>
              </td>
              <td>Service Unavailable</td>
              <td>サーバーが一時的にリクエストを処理できない</td>
              <td>
                メンテナンス中、過負荷状態。Retry-After ヘッダーで復旧時刻を通知
              </td>
            </tr>
            <tr>
              <td>
                <code>504</code>
              </td>
              <td>Gateway Timeout</td>
              <td>
                ゲートウェイまたはプロキシが上流サーバーからの応答を待ちきれなかった
              </td>
              <td>バックエンドの処理が遅く、プロキシのタイムアウトを超過</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="api-tips">APIデザインでの使い分け</h2>
        <p>
          REST
          APIを設計する際に迷いやすいステータスコードの使い分けをまとめます。
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
