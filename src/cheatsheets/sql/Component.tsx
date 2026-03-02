import CodeBlock from "@/cheatsheets/_components/CodeBlock";

export default function SqlCheatsheet() {
  return (
    <div>
      <section>
        <h2 id="basics">基本のSELECT文</h2>

        <p>
          このチートシートでは、以下の3つのテーブルを全セクション共通の例として使用します。
        </p>
        <CodeBlock
          language="sql"
          code={`-- users: ユーザー情報
-- | id | name     | email              | created_at |
-- orders: 注文情報
-- | id | user_id  | product_id | amount | ordered_at |
-- products: 商品情報
-- | id | name     | price  | category   |`}
        />

        <p>
          SQLには「記述順」と「実行順」の違いがあります。記述順は人間が読みやすい順序ですが、データベースの内部処理は異なる順序で実行されます。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 記述順:  SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY -> LIMIT
-- 実行順:  FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
-- SELECTで定義したエイリアスがWHEREで使えないのは、WHEREの方が先に実行されるため`}
        />

        <h3>全列・特定列の取得</h3>
        <p>テーブルからデータを取得する基本的な構文です。</p>
        <CodeBlock
          language="sql"
          code={`-- 全列を取得
SELECT * FROM users;

-- 特定の列だけを取得
SELECT name, email FROM users;

-- 重複を除いて取得
SELECT DISTINCT category FROM products;`}
        />

        <h3>件数制限とオフセット</h3>
        <p>取得する行数を制限したり、先頭をスキップしたりできます。</p>
        <CodeBlock
          language="sql"
          code={`-- 最初の10件を取得
SELECT * FROM users LIMIT 10;

-- 11件目から10件を取得（ページネーション）
SELECT * FROM users LIMIT 10 OFFSET 10;`}
        />

        <h3>エイリアス（別名）</h3>
        <p>列やテーブルに別名を付けて、読みやすくします。</p>
        <CodeBlock
          language="sql"
          code={`-- 列にエイリアスを付ける
SELECT name AS user_name, email AS user_email FROM users;

-- テーブルにエイリアスを付ける
SELECT u.name, u.email FROM users AS u;`}
        />
      </section>

      <section>
        <h2 id="filtering">絞り込み・条件指定</h2>

        <h3>基本的な条件指定</h3>
        <p>WHERE句で行を絞り込みます。</p>
        <CodeBlock
          language="sql"
          code={`-- 等しい
SELECT * FROM products WHERE category = '書籍';

-- 等しくない
SELECT * FROM products WHERE category != '書籍';

-- 比較演算子
SELECT * FROM products WHERE price >= 1000;
SELECT * FROM products WHERE price < 5000;`}
        />

        <h3>複合条件</h3>
        <p>AND, OR, NOTで複数の条件を組み合わせます。</p>
        <CodeBlock
          language="sql"
          code={`-- AND: 両方の条件を満たす
SELECT * FROM products WHERE category = '書籍' AND price < 3000;

-- OR: いずれかの条件を満たす
SELECT * FROM products WHERE category = '書籍' OR category = '雑貨';

-- NOT: 条件を反転
SELECT * FROM products WHERE NOT category = '書籍';

-- 括弧で優先順位を明示
SELECT * FROM products
WHERE (category = '書籍' OR category = '雑貨') AND price < 3000;`}
        />

        <h3>パターンマッチ・範囲指定</h3>
        <p>LIKE, IN, BETWEENで柔軟に条件を指定します。</p>
        <CodeBlock
          language="sql"
          code={`-- LIKE: パターンマッチ（%は任意の文字列、_は任意の1文字）
SELECT * FROM users WHERE name LIKE '田%';       -- 「田」で始まる
SELECT * FROM users WHERE email LIKE '%@gmail.com'; -- Gmailアドレス
SELECT * FROM users WHERE name LIKE '田_';        -- 「田」+1文字

-- IN: リストのいずれかに一致
SELECT * FROM products WHERE category IN ('書籍', '雑貨', '食品');

-- BETWEEN: 範囲指定（両端を含む）
SELECT * FROM products WHERE price BETWEEN 1000 AND 5000;`}
        />

        <h3>NULLの判定</h3>
        <p>NULLは通常の比較演算子では判定できません。IS NULLを使います。</p>
        <CodeBlock
          language="sql"
          code={`-- NULLの行を取得
SELECT * FROM orders WHERE product_id IS NULL;

-- NULLでない行を取得
SELECT * FROM orders WHERE product_id IS NOT NULL;`}
        />

        <h3>並べ替え</h3>
        <p>ORDER BYで結果の並び順を指定します。</p>
        <CodeBlock
          language="sql"
          code={`-- 昇順（デフォルト）
SELECT * FROM products ORDER BY price ASC;

-- 降順
SELECT * FROM products ORDER BY price DESC;

-- 複数列で並べ替え（カテゴリ昇順 → 価格降順）
SELECT * FROM products ORDER BY category ASC, price DESC;`}
        />
      </section>

      <section>
        <h2 id="aggregation">集計・グループ化</h2>

        <h3>集計関数</h3>
        <p>テーブル全体や、グループごとに集計値を計算します。</p>
        <CodeBlock
          language="sql"
          code={`-- 行数をカウント
SELECT COUNT(*) FROM orders;

-- NULLを除いてカウント
SELECT COUNT(product_id) FROM orders;

-- 合計・平均・最大・最小
SELECT SUM(price) FROM products;
SELECT AVG(price) FROM products;
SELECT MAX(price) FROM products;
SELECT MIN(price) FROM products;`}
        />

        <h3>GROUP BY</h3>
        <p>指定した列の値ごとにグループ化して集計します。</p>
        <CodeBlock
          language="sql"
          code={`-- カテゴリごとの商品数
SELECT category, COUNT(*) AS product_count
FROM products
GROUP BY category;

-- ユーザーごとの注文数と合計金額
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_amount
FROM orders
GROUP BY user_id;`}
        />

        <h3>HAVING</h3>
        <p>
          GROUP
          BYの結果に対して条件で絞り込みます。WHEREとの違いに注意してください。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 注文数が3件以上のユーザー
SELECT user_id, COUNT(*) AS order_count
FROM orders
GROUP BY user_id
HAVING COUNT(*) >= 3;

-- カテゴリ別の平均価格が2000円以上のカテゴリ
SELECT category, AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) >= 2000;

-- WHEREとHAVINGの併用
-- WHERE: グループ化前の絞り込み
-- HAVING: グループ化後の絞り込み
SELECT user_id, COUNT(*) AS order_count
FROM orders
WHERE ordered_at >= '2026-01-01'
GROUP BY user_id
HAVING COUNT(*) >= 3;`}
        />
      </section>

      <section>
        <h2 id="joins">テーブル結合</h2>

        <h3>INNER JOIN</h3>
        <p>両方のテーブルに一致する行のみを返します。最もよく使うJOINです。</p>
        <CodeBlock
          language="sql"
          code={`-- 注文とユーザー情報を結合（一致する行のみ）
SELECT u.name, o.amount, o.ordered_at
FROM orders AS o
INNER JOIN users AS u ON o.user_id = u.id;

-- 3テーブルの結合
SELECT u.name, p.name AS product_name, o.amount
FROM orders AS o
INNER JOIN users AS u ON o.user_id = u.id
INNER JOIN products AS p ON o.product_id = p.id;`}
        />

        <h3>LEFT JOIN</h3>
        <p>
          左テーブルの全行を返し、右テーブルに一致がない場合はNULLで埋めます。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 注文がないユーザーも含めて一覧
SELECT u.name, o.id AS order_id, o.amount
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id;

-- 注文がないユーザーだけを抽出
SELECT u.name
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id
WHERE o.id IS NULL;`}
        />

        <h3>RIGHT JOIN</h3>
        <p>
          右テーブルの全行を返し、左テーブルに一致がない場合はNULLで埋めます。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 注文されていない商品も含めて一覧
SELECT p.name, o.id AS order_id
FROM orders AS o
RIGHT JOIN products AS p ON o.product_id = p.id;`}
        />

        <h3>FULL OUTER JOIN</h3>
        <p>両テーブルの全行を返し、一致がない側はNULLで埋めます。</p>
        <CodeBlock
          language="sql"
          code={`-- 両テーブルの全行を返す
SELECT u.name, o.id AS order_id
FROM users AS u
FULL OUTER JOIN orders AS o ON u.id = o.user_id;

-- MySQL では FULL OUTER JOIN が未サポートのため、
-- LEFT JOIN と RIGHT JOIN を UNION で代替する
SELECT u.name, o.id AS order_id
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id
UNION
SELECT u.name, o.id AS order_id
FROM users AS u
RIGHT JOIN orders AS o ON u.id = o.user_id;`}
        />

        <h3>CROSS JOIN</h3>
        <p>
          全ての組み合わせ（直積）を返します。行数は左テーブル x
          右テーブルになります。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 全ユーザーと全商品の組み合わせ
SELECT u.name, p.name AS product_name
FROM users AS u
CROSS JOIN products AS p;`}
        />

        <h3>自己結合（Self Join）</h3>
        <p>同じテーブルを別名で結合します。階層構造の表現などに使います。</p>
        <CodeBlock
          language="sql"
          code={`-- 同じカテゴリで価格が異なる商品ペアを取得
SELECT p1.name AS product_1, p2.name AS product_2, p1.category
FROM products AS p1
INNER JOIN products AS p2
  ON p1.category = p2.category AND p1.id < p2.id;`}
        />
      </section>

      <section>
        <h2 id="subqueries">サブクエリ</h2>

        <h3>WHERE句内のサブクエリ</h3>
        <p>サブクエリの結果を条件に使って絞り込みます。</p>
        <CodeBlock
          language="sql"
          code={`-- 平均価格より高い商品を取得
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- 注文されたことがある商品のIDリストで絞り込み
SELECT * FROM products
WHERE id IN (SELECT DISTINCT product_id FROM orders);`}
        />

        <h3>EXISTS / NOT EXISTS</h3>
        <p>
          サブクエリの結果が存在するかどうかで絞り込みます。INよりも効率が良い場合があります。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 注文したことがあるユーザー
SELECT * FROM users AS u
WHERE EXISTS (
  SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);

-- 一度も注文していないユーザー
SELECT * FROM users AS u
WHERE NOT EXISTS (
  SELECT 1 FROM orders AS o WHERE o.user_id = u.id
);`}
        />

        <h3>FROM句内のサブクエリ（インラインビュー）</h3>
        <p>サブクエリの結果を仮想テーブルとして利用します。</p>
        <CodeBlock
          language="sql"
          code={`-- ユーザーごとの注文合計を集計してから絞り込み
SELECT sub.user_id, sub.total_amount
FROM (
  SELECT user_id, SUM(amount) AS total_amount
  FROM orders
  GROUP BY user_id
) AS sub
WHERE sub.total_amount >= 10000;`}
        />

        <h3>相関サブクエリ</h3>
        <p>外側のクエリの値を参照するサブクエリです。行ごとに評価されます。</p>
        <CodeBlock
          language="sql"
          code={`-- 各カテゴリで最も高い商品を取得
SELECT * FROM products AS p1
WHERE price = (
  SELECT MAX(price) FROM products AS p2
  WHERE p2.category = p1.category
);`}
        />
      </section>

      <section>
        <h2 id="set-operations">集合演算</h2>

        <h3>UNION / UNION ALL</h3>
        <p>
          2つのクエリ結果を縦に結合します。列数と型が一致している必要があります。
        </p>
        <CodeBlock
          language="sql"
          code={`-- UNION: 重複を除いて結合
SELECT name FROM users
UNION
SELECT name FROM products;

-- UNION ALL: 重複を保持して結合（UNIONより高速）
SELECT name FROM users
UNION ALL
SELECT name FROM products;`}
        />

        <h3>INTERSECT</h3>
        <p>2つのクエリ結果の共通部分を返します。</p>
        <CodeBlock
          language="sql"
          code={`-- 両方のクエリに存在する名前
SELECT name FROM users
INTERSECT
SELECT name FROM products;
-- MySQL は 8.0.31 以降で対応`}
        />

        <h3>EXCEPT</h3>
        <p>1つ目のクエリ結果から2つ目に含まれるものを除外します。</p>
        <CodeBlock
          language="sql"
          code={`-- usersにはあるがproductsにはない名前
SELECT name FROM users
EXCEPT
SELECT name FROM products;
-- MySQL では EXCEPT は 8.0.31 以降で対応`}
        />
      </section>

      <section>
        <h2 id="data-manipulation">データ操作（DML）</h2>

        <h3>INSERT</h3>
        <p>テーブルに新しい行を挿入します。</p>
        <CodeBlock
          language="sql"
          code={`-- 1行を挿入
INSERT INTO users (name, email, created_at)
VALUES ('田中太郎', 'tanaka@example.com', '2026-03-01');

-- 複数行を一度に挿入
INSERT INTO products (name, price, category) VALUES
  ('SQLの教科書', 2800, '書籍'),
  ('データベース入門', 3200, '書籍'),
  ('ノート', 500, '雑貨');`}
        />

        <h3>UPDATE</h3>
        <p>
          既存の行を更新します。WHERE句を忘れると全行が更新されるため注意してください。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 特定の行を更新
UPDATE products SET price = 2500 WHERE id = 1;

-- 複数列を同時に更新
UPDATE users
SET name = '田中一郎', email = 'ichiro@example.com'
WHERE id = 1;

-- 条件に一致する全行を更新
UPDATE products SET price = price * 1.1 WHERE category = '書籍';`}
        />

        <h3>DELETE</h3>
        <p>
          行を削除します。WHERE句を忘れると全行が削除されるため注意してください。
        </p>
        <CodeBlock
          language="sql"
          code={`-- 特定の行を削除
DELETE FROM orders WHERE id = 1;

-- 条件に一致する行を削除
DELETE FROM orders WHERE ordered_at < '2025-01-01';

-- 全行を削除（テーブル構造は残る）
DELETE FROM orders;`}
        />

        <h3>UPSERT（INSERT or UPDATE）</h3>
        <p>
          行が存在しなければ挿入し、存在すれば更新します。構文はDBMSによって異なります。
        </p>
        <CodeBlock
          language="sql"
          code={`-- MySQL: ON DUPLICATE KEY UPDATE（8.0.19+推奨構文）
INSERT INTO products (id, name, price, category)
VALUES (1, 'SQLの教科書', 2800, '書籍')
AS new_row
ON DUPLICATE KEY UPDATE price = new_row.price;

-- PostgreSQL: ON CONFLICT
INSERT INTO products (id, name, price, category)
VALUES (1, 'SQLの教科書', 2800, '書籍')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;`}
        />
      </section>

      <section>
        <h2 id="schema">テーブル定義（DDL）</h2>

        <h3>CREATE TABLE</h3>
        <p>新しいテーブルを作成します。</p>
        <CodeBlock
          language="sql"
          code={`-- 基本的なテーブル作成
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 外部キー付きのテーブル作成
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- テーブルが存在しない場合のみ作成
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50)
);`}
        />

        <h3>ALTER TABLE</h3>
        <p>既存のテーブルの構造を変更します。</p>
        <CodeBlock
          language="sql"
          code={`-- カラムを追加
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- カラムを削除
ALTER TABLE users DROP COLUMN phone;

-- カラムの型を変更（MySQL）
ALTER TABLE users MODIFY COLUMN name VARCHAR(200) NOT NULL;

-- カラムの型を変更（PostgreSQL）
ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(200);`}
        />

        <h3>DROP TABLE</h3>
        <p>テーブルを削除します。データも全て失われるため注意してください。</p>
        <CodeBlock
          language="sql"
          code={`-- テーブルを削除
DROP TABLE orders;

-- テーブルが存在する場合のみ削除（エラー回避）
DROP TABLE IF EXISTS orders;`}
        />

        <h3>主要データ型</h3>
        <p>よく使うデータ型の一覧です。細かな仕様はDBMSごとに異なります。</p>
        <CodeBlock
          language="sql"
          code={`-- 数値型
-- INTEGER (INT)     : 整数（-2,147,483,648 ~ 2,147,483,647）
-- BIGINT            : 大きな整数
-- DECIMAL(p, s)     : 固定小数点数（pは桁数、sは小数点以下の桁数）
-- FLOAT / DOUBLE    : 浮動小数点数（近似値のため金額にはDECIMALを推奨）

-- 文字列型
-- VARCHAR(n)        : 可変長文字列（最大n文字）
-- TEXT              : 長い文字列（最大長はDBMS依存）
-- CHAR(n)           : 固定長文字列（常にn文字分の領域を使用）

-- 日付・時刻型
-- DATE              : 日付（YYYY-MM-DD）
-- TIME              : 時刻（HH:MM:SS）
-- TIMESTAMP         : 日付+時刻（タイムゾーン対応はDBMS依存）

-- その他
-- BOOLEAN           : 真偽値（MySQLでは内部的にTINYINT(1)）
-- JSON              : JSONデータ（MySQL 5.7+ / PostgreSQL 9.2+）`}
        />
      </section>
    </div>
  );
}
