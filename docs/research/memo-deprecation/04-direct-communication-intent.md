# 調査レポート: メモシステム第1期における直接通信の意図

## 調査対象

一次ソース: `/mnt/data/yolo-web/memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md`

## 結論

ブートストラップ指示書の記述を分析した結果、**第1期メモシステムは直接通信を意図して設計されていた**ことが確認された。PM経由の星型構造（すべての通信がPMを経由する形）は設計の意図ではなかった。

---

## 根拠となる一次ソースの引用

### 1. Builderの責務定義（Section 2.5）

指示書のSection 2.5には以下の記述がある:

> **Produce a clear change summary and request review.**

builderは作業完了後、reviewerに直接レビューを依頼することが責務として明記されている。PMへの報告を経由するとは書かれていない。

### 2. Section 10 item 3: builderへの初期メモ

Section 10（project managerが次に行うべきこと）のitem 3には以下の記述がある:

> To `builder`:
>
> - request: wait for planner plan + reviewer approval; then implement exactly; **reply to `reviewer` for review** and to `project manager` for status.

builderはreviewerに直接返信してレビューを依頼し、PMにはステータス報告のみを行う、という二股の通信が明示されている。これは「builder→reviewer」の直接通信を意図したものである。

### 3. Section 10 item 5: process engineerへの初期メモ

> To `process engineer`:
>
> - request: propose improvements to memo handling and minimal operational conventions; **reply to `reviewer` and `project manager`.**

process engineerはreviewerとPMの両方に直接返信する設計になっており、PMが唯一の中継点ではないことが分かる。

### 4. Reviewerの責務定義（Section 2.6）

> **Reply with approval, change requests, or rejection, with concrete, testable feedback.**

reviewerは直接返信（`reply_to`メカニズムを使用）する責務を持っており、PMを経由する中継者として位置づけられていない。

### 5. メモのライフサイクル規則（Section 3.2）

> 4. If a response is required, the role creates a **new** memo file in the **requester's inbox** with `reply_to` pointing to the original memo `id`.

「requester（依頼元）のinboxに返信する」と明記されている。例えばbuilderがreviewerにレビュー依頼を送れば、reviewerはbuilderのinboxに直接返信する設計である。

---

## 設計意図のまとめ

ブートストラップ指示書が示す通信フローは以下の通りである:

```
planner → (plan完成後) → reviewer (レビュー依頼)
reviewer → (承認後)   → builder  (実装許可)
builder → (実装後)    → reviewer (レビュー依頼) + project manager (ステータス報告)
```

この設計では:

- plannerがreviewerに直接レビューを依頼する
- reviewerが承認したらbuilderに直接渡す
- builderが完了後にreviewerへ直接レビュー依頼する

PMはすべての通信を中継する「ハブ」ではなく、意思決定と最終承認（mainへのpush）を担う役割として設計されていた。

---

## 実際の動作との乖離

Ownerのフィードバックによれば、実際の運用では意図した直接通信ではなく「星型通信（すべての通信がPMを経由するパターン）」として機能していた。これは設計の意図と実際の動作の乖離であり、指示書の設計が現場で正確に実施されなかったことを示している。

---

## 調査日

2026-03-16
