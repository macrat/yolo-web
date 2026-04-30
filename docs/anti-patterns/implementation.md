# 実装段階のアンチパターン

このチェックリストは、実装・コードレビュー時に参照し、過去の失敗パターンに陥っていないかを確認するためのものです。

- AP-I01: レビュー観点に「来訪者にとって最高の体験か」が含まれているか？lint/test/buildのパスだけで「完了」と判断していないか？
  → 形式的な整合性チェックだけでは、計画自体が来訪者価値を損なっている場合に問題を検出できない。（cycle-159で実際に発生）

- AP-I02: オプショナルプロパティの追加や個別ケースのハードコードで問題を回避していないか？根本原因を特定して解決しているか？
  → 場当たり的な解決策は技術負債を積み上げ、サイクルをまたいで類似の問題が再発し続ける。（cycle-149, 151, 152, 153で実際に発生）

- AP-I03: Core Vitalsを含むユーザー体験を無視した設計になっていないか？ バンドルサイズは確認したか？
  → 巨大なデータの静的importはバンドルサイズを増大させ、特に共有コンポーネント経由だと影響範囲が大きい。（cycle-148で実際に発生）

- AP-I04: シェア率・PV・CTRなどの指標を直接の目的として、コンテンツの構成や要素の配置を決めていないか？
  → 指標そのものを直接最適化すると来訪者体験が歪む。（cycle-145で実際に発生）

- AP-I05: 追加するコンテンツが来訪者の実際の目的に無関係で、本来の目的（ツール利用・回答確認等）を妨げていないか？
  → 来訪者が求めていないコンテンツの追加は本来の目的のコンテンツをファーストビューから押し出し、UXが悪化する。（cycle-159で実際に発生）

- AP-I06: 前回の指摘に対して「反対の極端」に振り切っていないか？
  → 指摘への反射的な対応はconstitutionに基づく判断ではなく、別の方向に歪んだコンテンツを生む。（cycle-69, 70, 146で実際に発生）

- AP-I07: Next.js root layout の `<body style={...}>` と `document.body.style.*` 直書きは競合する。
  → layout.tsx の JSX で `<body style={{...}}>` を指定している場合、`useEffect` で `document.body.style.overflow = "hidden"` などを直接書いても、React の reconciliation で style 属性が JSX 由来の値で上書きされて消える。代わりに `classList.add/remove`（例: `"scroll-locked"` クラス）または `dataset.*` で切り替え、CSS 側でルールを書く。jsdom 単体テストでは layout が描画されないため通ってしまうので、Playwright で本番ビルド確認を必須にする。（cycle-171で実際に発生）

- AP-I08: z-index を持つ fixed/absolute オーバーレイの背後に static の操作要素を置くと、タップできなくなる。
  → `position: fixed; z-index: N` の要素は `position: static` の要素より常に前面に来る（スタッキング規則）。操作要素を最前面に置きたい場合は `position: relative; z-index: N+1` を付与する。検証は `document.elementFromPoint()` または Playwright 実機で行う。jsdom は z-index の物理的重ね合わせを評価しないため、テストが pass しても本番で壊れる。（cycle-171で実際に発生）

- AP-I09: Next.js layout の body 属性・CSS スタッキング・production ビルド由来のバグは jsdom 単体テストで検出できない。
  → layout 依存（body 属性、GoogleAnalytics 等）、CSS のレイアウト/スタッキング、production ビルド最適化挙動は、jsdom + 単体 render では再現しない。a11y や視覚に関わる挙動は Playwright で本番ビルド検証を必須にする。（cycle-171で実際に発生）
