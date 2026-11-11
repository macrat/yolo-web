# 依存パッケージの脆弱性対応・一括更新・peer の衝突

Dependabot アラート / `npm audit` が報告する脆弱性の優先度の決め方と、溜まった依存更新を安全に一括で当てるための知見。自動PRを個別にマージするだけで済まない規模のアラート群に当てはまる（運用上の入口は `.claude/skills/new-cycle-idea/catalog/address-to-security-and-dependency-issues.md`）。脆弱性と更新の知見は cycle-286（B-505: open 20件のアラートへの対応）で得たもので、実例の詳細は `docs/cycles/cycle-286/` にある。最後の節は、依存の optional peer がルートの版と衝突して `npm ci` が止まる件で、原因は cycle-313 で突き止めた。

## 優先度は「深刻度」でなく「到達性」で決める

Dependabot の high/medium/low は CVSS(最悪ケース)評価であって、このサイトでの緊急度ではない。GitHub 既定ソート「Most Important」も scope と reachability を考慮している。**緊急に個別対応すべきか**は次の3問で決める(上から順に問うと多くが「緊急でない」に落ちる):

1. その依存は来訪者に配信されるコードに乗るか。ブラウザバンドル / SSR 経路なら runtime。ビルド・テスト・lint 専用や手動スクリプト専用なら development scope で来訪者に届かない(`package.json` の deps/devDeps 区別が出発点だが、実際に配信物へ乗るかまで見る)。
2. runtime に乗るとして、脆弱コードが処理する入力を攻撃者が制御できるか。入力が「自サイトの著作コンテンツ(ブログ Markdown 等)」や「来訪者自身がツールに打ち込む入力(self-harm)」に限られるなら他者を害さない。
3. 害が出るとして、他の来訪者に届く経路(保存→別来訪者へ配信=stored-XSS の温床)があるか。このサイトは認証・DB・サーバ側ユーザーデータを持たない静的中心構成なので、stored 経路が構造的に存在しない。

3問すべてを通って「他の来訪者を害せる」に至ったものだけを最優先で個別対応する。それ以外は下記の一括更新でまとめて処理する(「直さない」ではない)。到達性は優先度を決めるためのもので、対応範囲を狭める根拠にはならない。

根拠: 確認（cycle-286）。open 20件(high 3 はすべて development scope)の依存と入力の経路を読んで3問で分類し、20件すべてが「他の来訪者を害せない」に落ちた(判定表は `docs/cycles/cycle-286/reachability.md`)。

## 一括更新は「検証」で安全にする

急ぐものが無ければ、溜まった更新は「全部最新に上げる」で処理する(脆弱性を個別に追うより発生源=陳腐化を減らせる)。ただしメジャー更新は非自明な場所で壊れ、部分的な自動チェックでは見つからない。更新後は次を上から全部通す(1つでも飛ばすと取りこぼす):

- `npm run lint` — lint プラグイン基盤のメジャー非対応クラッシュ(例: eslint 10 / TS 7 で typescript-eslint・plugin-react が実行時例外)はここで出る。
- `npm run format:check` — フォーマッタ更新(prettier 等)による再整形は差分に出る。公開コンテンツに載せたコード例まで再整形されていないか差分を見る。
- `npm run test` — メジャーの API 破壊(例: js-yaml 4→5 の import 破壊)はここでテストが落ちる。
- `npm run build` — テストが拾わない生成・バンドル時の破壊はここで出る。
- 描画の目視 — 数字上は全通でも表示だけ変わる種類(描画ライブラリ mermaid/shiki/marked、画像生成 sharp)は画面を開くまで分からない。

サブエージェントやツールの部分的 PASS 自己申告を「安全になった証拠」と読まない。test と build まで自分で通し、描画は目で見る。

根拠: 実測（cycle-286）。全依存を最新へ上げたとき、eslint 10 は plugin-react がルール読込時に例外、TS 7 は typescript-eslint 8 が範囲外で lint がクラッシュ、js-yaml 5 は build と yaml-formatter のテスト19件を破壊した。prettier 3.9.5 への更新では公開ブログ記事1件のコード例が再整形された。mermaid 図・shiki+marked・sharp の OGP 画像は本番との目視比較で退行なしを確かめた(詳細は `docs/cycles/cycle-286/remediation.md`)。

## 壊れたメジャーの扱い

- セキュリティ修正が同一メジャー内の最新で足りるなら、破壊するメジャーへ無理に上げない(例: js-yaml の脆弱性は 4.2.0 で patched=4.x 最新で充足。5 へ上げる理由なし)。
- 周辺エコシステム(lint プラグイン等)が新メジャー未対応なら据え置き、対応後に再挑戦する(eslint 10 / TS 7 は B-590 で追跡)。
- 修正が破壊的変更でしか塞げず、かつ来訪者に届かない dev 専用連鎖なら、その依存自体の要否を見直す。生成物がコミット済みで手動スクリプト専用なら、依存ごと除去するのが最もクリーン。

根拠: 実測（cycle-286）。js-yaml は ^4.3.0、eslint は ^9.39.5、typescript は 6.0.3 に据え置いた。残った high 3件は手動専用の生成スクリプトだけが使う `@huggingface/transformers` 経由の adm-zip 連鎖で、依存ごと除去して audit 0 にした。

## overrides はドリフトさせない

推移的依存を patched 版へ固定する `overrides` は、親が自然に patched 版を引くようになったら外す。ピンを残し続けると upstream から乖離する。

根拠: 推論（cycle-286）。`package.json` の postcss / eslint-plugin-react-hooks の override はこのとき入れたもので、解消は B-592 で追跡している。

## `npm ci` の `Missing: typescript@5.9.3` は optional peer の衝突で、環境の制約ではない

npm 10 の `npm ci` が `Missing: typescript@5.9.3 from lock file` で止まるのは、このリポジトリの依存の衝突による。`vite-tsconfig-paths` の下の `tsconfck` が `typescript@^5.0.0` を optional peer に持ち、ルートの `typescript`（6.0.3）がそれを満たさない。npm 10 は、それを満たす入れ子の typescript（`node_modules/vite-tsconfig-paths/node_modules/typescript` の 5.x）を lock に求め、lock にその入れ子が無いと止まる。入れ子を持つ lock は npm 10 でも npm 11 でも通る。入れ子の有無は lock を書いた npm によって変わり、lock の履歴には入れ子を足すコミットと消すコミット（Dependabot のものを含む）が並んでいる。

CI（`.github/workflows/deploy.yml`）が Node 24（npm 11）で通り、作業のコンテナ（npm 10）でだけ止まるため、npm の版の違い、つまり環境の制約に見える。しかし原因は依存の木にあり、根から直せる（cycle-313 は、これを環境の制約として扱ったことを事故とした。incident-7）。

- **根からの直し方**: `vite-tsconfig-paths` を外して Vite の `resolve.tsconfigPaths` に移す（Vite はネイティブのパス解決を持ち、テストを走らせるたびにその案内を出している）。`tsconfck` ごと消えて、衝突そのものが無くなる。cycle-313 でこれを入れて `npm ci` とゲートが通ったが、cycle-313 の成果物の revert で戻され、`vitest.config.mts` と `package.json` はいまも `vite-tsconfig-paths` を使う。
- **回避**: lock が入れ子を持たないときは、lock を書き換えずに `npx -y npm@11 ci` で入れる。cycle-314 からはこの回避で入れている。回避は作業のコンテナでの `npm ci` を通すだけで、衝突は依存の木に残る。

根拠: 確認と実測。原因と根からの直し方は cycle-313（`docs/cycles/cycle-313/incident-7.md`・`incident-8.md`、コミット 684c89f5）、回避は cycle-314・cycle-315 の index.md。cycle-316 で、入れ子の無い origin/main の lock は npm 10.9.7 の `npm ci` で止まって npm 11 で通り、入れ子のある lock は両方で通ることを再現した。
