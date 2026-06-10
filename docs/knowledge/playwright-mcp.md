# Playwright MCP ツールの挙動と安全な使い方

サブエージェント（reviewer / researcher 等）や PM が Playwright MCP（`mcp__playwright__*`）で実機検証するときの落とし穴と安全策。

## 無限待機する JS がエージェントを長時間ハングさせる（最重要）

**事象**: `mcp__playwright__browser_evaluate` に **解決しない Promise を返す関数**を渡したり、`mcp__playwright__browser_wait_for` で**永遠に満たされない条件**を待たせると、その MCP 呼び出しが返らず、エージェントが応答待ちのまま停止する。バックグラウンド/フォアグラウンドを問わず、PM 側は「完了通知が来ない＝作業中」と解釈してしまい、ハングと進行中を区別できない。

- **実例（cycle-227）**: サイクル全体の最終検証 reviewer が Playwright で無限待機する JS を実行してフリーズし、**約2日間**停止していた（Owner が気付いて停止）。完了通知が出ても、その過程が破綻していれば結果は信用できない。
- 同族の先行事例: WebFetch の prompt 要約呼び出しによる調査エージェントのハング（cycle-218）。→ `docs/anti-patterns/workflow.md` AP-WF18 候補。

**やってはいけない書き方**:

- `browser_evaluate` に `async () => { await new Promise(() => {}) }` のような**永遠に解決しない Promise**を返す関数。
- `browser_evaluate` 内で `while (条件) {}` 等の**busy-wait／無限ループ**。
- 出現しない要素・発生しないイベントに対する `browser_wait_for`（タイムアウト無しの実質無限待ち）。
- `setInterval`/`requestAnimationFrame` で**ポーリングし続ける**関数を `evaluate` で起動して結果を待つ。

**安全な書き方**:

- `browser_evaluate` に渡す関数は**同期、または即座に解決する**ものにする。状態は「その時点のスナップショット」を読んで返す（例: `document.querySelectorAll(...).length` や `getComputedStyle(...)` の値を集めて return）。
- 「変化を待つ」必要があるときは、**待たずに**「操作 → 別の evaluate で結果を読む」の2ステップに分ける。React 制御 input は native setter＋`input` イベント dispatch で同期的に反映され、直後の evaluate で出力を読める（cycle-227 で実証）。
- どうしても待つ場合は**必ず有限のタイムアウト**を設け、満たされなくても返るようにする（`Promise.race` でタイムアウト Promise と競わせる等）。
- ページ遷移の有無を確認したいときは、無限待機ではなく **`window` にマーカーを置き（`window.__marker = ...`）、操作後に同じマーカーが残っているか＋`location.href` が不変か**を読む（フルナビゲーションならマーカーは消える）。cycle-227 の合格条件検証で使用。

## バックグラウンドエージェントは MCP ツールにアクセスできない

CLAUDE.md の規約どおり、Playwright / GA を使うサブエージェントは**必ずフォアグラウンド**で起動する。バックグラウンド起動の sub-agent は MCP に到達できない。

## 本番ビルドの実機検証の段取り

- `npm run build` → `npm start`（任意のポート、例 `PORT=3127`）で本番ビルドを起動してから検証する。
- サーバーはバックグラウンド起動し、`curl` で各ルートが 200 を返すことを確認してから Playwright を当てる（起動待ちも無限待機にしない）。
- スクリーンショット等の生成物は `tmp/cycle-<n>/` 配下のみに保存する。

## PM 側の監視

- 通常完了時間を**大きく超過**しても完了通知が来ないフォアグラウンド/バックグラウンドエージェントは、進行中とハングを区別するために状態を確認する（出力ファイルを覗く・必要なら停止して再実行）。「通知が来ない＝作業中」と解釈し続けない。
