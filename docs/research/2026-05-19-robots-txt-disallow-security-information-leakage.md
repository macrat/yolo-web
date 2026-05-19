---
title: robots.txt Disallow による情報漏洩リスクとベストプラクティス
date: 2026-05-19
purpose: cycle-195 で /internal/ を robots.txt の Disallow に追加したことへの Owner 指摘を受け、セキュリティ上のリスク評価・業界ベストプラクティス・yolos.net における推奨対処を整理する
method: OWASP WSTG・Google Search Central・MDN Web Docs・PortSwigger・Black Duck・The Register・SearchEngineJournal の一次情報参照、git log による既存パターン追跡、src/app/robots.ts および page.tsx の実コード確認
sources:
  - https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/03-Review_Webserver_Metafiles_for_Information_Leakage
  - https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Robots_txt
  - https://developers.google.com/search/docs/crawling-indexing/block-indexing
  - https://portswigger.net/kb/issues/00600600_robots-txt-file
  - https://www.blackduck.com/blog/robots-txt/
  - https://www.theregister.com/2015/05/19/robotstxt/
---

# robots.txt Disallow による情報漏洩リスクとベストプラクティス

## 1. 業界における確立したアンチパターン

### OWASP（WSTG-INFO-03）

OWASP Web Security Testing Guide は robots.txt をテスト項目「Webサーバーメタファイルの情報漏洩レビュー」（WSTG-INFO-03）に分類している。

核心的な指摘：

> "robots.txt should not be considered as a mechanism to enforce restrictions on how web content is accessed, stored, or republished by third parties."

OWASP は robots.txt の Disallow リストを「攻撃表面マッピングへの実行パス依存物を生成する手段」と位置づけており、攻撃者がこのファイルを解析してアプリケーションの隠されたパスや機能を特定することを標準的な情報収集手法として記載している。

### MDN Web Docs（Mozilla）

MDN は robots.txt を用いた機密 URL 保護を明示的に「非推奨」と指定している。

> "On the contrary, it can unintentionally help them: robots.txt is publicly accessible, and by adding your sensitive page paths to it, you are showing their locations to potential attackers."

MDN のサンプルコード「やってはいけない例」として次のパターンが掲載されている：

```
User-agent: *
Disallow: /secret/admin-interface
```

### Google Search Central

Google の公式ドキュメントは noindex と robots.txt Disallow の用途を明確に区別している。

- **noindex（meta / X-Robots-Tag）**: 検索結果への表示を防ぐために使用する。クローラがページにアクセスして noindex を読んではじめて機能する。
- **robots.txt Disallow**: クロールそのものを防ぐために使用する。ただし、外部リンクが存在すれば robots.txt で Disallow しても検索結果に URL が表示される可能性がある。

**重要な相互作用**: robots.txt で Disallow したページは、クローラが noindex ディレクティブを読むことができない。Google は「noindex を有効にするには、そのページが robots.txt でブロックされていてはならない」と明記している。

### PortSwigger（Burp Suite）

PortSwigger は robots.txt をセキュリティ脆弱性（CWE-200 情報漏洩）として分類している（深刻度：Information）。

> "The information in the file may therefore help an attacker to map out the site's contents, especially if some of the locations identified are not linked from elsewhere in the site."

Burp Suite のコンテンツディスカバリー機能は robots.txt を標準の偵察ソースとして自動参照しており、セキュリティテスト業界で robots.txt 解析は標準手法として定着している。

### 実際の事故事例

The Register（2015年）が報告した具体的事例：

- **イスラエル国会**: robots.txt に約 1 万件の非公開 PDF アーカイブへのパスが直接列挙されていた。
- **米国務省**: `Disallow` に記載されたアセットが Internet Archive 経由で公開アクセス可能な状態だった。
- **Reddit 個人特定事件**: ストーキング被害者の女性の氏名が robots.txt に記載された画像のファイルパスに含まれており、Reddit ユーザーが特定した。

Black Duck（Synopsys）の分析では、WordPress の `/wp-admin/` や Drupal の `/install.php` が robots.txt に記載されることで CMS の種別とバージョン推定が容易になり、既知の脆弱性への攻撃が加速する事例を記録している。

### ペネトレーションテスト業界の標準的手法

セキュリティ研究者は robots.txt から Disallow 一覧を収集し、将来の攻撃や侵入テストのための隠しパスリストを整備することを標準的な偵察手法として採用している。Burp Suite をはじめとするペネトレーションテストツールは robots.txt を自動的に解析する。

### 結論（アンチパターンの確立度）

複数の一次ガイダンス（OWASP・MDN・Google・PortSwigger）が独立して同じリスクを記述しており、**業界として確立したアンチパターン**と判断できる。「robots.txt の Disallow に機密または隠したいパスを書くと、攻撃者への道標になる逆効果を生む」という認識は、セキュリティコミュニティにおいて定説である。

---

## 2. yolos.net における本件の影響範囲評価

### サイトの性質

- 外部 API なし、認証なし、DB なし、決済なし
- `/internal/tiles` は開発者向けのタイル定義レジストリ確認ページ（Phase 7.3）
- ページ自体に機密情報は含まれない（タイルの slug・表示名・サイズのみ）
- `sitemap.xml` から除外済み（sitemap.ts に `/internal/` への記載なし）
- HTML `<meta name="robots" content="noindex, nofollow">` が既に適用済み

### cycle-175 での既存パターン確立

git 履歴から、cycle-175（2026-05-02）で `/toolbox-preview` を robots.txt から削除した際のコミットメッセージに次の記述がある：

> "robots.ts から /toolbox-preview の Disallow を削除（robots.txt への掲載は URL が公開ファイルから漏れるため）"

cycle-175 で意図的に「noindex meta のみ、robots.txt には書かない」方針に統一した経緯が記録されている。`/storybook` も同様に robots.txt には一切記載されておらず、noindex のみで運用されている。

### cycle-195 での逸脱

cycle-195（e71a3ae0）で `/internal/` を robots.txt の Disallow に追加した変更は、cycle-175 で意図的に確立した既存パターンからの逸脱である。コミットメッセージでは「meta + robots.txt の二重防御」と説明されているが、これはセキュリティ上の理由で cycle-175 に廃止されたアプローチへの回帰にあたる。

### 実害評価

yolos.net の性質（機密情報なし、認証なし）を考慮した場合でも：

1. **攻撃対象の有無に関わらず、信号を出すこと自体が問題**: `/internal/` パスの存在を robots.txt に明記することで、将来的なパス追加（例: `/internal/admin`、`/internal/config`）が攻撃者の注目を引く下地を作る。

2. **noindex と Disallow の相互干渉リスク**: Google は「robots.txt で Disallow したページは noindex を読めない」と明記している。現状は noindex が先に効いているため即時の問題はないが、二重防御の意図と実際の動作が矛盾する設計になっている。

3. **既存パターンからの逸脱による一貫性の欠如**: `/storybook` は noindex のみで `/internal/` は Disallow + noindex という非対称な運用は、将来の実装者に誤ったシグナルを与える。

4. **現時点での実害**: `/internal/tiles` 自体に機密性がないため、仮にアクセスされても情報漏洩の実害はない。ただし Disallow 記載により「`/internal/` 配下に何かある」という情報が robots.txt 経由で公開されている点は、本来不必要な情報開示である。

**実害評価**: 軽微（現状のコンテンツに機密性はないが、既存パターンとの不整合・不必要な情報開示・将来的なリスク増大の素地という 3 点で問題がある）

---

## 3. 各案の評価と推奨

### 案 A: robots.txt から `/internal/` を削除し、noindex meta のみで隠す

**メリット**:

- OWASP・MDN・Google の推奨に合致
- cycle-175 で確立した既存パターン（`/storybook` と同じ）への回帰
- robots.txt から「`/internal/` 配下に何かある」という情報が消える
- noindex が正常に機能する（robots.txt Disallow との干渉解消）

**デメリット**:

- クローラが `/internal/tiles` を実際にクロールする可能性が残る（ただし noindex があれば検索結果には表示されない）
- 悪意あるクローラが noindex を無視してクロールする可能性はゼロにならない（ただし yolos.net のコンテンツ性質上、実害は生じない）

### 案 B: 現状維持（robots.txt Disallow + noindex の二重防御）

**メリット**:

- クローラへの二重の信号（クロール禁止 + インデックス禁止）
- `/internal/` 配下へのクロールトラフィックを完全に遮断できる

**デメリット**:

- OWASP・MDN・Google の推奨に反する
- robots.txt に「`/internal/` 配下に何かある」と明記することになる
- cycle-175 で意図的に廃止したパターンへの逆行
- `/storybook` との非対称な運用（整合性の欠如）
- robots.txt Disallow が効いていると noindex を Google が読めないため、技術的には「二重防御」ではなく「競合する 2 つの信号」になっている

### 案 C: robots.txt から削除 + サイトマップから完全除外

現状すでに `/internal/` は sitemap.xml に含まれていない。案 A と実質的に同じ結果になる。

### 推奨

**案 A** を推奨する。

根拠：

1. 業界の一次ガイダンス（OWASP・MDN・Google）が一致してこの方針を支持している
2. yolos.net は cycle-175 で既に同じ判断を `/toolbox-preview` に適用し、`/storybook` を同方針で運用している
3. cycle-195 での Disallow 追加は既存パターンからの意図しない逸脱であり、元に戻すことが適切
4. yolos.net のサイト性質（機密情報なし）を考慮しても、不必要な情報開示を行う理由がない
5. noindex meta が既に機能している状態で robots.txt Disallow を追加することは、技術的に冗長かつ干渉リスクを持つ

---

## 4. 既存 `/storybook` との整合確認

| 項目                | /storybook | /internal/tiles        | 整合状況   |
| ------------------- | ---------- | ---------------------- | ---------- |
| HTML meta noindex   | あり       | あり                   | 一致       |
| robots.txt Disallow | なし       | あり（cycle-195 追加） | **不一致** |
| sitemap.xml 掲載    | なし       | なし                   | 一致       |
| サイトナビ動線      | なし       | なし                   | 一致       |

cycle-175 で確立した防御方針「noindex meta のみ、robots.txt には書かない」に `/internal/tiles` を揃えることで整合が取れる。

---

## 5. 推奨対処の実装内容

`src/app/robots.ts` の `disallow` を以下のように変更する：

変更前:

```ts
disallow: ["/api/", "/internal/"],
```

変更後:

```ts
disallow: "/api/",
```

また `src/app/(new)/internal/tiles/page.tsx` のコメント（L9）から「robots.txt の Disallow: /internal/ と合わせて二重防御」という記述を削除または修正し、「noindex meta のみで隠す（/storybook と同じ方針）」に更新する。

---

## 参考情報源

- [OWASP WSTG-INFO-03: Review Webserver Metafiles for Information Leakage](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/01-Information_Gathering/03-Review_Webserver_Metafiles_for_Information_Leakage)
- [MDN: robots.txt Security Practical Implementation Guide](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Robots_txt)
- [Google Search Central: Block Search Indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [PortSwigger: robots.txt file (CWE-200)](https://portswigger.net/kb/issues/00600600_robots-txt-file)
- [Black Duck: Robots.txt Security Risk Review and Mitigation](https://www.blackduck.com/blog/robots-txt/)
- [The Register: robots.txt tells hackers the places you don't want them to look (2015)](https://www.theregister.com/2015/05/19/robotstxt/)
- [Search Engine Journal: How to Address Security Risks with Robots.txt Files](https://www.searchenginejournal.com/robots-txt-security-risks/289719/)
