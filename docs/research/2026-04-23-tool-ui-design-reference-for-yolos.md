---
title: 「道具らしい」UI デザイン参考事例調査 — yolos.net デザインガイドライン策定のための基礎資料
date: 2026-04-23
purpose: B-308「デザインガイドラインとUIコンポーネント集の策定」の判断材料として、「道具らしい」「毎日傍にある」「継続利用される」体験をUIで体現している国内外の事例を収集し、ビジュアル言語の共通項と差異を抽出する
method: |
  - Linear / Vercel / GitHub Primer / Stripe 等の公式ブログ・デザインシステムドキュメントを参照
  - ラッコツールズ（https://rakko.tools/）のサイト構造を調査
  - 日本語 Web タイポグラフィのベストプラクティス文献を複数調査
  - 2026 年の UI カラートレンド・アクセシビリティ（WCAG 2.2）・prefers-reduced-motion の実装実態を調査
sources:
  - "Linear design refresh: https://linear.app/now/behind-the-latest-design-refresh"
  - "Linear UI redesign part II: https://linear.app/now/how-we-redesigned-the-linear-ui"
  - "LogRocket - Linear design: https://blog.logrocket.com/ux-design/linear-design/"
  - "Vercel Geist colors: https://vercel.com/geist/colors"
  - "GitHub Primer color system: https://primer.style/foundations/color/overview/"
  - "Stripe accessible color systems: https://stripe.com/blog/accessible-color-systems"
  - "Rakko Tools: https://rakko.tools/"
  - "Japanese web typography: https://medium.com/@masaharuhayataki/japanese-web-typography-anatomy-and-best-practices-185449b7be65"
  - "AQworks Japanese typography rules: https://www.aqworks.com/blog/perfect-japanese-typography"
  - "UI color trends 2026: https://updivision.com/blog/post/ui-color-trends-to-watch-in-2026"
  - "WCAG 2.2 focus appearance: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html"
  - "prefers-reduced-motion MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion"
  - "Best Japanese CSS font 2025: https://www.bloomstreetjapan.com/best-japanese-font-setting-for-websites/"
  - "2025 Japanese font family guide: https://officetakec.com/2025年版：最適な日本語webフォントファミリー設定ガイド/"
---

# 「道具らしい」UI デザイン参考事例調査

## 1. 国際的な「道具らしい」プロダクトのデザイン

### 1-1. Linear（プロジェクト管理ツール）

**参考 URL:**

- デザインリフレッシュの舞台裏: https://linear.app/now/behind-the-latest-design-refresh
- UI 再設計（Part II）: https://linear.app/now/how-we-redesigned-the-linear-ui
- LogRocket による分析: https://blog.logrocket.com/ux-design/linear-design/

**カラーパレット:**

- 基調はウォームグレー。かつての cool blue 系から warm gray 系に移行。「クリスプさを保ちつつ、彩度を下げた」という方向性。
- LCH カラースペースを採用（HSL より知覚的均一性が高い）。
- テーマを 98 変数から「ベースカラー・アクセントカラー・コントラスト」の 3 変数体系に集約。
- インジゴ（紫みの青）がシグネチャアクセント。ブランド認知を保ちつつ抑制して使う。

**タイポグラフィ:**

- ボディは Inter。見出しに Inter Display を導入し、階層を明確化。
- 「線形性（linearity）」が核。テキストの方向を一方向に揃え、視線が交差しない。

**余白・密度:**

- 情報密度は高いが、各要素の視覚的重みを役割に応じて調整。
- タブはコンパクト化（小さいテキスト＋アイコンのみ）。

**哲学:**

- 「稼いでいない注目を奪うな（Don't compete for attention you haven't earned）」
- 「構造は感じるものであって、見えるものではない（Structure should be felt not seen）」
- ボーダーやセパレーターを減らし、コントラストを下げ、丸みを付けて誘導する。
- 革命ではなく進化。ユーザーに再学習コストをかけない。

**道具らしさへの寄与:** ナビゲーション要素は背景に溶け込み、作業内容が前面に立つ。装飾がないことで「使うもの」という印象が強まる。

---

### 1-2. Vercel（Geist デザインシステム）

**参考 URL:** https://vercel.com/geist/colors

**カラーパレット:**

- 10 段階のスケールをグレー・ブルー・レッド・アンバー・グリーン・ティール・パープル・ピンクで構成。
- グレーは 2 段階の背景トークン（Background 1 = 主要背景、Background 2 = 微妙な差異）。
- カラー 1〜3 = コンポーネント背景（デフォルト・ホバー・アクティブ）、4〜6 = ボーダー、7〜8 = 高コントラスト UI 要素、9〜10 = テキスト・アイコン、という機能的階層。
- 「感情ではなくポジション」で番号付け。これにより要素の大小でトークンを使い分けやすい。

**道具らしさへの寄与:** 機能的命名により、デザイナー・開発者が色を「装飾の選択」としてではなく「役割の割り当て」として扱う。結果として恣意的な色使いが減る。

---

### 1-3. GitHub Primer（オープンソースデザインシステム）

**参考 URL:** https://primer.style/foundations/color/overview/

**カラーパレット:**

- ニュートラルグレーは 0〜13 の 14 段階スケール。
- ライトモードは 0（白）→ 13（黒）、ダークモードはその逆。スケールの方向を反転させることで、同じ semantic token がライト・ダーク両方で流用できる設計。
- アクセントの semantic 役割は 7 種（accent / success / attention / danger / open / closed / done）。これ以外の場面で色を使わない。

**タイポグラフィ:** 特定のフォントよりもシステムフォントスタックへの依存が特徴的。

**道具らしさへの寄与:** アクセントカラーを「状態」「意味」に厳しく限定することで、ユーザーが色から情報を得られる。色の多用をアーキテクチャレベルで禁じている。

---

### 1-4. Stripe（ダッシュボード）

**参考 URL:** https://stripe.com/blog/accessible-color-systems

**カラーパレット:**

- ベースカラーは #0A2540（ダウンリバー：深めの暗青）。「純粋な黒の冷たさを避けつつ技術的洗練を示す」という意図。
- CIELAB（Lab カラースペース）を採用。HSL 不使用。知覚的均一性を科学的根拠に基づいて保証。
- 「同じスケール上で 5 段階以上離れた色は小テキストでも WCAG AA を満たす」という予測可能なルールを確立。

**道具らしさへの寄与:** 色選択のロジックを数学的に担保することで、デザイナーが感覚ではなくルールで判断できる。「なぜこの色か」に答えられる設計。

---

### 1-5. Notion

**参考 URL:** https://getdesign.md/notion/design-md（概要のみ）

**カラーパレット:** ウォームミニマリズム。ソフトシャドウ、寛大な余白、フレンドリーな色調。
**タイポグラフィ:** Medium フォントウェイトが基本。行間はクリーンかつ余裕を持たせる。
**哲学:** 「ウォームさ・親しみやすさ」を優先するが、Liner 系の「冷徹なツール感」よりは温かみ寄り。

---

### 1-6. Raycast（プロダクティビティランチャー）

**参考 URL:** https://www.loftlyy.com/en/raycast

**カラーパレット:** #FF6363（シグネチャレッド）、#151515（UI 背景）、#070A0B（最深背景）。
**タイポグラフィ:** Inter。
**哲学:** 「プロダクティビティはフローについてであり、時間節約ではない」。ダーククロム＋鮮やかなグラデーションアクセントで「スピードと精度」を視覚化。キーボードファースト。
**道具らしさへの寄与:** UI の 99% がテキスト。装飾的要素をほぼ持たないが、シグネチャカラーの赤が「機能への入口」として機能する。

---

## 2. 日本語の小さなオンラインツール系サイト

### 2-1. ラッコツールズ

**URL:** https://rakko.tools/
**キャッチコピー:** 「サクッと使える Web ツール」

**UIの特徴:**

- 最上部にシンプルな検索バーを配置。ツールへの最短経路を優先。
- 20 のカテゴリタグ（SEO / SSL / Network / エンコード・デコード / バリデーション など）で機能的に分類。
- ツールリストは同一フォーマットの直リンク一覧。カード形式ではなく、テキストリスト＋ホバーインジケータ。
- ヒーローイメージ・テスティモニアル・説得的コピーなし。
- 110+ ツールをすぐ閲覧できる「情報密度の高い均一フォーマット」。

**色・フォントの傾向:**

- ニュートラルカラー基調。目立つアクセントカラーは控えめ。
- 「洗練」より「機能完結」を優先した設計。派手さを排し、ツールの発見性と速度を優先。

**日本語ツールサイト特有の「ごちゃっと感」とその回避:**

- 100 以上のツールを 1 ページに並べると情報過多になりがち。ラッコツールズはカテゴリタグとサーチを組み合わせてフィルタリングを可能にし、視認性を保っている。
- ただし装飾的な UI 要素がないため「無骨」に見えることもある。yolos.net は「道具らしさ」を保ちつつ、視覚的な整理で上回ることを目指せる。

---

### 2-2. 日本語ツールサイト全般の傾向

**採用されがちなパターン（＝差別化の余地）:**

- 青・緑系のアクセント（慣習的な「Web ツール感」）。
- フォントはシステムフォント依存。カスタムフォントの導入は稀。
- グリッドレイアウトはあるが、余白設計が粗い。
- ダークモード対応していないサイトが多い。

**「ごちゃっと感」の主要因:**

1. 広告の混在（アドセンス枠が UI を分断する）
2. 種類の多いアクセントカラーの並立
3. 余白の小ささ（詰め込み指向）
4. フォントの混在（日本語・英数字の統一感がない）

---

## 3. 2026 年時点のモダン Web デザインの標準

### 3-1. カラーパレットのトレンド

**主流の方向性（2026 年）:**

- 「Elevated Neutrals」：純白から柔らかいグレー・サンド・ストーン・オートミールベージュへの移行。長時間使用での目の疲れを軽減し、上質・落ち着いたトーンを実現。
- 「Hyper-Saturated Accents」：ニュートラルな背景に対して、電気ブルー・ネオングリーン・コーラルなど強い色を 1〜2 色だけ戦略的に使う。「ここを見ろ」という明確なシグナルとして機能。
- ツール系・エンタープライズ系はこの方向。消費者・ライフスタイル系は逆にカラフルなグラデーションや Y2K ドーパミンカラーへ。

**参考:** https://updivision.com/blog/post/ui-color-trends-to-watch-in-2026

---

### 3-2. フォント選択（特に日本語サイト向け）

**システムフォントスタック（パフォーマンス優先、2025 年推奨）:**

```css
font-family:
  system-ui,
  -apple-system,
  "Hiragino Sans",
  "Hiragino Kaku Gothic ProN",
  "Yu Gothic",
  "Meiryo",
  sans-serif;
```

**Noto Sans JP + システムフォント混合（デザイン一貫性優先）:**

```css
font-family:
  "Noto Sans JP",
  system-ui,
  -apple-system,
  "Hiragino Sans",
  "Hiragino Kaku Gothic ProN",
  "Yu Gothic",
  "Meiryo",
  sans-serif;
```

**ラテン文字 + 日本語システムフォント（Inter 等との混合）:**

```css
font-family:
  "Inter", "Hiragino Sans", "Meiryo", "Hiragino Kaku Gothic ProN", sans-serif;
```

**重要な実装上の注意点（2025 年現在）:**

- **日本語フォントをラテンフォントより前に置くと、ラテン文字にも日本語フォントが適用される。** 必ず英数字フォントを先頭に。
- 游ゴシック（YuGothic）は macOS の Safari / Brave / Firefox プライベートウィンドウでローカルフォントとして取得できなくなっている。依存しすぎないこと。
- Noto Sans JP は約 9.2 MB（Roboto の 27 倍）。Core Web Vitals への影響が大きい。ページ速度優先のツールサイトでは自己ホスト + サブセット、または Google Fonts + `display=swap` + `preconnect` の組み合わせが推奨。
- Windows 環境で游ゴシックを使う場合、`font-weight: 500` に設定することで「かすれ」を防げる。

**参考:**

- https://www.bloomstreetjapan.com/best-japanese-font-setting-for-websites/
- https://officetakec.com/2025年版：最適な日本語webフォントファミリー設定ガイド/
- https://medium.com/@masaharuhayataki/japanese-web-typography-anatomy-and-best-practices-185449b7be65

---

### 3-3. 日本語タイポグラフィの設計原則

**行間（line-height）:**

- 本文最低 150%、推奨は 160〜180%。
- 日本語文字は正方形のプロポーションで「密」に見えるため、ラテン文字より多い余白が必要。

**文字間隔（letter-spacing）:**

- 本文: `0.05em` 程度。日本語は和文間隔が読みやすさに影響する。

**フォントサイズ:**

- 日本語文字はラテン文字より 10〜15% 大きく見える。同一 pt では日本語が大きく見えるため、若干縮小するか行間で調整。
- 本文最低 12px、推奨は 15〜16px。

**行の長さ:**

- PC: 15〜40 文字/行、スマートフォン: 15〜21 文字/行が推奨。
- 英語の 45〜75 文字より短い。ツールの UI テキストは特に短め。

**イタリック使用禁止:** 日本語フォントにはイタリックがなく、ブラウザが無理やり傾けて不自然になる。代わりに太さ（`font-weight`）や括弧を使う。

**横書き固定:** スクロールが縦方向である限り、縦書きは避ける。

**参考:**

- https://www.aqworks.com/blog/perfect-japanese-typography
- https://www.ulpa.jp/post/beyond-translation-japanese-typography-in-web-design

---

### 3-4. ダークモード対応の標準実装レベル（2026 年）

**基本パターン（CSS 変数 + next-themes との親和性）:**

- `:root` にライトモードのデフォルト値を定義。
- `:root.dark`（または `[data-theme="dark"]`）にダークモードの上書き値を定義。
- next-themes はクラスベースの切り替えを標準サポート。

**カラー選択の注意点:**

- ダークモードで純粋な #000000 / #ffffff を使うと眩しさ・目の疲れの原因になる。
- ダーク背景は #0f172a や #1a1a1a 程度が標準的。テキストは #e2e8f0 など「オフホワイト」。
- WCAG AA（4.5:1 コントラスト比）は必須。ライトモードで合格した色の組み合わせでもダークモードでは失格になる場合がある。別途検証が必要。

**参考:** https://design.dev/guides/dark-mode-css/

---

### 3-5. アクセシビリティ（WCAG 2.2）

**フォーカスリング（2.4.11 / 2.4.13）:**

- WCAG 2.2 で「Focus Appearance Minimum」（Level AA）が新設。フォーカスインジケーターは最低 2px 以上の厚さ、フォーカス前後で 3:1 以上のコントラスト変化が必要。
- `:focus-visible` を使い、マウス操作ではフォーカスリングを非表示、キーボード操作では表示するのが現在の標準。

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**コントラスト比:**

- テキスト: 4.5:1（通常）/ 3:1（大きなテキスト）
- UI コンポーネント・グラフィック: 3:1

**参考:**

- https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- https://webaim.org/articles/contrast/

---

### 3-6. モーション・アニメーションの節度

**`prefers-reduced-motion` の標準的な実装:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- 前庭障害（視覚刺激による平衡感覚の障害）を持つユーザーを保護するための必須対応。
- ツールサイトとして「速さ」を重視するなら、そもそもアニメーションは最小限にとどめ、`prefers-reduced-motion` での無効化がほぼ不要な水準を目指すのが理想。

**参考:**

- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- https://www.w3.org/WAI/WCAG21/Techniques/css/C39

---

## 4. 「毎日使う道具」としての設計原則

### 4-1. 再訪体験の一貫性

**根拠:**
ブックマークから戻ってきたユーザーは「同じ景色」を期待する。レイアウトの変更・ナビゲーションラベルの変更・色の変化は、毎回再学習コストを発生させる。

Linear はこれを「革命ではなく進化」として意識し、リデザイン後もユーザーに再学習を求めない変更にとどめた。Notion も「アンクラッタード・デザイン」を理念に、操作の一貫性を重視する。

**yolos.net への示唆:**

- コンポーネントの配置・ラベル・インタラクションは策定後に安易に変更しない。デザインシステムの策定がこの一貫性を担保する。
- 特定ツールをお気に入り登録したユーザーが、戻ったときにツールが同じ場所・同じUIで使えることが前提。

### 4-2. キーボード操作

- ツール系サイトの上級ユーザーはキーボードを積極的に使う。
- Tab による順序移動、Enter による実行、Escape によるキャンセルが機能することが最低条件。
- Linear / Raycast はショートカット体系を UI の中心に置いている（「?」でショートカット一覧表示など）。
- ただし yolos.net のフェーズでは「まず全ツールでキーボード最低保証を達成する」ことが優先。

### 4-3. 読み込みの速さ・静けさ

- ツールサイトにスプラッシュスクリーン・入場アニメーション・スクロールトリガーアニメーションは不要。
- 「速さ」は機能の一つ。LCP（Largest Contentful Paint）の改善が UX に直結する。
- Noto Sans JP を全ページに無条件に読み込むことは避ける（ファイルサイズ問題）。フォールバックのシステムフォントで十分な場合はシステムフォントを優先。

### 4-4. 「使い終わってサッと離脱できる」導線

- ツールの完了状態（コピー完了・計算結果の表示）で余分なモーダル・広告・関連コンテンツの押し付けがないこと。
- 結果は明確に見え、次のアクション（コピー・ダウンロード・別ツールへの移動）が迷わずできること。
- 内部リンク（関連ツールへの誘導）は「作業の流れを壊さない」配置で。

---

## 5. 「1割未満の息抜き」との両立

### 5-1. トーンの差をどう設計するか

**参考事例は少ないが、原則から導出:**

ツール系 UI の中に娯楽系コンテンツを混ぜる場合、完全に同じトーンにするとコンテンツの性格が伝わりにくい。一方で別サイト感を出すと統一感が失われる。

**推奨アプローチ: 「素材は共通、味付けを変える」**

1. **構造・レイアウト・タイポグラフィは全ページ統一。** フォント、余白システム、カラートークンは息抜きコンテンツでも同じものを使う。
2. **息抜きコンテンツのみ、アクセントカラーを「暖色系」または「明度の高い色」にシフト。** ツールはクールトーン、息抜きはウォームトーンという使い分け。ただし同一カラーシステムの中の選択として設計する。
3. **見出し・カードのビジュアル（サムネイル・アイコン）が異なれば十分。** テキストのトーン（カジュアル vs. 実用）と組み合わせることで、「息抜きゾーン」が自然に識別される。

**避けるべきこと:**

- 息抜きコンテンツに派手なアニメーション・グラデーション背景を追加してツールとの落差を作る → 「統合された一つのサイト」という認識が壊れる。
- 息抜きコンテンツだけフォントやレイアウトを変える → 別サービスに見える。

### 5-2. 参考: メディア系サイトの「トーン切り替え」手法

- Spotify や Liquid Death は同一ブランド内でツール的（再生、管理）と娯楽的（ビジュアル、キャンペーン）の UI を混在させるが、カラーシステムと UI コンポーネントは共通。
- 「内容の性格」はコピーライティング・ビジュアルアセット（画像・イラスト）で分けるが、「器（UI）」は統一。

---

## 6. 総括：ビジュアル言語の共通項と差異

### 共通項（道具らしいUIが必ず持つもの）

| 要素                 | 共通パターン                                                          |
| -------------------- | --------------------------------------------------------------------- |
| **背景色**           | ニュートラルグレー（warm または cool の薄いグレー）。純白を避ける傾向 |
| **アクセントカラー** | 1〜2 色のみ。役割（インタラクティブ要素・重要状態）に限定             |
| **フォント**         | システムフォント優先または Inter 等の極めてシンプルな書体             |
| **余白**             | 一貫したスケール（4px / 8px グリッド）。密集よりも空間を活かす        |
| **アニメーション**   | 機能的なフィードバックに限定。装飾的モーションは排除                  |
| **ナビゲーション**   | 安定・一貫・再訪時に「同じ景色」を提供                                |
| **アイコン**         | 小さく・シンプルに。カラーのアイコン背景は廃止傾向                    |
| **ダークモード**     | 完全対応が標準。純黒・純白でなく「オフ」な値を使う                    |

### 差異（プロダクトのキャラクターを作るもの）

| プロダクト     | キャラクターを作る選択                                          |
| -------------- | --------------------------------------------------------------- |
| Linear         | ウォームグレー + インジゴアクセント + Inter Display 見出し      |
| Vercel         | 機能的カラースケール + 10 段階のグレー + P3 対応                |
| GitHub Primer  | 14 段階グレー + 7 つの semantic 役割 + スケール反転ダークモード |
| Stripe         | #0A2540 深青 + Lab カラースペース + 数学的コントラスト保証      |
| Raycast        | #FF6363 赤アクセント + ダーク UI + キーボードファースト         |
| ラッコツールズ | 装飾ゼロ + 情報密度最大 + 速さ優先                              |

---

## 7. yolos.net への方向性提言（複数案）

以下は選択肢の提示。最終決定は PM と Owner が行う。

---

### 案 A:「静かなプロ道具」— Geist / Primer 系

**コンセプト:** 開発者ツール的な洗練。余白が広く、色が少なく、機能が際立つ。

- **ライトモード背景:** `#f9fafb`（ほぼ白の薄いグレー）
- **ダークモード背景:** `#111827`（濃い暗グレー、黒ではない）
- **アクセント:** 単一色、`#3b82f6`（ニュートラルブルー）または `#6366f1`（インジゴ）
- **グレースケール:** 8〜10 段階の CSS 変数で管理
- **フォント:** Inter（ラテン）+ システムフォント（日本語）
- **モーション:** ゼロ（ページ遷移もなし）

**適合性:** ツール利用者への「ためらいなく使えるUI」。Google Analytics データを見てエンジニア・デジタルリテラシー高い層が多いなら最適。

**リスク:** 「親しみやすさ」が薄い。初回訪問者が冷たく感じる可能性。

---

### 案 B:「温かい道具箱」— Notion 系

**コンセプト:** ウォームトーンのニュートラル。「日常の傍にある」を視覚的に体現。

- **ライトモード背景:** `#fafaf8`（オフホワイト、わずかに温かみ）
- **ダークモード背景:** `#1c1c1a`（ウォームな暗色）
- **アクセント:** `#e67e22`（アンバー）または `#059669`（エメラルド）などの温かみのある色
- **グレースケール:** ウォーム系グレー（わずかな黄みがかったグレー）
- **フォント:** Inter（ラテン）+ Noto Sans JP（サブセット読み込み）+ システムフォントフォールバック
- **モーション:** 控えめなフェード（150ms 以内）

**適合性:** 「日常の傍にある」コンセプトに視覚的に一致。息抜きコンテンツとの統合もしやすい。

**リスク:** Noto Sans JP の読み込みコスト。ウォームカラーの微妙な調整が難しい（「泥っぽく」なるリスク）。

---

### 案 C:「道具の実直さ」— 日本語ツールサイト改良型

**コンセプト:** ラッコツールズの「実直な機能完結」を視覚的に洗練させる。日本人ユーザーに親しみやすい。

- **ライトモード背景:** `#ffffff`（純白）+ カード背景 `#f5f5f5`
- **ダークモード背景:** `#18181b`（亜鉛グレー系）
- **アクセント:** `#2563eb`（ブルー）or `#16a34a`（グリーン）— 日本語ツールサイトの慣習的な色
- **グレースケール:** シンプルな 6 段階
- **フォント:** システムフォントのみ（ゼロ読み込みコスト）
- **モーション:** ゼロ

**適合性:** 最速の読み込み。既存の日本語ツールサイトユーザーへの学習コストゼロ。

**リスク:** 「差別化が難しい」。他のツールサイトとの区別がつかず、サイトコンセプトが視覚的に体現されない。

---

### 案 D:「洗練された中立」— Linear 系 + 日本語最適化

**コンセプト:** Linear のウォームグレー哲学を日本語サイトに適用。最も「道具らしさ」に忠実。

- **ライトモード背景:** `#f8f7f6`（ウォームグレー、ほとんど気づかない温かみ）
- **ダークモード背景:** `#141210`（ウォームな最深色）
- **アクセント:** 単一色、`#5b5bd6`（インジゴ）または `#7c3aed`（バイオレット）— 「道具らしさ」の中に品質感
- **グレースケール:** 8 段階、LCH/OKLCH ベースで知覚的均一性を確保
- **セマンティックトークン:** 最低 5 役割（surface / text / border / interactive / accent）
- **フォント:** Inter（ラテン）+ システムフォント（日本語）
- **モーション:** `prefers-reduced-motion` を考慮した最低限のフィードバック（100ms 以内）

**適合性:** サイトコンセプト「毎日使える道具」に最も整合。息抜きコンテンツとの差は「温かみのあるアクセント」で表現できる。WCAG 2.2 対応も設計に組み込みやすい。

**リスク:** ウォームグレーの微調整が実装で難しい。CSS 変数の設計に最も工数がかかる。

---

## 8. 実装上の共通推奨事項（どの案でも採用すべき）

**CSS 変数設計（globals.css）で管理すべき最低限のトークン:**

```css
:root {
  /* Surface */
  --color-bg: #f9fafb;
  --color-bg-subtle: #f3f4f6;
  --color-surface: #ffffff;

  /* Text */
  --color-text: #111827;
  --color-text-muted: #6b7280;

  /* Border */
  --color-border: #e5e7eb;

  /* Interactive / Accent */
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;

  /* Semantic */
  --color-success: #059669;
  --color-warning: #d97706;
  --color-danger: #dc2626;

  /* Typography */
  --font-sans:
    "Inter", system-ui, -apple-system, "Hiragino Sans",
    "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif;
  --font-size-base: 15px;
  --line-height-base: 1.7;
  --letter-spacing-ja: 0.05em;

  /* Spacing (8px base grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

:root.dark {
  --color-bg: #111827;
  --color-bg-subtle: #1f2937;
  --color-surface: #1f2937;
  --color-text: #f9fafb;
  --color-text-muted: #9ca3af;
  --color-border: #374151;
  /* accent, semantic 色は同一または微調整 */
}
```

**フォーカスリング:**

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

**モーション制御:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 参考リンク一覧

- Linear デザインリフレッシュ: https://linear.app/now/behind-the-latest-design-refresh
- Linear UI 再設計 Part II: https://linear.app/now/how-we-redesigned-the-linear-ui
- LogRocket — Linear design 解説: https://blog.logrocket.com/ux-design/linear-design/
- Vercel Geist カラーシステム: https://vercel.com/geist/colors
- GitHub Primer カラーシステム: https://primer.style/foundations/color/overview/
- Stripe アクセシブルカラー: https://stripe.com/blog/accessible-color-systems
- ラッコツールズ: https://rakko.tools/
- 日本語 Web タイポグラフィ解説: https://medium.com/@masaharuhayataki/japanese-web-typography-anatomy-and-best-practices-185449b7be65
- AQworks — 完璧な日本語タイポグラフィ 7 則: https://www.aqworks.com/blog/perfect-japanese-typography
- 日本語 Web タイポグラフィ（ULPA）: https://www.ulpa.jp/post/beyond-translation-japanese-typography-in-web-design
- 2026 年 UI カラートレンド: https://updivision.com/blog/post/ui-color-trends-to-watch-in-2026
- WCAG 2.2 フォーカス表示: https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- WebAIM コントラスト解説: https://webaim.org/articles/contrast/
- prefers-reduced-motion（MDN）: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- 日本語フォント設定ガイド 2025: https://www.bloomstreetjapan.com/best-japanese-font-setting-for-websites/
- 最適な日本語 Web フォントファミリー 2025: https://officetakec.com/2025年版：最適な日本語webフォントファミリー設定ガイド/
- ダークモード CSS ガイド: https://design.dev/guides/dark-mode-css/
- Primer primitives（GitHub）: https://github.com/primer/primitives
- Google Fonts — Noto Sans JP: https://fonts.google.com/noto/specimen/Noto+Sans+JP
