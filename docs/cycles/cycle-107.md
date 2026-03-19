---
id: 107
description: B-193 不要データダウンロード削減検討 + B-200 コンテンツ評価ボタン実現性検討
started_at: "2026-03-19T16:54:11+0900"
completed_at: null
---

# サイクル-107

B-165（サイト全面価値向上プロジェクト）フェーズ3-Dの残タスクであるB-193（ゲーム・クイズの不要データダウンロード削減）と、P2タスクのB-200（コンテンツ評価ボタン）の検討・計画を行う。本サイクルでは調査結果の整理と実装方針の策定までを成果物とし、実際のコード変更は次サイクル以降で実施する。

## 実施する作業

- [x] B-193: 不要データダウンロード削減の検討・実装計画策定（yoji-kimeru, nakamawake, irodori, character-personality の4件）
- [x] B-200: コンテンツ評価ボタンの実現性検討・実装計画策定（ユーモア辞書）

## 作業計画

### 目的

不要データダウンロードの削減とコンテンツ評価ボタンの設置について、調査結果を整理し、次サイクル以降で実装するための詳細な計画を策定する。本サイクルの成果物は検討結果ドキュメントと実装計画であり、コード変更は行わない。

### 作業内容

---

#### タスク1: B-193 不要データダウンロード削減の検討・計画策定（4コンテンツ）

**誰の/何のためにやるのか:**
ゲームやクイズをスマホブラウザで手軽に遊びたいユーザーに対して、不要なデータダウンロードを削減し、ページロード速度を改善する。現在、当日1件分のデータしか必要ないのに全件データがクライアントに送られているコンテンツが3つ、相性機能を使わないユーザーにも108KBの相性マトリクスが送られているクイズが1つある。概算で合計約60KB gzip以上の不要データ削減が見込まれ（正確な数値はビルド分析で確認）、特にモバイルユーザーや低速回線のユーザーの体験を向上させる。

**この作業によってどんな価値を提供するのか:**

- ページロード速度の向上（概算で合計約60KB gzip削減の見込み、正確な数値はビルド分析で確認）
- モバイルデータ通信量の節約
- Core Web Vitals（LCP, FCP）の改善によるSEO効果

**検討・計画として何をまとめるか:**

4つのコンテンツそれぞれについて、特性に応じた最適な改善方法を検討し、実装計画を策定する。各コンテンツの問題点の分析、改善方法の選定理由、具体的な実装手順を文書化し、次サイクル以降で着手できる状態にする。

##### 1-A: yoji-kimeru（四字熟語きめる）のサーバーサイドAPI化の計画

- **現状の問題**: `GameContainer.tsx`（"use client"）が `yoji-data.json`（400件全データ、127KB raw / 25KB gzip）をstatic importしており、全データがクライアントバンドルに含まれる。ユーザーが実際に必要なのは当日1件のみ
- **改善方法**: kanji-kanaruの設計思想（答えをサーバー側に秘匿する）を踏襲しつつ、エンドポイント構成はyoji-kimeruの要件に合わせる
  - `GET /api/yoji-kimeru/puzzle` エンドポイントを新設し、ゲーム初期化時にパズル情報（puzzleNumber, reading, category, origin, difficulty）をまとめて取得する。difficultyはリクエストパラメータとして受け取る（yoji-kimeruには beginner, intermediate, advanced の3難易度があり、それぞれ別のスケジュールとデータプールを持つため）
  - `POST /api/yoji-kimeru/evaluate` エンドポイントを新設し、推測の評価（各文字の正誤判定）をサーバー側で行う。difficultyはリクエストボディに含める
  - `GameContainer.tsx` から `yoji-data.json` のimportを削除し、APIを呼び出す形に変更する
  - `_lib/daily.ts` の `getTodaysPuzzle` ロジックをAPI側に移動する
- **GameContainerの変更計画**: API化に伴い以下の変更が必要
  1. handleGuessの非同期化: 同期関数からasync関数に変更する。GuessInputコンポーネントもこの変更の影響を受けるため合わせて対応する
  2. gameState構造の変更: ゲーム中は答えを保持せず、ゲーム終了時にAPIレスポンスから答えを取得する構造に変更する
  3. ローディング状態の追加: API応答待ち中の入力無効化およびローディングインジケーターを実装する
  4. エラーハンドリング: ネットワークエラー時の再試行機能およびエラーメッセージ表示を実装する
  5. ヒントデータの初期取得: ゲーム開始時に `GET /api/yoji-kimeru/puzzle` からパズル情報（puzzleNumber, reading, category, origin, difficulty）を取得し、推測回数に応じて段階的に表示する
- **期待効果**: 25KB gzip削減（当日1件分のデータのみクライアントに送信）
- **実装計画に含めるべき注意事項**: `engine.test.ts`, `daily.test.ts`, `GameBoard.test.tsx` などの既存テストがAPI化に伴い影響を受ける場合は適切に更新する

##### 1-B: nakamawake（ナカマワケ）のServer Componentデータ選択の計画

- **現状の問題**: `GameContainer.tsx`（"use client"）が `nakamawake-data.json`（全パズルデータ）と `nakamawake-schedule.json`（スケジュール）をstatic importしており、全データ（50KB raw / 18KB gzip）がクライアントに送られる。ユーザーが実際に必要なのは当日1パズルのみ
- **改善方法**: Server Component（`page.tsx`）側で当日のパズルを選択し、propsで `GameContainer` に渡す
  - `page.tsx` で `getTodaysPuzzle()` を呼び出し、当日パズルデータと `puzzleNumber` を取得する
  - `GameContainer` のpropsに `puzzle: NakamawakePuzzle` と `puzzleNumber: number` を追加する
  - `GameContainer` から `nakamawake-data.json` と `nakamawake-schedule.json` のimportを削除する
  - `getTodaysPuzzle` と `formatDateJST` のimportを `page.tsx` 側に移動する
- **期待効果**: 18KB gzip削減（当日1パズル分のみクライアントに送信）

##### 1-C: irodori（いろどり）のServer Componentデータ選択の計画

- **現状の問題**: `GameContainer.tsx`（"use client"）が `traditional-colors.json`（250色）と `irodori-schedule.json`（スケジュール）をstatic importしており、全データ（52KB raw / 20KB gzip）がクライアントに送られる。ユーザーが実際に必要なのは当日の5色のみ
- **改善方法**: nakamawakeと同様、Server Component側で当日の色を選択してpropsで渡す
  - `page.tsx` で `getTodaysPuzzle()` を呼び出し、当日の `colors: IrodoriColor[]` と `puzzleNumber` を取得する
  - `GameContainer` のpropsに `colors` と `puzzleNumber` を追加する
  - `GameContainer` から `traditional-colors.json` と `irodori-schedule.json` のimportを削除する
- **期待効果**: 20KB gzip削減（当日5色分のみクライアントに送信）
- **実装計画に含めるべき注意事項**: `getInitialSliderValues` 関数はバンドルサイズに影響せず答えとも無関係であるため、クライアント側に残す

##### 1-D: character-personality クイズの相性データ遅延ロードの計画

- **現状の問題**: 相性マトリクスデータ（108KB）が `character-personality.ts` から `compatibilityMatrix` としてexportされ、RSCペイロード経由で常に送信される。相性機能は結果画面で `ref` クエリパラメータがある場合にのみ使われるが、データは常に含まれる
- **実装前に確認すべきステップ**: ビルド分析（`npm run build` の出力やバンドルアナライザ）で相性データが実際にクライアントに送信されているか確認する。ResultExtraLoader化はコード構造改善として有効なので、相性データがクライアントに含まれていなくても対応は行う
- **改善方法**: 既に `music-personality`, `animal-personality` 等で使用されている `ResultExtraLoader` パターンを `character-personality` にも適用する
  - `character-personality.ts` から `compatibilityMatrix` のexportを分離し、相性データを独立したモジュールにする
  - `ResultExtraLoader.tsx` に `character-personality` 用のdynamic import エントリを追加する
  - 相性表示コンポーネントを作成し、`ResultExtraLoader` から遅延ロードされるようにする
- **期待効果**: 相性機能を使わないユーザー（大多数）のダウンロード量を削減

##### 検討結果ドキュメントの作成

- `/docs/research/` 配下に B-193 の検討結果をまとめたドキュメントを作成する
- 各コンテンツの判断結果（改善方法の選択理由、問題なしと判断したコンテンツの理由）を記載する
- 実装前後のバンドルサイズ比較の見込み値を記載する
- 実装用のバックログアイテムを `/docs/backlog.md` に適切な単位で追加する

**実装計画に含めるべき注意事項:**

- yoji-kimeruのAPI化では、kanji-kanaruの設計思想（答えをサーバー側に秘匿する）を踏襲しつつ、エンドポイント構成はyoji-kimeruの要件に合わせること。yoji-kimeruのヒントは推測ごとの比較フィードバックではなく、推測回数に応じた静的データ（reading, category, origin, difficulty）の段階表示であるため、kanji-kanaruのhintsエンドポイントをそのまま踏襲するのではなく、ゲーム初期化時にパズル情報をまとめて取得する `GET /api/yoji-kimeru/puzzle` の設計が適切
- yoji-kimeruには beginner, intermediate, advanced の3難易度があり、それぞれ別のスケジュールとデータプールを持つ。APIにdifficultyをリクエストパラメータとして渡す仕様とすること
- nakamawakeとirodoriでは、`GameContainer` のpropsインターフェースを変更するため、既存テスト（特に `GameContainer` 関連）が壊れないよう注意する。propsで受け取る形に変更した後、テスト側も対応すること
- Server Component（`page.tsx`）で `getTodaysPuzzle()` を呼び出す際、日付はJST基準で取得する必要がある。`formatDateJST` を使用すること
- character-personalityの `ResultExtraLoader` 追加では、既存の5つのクイズ（music-personality, character-fortune, animal-personality, science-thinking, japanese-culture）のパターンを正確に踏襲すること
- 各コンテンツの実装後、`npm run build` でバンドルサイズを確認し、期待通りの削減が実現されていることを検証すること

**どうなったら完成といえるのか:**

- 検討結果ドキュメントが `/docs/research/` に作成され、各コンテンツの問題点・改善方法・選択理由が文書化されている
- 4つのコンテンツすべてについて、具体的な実装手順が計画として整理されている
- 実装用のバックログアイテムが `/docs/backlog.md` に適切な単位で追加されている

---

#### タスク2: B-200 コンテンツ評価ボタンの実現性検討・実装計画策定（ユーモア辞書）

**誰の/何のためにやるのか:**
ユーモア辞書（`/dictionary/humor/[slug]`）を閲覧するユーザーに対して、エントリへの反応を気軽に表明できる手段を提供するため。また、運営側（AI）がユーザーの反応データを基にコンテンツの改善判断を行えるようにするため。

**この作業によってどんな価値を提供するのか:**

- ユーザー: 「おもしろかった」という気持ちを表明できるインタラクション体験の提供
- 運営: AIのギャグセンスと人間の感覚のズレを定量的に把握し、エントリの改善・差し替え・追加の方向性を決定するためのデータ収集
- 将来: 評価データを基にした人気ランキング、他コンテンツへの展開基盤

**検討・計画として何をまとめるか:**

実現性を確認し、具体的な実装方針を策定する。以下の各要素について、設計方針と実装手順を文書化する。

##### 2-A: LocalStorageユーティリティの設計

- ファイル: `src/humor-dict/_lib/rating-storage.ts`
- 機能: 評価済みslugの読み書き
- 既存パターン（`isStorageAvailable`）に準拠
- LocalStorageキー命名: 既存の `humor-dictionary` パターン（RecordPlay.tsxで `recordPlay("humor-dictionary")` として使用）との整合性を確認し、`humor-dictionary-ratings` を使用する（`humor-dict-ratings` ではなく、RecordPlay.tsxで使われている `humor-dictionary` に合わせる）

##### 2-B: GA送信関数の設計

- ファイル: `src/lib/analytics.ts`
- `trackContentRating` 関数を追加（既存の `sendGaEvent` を利用）
- `GaContentType` 型に `humor_dict` を追加する（既存の型定義を拡張）。ただし、実装時に `GaContentType` の汎用利用が適切か、`content_rating` 専用の型を別途定義すべきかを判断すること
- イベント名: `content_rating`
- パラメータ: `content_type`（`humor_dict`）、`content_slug`（エントリのslug）、`rating_type`（`funny`）

##### 2-C: 評価ボタンコンポーネントの設計

- ファイル: `src/humor-dict/_components/EntryRatingButton.tsx`
- クライアントコンポーネント（`"use client"`）
- 仕様:
  - 「おもしろかった」ボタン（絵文字 + テキスト）
  - クリック時: LocalStorageに記録 + GAイベント送信 + 楽観的UIで即座にフィードバック
  - 評価済み: ボタンの見た目を変更（押下済み状態）、再クリック不可
  - アクセシビリティ: `aria-pressed` でトグル状態を表現
  - アニメーション: transform + opacity、100-300ms、prefers-reduced-motion対応
  - SSR安全: 初期状態は未評価、useEffectでLocalStorageから評価済み状態を復元

##### 2-D: ページへの組み込み方針

- ファイル: `src/app/dictionary/humor/[slug]/page.tsx`
- 配置位置: 現在のページ構成は「用例 → 関連語 → ShareButtons → 一覧へ戻る」であり、評価ボタンはShareButtonsの直前（関連語セクションの後）に配置する。評価ボタンとShareButtonsが視覚的に自然に並ぶことを実装時に確認すること

##### 2-E: テスト計画

- `rating-storage.ts` のユニットテスト
- `EntryRatingButton.tsx` の基本的な動作テスト（レンダリング、クリック時の状態変化、評価済み状態の復元）

##### 2-F: GA4カスタムディメンション登録手順の文書化

- GA4管理画面でのカスタムディメンション登録が必要であること、遡及されないことをドキュメントに記載する
- owner対応事項として明記する

**実装計画に含めるべき注意事項:**

- `[slug]/page.tsx` はServer Componentであるため、評価ボタンはClient Componentとして分離する必要がある。既存の `RecordPlay.tsx`（副作用専用Client Component）が先例として参考になる
- LocalStorageアクセスはSSR時にエラーになるため、`isStorageAvailable` パターンを必ず使用すること
- GA4のカスタムパラメータは管理画面でディメンション登録しないとレポートに表示されない。登録は遡及されないため、実装完了時点でowner向けに登録手順を案内する必要がある
- ボタンのデザインは既存のShareButtonsやサイト全体のトーンと調和させること
- prefers-reduced-motionメディアクエリに対応し、モーション低減設定のユーザーにはアニメーションを無効化すること
- LocalStorageキー命名は `humor-dictionary-ratings` とする。RecordPlay.tsxが `humor-dictionary` を使用しており、この命名に合わせることでコンテンツID部分の一貫性を保つ

**どうなったら完成といえるのか:**

- 実現性が確認され、実装方針がサイクルドキュメントに文書化されている（B-200の検討結果はサイクルドキュメント内の記述をもって文書化とする。B-193のような別途のresearchドキュメントは作成しない）
- 実装用のバックログアイテムが `/docs/backlog.md` に追加されている
- GA4カスタムディメンション登録が必要な旨が文書化されている

---

### 検討作業の実施順序

1. **タスク1（B-193: 不要データダウンロード削減の検討）を先に実施する。** パフォーマンス改善はすべてのユーザーに恩恵があるため優先度が高い。検討は以下の順で行い、検討結果ドキュメントを `/docs/research/` に作成する:
   1. **nakamawake**: Server Componentデータ選択方式で最もシンプル。パターン確立のため最初に検討
   2. **irodori**: nakamawakeと同じServer Componentデータ選択方式。nakamawakeで確立したパターンの適用可否を確認
   3. **yoji-kimeru**: API化が必要で最も変更量が大きい。既存のkanji-kanaruパターンとの差異を整理
   4. **character-personality**: 既存のResultExtraLoaderパターンへの追加。独立性が高いため最後に検討
   5. 検討結果ドキュメントの作成と、実装用バックログアイテムの追加
2. **タスク2（B-200: コンテンツ評価ボタンの実現性検討）を後に実施する。** 実現性の確認と実装方針の文書化、実装用バックログアイテムの追加を行う。

### 検討した他の選択肢と判断理由

#### B-193/B-200: 本サイクルのスコープ

- **選択肢A (採用): 検討・計画のみ** -- 本サイクルは複数のバックログアイテムをまとめて検討するサイクルとして開始した。実装まで含めるとスコープが肥大化し品質管理が困難になるため、検討・計画に留める。実装は次サイクル以降で適切な単位に分割して行う
- **選択肢B: 検討 + 実装** -- サイクルを分けても分けなくても作業量が同じであれば完了までの期間はほぼ変わらない。むしろスコープが広くなると手戻りが発生しやすくなり、かえって時間がかかるリスクがある。不採用

#### B-193: yoji-kimeruの改善方法（API化 vs Server Componentデータ選択）

- **選択肢A (採用): サーバーサイドAPI化** -- yoji-kimeruはnakamawakeやirodoriと異なり、ゲーム中に推測の評価（各文字の正誤判定）を行う必要がある。全データをpropsで渡すと結局クライアントに答えが含まれることになる。kanji-kanaruと同じ問題構造であるため、同じAPI化パターンが最適
- **選択肢B: Server Componentデータ選択+props渡し** -- 当日の四字熟語1件だけをpropsで渡すと、ユーザーがブラウザの開発者ツールで答えを見られる。バンドルサイズは削減できるが、ゲーム体験の公正性に問題が残る。yoji-kimeruはWordle型ゲームであり答えを見せないことが重要。不採用

#### B-193: nakamawake/irodoriの改善方法

- **選択肢A (採用): Server Componentでデータ選択+props渡し** -- 最もシンプルで変更量が少ない。`page.tsx`（Server Component）で`getTodaysPuzzle()`を呼び出し、結果をpropsで渡すだけ。API化は不要。nakamawakeのグループ情報はクライアント側のcheckGuess関数に必要であり、irodoriの色情報もクライアント側のcolorDifference計算に必要。API化しても正誤判定ロジックがクライアントにある限りDevToolsでの答え確認は防げない。したがってAPI化の追加的なユーザー価値はなく、よりシンプルなServer Component方式が最適
- **選択肢B: サーバーサイドAPI化** -- nakamawakeとirodoriではAPI化のメリットが薄い。nakamawakeのグループ情報は答え合わせに必要でクライアントに渡さざるを得ず、irodoriの色情報も同様。過剰な対応となるため不採用

#### B-200: ボタンの種類（単一 vs 複数）

- **選択肢A (採用): 「おもしろかった」1種類** -- シンプルで分かりやすく、クリック率が高くなる。ユーモア辞書の目的（面白いかどうかの判定）に直結する
- **選択肢B: 複数の反応** -- ユーザーに選択の負荷をかける。初回実装としては過剰。不採用

### 計画にあたって参考にした情報

- **バンドルサイズ実測値**: yoji-data.json 127KB raw / 25KB gzip、nakamawake全データ 50KB raw / 18KB gzip、irodori全データ 52KB raw / 20KB gzip、character-personality相性マトリクス 108KB。概算で合計約60KB gzip以上の削減が見込まれるが、gzip圧縮率はファイル構成やビルド設定に依存するため、正確な削減量はビルド分析で確認する
- **kanji-kanaruのAPI実装パターン**: `POST /api/kanji-kanaru/evaluate`（推測評価）と `GET /api/kanji-kanaru/hints`（ヒント取得）の2エンドポイント構成。全2,136件の漢字データをサーバー側のみで管理し、クライアントには常用漢字セット（20KB）のみ配信。yoji-kimeruのAPI化では設計思想（答えの秘匿）を踏襲するが、エンドポイント構成はyoji-kimeruの要件に合わせる（ヒントが推測ごとの比較フィードバックではなく静的データの段階表示であるため、`GET /api/yoji-kimeru/puzzle` でまとめて取得する設計とする）
- **各コンテンツのデータフロー**: yoji-kimeruは `GameContainer.tsx` で `yoji-data.json` をstatic import、nakamawakeは `GameContainer.tsx` で `nakamawake-data.json` + `nakamawake-schedule.json` をstatic import、irodoriは `GameContainer.tsx` で `traditional-colors.json` + `irodori-schedule.json` をstatic import。いずれも "use client" コンポーネントからのimportであるためクライアントバンドルに含まれる
- **既存のResultExtraLoaderパターン**: music-personality, character-fortune, animal-personality, science-thinking, japanese-culture の5クイズで使用済み。`next/dynamic` + `{ ssr: false }` でデータモジュールを遅延ロードする方式
- **ユーモア辞書のページ構成**: ファーストビュー（見出し語・よみがな・定義）→ 解説 → 用例 → 関連語 → ShareButtons → 一覧へ戻る。RecordPlay.tsxが副作用専用Client Componentの先例
- **LocalStorage命名パターン**: RecordPlay.tsxが `recordPlay("humor-dictionary")` を使用しているため、評価ボタンのキーは `humor-dictionary-ratings` とする
- **GA4設定**: `src/lib/analytics.ts` に `sendGaEvent` が実装済み。`GaContentType` は現在 `"game" | "quiz" | "diagnosis" | "fortune"` の4種類

## レビュー結果

### レビュー1回目（v2計画レビュー）

重大2件・中4件・小3件の指摘を受け、以下を修正:

1. **[重大] yoji-kimeruのAPI設計を修正**: `GET /api/yoji-kimeru/hints` を `GET /api/yoji-kimeru/puzzle` に変更。ヒントが推測ごとの比較フィードバックではなく静的データの段階表示であることを反映
2. **[重大] GameContainerの変更詳細を追加**: handleGuessの非同期化、gameState構造変更、ローディング状態、エラーハンドリング、ヒントデータ初期取得の5項目を明記
3. **[中] character-personalityの検証ステップを追加**: ビルド分析で相性データの送信状況を確認するステップを追加
4. **[中] nakamawake/irodoriの答え露出トレードオフを補足**: API化しても正誤判定ロジックがクライアントにある限り答え確認を防げない旨を記載
5. **[中] バンドルサイズの数値を概算であることを明記**: 正確な数値はビルド分析で確認する旨を追記
6. **[中] yoji-kimeruのdifficulty取り扱いを追記**: 3難易度のAPIパラメータ仕様を明記
7. **[小] GaContentType拡張の適切性**: 汎用利用か専用型かの判断を注記
8. **[小] irodoriのgetInitialSliderValues**: クライアント側に残す旨を明記
9. **[小] 完成条件の検証基準**: 検討のみサイクルに合わせた完成条件に変更

### レビュー2回目（v3計画レビュー — スコープ変更後）

ownerの指示に基づきスコープを「検討・計画のみ」に変更した後の再レビュー。前回9件の指摘事項はすべて適切に対応済みを確認。新たな指摘は小3件のみ:

1. **[小] バックログタイトルとのずれ注意**: B-193のタイトル「サーバーサイドAPI横展開検討」と実際の計画内容（API化+Server Component方式+ResultExtraLoader）にずれあり。サイクル完了時の記載に注意
2. **[小] タスク2のドキュメント方針の明確化**: B-200の検討結果はサイクルドキュメント内の記述で文書化とする旨を完成条件に追記
3. **[小] チェックリストへのタスク2成果物検証項目の追加**: B-200の実装方針文書化とGA4登録手順の文書化の2項目を追加

上記3件を対応済み。

### レビュー3回目（成果物レビュー — B-193）

検討結果ドキュメントとバックログアイテムのレビュー。中1件・小2件の指摘:

1. **[中] nakamawake/irodoriのgzip概算値が実測の約2倍に過大評価**: nakamawake 18KB→約10KB、irodori 20KB→約10KBに修正
2. **[小] yoji-data.json rawサイズ**: 127KB→約130KBに修正
3. **[小] character-personality相性データサイズ**: 108KB→約121KBに修正

上記3件を対応後、再レビューで指摘0件。承認。

### レビュー4回目（成果物レビュー — B-200）

バックログアイテムとGA4登録手順のレビュー。指摘0件で承認。

## キャリーオーバー

なし

## 補足事項

### GA4カスタムディメンション登録（owner対応事項）

B-200（コンテンツ評価ボタン）の実装後、GA4管理画面で以下のカスタムディメンションを登録する必要がある。登録は遡及されないため、実装デプロイ前に完了することが望ましい。

**登録するカスタムディメンション:**

- `content_type` — イベントスコープ、説明: コンテンツの種類（例: humor_dict）
- `content_slug` — イベントスコープ、説明: コンテンツのスラッグ（例: monday）
- `rating_type` — イベントスコープ、説明: 評価の種類（例: funny）

**登録手順:**

1. GA4管理画面 → 管理 → カスタム定義 → カスタムディメンションを作成
2. 上記3つのディメンションをそれぞれ作成（スコープ: イベント）
3. 登録後、content_ratingイベントのパラメータがレポートで分析可能になる

## サイクル終了時のチェックリスト

- [ ] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [ ] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [ ] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [ ] 検討結果ドキュメントが `/docs/research/` に作成されている（タスク1）。
- [ ] B-200の実現性確認結果と実装方針がサイクルドキュメントに文書化されている（タスク2）。
- [ ] GA4カスタムディメンション登録手順がowner対応事項として文書化されている（タスク2）。
- [ ] 実装用バックログアイテムが `/docs/backlog.md` に追加されている（タスク1・タスク2）。
- [ ] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [ ] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [ ] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
