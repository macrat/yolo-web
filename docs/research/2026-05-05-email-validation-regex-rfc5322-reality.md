---
title: メールアドレス検証を正規表現でやるな — RFC 5322 の現実と実務的な二段構え戦略
date: 2026-05-05
purpose: ブログ記事「メールアドレス検証を正規表現でやるな」の根拠調査。RFC 5322/5321 の grammar の実態、よく出回る regex の問題点、誤排除される現実のメアド例、実務的ベストプラクティス、反証可能性の確認。
method: RFC 5321/5322 一次文書の直接取得 (curl)、WHATWG HTML仕様、OWASP、GitHub CVE事例、権威的ブログ記事、WTForms/Zod 等のライブラリバグ事例の調査
sources:
  - https://www.ietf.org/rfc/rfc5321.txt
  - https://www.rfc-editor.org/rfc/rfc5322
  - https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)
  - https://datatracker.ietf.org/doc/html/rfc3696
  - https://haacked.com/archive/2007/08/21/i-knew-how-to-validate-an-email-address-until-i.aspx/
  - https://www.regular-expressions.info/email.html
  - https://colinhacks.com/essays/reasonable-email-regex
  - https://codeopinion.com/regex-for-email-validation-think-again/
  - https://baymard.com/blog/validations-vs-warnings
  - https://github.com/colinhacks/zod/pull/2824
  - https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS
  - https://github.com/wtforms/wtforms/issues/95
  - http://quetzalcoatal.blogspot.com/2013/12/why-email-is-hard-part-4-email-addresses.html
  - https://news.ycombinator.com/item?id=12449493
  - https://www.ditig.com/characters-allowed-in-email-addresses
---

## サマリ（400字以内）

RFC 5322 のメールアドレス grammar は、ネスト可能なコメント（CFWS）を含むため文脈自由文法（context-free）に属し、正規表現では完全に表現できない。仮に近似的な正規表現を書いても、新gTLD（`.photography` 等）・プラスエイリアス（`user+tag@gmail.com`）・quoted-string（`"user name"@example.com`）・IDN など正当なアドレスを誤排除し続ける。さらに複雑な regex はネスト量指定子による ReDoS（CVE-2023-4316 等）の温床となる。実務的な解は「@ の存在とドメイン部の最低限チェック」という薄い形式フィルタ＋メール送信による実在確認（double opt-in）の二段構えであり、これは WHATWG 自身が HTML 仕様に明記した設計思想とも一致する。

---

## 1. RFC 5322 / RFC 5321 のメールアドレス grammar の現実

### 1-1. RFC 5322 の addr-spec ABNF（一次情報）

出典: [RFC 5322 Section 3.4.1](https://www.rfc-editor.org/rfc/rfc5322)

```
addr-spec       =   local-part "@" domain

local-part      =   dot-atom / quoted-string / obs-local-part

domain          =   dot-atom / domain-literal / obs-domain

domain-literal  =   [CFWS] "[" *([FWS] dtext) [FWS] "]" [CFWS]

dot-atom        =   [CFWS] dot-atom-text [CFWS]
dot-atom-text   =   1*atext *("." 1*atext)

atext           =   ALPHA / DIGIT /
                    "!" / "#" / "$" / "%" / "&" / "'" / "*" /
                    "+" / "-" / "/" / "=" / "?" / "^" / "_" /
                    "`" / "{" / "|" / "}" / "~"

quoted-string   =   [CFWS] DQUOTE *([FWS] qcontent) [FWS] DQUOTE [CFWS]
qcontent        =   qtext / quoted-pair
qtext           =   %d33 / %d35-91 / %d93-126 / obs-qtext
```

**CFWS（Comment and Folding White Space）の問題**: `local-part` と `domain` の前後に `[CFWS]` が置ける。CFWS はネスト可能なコメント `( ... ( ... ) ... )` を含む。このネスト構造の検証には push-down automaton（文脈自由文法）が必要であり、正規表現（有限オートマトン）では原理的に表現不可能。

出典（技術議論）: [Hacker News id=12449493](https://news.ycombinator.com/item?id=12449493)

> "pair-balancing is impossible with regular expressions, since matching pairs requires push-down automata."
> 例として `(this (is (a (heavily (commented (email))))))foo@bar.example` は RFC 5322 上の正当なアドレス。

### 1-2. RFC 5321 の Mailbox ABNF（一次情報）

出典: [RFC 5321 Section 4.1.2](https://www.ietf.org/rfc/rfc5321.txt)（curl で直接取得）

```
Mailbox        = Local-part "@" ( Domain / address-literal )

Local-part     = Dot-string / Quoted-string
               ; MAY be case-sensitive

Dot-string     = Atom *("."  Atom)
Atom           = 1*atext

Quoted-string  = DQUOTE *QcontentSMTP DQUOTE
QcontentSMTP   = qtextSMTP / quoted-pairSMTP
quoted-pairSMTP  = %d92 %d32-126
qtextSMTP      = %d32-33 / %d35-91 / %d93-126

Domain         = sub-domain *("." sub-domain)
sub-domain     = Let-dig [Ldh-str]
Let-dig        = ALPHA / DIGIT
Ldh-str        = *( ALPHA / DIGIT / "-" ) Let-dig
```

RFC 5321 の Local-part は RFC 5322 より単純（`obs-local-part` がなく、CFWS も存在しない）。ただし `Quoted-string` 内では任意の ASCII グラフィック文字（スペース含む）が使える。

**RFC 5321 自身の記述**:

> "While the above definition for Local-part is relatively permissive, for maximum interoperability, a host that expects to receive mail SHOULD avoid defining mailboxes where the Local-part requires (or uses) the Quoted-string form."

つまり SMTP 規格自身が「quoted-string を使うメアドは推奨しない」と述べている。技術的に有効だが、現実には多くのシステムが拒否する。

### 1-3. RFC 5322 と RFC 5321 の主な差異

| 観点             | RFC 5322                | RFC 5321                                |
| ---------------- | ----------------------- | --------------------------------------- |
| 対象             | メッセージヘッダの書式  | SMTP エンベロープ（MAIL FROM, RCPT TO） |
| CFWS（コメント） | あり（ネスト可）        | なし                                    |
| obs-local-part   | あり（後方互換）        | なし                                    |
| domain-literal   | IP アドレスリテラル含む | IPv4/IPv6 address-literal               |
| 実用上の制約     | 緩い（理論上）          | より厳格（SMTP 実装上）                 |

### 1-4. ローカルパートで使える特殊文字

RFC 5322 `atext` で定義される特殊文字: `! # $ % & ' * + - / = ? ^ _ ` { | } ~`

RFC 3696 Section 3 の例示:

- `user+mailbox@example.com` — プラスエイリアス（RFC 準拠、広く使用）
- `customer/department=shipping@example.com` — スラッシュ・イコール
- `$A12345@example.com` — ドル記号
- `!def!xyz%abc@example.com` — 感嘆符・パーセント
- `_somename@example.com` — アンダースコア

出典: [RFC 3696 Section 3](https://datatracker.ietf.org/doc/html/rfc3696)

Quoted-string を使えば `" "@example.org`（スペース含むローカルパート）も技術的に有効。

---

## 2. よく出回っている「メアド検証用」正規表現の問題点

### 2-1. HTML5 `<input type="email">` の WHATWG 正規表現

出典: [WHATWG HTML Living Standard](<https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)>)

WHATWG 仕様に明記されている正規表現:

```
/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
```

仕様書の注記:

> "This requirement is a willful violation of RFC 5322, which defines a syntax for email addresses that is simultaneously too strict (before the '@' character), too vague (after the '@' character), and too lax (allowing comments, whitespace characters, and quoted strings in manners unfamiliar to most users) to be of practical use here."

**意図的な RFC 5322 違反**であると仕様書自身が明言している。設計上、quoted-string ローカルパート・IP リテラルドメイン・CFWS を全て排除している。

### 2-2. Stack Overflow 等でよく見られる正規表現とその問題

#### パターン A: 基本的な regex

```
\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b
```

**取りこぼす例**: `user@example.museum`（TLD 6文字）、新gTLD 全般。

#### パターン B: TLD 長制限付き

```
^[A-Z0-9._%+\-]+@(?:[A-Z0-9\-]+\.)+[A-Z]{2,4}$
```

**誤排除する例**: `.photography`（12文字）、`.versicherung`（13文字）など。

**実際のバグ事例**: WTForms (Python) は `^.+@[^.].*\.[a-z]{2,10}$` を使用しており `.photography` などを拒否。2014年にバグ報告。
出典: [GitHub wtforms/wtforms issue #95](https://github.com/wtforms/wtforms/issues/95)

#### パターン C: ReDoS に脆弱な regex（Zod ライブラリの事例）

脆弱な正規表現:

```
^([A-Z0-9_+-]+\.?)*[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$
```

`([A-Z0-9_+-]+\.?)*` の部分がネスト量指定子となり、マッチ失敗時に指数関数的なバックトラッキングが発生。

実測値:

- 23 文字: 0.615 秒
- 26 文字: 2.280 秒
- 28 文字: 18.018 秒

CVE-2023-4316 として登録。修正は [zod PR #2824](https://github.com/colinhacks/zod/pull/2824) で negative lookahead に書き換えることで対処。

Vaadin の EmailField でも同種の脆弱性が CVE-2021-31405 として登録されている。

OWASP ReDoS のドキュメントに掲載されている「evil regex」の例:

```
^([a-zA-Z0-9])(([\-.]|[_]+)?([a-zA-Z0-9]+))*(@){1}[a-z0-9]+[.]{1}(([a-z]{2,3})|([a-z]{2,3}[.]{1}[a-z]{2,3}))$
```

出典: [OWASP ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)

---

## 3. 正規表現が誤排除する現実のメアドの具体例

### 3-1. プラスエイリアス（最も影響が大きい）

`user+tag@gmail.com` — Gmail が公式にサポートするフィルタリング機能。RFC 5322 の `atext` に `+` が含まれており技術的に完全に正当。

実態調査結果: 約50%のウェブサービスがプラス記号を含むメアドを拒否するという報告あり（Quora での体験報告の集計）。
出典: [Quora: Why do so many sign-up forms reject emails with a plus sign?](https://www.quora.com/Why-do-so-many-sign-up-forms-reject-emails-with-a-plus-sign-in-them)

Baymard Institute の UX 調査でも、大手 EC サイト（年商 5,000 万ドル以上）3社が `+` を含むメアドを拒否していたことが確認されている。
出典: [Baymard: Validations vs. Warnings](https://baymard.com/blog/validations-vs-warnings)

CodeOpinion の著者（Derek Comartin）も `derek+youtube@codeopinion.com` が多くのサービスで拒否されたと実体験を報告。
出典: [CodeOpinion: Regex for Email Validation? Think Again!](https://codeopinion.com/regex-for-email-validation-think-again/)

### 3-2. 新 gTLD（TLD 長制限を持つ regex で弾かれる）

かつて TLD は 2〜4 文字が主流だったが、ICANN が新 gTLD プログラムを開始して以降、長いTLDが多数登場。

- `.photography` （12文字）
- `.versicherung` （13文字）
- `.xn--c1avg` （国際化TLD）
- `.museum` （6文字）

TLD を `[a-z]{2,4}` で制限する regex は `.museum` ですら弾く。`[a-z]{2,10}` でも `.photography` を弾く。正しくは DNS ラベルの上限 63 文字まで許容すべき。

WTForms の実際のバグレポートでは「正しいTLD長は2〜63文字」として修正案が提示された（`[\-\w]{2,63}$`）。

### 3-3. 国際化ドメイン名（IDN）

RFC 6530/6531 (2012年) で定義される国際化メールアドレス（EAI: Email Address Internationalization）。

`user@日本語.jp` のような形式はメール送信時には Punycode（`xn--wgv71a309e.jp`）に変換されるが、アドレス入力フォームでは非ASCII文字が使われる。ASCII のみを許可する regex（`[a-zA-Z0-9]` など）はこれを全て拒否する。

Gmail は RFC 6531 準拠（SMTPUTF8 サポート）を発表済み。

出典: [RFC 6530](https://www.rfc-editor.org/rfc/rfc6530), [Microsoft Learn: EAI](https://learn.microsoft.com/en-us/globalization/reference/eai)

### 3-4. quoted-string ローカルパート

`"user name"@example.com` — スペースを含む quoted-string ローカルパートは RFC 5321 技術上有効。しかし WHATWG は「ユーザーが見慣れない」として意図的に除外。ほぼすべての一般的な regex が弾く。

`"Abc@def"@example.com` — `@` を含む quoted-string。極めて珍しいが RFC 準拠。

### 3-5. IP リテラルドメイン

`user@[192.168.1.1]` — IPv4 アドレスリテラル。企業内 LAN や開発環境での SMTP テストで使用される。RFC 5321 で正式に定義。`user@[IPv6:::1]` も同様。

### 3-6. アポストロフィ・ハイフン

`o'brien@example.com` — アポストロフィ `'` は RFC 5322 の `atext` に含まれる（`&` `'` `*` が含まれる）。多くの regex が英数字・ドット・ハイフンのみを許可し弾く。

`mary-jane@example.com` — ハイフンは `atext` に含まれるため有効。これを弾く regex は少ないが、`[a-zA-Z0-9._%+]` のみ許可する strict な regex は弾く。

出典: [ditig.com: Characters allowed in email addresses](https://www.ditig.com/characters-allowed-in-email-addresses)

### 3-7. 単一ラベル TLD（企業内 LAN）

`user@localhost` — RFC 5321 では `Domain = sub-domain *("." sub-domain)` でドットが必須ではないため、`localhost` はドメインとして構文上有効。企業内メールリレーや開発環境で使われる。

ドメインに `.` が必須と仮定する多くの validator が拒否する。

---

## 4. 実務でのメアド検証ベストプラクティス

### 4-1. WHATWG の明示的立場

HTML5 の `<input type="email">` の設計は「RFC 5322 の意図的な違反」として、実用的なサブセットに絞ることを選択。その regex は「@ が含まれ、ドメイン部に少なくとも一つのラベルがある」程度を確認するに留まる。

> "This requirement is a willful violation of RFC 5322"
> — WHATWG HTML Living Standard

### 4-2. 権威的なソースの推奨

**regular-expressions.info（著者: Jan Goyvaerts）**:

> "Don't go overboard in trying to eliminate invalid email addresses with your regular expression. [...] The only real way to validate an email address is to try to send an email to it."

出典: [How to Find or Validate an Email Address](https://www.regular-expressions.info/email.html)

**Phil Haack のブログ（2007年）**:
RFC 2821/2822 を読んで「ローカルパートに使える文字がこんなに多いとは知らなかった」と認め、「ほぼすべての web 上の正規表現は厳しすぎる」と結論。

出典: [I Knew How To Validate An Email Address Until I Read The RFC](https://haacked.com/archive/2007/08/21/i-knew-how-to-validate-an-email-address-until-i.aspx/)

**quetzalcoatal.blogspot.com（2013年）**:

> "Send an email to the purported address and ask the user to click on a unique link." (Skip validation entirely. The only reliable method is confirming via email.)

出典: [Why email is hard, part 4: Email addresses](http://quetzalcoatal.blogspot.com/2013/12/why-email-is-hard-part-4-email-addresses.html)

### 4-3. 推奨される二段構えアプローチ

**第1段: ラフな形式チェック**

目的: 明らかな入力ミスをユーザーにすぐフィードバックする（UX）。

推奨するチェック項目（regex ではなく個別ロジックで実装）:

1. `@` が1つ含まれるか
2. `@` の前（ローカルパート）が空でないか
3. `@` の後（ドメイン部）に少なくとも1つの `.` があるか
4. ローカルパートが64文字以下か（RFC 5321 の上限）
5. ドメインが255文字以下か（RFC 5321 の上限）

**拒否してはいけないもの**: `+`、`'`、`!`、`#`、`/`、`=`、`?`、`^`、`_`、`` ` ``、`{`、`}`、`|`、`~`

**第2段: メール送信による実在確認（double opt-in）**

ユニークなトークンを含む確認リンクをメール送信し、ユーザーがクリックして初めて「このアドレスは実在し、本人が受信できる」と確認できる。これのみが実際のメール到達性を保証する唯一の手段。

### 4-4. バリデーション vs. ウォーニングの設計原則

Baymard Institute の UX 研究:

- **バリデーション（拒否）**: 実装が100%正確な場合のみ使用（例: `@` が全くないケース）
- **ウォーニング（警告＋続行可能）**: 「`+` が含まれています。本当によいですか？」のようなケース。誤排除リスクがある場合は拒否しない。

出典: [Baymard: Form Usability: Validations vs Warnings](https://baymard.com/blog/validations-vs-warnings)

### 4-5. ライブラリ実装の実態

**email-validator (npm)**（layered approach の例）:

1. null チェック
2. `@` が1つだけであることを確認（`split('@').length === 2`）
3. ローカルパート ≤ 64文字（RFC 準拠の長さチェック）
4. ドメイン ≤ 255文字
5. 各ドメインラベル ≤ 63文字
6. 最後に文字種チェックの regex

複数のロジックに分解しており、単一の regex ではない。

出典: [GitHub: manishsaraan/email-validator](https://github.com/manishsaraan/email-validator)

---

## 5. 反証可能性の確認 — 正規表現で十分な場面

### 5-1. regex が合理的な場面

| 用途                                                  | 理由                             |
| ----------------------------------------------------- | -------------------------------- |
| 入力欄の即時フィードバック（「@が含まれていません」） | 偽陰性のリスクが低い単純チェック |
| ログ解析でメアドっぽい文字列を抽出                    | 誤排除しても大きな損失がない     |
| モックデータ生成                                      | 実在するアドレスである必要がない |
| CSV インポート時の明らかな形式エラー検出              | 「警告」として表示し拒否はしない |

### 5-2. それでも「警告」設計が望ましい理由

仮にログ解析やサジェスト用途であっても、「弾く」設計より「フラグを立てる」設計の方が健全。なぜなら:

- 設計者が RFC の全特殊文字を把握していることはほぼなく、必ず何かを見落とす
- regex は将来の新gTLD追加・IDN普及・サービス仕様変更によって陳腐化する
- 「拒否」より「警告」の方がユーザーの離脱率を下げる（Baymard の研究）

---

## 6. yolos.net Email Validator ツールとの関連

`/src/tools/email-validator/logic.ts` は以下の設計を採っている:

- **単一 regex ではなく個別チェックの積み上げ**:
  - `@` の数チェック（`lastIndexOf` を使用）
  - ローカルパートの先頭・末尾ドット禁止（別ロジック）
  - ドット連続禁止（別ロジック）
  - 64文字・255文字・63文字の各長さチェック（別ロジック）
  - 最後に文字種確認の regex（`/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/`）

- **errors / warnings / suggestions の3層**:
  - `+` など「uncommon but valid」な文字は `errors` ではなく `warnings` に分類（拒否しない）
  - typo サジェスト（`gmial.com` → `gmail.com`）を `suggestions` として分離

この設計は「regex 1本で判断しない」「拒否より警告を優先」という本記事の主張と一致する。

---

## 主要出典一覧

- [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322) — addr-spec ABNF の一次情報
- [RFC 5321: Simple Mail Transfer Protocol](https://www.ietf.org/rfc/rfc5321.txt) — Mailbox ABNF の一次情報（Section 4.1.2）
- [RFC 3696: Application Techniques for Checking and Transformation of Names](https://datatracker.ietf.org/doc/html/rfc3696) — 実用的なメアド検証ガイダンス
- [RFC 6530: Overview and Framework for Internationalized Email](https://www.rfc-editor.org/rfc/rfc6530) — IDN メールアドレスの定義
- [WHATWG HTML Living Standard: input type=email](<https://html.spec.whatwg.org/multipage/input.html#email-state-(type=email)>) — "willful violation of RFC 5322" の明記
- [GitHub: WHATWG html issue #1465](https://github.com/whatwg/html/issues/1465) — RFC 5322 準拠の議論（クローズ済み）
- [Hacker News: id=12449493](https://news.ycombinator.com/item?id=12449493) — RFC 5322 grammar が context-free である技術的根拠
- [Phil Haack: I Knew How To Validate An Email Address Until I Read The RFC](https://haacked.com/archive/2007/08/21/i-knew-how-to-validate-an-email-address-until-i.aspx/) — ローカルパート特殊文字の実例
- [regular-expressions.info: Email](https://www.regular-expressions.info/email.html) — regex の限界と推奨アプローチ
- [colinhacks.com: reasonable-email-regex](https://colinhacks.com/essays/reasonable-email-regex) — 実用的 regex の設計方針
- [CodeOpinion: Regex for Email Validation? Think Again!](https://codeopinion.com/regex-for-email-validation-think-again/) — `+` 記号の誤排除の実体験
- [Baymard Institute: Validations vs Warnings](https://baymard.com/blog/validations-vs-warnings) — UX 研究（`+` を弾く大手EC3社の事例）
- [OWASP: ReDoS](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS) — 脆弱な email regex の事例
- [Zod PR #2824: fix ReDoS in email regex](https://github.com/colinhacks/zod/pull/2824) — CVE-2023-4316 の詳細と修正
- [WTForms issue #95: Email Validator Regex doesn't accept new TLDs](https://github.com/wtforms/wtforms/issues/95) — `.photography` 等の TLD 問題
- [quetzalcoatal.blogspot.com: Why email is hard, part 4](http://quetzalcoatal.blogspot.com/2013/12/why-email-is-hard-part-4-email-addresses.html) — 「検証せず確認メールを送れ」という結論
- [ditig.com: Characters allowed in email addresses](https://www.ditig.com/characters-allowed-in-email-addresses) — `' "` を含む現実のアドレス例
- [Quora: Why do so many sign-up forms reject plus sign?](https://www.quora.com/Why-do-so-many-sign-up-forms-reject-emails-with-a-plus-sign-in-them) — 約50%のサービスが `+` を拒否
- [Wikipedia: International email](https://en.wikipedia.org/wiki/International_email) — RFC 6530/6531 の概要
- [GitHub: manishsaraan/email-validator](https://github.com/manishsaraan/email-validator) — 複数チェック分解の実装例
