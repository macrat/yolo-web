# WCAG の現況（一次資料確認・2026-07-15）

cycle-284 のキックオフで B-573（UI/UX/アクセシビリティの全面適用）を計画した際に、一次資料で確認した結果。
その計画は差し替えたが（経緯は `docs/cycles/cycle-284.md`）、**確認した事実は B-573 の次回着手時にそのまま使える**ため残す。

外部仕様は改定されうるため、**着手時に本書の日付（2026-07-15）を見て、古ければ再確認すること**。

## 現行勧告

| 項目           | 状態                                                                                                                                                                   | 出典                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **WCAG 2.2**   | **現行 W3C Recommendation**（初版 2023-10-05・**更新版 2024-12-12**）                                                                                                  | https://www.w3.org/TR/WCAG22/                                 |
| WCAG 2.0 / 2.1 | いずれも有効な標準として並存（2.1・2.2 は後方互換）                                                                                                                    | https://www.w3.org/WAI/standards-guidelines/wcag/             |
| **WCAG 3.0**   | **勧告ではない。未完成の草案**（Working Draft）。公式に「The final requirements in WCAG 3 will be different from this draft」「WCAG 3 は数年後に標準化を目指す」と明記 | https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/ |

**判断: WCAG 3.0 を規範として参照しない。** 準拠先は WCAG 2.2。

## WCAG 2.2 で 2.1 から追加された達成基準（9件）

| 番号   | 名称                                 | レベル                                                          |
| ------ | ------------------------------------ | --------------------------------------------------------------- |
| 2.4.11 | Focus Not Obscured (Minimum)         | **AA**                                                          |
| 2.4.12 | Focus Not Obscured (Enhanced)        | AAA                                                             |
| 2.4.13 | Focus Appearance                     | **AAA**（策定途中で AA 案だった経緯があり AA と誤記されやすい） |
| 2.5.7  | Dragging Movements                   | **AA**                                                          |
| 2.5.8  | Target Size (Minimum)                | **AA**                                                          |
| 3.2.6  | Consistent Help                      | **A**                                                           |
| 3.3.7  | Redundant Entry                      | **A**                                                           |
| 3.3.8  | Accessible Authentication (Minimum)  | **AA**                                                          |
| 3.3.9  | Accessible Authentication (Enhanced) | AAA                                                             |

出典: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/

## 2.5.8 Target Size (Minimum) — 当サイトに最も影響が大きい

- **AA・24 × 24 CSS px 以上。**
- 例外は5つ: **Spacing**／Equivalent／Inline／User Agent Control／Essential。
- **Spacing 例外**: 各アンダーサイズ標的のバウンディングボックス中心に**直径 24px の円**を描き、他の標的・他の円と**交差しなければ合格**（実質、中心間距離 24px 以上が目安）。
- **「24px 未満＝即違反」ではない。**

出典: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

### 2.1 の 2.5.5 との違い

|        | WCAG 2.1 の 2.5.5 | WCAG 2.2 の 2.5.8     | WCAG 2.2 の 2.5.5                  |
| ------ | ----------------- | --------------------- | ---------------------------------- |
| 名称   | Target Size       | Target Size (Minimum) | **Target Size (Enhanced)**（改名） |
| サイズ | 44 × 44           | **24 × 24**           | 44 × 44                            |
| レベル | **AAA**           | **AA**                | AAA                                |

- **ターゲットサイズが AA に入ったのは 2.2 が初めて。** 2.1 時代は AAA のみだった。
- 2.5.5 には **Spacing 例外がない**（4例外）。
- 改名は 2.1 仕様と 2.2 仕様の見出しの実測比較で確認（公式の改名アナウンス文書は未発見）。

出典: https://www.w3.org/TR/WCAG21/#target-size ／ https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html

**当サイトへの含意**: `DESIGN.md` §10 は**タップターゲット 44px** を要求しており、これは WCAG 2.2 AA（24px）より**厳しい側**。**規格に合わせて緩めない。**

## 削除された達成基準

- **4.1.1 Parsing のみ**（2.2 で削除された唯一の達成基準）。「Assistive technology no longer has any need to directly parsing HTML」が理由。
- 2.0 / 2.1 でも errata（2023-04-18）で「**HTML/XML を使うコンテンツでは常に満たされたものとみなす**」と注記済み。達成方法 F70 / F77 も Obsolete 化。
- **監査の指摘軸に含めない。**

出典: https://www.w3.org/WAI/WCAG22/Understanding/parsing.html ／ https://www.w3.org/WAI/WCAG21/errata/

## 当サイトの検証手段の現状（2026-07-15 実物確認）

- `axe-core@4.11.1` が dev 依存ツリーに**実在**（`eslint-config-next` → `eslint-plugin-jsx-a11y@6.10.2` 経由）。ただし**検証には未使用**。
- `jsx-a11y` の a11y ルールが **6 本有効**（alt-text／aria-props／aria-proptypes／aria-unsupported-elements／role-has-required-aria-props／role-supports-aria-props）。**すべて重大度 1 = warn ＝ 非ブロッキング。**
  - **warn → error に上げるのは低コストの構造的一手**（現状の違反件数を実測してから）。
- `src/play/quiz/_components/__tests__/QuizContainer.reveal.test.tsx` に**結果リビールの a11y 回帰ガードが存在**（role="region" / tabIndex=-1 / aria-label / focus(preventScroll) を固定）。
- **動的な操作検証（キーボード到達・focus 可視・タップ標的・SR の読み上げ）は存在しない。** ← B-573 の前提はこの正確な形で成立する。

## B-573 着手時の注意

- **Playwright MCP では実スクリーンリーダー（NVDA / VoiceOver / TalkBack）を起動できない。** 取得できるのはアクセシビリティツリーのスナップショット。
  - アクセシブル名・role・見出し階層・ランドマーク・aria-live の発火は検証できる。
  - **実 SR の読み上げ音声・読み上げ順序の体感は検証できない。**「SR で確認した」と書けない範囲を先に確定させること。
- axe を最初から CI ブロッキングにすると、通すこと自体が目的化して雑な抑制（ルール除外・aria の貼り付け）を招きうる。まず実態を測り、是正し、その後に維持ラインとして締める順が現実的。**ただし「その後」を起票せずに「恒久化」と呼ばない**（非ブロッキングのスクリプトと散文規定は死角を構造としては塞がない。cycle-281 が §4 に規定を足しても cycle-279 の死角が塞がらなかったのが実例）。
