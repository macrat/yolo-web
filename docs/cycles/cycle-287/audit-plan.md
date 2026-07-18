# cycle-287 動的a11y監査 計画

準拠先: WCAG 2.2 AA（`docs/research/2026-07-15-wcag22-current-state.md`・2026-07-18 に現行性再確認済）。
DESIGN §10 のタップ標的 44px は WCAG 2.2 の 2.5.8(24px)より厳しい側=**緩めない**。<44px は「DESIGN逸脱」、<24px は「WCAG AA逸脱」として区別して記録。
4.1.1 Parsing は監査軸に含めない（2.2で削除）。

## 検証手段の限界（各所見に明記すること）

- Playwright MCP では**実スクリーンリーダー(NVDA/VoiceOver/TalkBack)を起動できない**。取得できるのはアクセシビリティツリーのスナップショット。
  - 検証可能: アクセシブル名・role・見出し階層・ランドマーク・aria-live属性の有無・tabindex・focus移動。
  - 検証不可: 実SRの読み上げ音声・読み上げ順序の体感。→「SRで確認した」と書かない。
- 実測は desktop(1280×800) と mobile(390×844) の両方。dark も主要面で確認。

## 静的ベースライン（PMが2026-07-18に実測済）

`eslint.config.mjs` は next core-web-vitals 継承=jsx-a11y既定。現行 `eslint .` は警告0。
jsx-a11y の広めのルールを **error 強制**した probe(`tmp/eslint-a11y-probe.mjs`)で 8件:

| 箇所                                                             | ルール                                                                | 一次評価                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| SearchModal.tsx:271 `<dialog onClick>`                           | click-events-have-key-events / no-noninteractive-element-interactions | 背景クリックで閉じる補助。dialogはEsc+可視「閉じる」ボタンあり=キーボード手段は別途存在の可能性。動的監査で実確認 |
| GameDialog.tsx:59 `<dialog onClick>`                             | 同上                                                                  | 同上                                                                                                              |
| DateCalculatorTile.tsx:253/335/386/497 `<section role="region">` | no-redundant-roles                                                    | アクセシブル名の有無で実害が変わる。動的監査で名前の有無を確認                                                    |

→ リンタを黙らせる修正(キーハンドラ貼付)は「雑な抑制」（研究doc警告）。**実キーボード/SRツリーで操作完遂できるかを先に判定**し、実害ベースで是正する。

## 監査対象（代表原型・全URL 2026-07-18 に200応答を確認）

| #   | 原型                               | URL                                                 | 重点                                                                                                |
| --- | ---------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A   | グローバル外装+トップ+検索モーダル | `/` +（検索を開く）                                 | skipリンク・ランドマーク・ヘッダnavキーボード・検索combobox/listboxのキーボード操作(矢印/Enter/Esc) |
| B   | 対話ツール                         | `/tools/date-calculator`                            | 入力ラベル関連付け・結果のaria-live・section role冗長の実害・キーボード・タップ標的                 |
| C   | 診断(入口→結果リビール)            | `/play/character-personality`                       | 設問のキーボード選択・結果リビールのaria-live/focus移動・見出し階層                                 |
| D   | ゲーム(GameDialog)                 | `/play/kanji-kanaru`                                | GameDialog(遊び方/統計/結果)のEsc閉じ・focusトラップ/復帰・盤面のキーボード操作可否                 |
| E   | 辞典(一覧+個別)                    | `/dictionary/kanji` +`/dictionary/kanji/水`         | ランドマーク・見出し階層・一覧カードのタップ標的とアクセシブル名                                    |
| F   | ブログ記事+静的                    | `/blog/clickable-list-row-stretched-link` +`/about` | 見出し階層・ランドマーク・リンクのアクセシブル名・目次                                              |

各監査は判定表(具体箇所・重大度・再現手順)を作業ファイル(ephemeral)に書き出し、PMが一次確認のうえ `findings.md` に要点を統合する（正本は `findings.md`）。
