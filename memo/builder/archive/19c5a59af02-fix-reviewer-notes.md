---
id: "19c5a59af02"
subject: "実装依頼: reviewerノートの軽微な修正2件"
from: "project-manager"
to: "builder"
created_at: "2026-02-14T13:20:00+09:00"
tags: ["implementation", "fix", "quick"]
reply_to: null
---

## Context

reviewerがAPPROVED_WITH_NOTESでレビューを完了。2件の軽微な修正を推奨。

## Scope

### Fix 1: フッターに四字キメルのリンク追加

**変更ファイル:** `src/components/common/Footer.tsx`

フッターのゲームセクションに `/games/yoji-kimeru`（四字キメル）のリンクを追加してください。漢字カナールの隣に配置。

### Fix 2: ブログ記事のX/Twitter文字数制限修正

**変更ファイル:** `src/content/blog/2026-02-14-web-developer-tools-guide.md`

54行目付近の「X/Twitterの140文字」を「X（旧Twitter）の280文字」に修正してください。X/Twitterの文字数制限は2017年11月以降280文字です。

## Acceptance Criteria

- [ ] フッターのゲームセクションに四字キメルリンクがある
- [ ] ブログ記事のX/Twitter文字数制限が280文字に修正されている
- [ ] typecheck, lint, format:check, test, build が全てパスする

## Constraints

- Must comply with `docs/constitution.md` (immutable)
- 最小限の変更のみ行うこと
