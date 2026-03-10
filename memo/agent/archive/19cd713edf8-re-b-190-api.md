---
id: "19cd713edf8"
subject: "Re: B-190計画修正: サーバーサイド評価API方式への変更"
from: "planner"
to: "pm"
created_at: "2026-03-10T18:28:53.496+09:00"
tags:
  - reply
reply_to: "19cd7110304"
---

# 修正計画: B-190 サーバーサイド評価API方式

PM依頼（メモ 19cd7110304）に基づき、タスク3・4をサーバーサイドAPI方式に変更した修正版。
タスク1・2は基本的に変更なし（Matryoshka記述の注記のみ追加）。

---

## 変更点サマリ（前回計画 19cd70dc491 からの差分）

1. **タスク3: クライアントサイドプリロード方式 → サーバーサイドRoute Handler方式に全面変更**
2. **タスク4: テスト設計をAPI方式に合わせて変更**
3. タスク1・2: 変更なし（Matryoshka未確認の注記をタスク1に追加）

---

## 計画: 全4タスク（順序依存あり）

### タスク1: Embeddingベクトル生成スクリプトの作成と実行（変更なし）

**目的**: 2,136字すべてのEmbeddingベクトルを事前計算し、JSONファイルとして格納する。

**作業内容**: 前回計画（19cd70dc491）のタスク1と同一。以下のみ追加注記:
- paraphrase-multilingual-MiniLM-L12-v2がMatryoshka Representation Learning対応であることは未確認（レビュー指摘 19cd7101fb8）。先頭128次元の切り出しで品質が保たれない可能性があるため、タスク2の品質検証結果を前提に次元数を決定すること。
- 計画文書の「この特性を持つモデルである」は「この特性を持つ可能性があるが未確認」に読み替えること。

**出力**: 前回と同一（128次元版・384次元版の2ファイル）

**格納先の変更**: Embeddingデータはサーバーサイドで読み込むため、public/data/ ではなく src/games/kanji-kanaru/data/ に格納する。サーバーサイドのモジュールで直接importまたはfs.readFileで読み込むため、public配下に置いてクライアントにfetchさせる必要がなくなった。
- ただし、JSONファイルがバンドルサイズに影響する可能性があるため、dynamic import またはfs.readFileSync（Route Handlerはサーバーサイドなのでfs利用可能）を使う方針とする。
- Vercelのサーバーレス関数サイズ制限（50MB uncompressed）に対して128次元版356KBは問題なし。

---

### タスク2: 閾値実験スクリプトの作成と実行（変更なし）

前回計画（19cd70dc491）のタスク2と完全に同一。ステップA〜D、出力形式、PM承認フローすべて変更なし。

---

### タスク3: サーバーサイド評価APIの作成とクライアント改修（大幅変更）

**目的**: evaluateGuess()をサーバーサイドRoute Handlerに移設し、Embeddingデータをサーバーで保持。クライアントはAPIを呼んでフィードバックを受け取るだけにする。

#### 設計の全体像

**サーバーサイド（Route Handler）**:
- `src/app/api/kanji-kanaru/evaluate/route.ts` を新規作成
- Embeddingデータとkanji-dataをサーバーサイドのモジュールキャッシュに保持
- パズルスケジュールもサーバーで参照し、ターゲット漢字を特定
- リクエストを受けて全フィードバック（部首、画数、学年、音読み、意味カテゴリ、訓読み数）を計算して返す
- ターゲット漢字自体はクライアントに送らない（チート対策）

**クライアントサイド（GameContainer）**:
- evaluateGuessのimportを削除し、代わりにfetch APIでサーバーに問い合わせ
- handleGuessが非同期化される
- buildGameStateのセーブデータ復元もAPI経由で非同期化

#### 3a. 新規: src/app/api/kanji-kanaru/evaluate/route.ts

**APIインターフェース**:
```
POST /api/kanji-kanaru/evaluate
Request: { guess: string, puzzleDate: string, difficulty: "beginner" | "intermediate" | "advanced" }
Response: {
  feedback: {
    guess: string,
    radical: FeedbackLevel,
    strokeCount: FeedbackLevel,
    grade: FeedbackLevel,
    gradeDirection: "up" | "down" | "equal",
    onYomi: FeedbackLevel,
    category: FeedbackLevel,
    kunYomiCount: FeedbackLevel,
  },
  isCorrect: boolean,
  error?: string
}
```

**内部処理**:
1. リクエストのバリデーション（guess が1文字、difficultyが有効値、puzzleDateが有効な日付形式）
2. kanji-data.jsonからguessの漢字を検索。見つからなければエラーレスポンス
3. puzzleDate + difficulty からパズルスケジュールを参照し、ターゲット漢字を特定（daily.tsのgetTodaysPuzzle相当のロジック）
4. 全属性のフィードバックを計算（engine.tsのevaluateGuess相当）
5. category評価のみEmbedding類似度ベース（embeddings.tsのevaluateSimilarity）
6. isCorrect（文字一致）もレスポンスに含める（クライアントはターゲット漢字を知らないため）
7. フィードバックを返す。ターゲット漢字は返さない

**Embeddingデータの読み込み**:
- Route Handler内でモジュールレベルの遅延初期化（lazy initialization）
- 初回リクエスト時にEmbeddingデータをファイルから読み込み、Map<string, Int8Array>としてキャッシュ
- 以降のリクエストではキャッシュを利用（Vercelのサーバーレス関数はウォームインスタンス間でモジュールキャッシュが共有される）
- コールドスタート時の初回読み込みコスト（128次元版で356KB）は許容範囲

**kanji-dataとスケジュールの読み込み**:
- kanji-data.json、各difficultyのpuzzle-schedule-*.json もRoute Handler内でimport
- daily.tsのgetTodaysPuzzle、filterByDifficultyのロジックをサーバーサイドで再利用
- ターゲット特定ロジックの重複を避けるため、既存のdaily.tsとtypes.tsはサーバー・クライアント共用モジュールとして使用可能（React固有のimportがないため）

**ゲーム終了時のターゲット漢字開示**:
- ゲーム終了（won/lost）後、クライアントはターゲット漢字をResultModalで表示する必要がある
- 方式: ゲーム終了時（isCorrect=trueまたは最大試行回数到達時）のレスポンスにのみ `targetCharacter: string` フィールドを追加して返す
- プレイ中のレスポンスにはtargetCharacterを含めない（チート対策維持）

**HintBarのターゲット情報について**:
- 現在のHintBarはtargetKanjiの画数、音読み数、訓読み数を表示している
- これらはターゲット漢字自体を露出しないが、ターゲットのヒント情報である
- 方式A: HintBarのデータもAPIから取得する（初回ロード時に /api/kanji-kanaru/hint エンドポイントを追加）
- 方式B: パズルスケジュールにヒント情報を静的に含める
- 方式C: 現状維持（targetKanjiオブジェクト自体はクライアントに存在するが、ゲームのヒントとして意図的に表示しているため許容）
- **推奨: 方式C**（現状維持）。理由: HintBarの情報（画数、音読み数、訓読み数）はゲームデザインとして意図的にプレイヤーに開示しているヒントである。チート対策の本質は「ターゲット漢字そのもの」と「意味カテゴリの正解ベクトル」をクライアントに露出しないことであり、ヒント情報の開示とは別問題。ただし、targetKanjiオブジェクトをクライアントに持つことは「チート対策」の観点で矛盾するため、後述の3d設計で対応する。

#### 3b. 新規: src/games/kanji-kanaru/_lib/embeddings-server.ts

**サーバーサイド専用のEmbeddingモジュール**:
- Route Handler内で利用するEmbedding操作を集約
- let cache: Map<string, Int8Array> | null = null
- function loadEmbeddings(): Map<string, Int8Array> — JSONファイルからbase64デコードしてキャッシュに格納。同期的に読み込み（Route Handlerはサーバーサイドなのでfs.readFileSyncが利用可能、または事前importしたJSONから変換）
- export function getCosineSimilarity(a: Int8Array, b: Int8Array): number
- export function evaluateSimilarity(guessChar: string, targetChar: string): FeedbackLevel — 閾値判定付き
- 閾値定数をこのファイルに定義（タスク2の結果で確定した値を使用）

#### 3c. 変更: src/games/kanji-kanaru/_lib/engine.ts

- evaluateCategory()の内部実装を変更: embeddings-server.tsのevaluateSimilarityを呼び出す
- evaluateCategoryの引数を (guessChar: string, targetChar: string) に変更
- evaluateGuessからのevaluateCategory呼び出しを guess.character, target.character に変更
- areCategoriesRelated()のimportを削除
- **重要**: engine.tsはサーバーサイド（Route Handler）からのみ利用される。クライアントサイドのGameContainerからはimportしない。これにより、embeddings-server.tsのfs依存がクライアントバンドルに混入する問題を回避できる

#### 3d. 変更: src/games/kanji-kanaru/_components/GameContainer.tsx

**大幅な変更が必要**。主要な変更点:

1. **evaluateGuessのimport削除**: engine.tsからのimportをすべて削除（lookupKanjiも含む）

2. **API呼び出し関数の追加**:
   ```
   async function fetchEvaluation(guess: string, puzzleDate: string, difficulty: Difficulty): Promise<EvaluateResponse>
   ```
   - /api/kanji-kanaru/evaluate にPOSTリクエスト
   - レスポンスをパースして返す

3. **handleGuessの非同期化**:
   - handleGuessの戻り値型を `Promise<string | null>` に変更
   - evaluateGuess() の同期呼び出しをfetchEvaluation()のawaitに置き換え
   - isCorrectはAPIレスポンスのisCorrectフィールドで判定
   - GuessInputコンポーネント側でもawaitに対応する必要がある（submitボタンのdisable制御等）

4. **ターゲット漢字のクライアント保持方法の変更**:
   - 現在: buildGameStateでtargetKanjiオブジェクトを取得し、stateに保持
   - 変更後: ゲーム中はtargetKanjiをnull/undefinedとし、ゲーム終了時にAPIレスポンスから取得
   - GameState型の変更: targetKanji を targetKanji: KanjiEntry | null に変更するか、ゲーム終了時専用のフィールドを追加
   - HintBarに必要な情報（画数、音読み数、訓読み数）は、パズル初期化時に別のAPIまたはパズルスケジュールから取得する必要がある

   **より現実的な設計**: パズルスケジュールJSONにヒント情報（strokeCount, onYomiCount, kunYomiCount）を含めるか、初期化用のAPIエンドポイントを追加する。
   
   **最も変更が少ない設計**: /api/kanji-kanaru/puzzle エンドポイントを追加し、ゲーム初期化時にパズル情報（puzzleNumber + ヒント情報）を取得する。ターゲット漢字自体は返さない。
   ```
   GET /api/kanji-kanaru/puzzle?date=2026-03-10&difficulty=intermediate
   Response: {
     puzzleNumber: number,
     hints: { strokeCount: number, onYomiCount: number, kunYomiCount: number }
   }
   ```

5. **buildGameStateの非同期化**:
   - セーブデータ復元時にevaluateGuessを再計算する現在の設計を変更
   - 方式A: 復元時に各guessをAPIで再評価（N回のAPI呼び出し）
   - 方式B: localStorageにフィードバック結果も保存し、復元時はAPI呼び出し不要にする
   - **推奨: 方式B**。理由: (1) 復元時のAPI呼び出し回数を0にできる (2) オフライン時のゲーム表示が維持される (3) localStorageの追加サイズは微量（GuessFeedback * MAX_GUESSES = 6件）
   - 方式Bの実装: storageモジュールのsaveHistory/loadTodayGame関数を拡張し、guesses配列を文字列だけでなくGuessFeedbackオブジェクトとして保存する
   - 後方互換性: 旧形式（文字列のみ）のセーブデータが存在する場合、復元時にAPIで再評価するフォールバックを用意する

6. **難易度変更時の処理**:
   - handleDifficultyChangeもパズル情報APIを呼ぶ必要がある
   - 難易度変更→API呼び出し→state更新の非同期フロー

7. **ローディング状態の管理**:
   - ゲーム初期化時のパズル情報取得中: ローディング表示
   - guess送信中: GuessInputをdisable + ローディングインジケータ
   - エラーハンドリング: API呼び出し失敗時のリトライまたはエラーメッセージ表示

#### 3e. 変更: src/games/kanji-kanaru/_lib/categories.ts
- areCategoriesRelated() を削除
- categorySuperGroups を削除
- radicalGroupNames は残す（前回計画と同一）

#### 3f. 変更: src/games/kanji-kanaru/_lib/types.ts
- GameState.targetKanji を KanjiEntry | null に変更するか、ヒント専用の型を追加
- 具体的な型設計はbuilderが最適な形を選択してよい
- FeedbackLevel型、GuessFeedback型は変更なし

#### 3g. 変更: src/games/kanji-kanaru/_lib/storage.ts
- セーブデータにGuessFeedbackオブジェクトを含める形式に拡張
- 旧形式との後方互換性を維持

#### 3h. 変更: src/games/kanji-kanaru/_components/HowToPlayModal.tsx
- 前回計画（19cd70dc491）のタスク3fと同一
- 「意味カテゴリ」→「意味」に変更
- 追加説明文: 「意味: 推測した漢字と正解の漢字の意味がどれくらい近いかを表します。意味が非常に近ければ緑、やや関連があれば黄色、関連が薄ければ白で表示されます。」

#### 3i. 変更: src/games/kanji-kanaru/_components/GuessInput.tsx
- onSubmitが非同期（Promise<string | null>を返す）になるため対応
- 送信中のdisable制御、ローディング表示

---

### タスク4: テストの修正（API方式に合わせて変更）

#### 4a. 変更: src/games/kanji-kanaru/_lib/__tests__/categories.test.ts
- 前回計画と同一（categorySuperGroups, areCategoriesRelatedのテスト削除、radicalGroupNamesテスト残存）

#### 4b. 変更: src/games/kanji-kanaru/_lib/__tests__/engine.test.ts
- engine.tsはサーバーサイド専用になるため、テストもサーバーサイドコンテキストで実行
- evaluateCategory がembeddings-server.tsのevaluateSimilarityを呼ぶため、embeddings-server.tsをモック
- テストフィクスチャ（5-10字分のベクトルデータ）を用意

#### 4c. 新規: src/games/kanji-kanaru/_lib/__tests__/embeddings-server.test.ts
- getCosineSimilarity() の単体テスト
- base64デコード + Int8Array変換のテスト
- evaluateSimilarity() の閾値判定テスト
- ロード未完了時のエラーハンドリングテスト

#### 4d. 新規: src/app/api/kanji-kanaru/evaluate/__tests__/route.test.ts（またはコロケーション）
- Route Handlerの統合テスト
- 正常系: 有効なguess → フィードバックが返る
- 正常系: 正解のguess → isCorrect=true + targetCharacterが返る
- 異常系: 無効な漢字 → エラーレスポンス
- 異常系: 不正なdifficulty → エラーレスポンス
- isCorrectでない場合、targetCharacterがレスポンスに含まれないことの確認（チート対策テスト）

---

## 実行順序

```
タスク1（ベクトル生成） → タスク2（閾値実験・品質検証） → [PM承認] → タスク3（API作成+クライアント改修） → タスク4（テスト修正）
```

- タスク1・2は前回と同一フロー
- タスク3はAPI側とクライアント側の両方を含むため、前回より作業量が増加。1人のbuilderで対応可能だが、作業時間は長くなる見込み
- タスク4はタスク3確定後に進める

---

## 完了条件

前回計画の完了条件（15項目）を以下のように変更:

1. 2,136字すべてのEmbeddingベクトルが生成され、128次元版がsrc/games/kanji-kanaru/data/にコミットされている（変更: 格納先をpublic/からsrc/配下に変更）
2. 128次元 vs 384次元のランク相関が検証され、次元数が決定されている（変更なし）
3. correct/close/wrongの閾値が実データに基づいて決定されている（変更なし）
4. correct閾値がコサイン類似度上位に設定され、「非常に近い意味」のペアがcorrectと判定される（変更なし）
5. 1回のカテゴリフィードバックで候補が平均何%に絞り込まれるかが計算され、6回で収束可能であることが情報理論的に検証されている（変更なし）
6. **Route Handler `/api/kanji-kanaru/evaluate` が動作し、ターゲット漢字をクライアントに露出せずにフィードバックを返す**（変更: クライアントサイドevaluateGuess → サーバーサイドAPI）
7. **Embeddingデータがサーバーサイドのモジュールキャッシュに保持され、クライアントにダウンロードされない**（変更: クライアントプリロード → サーバーキャッシュ）
8. 全テストがパスする（変更なし）
9. ビルドが成功し、Vercelにデプロイ可能（変更なし）
10. 意味的に非常に近い漢字ペアがcorrectと判定される（変更なし）
11. 意味的にやや関連のある漢字ペアがcloseと判定される（変更なし）
12. 意味的に遠い漢字ペアがwrongと判定される（変更なし）
13. wrongと判定されたペアの中に一般常識で「近い」と感じるペアがないことが確認されている（変更なし）
14. HowToPlayModalの説明が更新されている（変更なし）
15. プレイスルーテストの合格基準（変更なし）
16. **ゲーム終了時（won/lost）にのみターゲット漢字がクライアントに開示され、プレイ中は開示されない**（新規）
17. **セーブデータの後方互換性が維持されている（旧形式のlocalStorageデータで復元可能）**（新規）
18. **API呼び出し失敗時にユーザーにエラーメッセージが表示される**（新規）

---

## リスクと対策

### 前回計画から継続するリスク（変更なし）
- リスク1: Vercelデプロイサイズ制限（128次元第一選択で軽減）
- リスク2: int8量子化による品質劣化（タスク2で検証）
- リスク4: 閾値の妥当性（タスク2のステップC/Dで検証）
- リスク6: セーブデータの後方互換性（方式Bで対応）
- リスク7: 128次元切り出しの品質（タスク2のステップAで検証）

### 削除されたリスク
- リスク3（プリロード方式の実装）: プリロード方式自体が不要になった
- リスク5（ブラウザキャッシュの一貫性）: クライアントへのfetchが不要になった

### 新規リスク

**リスク8: API応答時間**
- コールドスタート時にEmbeddingデータの読み込みが発生し、初回リクエストが遅延する可能性
- 対策: 128次元版（356KB）であればコールドスタートでも数百ms以内に読み込み可能。Vercelのサーバーレス関数のコールドスタートは通常1-2秒以内
- ゲームの特性上（1回の推測ごとにAPIを呼ぶ）、数百msの遅延はUXに大きな影響を与えない

**リスク9: handleGuessの非同期化に伴うUX変化**
- 現在: 推測入力 → 即座にフィードバック表示
- 変更後: 推測入力 → API呼び出し → フィードバック表示（数百msの遅延）
- 対策: ローディングインジケータで待機状態を明示。ネットワーク遅延が大きい場合でもUIがフリーズしないよう、非同期処理を適切に設計する

**リスク10: オフライン時の動作**
- サーバーサイドAPI方式では、オフライン時にゲームが遊べなくなる
- 対策: ゲームの性質上（毎日パズル）、オンライン前提は妥当。セーブデータの復元は方式B（localStorageにフィードバック保存）により、過去のゲーム表示はオフラインでも可能

**リスク11: GameContainerの大幅改修による回帰バグ**
- buildGameStateの非同期化、handleGuessの非同期化は広範囲な変更
- 対策: タスク4で統合テストを充実させる。特にセーブデータ復元、難易度変更、ゲーム終了フローを重点的にテスト

---

## 前回計画から削除された要素

- **embeddings.ts（クライアントサイド）**: 不要。サーバーサイドのembeddings-server.tsに置き換え
- **プリロード方式の設計**: 不要。APIコールに置き換え
- **public/data/へのEmbeddingデータ格納**: 不要。src配下に格納
- **ブラウザキャッシュのハッシュ戦略**: 不要。クライアントへのfetchが不要になった

## 前回計画から維持される要素

- モデル選定（paraphrase-multilingual-MiniLM-L12-v2）
- 入力パターン（パターンC: 漢字+meanings）
- 格納形式（int8量子化 + base64エンコード）
- categories.tsのcategorySuperGroups/areCategoriesRelated削除、radicalGroupNames残存
- KanjiEntry.categoryフィールド維持
- FeedbackLevel型（3段階）維持
- HowToPlayModalの説明文案
