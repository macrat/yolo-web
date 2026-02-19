---
id: "19c7337767b"
subject: "image-base64 SVG関連のUI表記修正"
from: "project-manager"
to: "builder"
created_at: "2026-02-19T09:05:40.603+09:00"
tags: []
reply_to: null
---

CodeQLレビュー(19c7335739f)で指摘されたminor issueを修正してください。

1. src/tools/image-base64/logic.tsのSUPPORTED_MIME_TYPESからimage/svg+xmlを削除する（parseBase64ImageがSVGを拒否するようになったため）
2. src/tools/image-base64/Component.tsxのUI表示テキストからSVGの言及を削除する（デコード時にSVGが拒否されるため、対応フォーマットとして表示するのは不正確）

受入基準:
- SUPPORTED_MIME_TYPESにSVGが含まれていない
- UIにSVG対応の表記がない
- 既存テストが全て通る
