import CodeBlock from "@/cheatsheets/_components/CodeBlock";

export default function CronCheatsheet() {
  return (
    <div>
      <section>
        <h2 id="format">基本フォーマット</h2>
        <p>
          標準的なCron式は5つのフィールドで構成されます。左から「分・時・日・月・曜日」の順で、スペースで区切ります。
        </p>
        <CodeBlock
          code={`# 5フィールド形式（標準Unix/Linux crontab）
┌───────────── 分 (0-59)
│ ┌───────────── 時 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 曜日 (0-7, 0と7は日曜)
│ │ │ │ │
* * * * *`}
          language="cron"
        />
        <h3>各フィールドの値の範囲</h3>
        <table>
          <thead>
            <tr>
              <th>フィールド</th>
              <th>値の範囲</th>
              <th>補足</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>分</td>
              <td>
                <code>0-59</code>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>時</td>
              <td>
                <code>0-23</code>
              </td>
              <td>0は深夜0時</td>
            </tr>
            <tr>
              <td>日</td>
              <td>
                <code>1-31</code>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>月</td>
              <td>
                <code>1-12</code>
              </td>
              <td>JAN-DECも使用可（一部環境）</td>
            </tr>
            <tr>
              <td>曜日</td>
              <td>
                <code>0-7</code>
              </td>
              <td>
                0と7は日曜（多くのLinux環境）、MON-SUNも使用可（一部環境）
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="special-chars">特殊文字</h2>
        <p>
          Cron式のフィールドには、数値のほかに特殊文字を使って柔軟なスケジュールを指定できます。
        </p>

        <h3>標準特殊文字（すべての環境で使用可能）</h3>
        <table>
          <thead>
            <tr>
              <th>文字</th>
              <th>名前</th>
              <th>説明</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>*</code>
              </td>
              <td>ワイルドカード</td>
              <td>すべての値にマッチ</td>
              <td>
                <code>* * * * *</code> = 毎分実行
              </td>
            </tr>
            <tr>
              <td>
                <code>/</code>
              </td>
              <td>ステップ</td>
              <td>間隔を指定</td>
              <td>
                <code>*/15 * * * *</code> = 15分ごと
              </td>
            </tr>
            <tr>
              <td>
                <code>-</code>
              </td>
              <td>範囲</td>
              <td>連続する範囲を指定</td>
              <td>
                <code>0 9-17 * * *</code> = 9時から17時の毎正時
              </td>
            </tr>
            <tr>
              <td>
                <code>,</code>
              </td>
              <td>リスト</td>
              <td>複数の値を列挙</td>
              <td>
                <code>0 0,12 * * *</code> = 0時と12時
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# 特殊文字の組み合わせ例
*/5 * * * *       # 5分ごとに実行
0 9-17 * * *      # 9時〜17時の毎正時
0 9 * * 1-5       # 平日（月〜金）の午前9時
0 0,12 * * *      # 0時と12時に実行
0 */2 * * *       # 2時間ごと（0, 2, 4, ... 22時）
*/10 9-17 * * 1-5 # 平日9〜17時の10分ごと`}
          language="cron"
        />

        <h3>拡張特殊文字（Quartz Scheduler / AWS等の一部環境専用）</h3>
        <table>
          <thead>
            <tr>
              <th>文字</th>
              <th>名前</th>
              <th>説明</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>?</code>
              </td>
              <td>無指定</td>
              <td>日または曜日で「未指定」を表す</td>
              <td>
                <code>0 9 ? * MON</code> = 毎週月曜9時
              </td>
            </tr>
            <tr>
              <td>
                <code>L</code>
              </td>
              <td>最終</td>
              <td>月の最終日、または最終曜日</td>
              <td>
                <code>0 0 L * *</code> = 毎月末日
              </td>
            </tr>
            <tr>
              <td>
                <code>W</code>
              </td>
              <td>平日</td>
              <td>指定日に最も近い平日</td>
              <td>
                <code>0 0 15W * *</code> = 15日に最も近い平日
              </td>
            </tr>
            <tr>
              <td>
                <code>#</code>
              </td>
              <td>第N番</td>
              <td>月の第N曜日を指定</td>
              <td>
                <code>0 9 * * 5#3</code> = 第3金曜日の9時
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>注意:</strong> <code>?</code>、<code>L</code>、<code>W</code>
          、<code>#</code> は標準のcrontabやGitHub
          Actionsでは使用できません。Quartz Scheduler（Java/Spring）やAWS
          EventBridgeなど特定の環境でのみ有効です。
        </p>
      </section>

      <section>
        <h2 id="shortcuts">特殊文字列（ショートカット）</h2>
        <p>
          crontabでは、よく使うスケジュールを簡潔に指定できる特殊文字列が用意されています。
        </p>
        <table>
          <thead>
            <tr>
              <th>文字列</th>
              <th>等価なCron式</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>@yearly</code>
              </td>
              <td>
                <code>0 0 1 1 *</code>
              </td>
              <td>年1回（1月1日 0:00）</td>
            </tr>
            <tr>
              <td>
                <code>@annually</code>
              </td>
              <td>
                <code>0 0 1 1 *</code>
              </td>
              <td>@yearlyと同じ</td>
            </tr>
            <tr>
              <td>
                <code>@monthly</code>
              </td>
              <td>
                <code>0 0 1 * *</code>
              </td>
              <td>月1回（毎月1日 0:00）</td>
            </tr>
            <tr>
              <td>
                <code>@weekly</code>
              </td>
              <td>
                <code>0 0 * * 0</code>
              </td>
              <td>週1回（毎週日曜 0:00）</td>
            </tr>
            <tr>
              <td>
                <code>@daily</code>
              </td>
              <td>
                <code>0 0 * * *</code>
              </td>
              <td>日1回（毎日 0:00）</td>
            </tr>
            <tr>
              <td>
                <code>@midnight</code>
              </td>
              <td>
                <code>0 0 * * *</code>
              </td>
              <td>@dailyと同じ</td>
            </tr>
            <tr>
              <td>
                <code>@hourly</code>
              </td>
              <td>
                <code>0 * * * *</code>
              </td>
              <td>時1回（毎時 0分）</td>
            </tr>
            <tr>
              <td>
                <code>@reboot</code>
              </td>
              <td>-</td>
              <td>システム起動時に1回実行</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# crontabファイルでの使用例
@daily /usr/local/bin/backup.sh
@hourly /usr/local/bin/sync.sh
@reboot /usr/local/bin/startup.sh`}
          language="bash"
        />
      </section>

      <section>
        <h2 id="patterns">よく使うパターン</h2>
        <p>実務で頻繁に使われるCron式パターンの一覧です。</p>

        <h3>基本パターン</h3>
        <table>
          <thead>
            <tr>
              <th>Cron式</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>* * * * *</code>
              </td>
              <td>毎分</td>
            </tr>
            <tr>
              <td>
                <code>0 * * * *</code>
              </td>
              <td>毎時0分（毎正時）</td>
            </tr>
            <tr>
              <td>
                <code>0 0 * * *</code>
              </td>
              <td>毎日 0:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * *</code>
              </td>
              <td>毎日 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * 1-5</code>
              </td>
              <td>平日（月〜金）の 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 0 1 * *</code>
              </td>
              <td>毎月1日 0:00</td>
            </tr>
            <tr>
              <td>
                <code>0 0 1 1 *</code>
              </td>
              <td>毎年1月1日 0:00</td>
            </tr>
          </tbody>
        </table>

        <h3>間隔パターン</h3>
        <table>
          <thead>
            <tr>
              <th>Cron式</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>*/5 * * * *</code>
              </td>
              <td>5分ごと</td>
            </tr>
            <tr>
              <td>
                <code>*/15 * * * *</code>
              </td>
              <td>15分ごと</td>
            </tr>
            <tr>
              <td>
                <code>*/30 * * * *</code>
              </td>
              <td>30分ごと</td>
            </tr>
            <tr>
              <td>
                <code>0 */2 * * *</code>
              </td>
              <td>2時間ごと</td>
            </tr>
            <tr>
              <td>
                <code>0 */6 * * *</code>
              </td>
              <td>6時間ごと</td>
            </tr>
            <tr>
              <td>
                <code>0 */12 * * *</code>
              </td>
              <td>12時間ごと</td>
            </tr>
          </tbody>
        </table>

        <h3>曜日パターン</h3>
        <table>
          <thead>
            <tr>
              <th>Cron式</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>0 9 * * 1</code>
              </td>
              <td>毎週月曜日 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * 0</code>
              </td>
              <td>毎週日曜日 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * 1-5</code>
              </td>
              <td>平日（月〜金） 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * 6,0</code>
              </td>
              <td>週末（土日） 9:00</td>
            </tr>
            <tr>
              <td>
                <code>0 9 * * 1,3,5</code>
              </td>
              <td>月・水・金 9:00</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="examples">実用例</h2>
        <p>具体的なユースケースに対応するCron式の例です。</p>
        <table>
          <thead>
            <tr>
              <th>ユースケース</th>
              <th>Cron式</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>毎日深夜バックアップ</td>
              <td>
                <code>0 2 * * *</code>
              </td>
              <td>毎日 2:00 に実行</td>
            </tr>
            <tr>
              <td>毎週月曜レポート送信</td>
              <td>
                <code>0 9 * * 1</code>
              </td>
              <td>毎週月曜 9:00 に実行</td>
            </tr>
            <tr>
              <td>毎月1日の月次処理</td>
              <td>
                <code>0 0 1 * *</code>
              </td>
              <td>毎月1日 0:00 に実行</td>
            </tr>
            <tr>
              <td>営業時間中の定期監視</td>
              <td>
                <code>*/5 9-18 * * 1-5</code>
              </td>
              <td>平日 9:00〜18:55 の5分ごと</td>
            </tr>
            <tr>
              <td>ログローテーション</td>
              <td>
                <code>0 0 * * 0</code>
              </td>
              <td>毎週日曜 0:00 に実行</td>
            </tr>
            <tr>
              <td>SSL証明書更新チェック</td>
              <td>
                <code>0 3 * * *</code>
              </td>
              <td>毎日 3:00 に実行</td>
            </tr>
            <tr>
              <td>データベースバキューム</td>
              <td>
                <code>30 2 * * 0</code>
              </td>
              <td>毎週日曜 2:30 に実行</td>
            </tr>
            <tr>
              <td>四半期レポート</td>
              <td>
                <code>0 9 1 1,4,7,10 *</code>
              </td>
              <td>1月・4月・7月・10月の1日 9:00</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# crontabファイルの記述例
# 毎日2時にバックアップスクリプトを実行
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# 平日9時にレポートを送信
0 9 * * 1-5 /usr/local/bin/send-report.sh

# 5分ごとにヘルスチェック
*/5 * * * * curl -s https://example.com/health > /dev/null`}
          language="bash"
        />
      </section>

      <section>
        <h2 id="platforms">プラットフォーム別の注意点</h2>
        <p>
          Cron式はプラットフォームによってフォーマットや対応する機能が異なります。使用する環境に合わせて確認してください。
        </p>

        <h3>標準crontab（Linux/Unix）</h3>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>フォーマット</td>
              <td>5フィールド（分 時 日 月 曜日）</td>
            </tr>
            <tr>
              <td>管理コマンド</td>
              <td>
                <code>crontab -e</code>（編集）、<code>crontab -l</code>
                （一覧）
              </td>
            </tr>
            <tr>
              <td>タイムゾーン</td>
              <td>システムのタイムゾーン</td>
            </tr>
            <tr>
              <td>特殊文字列</td>
              <td>
                <code>@yearly</code> <code>@monthly</code> <code>@weekly</code>{" "}
                <code>@daily</code> <code>@hourly</code> <code>@reboot</code>{" "}
                に対応
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# crontab管理コマンド
crontab -e    # crontabを編集
crontab -l    # 現在のcrontabを表示
crontab -r    # crontabを削除（注意）
crontab -u user -l  # 指定ユーザーのcrontabを表示`}
          language="bash"
        />

        <h3>GitHub Actions</h3>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>フォーマット</td>
              <td>5フィールド（分 時 日 月 曜日）</td>
            </tr>
            <tr>
              <td>タイムゾーン</td>
              <td>常にUTC（日本時間はUTC+9なので注意）</td>
            </tr>
            <tr>
              <td>最短間隔</td>
              <td>5分（それより短い間隔は無視される）</td>
            </tr>
            <tr>
              <td>制限事項</td>
              <td>
                <code>L</code> <code>W</code> <code>#</code> <code>?</code>{" "}
                は使用不可
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# GitHub Actions workflow の例（.github/workflows/scheduled.yml）
on:
  schedule:
    # 日本時間の毎日9時（UTCでは0時）に実行
    - cron: '0 0 * * *'
    # 日本時間の平日18時（UTCでは9時）に実行
    - cron: '0 9 * * 1-5'`}
          language="yaml"
        />

        <h3>AWS EventBridge（CloudWatch Events）</h3>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>フォーマット</td>
              <td>6フィールド（分 時 日 月 曜日 年）</td>
            </tr>
            <tr>
              <td>タイムゾーン</td>
              <td>UTC</td>
            </tr>
            <tr>
              <td>必須ルール</td>
              <td>
                日と曜日の片方に必ず <code>?</code> を使う
              </td>
            </tr>
            <tr>
              <td>拡張文字</td>
              <td>
                <code>L</code> <code>W</code> <code>#</code> に対応
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# AWS EventBridge cron式の例
cron(0 9 ? * MON-FRI *)   # 平日UTCの9時
cron(0 0 1 * ? *)         # 毎月1日の0時
cron(0 18 ? * MON-FRI *)  # 平日UTCの18時（JST翌3時）`}
          language="text"
        />

        <h3>Quartz Scheduler（Java / Spring）</h3>
        <table>
          <thead>
            <tr>
              <th>項目</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>フォーマット</td>
              <td>
                6-7フィールド（秒 分 時 日 月 曜日
                [年]）。標準crontabの5フィールドの先頭に秒フィールド（0-59）が追加される
              </td>
            </tr>
            <tr>
              <td>必須ルール</td>
              <td>
                日と曜日の片方に必ず <code>?</code> を使う
              </td>
            </tr>
            <tr>
              <td>拡張文字</td>
              <td>
                <code>L</code> <code>W</code> <code>#</code> <code>?</code>{" "}
                すべてに対応
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`// Spring Boot での使用例（@Scheduled アノテーション）
@Scheduled(cron = "0 0 9 * * MON-FRI")  // 平日9時
@Scheduled(cron = "0 0 0 L * ?")        // 毎月末日0時
@Scheduled(cron = "0 0 9 ? * 6#3")      // 第3金曜日9時`}
          language="java"
        />
      </section>
    </div>
  );
}
