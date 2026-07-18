# cycle-286 依存更新 remediation（Latest 一括更新 → 4コマンド全green へ収束）

実施日: 2026-07-18 / 実施担当: dependency remediation agent
方針: 全依存を可能な限り Latest に維持しつつ、破壊するメジャーだけを最小限に巻き戻す。**アプリのロジック/挙動（実行時の振る舞い）は変更しない**。ただし prettier 3.8.3→3.9.5 の昇格に伴い、リポジトリ全体が新 prettier の整形に**再フォーマット**される（下記「変更ファイル」に明記。整形のみ・ロジック不変）。コミットは PM がまとめる。

前段で全依存を一括で Latest へ上げた結果、`build` と `test` が壊れていた状態からの収束作業。

## 最終結果: 4コマンド全 PASS（実行ログ）

| コマンド               | 結果 | 実出力（要点）                                                                                              |
| ---------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| `npm run lint`         | PASS | `eslint .` → exit 0（違反なし・出力なし）                                                                   |
| `npm run format:check` | PASS | `All matched files use Prettier code style!`                                                                |
| `npm run test`         | PASS | `Test Files  323 passed (323)` / `Tests  5461 passed (5461)`・0 failed                                      |
| `npm run build`        | PASS | `✓ Compiled successfully in 26.0s` / `✓ Generating static pages using 3 workers (4128/4128) in 62s`・exit 0 |

## Latest を維持した依存の一覧

前段の一括更新のうち、破壊しなかったため **Latest のまま維持**したもの:

### 直接依存（dependencies）

| pkg                                                                                      | バージョン | 備考                                     |
| ---------------------------------------------------------------------------------------- | ---------- | ---------------------------------------- |
| feed                                                                                     | ^6.0.0     | メジャー更新。テスト失敗ゼロ・build 成功 |
| next                                                                                     | 16.2.10    |                                          |
| react                                                                                    | 19.2.7     |                                          |
| react-dom                                                                                | 19.2.7     |                                          |
| sharp                                                                                    | ^0.35.3    | メジャー更新（0.34→0.35）。失敗ゼロ      |
| marked                                                                                   | ^18.0.3    |                                          |
| shiki                                                                                    | ^4.0.2     |                                          |
| diff / fuse.js / mermaid / next-themes / qrcode-generator / sanitize-html / marked-alert | 現状維持   | 変更なし・全 PASS                        |

### 開発依存（devDependencies）

| pkg                  | バージョン | 備考                               |
| -------------------- | ---------- | ---------------------------------- |
| @types/node          | 26.1.1     | メジャー更新（25→26）。失敗ゼロ    |
| @types/react         | 19.2.17    |                                    |
| @vitejs/plugin-react | 6.0.3      |                                    |
| eslint-config-next   | 16.2.10    |                                    |
| prettier             | 3.9.5      |                                    |
| vitest               | 4.1.10     |                                    |
| eslint               | ^9.39.5    | 9系の最新（10 は下記理由で不採用） |
| typescript           | 6.0.3      | 6系の最新（7 は下記理由で不採用）  |

## 攻めたが壊れて戻したメジャー（実エラー＋理由）

### 1. js-yaml 5.2.1 → **^4.3.0**（戻した）

- **build 失敗**: `src/tools/yaml-formatter/logic.ts` の `import yaml from "js-yaml"` に対し「requested export doesn't exist」。js-yaml 5 の破壊的 API 変更が原因。
- **test 失敗 19 件**: 全て `src/tools/yaml-formatter/`（`logic.test.ts`・`YamlFormatterTile.test.tsx`）に限局。`formatYaml`/`validateYaml`/`yamlToJson` = `yaml.load` / `yaml.dump` / `yaml.YAMLException` / `e.mark` の呼び出し由来（これらは js-yaml 4 の API）。
- **判断**: 脆弱性 GHSA-h67p-54hq-rp68 は **patched:4.2.0**。js-yaml **^4.3.0（4.x 最新）でセキュリティは完全充足**し、js-yaml 5 に安全上の利点はなく破壊のみ。よって 4.3.0 へ戻した。
- **付随**: js-yaml 4 は型を同梱しないため、devDeps に `@types/js-yaml: "^4.0.9"` を復活（前段で js-yaml 5 採用時に削除されていた）。
- **確認**: 4.3.0 へ戻して `npm install` 後、`npm run build` 成功・`npx vitest run src/tools/yaml-formatter` = `Test Files 2 passed / Tests 42 passed`。**yaml-formatter のロジック/テストのコードは一切変更していない**（4 の API に戻すだけで元々通っていたコードがそのまま通った）。

### 2. typescript 7.0.2 → **6.0.3**（戻した）

7.0.2 で `npm install` 後、4 コマンドを実行:

- **lint 失敗（決定的）**:
  ```
  TypeError: Cannot read properties of undefined (reading 'Cjs')
    at .../eslint-config-next/node_modules/typescript-eslint/node_modules/@typescript-eslint/typescript-estree/dist/create-program/shared.js:59:18
  ```
  根因: `typescript-eslint@8.64.0`（eslint-config-next 16.2.10 が同梱）の peer は `typescript@">=4.8.4 <6.1.0"`。TS 7 は範囲外で、内部 API 参照が undefined になり実行時クラッシュ。
- **build 失敗**: Next.js の型チェック段で
  ```
  Running TypeScript ...
  It looks like you're trying to use TypeScript but do not have the required package(s) installed.
  ...
  The "id" argument must be of type string. Received undefined
  Next.js build worker exited with code: 1
  ```
  Next 16.2.10 の TypeScript 検出が TS 7 を認識できずワーカーが異常終了。
- **参考（重要）**: `tsc --noEmit`（`npm run typecheck`）自体は **exit 0 で PASS** した。つまりアプリのソースコードは TS 7 でも型チェックを通る。壊れているのは**周辺ツール（typescript-eslint 8・Next の TS 検出）が TS 7 未対応**という一点。
- **判断**: これは型注釈の軽微な追随では解消せず、eslint-config-next / typescript-eslint / Next 本体のメジャー更新を待つ必要がある。挙動を変えず・エコシステム待ちのため 6.0.3 へ据え置き。

### 3. eslint 10.7.0 → **^9.39.5**（戻した）

10.7.0 で `npm install` 後:

- **install 時 peer 競合**（eslint-config-next 16.2.10 同梱プラグインが eslint 10 を拒否）:
  - `eslint-plugin-import@2.32.0` peer `eslint@"^2 || ... || ^9"`（Conflicting peer: eslint@9.39.5）
  - `eslint-plugin-jsx-a11y@6.10.2` peer `eslint@"^3 || ... || ^9"`
- **lint 実行時クラッシュ（決定的）**:
  ```
  TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function
    at .../eslint-config-next/node_modules/eslint-plugin-react/lib/util/version.js:31:100
  ```
  根因: eslint 10 が非推奨 API `context.getFilename()` を削除。eslint-config-next 同梱の `eslint-plugin-react` が旧 API を呼び続けており、ルール読込時に例外。
- **判断**: eslint プラグインエコシステム（plugin-react / plugin-import / plugin-jsx-a11y、いずれも eslint-config-next 配下）が eslint 10 未対応。9 系最新の `^9.39.5` へ据え置き。

## 残 3 high の解消（完了処理中の追加対応・B-591 完遂）

当初は下記を「据え置き（B-591）」としていたが、push 後の CI 確認（完了手順8）で **Dependabot の adm-zip セキュリティ更新ジョブが main に対して失敗**していた（`npm_and_yarn in /. for adm-zip - Update`。私のコミットの build/test/typecheck/lint/Deploy は全て success）。原因は下記の残 3 high で、放置すると赤 CI が永続する。AP-WF15 の判断軸（来訪者影響なし・**本サイクル＝脆弱性対応の目的そのもの**・規模小・放置の永続化を回避）で評価し、別サイクル先送りでなく本サイクル内でクリーンに解消した。

- **残 3 high**: `adm-zip <0.6.0`（GHSA-xcpc-8h2w-3j85）→ `onnxruntime-node` → `@huggingface/transformers` の devDep 単一連鎖。
- 一次確認: `@huggingface/transformers` を import するのは `scripts/generate-kanji-embeddings.ts` **ただ1ファイル**（`grep` 確認）。この生成スクリプトはどの npm script（prebuild/build/test）・CI からも呼ばれない**手動専用**で、生成物 `src/data/kanji-embeddings-384.json` は**コミット済み**（実行時・ビルド時はこの JSON を使い、transformers は使わない）。
- 対応: `@huggingface/transformers` を devDependencies から**除去**し、唯一の利用者 `scripts/generate-kanji-embeddings.ts` を**削除**（埋め込みの再生成手順は git 履歴から復元可能。再生成時のみ transformers を再インストールする）。`analyze-embedding-thresholds.ts` は fs/path のみ利用で transformers 非依存のため残置。
- 結果: adm-zip / onnxruntime-node / transformers の連鎖ごと消え、**npm audit = 0**。4 コマンド全 PASS（test 5461・build 4128）を再確認。**B-591 は解消（Done）**。

## 最終 overrides とその理由

```json
"overrides": {
  "postcss": "^8.5.10",
  "eslint-plugin-react-hooks": "7.0.1"
}
```

- **postcss ^8.5.10**: 推移的依存（next / sanitize-html / vite 経由）を patched 版（GHSA-qx2v-qp2m-jg93 対応）へ固定。同一メジャー内の minor/patch のみ。
- **eslint-plugin-react-hooks 7.0.1（ピン）**: 7.1.1 は 4 サイトの**正当かつ意図的な effect** を新規に警告する lint 挙動変更を含む。devDep（来訪者に無関係）・安全価値ゼロ・可逆であり、不要なコード改変を避けるため 7.0.1 に固定。

### prettier 3.9.5 は採用（react-hooks ピンとの判断差の明示）

- **react-hooks は 7.0.1 にピン**したのに **prettier 3.9.5 は採用**したのは非一貫に見えるが、churn の質が違う。react-hooks 7.1.1 は**正しいアプリコードに `eslint-disable` を手で足す＝挙動を変えないが人手の判断を伴うコード改変**を要求する。prettier 3.9.5 は**機械的な整形のみ**（union 型の単一行化・arrow の折り返し等。ロジック・型の意味は不変）で、リポジトリの「正」フォーマットは常にインストール版 prettier が定義するため、採用＝一度きりの再整形で以後安定する。整形 churn は機械的・可逆・検証済み cosmetic であり、依存を最新に保つこと（constitution Rule 4 の品質）に資するため PM 判断で採用した。

## npm audit 件数の推移

| 時点                        | total | high  | 内訳                                                        |
| --------------------------- | ----- | ----- | ----------------------------------------------------------- |
| cycle-286 着手前            | 13    | 6     | low2 / moderate5 / high6（複数連鎖）                        |
| 一括更新＋メジャー戻し後    | 3     | 3     | adm-zip / onnxruntime-node / @huggingface/transformers 連鎖 |
| transformers 除去後（最終） | **0** | **0** | 脆弱性なし                                                  |

- Latest 一括更新で推移的依存が patched 版へ解決され残 3 に収束、さらに build 専用の transformers 連鎖を除去して **audit 0** に到達。

## 変更ファイル

依存の実体変更:

- `package.json`（js-yaml `^4.3.0` へ・`@types/js-yaml ^4.0.9` 復活・typescript/eslint は最新メジャー不採用で 6.0.3 / ^9.39.5 維持・prettier 3.9.5 等 Latest・overrides 確定・**`@huggingface/transformers` を devDependencies から除去**）
- `package-lock.json`（上記反映。transformers/onnxruntime-node/adm-zip 連鎖が消滅）
- `scripts/generate-kanji-embeddings.ts` を**削除**（transformers の唯一の利用者・手動専用。埋め込み JSON はコミット済み・再生成手順は git 履歴に保存）

prettier 3.9.5 昇格に伴う**再フォーマット（整形のみ・ロジック不変）= 計 28 ファイル**（`package.json`/`package-lock.json` の依存変更・本サイクルの文書編集は別途。内訳の合計＝13＋14＋1＝28）:

- ソース 13 ファイル（`.ts`×10・`.tsx`×3。union 型の単一行化等）
- 内部ドキュメント 14 ファイル（`docs/archive/`・過去 cycle 文書・`docs/research/` 等。来訪者非公開）
- **公開ブログ記事 1 件**: `src/blog/content/2026-02-14-nextjs-static-tool-pages-design-pattern.md`。本文中の `typescript` コード例（`ToolCategory` union 型）が多行→単一行に整形された。**来訪者が見る表示が変わる**。ただし (1) prettier の機械的整形でコードの意味は不変、(2) 整形後は実ソース `src/tools/types.ts`（同じく単一行化）と一致し記事とコードの整合が保たれる、(3) 記事の散文は当該コードのレイアウトに言及しない、ため内容上の害はない（cosmetic）。※この記事を個別にスクショ検証はしていないが、変更はソース 13 ファイルと同一種の機械的整形であり、コードブロックの shiki 描画は別記事（cron-cheatsheet）で目視検証済み（index.md「目視確認」）＝同一描画経路で退行なし。

サイクル文書（本 remediation.md・reachability.md・index.md・incident-1.md）と AP 文書・backlog も本サイクルで更新。

コミットは PM がまとめて実施（本作業では行わない）。
