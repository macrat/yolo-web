---
title: 複数コンポーネントが同時にscroll lockを要求するときの実装パターン調査
date: 2026-05-04
purpose: yolos.net技術ブログ記事の執筆根拠収集。body.classList.add/removeによるscroll lock実装が複数コンポーネント同時開放時に壊れる問題と、datasetを使った参照カウンタ式実装の優位性を中心とした主張の独自性・正確性・補足事項を確認する。
method: 日本語/英語での複数キーワード検索（"scroll lock 参照カウンタ body classList React 複数コンポーネント"、"body scroll lock multiple components reference counter React"、"body-scroll-lock npm source code multiple locks"、"iOS Safari overflow hidden body scroll lock fix"、"scroll lock React context provider alternative"、ほか）、主要ライブラリのソースコード・issueトラッカー参照、技術ブログ記事の内容確認
sources:
  - https://github.com/willmcpo/body-scroll-lock
  - https://github.com/willmcpo/body-scroll-lock/issues/235
  - https://www.drupal.org/project/body_scroll_lock/issues/3123157
  - https://robbowen.digital/wrote-about/locking-scroll-with-has/
  - https://benfrain.com/preventing-body-scroll-for-modals-in-ios/
  - https://pqina.nl/blog/how-to-prevent-scrolling-the-page-on-ios-safari/
  - https://usehooks-ts.com/react-hook/use-scroll-lock
  - https://www.shadcn.io/hooks/use-scroll-lock
  - https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
  - https://blog.logrocket.com/create-advanced-scroll-lock-react-hook/
  - https://github.com/theKashey/react-remove-scroll
  - https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac
  - https://vijayasankarn.wordpress.com/2017/02/24/quick-fix-scrolling-and-focus-when-multiple-bootstrap-modals-are-open/
  - https://bugs.webkit.org/show_bug.cgi?id=153852
---

# 複数コンポーネントが同時にscroll lockを要求するときの実装パターン調査

## 調査サマリー

記事の中心的な主張（classList.add/remove が複数コンポーネント同時開放時に壊れる、dataset参照カウンタが必要）は**事実として正確**であり、技術的に有効な問題指摘である。

ただし「同じ主張の記事がすでに大量にある」という状況ではなく、**日本語圏では参照カウンタ式を明示的に論じた記事はほぼ存在しない**。英語圏でも、体系的にこの問題+解決策を論じたブログ記事は少ない。記事の独自性は保たれていると判断できる。

一方で、著名ライブラリ（body-scroll-lock、react-remove-scroll等）がすでに問題を認識して内部で対処しており、「ライブラリを使えばよい」という反論は成立する。記事ではこの点に正面から向き合い、「ライブラリなしで自前実装する場合に参照カウンタが必要になる」という文脈を明示することが重要。

---

## 1. 競合記事の有無と独自性の評価

### 日本語圏

「scroll lock 参照カウンタ 複数コンポーネント」というキーワードで検索した範囲では、**この問題を明示的に論じた日本語記事は確認できなかった**。

日本語圏で見つかった記事の大半は以下の3パターン：

- `body-scroll-lock` ライブラリを使ってモーダル1つのスクロールを止める方法
- `overflow: hidden` + `position: fixed` の組み合わせによる単一モーダル対応
- iOS Safari 固有のバグへの対処（後述）

複数コンポーネントが同時にロックを要求するシナリオ（モバイルナビ開放中にモーダルも開くなど）を問題として明示した記事は、日本語では見当たらない。**記事の独自性は日本語圏では高い。**

情報源：Zenn、Qiita、はてなブログの複数記事を確認

### 英語圏

英語圏でも「複数コンポーネント + classList の壊れ方 + 参照カウンタ解決策」を1記事で体系的にまとめたものは少ない。

確認した主要記事の状況：

- CSS-Tricks「Prevent Page Scrolling When a Modal is Open」（出典: https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/）: 単一モーダルのみ。複数同時ロックは扱わない。
- LogRocket「Create an advanced scroll lock React Hook」（出典: https://blog.logrocket.com/create-advanced-scroll-lock-react-hook/）: `data-scroll-lock` をdataset属性で使うが参照カウンタ方式ではない。複数コンポーネントが同時にフックを使った場合の問題を指摘はするが解決しない。
- Medium/React Camp「How to fight the body scroll」（出典: https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac/）: ライブラリ利用を推奨。参照カウンタは言及なし。
- somethingsblog.com「Build a Powerful Scroll Lock with This Advanced React Hook」（2024年10月）: 単一インスタンス前提。参照カウンタなし。

**結論：「classList → dataset カウンタ」という具体的な移行パターンを軸にした記事は英語圏でも希少であり、記事の独自性は保たれる。**

---

## 2. 既存ライブラリの実装（body-scroll-lock等）

### body-scroll-lock（npm）の内部実装

**出典: https://github.com/willmcpo/body-scroll-lock、 https://github.com/willmcpo/body-scroll-lock/issues/235**

ソースコード（`lib/bodyScrollLock.js`）を確認した結果、このライブラリは**「ターゲット要素の配列（locks array）」**という形で複数ロックを管理する。

具体的なデータ構造：

```javascript
var locks = [];
// 各ロックは { targetElement, options } というオブジェクト
```

`disableBodyScroll(targetElement)` を呼ぶたびに、そのターゲット要素がlocksに追加される。`enableBodyScroll(targetElement)` を呼ぶと、**そのターゲットに対応するエントリのみ削除**される。非iOS環境では `locks.length === 0` になったときに初めて `overflow: hidden` を解除する。

**つまりbody-scroll-lockは「要素ごとにロックを記録するリスト」を持ち、全ロックが解放されるまで抑止を維持する。**これは参照カウンタとは形式が異なるが、目的と効果は同等である。

ただし重要な既知バグが存在する（issue #235）。このライブラリはiOS環境と非iOS環境で挙動が異なり、デスクトップ（非iOS）環境では `enableBodyScroll()` を1回呼んだだけで直ちに `overflow` 設定が復元されてしまう（残りのロックを無視する）。iOS環境では正しく `locks.length === 0` を確認してから解除される。この非対称性は未修正のまま放置されており、**複数ロックを扱う上でのバグがすでにあるライブラリである**という重要な事実として記事に使える。

### react-remove-scroll

**出典: https://github.com/theKashey/react-remove-scroll**

前身の `react-scroll-locky` は「複数ロックが同時にアクティブな場合、互いに協調動作する」と明記していた。ただし `react-remove-scroll` に置き換えられた後は「`enabled` なコンポーネントが複数あっても最後（last）のもののみがアクティブとして扱われる」という仕様になった。つまり後から開いたオーバーレイのみがロックを担い、前のものは管理から外れる。**ネストされたロックを完全に独立して管理するわけではない。**

### usehooks-ts `useScrollLock`

**出典: https://usehooks-ts.com/react-hook/use-scroll-lock**

単一の `isLocked` boolean で管理。複数コンポーネントが同時に `lock()` を呼んだ場合、最初のコンポーネントが保存したオリジナルスタイルが後続の `lock()` で上書きされる可能性があり、アンロック時に「すでにロック済みの状態」が "original" として記録されてしまう問題がある。参照カウンタ機構はない。

### shadcn `useScrollLock`

**出典: https://www.shadcn.io/hooks/use-scroll-lock**

「SSR safe、Next.js App Router対応、scrollbar width compensation」を特長とするが、複数同時ロックの仕様は公式ドキュメントには記載がない。

### CSS `:has()` アプローチ

**出典: https://robbowen.digital/wrote-about/locking-scroll-with-has/**

```css
body:has(.lock-scroll) {
  overflow: hidden;
}
```

DOM上に `.lock-scroll` クラスを持つ要素が1つでも存在する限りロックが維持される。複数コンポーネントが各自のルート要素に `.lock-scroll` を持てば、全コンポーネントが閉じるまでロックが続く。**JavaScriptのカウンタなしで複数ロックの問題を自然に解決する**。

Firefox 121以降で全主要ブラウザがサポート（2023年12月以降は安全に使用可能）。ただし「DOMから完全に削除」されない限りロックが続くため、`display: none` で非表示にするだけでは機能しない。

---

## 3. iOS Safari 固有の罠

### overflow: hidden が効かない問題

**出典: https://bugs.webkit.org/show_bug.cgi?id=153852、https://benfrain.com/preventing-body-scroll-for-modals-in-ios/**

iOS SafariではWebKitの仕様上、`document.body` に `overflow: hidden` を適用してもスクロールを完全に止めることができない。このバグはWebKit bugzilla（#153852）でも記録されている。

**この問題は `classList.add` であれ `dataset カウンタ` であれ、どちらのアプローチにも等しく影響する。** つまり記事の主題（classListからdatasetカウンタへの移行）とは**直交する問題**である。

### iOS向けの対処法

確認した情報源での推奨は以下：

1. **iOS 13+ 向けCSSアプローチ**（Ben Frain記事）:

   ```css
   .scroll-locked {
     touch-action: none;
     -webkit-overflow-scrolling: auto;
     overflow: hidden;
     overscroll-behavior: none;
   }
   ```

   `touch-action: none` が鍵。ただし `overscroll-behavior` はSafariでのサポートが限定的。

2. **`position: fixed` + スクロール位置補正**（広く使われるパターン）:
   bodyに `position: fixed; top: -{scrollY}px` を設定し、モーダルクローズ時にスクロール位置を復元する。副作用として画面が一瞬上端にジャンプする場合がある。

3. **iOS 15+でのモダンアプローチ**（pqina記事）:
   `--window-inner-height` CSS変数をJSで同期し、HTMLとbodyにfixed高さとhidden overflowを設定する。

4. **body-scroll-lockライブラリのアプローチ**:
   touchmoveイベントに `preventDefault()` を使ってジェスチャーを抑止する（iOS 15+ではこの手法が機能しなくなったという報告もある）。

**記事への含意**: 参照カウンタ実装を説明した後に「ただしiOS Safariでは overflow: hidden だけでは不十分で、`position: fixed` 補正または `touch-action: none` が追加で必要」と一文添えることが必須。これはiOS固有の独立した問題であり、本記事の主題を弱めるものではない。

---

## 4. 参照カウンタ以外の代替案

### 案A: CSS `:has()` によるDOM依存型ロック

前述の通り、JavaScriptのカウンタを使わず、DOMの存在そのものをロック条件にする。

**利点**: カウントの整合性が壊れない、JSバグが入り込まない、実装が最もシンプル。
**欠点**: DOM上にマウントされ続けることが前提（`display: none` 非表示では機能しない）。アニメーションのためにDOMを残す構成では問題が出る。Firefox 121（2023年12月）より前のバージョンでは使えない。

### 案B: React Context Provider + 中央管理カウンタ

グローバルなContextでロックのカウントやフラグを持ち、各コンポーネントが `lockScroll()` / `unlockScroll()` を呼び出す。

**利点**: Reactの思想に沿っており、複数コンポーネント間の協調が明示的。
**欠点**: Contextのセットアップが必要、Provider外のコンポーネントからは使えない、テストがやや複雑になる。

この方式を論じた記事はいくつか存在するが、「scrollロックのための専用ContextProvider」を紹介したものは少なく、多くはグローバルな状態管理の一例として言及するにとどまる。

### 案C: ライブラリ（body-scroll-lock等）への依存

**出典: https://www.npmjs.com/package/body-scroll-lock**

body-scroll-lockは要素リスト方式で複数ロックを管理する。ただし前述のiOS環境でのバグ（issue #235）や、ライブラリが積極的にメンテされているかという問題（最終リリースが古い）がある。

**利点**: 複数ロック管理・iOS対応・scrollbar width補正など多くの問題を一括解決。
**欠点**: バンドルサイズ増加、既知バグ（iOS非対称挙動）、メンテナンス状況の不透明さ。

### 案D: HTML `<dialog>` 要素のネイティブ利用

モダンブラウザでは `<dialog>` 要素が `showModal()` で開かれると、ブラウザが自動的にスクロールロックを行う（トップレイヤーへの格上げ）。複数のモーダルダイアログが重なる場合もブラウザが適切に処理する。

**利点**: 実装不要、ブラウザネイティブ、アクセシビリティも優れる。
**欠点**: ドロワーやモバイルナビには使いにくい。スタイリングの自由度が制限される場合がある。

### 記事における位置づけ

参照カウンタ（dataset方式）は以下の観点で「他の選択肢より単純」と言える：

- `:has()` 方式より「DOM上の存在」に依存せず、表示状態（isOpen等）とのデカップリングが容易
- Context方式よりプロバイダ設定が不要でどこからでも呼べる
- ライブラリへの依存がない

ただし「最もシンプル」とは言い切れず、`:has()` がユースケースに合えばそちらの方がさらにシンプルである。記事では「CSSの `:has()` が使えない（DOMに残す構成）または古いブラウザも対象の場合、次善策として参照カウンタ方式が最もシンプルな純JS解」という文脈が正確。

---

## 5. 実際のバグ事例（記事の主張を裏付ける実例）

### Bootstrap複数モーダル問題（出典: https://vijayasankarn.wordpress.com/2017/02/24/quick-fix-scrolling-and-focus-when-multiple-bootstrap-modals-are-open/）

Bootstrapで2つ目のモーダルが最初のモーダルを閉じながら開いた場合、正しいcloseイベントが発火せずスクロールロックが残存したり逆に解除されたりするバグが報告されている。提示された修正は参照カウンタではなく「モーダルが閉じたらclassを再付与する」というパッチ的な対処に留まる。

### Drupal body_scroll_lock issue #3123157（出典: https://www.drupal.org/project/body_scroll_lock/issues/3123157）

複数モーダルが連続して開く場面で「1つ目のモーダルのロック解放イベントが発火しないまま2つ目が開く」→「2つ目を閉じると自身のロックのみ解放し1つ目のロックが残存」というシナリオが発生。修正は `clearAllBodyScrollLocks()` を安全策として呼ぶ形（根本的な参照カウンタ実装ではない）。

### body-scroll-lock issue #235（出典: https://github.com/willmcpo/body-scroll-lock/issues/235）

> "Scrolling enabled in browser as soon as enableBodyScroll is called once, regardless of number of locks"

デスクトップ（非iOS）環境では、他にアクティブなロックが残っていても `enableBodyScroll()` を1回呼ぶだけでスクロールが復元されてしまう。これはライブラリ内部でデスクトップ向けのロック解放ロジックが `locks.length === 0` を確認していないために起こる。

---

## 6. 記事の主張の強度と修正提言

### 主張の強さ

「classList.add/remove で実装すると複数コンポーネント同時開放時に壊れる」→ **事実であり、現実に多くの実装で問題が生じていることが確認できる。**（Bootstrap・Drupal・body-scroll-lock自身のissueから）

「dataset を使った参照カウンタ式実装が必要」→ **有力な選択肢の一つとして正確**。ただし「必要」は少し強い表現であり、`:has()` やライブラリ利用でも解決できる。

### 推奨する修正

1. **「必要」→「有効な手法」**: 記事の主張を「参照カウンタが唯一の解決策」ではなく「自前実装するなら参照カウンタが最もシンプル」と表現を修正することで正確性が上がる。

2. **iOS注記は必須**: `overflow: hidden` ベースの実装はiOS Safariでは効かない旨を明記する。これは参照カウンタ方式とは独立した問題。

3. **ライブラリとの比較**: body-scroll-lockがすでに同様の問題を解決しているが、既知バグ（issue #235）があること、外部依存を避けたい場合に自前実装の根拠があることを1〜2文で添える。

4. **`:has()` への言及**: 2023年12月以降のブラウザ対象であれば `:has()` が最もシンプルな解法であることに触れ、「古いブラウザも対象の場合や、アニメーションのためにDOMを残す構成では参照カウンタが適切」と使い分けを示す。

5. **SSRガード**: Next.js / SSR環境では `document` へのアクセスをguardする必要がある（`useEffect` / `useLayoutEffect` 内で `typeof window !== 'undefined'` チェックまたは `useIsomorphicLayoutEffect` を使う）。これは既存記事（usehooks-ts等）でも言及されており、記事の差別化ポイントになりうる。

---

## 7. 記事テーマの変更判断

**テーマ変更は不要**。以下の理由から現在の主張軸は維持できる：

- 日本語圏でこの問題を体系的に論じた記事はほぼ存在しない（独自性は高い）
- 英語圏でも「classList → dataset カウンタ」という具体的な移行を軸にした記事は少ない
- 実際のバグ事例（Bootstrap、Drupal、body-scroll-lock issue）が主張を裏付けている
- ライブラリが解決策として存在するが、自前実装の根拠を補足することで記事の価値を維持できる

ただし、記事の角度として「classList の壊れ方の説明 → dataset カウンタ実装 → iOS Safari への追加対応 → `:has()` による代替案への言及」という構成にすることで、より包括的で読者価値の高い記事になる。

---

## 参考文献（出典一覧）

- [body-scroll-lock GitHub](https://github.com/willmcpo/body-scroll-lock)
- [body-scroll-lock issue #235: enableBodyScroll too early with multiple locks](https://github.com/willmcpo/body-scroll-lock/issues/235)
- [Drupal body_scroll_lock issue #3123157: multiple modals scroll lock fails](https://www.drupal.org/project/body_scroll_lock/issues/3123157)
- [Locking scroll with :has() - Robb Owen](https://robbowen.digital/wrote-about/locking-scroll-with-has/)
- [Preventing body scroll for modals in iOS - Ben Frain](https://benfrain.com/preventing-body-scroll-for-modals-in-ios/)
- [How to prevent scrolling the page on iOS Safari - PQINA](https://pqina.nl/blog/how-to-prevent-scrolling-the-page-on-ios-safari/)
- [useScrollLock - usehooks-ts](https://usehooks-ts.com/react-hook/use-scroll-lock)
- [useScrollLock - shadcn](https://www.shadcn.io/hooks/use-scroll-lock)
- [Prevent Page Scrolling When a Modal is Open - CSS-Tricks](https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/)
- [Create an advanced scroll lock React Hook - LogRocket Blog](https://blog.logrocket.com/create-advanced-scroll-lock-react-hook/)
- [react-remove-scroll npm](https://www.npmjs.com/package/react-remove-scroll)
- [How to fight the body scroll - Medium/React Camp](https://medium.com/react-camp/how-to-fight-the-body-scroll-2b00267b37ac)
- [Bootstrap multiple modals scrolling quick fix](https://vijayasankarn.wordpress.com/2017/02/24/quick-fix-scrolling-and-focus-when-multiple-bootstrap-modals-are-open/)
- [WebKit Bug #153852: body overflow:hidden scrollable on iOS](https://bugs.webkit.org/show_bug.cgi?id=153852)
- [I fixed iOS Safari's scroll lock bug with just CSS - DEV Community](https://dev.to/stripearmy/i-fixed-ios-safaris-scroll-lock-bug-with-just-css-and-made-a-react-package-for-it-2o41)
