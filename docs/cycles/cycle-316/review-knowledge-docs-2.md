# レビュー（2巡目）: docs/knowledge/ 全10ファイルと docs/README.md の knowledge 節

対象: HEAD（6944c450・b71c6fa1）の8ファイルと、作業ツリーの nextjs.md・playwright-mcp.md（未コミット。PM の訂正に従い `git diff` の内容を見た）。

## 判定: 改善指示

## 1巡目の指摘の確認

1. SQL コメントの旧名: 直っている（`docs/sql/quiz-question-dropoff.sql` 155–156 行）。ただし下の指摘 4。
2. ai-agent-communication.md・research-and-verification-techniques.md の冒頭: 範囲を示す見出しと導入文になり、出典は項目の側に移っている。
3. css-modules.md の導入文の編集履歴: 消えている。
4. README の Owner 共有の知見: 61 行に入っている。

全ファイルに「以前は」「書き直した」などの編集の経緯は残っていない（`当時` は根拠の説明の中だけで、経緯ではない）。

## 確かめたこと

### 根拠の表示とサイクル文書の突き合わせ（14件、すべて一致）

nextjs §1（cycle-149 159・207 行、cycle-150 230 行）、§2（cycle-153 268 行の 149KB→140KB、cycle-107 44・61 行）、§3（cycle-150 229・264 行、cycle-151 161 行）、§4（cycle-158 273 行、cycle-217 200・202 行の curl）、§6（cycle-67 10・18 行の 24.86MB→1.1MB）、§7（cycle-89 31 行）、§8（cycle-177 339 行）、§9（cycle-185 68 行の 6.0MB）、§10（cycle-216 17 行の B-463）、§12（cycle-265 57・118 行）、playwright-mcp の cycle-227（112 行・約2日）・cycle-218（277 行・約1日）・cycle-123（157 行）、codegen の cycle-243（108 行）、dependency-security の cycle-286（remediation.md 52 行の 19件、42 行の prettier 3.9.5、98 行の adm-zip 連鎖）、search-console の cycle-300（index.md 68 行）、text-measurement の cycle-216（16 行の 81→27）、ai-agent-communication の cycle-95（58・72 行）と cycle-232（16・117 行）。

### 書き直した主張と現行のコード（すべて一致。ただし css-modules.md を除く、指摘 2）

- nextjs §4: `fortuneStore.ts`・`useIsServerRendered.ts` は `useSyncExternalStore` を使う。nakamawake の `GameContainer.tsx` 242 行に理由付きの `eslint-disable-next-line react-hooks/set-state-in-effect`（HEAD にもある）。`npx eslint --print-config` で `react-hooks/set-state-in-effect: [2]`。
- nextjs §5: nakamawake・irodori の `page.tsx` に `force-dynamic`。
- nextjs §7: `src/middleware.ts` があり `src/proxy.ts` は無い。警告の文言は `node_modules/next/dist/build/index.js` 730 行・`setup-dev-bundler.js` 356 行のとおり。
- nextjs §9: `npx next build --help` に `--webpack`・`--experimental-analyze` がある。
- nextjs §10: `package.json` と `src/` のコードに next-themes は無い（ブログ本文だけ）。`globals.css` 127 行の `@media (prefers-color-scheme: dark)`、`take.ts` の `matchMedia` と `_dark-FAILED`。
- nextjs §11・§12: storybook の `page.tsx` から ReactNode で渡す形、`vitest.config.mts` の alias、`tsconfig.json` の `.next/dev/types/**/*.ts`。
- 版: `next` は 16.3.0 が入っている。`js-yaml ^4.3.0`・`eslint ^9.39.5`・`typescript 6.0.3`・overrides の postcss と eslint-plugin-react-hooks、B-590・B-592・B-617 は backlog にある。
- codegen: フックで回る生成は `generate:release-id` だけ。
- input-events の導入文: 現行の `QuizContainer.tsx` にあるのは 65–71 行の結果のボックスへの即時スクロールとフォーカスだけで、`handleRetry` は `setPhase("intro")` だけ。記述のとおり。
- text-measurement: `locale` は POSIX、`wc -m` は 18、awk は mawk で `LC_ALL=C.UTF-8` でも 18、`node -e` は 6。

### Skill とほかの文書からの参照

frontend-design の SKILL.md 40・62 行が指す「WebKit の折り方を Chromium で近似して測る」「クラウドのコンテナでは MCP のブラウザが起動しない」、nextjs.md §8 が指す「本番ビルドの実機検証の段取り」、analyze-bigquery と new-cycle-idea の catalog が指すファイルは、どれもある。

## 指摘事項

### 1. input-events-and-guards.md §4 の「窓は intro 領域に限れば足りる」は、根拠のサイクル自身の実測で覆っている（必須）

§4 は「上乗せする窓は、2打目が落ちる領域（ここでは intro 領域）に限れば足り、`body` 全体に掛ける必要はない」と書き、「根拠: 実測（上表）」とする。3/15 本で測ったものを「実測」と呼ぶこと以前に、主張そのものが誤っている。

- 表の「0/75」は、`docs/cycles/cycle-301/review-log.md` 265 行のとおり `375×667`・`y = 120〜362` の25点・3本だけの掃引の値である。
- 同じ cycle-301 の `observation-impact.md` §2（36–48 行）は、intro 領域に限った窓のまま本番で2打目が X の共有ボタンに落ちて投稿画面が開くことを再現し（1280×800 で y 702・722、390×844 で y 762）、原因を「窓を intro 領域に限定したこと」とし、窓の外に FAQ の `summary` 5本と共有のボタン群が残ることを挙げている。「0/75」は掃引の範囲の外を見ていなかった、と同じ文書が明記している。
- したがって、「脆弱帯は y≈145–215」「測り直すときは最低でも y=120〜215 を掃く」も、375×667 のその範囲の中の話で、ほかのビューポートでは別の帯（390×844 で概ね y 560–640・740–790）がある。

直し方: 「落ちる先の領域に限れば足りる」を消し、守る範囲は「1打目の座標に、入れ替わったあとに来る操作要素」をビューポートと1打目の位置を振って悉皆で列挙して決める、という形にする。表の「0/75」の行には測った範囲（375×667・y 120〜362・3本）を書き、その範囲の外（共有のボタン・FAQ）では窓の外に落ちて離脱したことを実測（cycle-301）として書く。脆弱帯の記述もビューポートごとに帯が違うことがわかる形にする。「残る12本も同じことが起きるのは推論」の一文は、このとき全体の書き方に合わせて置き直す。

### 2. css-modules.md の用例が現行のコードと合わない（必須）

- §1「プロジェクト内の用例」: `src/app/blog/[slug]/page.module.css` に `.prose :global(.table-scroll)`・`.prose :global(.shiki)`・`.prose :global(.mermaid)` があると書くが、実際にあるのは `.body :global(.mermaid)`（67・72・79 行）だけ。`.prose :global(.table-scroll)` は `src/components/Prose/Prose.module.css` 78・99 行にあり、`:global(.shiki)` はどの CSS にも無い（`.prose :global(.code-comment)` は Prose.module.css 70 行）。
- §2 末段: 「shiki は light と dark の色を inline style の変数（`--shiki-dark` など）で出すため、`src/app/blog/[slug]/page.module.css` で dark のときにその変数へ切り替える」は、いまのコードに無い。`prefers-color-scheme` を書いている CSS は `src/app/globals.css` だけで、`src/lib/highlight.ts` は色を HTML に書かず、注釈を `code-comment` のクラスで包んでトークンで塗る形になっている（同ファイルの頭のコメント）。§2 の「トークンで追従する」の主張をむしろ裏付ける用例なので、`@media` を部品に書く例として挙げている段落は、現に該当する用例があるかを確かめて書き直すか、用例なしの原則として書く。
- §1 の根拠「実測・cycle-171」は、cycle-171（65 行）で実際に hash されたのが `:root.dark`（ToggleSwitch など）であることを添えると、読み手が「markdown のクラスで測った」と誤読しない。

これは 1巡目で見落とした（1巡目の時点で既に食い違っていた）。

### 3. input-events-and-guards.md の「関連」が指す「AP-I14 候補」は、正式の AP-I14 と番号がぶつかる（軽微）

`docs/anti-patterns/implementation.md` 45 行の AP-I14 は「共有の部品の見た目を変えたら全ページを撮り比べる」で、`candidates.md` 157 行の「AP-I14 候補」（守るものが無い組み合わせにも防御を一律に掛けていないか）とは別物である。knowledge 側は候補の見出しの文言で指す（例:「`candidates.md` の『防御的な機構を、それが守るものが無い組み合わせにも一律に掛けていないか』」）。候補の番号そのものの付け直しは candidates.md の担当で、PM が別に扱う。

### 4. SQL のコメントでファイル名が行をまたいでいる（軽微）

`docs/sql/quiz-question-dropoff.sql` 155–156 行は正しい名前になったが、`research-and-` と `verification-techniques.md` に分かれたままなので、ファイル名で検索しても当たらない。1巡目で旧名が見つからなかった原因と同じ形なので、パスを1行に収める。

### 5. 「一次資料で確認」の根拠の書き方（軽微）

search-console-bigquery.md と input-events-and-guards.md §5 は根拠を「一次資料で確認」と書く。事実として正しく、実測・推論より正確な表示だが、README の運用ルールは「実測か推論か」の二択しか挙げていない。README のルールに「一次資料での確認」を加えるか、各項を「一次資料で確認（推論ではない）」と読める形に揃えるか、どちらかにして規則と中身を合わせる。

## 参考（対応は PM 判断）

- nextjs.md §10 の後半（クラスで切り替えるサイトでダークを撮る手順）は、このサイトでは使わない Playwright の撮り方の知見で、主題は playwright-mcp.md に近い。「テーマごとに1ファイル」に照らして置き場所を一度考える価値がある（Next.js 周辺の next-themes の話として nextjs.md に置く判断も成り立つ）。
- nextjs.md の導入文の「Next.js 16.3.0」は、版を上げたときに書き換える必要がある。§7・§13 などの版に結びつく記述と一緒に直すことを忘れないように。

## 次の手順

builder に 1〜5 を直させ、そのあと全体を含めて再レビューを依頼すること。nextjs.md と playwright-mcp.md は作業ツリーの内容で問題を見つけなかったので、コミットできる状態になったらそのままコミットしてよい（再レビューでは差分の有無だけを確かめる）。
