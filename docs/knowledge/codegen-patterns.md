# コード生成（codegen）パターンの知見

prebuild/predev/pretest/pretypecheck フックで回すコード生成にまつわる技術的知見。現行のフックで回る生成は `scripts/generate-release-id.ts` だけで、これはソースを glob で発見しないため、下の落とし穴は glob で発見する生成を足したときに当てはまる。知見は cycle-243 で実測したもの。

---

## 落とし穴: 機能撤去時、codegen が削除済みファイルを蘇生させる

ソースを glob で発見して生成物を書き出す codegen をフックで回していると、`src/` のソースを削除しただけでは止まらない。撤去した機能の生成物（registry 等）が prebuild のたびに再生成され、「削除済みモジュールを import する壊れたファイル」として蘇る。

- 機能を撤去するときは、`src/` 配下だけでなく、生成元スクリプト（`scripts/generate-*.ts`）側の発見・書き出しロジックも撤去範囲に含まれる。
- 単独の `npx tsc --noEmit` は prebuild を回さないためこの再生成を検出できない。`.next` をクリーンした `next build`（prebuild → tsc を通す）でのみ型エラーとして顕在化する。

根拠: 実測（cycle-243）。cheatsheet 機能の撤去で、当時の registry 生成スクリプトが削除済みの `src/cheatsheets/` の registry を再生成し、`next build` の型検査が落ちた。単独の `npx tsc --noEmit` では検出できず、`.next` をクリーンしたフルビルドで顕在化した。生成元から cheatsheet の生成を撤去して解消した。
