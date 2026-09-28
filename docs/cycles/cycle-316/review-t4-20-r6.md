# T4-20 のレビュー 6巡目（T4 の完了の監査の全体の見直し）

HEAD d91cb5b で確かめた。5巡目の指摘への対応（d91cb5b）に加え、T4 の行と棚卸し 11章の論点を見直した。開発サーバーは立てていない（画面の変更が無いため）。

## 1. 5巡目の指摘（d91cb5b）

- **変わったのはコメント・テストの名・1行だけ**: d91cb5b の差分は4ファイル（+14・-21）。コメントの行を除くと、変わったのは `opengraph-image.test.ts` のテストの名（「内容印が内容を表す一字「色」である」）と、`not.toBe("試")` の1行とその直前のコメントの削除だけ。`toBe("色")` は残り、コード・UI の文字列は変わっていない。
- **Minor-1（「店の看板印「試」」）**: 直った。`opengraph-image.tsx:10-11` は「サイトの標章（頭字 y。ogp-image・favicon）とは別の、内容を表す字」となり、今のコードのとおり。`:53` の「colorOverride を渡さず、fuda-image の既定の地（和色）にする」も、`fuda-image.tsx:102-` が `colorOverride` の無いときに id のハッシュで和色へ写すのと合う（`color?.hex` が undefined のとき、偽として扱われる）。
- **Minor-2（bundle-budget・DictionaryDetailLayout）**: 直った。
  - `bundle-budget.test.ts` の Route Group の説明は、今の役目（「いまの src/app に Route Group は無いが、置いたときにもカテゴリを判定できるよう除く」）だけを言う。`src/app` に `(` で始まるディレクトリは無い。例の `(marketing)` は「例:」とした仮の名で、誤解させない。`/play` の注記の「games, quizzes and fortune」は `src/app/play` の中身（ゲーム・クイズ・`daily`）のとおり。数（19・402）を外したのは、古びる数を消すので良い。
  - `DictionaryDetailLayout.test.tsx:7-8` の頭のコメントが挙げる7つ（breadcrumb・children・FAQ・valueProposition・ShareButtons・JSON-LD の個数・PlayRecommendBlock）は、ファイルの `test(` の名と一致する。`(new)`・`legacy`・「撤去」は消えた。

## 2. T4 の行と棚卸し 11章の見直し

- T4 のコミット（`^T4` のメッセージ）が触った `src` の153ファイルを、経緯の語（`撤去`・`廃止`・`かつて`・`フェーズ`・`(new)`・`legacy`・`従来`・`刷新`・`移設`・`cycle-NNN`・`B-NNN`・`reviewer`・`既存挙動` など）で grep した。残るのは次だけで、どれも受け持ちがあるか今の意味である。
  - `src/lib/fuda-image.tsx:99`「未指定なら従来どおり…（既存挙動を完全に保つ）」と `src/lib/__tests__/fuda-image.test.tsx:158`・`:201`（「従来経路」「従来の和色経路」）: index.md の T6 の行が「画像の生成器（…`fuda-image.tsx`）のコメントとテストの名（`fuda-image.test.tsx` の「成果物パレット」など）に残る古い語…と経緯の注記（`fuda-image.tsx` の「従来どおり…既存挙動を完全に保つ」など）を消し」と受け持っている。確かめた。
  - `kanji-kanaru/_lib/storage.ts` の `legacy` のキー: 保存の形の互換という今の意味（5巡目で受け入れ済み）。
  - そのほかの「前は」は「変換前は」「押す前は」など、今の振る舞いの説明。
- 1〜5巡目で確かめた T5・T5a・T6・T7・T8・T9・T10・T11 への受け渡しは、index.md の各行に残っている。T4 の行と棚卸し 11章の24の論点で、済んでおらず渡してもいないものは見つからない。

## 判定: 承認

Major・Minor ともに無し。
