# T11 残滓のクロスチェック台帳（PM が独立に作成・判定）

実装コミット: `f9526235` / `9b6b9aaf` / `0b538a3e` / `a7fa367b`
撤回コミット: `af3cb261`
比較基点: `afeafd5f`

`0b538a3e` と `a7fa367b` は T11 以外の作業（行のタップ標的・パンくずURLの是正・Shinagaki CSS）
も同梱している。**全部を戻すのではなく、しきい値撤廃があったから存在する記述だけ**が対象。

| ファイル                                                  | 触ったコミット     | 判定                                                                                         |
| --------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `src/app/blog/[slug]/page.tsx`                            | f9526235           | `af3cb261` で復元済み。追加行の通読で残滓なし                                                |
| `src/app/blog/__tests__/tag-page.test.ts`                 | f9526235, 9b6b9aaf | 閾値世界の記述に戻っている。説明文の対応検査を両側へ拡張（本ラウンド）                       |
| `src/app/blog/tag/[tag]/page.tsx`                         | f9526235           | `MIN_POSTS_FOR_TAG_PAGE` で 404。残滓なし                                                    |
| `src/app/blog/tag/[tag]/page/[page]/page.tsx`             | f9526235           | 同上                                                                                         |
| `src/blog/_components/BlogList.tsx`                       | f9526235, 0b538a3e | `linkableTags` 復元済み。prop の JSDoc も閾値世界の記述                                      |
| `src/blog/_components/BlogList.module.css`                | 0b538a3e           | タップ標的の改善のみ。T11非依存                                                              |
| `src/blog/_components/BlogListPanel.tsx`                  | f9526235, 0b538a3e | 「掲載0件のタグを404」→「閾値に満たないタグ」へ是正（本ラウンド）                            |
| `src/blog/_components/BlogListPanel.module.css`           | a7fa367b           | 履歴の痕跡の削除のみ。T11非依存                                                              |
| `src/blog/_components/BlogListView.tsx`                   | f9526235, 0b538a3e | 「掲載記事が少ない絞り込みでは」→描画条件（カテゴリナビ・人気タグ不出）へ是正（本ラウンド）  |
| `src/blog/_components/BlogListView.module.css`            | 0b538a3e, a7fa367b | `.breadcrumb` のコメントをカテゴリ一覧にも合う形へ是正（本ラウンド）                         |
| `src/blog/_components/TagList.tsx`                        | f9526235, 0b538a3e | `linkableTags` 濾過を復元。冒頭 JSDoc の無条件断定を条件付きへ是正（本ラウンド）             |
| `src/blog/_components/TagList.module.css`                 | f9526235           | `.tag` は実装側とともに消えている。死んだ CSS なし                                           |
| `src/blog/_components/__tests__/BlogList.test.tsx`        | f9526235, 0b538a3e | `linkableTags` の検査あり                                                                    |
| `src/blog/_components/__tests__/BlogListPanel.test.tsx`   | 0b538a3e           | 人気タグ・カテゴリナビの出現条件を検査。T11非依存                                            |
| `src/blog/_components/__tests__/BlogListView.test.tsx`    | 0b538a3e, a7fa367b | 新着判定の相対日付化のみ。T11非依存                                                          |
| `src/blog/_components/__tests__/TagList.test.tsx`         | f9526235, 0b538a3e | `linkableTags` 4件の検査あり                                                                 |
| `src/blog/_lib/blog.ts`                                   | f9526235, 9b6b9aaf | 説明文8件を削除し `afeafd5f` とバイト一致。定数の JSDoc を対応の両側へ書き直し（本ラウンド） |
| `src/blog/_lib/__tests__/blog-tags.test.ts`               | 9b6b9aaf, a7fa367b | 下限100を復活。上限150（別根拠の改善）は維持                                                 |
| `src/components/Breadcrumb/index.tsx`                     | 0b538a3e           | パンくず統一。T11非依存                                                                      |
| `src/components/Breadcrumb/__tests__/Breadcrumb.test.tsx` | 0b538a3e           | 同上                                                                                         |
| `src/components/Shinagaki/Shinagaki.module.css`           | a7fa367b           | 履歴の痕跡の削除のみ。T11非依存                                                              |

台帳外で1件見つかった: `src/__tests__/blog-list-static-html.test.ts`（検査6の説明と失敗メッセージ）。
T11 稼働中に書かれたもので、掲載数を根拠にしていた。描画条件を根拠にする形へ是正（本ラウンド）。
