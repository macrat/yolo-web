# コード生成（codegen）パターンの知見

prebuild 時コード生成（現行は `scripts/generate-release-id.ts`）にまつわる技術的知見。

---

## 1. 落とし穴: 機能撤去時、codegen が削除済みファイルを蘇生させる

prebuild/predev/pretest フックの codegen は、`src/` のソースを削除しただけでは止まらない。glob で発見した `meta.ts` を元に生成物を書き出すため、撤去した機能の生成物（registry 等）が prebuild のたびに再生成され、「削除済みモジュールを import する壊れたファイル」として蘇る。

- 機能を撤去するときは、`src/` 配下だけでなく、生成元スクリプト（`scripts/generate-*.ts`）側の発見・書き出しロジックも撤去範囲に含まれる。
- ツールチェーンの性質: 単独の `npx tsc --noEmit` は prebuild を回さないためこの再生成を検出できない。`.next` をクリーンした `next build`（prebuild → tsc を通す）でのみ型エラーとして顕在化する。
- cycle-243 で cheatsheet 撤去時に実際に発生（生成元から cheatsheet 生成を撤去して解消）。
