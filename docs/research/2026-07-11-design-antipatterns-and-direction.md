# デザイン調査: AI slop アンチパターンと「よろず屋」の視覚言語（cycle-278 T5）

- 目的: 新デザインシステムをゼロから導出する前提調査（オーナー指示: AI slop 的デザインの徹底調査を先行させる）。
- 調査員3名（英語圏の AI slop / 日本語圏の AI 臭さと信頼要因 / ポジティブ方向=よろずの一貫性）。**本書がその恒久記録**（調査員の詳細レポートはサイクル作業ファイルで揮発するため、要点と代表出典をここに引き上げてある。代表出典は本文中に URL で記載）。
- 注記（記録の誠実さ）: 各レポートの「アクセス日 2026-07-12」は PM が指示文に書いた日付の誤りで、実際のアクセスは 2026-07-11 夜（JST）。
- 出典の性格: 多くはデザイナー/スタジオの批評記事であり査読研究ではない。「パターンが存在し批評されている事実」は信頼できるが、個別の統計値は参考値。

## 1. AI slop の視覚パターン（英語圏・T5-a）

### 収斂の機構（なぜ AI は同じ見た目を作るか）

- **分布の平均への回帰**: LLM は学習データ上で最多のパターンに必然的に寄る。「モデルはデザインしない——見てきた全 UI の加重平均を計算する」。
- **名指しされる単一の元凶**: Tailwind の `bg-indigo-500` 既定（2019）が無数のチュートリアル/OSS に複製され、学習データを「紫=モダン」で汚染（作者本人が冗談で謝罪）。shadcn/ui は「AI エージェントによるコピペ前提」の設計で既定スタイルの漏出を増幅。
- 含意: **「良いデザインにして」という言葉の指示は無力。回避は機械的制約（正確な値・ネガティブ指示・検査可能なルール）でモデルの選択肢を畳むことでしか成立しない**。

### 名指しできる主要アンチパターン（禁止として書ける形・出典は本書末尾）

- **タイポ**: Inter/Roboto/Open Sans 等の既定 sans を無検討で本文に／見出し1語だけセリフ・イタリック／all-caps ラベル多用／本文モノスペース。
- **色**: 紫〜青グラデを主役に／全面グラデーション／色付きグロー・色付き box-shadow／意図なき恒常ダーク+中グレー本文／ダークで AA 未達。
- **構造**: 中央揃えヒーロー+H1 直上のピル型バッジ／「ヒーロー→アイコン3枚カード→証言→統計→料金→フッター」の定型順序／アイコン付き同型カードのグリッド乱発／**カードの上端/左端だけの色付きボーダー**（「em ダッシュに匹敵する最も信頼できる AI の指紋」）／全要素一律16px角丸+一律パディング／見出し・ナビの絵文字。
- **部品**: shadcn 既定トークン無改変／グラスモーフィズム。
- **画像**: AI 生成イラストの質感／Corporate Memphis 風ブロブ人間／無関係なストック写真／浮遊する抽象3D。
- **モーション**: 全要素一律の fade-in（か、無反応）。意図あるモーションは AI が最も失敗する領域。
- **コピー**: 抽象ヒーロー見出し（"Build the future"型）／"not just X, it's Y" 構文／ヘッジ表現／汎用最上級。

### 回避策の合意

創造と実装の分離／禁止のネガティブ指示と正確なトークン値（hex/oklch・radius・フォント名）／アクセントは1色に絞り副次は「色の不在」で／8px の「安全な中間」角丸を避け 0 か大きくへ意図的に振る／実データ・実参照で作る／複数案並列から選ぶ（1案の反復ナッジは平均へ収斂）。

## 2. 日本語圏の視点（T5-b）

1. **AI 臭さの主戦場はビジュアルより日本語コピー**。「信頼できない理由」1位=日本語の不自然さ 40.91%（デザポケ調べ300名・2位の会社情報欠如/デザイン違和感 各14.77% を大きく引き離す）。抽象動詞の濫用・コロン頻出見出し・過剰な箇条書き太字・整形残り（絵文字・半角スペース）が症状。**デザインを磨いてもコピーが AI 臭ければ信頼は崩れる→デザインシステムは「文章」の層を持つ必要がある**。
2. **信頼される要因は引き算**: 「シンプルで清潔感」13.47%・「フォントが読みやすく情報が整理」13.13%。華美でなく可読性と整理。安っぽさの典型=未加工テンプレ・グラデ立体ボタン・配色/書体の不統一・低品質素材。
3. **約物処理・和欧混植・文字詰め（palt/halt/chws）は AI 量産サイトがまず手を付けない領域**。日本語組版を丁寧にやるだけで「人が組んだ密度」が出る——新システムの最優先タイポ層。
4. **「とりあえず Noto Sans JP」問題**: 定番既定すぎて差別化困難という日本語圏固有の論点。游ゴシックは OS 標準搭載で配信ゼロ・小サイズに強い。フォントは用途で選ぶ意図が要る。
5. **当サイト固有の警告**: 無料診断/占いは、日本の胡散臭い情報商材/占いアフィ LP（縦長1枚・煽り・偽の限定・結果を焦らして誘導）と構造的に近づきやすい。**「結果を出し惜しみせず最初に見せる」情報設計が胡散臭さ回避の鍵**。

## 3. ポジティブ方向: 「よろず（雑多）なのに一貫して上質」の構造（T5-c）

1. **一貫性は「器」で、多様性は「中身」で**。大規模多品目サイト/雑誌の一貫性は表層の統一でなく、下位レイヤ（デザイントークン・グリッド/ベースラインリズム・共通の器）の共有で生まれる。雑誌は特集・レシピ・コラム・広告という異質コンテンツを同一グリッド+同一ベースラインに載せるだけで一冊として成立させている——「診断・計算・作成・遊び」はまさにこの構造。
2. **店らしさは装飾でなく「言葉」で最も安く強く出る**。ラベル/品書きの語選びがブランド人格を具体化する（「のれん=店号と一本罫」「棚=一覧」「値札=種別/所要時間の小ラベル」の翻訳）。縦書き・和色ベタ塗りは実用系の可読性を壊すため、装飾は枠・罫・語彙に留める。
3. **クラフト感は採り、ブルータリズムの破壊は捨てる**: 1px 実線罫・鋭い幾何・限定パレット+アクセント1色・（必要なら）CSS グレインが「人が意図して設計した」ことを伝える。色のクラッシュ・破壊レイアウトは実用ツールの信頼を損なう。
4. **遊び系と実用系の同居は非対称設計**: 基層（グリッド・タイポ・器・罫・トークン）は実直に振って全画面共通、遊びはアクセント層（限定の色・マイクロインタラクション・結果成果物の中）でだけコンテンツ別に足す。逆（基層から遊ばせる）は実用系が壊れる。
5. **日本語 Web フォントの現実**: Noto Sans JP フル約16MB/1ウェイト約4MB→サブセット化（常用漢字+かな+約物、layout-features 保持、WOFF2）で1ウェイト約1.5MB。見出し用の明朝を1書体だけ足すと和の質感（Sawarabi Mincho 約2.2MB 級で軽量）。CSS の罫・約物・連番で画像ゼロの装飾が可能。

## 4. 統合: 新デザインシステムへの入力（PM の判断・T5 導出の前提）

1. **AI slop 対策は「禁止リスト+正確なトークン値」として機械的に書く**（言葉の趣旨説明では効かない——将来のビルダーも LLM だから）。
2. **統一の単位は器（トークン・グリッド・罫・組版）**。コンテンツの個性は器の中（結果成果物・限定アクセント）でだけ。
3. **視覚言語は「店」から引く**: のれん（店号+一本罫）・品書き（罫区切りの一覧——カード乱発の対極）・棚・値札（メタ情報ラベル）・包み（結果成果物）。和モダンの翻訳は枠・罫・語彙まで。
4. **組版=最大の差別化層**: 日本語の自然なコピー・約物処理・和欧混植・ベタ組み基調・明朝×ゴシックの編集的コントラスト。
5. **信頼の設計**: 結果を出し惜しみしない・煽らない・広告（AdSense 前提）と本文の分離を最初から設計・AA コントラストとタップ品質を品質バーに。

## 5. 代表出典（実アクセスは 2026-07-11 夜 JST）

**英語圏 AI slop（§1）**

- 925studios "AI Slop Web Design: Complete Guide (2026)" https://www.925studios.co/blog/ai-slop-web-design-guide
- prg.sh "Why Your AI Keeps Building the Same Purple Gradient Website" https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- solodesign.cc "AI design slop: the tells, and how I built a tool to catch them" https://solodesign.cc/blog/ai-design-slop-the-tells/
- freedesignmd "The shadcn trap" https://freedesignmd.com/blog/shadcn-looks-generic
- dev.to (Alan West) "Why Every AI-Built Website Looks the Same (Blame Tailwind's Indigo-500)" https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p
- MindStudio "How to Avoid AI Slop When Using Claude Design" https://www.mindstudio.ai/blog/claude-design-avoid-ai-slop-design-system
- developersdigest "AI Design Slop: 16 Patterns" https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it
- superdesign.dev "Why AI Design Looks Generic (and How to Fix It)" https://superdesign.dev/blog/why-ai-design-looks-generic
- Wikipedia "Corporate Memphis" https://en.wikipedia.org/wiki/Corporate_Memphis ／ AIGA Eye on Design https://eyeondesign.aiga.org/what-the-think-pieces-about-corporate-memphis-tell-us-about-the-state-of-illustration/

**日本語圏（§2）**

- Web担当者Forum「このサイト怪しいと思う瞬間1位は？」（デザポケ調べ300名） https://webtan.impress.co.jp/n/2025/11/20/50449
- note nikki「AIで作ったWebサイトがAIっぽく見える理由」 https://note.com/nikki_r2d2/n/ndf9325b559c5
- zenn「生成AIっぽい文章の特徴をまとめる」 https://zenn.dev/fibujrsl/articles/4958a844214709 ／ malna https://malna.co.jp/blog/why_genai_writing_feels_off/
- 知識屋「占いアフィリの実態」 https://chishikiya.blog/2025/11/08/fortune-telling-affiliate/
- ICS MEDIA「Noto Sans JP 最新実装ガイド」 https://ics.media/entry/250718/ ／ Undercurrent「定番Noto Sans JPを改めて考える」 https://udct.co.jp/little-press/rethinking-noto-sans-jp/
- プレスマン「約物半角＆文字詰めをCSSのみで」 https://www.pressman.ne.jp/archives/24005 ／ FONTPLUS「chws/vchw」 https://fontplus.jp/usage/services/chws-vchw ／ opus-i「palt」 https://opus-i.com/font-feature-settings-palt/
- SANKOU! https://sankoudesign.com/about/ ／ MUUUUU.ORG https://muuuuu.org/

**ポジティブ方向（§3）**

- Creately "Design System Components" https://creately.com/guides/design-system-components/
- Azura "Magazine Page Layout: Grid Systems" https://azuramagazine.com/articles/magazine-page-layout-how-to-create-grid-systems ／ Stills https://www.stills.com/articles/design-layout-and-grid-systems/
- UXPin "Best Design System Examples"（Uber Base／Atlassian／BuzzFeed Solid） https://www.uxpin.com/studio/blog/best-design-system-examples/
- Figma "Web Design Trends" https://www.figma.com/resource-library/web-design-trends/ ／ Fireart https://fireart.studio/blog/the-best-web-design-trends/
- yasuhisa.com「コンテンツデザインとラベル」 https://yasuhisa.com/could/article/content-design-process-2/
- UhiyamaLab「pyftsubset フォント最適化」 https://uhiyama-lab.com/en/blog/webdev/optimize-subset-fonttools/ ／ assist-all「日本語Webフォント比較」 https://lifestyle.assist-all.co.jp/japanese-web-font-comparison-guide/
- MDN text-decoration https://developer.mozilla.org/en-US/docs/Web/CSS/text-decoration
