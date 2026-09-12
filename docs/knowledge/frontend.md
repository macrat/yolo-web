# フロントエンド実装の技術ノート

DESIGN.md（デザインの原則の正典）が「何を・なぜ」を定め、本ノートは「どう実装するか」の手段を補う。原則と手段を分けることで DESIGN.md を規範文書として安定させる（DESIGN.md §11）。

## stretched-link で行全体をクリック可能にする

DESIGN.md §4「クリック標的＝視覚単位の全体」の実装手段。一覧の行/カードで、品名テキストだけでなく行全体をクリック/タップ標的にしたいときに使う。

### 原則と方式の対応

一覧のクリック領域には3つのイディオムがありうる:

1. **タイトルのみリンク**（品名テキストだけが `<a>`）: 標的が狭く「押せない」摩擦を生む＝DESIGN.md §4 違反。使わない。
2. **行全体を単一 `<a>` で包む**（`display:block` のリンクが行の全内容を子に持つ）: 標的は行全体で §4 準拠。ただしアクセシブル名が「品名＋よみ＋説明＋値札」の連結になり、スクリーンリーダーが冗長に読み上げる。**行内に副リンクを持てない**（`<a>` の入れ子は不正 HTML）・見出し要素を内包すると意味構造を崩す。副リンク・見出しの無い単純な行に限り許容。
3. **stretched-link**（主リンクの擬似要素でクリック標的だけを拡張）: 標的は行全体・アクセシブル名は主リンク名のみ・副リンク（タグ等）を独立に押せる。**推奨**。

### stretched-link の実装

主リンク（品名）は `<a>` のまま残し、その擬似要素 `::after` を絶対配置で行全体に広げる:

```css
.row {
  position: relative; /* ::after の位置基準 */
}
.name::after {
  content: "";
  position: absolute;
  inset: 0; /* 行（.row）全体をクリック標的に */
}
```

- **DOM は不変**なのでアクセシブル名は品名のみに保たれる（SR 良好・既存テストも保全）。
- **hover は要素自身の `:hover` を使う**（`.name:hover`）。`::after` が行を覆うため行のどこをホバーしても発火する。`.row:hover .name` のような子孫セレクタは不要。
- **focus**: キーボード focus は主リンクに出る（WCAG 準拠。フォーカス可能要素にリングが出ていれば足りる）。`:focus-within` で行全体を光らせる必要はない（副リンク focus でも行が光る副作用を避ける）。

### 行内に副リンク（タグ等）がある場合

副リンクを `::after`（z-index auto=0）より前面に出す:

```css
.tagRow {
  position: relative;
  z-index: 1;
}
```

- `.row` に `z-index` を付けない（スタッキングコンテキストを作らないので、`z-index:1` の副リンクが `::after` の前面に立つ）。
- 副リンクをホバーすると、最前面は副リンクなので主リンクの `::after` にヒットせず、`.name:hover` は発火しない＝**副リンク上では主リンクの hover 表現が出ない**（意図どおり）。
- **副リンク行のデッドゾーンと是正**: block 級の副リンク行（例: タグの `<ul>`）を全幅で前面に上げると、副リンクの右側の空き帯も `::after` の前面に乗り、そこをクリックしても主リンクに遷移しない「デッドゾーン」ができる。**是正は副リンク行に `width: fit-content; max-width: 100%` を当てる**——幅を内容ぶんに絞ることで右側の空きが主リンクの `::after` に戻り（＝主リンクへ遷移する）、`fit-content = min(max-content, available)` の性質で狭幅では利用幅で頭打ちになるため flex-wrap の折り返しは保たれ overflow しない。cycle-281 で BlogList のタグ帯に適用し、デスクトップでデッドゾーン解消・モバイル（375）でタグ12個強制でも3行折り返し＋overflow ゼロを実機で検証した（設計時に懸念した「fit-content が折り返しを壊す」は実測で否定された）。

### 副作用（許容の判断）

- `::after` が覆う領域のテキストは選択・コピーできなくなる。一覧のナビ行（遷移が目的・全文は遷移先にある）では許容。読ませる散文が主目的の面には使わない。

### 適用実績

- cycle-281: `Shinagaki`（RelatedArticles 内包）・`BlogList`（TagList の独立クリックを z-index で両立）をイディオム1→3へ是正。フェーズR移行で生じたクリック領域劣化の是正。
- イディオム2の実例: `DictionaryEntryList`・`PlayRecommendBlock`（標的は行全体で §4 準拠だが、アクセシブル名の浄化は将来 stretched-link 化の候補＝B-573 系）。

## 和文の `palt` は `chws` と排他——詰めるつもりが広がる

日本語の見出しに `font-feature-settings: "palt"` を掛けると、書体によっては**逆に広がる**。`palt`（プロポーショナル字幅）は `chws`（連続約物のアキ詰め）と排他で、`palt` を指定すると書体が既定で有効にしている `chws` が切れるためである。

### 実測（Noto Serif JP 600・31px・`「」「」——！？`）

| 指定                           | 幅      | 読み                                     |
| ------------------------------ | ------- | ---------------------------------------- |
| `normal`                       | 224.3px | 既定（`chws` が効いている）              |
| `"liga"` / `"kern"` / `"tnum"` | 224.3px | **既定は落ちない**（排他でない feature） |
| `"chws"`                       | 224.3px | 既定と同じ＝既定で有効だった証拠         |
| `"palt"`                       | 239.8px | `chws` が切れて **+7%**                  |
| `"palt" 1, "chws" 0`           | 239.8px | 同上                                     |
| `"chws" 1, "palt" 0`           | 224.3px | `palt` を明示的に切れば戻る              |
| `"halt"`                       | 162.3px | 全角を半角幅へ寄せる（詰まるが別物）     |

**`font-feature-settings` は書いた feature 以外を無効化しない。** `liga`・`kern`・`tnum` がいずれも `normal` と同値であることがそれを示す。落ちるのは `palt` と排他の関係にある `chws` だけである。

これは仕様どおりの挙動である。CSS Fonts 4 は、既定で有効な feature は `font-feature-settings` が `normal` でなくても有効であり続け、作者が明示的に上書きした feature だけが無効になると定めている（解決順序は 既定 → CSS プロパティ → `font-feature-settings` の足し合わせ）。Chromium が `chws` を既定で有効にした際、排他にしたのは `halt`・`palt` とその縦組み版だけである（GPOS 実装のため）。

この区別は実務上重要で、「`font-feature-settings` を書かない」という乱暴な規則にすると、数字の桁揃えに使う `tnum` まで巻き添えで消える。

### 見落としやすい点

- **単独の約物では幅が変わらない。** `「あ」`（93px）や `あ、い`（91.8px）は `palt` の有無で同値である。差が出るのは**約物が隣り合ったとき**だけ——`chws` が詰めているのがまさにその箇所だからである。検証に使う文字列は必ず約物を連続させる。cycle-312 で 26 宣言が長く見逃されていた理由がこれである。
- **`palt` を書くと、その要素で `text-spacing-trim` も効かなくなる**（`「あ」`: 既定 93px → `trim-start` 77.5px → `palt` + `trim-start` 93px）。`palt` は「効かない指定」ではなく、正攻法の詰めを殺す指定である。

### 詰めたいとき

- 約物のアキだけを詰めたい → **何も書かない**（`chws` の既定に任せる）。
- もっと詰めたい → `halt`。ただし全角文字すべてが半角幅に寄るので、約物以外の見え方も変わる。
- 数字を等幅にしたい → `tnum`。`chws` とは排他でないので併用できる。

### 確かめ方

書体に当該 feature のテーブルがあるかを推測しない。同じ文字列を feature 違いで並べて幅を測れば1分で分かる。

```js
const probe = document.createElement("span");
probe.style.cssText =
  "position:absolute;visibility:hidden;white-space:nowrap;font:600 31px 'Noto Serif JP'";
probe.textContent = "「」「」——！？";
document.body.appendChild(probe);
for (const ff of ["normal", '"palt"', '"chws"', '"halt"', '"tnum"']) {
  probe.style.fontFeatureSettings = ff;
  console.log(ff, probe.getBoundingClientRect().width);
}
```

### 検査

`--font-mincho` を使うブロックの `palt` は `src/test/design-gate.test.ts` の §3 ゲートが弾く（`palt` のみを対象にし、他の feature は通す）。grep 一行で検査できる規則を機械ゲートに置かないと、1ファイル直しただけで直したつもりになる（cycle-312 で 26 宣言 / 20 ファイルが残っていた）。
