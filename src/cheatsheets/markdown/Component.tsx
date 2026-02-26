import CodeBlock from "@/cheatsheets/_components/CodeBlock";
import styles from "./Component.module.css";

export default function MarkdownCheatsheet() {
  return (
    <div className={styles.cheatsheet}>
      {/* 見出し */}
      <section>
        <h2 id="headings">見出し</h2>
        <p>
          <code>#</code> の数で見出しレベル（h1〜h6）を指定します。
          <code>#</code> の後にはスペースを入れてください。
        </p>
        <CodeBlock
          language="markdown"
          code={`# 見出し1（h1）
## 見出し2（h2）
### 見出し3（h3）
#### 見出し4（h4）
##### 見出し5（h5）
###### 見出し6（h6）`}
        />
        <div className={styles.tip}>
          <strong>補足:</strong>{" "}
          h1とh2は以下の代替記法でも書けます（Setext形式）。
        </div>
        <CodeBlock
          language="markdown"
          code={`見出し1
=======

見出し2
-------`}
        />
      </section>

      {/* テキスト装飾 */}
      <section>
        <h2 id="text-formatting">テキスト装飾</h2>
        <p>
          テキストに太字、斜体、取り消し線、インラインコードなどの装飾を適用できます。
        </p>

        <h3>太字</h3>
        <CodeBlock
          language="markdown"
          code={`**太字テキスト**
__太字テキスト__`}
        />

        <h3>斜体（イタリック）</h3>
        <CodeBlock
          language="markdown"
          code={`*斜体テキスト*
_斜体テキスト_`}
        />

        <h3>太字＋斜体</h3>
        <CodeBlock
          language="markdown"
          code={`***太字かつ斜体***
___太字かつ斜体___`}
        />

        <h3>取り消し線</h3>
        <CodeBlock language="markdown" code={`~~取り消し線テキスト~~`} />

        <h3>インラインコード</h3>
        <CodeBlock
          language="markdown"
          code={`\`console.log("Hello")\` のようにバッククォートで囲みます。`}
        />

        <h3>上付き・下付き（HTML）</h3>
        <CodeBlock
          language="markdown"
          code={`H<sub>2</sub>O は水の化学式です。
E = mc<sup>2</sup>`}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>記法</th>
              <th>表示結果</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>**太字**</code>
              </td>
              <td>
                <strong>太字</strong>
              </td>
            </tr>
            <tr>
              <td>
                <code>*斜体*</code>
              </td>
              <td>
                <em>斜体</em>
              </td>
            </tr>
            <tr>
              <td>
                <code>~~取り消し~~</code>
              </td>
              <td>
                <s>取り消し</s>
              </td>
            </tr>
            <tr>
              <td>
                <code>`コード`</code>
              </td>
              <td>
                <code>コード</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>***太字斜体***</code>
              </td>
              <td>
                <strong>
                  <em>太字斜体</em>
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* リスト */}
      <section>
        <h2 id="lists">リスト</h2>

        <h3>順序なしリスト</h3>
        <p>
          <code>-</code>、<code>*</code>、<code>+</code>{" "}
          のいずれかで順序なしリストを作成できます。
        </p>
        <CodeBlock
          language="markdown"
          code={`- りんご
- バナナ
- みかん

* りんご
* バナナ
* みかん`}
        />

        <h3>順序付きリスト</h3>
        <p>
          数字とピリオドで順序付きリストを作成します。番号は自動で振り直されます。
        </p>
        <CodeBlock
          language="markdown"
          code={`1. 最初の項目
2. 次の項目
3. 最後の項目

1. すべて1で書いても
1. 自動的に番号が
1. 振られます`}
        />

        <h3>ネストしたリスト</h3>
        <p>インデント（スペース2〜4個）でリストをネストできます。</p>
        <CodeBlock
          language="markdown"
          code={`- 果物
  - りんご
    - ふじ
    - 紅玉
  - バナナ
- 野菜
  - にんじん
  - たまねぎ`}
        />

        <h3>タスクリスト（チェックボックス）</h3>
        <p>
          <code>- [ ]</code> で未完了、<code>- [x]</code>{" "}
          で完了のタスクリストを作成できます。
        </p>
        <CodeBlock
          language="markdown"
          code={`- [x] 完了したタスク
- [ ] 未完了のタスク
- [ ] もう一つの未完了タスク`}
        />
      </section>

      {/* リンク・画像 */}
      <section>
        <h2 id="links-images">リンク・画像</h2>

        <h3>インラインリンク</h3>
        <CodeBlock
          language="markdown"
          code={`[リンクテキスト](https://example.com)
[タイトル付きリンク](https://example.com "リンクのタイトル")`}
        />

        <h3>参照リンク</h3>
        <p>リンクURLを文書の別の場所でまとめて定義できます。</p>
        <CodeBlock
          language="markdown"
          code={`[Google][1]と[Yahoo][2]を参照してください。

[1]: https://google.com "Googleのサイト"
[2]: https://yahoo.co.jp "Yahooのサイト"`}
        />

        <h3>URLの自動リンク</h3>
        <CodeBlock
          language="markdown"
          code={`<https://example.com>
<user@example.com>`}
        />

        <h3>画像</h3>
        <CodeBlock
          language="markdown"
          code={`![代替テキスト](image.png)
![代替テキスト](image.png "画像のタイトル")`}
        />

        <h3>画像にリンクを付ける</h3>
        <CodeBlock
          language="markdown"
          code={`[![代替テキスト](image.png)](https://example.com)`}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>種類</th>
              <th>記法</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>リンク</td>
              <td>
                <code>[テキスト](URL)</code>
              </td>
            </tr>
            <tr>
              <td>画像</td>
              <td>
                <code>![alt](URL)</code>
              </td>
            </tr>
            <tr>
              <td>画像+リンク</td>
              <td>
                <code>[![alt](画像URL)](リンクURL)</code>
              </td>
            </tr>
            <tr>
              <td>参照リンク</td>
              <td>
                <code>[テキスト][id]</code>
              </td>
            </tr>
            <tr>
              <td>自動リンク</td>
              <td>
                <code>&lt;URL&gt;</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* コード */}
      <section>
        <h2 id="code">コード</h2>

        <h3>インラインコード</h3>
        <p>
          バッククォート（<code>`</code>）でテキストを囲みます。
        </p>
        <CodeBlock
          language="markdown"
          code={`変数 \`count\` の値を確認してください。`}
        />

        <h3>コード内にバッククォートを含める</h3>
        <p>二重バッククォートを使います。</p>
        <CodeBlock
          language="markdown"
          code={`\`\` ここに \`バッククォート\` を含められます \`\``}
        />

        <h3>フェンス付きコードブロック</h3>
        <p>
          バッククォート3つ（<code>```</code>
          ）またはチルダ3つ（<code>~~~</code>
          ）で囲みます。開始行に言語名を指定するとシンタックスハイライトが有効になります。
        </p>
        <CodeBlock
          language="markdown"
          code={`\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\``}
        />

        <CodeBlock
          language="markdown"
          code={`\`\`\`python
def hello():
    print("Hello, World!")
\`\`\``}
        />

        <h3>インデントによるコードブロック</h3>
        <p>行頭にスペース4つまたはタブ1つを置くとコードブロックになります。</p>
        <CodeBlock
          language="markdown"
          code={`通常のテキスト

    // これはコードブロックです
    const x = 1;
    console.log(x);`}
        />

        <div className={styles.tip}>
          <strong>よく使う言語指定:</strong> javascript, typescript, python,
          html, css, bash, json, yaml, sql, go, rust, java, c, cpp, ruby, php,
          swift, kotlin, markdown
        </div>
      </section>

      {/* テーブル */}
      <section>
        <h2 id="tables">テーブル</h2>
        <p>
          パイプ（<code>|</code>）とハイフン（<code>-</code>
          ）でテーブルを作成します。2行目のハイフンが列の区切りになります。
        </p>
        <CodeBlock
          language="markdown"
          code={`| 名前   | 年齢 | 職業       |
| ------ | ---- | ---------- |
| 田中   | 30   | エンジニア |
| 佐藤   | 25   | デザイナー |
| 鈴木   | 35   | マネージャー |`}
        />

        <h3>セルの配置（アライメント）</h3>
        <p>
          コロン（<code>:</code>
          ）の位置で左寄せ・中央揃え・右寄せを指定します。
        </p>
        <CodeBlock
          language="markdown"
          code={`| 左寄せ     | 中央揃え   | 右寄せ     |
| :--------- | :--------: | ---------: |
| left       | center     | right      |
| テキスト   | テキスト   | テキスト   |`}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>記法</th>
              <th>配置</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>:---</code>
              </td>
              <td>左寄せ（デフォルト）</td>
            </tr>
            <tr>
              <td>
                <code>:---:</code>
              </td>
              <td>中央揃え</td>
            </tr>
            <tr>
              <td>
                <code>---:</code>
              </td>
              <td>右寄せ</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 引用 */}
      <section>
        <h2 id="blockquotes">引用</h2>
        <p>
          行頭に <code>&gt;</code> を付けて引用ブロックを作成します。
        </p>
        <CodeBlock
          language="markdown"
          code={`> これは引用文です。
> 複数行にまたがることができます。`}
        />

        <h3>ネストした引用</h3>
        <CodeBlock
          language="markdown"
          code={`> 第一レベルの引用
> > 第二レベルの引用
> > > 第三レベルの引用`}
        />

        <h3>引用内での装飾</h3>
        <p>引用ブロック内でも他のMarkdown記法を使えます。</p>
        <CodeBlock
          language="markdown"
          code={`> ## 引用内の見出し
>
> - リスト項目1
> - リスト項目2
>
> **太字**や*斜体*も使えます。
>
> \`コード\`も書けます。`}
        />
      </section>

      {/* 水平線 */}
      <section>
        <h2 id="horizontal-rules">水平線</h2>
        <p>
          以下のいずれかを行に単独で書くと水平線（<code>&lt;hr&gt;</code>
          ）が挿入されます。3つ以上のハイフン、アスタリスク、アンダースコアを使います。
        </p>
        <CodeBlock
          language="markdown"
          code={`---

***

___

- - -

* * *`}
        />
        <div className={styles.tip}>
          <strong>注意:</strong> <code>---</code>{" "}
          は見出しのSetext記法と間違えやすいので、前後に空行を入れるのがおすすめです。
        </div>
      </section>

      {/* HTMLの埋め込み */}
      <section>
        <h2 id="html-embed">HTMLの埋め込み</h2>
        <p>
          MarkdownファイルにはHTMLタグを直接書くことができます。Markdownで表現できない装飾やレイアウトに便利です。
        </p>

        <h3>基本的なHTMLタグ</h3>
        <CodeBlock
          language="markdown"
          code={`<div style="color: red;">赤いテキスト</div>

<details>
<summary>クリックで展開</summary>

ここに隠れたコンテンツを書きます。
Markdownの記法も使えます。

- リスト項目1
- リスト項目2

</details>`}
        />

        <h3>改行の挿入</h3>
        <CodeBlock
          language="markdown"
          code={`行末にスペース2つで改行
または<br>タグを使います。`}
        />

        <h3>画像サイズの指定</h3>
        <p>Markdown標準では画像サイズを指定できませんが、HTMLなら可能です。</p>
        <CodeBlock
          language="markdown"
          code={`<img src="image.png" alt="説明" width="300" height="200">`}
        />

        <h3>テキストの配置</h3>
        <CodeBlock
          language="markdown"
          code={`<div align="center">中央揃えのテキスト</div>

<p align="right">右寄せのテキスト</p>`}
        />

        <div className={styles.tip}>
          <strong>注意:</strong>{" "}
          HTMLブロック内のMarkdown記法が有効かどうかはパーサーにより異なります。GitHub等では
          <code>&lt;details&gt;</code>
          内の空行の後にMarkdownが有効になります。
        </div>
      </section>

      {/* GitHub Flavored Markdown拡張 */}
      <section>
        <h2 id="gfm-extensions">GitHub Flavored Markdown拡張</h2>
        <p>
          GitHub Flavored
          Markdown（GFM）は標準のMarkdownにいくつかの便利な拡張を追加しています。
        </p>

        <h3>タスクリスト</h3>
        <CodeBlock
          language="markdown"
          code={`- [x] 実装完了
- [x] テスト完了
- [ ] レビュー待ち
- [ ] デプロイ`}
        />

        <h3>絵文字</h3>
        <p>コロンで囲んだショートコードで絵文字を挿入できます。</p>
        <CodeBlock
          language="markdown"
          code={`:smile: :+1: :heart: :rocket: :warning:
:tada: :bug: :memo: :fire: :star:`}
        />

        <table className={styles.table}>
          <thead>
            <tr>
              <th>ショートコード</th>
              <th>絵文字</th>
              <th>用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>:bug:</code>
              </td>
              <td>{"🐛"}</td>
              <td>バグ修正</td>
            </tr>
            <tr>
              <td>
                <code>:sparkles:</code>
              </td>
              <td>{"✨"}</td>
              <td>新機能</td>
            </tr>
            <tr>
              <td>
                <code>:memo:</code>
              </td>
              <td>{"📝"}</td>
              <td>ドキュメント</td>
            </tr>
            <tr>
              <td>
                <code>:rocket:</code>
              </td>
              <td>{"🚀"}</td>
              <td>デプロイ・リリース</td>
            </tr>
            <tr>
              <td>
                <code>:warning:</code>
              </td>
              <td>{"⚠️"}</td>
              <td>注意・警告</td>
            </tr>
          </tbody>
        </table>

        <h3>脚注</h3>
        <CodeBlock
          language="markdown"
          code={`本文にこのように脚注を付けます[^1]。複数の脚注も可能です[^note]。

[^1]: 脚注の内容はここに書きます。
[^note]: 名前付きの脚注も使えます。`}
        />

        <h3>自動リンク</h3>
        <p>GFMではURLを直接書くだけで自動的にリンクになります。</p>
        <CodeBlock
          language="markdown"
          code={`https://github.com
https://example.com`}
        />

        <h3>取り消し線（GFM拡張）</h3>
        <CodeBlock
          language="markdown"
          code={`~~このテキストに取り消し線が引かれます~~`}
        />

        <h3>シンタックスハイライト付きdiff</h3>
        <p>
          コードブロックの言語に <code>diff</code>{" "}
          を指定すると差分表示ができます。
        </p>
        <CodeBlock
          language="markdown"
          code={`\`\`\`diff
- 削除された行
+ 追加された行
  変更のない行
\`\`\``}
        />

        <h3>アラート（GitHub独自拡張）</h3>
        <p>
          GitHubでは引用ブロック内に特定のキーワードを書くとアラート表示になります。
        </p>
        <CodeBlock
          language="markdown"
          code={`> [!NOTE]
> 参考情報や補足です。

> [!TIP]
> より良い方法のヒントです。

> [!IMPORTANT]
> 重要な情報です。

> [!WARNING]
> 注意が必要な情報です。

> [!CAUTION]
> 危険な操作に関する警告です。`}
        />

        <h3>メンションとイシュー参照</h3>
        <p>GitHub上では以下の記法で自動リンクが作成されます。</p>
        <CodeBlock
          language="markdown"
          code={`@username      ユーザーへのメンション
#123           イシューやPRへの参照
org/repo#123   別リポジトリのイシュー参照`}
        />
      </section>
    </div>
  );
}
