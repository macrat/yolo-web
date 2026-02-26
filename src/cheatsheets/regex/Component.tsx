import CodeBlock from "@/cheatsheets/_components/CodeBlock";

export default function RegexCheatsheet() {
  return (
    <div>
      <section>
        <h2 id="metacharacters">基本メタ文字</h2>
        <p>
          正規表現で特別な意味を持つ文字（メタ文字）の一覧です。これらの文字をリテラルとして使いたい場合は、バックスラッシュ（\）でエスケープします。
        </p>
        <table>
          <thead>
            <tr>
              <th>メタ文字</th>
              <th>意味</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>.</code>
              </td>
              <td>任意の1文字（改行を除く）</td>
              <td>
                <code>a.c</code> → abc, aXc
              </td>
            </tr>
            <tr>
              <td>
                <code>^</code>
              </td>
              <td>行頭</td>
              <td>
                <code>^Hello</code> → 行頭のHello
              </td>
            </tr>
            <tr>
              <td>
                <code>$</code>
              </td>
              <td>行末</td>
              <td>
                <code>world$</code> → 行末のworld
              </td>
            </tr>
            <tr>
              <td>
                <code>*</code>
              </td>
              <td>直前の文字の0回以上の繰り返し</td>
              <td>
                <code>ab*c</code> → ac, abc, abbc
              </td>
            </tr>
            <tr>
              <td>
                <code>+</code>
              </td>
              <td>直前の文字の1回以上の繰り返し</td>
              <td>
                <code>ab+c</code> → abc, abbc（acは不一致）
              </td>
            </tr>
            <tr>
              <td>
                <code>?</code>
              </td>
              <td>直前の文字の0回または1回</td>
              <td>
                <code>colou?r</code> → color, colour
              </td>
            </tr>
            <tr>
              <td>
                <code>\</code>
              </td>
              <td>次の文字をエスケープ</td>
              <td>
                <code>\.</code> → ピリオドそのもの
              </td>
            </tr>
            <tr>
              <td>
                <code>|</code>
              </td>
              <td>OR（選択）</td>
              <td>
                <code>cat|dog</code> → cat または dog
              </td>
            </tr>
            <tr>
              <td>
                <code>[]</code>
              </td>
              <td>文字クラス（いずれか1文字）</td>
              <td>
                <code>[abc]</code> → a, b, c のいずれか
              </td>
            </tr>
            <tr>
              <td>
                <code>()</code>
              </td>
              <td>グループ化・キャプチャ</td>
              <td>
                <code>(ab)+</code> → ab, abab
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# メタ文字の使用例
/a.c/      # abc, aXc, a1c にマッチ
/^Start/   # 行頭の Start にマッチ
/end$/     # 行末の end にマッチ
/https?/   # http または https にマッチ
/cat|dog/  # cat または dog にマッチ
/\\./      # ピリオドそのものにマッチ`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="quantifiers">量指定子</h2>
        <p>
          直前のパターンの繰り返し回数を指定します。デフォルトは貪欲（greedy）マッチで、できるだけ多くマッチします。
        </p>
        <table>
          <thead>
            <tr>
              <th>量指定子</th>
              <th>意味</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>*</code>
              </td>
              <td>0回以上</td>
              <td>
                <code>a*</code> → &quot;&quot;, a, aa, aaa
              </td>
            </tr>
            <tr>
              <td>
                <code>+</code>
              </td>
              <td>1回以上</td>
              <td>
                <code>a+</code> → a, aa, aaa
              </td>
            </tr>
            <tr>
              <td>
                <code>?</code>
              </td>
              <td>0回または1回</td>
              <td>
                <code>a?</code> → &quot;&quot;, a
              </td>
            </tr>
            <tr>
              <td>
                <code>{"{n}"}</code>
              </td>
              <td>ちょうどn回</td>
              <td>
                <code>{"a{3}"}</code> → aaa
              </td>
            </tr>
            <tr>
              <td>
                <code>{"{n,}"}</code>
              </td>
              <td>n回以上</td>
              <td>
                <code>{"a{2,}"}</code> → aa, aaa, aaaa
              </td>
            </tr>
            <tr>
              <td>
                <code>{"{n,m}"}</code>
              </td>
              <td>n回以上m回以下</td>
              <td>
                <code>{"a{2,4}"}</code> → aa, aaa, aaaa
              </td>
            </tr>
          </tbody>
        </table>

        <h3>貪欲（Greedy）と怠惰（Lazy）</h3>
        <p>
          量指定子の後に <code>?</code>{" "}
          を付けると、怠惰マッチになり、できるだけ少なくマッチします。
        </p>
        <CodeBlock
          code={`# 貪欲マッチ（デフォルト）
"<b>太字</b>と<b>強調</b>" に /<b>.*<\\/b>/ を適用
→ "<b>太字</b>と<b>強調</b>" 全体にマッチ

# 怠惰マッチ（?を追加）
"<b>太字</b>と<b>強調</b>" に /<b>.*?<\\/b>/ を適用
→ "<b>太字</b>" と "<b>強調</b>" に個別マッチ`}
          language="regex"
        />
        <table>
          <thead>
            <tr>
              <th>貪欲</th>
              <th>怠惰</th>
              <th>意味</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>*</code>
              </td>
              <td>
                <code>*?</code>
              </td>
              <td>0回以上（最小マッチ）</td>
            </tr>
            <tr>
              <td>
                <code>+</code>
              </td>
              <td>
                <code>+?</code>
              </td>
              <td>1回以上（最小マッチ）</td>
            </tr>
            <tr>
              <td>
                <code>?</code>
              </td>
              <td>
                <code>??</code>
              </td>
              <td>0回または1回（最小マッチ）</td>
            </tr>
            <tr>
              <td>
                <code>{"{n,m}"}</code>
              </td>
              <td>
                <code>{"{n,m}?"}</code>
              </td>
              <td>n回以上m回以下（最小マッチ）</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 id="character-classes">文字クラス</h2>
        <p>
          特定の種類の文字にマッチするショートハンドです。大文字にすると否定形になります。
        </p>
        <table>
          <thead>
            <tr>
              <th>パターン</th>
              <th>意味</th>
              <th>同等の表記</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>\d</code>
              </td>
              <td>数字</td>
              <td>
                <code>[0-9]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>\D</code>
              </td>
              <td>数字以外</td>
              <td>
                <code>[^0-9]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>\w</code>
              </td>
              <td>単語文字（英数字とアンダースコア）</td>
              <td>
                <code>[a-zA-Z0-9_]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>\W</code>
              </td>
              <td>単語文字以外</td>
              <td>
                <code>[^a-zA-Z0-9_]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>\s</code>
              </td>
              <td>空白文字（スペース、タブ、改行等）</td>
              <td>
                <code>[ \t\n\r\f\v]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>\S</code>
              </td>
              <td>空白文字以外</td>
              <td>
                <code>[^ \t\n\r\f\v]</code>
              </td>
            </tr>
          </tbody>
        </table>

        <h3>カスタム文字クラス</h3>
        <p>
          角括弧 <code>[]</code> で独自の文字クラスを定義できます。先頭に{" "}
          <code>^</code> を置くと否定になります。
        </p>
        <CodeBlock
          code={`[abc]      # a, b, c のいずれか
[a-z]      # 小文字アルファベット
[A-Z]      # 大文字アルファベット
[0-9]      # 数字
[a-zA-Z]   # すべてのアルファベット
[^abc]     # a, b, c 以外の文字
[a-z&&[^m-p]]  # a-z のうち m-p を除く（一部エンジン）`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="anchors">アンカー</h2>
        <p>
          文字そのものではなく、文字列中の位置にマッチします。文字を消費しない（ゼロ幅アサーション）のが特徴です。
        </p>
        <table>
          <thead>
            <tr>
              <th>アンカー</th>
              <th>意味</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>^</code>
              </td>
              <td>文字列（または行）の先頭</td>
              <td>
                <code>^abc</code> → 先頭のabc
              </td>
            </tr>
            <tr>
              <td>
                <code>$</code>
              </td>
              <td>文字列（または行）の末尾</td>
              <td>
                <code>abc$</code> → 末尾のabc
              </td>
            </tr>
            <tr>
              <td>
                <code>\b</code>
              </td>
              <td>単語境界</td>
              <td>
                <code>\bword\b</code> → 単語として独立したword
              </td>
            </tr>
            <tr>
              <td>
                <code>\B</code>
              </td>
              <td>単語境界以外</td>
              <td>
                <code>\Bword\B</code> → 単語の内部にあるword
              </td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# アンカーの使用例
/^#!/         # シェバン行の検出
/\\.js$/      # .js で終わるファイル名
/\\bcat\\b/   # "cat" に一致、"category" には不一致
/\\Bcat\\B/   # "education" の cat に一致、"cat" には不一致`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="groups">グループとキャプチャ</h2>
        <p>
          丸括弧でパターンをグループ化し、マッチした部分を後から参照できます。
        </p>
        <table>
          <thead>
            <tr>
              <th>構文</th>
              <th>意味</th>
              <th>例</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>(abc)</code>
              </td>
              <td>キャプチャグループ</td>
              <td>マッチ結果を後方参照可能</td>
            </tr>
            <tr>
              <td>
                <code>(?:abc)</code>
              </td>
              <td>非キャプチャグループ</td>
              <td>グループ化のみ（キャプチャしない）</td>
            </tr>
            <tr>
              <td>
                <code>{"(?<name>abc)"}</code>
              </td>
              <td>名前付きキャプチャ</td>
              <td>名前でマッチ結果を参照</td>
            </tr>
            <tr>
              <td>
                <code>\1, \2</code>
              </td>
              <td>後方参照</td>
              <td>キャプチャグループの内容を再利用</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# キャプチャグループの使用例
/(\\d{4})-(\\d{2})-(\\d{2})/
# "2026-02-19" → グループ1: "2026", グループ2: "02", グループ3: "19"

# 名前付きキャプチャ
/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/
# result.groups.year → "2026"

# 非キャプチャグループ
/(?:https?|ftp):\\/\\//
# プロトコル部分をグループ化するが、キャプチャしない

# 後方参照（同じ内容の繰り返し検出）
/(\\w+)\\s+\\1/
# "the the" にマッチ（重複単語の検出）`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="lookaround">先読みと後読み</h2>
        <p>
          文字を消費せずに、前後のパターンを条件として指定できます（ゼロ幅アサーション）。
        </p>
        <table>
          <thead>
            <tr>
              <th>構文</th>
              <th>名前</th>
              <th>意味</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>(?=abc)</code>
              </td>
              <td>肯定先読み（Lookahead）</td>
              <td>後ろにabcが続く位置</td>
            </tr>
            <tr>
              <td>
                <code>(?!abc)</code>
              </td>
              <td>否定先読み（Negative Lookahead）</td>
              <td>後ろにabcが続かない位置</td>
            </tr>
            <tr>
              <td>
                <code>{"(?<=abc)"}</code>
              </td>
              <td>肯定後読み（Lookbehind）</td>
              <td>前にabcがある位置</td>
            </tr>
            <tr>
              <td>
                <code>{"(?<!abc)"}</code>
              </td>
              <td>否定後読み（Negative Lookbehind）</td>
              <td>前にabcがない位置</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# 肯定先読み: 円記号の前の数値を取得
/\\d+(?=円)/
# "100円" → "100" にマッチ

# 否定先読み: .js 拡張子でないファイル名
/\\w+\\.(?!js$)\\w+/
# "app.ts" にマッチ、"app.js" には不一致

# 肯定後読み: ¥マークの後の数値を取得
/(?<=¥)\\d+/
# "¥1000" → "1000" にマッチ

# 否定後読み: Mr. でない敬称の後の名前
/(?<!Mr\\.)\\s[A-Z]\\w+/
# "Dr. Smith" の " Smith" にマッチ`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="flags">フラグ</h2>
        <p>
          正規表現の動作を変更するオプションです。パターンの末尾に指定します。
        </p>
        <table>
          <thead>
            <tr>
              <th>フラグ</th>
              <th>名前</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>g</code>
              </td>
              <td>global</td>
              <td>すべてのマッチを検索（最初の1つだけでなく）</td>
            </tr>
            <tr>
              <td>
                <code>i</code>
              </td>
              <td>case-insensitive</td>
              <td>大文字・小文字を区別しない</td>
            </tr>
            <tr>
              <td>
                <code>m</code>
              </td>
              <td>multiline</td>
              <td>
                <code>^</code> と <code>$</code> が各行の先頭・末尾にマッチ
              </td>
            </tr>
            <tr>
              <td>
                <code>s</code>
              </td>
              <td>dotAll</td>
              <td>
                <code>.</code> が改行文字にもマッチ
              </td>
            </tr>
            <tr>
              <td>
                <code>u</code>
              </td>
              <td>unicode</td>
              <td>Unicode対応（サロゲートペアを正しく扱う）</td>
            </tr>
            <tr>
              <td>
                <code>y</code>
              </td>
              <td>sticky</td>
              <td>lastIndexの位置からのみマッチを試行</td>
            </tr>
          </tbody>
        </table>
        <CodeBlock
          code={`# フラグの使用例（JavaScript）
/hello/i        # "Hello", "HELLO", "hello" にマッチ
/^line/gm       # 各行の先頭にある "line" をすべて検索
/a.b/s          # "a\\nb" にもマッチ（.が改行を含む）
/\\u{1F600}/u   # Unicode絵文字にマッチ

# 複数フラグの組み合わせ
/pattern/gi     # 大文字小文字無視 + 全マッチ検索`}
          language="regex"
        />
      </section>

      <section>
        <h2 id="common-patterns">よく使うパターン例</h2>
        <p>実務で頻繁に使われる正規表現パターンの一覧です。</p>

        <h3>メールアドレス</h3>
        <CodeBlock
          code={`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/
# user@example.com にマッチ`}
          language="regex"
        />

        <h3>URL</h3>
        <CodeBlock
          code={`/https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\/\\w\\-._~:?#\\[\\]@!$&'()*+,;=]*/
# https://example.com/path?q=1 にマッチ`}
          language="regex"
        />

        <h3>電話番号（日本）</h3>
        <CodeBlock
          code={`/0\\d{1,4}-\\d{1,4}-\\d{4}/
# 03-1234-5678, 090-1234-5678 にマッチ

# ハイフンなし・ありの両対応
/0\\d{9,10}/
# 09012345678 にマッチ`}
          language="regex"
        />

        <h3>日付</h3>
        <CodeBlock
          code={`# YYYY-MM-DD 形式
/\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])/
# 2026-02-19 にマッチ

# YYYY/MM/DD 形式
/\\d{4}\\/(?:0[1-9]|1[0-2])\\/(?:0[1-9]|[12]\\d|3[01])/
# 2026/02/19 にマッチ`}
          language="regex"
        />

        <h3>IPアドレス（IPv4）</h3>
        <CodeBlock
          code={`/(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)/
# 192.168.1.1 にマッチ`}
          language="regex"
        />

        <h3>郵便番号（日本）</h3>
        <CodeBlock
          code={`/\\d{3}-\\d{4}/
# 100-0001 にマッチ`}
          language="regex"
        />

        <h3>HTMLタグの除去</h3>
        <CodeBlock
          code={`/<[^>]+>/g
# "<p>テキスト</p>" → "テキスト"（置換時）`}
          language="regex"
        />

        <h3>パスワード強度チェック</h3>
        <CodeBlock
          code={`# 8文字以上、大文字・小文字・数字・記号をそれぞれ1つ以上含む
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$/`}
          language="regex"
        />
      </section>
    </div>
  );
}
