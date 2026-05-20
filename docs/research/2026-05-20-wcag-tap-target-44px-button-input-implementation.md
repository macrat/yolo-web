---
title: WCAG タップターゲット 44px 対応 — Button / Input min-height 実装調査
date: 2026-05-20
purpose: B-386（Button / Input コンポーネントの min-height 44px 対応）計画立案のための WCAG 要件確認と CSS 実装パターン調査
method: W3C 公式 WCAG 2.2 Understanding ドキュメント、各プラットフォーム HIG、主要 OSS デザインシステム、CSS 実装解説記事を横断調査
sources:
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
  - https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/
  - https://tetralogical.com/blog/2022/12/20/foundations-target-size/
  - https://ishadeed.com/article/target-size/
  - https://ishadeed.com/article/clickable-area/
  - https://51bits.com/expanded-hit-areas/
  - https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/
  - https://smart-interface-design-patterns.com/articles/accessible-tap-target-sizes/
  - https://codyhouse.co/blog/post/vertical-text-alignment-in-buttons-and-inputs
  - https://testparty.ai/blog/wcag-2-5-8-target-size-minimum-2025-guide
  - https://carbondesignsystem.com/components/button/usage/
---

# WCAG タップターゲット 44px 対応 — Button / Input min-height 実装調査

## 現状の寸法（調査時点での CSS 値から逆算）

`Button.module.css` および `Input.module.css` の現行値を計算式で確認した。

- **Button（default サイズ）**: `padding: 9px 18px` + `font-size: 14px` + `line-height: normal`（system-ui で約 1.4 ≒ 19.6px）+ `border: 1px × 2` = **39.6px**
- **Button（small サイズ）**: `padding: 5px 11px` + `font-size: 12px` + `line-height: normal`（約 16.8px）+ `border: 2px` = **28.8px**
- **Input**: `padding: 9px 12px` + `font-size: 14px` + `line-height: 1.5`（21px）+ `border: 1px × 2` = **41px**

Button default が約 39–40px、Input が約 41px で、いずれも WCAG 2.5.5 AAA（44px）に届かない。
WCAG 2.5.8 AA（24px）は満たしているが、業界標準の 44px 推奨には未達である。

---

## (1) WCAG 2.5.5 / 2.5.8 のタップターゲット要件の正確な内容

### WCAG 2.5.8 Target Size (Minimum) — Level AA（WCAG 2.2）

**要件**: ポインター入力のターゲットサイズが少なくとも **24 × 24 CSS ピクセル**であること。

W3C の公式 Understanding ドキュメント（https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html）によると、例外規定は以下の 5 種類。

1. **Spacing（間隔）**: 24px 未満のターゲットでも、そのバウンディングボックスを中心とした直径 24px の円が他のターゲットやその円と交差しない場合は合格。すなわち「小さくても隣接ターゲットと 24px 以上の隙間がある」ならば OK。
2. **Equivalent（代替手段）**: 同一ページ上に同等機能を果たす 24px 以上のコントロールが存在する場合。
3. **Inline（行中埋め込み）**: 文の中に含まれるリンクや、周囲のテキストの行高によってサイズが制約されているターゲット。
4. **User Agent Control**: ブラウザのデフォルトレンダリング（例：`<input type="date">` のカレンダー）で、著者が変更していない場合。
5. **Essential（本質的）**: 特定の見た目が情報伝達に本質的に必要な場合（地図上の実際の位置を示すピン等）。

**注意点**: ボタンやフォーム入力は Inline / User Agent Control / Essential のいずれにも該当しないため、原則として 24px 以上かつ間隔例外のいずれかを満たす必要がある。

### WCAG 2.5.5 Target Size (Enhanced) — Level AAA（WCAG 2.1/2.2）

**要件**: ポインター入力のターゲットサイズが少なくとも **44 × 44 CSS ピクセル**であること。

W3C ドキュメント（https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html）によると、例外は 4 種類（同等コントロール、インライン、ユーザーエージェント制御、本質的）で、Spacing 例外は存在しない。44px 以下の間隔付きターゲットは AAA 非準拠となる。

### 両者の位置付けまとめ

| 基準       | レベル              | 要求サイズ | Spacing 例外 |
| ---------- | ------------------- | ---------- | ------------ |
| WCAG 2.5.8 | AA（WCAG 2.2）      | 24 × 24px  | あり         |
| WCAG 2.5.5 | AAA（WCAG 2.1/2.2） | 44 × 44px  | なし         |

現時点の yolos.net コンポーネント（約 39–41px）は **2.5.8 AA は満たしているが、2.5.5 AAA は未達**。業界標準（後述）との比較では 44px に届かないことが問題である。

### 各プラットフォームの推奨値比較

LogRocket（https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/）および TetraLogical（https://tetralogical.com/blog/2022/12/20/foundations-target-size/）の横断調査より。

| プラットフォーム          | 推奨サイズ                   | 備考                                  |
| ------------------------- | ---------------------------- | ------------------------------------- |
| Apple iOS HIG             | 44 × 44 pt                   | ≒ 59px（Retina 換算）。AAA と一致     |
| Apple visionOS            | 60 × 60 pt                   | 空間コンピューティングは精度が低い    |
| Google Material Design 3  | 48 × 48 dp                   | 指の実寸（MIT 研究: 45–57px）に基づく |
| Microsoft Fluent UI (Web) | iOS/Web: 44px、Android: 48px | Fluent 2 ではプラットフォーム別に明示 |
| Microsoft Windows         | 40 × 40px (7.5mm)            | Win32 ネイティブコントロール          |
| WCAG 2.5.5 AAA            | 44 × 44 CSS px               | ウェブの事実上の業界標準              |

**なぜ 44px が業界標準か**: 主要 IT 企業（Apple・Google・Microsoft）が WCAG AAA 水準またはそれ以上を自社ガイドラインとして採用した結果、44px が事実上の最低ラインになった。MIT の研究では平均的な人差し指の接触面積が 45–57px であり、これと 44px がほぼ一致する。Material Design の 48dp はより多くのユーザーを包摂するため意図的に AAA より高く設定している。

---

## (2) min-height で 44px を確保する CSS 実装パターン

### 基本パターン: padding-based + min-height

CodyHouse（https://codyhouse.co/blog/post/vertical-text-alignment-in-buttons-and-inputs）の推奨。

```css
/* Button */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px; /* タップターゲット保証 */
  padding: 10px 18px; /* 視覚的な余白 */
  font-size: 14px;
  line-height: 1.4; /* 1 より大きくする（input 互換のため） */
  box-sizing: border-box;
  border: 1px solid var(--border);
}
```

**box-sizing との関係**: `border-box` を指定すると `min-height` はボーダーとパディングを含む値になり、コンテンツ高さが不定の場合でも最低 44px を保証できる。`content-box`（デフォルト）では border+padding 分が加算されるため意図した値にならない。

**CSS Custom Property によるデザイントークン化**: 業界では `--min-touch-target: 44px` のようなトークンとして定義するパターンが推奨されている（testparty.ai 調査）。yolos.net の場合、既存の CSS Custom Property 体系に以下を追加する形が自然。

```css
/* tokens.css or global.css */
--min-touch: 44px; /* WCAG 2.5.5 AAA タップターゲット最小値 */
```

```css
.button {
  min-height: var(--min-touch);
}
```

**padding の調整方針**: `min-height: 44px` を設定後に padding を調整する場合、現行の `padding: 9px 18px` + `font-size: 14px` + `line-height: 1.4` は約 39–40px なので差分は 4–5px。`padding: 11px 18px` 程度への変更で自然に 44px を超える。ただし後述の `inline-flex` + `align-items: center` があれば min-height が底上げするため padding の細かい計算は不要になる。

### 「視覚的には小さく見せてタップターゲットだけ 44px にする」テクニック

**疑似要素による hit area 拡張** (51bits.com: https://51bits.com/expanded-hit-areas/)

```css
.button {
  position: relative;
}
.button::after {
  content: "";
  position: absolute;
  inset: -6px; /* 視覚サイズに +6px を四方に追加してタップ領域を拡大 */
}
```

**トレードオフ**:

- `overflow: hidden` が祖先に存在すると疑似要素が切り取られ、拡張した領域がクリックできなくなる。
- `z-index` の重なり文脈によっては疑似要素が他要素の下に潜り込む。
- テキスト選択（`user-select`）が想定外の領域に及ぶ可能性があり、`user-select: none` での抑制が必要になる場合がある。
- **適合場面**: アイコンのみのボタン、文中のインラインリンクなど「視覚サイズを変えられないが WCAG を通す必要がある」ケース。
- **不適合場面**: Button / Input のように `padding` の増加が容認される、かつ見た目の変化がデザイン上許容される場合は、疑似要素より min-height + padding の方がシンプルで保守しやすい。

### Input（テキスト入力欄）の min-height 増加時の注意

**カーソル縦位置への影響**: テキスト入力要素（`<input type="text">`）の場合、`line-height` は仕様上無効（Mozilla Bug #349259 参照）で、内部のカーソルや文字の縦位置はブラウザが `padding` と `font-size` から自動計算する。`min-height: 44px` を付与しても `padding-top` と `padding-bottom` が対称であれば、ブラウザは文字をほぼ垂直中央に自動配置するため崩れにくい。

**プレースホルダーの縦中央揃え**: `<input>` は replaced element に近い動作をするため、`display: flex` を直接 input に付与しても内部コンテンツには効かない。確実に縦中央揃えにするには、wrapper の `<div>` を `display: flex; align-items: center` にして `<input>` を子要素とするか、純粋な `padding` 対称配置に頼る。現行の `padding: 9px 12px` + `line-height: 1.5` の Input は既にブラウザが縦中央配置しているが、`min-height: 44px` を足しても padding が対称の限り変化しない（実測で 41px → 44px になるだけ）。

**クロスブラウザ一貫性**: CodyHouse の調査によると、`<button>` と `<input>` を同一の見た目にするには `font-size`、`line-height`、`padding`、`border-width` を揃え、かつ `line-height > 1` にする必要がある（Firefox では `line-height: 1` だと input が button より高くなる）。`min-height` を追加してもこの原則は変わらない。

---

## (3) サイズバリアント（small / medium / large）がある場合のタップターゲット確保

### 業界デザインシステムの実態

**Carbon Design System (IBM)**:

- ボタンサイズは `xs / sm / md / lg / xl / 2xl` の 6 段階以上。
- `sm`（32px 相当）は「テーブル内やスペースが制約された場所専用」として明記。
- 公式 Usage ガイド（carbondesignsystem.com）では「small ボタンには 3 ワード以下の短いラベルを使う」と規定。タッチデバイスでの使用を想定していない点が暗黙的に示されている。
- GitHub Issue #4726「モバイルで Tag Filter のタッチターゲットが小さすぎる」に対し、メンテナーは「Carbon は主にデスクトップ向け B2B UI を対象としている」とコメントしている。

**Chakra UI**:

- xs(20px) / sm(24px) / md(32px) / lg(40px) のバリアントを持つが、WCAG 2.5.5 AAA（44px）を達成するサイズは存在しない。
- Chakra は WCAG AA（2.5.8、24px）準拠を目標としており、AAA は任意実装と位置付けている。

**LogRocket 調査（https://blog.logrocket.com/ux-design/all-accessible-touch-target-sizes/）**:
あるチームが小/中/大バリアントを廃止し、デフォルト 1 サイズのみにリファクタリングした事例を紹介。理由は「デザイナーが見た目を優先して小さなバリアントを使い続け、タッチターゲット基準を慢性的に満たせなくなった」というもの。

### 業界標準としての棲み分け方針

主要デザインシステムを横断して観察される暗黙のコンセンサスは以下の通り。

1. **medium 以上（≥ 40–44px）は全コンテキスト対応**: タッチ・マウス問わず使える。
2. **small（< 40px）はデスクトップ / テーブル / 密集レイアウト限定**: モバイルタッチには**意図的に非推奨**。ドキュメントにその旨を明記する。
3. **spacing 例外の活用**: WCAG 2.5.8 AA では、small ボタン同士の間に 24px 以上の間隔があれば合格。dense table 内の行アクションボタンに small を使う場合はセル余白を確保する設計でカバーできる。

### yolos.net への示唆

現行は `default` と `small` の 2 バリアント。以下が合理的な整理。

- `default`（現 39–40px）→ `min-height: 44px` で対応。見た目の変化は最小限（約 4px 増）。
- `small`（現 28.8px）→ デスクトップ専用 / 密集レイアウト限定の使用コンテキストを CSS コメント・コンポーネント JSDoc に明記し、モバイル非推奨を文書化。44px の強制適用はしない（デザイン意図を破壊するため）。

---

## (4) 「個別上書き」パターンが anti-pattern である理由

### 問題の構造

「コンポーネント本体は 39px のまま、利用箇所 A・B・C で個別に `min-height: 44px` を追加する」パターンは、以下の理由で長期的な maintainability を損なう。

**1. 修正漏れが必然的に発生する**

コンポーネントの利用箇所がサイト規模で増えると、すべての利用箇所を網羅して上書きを追加することは現実的でない。新たにコンポーネントを呼び出す箇所を追加した開発者が上書きルールを知らなければ、即座に WCAG 違反が復活する。バグトラッキング上も「そのページだけ OK、あのページは未対応」という断片的な状態が長期化する。

**2. 責任の所在が不明瞭になる**

コンポーネント自体が「44px を保証する責任を持つ」のか「利用側が守る責任を持つ」のか曖昧になる。コードレビューでの検出も困難になり、「なぜここだけ min-height がある？」という疑問が生まれる。

**3. 特異性（specificity）戦争を招く**

CSS Modules でも、利用箇所のコンテキストクラスとコンポーネントクラスが競合することがある。上書きのために `!important` を使ったり、セレクターの詳細度を上げたりする連鎖が起きやすい（CSS-Tricks「Defining and Dealing with Technical Debt」参照）。

**4. テストカバレッジが増大する**

コンポーネント 1 箇所を直せば 1 テストで済むところを、利用箇所ごとにビジュアルリグレッションテストやアクセシビリティ検査が必要になる。

**5. デザインシステムとの整合が崩れる**

Salesforce の Lightning Web Components ガイドライン（developer.salesforce.com/docs/platform/lwc/guide/create-components-css-antipatterns.html）は「コンポーネント内部を外部から上書きすることはアンチパターン」と明示。理由は「コンポーネント内部は変更される可能性があり、外部からの上書きは予期しないタイミングで壊れる」ため。

### 根本対処の優位性

「基底コンポーネント 1 ファイルを 1 行変更する」ことで、サイト全体の全利用箇所が一斉に修正される。これは：

- 修正漏れゼロ（定義が 1 カ所のため）
- コンポーネントが自己完結したアクセシビリティ保証を持つ
- テストは 1 コンポーネント分のみで十分
- 将来的に新規利用箇所を追加する開発者が特別な知識を持たなくてよい

CSS Modules のスコープにより、`.button` クラスの変更が他コンポーネントに漏れ出すリスクもない。

---

## PM への補足

### 現状の優先度評価

- WCAG 2.5.8 AA（24px）は現行でも満たしているため、法的・技術的な「違反」ではない。
- ただし Apple HIG・Material Design・WCAG AAA すべてが 44px 以上を推奨しており、yolos.net がスマートフォンユーザーを対象にする以上は 44px を達成すべき水準と判断できる。
- Button default の修正コストは `min-height: 44px` の 1 行追加（または `padding-top`/`padding-bottom` を各 11px に変更）で済むため、リスクと対効果のバランスは非常に良好。

### Input の実測値について

Input は `line-height: 1.5` のため計算上 41px 程度であり、`min-height: 44px` の追加で不足分（約 3px）を補える。`<input>` 要素に `min-height` を付与しても内部カーソルや placeholder の縦位置は padding が対称な限りブラウザが自動補正するため、視覚上の問題は発生しにくい。実装後は Playwright で縦中央揃えを視覚検証することを推奨する。

### small バリアントの方針

small バリアント（現 28.8px）を無理に 44px に引き上げると、「テーブル内行アクション」のような密集レイアウトで使っている既存箇所のデザインが大きく崩れる。業界標準（Carbon 等）と同様に「small はデスクトップ / 密集レイアウト限定、タッチデバイス非推奨」として文書化する方向が現実的。

### 実装推奨アプローチ（サマリー）

1. `Button.module.css` の `.button`（default）に `min-height: 44px` を追加。
2. `Input.module.css` の `.input` に `min-height: 44px` を追加。
3. `.sizeSmall` は変更せず、コメントに「密集レイアウト / デスクトップ限定。タッチデバイスには使用しないこと（WCAG 2.5.5 非準拠）」と明記。
4. 必要に応じて `--min-touch: 44px` のデザイントークンを global CSS に追加し、両コンポーネントから `var(--min-touch)` を参照する形にすると、将来の変更が 1 箇所で済む。
5. 実装後 Playwright で全コンポーネント利用ページの視覚回帰テストを実施。
