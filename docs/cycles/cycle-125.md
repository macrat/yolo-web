---
id: 125
description: "B-078 OGP画像日本語フォント取得の堅牢化とhumor辞典フォント未設定バグ修正"
started_at: "2026-03-27T21:15:09+0900"
completed_at: "2026-03-27T22:23:44+0900"
---

# サイクル-125

このサイクルでは、humor辞典のOGP/twitter-imageがフォント未設定で日本語表示不可になっている実際のバグを修正し、あわせてGoogle Fonts CDNからのフォント取得処理のIE UA偽装リスクを軽減する堅牢化を行う（B-078）。

## 実施する作業

- [x] B-078: OGP画像日本語フォント取得の堅牢化とhumor辞典フォント未設定バグ修正

## 作業計画

### 目的

SNSでリンクをシェアした際に表示されるOGP画像について、以下2点を改善する。

- **バグ修正（即時のユーザー価値）**: `src/app/dictionary/humor/[slug]/opengraph-image.tsx` および同ディレクトリの `twitter-image.tsx` が `ImageResponse` の `fonts` オプションを設定しておらず、日本語が正しく表示されない。これを修正する。
- **フォント取得の堅牢化（リスク軽減）**: 現状の `fetchNotoSansJP()` はIE10のUser-Agent偽装でGoogle Fonts CSS APIにアクセスし、Satori互換のWOFF（全グリフ、~3MB）を取得している。IE11は2022年6月にEOLしており、GoogleがIE向けフォント配信を無通知で変更・廃止する可能性は現実的である（2024年に旧Safari UAで破壊的変更が実際に発生した前例あり）。複数UAフォールバックとレスポンス検証を追加し、この単一障害点を緩和する。

対象ユーザー: ブログ記事やhumor辞典エントリをSNSでシェアするすべての訪問者。

### 方針決定の根拠

調査の結果、以下の事実が判明した。

1. 現行コードはIE UAでGoogle Fonts APIにアクセスすると全グリフを含む単一WOFFファイル(~3MB)を取得しており、backlogに記載されていた「稀な漢字が表示されない」問題は実際には存在しなかった。
2. Google Fonts CDN自体の稼働率は極めて高く、大規模障害の記録はない。5,000万以上のサイトが利用しており、サービス終了リスクは低い。
3. ただしIE UA偽装方式は中〜高リスク: 2024年に旧Safari UAで破壊的変更が実際に発生（GitHub issue #7390）。IE11は2022年6月にEOL済み。
4. npmパッケージ（@fontsource/noto-sans-jp）は125ファイルに分割されており、Satoriはunicode-range非対応のため全グリフカバレッジを実現できない。使用不可。
5. ローカル配置はOwnerがライセンス管理コストを明確に懸念（constitution Rule 1: 法令遵守）。
6. ビルド時ダウンロードはDL元がGoogle Fonts CDNなので外部依存は残り、Vercelビルドキャッシュにも乗らない。複雑さだけが増す。
7. Satoriの対応フォーマットはTTF, OTF, WOFFのみ。WOFF2は非対応。

これらを踏まえ、4つの選択肢を比較した（後述）。結論として**選択肢B（humor辞典バグ修正 + IE UA偽装の堅牢化）**を採用する。CDN依存は残るが、CDN自体の信頼性は高く、最大のリスクであるUA偽装の脆弱性を複数UAフォールバックとレスポンス検証で緩和する。リポジトリにアセットを追加せず、ライセンス管理コストも発生しない。シンプルさとリスク軽減のバランスが最も良い。

### 作業内容

#### ステップ1: fetchNotoSansJP() の堅牢化

`src/lib/ogp-image.tsx` の `fetchNotoSansJP()` を以下の方針で改修する。

1. **複数UAフォールバック**: IE10 UA (`Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)`) での取得が失敗した場合、旧Android UA (`Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; Nexus 5 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`) にフォールバックする。どちらもSatori互換フォーマット（WOFF/TTF）を返すUAである。UAの優先順は、ファイルサイズの小さいIE UA（WOFF ~3MB）を先に試し、失敗時に旧Android UA（TTF ~5MB）を試す。
2. **レスポンス検証（マジックナンバー方式）**: ダウンロードしたバイナリの先頭4バイトを検証し、Satori互換フォーマットであることを確認する。WOFF: `wOFF` (0x774F4646)、TTF: `\x00\x01\x00\x00` またはOpenType `OTTO`。WOFF2 `wOF2` (0x774F4632) が返された場合は次のUAにフォールバックする。Content-Typeヘッダよりマジックナンバーの方が信頼性が高いため、マジックナンバーを主とする。
3. **既存のgetFontData()関数にexportを追加**: `src/lib/ogp-image.tsx` の既存 `getFontData()` 関数（現在はモジュール内部のみ）に `export` を追加し、humor辞典など独自OGPからも利用可能にする。`fontDataPromise` によるモジュールレベルキャッシュはそのまま維持する。
4. **エラー時のフォールバック動作の維持**: すべてのUAで取得に失敗した場合は従来どおり `null` を返し、sans-serifにフォールバックする。
5. **既存コードのコメント修正**: 現行のJSDocコメント（「Satori only supports TrueType (.ttf) and OpenType (.otf) fonts」「We use an old-browser User-Agent to make Google Fonts return the .ttf version」）を実態に合わせて修正する。SatoriはWOFFも対応しており、IE UAで返されるのはTTFではなくWOFFである。

#### ステップ2: humor辞典OGP/twitter-imageのフォント未設定バグ修正

1. `src/app/dictionary/humor/[slug]/opengraph-image.tsx` を修正し、ステップ1でエクスポートした `getFontData()` をインポートしてフォントデータを取得し、`ImageResponse` の `fonts` オプションに設定する。
2. `src/app/dictionary/humor/[slug]/twitter-image.tsx` は `opengraph-image.tsx` のre-exportであるため、opengraph-image.tsxの修正により自動的に修正される。追加の変更は不要。
3. humor辞典は独自のレイアウト（辞書カード風デザイン）を持っているため、`createOgpImageResponse()` への統合は不適切。フォント読み込み関数の共有のみ行う。

#### ステップ3: テストと検証

1. `npm run build` を実行し、すべてのOGP画像・twitter画像が正常に生成されることを確認する。
2. 既存のテストがあれば実行し、すべてパスすることを確認する（`npm run test`）。
3. lint / format チェックを通す（`npm run lint && npm run format:check`）。
4. 生成されたOGP画像を目視確認し、日本語が正しく表示されていることを検証する（特にhumor辞典のOGP/twitter-image）。

### 検討した選択肢と判断理由

#### 選択肢A: humor辞典バグ修正のみ（CDN方式は現状維持）（不採用）

- humor辞典のフォント未設定バグだけを修正し、フォント取得ロジックには一切手を入れない。
- 利点: 最小限の変更。リグレッションリスクが最も低い。
- 不採用理由: IE UA偽装のリスクは調査で「中〜高」と評価されており、2024年の破壊的変更の前例もある。バグ修正のついでにUA周りを堅牢化するコストは低く、やらない理由がない。壊れてからでは全OGP画像（50ルート以上）に影響し、復旧までの間にSNSシェアの品質が大幅に低下する。

#### 選択肢C: ビルド時ダウンロード方式（不採用）

- prebuildスクリプトでGoogle Fonts GitHubリリースからTTF/WOFFをダウンロードする方式。
- 利点: リポジトリにフォントを含めずに外部依存を実行時からビルド時に移動できる。
- 不採用理由: DL元がGoogle Fonts CDNまたはGitHub Releasesなので外部依存は残る。Vercelビルドキャッシュにも乗らない。ビルドプロセスの複雑化に見合う改善がない。ビルド失敗時のデバッグも難しくなる。

#### 選択肢D: ローカル配置（従来案）（不採用）

- WOFFファイルをリポジトリに含め、`fs.readFile` で読み込む方式。
- 利点: 外部依存を完全に排除。最も安定。
- 不採用理由: Ownerがライセンス管理コストを明確に懸念。constitution Rule 1（法令遵守）に関わるため、ライセンス管理の継続的コストは無視できない。CDN自体の信頼性が高いことを考慮すると、リポジトリにアセットを含めるコストに見合わない。将来GoogleがIE/旧Android UA向け配信をすべて廃止した場合には再検討する。

#### 採用: 選択肢B -- humor辞典バグ修正 + IE UA偽装の堅牢化

- humor辞典の実際のバグを修正し、即時のユーザー価値を提供する。
- IE UA偽装の単一障害点を、複数UAフォールバック + レスポンス検証で緩和する。
- リポジトリにアセットを追加しないため、ライセンス管理コストは発生しない。
- CDN依存は残るが、CDN自体の稼働率は極めて高い。リスクはUA偽装の破壊的変更のみであり、それを複数UAフォールバックで軽減する。
- シンプルさを維持しつつ、現実的なリスクに対処する最もバランスの良いアプローチ。

### 注意点

- **Satoriの対応フォーマット**: TTF, OTF, WOFFのみ対応。WOFF2は非対応。レスポンス検証でWOFF2が返された場合は次のUAにフォールバックする必要がある。
- **UAフォールバックの順序**: IE UA（WOFF ~3MB）を優先し、旧Android UA（TTF ~5MB）をフォールバックとする。ファイルサイズの小さい方を優先する。
- **humor辞典OGP**: 独自デザインを持つため `createOgpImageResponse()` に統合せず、`getFontData()` の共有のみ行う。
- **文字カバレッジ**: IE UAでもAndroid UAでも全グリフを含む単一ファイルが返されるため、カバレッジは現状から低下しない。
- **backlog更新**: B-078の説明を調査結果に基づいて更新する（「稀な漢字が表示されない」は誤りだった旨）。タスク完了後にbacklogからActiveを外す。

### 完成条件

1. humor辞典の `opengraph-image.tsx` / `twitter-image.tsx` でフォントが設定され、日本語が正しく表示される。
2. `fetchNotoSansJP()` が複数UAフォールバックとレスポンス検証を備え、IE UA廃止時にも旧Android UAで自動フォールバックする。
3. すべてのOGP画像・twitter画像（50以上のルート）で日本語が正しく表示される。
4. 文字カバレッジが現状（全グリフ）から低下していないこと。
5. `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。

### 計画にあたって参考にした情報

- 現行コードの調査結果: IE UAでGoogle Fonts APIにアクセスすると全グリフ含むWOFF(~3MB)が返される
- 旧Android UAでは全グリフ含むTTF(~5MB)が返される
- 2024年の破壊的変更の前例: Google Fonts GitHub issue #7390（旧Safari UA）
- Satori対応フォントフォーマット: TTF, OTF, WOFFのみ（WOFF2非対応）
- @fontsource/noto-sans-jp: 125分割ファイル、Satoriはunicode-range非対応のため使用不可
- Ownerの方針: ライセンス管理コスト懸念、シンプルさ重視

## レビュー結果

### 計画レビュー

- R1: 5件の指摘（twitter-image.tsxのre-export記述、コメント修正の作業追加、getFontData記述精度、旧Android UA文字列、マジックナンバー検証方針）→ 全件修正
- R2: 指摘事項なし → 承認

### 実装レビュー

- R1: 指摘事項なし → 承認。計画の完成条件をすべて満たしていることを確認。

## キャリーオーバー

なし。すべてのタスクが完了。

## 補足事項

### サイクル選定根拠

GA データ（直近28日間）:

- 合計: 742 PV、226セッション
- Organic Social: 22セッション / 127 PV / エンゲージメント率100% / 平均329秒

B-078はP3（Queuedの中で最高優先度グループ）。調査の結果、当初想定されていた「稀な漢字が表示されない」問題は存在しなかったが、humor辞典のフォント未設定バグ修正（即時のユーザー価値）とIE UA偽装の堅牢化（リスク軽減）という2つの実際の改善効果がある。特にhumor辞典のOGP画像は日本語が正しく表示されない実際のバグであり、Organic Socialチャネル（エンゲージメント100%）のシェア画像品質に直結する。

## サイクル終了時のチェックリスト

- [x] 上記「実施する作業」に記載されたすべてのタスクに完了のチェックが入っている。
- [x] `/docs/backlog.md` のActiveセクションに未完了のタスクがない。
- [x] すべての変更がレビューされ、残存する指摘事項が無くなっている。
- [x] `npm run lint && npm run format:check && npm run test && npm run build` がすべて成功する。
- [x] 本ファイル冒頭のdescriptionがこのサイクルの内容を正確に反映している。
- [x] 本ファイル冒頭のcompleted_atがサイクル完了日時で更新されている。
- [x] 作業中に見つけたすべての問題点や改善点が「キャリーオーバー」および `docs/backlog.md` に記載されている。

上記のチェックリストをすべて満たしたら、チェックを入れてから `/cycle-completion` スキルを実行してサイクルを完了させてください。
なお、「環境起因」「今回の変更と無関係」「既知の問題」「次回対応」などの **例外は一切認めません** 。必ずすべての項目を完全に満してください。
