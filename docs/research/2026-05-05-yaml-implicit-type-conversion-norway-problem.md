---
title: YAML 暗黙の型変換 — Norway Problem・数値リテラル・null・パーサー別挙動の総合調査
date: 2026-05-05
purpose: ブログ記事「YAML で 1.0 も no も書いた通りには読まれない — 暗黙の型変換に騙されない書き方」の根拠固め
method: |
  yaml.org 一次仕様・各パーサーの GitHub Issues・Ruud van Asseldonk 氏のブログ記事・
  ASCII News 2026 年報告・philna.sh JavaScript 版記事など複数の一次資料を横断調査
sources:
  - https://yaml.org/type/bool.html
  - https://yaml.org/type/int.html
  - https://yaml.org/type/float.html
  - https://yaml.org/type/null.html
  - https://yaml.org/type/timestamp.html
  - https://yaml.org/spec/1.2.2/
  - https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell
  - https://philna.sh/blog/2023/02/02/yaml-document-from-hell-javascript-edition/
  - https://www.bram.us/2022/01/11/yaml-the-norway-problem/
  - https://hitchdev.com/strictyaml/why/implicit-typing-removed/
  - https://ascii.co.uk/news/article/news-20260118-2768a796/yaml-norway-problem-persists-despite-v12-spec-fix
  - https://github.com/yaml/pyyaml/issues/376
  - https://github.com/yaml/pyyaml/issues/613
  - https://github.com/yaml/pyyaml/issues/116
  - https://github.com/yaml/libyaml/issues/20
  - https://github.com/go-yaml/yaml/issues/214
  - https://github.com/go-yaml/yaml/issues/523
  - https://github.com/kubernetes/kubernetes/issues/88564
  - https://blogs.perl.org/users/tinita/2018/03/strings-in-yaml---to-quote-or-not-to-quote.html
  - https://www.yaml.info/learn/quote.html
---

## サマリー（400字以内）

YAML 1.1 仕様は `yes/no/on/off/y/n`（大文字小文字変形を含む全22種）を真偽値として解釈する。国コード `NO`（ノルウェー）が `false` になる「Norway Problem」は最も有名な被害例だが、`1.0` のような版番号が float → 整数として丸め込まれる問題、`010` が 8 進数に解釈される問題、`2024-01-15` が日付型になる問題、`Null` が null になる問題も同根である。YAML 1.2（2009年）では真偽値を `true/false` のみに縮小したが、PyYAML・LibYAML・SnakeYAML（初代）・go-yaml v2 は 2026 年時点でも YAML 1.1 互換動作をデフォルトとしており、仕様改訂の恩恵は限定的。根本的対処は「型変換が起きそうな値は全てクォートする」ことだが、可読性とのトレードオフは存在する。

---

## 1. YAML 1.1 と 1.2 の真偽値仕様の違い

### 1.1 仕様（yaml.org/type/bool.html）

YAML 1.1 のタグ `tag:yaml.org,2002:bool`（shorthand: `!!bool`）は以下 22 種の文字列を真偽値として解釈すると規定している（yaml.org type registry より）。

**true として解釈される文字列:**
`y` `Y` `yes` `Yes` `YES` `true` `True` `TRUE` `on` `On` `ON`

**false として解釈される文字列:**
`n` `N` `no` `No` `NO` `false` `False` `FALSE` `off` `Off` `OFF`

仕様の文言: "Booleans are formatted as English words ('true'/'false', 'yes'/'no' or 'on'/'off') for readability and may be abbreviated as a single character 'y'/'n' or 'Y'/'N'."

正規表現パターン（仕様書記載）:

```
y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF
```

一次情報: https://yaml.org/type/bool.html

### 1.2 仕様（Core Schema）

YAML 1.2（2009年策定、2021年10月に 1.2.2 として改訂）では、Core Schema において真偽値を `true` と `false`（大文字小文字バリアントを含む）のみに縮小した。YAML 1.2 の主要目的の一つは「JSON の厳格なスーパーセット化」であり、`yes/no/on/off` といった非 JSON 表現を排除した。

YAML 1.2.2 仕様書: "Its primary focus was making YAML a strict superset of JSON. It also removed many of the problematic implicit typing recommendations."

Core Schema における boolean の正規表現:

- true: `true | True | TRUE`
- false: `false | False | FALSE`

一次情報: https://yaml.org/spec/1.2.2/

**仕様改訂の経緯の重要なポイント**: YAML 1.2 仕様は 2009 年に策定されたが、主要パーサーの多くは 2026 年時点で依然として YAML 1.1 互換動作をデフォルトとしている（後述）。仕様上の問題は 15 年以上前に解決されているが、実装が追いついていない。

---

## 2. The Norway Problem の実例と背景

### 具体的な被害例

YAML 1.1 において国コード `NO`（ノルウェー）が `false` として解釈される問題。

```yaml
countries:
  - dk
  - fi
  - is
  - no # ← ここが false に変換される
  - se
```

PyYAML で safe_load した結果:

```python
{'countries': ['dk', 'fi', 'is', False, 'se']}
```

Ruud van Asseldonk 氏（2023年1月の "The yaml document from hell"）はこの問題を次のように説明している: "The literals `off`, `no`, and `n`, in various capitalizations ... are all `false` in yaml 1.1."

出典: https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell

### 実害事例

- **ノルウェーユーザーのログイン障害**: ある開発者が3時間かけてデバッグした結果、国フィルターが文字列 "NO" を受け取るべきところ boolean false を受け取っていたことが判明した（実際の障害事例として報告）。
- **Hitchdev/StrictYAML の実例**: PyYAML に設定ファイルを渡した際、`countries: [GB, IE, FR, DE, NO]` が `{'countries': ['GB', 'IE', 'FR', 'DE', False]}` に変換されてサイト障害が発生した。

出典: https://hitchdev.com/strictyaml/why/implicit-typing-removed/

### GitHub Actions における `on:` キー問題

GitHub Actions のワークフロー設定は最上位キーとして `on:` を使用するが、これが YAML 1.1 パーサーで `true` に変換される問題がある。

```yaml
on:
  push:
    branches: [main]
```

go-yaml v2 で上記を解析すると、`on` キーが boolean `true` に変換され、JSON に直すと `{true: {push: {branches: [main]}}}` という構造になる。GitHub Actions 自体はこの問題を内部で処理しているが、ワークフローファイルをプログラム的に解析するツールでは問題が顕在化する（go-yaml issue #523 参照）。

出典: https://github.com/go-yaml/yaml/issues/523

---

## 3. 数値リテラルの暗黙変換

### 3.1 `1.0` が float として解釈される問題

YAML 1.1 の float 型仕様（`tag:yaml.org,2002:float`）では、`1.0` のような小数点付きの数値は浮動小数点数として解釈される。問題は、`1.0` という float を内部的に格納すると、多くの言語・パーサーでシリアライズ時に `1`（整数表記）として出力されてしまうことだ。

**Jekyll での実例**: Jekyll の YAML フロントマターで `version: 1.0` と記述しても、`!!str` タグで文字列を明示しようとしても float に変換され、HTML 出力では `1` になってしまうという問題が報告されている（jekyll/jekyll issue #3206）。

**go-yaml での実例**（go-yaml issue #430, #671）: `1.0` や `3.0` などの「整数と同値の float」が、整数として扱われ小数点が失われる問題が報告されている。

バージョン番号に `1.0` を使っている場合は必ず `"1.0"` とクォートすること。

一次情報: https://yaml.org/type/float.html

### 3.2 8進数・16進数の暗黙解釈（YAML 1.1）

YAML 1.1 の int 型仕様（`tag:yaml.org,2002:int`）では以下の形式が暗黙的に整数として解釈される:

| 表記     | 解釈               |
| -------- | ------------------ |
| `010`    | 8進数 → 10進数 8   |
| `0x1F`   | 16進数 → 10進数 31 |
| `0b1010` | 2進数 → 10進数 10  |

**YAML 1.2 との違い**: YAML 1.2 では 8 進数プレフィックスが `0o` に変更された（`0o10` = 8）。YAML 1.1 の `0` プレフィックスによる 8 進数解釈は廃止されたが、YAML 1.1 互換パーサーでは引き続き発生する。

Symfony の issue（symfony/symfony #34807）では、PHP 7.4 の YAML パーサーが `010` を 8 と解釈し、バージョン番号として記述した値が意図せず変換される問題が報告されている。

一次情報: https://yaml.org/type/int.html

### 3.3 sexagesimal（60進数）数値

YAML 1.1 では `:` 区切りの数値が 60 進数として解釈される。float 型仕様にも明記されている。

**Ruud van Asseldonk 氏の実例**:

```yaml
port_mapping:
  - 22:22
  - 80:80
  - 443:443
```

PyYAML で解析した結果:

```python
{"port_mapping": [1342, "80:80", "443:443"]}
```

`22:22` → `22×60 + 22 = 1342` として解釈される。`80:80` と `443:443` は各コンポーネントが 60 以上のため整数解釈されない（YAML 1.1 の sexagesimal 仕様では 0-59 のコンポーネントのみ対象）。

Docker Compose の公式ドキュメントもこの問題を認識しており、「HOST:CONTAINER 形式のポートマッピングは常にクォートして文字列として指定すること」と明記している。

一次情報: https://yaml.org/type/float.html (sexagesimal float の仕様記載)

### 3.4 ISO 8601 風日付文字列が日付型に変換される問題

YAML 1.1 では `tag:yaml.org,2002:timestamp` 型が定義されており、以下の形式が暗黙的に日付・タイムスタンプとして解釈される:

```yaml
canonical: 2001-12-15T02:59:43.1Z
iso8601: 2001-12-14t21:59:43.10-05:00
date: 2002-12-14 # ← 日付のみの形式も対象
```

`date: 2002-12-14` のような値は UTC の `datetime(2002, 12, 14, 0, 0, 0)` として解釈される。バージョン管理システムやブログ frontmatter でリリース日を文字列として持ちたい場合、クォートしなければ日付オブジェクトになる。

PyYAML の issue #637 でもこの問題が議論されている。

一次情報: https://yaml.org/type/timestamp.html

---

## 4. null の表現と暗黙変換

### YAML 1.1 の null 型仕様

`tag:yaml.org,2002:null`（shorthand: `!!null`）として以下が null として解釈される:

- `null` `Null` `NULL` — 明示的な null キーワード
- `~` — 正規表現（canonical form）
- 空の値（何も書かれていない状態）

仕様文言: "A null is different from an empty string and a mapping entry with some key and a null value is valid and different from not having that key in the mapping."

一次情報: https://yaml.org/type/null.html

### `key:` と `key: ""` の重要な違い

```yaml
key1: # ← null（Pythonでは None）
key2: "" # ← 空文字列 ""
key3: ~ # ← null
key4: null # ← null
```

`key1:` の末尾に何も書かない場合、Ansible など多くのツールでは `None` として扱われ、`default` フィルターで置換されない。`""` と明示することで空文字列として扱われる。

### Null 姓問題

「Christopher Null」のような固有名詞が YAML で `null` に変換される問題。ソフトウェア一般の問題として知られているが（Wired のライター Christoph Null 氏の報告）、YAML でも `surname: Null` と書くと `{'surname': None}` として解釈される。解決策はクォート（`surname: "Null"`）のみ。

---

## 5. 各言語パーサーの挙動差

### パーサー別の YAML バージョン対応と Norway Problem 発生可否

| パーサー                 | 言語               | デフォルトの YAML バージョン | Norway Problem 発生 | 備考                                                                                                      |
| ------------------------ | ------------------ | ---------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------- |
| PyYAML                   | Python             | 1.1                          | **発生する**        | safe_load でも YAML 1.1 挙動。2017年から YAML 1.2 対応要望 issue が open                                  |
| ruamel.yaml              | Python             | **1.2**                      | 発生しない          | YAML 1.2 デフォルト。`yes/no/on/off` は文字列扱い                                                         |
| go-yaml v2               | Go                 | 1.1                          | **発生する**        | `yes/no/on/off` を boolean として解釈                                                                     |
| go-yaml v3               | Go                 | 1.2（一部 1.1 互換）         | 部分的              | typed field に decode する場合のみ YAML 1.1 boolean を受け付ける。`map[string]interface{}` では文字列扱い |
| SnakeYAML（Java）        | Java               | 1.1                          | **発生する**        | Spring Boot・Kubernetes Java クライアントで利用。`yes/No/ON/off` などを boolean 変換                      |
| snakeyaml-engine（Java） | Java               | **1.2**                      | 発生しない          | SnakeYAML の新世代版。YAML 1.2 準拠                                                                       |
| js-yaml                  | JavaScript/Node.js | **1.2**                      | 発生しない          | `yes/no/on/off` は文字列扱い                                                                              |
| yaml（eemeli/yaml）      | JavaScript/Node.js | **1.2**                      | 発生しない          | YAML 1.1 モードをオプションで選択可能                                                                     |
| LibYAML（C）             | C                  | 1.1                          | **発生する**        | 2016年から YAML 1.2 対応 issue が open（未解決）                                                          |

**重要な構造的問題**: PyYAML は内部で LibYAML（C ライブラリ）を使用しており、LibYAML の YAML 1.2 対応 issue が 2016 年から未解決のため、PyYAML の YAML 1.2 対応も実質的に停滞している。

一次情報（go-yaml v3 の挙動）:

- https://pkg.go.dev/gopkg.in/yaml.v3 ("YAML 1.1 bools (yes/no, on/off) are supported as long as they are being decoded into a typed bool value")
- https://github.com/go-yaml/yaml/issues/214

一次情報（PyYAML の YAML 1.2 対応要望）:

- https://github.com/yaml/pyyaml/issues/116（2017年 open、2025年時点で未解決）
- https://github.com/yaml/libyaml/issues/20（2016年 open、2025年時点で未解決）

### 2026 年時点の現状

ASCII News の 2026年1月報告: "PyYAML, Python's most popular YAML library, remains on v1.1 with an open 2017 GitHub issue requesting v1.2 support."

"YAML v1.1 parses 'NO' as false instead of a country code, causing unquoted strings like 'NO', 'yes', 'on', or 'off' to become silent data corruption in configuration deployments."

出典: https://ascii.co.uk/news/article/news-20260118-2768a796/yaml-norway-problem-persists-despite-v12-spec-fix

---

## 6. 実例: GitHub Actions / Kubernetes / docker-compose での被害

### GitHub Actions

- `on:` トップレベルキーが YAML 1.1 パーサーで `true` に変換される（PyYAML で解析した場合）
- `branches: [main, NO]` と書くと `[main, false]` になる可能性
- GitHub Actions 本体は内部的にこの問題を処理しているが、ワークフローファイルをプログラムで解析するツール（go-yaml v2 ベースのツールなど）では問題が顕在化する
- `workflow_dispatch` の boolean input は実際には文字列として渡されるという別の問題もある（actions/runner issue #1483）

### Kubernetes

Kubernetes は go-yaml を使用している。以下の問題が報告されている:

- **数値ラベル値**: ラベルや annotation の値が文字列でなければならないにもかかわらず、数値をクォートせずに書くとエラーになる（kubernetes/kubernetes issue #88564「kubectl silently fails parsing annotations when passing numeric value」）
- **boolean ラベル値**: `labels: {enabled: true}` のような書き方で `true` が boolean として解釈されるため Kubernetes API がエラーを返す（kubernetes/kubernetes issue #23251）
- **科学的記数法**: `1e003` が 1000 に変換されてしまいラベル値として無効になる

出典: https://github.com/kubernetes/kubernetes/issues/88564

### docker-compose

Docker Compose の公式ドキュメント（Compose file version 3 reference）に以下の明記がある:
"HOST:CONTAINER SHOULD always be specified as a (quoted) string, to avoid conflicts with yaml base-60 float."

`22:22` のような 59 以下のコンポーネントによるポートマッピングが sexagesimal として解釈される問題への対処として、引用符での明示が推奨されている。

`version: 3.8` のような version フィールドは go-yaml が float として `3.8` に解釈するが（文字列ではなく数値として）、Docker Compose v2 以降では version フィールド自体が非推奨・廃止となっている。

### Ansible

Ansible は内部で PyYAML を使用しているため YAML 1.1 の boolean 変換が発生する。Ansible のドキュメント・ポーティングガイドでは明示的に以下を推奨している:

- `ssl: "on"` `debug: "off"` `country: "NO"` `answer: "yes"` `version: "true"` のように、boolean っぽい文字列はクォートして記述する
- Ansible Core 2.19 では Jinja2 の native mode が常時有効となり、文字列の boolean 変換挙動が変化した

出典: https://docs.ansible.com/projects/ansible/latest/porting_guides/porting_guide_core_2.19.html

---

## 7. クォート戦略

### シングルクォート vs ダブルクォートの差

YAML のクォートには 5 種類のスタイルがある（plain scalar、single-quoted、double-quoted、literal block `|`、folded block `>`）。

**シングルクォート（`'value'`）の特徴:**

- バックスラッシュはエスケープ文字として機能しない（そのまま出力）
- シングルクォート自体を含めるには `''`（2つ重ね）でエスケープ
- `\n` は改行ではなく `\` と `n` の2文字として扱われる
- パスや正規表現など、バックスラッシュを多用する文字列に適している

**ダブルクォート（`"value"`）の特徴:**

- `\n`（改行）`\t`（タブ）`\\`（バックスラッシュ）などのエスケープシーケンスが使える
- JSON と互換性があるエスケープルール
- ダブルクォート自体は `\"` でエスケープ

**型変換防止の観点では両者に差はない**。`"NO"` も `'NO'` も文字列として解釈される。

一次情報: https://www.yaml.info/learn/quote.html

### クォートが必要な値の類型

以下の値をクォートなしで書くと、YAML 1.1 パーサーで型変換が発生する可能性がある:

```yaml
# boolean に変換される
flag: yes          # → true
flag: no           # → false
flag: on           # → true
flag: off          # → false
flag: y            # → true
flag: n            # → false
country: NO        # → false (Norway problem)
status: YES        # → true

# null に変換される
value: null        # → null
value: Null        # → null
value: NULL        # → null
value: ~           # → null
name: Null         # → null (姓が Null の場合)

# float に変換される
version: 1.0       # → 1.0（表示上は "1" になることがある）
version: 3.8       # → 3.8 (float)
ratio: 1.5e3       # → 1500.0

# int に変換される（YAML 1.1）
mode: 010          # → 8 (octal)
code: 0xFF         # → 255 (hex)
port: 22:22        # → 1342 (sexagesimal)

# datetime に変換される
date: 2024-01-15   # → datetime(2024, 1, 15)
```

### 「全部クォートする」vs「危険な箇所だけクォートする」

**全部クォートする派の主張:**

- 型変換ルールの記憶が不要
- パーサーのバージョン差・言語差に依存しない
- CI/CD や IaC で予期しない変換によるインシデントを防ぐ

**危険な箇所だけクォートする派の主張:**

- 単純な文字列（`name: Tokyo` など）まで `name: "Tokyo"` と書くのは冗長で可読性が落ちる
- 「plain scalar の基本ルールは単純」（特殊文字で始まらない、`: ` や ` #` を含まない）なので覚えられる
- yamllint など lint ツールを使えば危険な書き方を検出できる

**現実的な判断基準（記事の核心的主張を支持する根拠）:**

問題は「ルールを知っていれば避けられる」という前提が崩れていること:

1. パーサーのバージョン（YAML 1.1 vs 1.2）を意識しない開発者が多い
2. 使っているツール（Ansible、Helm、Kubernetes kubectl）が内部でどのパーサーを使っているか把握しにくい
3. PyYAML（Python の事実上の標準）が 2026 年時点でも YAML 1.1 互換動作である
4. go-yaml v3 でも typed decode の場合は YAML 1.1 boolean を受け付ける

---

## 8. 反証材料とカウンター

### 反論 1: 「YAML 1.2 ベースのパーサーなら問題ない」

**正確な部分**: YAML 1.2 の Core Schema は `yes/no/on/off` を boolean として解釈しない。js-yaml、ruamel.yaml、snakeyaml-engine などは YAML 1.2 ベースで Norway Problem は発生しない。

**カウンター**:

1. PyYAML（Python 最大シェア）と LibYAML は YAML 1.2 未対応が 2026 年時点で継続している
2. go-yaml v3 は「YAML 1.2 ベース」と標榜しながら、typed decode では YAML 1.1 の boolean（yes/no/on/off）を受け付けるという「後方互換」挙動がある
3. SnakeYAML（Java）は YAML 1.1 挙動が残っている（新しい snakeyaml-engine は 1.2 だが、多くのツールが依然 SnakeYAML を使用）
4. 利用者がどのパーサーのどのバージョンを使っているか、DevOps・インフラ担当者が常に把握しているわけではない

### 反論 2: 「全部クォートすると可読性が落ちる」

**正確な部分**: `name: "Tokyo"` や `count: "5"` は確かに冗長。plain scalar で問題ない値まで全部クォートすると視認性が下がる。

**カウンター**:

1. 「全部クォート」の推奨対象は「型変換が起きうる値」に限定するのが合理的。具体的には: 数値（特に小数・バージョン番号）、boolean っぽい文字列（yes/no/on/off/true/false）、null っぽい文字列、日付形式の文字列、コロン区切りの数値。
2. 可読性の問題は `name: Tokyo`（クォート不要）と `country: "NO"`（クォート必要）を区別することで対処できるが、初心者や急ぎの実装では判断ミスが起きる。
3. インシデントのコスト（デバッグ時間・サービス障害）と比較すると、クォートの冗長性は些細なコスト。

### 反論 3: 「linter を使えばいい」

**正確な部分**: yamllint の `quoted-strings` ルールや `truthy` ルールで危険な書き方を検出できる。

**カウンター**:

1. yamllint を CI に組み込んでいないプロジェクトが多い
2. Kubernetes manifest、GitHub Actions ワークフローを直接手書きする際に linter を使わない場面が多い
3. 根本解決はパーサーの YAML 1.2 移行だが、2026 年時点で未解決

---

## 9. 一次情報リファレンス（出典 URL 一覧）

### 仕様書

- YAML 1.1 bool 型仕様: https://yaml.org/type/bool.html
- YAML 1.1 int 型仕様: https://yaml.org/type/int.html
- YAML 1.1 float 型仕様: https://yaml.org/type/float.html
- YAML 1.1 null 型仕様: https://yaml.org/type/null.html
- YAML 1.1 timestamp 型仕様: https://yaml.org/type/timestamp.html
- YAML 1.2.2 仕様書: https://yaml.org/spec/1.2.2/

### 主要記事

- Ruud van Asseldonk, "The yaml document from hell" (2023-01-11): https://ruudvanasseldonk.com/2023/01/11/the-yaml-document-from-hell
- Phil Nash, "The yaml document from hell — JavaScript edition" (2023-02-02): https://philna.sh/blog/2023/02/02/yaml-document-from-hell-javascript-edition/
- Bramus Van Damme, "YAML: The Norway Problem" (2022-01-11): https://www.bram.us/2022/01/11/yaml-the-norway-problem/
- HitchDev/StrictYAML, "The Norway Problem - why StrictYAML refuses to do implicit typing": https://hitchdev.com/strictyaml/why/implicit-typing-removed/
- ASCII News, "YAML Norway Problem Persists Despite v1.2 Spec Fix" (2026-01-18): https://ascii.co.uk/news/article/news-20260118-2768a796/yaml-norway-problem-persists-despite-v12-spec-fix
- tinita, "Strings in YAML - To Quote or not to Quote" (2018): https://blogs.perl.org/users/tinita/2018/03/strings-in-yaml---to-quote-or-not-to-quote.html

### GitHub Issues

- PyYAML: `on` が True にパースされる問題: https://github.com/yaml/pyyaml/issues/376
- PyYAML: yes/no/on/off が boolean になる問題: https://github.com/yaml/pyyaml/issues/613
- PyYAML: YAML 1.2 対応要望（2017年 open、未解決）: https://github.com/yaml/pyyaml/issues/116
- LibYAML: YAML 1.2 対応要望（2016年 open、未解決）: https://github.com/yaml/libyaml/issues/20
- go-yaml: boolean support inconsistent with YAML 1.2: https://github.com/go-yaml/yaml/issues/214
- go-yaml: GitHub Actions の `on` キーが boolean に変換: https://github.com/go-yaml/yaml/issues/523
- Kubernetes: annotation に数値を書くと silent failure: https://github.com/kubernetes/kubernetes/issues/88564

### ツール・ライブラリドキュメント

- quoting ガイド（yaml.info）: https://www.yaml.info/learn/quote.html
- Helm: YAML Techniques: https://helm.sh/docs/chart_template_guide/yaml_techniques/
- Ansible Core 2.19 ポーティングガイド（boolean 変更）: https://docs.ansible.com/projects/ansible/latest/porting_guides/porting_guide_core_2.19.html

---

## 10. 記事執筆のための要点整理

### 記事の核心的主張を支持する最強の根拠

1. **一次仕様の明確な記述**: yaml.org/type/bool.html に 22 種類の boolean 文字列が明記されている
2. **Ruud van Asseldonk の実例**: sexagesimal（`22:22` → 1342）・Norway Problem・float 変換の3つが具体的な YAML+解析結果のペアで示されている
3. **2026 年時点での未解決状態**: PyYAML issue #116（2017年〜）と LibYAML issue #20（2016年〜）が依然 open
4. **ASCII News の 2026 年報告**: 現時点でも Norway Problem が実際に発生していることを確認

### 記事に使えるコードスニペット

```yaml
# 全部 false になる（YAML 1.1 パーサーで）
- no
- No
- NO
- n
- N
- false
- False
- FALSE
- off
- Off
- OFF

# 全部 true になる（YAML 1.1 パーサーで）
- yes
- Yes
- YES
- y
- Y
- true
- True
- TRUE
- on
- On
- ON
```

```yaml
# 危険な書き方（YAML 1.1 で型変換が起きる）
country: NO          # → false
debug: on            # → true
version: 1.0         # → 1.0 (float、表示で "1" になることがある)
port: 22:22          # → 1342 (sexagesimal)
release: 2024-01-15  # → datetime
name: Null           # → null
permission: 755      # ← 安全（数値リテラルとして問題ない）

# 安全な書き方
country: "NO"
debug: "on"
version: "1.0"
port: "22:22"
release: "2024-01-15"
name: "Null"
```
