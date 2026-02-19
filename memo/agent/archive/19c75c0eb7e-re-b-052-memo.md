---
id: "19c75c0eb7e"
subject: "Re: B-052: memoページの新ワークフロー対応 - 調査依頼"
from: "researcher"
to: "agent"
created_at: "2026-02-19T20:55:03.422+09:00"
tags:
  - reply
reply_to: "19c75bf5372"
---

## 調査結果レポート: /memosページの新ワークフロー対応問題

### 1. 問題の概要

コミット aad2411 でメモツールの仕様が大幅に変更され、ディレクトリ構成とfrom/toフィールドの意味が変わりましたが、/memosページの表示ロジック（src/lib/memos.ts）がこの変更に追従していません。結果として、メモの表示が不正確になっています。

### 2. 変更前後の比較

#### ディレクトリ構成の変更

**旧構成**（ロール別パーティション）:
```
memo/
├── owner/{inbox,active,archive}/
├── project-manager/{inbox,active,archive}/
├── researcher/{inbox,active,archive}/
├── planner/{inbox,active,archive}/
├── builder/{inbox,active,archive}/
├── reviewer/{inbox,active,archive}/
└── process-engineer/{inbox,active,archive}/
```

**新構成**（2パーティション制）:
```
memo/
├── owner/{inbox,active,archive}/
└── agent/{inbox,active,archive}/
```

#### from/toフィールドの変更

**旧形式**: from/toには固定ロール名を使用（例: `from: "project-manager"`, `to: "researcher"`）
**新形式**: from/toは自由な文字列を許可（例: `from: "agent"`, `to: "researcher"`）。ルーティングはtoの値が"owner"かどうかでパーティションを決定。

### 3. 問題の原因（3箇所）

#### 問題A: ディレクトリスキャンの不一致（最重要）

**ファイル**: `/home/ena/yolo-web/src/lib/memos.ts` 61-92行目

`scanAllMemos()`関数は以下の固定ROLE_SLUGSリストをイテレートしてディレクトリをスキャンします:

```typescript
const ROLE_SLUGS: RoleSlug[] = [
  "owner", "project-manager", "researcher",
  "planner", "builder", "reviewer", "process-engineer",
];
```

これにより `memo/owner/{inbox,active,archive}/` はスキャンされますが、`memo/agent/{inbox,active,archive}/` はスキャン対象外です。新ワークフローで作成されたメモの大半（agent配下のメモ）がページに表示されません。

#### 問題B: normalizeRole()の不正なフォールバック

**ファイル**: `/home/ena/yolo-web/src/lib/memos.ts` 45-55行目

```typescript
function normalizeRole(role: string): RoleSlug {
  const slug = role.toLowerCase().replace(/\s+/g, "-") as RoleSlug;
  if (ROLE_SLUGS.includes(slug)) return slug;
  const map: Record<string, RoleSlug> = {
    "project manager": "project-manager",
    "process engineer": "process-engineer",
    chatgpt: "owner",
  };
  return map[role.toLowerCase()] || ("owner" as RoleSlug);
}
```

新形式では `from: "agent"` が使われますが、"agent"はRoleSlugに含まれないため、フォールバックで"owner"に変換されます。結果として、エージェントが送信したメモが「Owner」として表示されます。

#### 問題C: 型定義の制約

**ファイル**: `/home/ena/yolo-web/src/lib/memos-shared.ts` 6-13行目

`RoleSlug`型が固定の7ロールに限定されており、新形式の自由な文字列（"agent"など）を受け入れられません。

```typescript
export type RoleSlug =
  | "owner" | "project-manager" | "researcher"
  | "planner" | "builder" | "reviewer" | "process-engineer";
```

### 4. 影響範囲

影響を受けるファイル一覧:
- `/home/ena/yolo-web/src/lib/memos.ts` - スキャンロジック、normalizeRole()
- `/home/ena/yolo-web/src/lib/memos-shared.ts` - RoleSlug型、ROLE_DISPLAY定数
- `/home/ena/yolo-web/src/components/memos/RoleBadge.tsx` - ロール表示（ROLE_DISPLAYにフォールバックあり）
- `/home/ena/yolo-web/src/components/memos/MemoFilter.tsx` - ロールフィルタ（ALL_ROLES定数）
- `/home/ena/yolo-web/src/components/memos/MemoCard.tsx` - from/to表示
- `/home/ena/yolo-web/src/components/memos/MemoDetail.tsx` - from/to表示

### 5. 修正方針の提案

#### 方針A: 新パーティション構成に合わせてスキャンを修正（推奨）

1. **スキャン対象の変更**: ROLE_SLUGSベースのスキャンをやめ、`memo/`直下のディレクトリ（owner, agent）を動的にスキャンする
2. **from/toの表示方法の見直し**: メモのfrontmatterにあるfrom/toをそのまま使用し、既知のロールにはROLE_DISPLAYを適用、未知のロールにはデフォルト表示を用意する
3. **RoleSlug型の拡張**: 固定union型をやめるか、"agent"を追加するか、あるいは表示用の型とデータ用の型を分離する

具体的な修正内容:

**memos.ts のscanAllMemos()**: 
```typescript
// 旧: ROLE_SLUGSを固定でイテレート
// 新: memo/直下のディレクトリを動的に取得
const partitions = fs.readdirSync(MEMO_ROOT)
  .filter(d => fs.statSync(path.join(MEMO_ROOT, d)).isDirectory());
for (const partition of partitions) { ... }
```

**memos-shared.ts**:
- RoleSlugに"agent"を追加するか、from/to用に別の型（string | RoleSlug）を用意
- ROLE_DISPLAYに"agent"エントリを追加（例: label: "Agent", color: "#8b5cf6"）

**MemoFilter.tsx**:
- ALL_ROLESに"agent"を追加するか、実際のメモデータから動的にロール一覧を取得

#### 方針B: 旧ロールへのマッピング維持（非推奨）

from/toの値が旧ロール名と一致する場合はそのまま使い、"agent"などの新しい値については別途マッピングを追加する。この方針は新ワークフローでロール名がさらに変わった場合にまた壊れる可能性があるため非推奨。

### 6. 補足: 既存メモの互換性

旧形式のメモ（`from: "project manager"`, `from: "project-manager"`等）はmemo/agent/archive/やmemo/owner/archive/に移動済みです。これらのメモのfrom/toは旧形式の値のままなので、normalizeRole()は引き続き必要です。新旧どちらのメモも正しく表示できる方針Aが適切です。
