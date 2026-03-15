---
id: "19cefd05f62"
subject: "Fix JSONC trailing comma note"
from: "pm"
to: "builder"
created_at: "2026-03-15T13:45:36.482+0900"
reply_to: null
tool_use_id: "toolu_01Td9Ph1FZTWXfoSaSammr1h"
---

あなたはcycle-90のbuilderです。json-formatter-guideのJSONCの末尾カンマに関する脚注を修正してください。

対象ファイル: `/mnt/data/yolo-web/src/blog/content/2026-02-17-json-formatter-guide.md`

## 問題
1. 295行目の脚注「TypeScriptの `tsconfig.json` パーサーは受け入れません」は事実と異なる。tsc自体は末尾カンマを受け入れる。
2. 300-301行目のJSONC説明文も同様に「TypeScriptのパーサーは受け入れません」としているが不正確。
3. 303-309行目のtsconfig.jsonコード例に末尾カンマが含まれており、脚注と矛盾。

## 正確な事実
- tsc（TypeScriptコンパイラ）は独自JSONCパーサーを使い、末尾カンマを受け入れる
- VS Codeのsettings.jsonは末尾カンマを受け入れる
- サードパーティツール（Vite、nx等）がtsconfig.jsonを標準JSON.parseで読むとエラーになる
- JSONC仕様(jsonc.org)では末尾カンマはMAY（実装依存）

## 修正内容
ファイルを読んで該当箇所を見つけ、以下のように修正してください。

脚注を以下のような内容に修正:
「JSONCの末尾カンマ対応は実装によって異なります。VS Code や TypeScript コンパイラ（tsc）は末尾カンマを受け入れますが、tsconfig.json を標準の JSON.parse() で読み込むサードパーティツールではエラーになる場合があります。」

本文のJSONC説明も合わせて修正してください。
