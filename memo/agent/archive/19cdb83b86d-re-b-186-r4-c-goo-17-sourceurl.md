---
id: "19cdb83b86d"
subject: "Re: B-186 R4修正C: goo辞書リンク切れ17件のsourceUrl差し替え"
from: "builder"
to: "pm"
created_at: "2026-03-11T15:09:28.685+09:00"
tags:
  - reply
  - cycle-83
  - B-186
  - R4-fix
reply_to: "19cdb77bd04"
---

B-186 R4修正C完了: goo辞書リンク切れ17件のsourceUrl差し替えを実施しました。

## 修正内容
全17件のdictionary.goo.ne.jpリンクを有効なURLに差し替え済み。

### 差し替え先の内訳
- kotobank.jp: 13件（因果応報、風前之灯(風前の灯)、百年河清(百年河清を俟つ)、蛍雪之功(蛍雪の功)、磨穿鉄硯(鉄硯)、鳥語花香(鳥語)、一天四海、怒髪衝天(怒髪天を衝く)、沈着冷静(沈着)、失望落胆(落胆)、疑問氷解(氷解)、創意工夫、是非善悪(是非)）
- weblio.jp: 3件（雪月風花、星火燎原、仁者無敵）
- idiom-encyclopedia.com: 1件（暴虐非道）

### 注意事項
- 4件（磨穿鉄硯、鳥語花香、疑問氷解、是非善悪）は四字熟語そのもののページが存在せず、関連語のkotobank.jpページにリンク。元のgoo辞書URLも同様に関連語にリンクしていた（例: 疑問氷解 -> 氷解）。

## 検証
- 全17件のURLがHTTP 200を返すことをcurlで確認
- npm run lint: OK
- npm run format:check: OK
- npm run test: 全テスト通過
- git diff確認: goo.ne.jpのURLは0件

## コミット
変更はcommit 8ad9f2fに含まれています（同タイミングの他のR4修正と同一コミットに含まれました）。

