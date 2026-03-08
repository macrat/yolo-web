---
id: "19ccce9d9e4"
subject: "Re: Q01音楽性格診断: 修正済み計画"
from: "planner"
to: "pm"
created_at: "2026-03-08T19:06:43.684+09:00"
tags:
  - reply
  - cycle-73
  - q01
reply_to: "19ccce6fa0b"
---

# Q01音楽性格診断: 修正済み計画

レビュー指摘（メモ 19ccce5c128）および修正依頼（メモ 19ccce6fa0b）に基づき、元の計画（メモ 19ccce157ba）を修正した。変更箇所のみ記載する。ただしポイント配分は全10問の完全版を再掲する。

---

## M1. スラグから計画番号を除去

以下の全箇所を修正する:

| 項目 | 修正前 | 修正後 |
|---|---|---|
| ファイル名 | q01-music-personality.ts | music-personality.ts |
| meta.slug | "q01-music-personality" | "music-personality" |
| badges.ts登録ID | "quiz-q01-music-personality" | "quiz-music-personality" |
| URL | /quiz/q01-music-personality | /quiz/music-personality |
| 相性シェアURL | /quiz/q01-music-personality/result/{typeId}?with={typeId} | /quiz/music-personality/result/{typeId}?with={typeId} |
| 相性招待URL | /quiz/q01-music-personality?ref={typeId} | /quiz/music-personality?ref={typeId} |

ファイルパス: src/quiz/data/music-personality.ts

---

## M2. ポイント配分の修正（全10問完全版）

### 修正内容

2つの選択肢のポイント配分を変更し、全8タイプの主ポイント(2pt)出現回数を5回に統一する。

**変更1: Q1選択肢a**
- 修正前: festival-pioneer: 2, playlist-evangelist: 1
- 修正後: playlist-evangelist: 2, festival-pioneer: 1
- 理由: festival-pioneerを6→5回に、playlist-evangelistを4→5回に調整。選択肢テキスト「SNSで『出た!』と叫んでからフル再生」は、SNSで共有する行動が布教（playlist-evangelist）にも合致するため、テーマ的にも自然。

**変更2: Q9選択肢c**
- 修正前: karaoke-healer: 2, playlist-evangelist: 1
- 修正後: repeat-warrior: 2, karaoke-healer: 1
- 理由: karaoke-healerを6→5回に、repeat-warriorを4→5回に調整。選択肢テキスト「みんなとの思い出の曲。寂しくならないように」は、特定の曲への深い愛着（repeat-warrior）にも合致するため、テーマ的にも自然。「思い出の曲を繰り返し聴く」行動はrepeat-warriorの本質と一致する。

### 修正後の全10問ポイント配分

---

**Q1: 新曲がリリースされた! まず何をする?**

| 選択肢 | ポイント配分 |
|---|---|
| a. SNSで「出た!」と叫んでからフル再生 | **playlist-evangelist: 2, festival-pioneer: 1** ← 変更 |
| b. とりあえず1人で黙って全曲通して聴く | solo-explorer: 2, repeat-warrior: 1 |
| c. 友達に「これ聴いて」とURLを送る | playlist-evangelist: 2, karaoke-healer: 1 |
| d. 気づいたら3日後にシャッフルで流れてくる | midnight-shuffle: 2, lyrics-dweller: 1 |

---

**Q2: イヤホンをしている時、隣の人に「何聴いてるの?」と聞かれたら?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 嬉々として布教タイムが始まる | playlist-evangelist: 2, festival-pioneer: 1 |
| b. 「え、いや、その...」とモゴモゴする | solo-explorer: 2, lyrics-dweller: 1 |
| c. 「作業用BGMだよ」と軽く流す | bgm-craftsman: 2, midnight-shuffle: 1 |
| d. イヤホンを外して一緒に聴かせる | karaoke-healer: 2, bgm-craftsman: 1 |

---

**Q3: カラオケで選曲する基準は?**

| 選択肢 | ポイント配分 |
|---|---|
| a. みんなが知ってて盛り上がる曲 | karaoke-healer: 2, playlist-evangelist: 1 |
| b. 誰も知らないけど自分が好きな曲 | solo-explorer: 2, repeat-warrior: 1 |
| c. 最近ハマってる新しい曲 | festival-pioneer: 2, bgm-craftsman: 1 |
| d. カラオケには行かない（脳内で歌う派） | lyrics-dweller: 2, midnight-shuffle: 1 |

---

**Q4: 落ち込んだとき、音楽をどう使う?**

| 選択肢 | ポイント配分 |
|---|---|
| a. テンション爆上げの曲で強制リセット | festival-pioneer: 2, repeat-warrior: 1 |
| b. 今の気分にぴったりの切ない曲に浸る | lyrics-dweller: 2, midnight-shuffle: 1 |
| c. 友達と一緒に歌って発散する | karaoke-healer: 2, playlist-evangelist: 1 |
| d. 無音にして、音楽は元気な時の楽しみにとっておく | bgm-craftsman: 2, solo-explorer: 1 |

---

**Q5: あなたのプレイリストの名前、どんな感じ?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 「2026年3月ベスト」みたいに几帳面に管理 | bgm-craftsman: 2, repeat-warrior: 1 |
| b. 「布教用」「これ聴いて」など他人向け | playlist-evangelist: 2, karaoke-healer: 1 |
| c. 作ったことがない。全部シャッフル | midnight-shuffle: 2, festival-pioneer: 1 |
| d. 「深夜3時の気持ち」みたいにエモい名前 | lyrics-dweller: 2, solo-explorer: 1 |

---

**Q6: ライブやフェスに行くなら?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 大型フェスで知らないバンドも含めて全ステージ制覇 | festival-pioneer: 2, solo-explorer: 1 |
| b. 好きなアーティストのワンマンに全公演参戦 | repeat-warrior: 2, playlist-evangelist: 1 |
| c. 友達と一緒に行って、音楽より思い出重視 | karaoke-healer: 2, bgm-craftsman: 1 |
| d. 配信で観る。家が最高の客席 | midnight-shuffle: 2, lyrics-dweller: 1 |

---

**Q7: 「音楽の趣味が合う人」ってどういう人?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 知らない曲を教えてくれる人 | solo-explorer: 2, midnight-shuffle: 1 |
| b. 同じ曲を同じタイミングで好きになる人 | repeat-warrior: 2, lyrics-dweller: 1 |
| c. 一緒にライブに行ける人 | festival-pioneer: 2, karaoke-healer: 1 |
| d. 自分が作ったプレイリストを喜んでくれる人 | bgm-craftsman: 2, playlist-evangelist: 1 |

---

**Q8: スマホの音楽アプリを開いたら、まず何をする?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 「あなたへのおすすめ」をチェック | midnight-shuffle: 2, solo-explorer: 1 |
| b. いつものプレイリストを再生 | repeat-warrior: 2, bgm-craftsman: 1 |
| c. フォローしてる人の最近の再生を見る | playlist-evangelist: 2, festival-pioneer: 1 |
| d. 歌詞検索で気になるフレーズを調べる | lyrics-dweller: 2, karaoke-healer: 1 |

---

**Q9: 無人島に1曲だけ持っていけるとしたら?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 何度聴いても飽きない、人生のテーマソング | repeat-warrior: 2, lyrics-dweller: 1 |
| b. テンションが上がる曲。生き延びるために | festival-pioneer: 2, solo-explorer: 1 |
| c. みんなとの思い出の曲。寂しくならないように | **repeat-warrior: 2, karaoke-healer: 1** ← 変更 |
| d. 選べない。シャッフルボタンも持っていきたい | midnight-shuffle: 2, bgm-craftsman: 1 |

---

**Q10: この診断の結果、何を期待してる?**

| 選択肢 | ポイント配分 |
|---|---|
| a. 友達に見せて「わかる〜!」と言われたい | karaoke-healer: 2, playlist-evangelist: 1 |
| b. 自分だけの独特なタイプが出てほしい | solo-explorer: 2, midnight-shuffle: 1 |
| c. 面白ければなんでもいい | bgm-craftsman: 2, festival-pioneer: 1 |
| d. 的確すぎて怖いやつがいい | lyrics-dweller: 2, repeat-warrior: 1 |

---

### 修正後の均衡チェック

| タイプ | 主ポイント(2pt)出現回数 | 出現箇所 | 最大獲得可能pt |
|---|---|---|---|
| festival-pioneer | 5 | Q3c, Q4a, Q6a, Q7c, Q9b | 10 |
| playlist-evangelist | 5 | Q1a, Q1c, Q2a, Q5b, Q8c | 10 |
| solo-explorer | 5 | Q1b, Q2b, Q3b, Q7a, Q10b | 10 |
| repeat-warrior | 5 | Q6b, Q7b, Q8b, Q9a, Q9c | 10 |
| bgm-craftsman | 5 | Q2c, Q4d, Q5a, Q7d, Q10c | 10 |
| karaoke-healer | 5 | Q2d, Q3a, Q4c, Q6c, Q10a | 10 |
| midnight-shuffle | 5 | Q1d, Q5c, Q6d, Q8a, Q9d | 10 |
| lyrics-dweller | 5 | Q3d, Q4b, Q5d, Q8d, Q10d | 10 |

全8タイプが主ポイント5回ずつで完全に均衡。

注意: repeat-warriorはQ9で2つの選択肢（a, c）から2ptを獲得可能だが、1つの質問で選べるのは1つだけなので、実際の最大獲得は他タイプと同じ10pt（5問x2pt）となる。同一質問に同タイプの2pt選択肢が2つあることで「この質問でrepeat-warriorが出やすい」という効果はあるが、全体の最大到達点には影響しない。

---

## R1. QuizContainer拡張方針の明確化

以下の設計方針を採用する:

### アーキテクチャ

1. **QuizDefinition型の拡張**: QuizDefinition（またはそのメタ情報）にオプショナルな `compatibilityData` フィールドを追加する。相性データを持つクイズかどうかを型レベルで判断できるようにする。

2. **QuizContainerに `referrerTypeId?: string` propを追加**: Server ComponentのページでsearchParamsから `ref` を取得し、QuizContainerに渡す。QuizContainerは汎用的なままで、referrerTypeIdの有無で相性セクションの表示を判断する。

3. **結果フェーズの描画**:
   - QuizContainerの結果フェーズで、ResultCardの下に相性セクション用のスロットを設ける
   - `referrerTypeId` が存在し、かつクイズデータに `compatibilityData` がある場合のみ、CompatibilitySectionを描画
   - CompatibilitySectionはClient Component（QuizContainer内で描画されるため自動的にClient）

4. **Server/Client境界**:
   - `/quiz/[slug]/page.tsx`（Server Component）: searchParamsから `ref` を取得、QuizContainerに `referrerTypeId` として渡す
   - `QuizContainer`（Client Component）: referrerTypeIdを保持し、結果確定後にCompatibilitySectionを描画
   - `CompatibilitySection`（Client Component）: 自分のtypeId + referrerTypeIdから相性データを参照して表示

5. **既存クイズへの影響**: referrerTypeIdが渡されなければ（= 既存のクイズページ）、一切の追加描画は行われない。QuizDefinitionにcompatibilityDataがなければ、refパラメータがURLにあっても無視される。

---

## R2. 相性OGPの方針明確化

**Route Handlerベースの動的生成を推奨方針とする。**

理由:
- 64パターン（8x8）の静的生成はビルド時間を増加させる
- 大量の結果ページがインデックスされるSEOリスクを避けるため、動的生成の方が制御しやすい
- 相性結果ページ自体に `noindex` を設定すること

具体的な実装:
- `/quiz/music-personality/result/[resultId]/opengraph-image.tsx` に、searchParamsの `with` パラメータの有無で分岐するロジックを追加
- `with` パラメータがある場合: 両タイプのアイコン + 関係性ラベルを描画
- `with` パラメータがない場合: 既存の個人結果OGPパターンを使用

---

## R3. 弱い相性テキストの改善

### bgm-craftsman x karaoke-healer（修正後）

**空間演出の名匠ペア:**
職人がBGMで雰囲気を作り、癒し枠が人を巻き込む。パーティーの音楽担当はこの二人に任せれば間違いない。ただし職人が「この曲順には意味があるんだ」と主張し始めたら、癒し枠が「じゃあ次何歌う?」とマイクを渡して強制終了させる。結果、最高のパーティーになる。

### repeat-warrior x karaoke-healer（修正後）

**安定と調和:**
戦士の十八番と癒し枠の定番曲。カラオケでは最も安定感のあるペア。セットリストが5年前から変わっていないことを二人とも気にしていない。初見の人が「いつもこうなの?」と聞くと、二人は顔を見合わせて「これが完成形だから」と真顔で答える。伝統芸能のような安心感がそこにはある。

---

## R4. ブログ記事タイトルから「Q01」を除去

**修正後のタイトル案**: 「音楽の聴き方で性格がわかる? 音楽性格診断の設計裏話」

---

## 変更なしの部分（確認）

以下は元の計画（メモ 19ccce157ba）から変更なし:
- 3軸の定義（1.1）
- 8つの性格タイプ定義（1.2）
- 質問テキスト（選択肢の文言はすべて据え置き）
- 各タイプの結果テキスト（1.5）
- 相性マトリクスのうち上記R3の2件以外の34通り
- 相性判定機能のUXフロー（2.1〜2.3）
- データ構造（3.2）— ファイル名のみ修正
- テスト計画（4章）— badges.ts IDのみ修正
- ブログ記事構成（5章）— タイトルのみ修正
- 実装タスク分割案（6章）— ファイル名・IDのみ修正

