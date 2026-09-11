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

## `font-feature-settings` は書体の既定を上書きする（詰めるつもりが広がる）

`font-feature-settings` は**指定した feature だけを足す**プロパティではない。指定した瞬間、その書体が既定で有効にしている feature が**すべて無効になる**。

そのため「約物を詰めたい」つもりで `font-feature-settings: "palt"` を書くと、書体が `palt` テーブルを持たない場合、**足したいものは効かず、既に効いていた詰め（`chws` 等）だけが消える**——差し引きで字が広がる。

### 実測（Noto Serif JP・31px・`「」「」——！？`）

| 指定                 | 幅      |
| -------------------- | ------- |
| 指定なし（`normal`） | 224.3px |
| `"palt"`             | 239.8px |
| `"chws"`             | 224.3px |
| `"halt"`             | 162.3px |

`normal` と `chws` が一致することから、この書体は `chws` を既定で有効にしていると分かる。`palt` を書くとその `chws` が切れ、**7% 広がる**。詰めたいなら `halt`（全角の字幅を字面に詰める）を使うか、既定に任せる。

### 確かめ方

ブラウザで実測するのが早い。書体の feature テーブルの有無は推測せず、同じ文字列を `normal` / 目的の feature で並べて幅を測る。

```js
const probe = document.createElement("span");
probe.style.cssText =
  "position:absolute;visibility:hidden;white-space:nowrap;font:31px 'Noto Serif JP'";
probe.textContent = "「」「」——！？";
document.body.appendChild(probe);
for (const ff of ["normal", '"palt"', '"chws"', '"halt"']) {
  probe.style.fontFeatureSettings = ff;
  console.log(ff, probe.getBoundingClientRect().width);
}
```

`font-variant-*` 系のプロパティ（`font-variant-east-asian` 等）を使えば既定を壊さずに足せるが、`palt`/`chws` に対応する値は無い。

### 検査

`--font-mincho` を使うブロックの `palt` は `src/test/design-gate.test.ts` の §3 ゲートが弾く。grep 一行で検査できる規則を機械ゲートに置かないと、1ファイル直しただけで直したつもりになる（cycle-312 で 26 宣言 / 20 ファイルが残っていた）。
