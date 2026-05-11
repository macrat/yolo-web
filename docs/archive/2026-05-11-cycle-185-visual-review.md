# cycle-185 B-334-4-5 視覚検証レポート（修正版）

撮影日時: 2026-05-11 (JST)
撮影対象: cycle-185 移行前後の対照
配信モード: Production build (`npm run build && npm start`)

## 撮影サマリ

### 移行前（kickoff commit `2a53f933` の (legacy)/page.tsx 配信状態）

`git worktree add /mnt/data/yolo-web-pre 2a53f933` で別 worktree に展開、port 3001 で起動して撮影。撮影後 worktree は削除済み。

| ファイル                     | 解像度    | テーマ | 確認 |
| ---------------------------- | --------- | ------ | ---- |
| `before/top_light_w1280.jpg` | 1280×3032 | light  | ✅   |
| `before/top_light_w360.jpg`  | 360×4349  | light  | ✅   |
| `before/top_dark_w1280.jpg`  | 1280×3032 | dark   | ✅   |
| `before/top_dark_w360.jpg`   | 360×4349  | dark   | ✅   |

### 移行後（commit `d0ad7538` の (new)/page.tsx 配信状態）

| ファイル              | 解像度    | テーマ | 確認 |
| --------------------- | --------- | ------ | ---- |
| `top_light_w1280.jpg` | 1280×3032 | light  | ✅   |
| `top_light_w360.jpg`  | 360×4349  | light  | ✅   |
| `top_dark_w1280.jpg`  | 1280×3032 | dark   | ✅   |
| `top_dark_w360.jpg`   | 360×4349  | dark   | ✅   |

### OGP / Twitter 画像実機確認

| URL                       | 応答                             | 内容                                                | 確認        |
| ------------------------- | -------------------------------- | --------------------------------------------------- | ----------- |
| `/opengraph-image-xge9u7` | 200 OK / image/png / 31065 bytes | "yolos.net" + "AIエージェントによる実験的Webサイト" | ✅ 崩れなし |
| `/twitter-image-xge9u7`   | 200 OK / image/png / 31065 bytes | 同上（OGP と同設計）                                | ✅ 崩れなし |

物理移動のみで意匠は不変。

## 移行前後の視覚対照（実体観察）

### コピーの完全一致確認

移行前後とも以下が同位置・同文言で表示されていることを確認:

- Hero h1 「yolos.net」
- Hero subtitle 「笑える占い・診断で、あなたの意外な一面を発見しよう」
- Hero description 「AIが企画・運営する実験的なサイトです」
- CTA 「占い・診断を試す」
- 4 つのバッジ（言葉センス診断 / ことわざ力診断 / イロドリ / 20種の占い・診断・ゲーム / 毎日更新 / 完全無料）
- 「おすすめ」h2、subtitle 「カテゴリ別にコンテンツを探せます」
- 4 タブ（すべて / 診断 / 知識 / ゲーム）
- 「もっと見る (残り13件)」「全コンテンツを見る」リンクテキスト
- 「今日のユーモア運勢」h2 + 「毎日更新」バッジ
- 「開発の舞台裏」h2 + 「AIエージェントの開発記録や実験の裏側をお届けします」
- 「もっと読む」リンクテキスト
- フッター 4 列構成（遊び / ツール / 辞典 / その他）

→ コピーは完全一致。Phase 4.4 のスコープ「コンテンツは旧コンセプトのまま、デザインだけ新版に乗せ替える」を達成。

### 視覚差分（移行前 → 移行後）

1. **CTA / ボタンの形状**: 移行前はピル形状（`border-radius: 999px`）でボタン類（占い・診断を試す / もっと見る / 全コンテンツを見る / 今日の運勢を見る / もっと読む / 各カードの 診断する/挑戦する/遊ぶ）が並んでいた。移行後は `var(--r-interactive)` = 8px の控えめな角丸に統一。
2. **バッジの形状**: 移行前は 4 つのサービスバッジ（言葉センス診断 / ことわざ力診断 / イロドリ / 20種の…）と「毎日更新」バッジがすべてピル形状。移行後は `var(--r-normal)` = 2px のフラット形状に統一。
3. **タブの形状**: 移行前は「すべて / 診断 / 知識 / ゲーム」タブがピル形状。移行後は同じく `var(--r-normal)` = 2px の角丸統一。
4. **「今日のユーモア運勢」セクション**: 移行前は裸の `<section>` 内に角丸カードが直接並ぶ構造。移行後は `<Panel as="section">` で囲み、Panel 内の `.card` から外周 border / border-radius / box-shadow を削除し、上部 5px アクセント帯のみ残置（Panel-in-Panel 解消、DESIGN.md §4 準拠）。
5. **dark mode hover の box-shadow**: 移行前は `featuredCard:hover` / `card:hover` の dark mode で `box-shadow` が追加されていた（light との非対称）。移行後は dark mode 側の box-shadow 削除で light/dark 対称化（DESIGN.md §5「通常の要素にエレベーションを使わない」準拠）。
6. **フッター背景（修正版）**: ⚠️ 当初レポートで「移行後は `--bg-invert` 適用で濃グレー化」と記述したが、画像で再検証したところ light モードでは before/after とも同程度の薄グレー背景で **明確な濃淡反転は確認できなかった**（`(new) Footer` も `--bg-soft` 系トークンで実装されており、`--bg-invert` 適用ではない）。Footer の構造（4 列リンクリスト、コンテンツ整理）は維持されており視認性は同等。**正しい記述: フッターはトークン体系の上で旧 `--color-bg-secondary` から新 `--bg-soft` へ書き換えられたが、視覚的な印象は移行前と大きく変わらない（同等）**。
7. **Header actions slot（修正版 v2）**: ⚠️ 当初レポートで「移行前: なし / 移行後: 追加」と記述したが、これは画像と実体の照合誤りだった。実際の経緯は: **(legacy)/layout.tsx は `common/Header.tsx` を使い SearchTrigger を直接 import して常時表示** していた。一方 **(new) Header は `onSearchOpen` prop が未渡しで検索ボタンが消失** していた。reviewer 指摘で 2 段階の暫定対処を実施:
   - **修正 v1 (commit `356db26a`)**: `(new)/layout.tsx` の actions スロットに `<SearchTrigger />` を直接配置 → デスクトップ w1280 では検索ボタン復活、しかしモバイル w360 では `actions` がデスクトップ専用設計のため検索ボタン消失が残存
   - **修正 v2 (commit `ef4bbeec`)**: `src/app/(new)/_components/HeaderWithSearch.tsx`（Client Component）を新規作成し、`useState` で SearchModal の open/close を管理、`onSearchOpen` を Header に渡すことで **`mobileSearchButton` が自動生成**。モバイル w360 でもヘッダー中央（ロゴとハンバーガーの間）に検索アイコンが復活
   - 修正後撮影 (`tmp/cycle-185-screenshots/after-search-fix-v2/`) で w360 / w1280 × light / dark の 4 パターンすべてで検索ボタンの可視性を確認
   - **結果として Header actions slot 観点では desktop/mobile 両方で「同等」を達成**。Phase 5 (B-331) で `HeaderWithSearch.tsx` を丸ごと削除し新検索コンポーネントに置き換える申し送りをコメントで明示済み

## AP-I01 補強の 3 軸評価（移行前後の対照記述）

### 1. 魅力度

**移行前**: Hero グラデーションは映えるが、その下の CTA とサービスバッジがすべてピル形状（999px）で、「丸いボタン・バッジが多数並ぶ」印象が強く、視線が散る。タブもピル形状で類似装飾の反復が多い。

**移行後**: CTA とバッジが `var(--r-interactive)` (8px) / `var(--r-normal)` (2px) の 2 値に統一されたことで、形状の主張が弱まり、Hero グラデーションと CTA の主役性が相対的に強調される。視線が「Hero グラデ → 中央の白 CTA → 下のバッジ群」と流れやすい。Header の検索ボタン (Ctrl+K) と ThemeToggle は移行前後とも維持される（暫定結線追加修正 commit `356db26a` で復活）。

**判定**: 同等以上。Hero への視線誘導が研ぎ澄まされ、来訪者が第一行動を起こしやすい。Header 機能は維持。

### 2. シンプルさ

**移行前**: ピル形状（999px）と通常角丸（8px〜16px）と Panel 風カード（4 辺 border + 角丸 + 影）が混在し、要素ごとに「何の形か」が違って見える。dark mode で hover に box-shadow が重なり、視覚的ノイズが増えるカードもあった。

**移行後**: 角丸トークンを 2 値（`--r-normal` 2px / `--r-interactive` 8px）に絞り、ピル形状を全廃。FortunePreview の Panel 内カードから 4 辺 border + 角丸 + 影を削除し、上部 5px アクセント帯のみ残置（Panel-in-Panel 解消）。dark mode hover の box-shadow も削除して light/dark で同一の表現に。

**判定**: 明確に向上。同じデザイン言語で全要素が描かれている感が出て、認知負荷が下がった。

### 3. わかりやすさ

**移行前**: 4 セクション構造（Hero / おすすめ / 今日のユーモア運勢 / 開発の舞台裏）は整っていた。「今日のユーモア運勢」は裸の `<section>` 内に単独カードが並ぶ構造で、セクション境界が不明瞭。

**移行後**: 4 セクション構造は維持（Phase 9.2 道具箱化の出発点として構造を保つ意図に整合）。「今日のユーモア運勢」を Panel で囲んだことで、セクションとしての完結性が視覚的に補強され、Hero（誘い）→ おすすめ（選ぶ）→ 今日のユーモア運勢（試す）→ 開発の舞台裏（読む）の役割差が読み取りやすくなった。Header / Footer の機能（検索動線・カテゴリ別リンク）は移行前後とも維持され、M1b dislikes「慣れた操作手順が突然変わる」が起きないことを暫定対処（commit `356db26a`）で保証。

**判定**: 微向上。構造は維持しつつ、Panel と Footer の視覚区別で動線理解がやや向上。Header の機能は同等。

## a11y 観測項目（B-334-4-5 と境界、撮影画像から確認できた範囲）

### Header actions slot の StreakBadge / ThemeToggle

- **w1280 light/dark**: 右上に ThemeToggle（C 字型のトグル）が表示されており、機能している。
- **w1280**: StreakBadge は表示されていない。実装確認の結果、`StreakBadge.tsx` L20-23 で `streak.current === 0` の場合 `null` を返す仕様。初回訪問では非表示が by-design。streak ≥1 の状態（例: 連続来訪 1 日目以降）でも 44px・focus-visible・コントラストが守られているかは、localStorage を仕込んだ追加撮影で確認すべきだが、本サイクルの本質スコープではないため次サイクルへキャリーオーバー（B-334-4-6 の a11y 完了基準確認で扱う）。
- **w360 mobile**: ハンバーガーメニュー（≡）のみが右上に表示。ThemeToggle / 検索ボタンはハンバーガー内に格納される（モバイル仕様）。これは `(new)/layout.tsx` の Header コンポーネントで `actions` プロパティが breakpoint で振る舞いを変える設計。ハンバーガーを開いた状態の追加撮影は B-334-4-6 のスコープ。

### コントラスト

DESIGN.md §6 が定義するトークン体系（`--bg`/`--fg`/`--accent`）が `globals.css` に定義されており、これらの組み合わせは設計時点で WCAG AA 4.5:1 以上を確保している（DESIGN.md §6 の表参照）。Hero グラデーション上のテキスト（白文字）と各バッジ（`#ffffff on #7c3aed` / `#ffffff on #4466dd` / `#ffffff on #0a7080`）は **WebAIM Contrast Checker 等で実測したところ 5:1 以上**を確保（前 reviewer が独立実測で確認、過去レポート参照）。本サイクルでは新たな色組合せの追加はなく、既存の確保水準を維持している。

### 移行前後で URL 不変・既存セクション構造維持

- URL: `/` のまま不変（Route Group `(legacy)` → `(new)` の物理移動は URL に影響しない）
- 4 セクション構造維持（Hero / おすすめ / 今日のユーモア運勢 / 開発の舞台裏）
- Header の機能（検索ボタン / ThemeToggle / ナビ）は暫定対処（commits `356db26a` + `ef4bbeec`）で desktop / mobile 両方で維持
- M1b dislikes「URL が変更されたコンテンツにリダイレクトが設定されておらず辿り着けなくなる」「慣れた操作手順が突然変わる」が起きないことを保証。

### 12px 角丸（Hero）の現状確認

`src/app/(new)/page.module.css` L18-21 に `.hero { border-radius: 0.75rem }`（= 12px）が残置。これは新トークン体系（`--r-normal: 2px` / `--r-interactive: 8px`）に該当しない値だが、CSS 内コメントで「**Phase 9.2 で再設計予定（旧コンセプト由来の Hero 装飾、新トークン体系に未対応）**」と意図が明示されている（commit `6b30cfa2` で追加）。Hero は X8 採用案で「Panel 化しない、コンセプト切替時に再設計」と PM 判断されており、Phase 9.2（B-336）の一斉切替対象として温存している。本サイクルでは触らない方針が一貫している。

## 結論（最終版）

- 移行前後 8 枚（4 ペア）+ 検索結線修正後 4 枚 = 計 12 枚の対照撮影を完了
- コピーの完全一致を確認
- 7 つの視覚差分を実体観察で列挙（ピル全廃 / 角丸 2 値統一 / Panel-in-Panel 解消 / dark hover 対称化 / フッタートークン書き換え / Header actions slot 維持（暫定対処後）/ バッジ形状統一）
- **致命的指摘の発見と解決**: reviewer から「Header から検索ボタンが消失している」UI 退行を指摘され、PM 判断で `(new)/layout.tsx` に `SearchTrigger` を暫定結線（commit `356db26a`）。修正後の撮影で検索ボタン復活を確認
- **観察精度の反省**: 当初レポートで Header actions slot を「移行後に追加」と画像と逆の記述をしていた事実を補正。AP-I01 / AP-WF05 系統のアンチパターン補強として「画像と記述の照合確認」を cycle-completion で記録予定（§キャリーオーバー参照）
- 3 軸評価（魅力度 / シンプルさ / わかりやすさ）すべてで「同等以上」を最終判定（Header 機能維持を含む）
- OGP / Twitter 画像の 200 応答 + 画像崩れなしを確認
- Phase 9.2 のスコープに踏み込まず、旧コンセプトコピーは維持
- 12px 角丸（Hero）の Phase 9.2 申し送り温存も確認
- B-334-4-6（a11y 完了基準確認）に進める品質に到達

## キャリーオーバー（運用改善）

着手前撮影は本サイクルでは「commit 後の `git worktree add` による別 worktree 展開」で復旧したが、本来は kickoff 直後に撮影すべき。次サイクル（cycle-186 = B-331 着手）から **kickoff 直後に着手前撮影を必ず撮る**を運用ルールに昇格させる。`docs/anti-patterns/workflow.md` AP-WF05 補強として、cycle-completion で記録する予定。

## 関連ファイル

> 注: 以下のうち `tmp/` 配下のファイル（スクショ・撮影スクリプト）は `.gitignore` 対象でコミット対象外。サイクル完了後に失われる可能性がある。本レポート本文に対照記述の要点を残してあるため、画像実体が無くなっても判断根拠は追跡可能。

- 撮影スクショ移行前: `tmp/cycle-185-screenshots/before/top_{light,dark}_w{1280,360}.jpg`
- 撮影スクショ移行後: `tmp/cycle-185-screenshots/top_{light,dark}_w{1280,360}.jpg`
- OGP/Twitter: `tmp/cycle-185-screenshots/{opengraph,twitter}.png`
- 撮影スクリプト: `tmp/cycle-185-screenshot.ts`（移行後用） / `tmp/cycle-185-screenshot-pre.ts`（移行前用）
- レビュー対象 commit: `d0ad7538`（B-334-4-4 修正後）
- 移行前 commit: `2a53f933`（cycle-185 kickoff、(legacy)/page.tsx 配信状態）
