# 事故報告: Next.js の agentRules 自動生成が、AI の動作指示ファイル CLAUDE.md を書き換えていた

## 0. 結論

- `next dev`（Next.js 16.3+ の既定 ON の機能）が、AI コーディングエージェントを検出すると `nextjs-agent-rules` ブロックを **CLAUDE.md に自動 upsert** していた。サブエージェントが `npm run dev` を回すたびに発火していた。
- **CLAUDE.md は Claude Code（PM と全サブエージェント）が読んで従う動作指示そのもの**である。外部ツールがそこへ書き込むのは、コミットの有無に関係なく**現に読み込まれる指示の完全性を損なう**重大事故であり、プロジェクトの継続を危うくする。注入ブロックは末尾で「これをコミットして木をきれいに保て」と**エージェントに自己増殖を指示**していた。
- **わたし（PM）はこれを一次確認せず「dev ノイズ・未コミットのまま無害」と断じ、複数回そう報告した。** これは AP-P04（他者/文書の主張を検証せず採用）・AP-WF06（未確認情報の伝播）・AP-WF27（都合よく軽微に見せる断定）の再演。
- **是正**: `next.config.ts` に公式 opt-out **`agentRules: false`** を追加し、注入ブロックを CLAUDE.md から除去した。`agentRules: false` の下で `next dev` を起動しても CLAUDE.md が書き換わらないことを**実測で確認**した。

## 1. 何が起きたか（一次資料で確認した機構）

- 実装: `node_modules/next/dist/server/lib/generate-agent-files.js`。冒頭コメント逐語:「Auto-generate AGENTS.md / CLAUDE.md with the managed Next.js agent-rules block when `next dev` detects an AI coding agent but the block is missing.」
- 書き込みロジック `writeAgentFiles(projectDir)`:
  - **AGENTS.md が存在し（ブロックを持つ or CLAUDE.md がブロックを持たない）** → AGENTS.md に upsert・CLAUDE.md は skip。
  - **上記でなく CLAUDE.md が存在** → **CLAUDE.md にブロックを upsert**。
  - 両方無い → 両方を新規作成（AGENTS.md にブロック・CLAUDE.md に `@AGENTS.md`）。
  - 本プロジェクトは **AGENTS.md 不在・CLAUDE.md 存在**（`ls AGENTS.md` → 不在で確認）なので、2番目の分岐に落ち **CLAUDE.md に書き込まれる**。
- 発火条件: `node_modules/next/dist/server/lib/app-info-log.js` `ensureAgentRulesForDev(dir)`:「`if (await getAgentName() === null) return null;`（AI エージェント検出時のみ）／`if (hasCurrentAgentRules(dir)) return null;`（既に在れば skip）／else `writeAgentFiles(dir)`」。
- ゲート: `node_modules/next/dist/server/lib/start-server.js:418-420`:「`// Gated on agentRules in next.config (default true).` `if (initResult.agentRules !== false) { ... ensureAgentRulesForDev(dir) ... }`」。既定 `true`＝生成 ON。
- 公式ガイド `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`:「On Next.js 16.3 or later, run `next dev`. When an AI coding agent is detected … Next.js auto-generates AGENTS.md and CLAUDE.md」「If you really want to opt out, set `agentRules` to `false` in your config」。
- 設定スキーマ: `config-schema.js:496`「`agentRules: z.boolean().optional()`」・型 `agentRules?: boolean`（トップレベル）。

## 2. 重大度の訂正（「無害」は誤り）

わたしは当初これを「未コミットのまま無害」とした。**誤りである。**

- **CLAUDE.md は Claude Code の動作指示**であり、セッション中に読み込まれるのは**作業ツリーの実ファイル**である。コミットしていなくても、`next dev` が走ったセッションでは、わたしの指示は外部注入された内容で増補されていた。
- 注入ブロックは「Removing it from a diff only re-creates the uncommitted change; **committing it with your work keeps the tree clean**」と、**エージェントに自らの永続化（コミット）を指示**していた。外部ツールが AI の指示ファイルに「自分をコミットしろ」と書き込む構造は、指示の乗っ取り／自己増殖にあたる。
- したがってこれは「dev ノイズ」ではなく、**AI 運営プロジェクトの根幹（指示ファイルの完全性）を外部依存が握れる状態**という、継続を危うくする事故である。

## 3. わたしの失敗

- サブエージェント（P2b レビュアー）の「next dev が自動生成する dev ノイズ」という報告と、ブロック本文の自己申告（「verify at generate-agent-files.js」）を、**自分で一次確認せず事実として採用し、複数回そのまま報告した**（AP-P04・AP-WF06）。
- 「未コミットだから無害」と、**指示ファイルの完全性という論点を測らずに軽微へ丸めた**（AP-WF27）。オーナーの指摘（Claude Code は CLAUDE.md に従う＝極めて有害）で初めて論点を正した。

## 4. 根本原因（なぜ「今」起きたか——一次資料で特定）

**起点は Next.js のマイナー更新である。** `git log -S '16.3.0' -- package.json` で特定:

- **コミット `07803895`（2026-08-07・cycle-302「脆弱性を0にした」）が `next` を `16.2.10` → `^16.3.0` に更新した。** これが事故の起点。
- **agentRules（AGENTS.md/CLAUDE.md への自動書き込み）は Next.js 16.3 で新設された既定 ON の機能**（公式 `docs/.../upgrading/version-16.md` と `ai-agents.md`「On Next.js 16.3 or later」で確認。16.2.10 には無かった）。したがって 16.2.10 まではこの事故は起き得ず、16.3.0 への更新で有効化された（オーナーの見立て「最近 Next.js が更新された」と一致）。
- **プロセス上の根**: この 16.2.10→16.3.0 更新は、cycle-302 の**スコープ外の脆弱性対応**（self-audit と cycle-302 事故報告が「サイクルの目的の外」と認めた作業）の中で行われ、**マイナー版の新規既定挙動（＝プロジェクトの指示ファイル CLAUDE.md への自動書き込み）を確認せずに**取り込まれた。マイナー更新が「指示ファイルを書き換える新既定」を持ち込み、それが見過ごされた。
- **構成要因**: AGENTS.md 不在・CLAUDE.md 存在のため、書き込み先が CLAUDE.md に向いた（`writeAgentFiles` の分岐・§1）。
- **副次のリスク**: 指定は `^16.3.0`（caret）で、将来の `npm install` が 16.x の新版を自動で引く。ただし下記 §5 の `agentRules: false` は 16.x の当該ゲートを閉じるので、版が上がっても書き込みは起きない（挙動そのものの改名等が来た場合の保険は §6 のフック）。

## 5. 是正（実測で検証）

- `next.config.ts` にトップレベルで **`agentRules: false`** を追加（`ensureAgentRulesForDev` のゲート `agentRules !== false` を閉じる。理由コメント併記）。
- 注入ブロックを CLAUDE.md から除去（HEAD と一致）。
- **実測検証**: `agentRules: false` の状態で `timeout 30 npm run dev` を実行（`✓ Ready in 355ms`）。起動後 `git diff CLAUDE.md` は **0 行**＝書き込まれない。ログに「Generated … for AI agents」も出ない。過去のサブエージェントの dev 実行では実際に書き込まれていた（本事故の発端）ので、無効化が効くことの対照になっている。
- `npm run typecheck` 通過（`agentRules` は型に存在）。

## 6. 再発防止

- **根本の技術的無効化は `agentRules: false`（適用済み）** で、これが `next dev` の書き込み経路そのものを閉じる。自分の判断に依存しない（AP-WF28 の「守れない自己ルール」ではなく、設定による強制）。
- **防御の多層化（提案）**: 将来 Next.js の挙動変更や設定の巻き戻しで再発しうるので、`CLAUDE.md`/`AGENTS.md` に `<!-- BEGIN:nextjs-agent-rules -->` マーカーが現れたらコミットを弾く/警告する軽量フックを検討する（`.claude/hooks/` の既存 pre-commit 系に相当）。ただし一次の是正は上記の config で足りるため、フックは belt-and-suspenders。→ backlog 起票。
- **プロセス面①（起点への対処）**: フレームワークの**マイナー/メジャー更新時は、リリースの新規既定挙動（とくにプロジェクトのファイル・設定・指示を書き換えるもの）を changelog / アップグレードガイドで確認してから取り込む**。今回は 16.2→16.3 のマイナー更新が「CLAUDE.md を書き換える既定 ON 機能」を持ち込んだのを見過ごした。依存更新（脆弱性対応含む）を本題のサイクルに混ぜず専用枠でやる先例（B-505・cycle-286）が守られていれば、更新の影響確認の機会もあった。
- **プロセス面②（検知）**: 「外部ツールが生成した差分」を無害と断じる前に、その差分が**どのファイルに乗っているか**（とくに指示・規約・設定ファイル）と**何を書いているか**を一次確認する。指示ファイル（CLAUDE.md 等）への外部書き込みは、内容の如何を問わず重大扱いする。

## 7. 影響範囲

- **コミット履歴**: `git log -S "nextjs-agent-rules" -- CLAUDE.md` は **0 件**。ブロックが CLAUDE.md にコミットされたことは一度もない（本サイクルでも過去サイクルでも）。
- **ライブの指示**: ただし `next dev` を回したセッション中は、作業ツリーの CLAUDE.md にブロックが乗った状態でエージェントが動いていた（内容は「バンドル docs を読め」等で、実害の観測は困難だが、指示の完全性が損なわれていた事実は残る）。今後は `agentRules: false` で発生しない。
- **AGENTS.md**: 不在のまま（作らない。CLAUDE.md を指示の単一の正典に保つ）。
