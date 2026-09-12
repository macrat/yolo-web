import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { getAllBlogPosts } from "@/blog/_lib/blog";
import {
  DELETED_BLOG_SLUGS,
  MOVED_BLOG_SLUGS,
  isDeletedBlogSlug,
  build410Html,
  middleware,
} from "../middleware";

describe("DELETED_BLOG_SLUGS", () => {
  test("12件の削除済みスラッグが定義されている", () => {
    expect(DELETED_BLOG_SLUGS).toHaveLength(12);
  });

  // 記事が生きているスラッグを 410 に混ぜない。混ざると、読める記事を
  // 「削除されました」で隠すことになる（site-concept「行き先を用意する」）。
  test("移設したスラッグは削除リストに含まれない", () => {
    for (const slug of Object.keys(MOVED_BLOG_SLUGS)) {
      expect(DELETED_BLOG_SLUGS).not.toContain(slug);
    }
  });

  const expectedSlugs = [
    "ai-agent-site-strategy-formulation",
    "achievement-system-multi-agent-incidents",
    "character-fortune-text-art",
    "music-personality-design",
    "q43-humor-fortune-portal",
    "password-security-guide",
    "hash-generator-guide",
    "unit-converter-guide",
    "rss-feed",
    "html-sql-cheatsheets",
    "web-developer-tools-guide",
    "quality-improvement-and-restructure-design",
  ];

  test.each(expectedSlugs)("スラッグ '%s' が含まれている", (slug) => {
    expect(DELETED_BLOG_SLUGS).toContain(slug);
  });
});

/**
 * 転送先が死んでいると 308 → 404 になり、410 よりも悪い（墓標すら出ない）。
 * 削除リストに生きた記事が混ざっていれば、読める記事を隠すことになる。
 * どちらも「記事の実在」を見ないと検出できないので、記事データと突き合わせる。
 */
describe("転送と削除の行き先が、記事の実在と食い違わない", () => {
  const liveSlugs = new Set(getAllBlogPosts().map((p) => p.slug));

  test("転送先はすべて生きている記事である", () => {
    for (const [from, to] of Object.entries(MOVED_BLOG_SLUGS)) {
      expect(
        liveSlugs.has(to),
        `${from} の転送先 ${to} が存在しない（308→404 になる）`,
      ).toBe(true);
    }
  });

  test("削除リストに生きている記事が混ざっていない", () => {
    for (const slug of DELETED_BLOG_SLUGS) {
      expect(
        liveSlugs.has(slug),
        `${slug} は記事が存在するのに 410 を返している`,
      ).toBe(false);
    }
  });
});

describe("isDeletedBlogSlug", () => {
  test("全12件の削除済みスラッグに対してtrueを返す", () => {
    for (const slug of DELETED_BLOG_SLUGS) {
      expect(isDeletedBlogSlug(slug)).toBe(true);
    }
  });

  test("存在するブログスラッグ（some-valid-slug）に対してfalseを返す", () => {
    expect(isDeletedBlogSlug("some-valid-slug")).toBe(false);
  });

  test("空文字に対してfalseを返す", () => {
    expect(isDeletedBlogSlug("")).toBe(false);
  });
});

describe("build410Html", () => {
  // 見出しそのものを見る。本文のどこかに同じ語があれば通る書き方だと、
  // 見出しを差し替えてもタブのタイトルが古いまま通ってしまう（実際に起きた）。
  test("見出しが「この記事は削除されました」であること", () => {
    const html = build410Html();
    expect(html).toContain("<h1>この記事は削除されました</h1>");
  });

  test("タブのタイトルが見出しと同じ文言であること", () => {
    const html = build410Html();
    expect(html).toContain(
      "<title>この記事は削除されました | yolos.net</title>",
    );
  });

  test("トップページへのリンク（href='/'）を含む", () => {
    const html = build410Html();
    expect(html).toContain("href='/'");
  });

  test("有効なHTML文字列を返す", () => {
    const html = build410Html();
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  // 店構え（DESIGN.md §2/§3/§4/§8）への移行を固定する契約テスト。
  // 旧デザイン（青アクセント・冷色スレート・装飾絵文字・8px角丸）への逆戻りを機械的に防ぐ。
  describe("店構えデザイン契約", () => {
    const html = build410Html();

    /** 埋め込み CSS から、そのセレクタのルール本体だけを取り出す。 */
    function ruleOf(selector: string): string {
      const match = html.match(
        new RegExp(`(^|[;}\\n])${selector}\\s*\\{([^}]*)\\}`),
      );
      expect(match, `${selector} のルールが見つからない`).not.toBeNull();
      return match![2];
    }

    test("旧アクセント青（#2563eb / #1d4ed8）を含まない（§8-1）", () => {
      expect(html).not.toContain("#2563eb");
      expect(html).not.toContain("#1d4ed8");
    });

    test("冷色スレート地（#f8fafc / #1e293b）を含まない（§10）", () => {
      expect(html).not.toContain("#f8fafc");
      expect(html).not.toContain("#1e293b");
    });

    test("装飾絵文字（📄）を含まない（§8-6）", () => {
      expect(html).not.toContain("📄");
    });

    test("紙・墨・朱の器の色を使う（§2）", () => {
      expect(html).toContain("#f8f7f2"); // --paper
      expect(html).toContain("#201e1a"); // --ink
      expect(html).toContain("#af3622"); // --accent（朱）
    });

    // 全文に "Noto Serif JP" があるだけでは、見出しが明朝で組まれている証拠に
    // ならない（店号や h2 のおかげで通ってしまう）。h1 のルールを取り出して見る。
    test("見出しは明朝スタック（Noto Serif JP）で組む（§3）", () => {
      expect(ruleOf("h1")).toContain("Noto Serif JP");
    });

    test("行き止まりにしない——店号と、近いものへの行き先を持つ", () => {
      // ここへ来るのは消えた記事をブックマークしていた人である。
      // 消えたことだけを告げて帰さない（site-concept「行き先を用意する」）。
      expect(html).toContain("href='/'"); // 店号
      for (const dest of ["/blog", "/tools", "/dictionary", "/play"]) {
        expect(html).toContain(`href='${dest}'`);
      }
    });

    test("行き先のラベルは着いた先の名前と一致する（§6）", () => {
      // 「道具」と書いて「ツール」に着くと、来訪者は別の場所に来たと思う。
      // リンクの文言そのものを見る——本文のどこかに同じ語があれば通る書き方だと、
      // ラベルを書き換えても通ってしまう。
      const labels: Record<string, string> = {
        "/blog": "AI試行錯誤ブログ",
        "/tools": "ツール",
        "/dictionary": "辞典",
        "/play": "遊ぶ",
      };
      for (const [href, label] of Object.entries(labels)) {
        expect(html).toContain(`<a href='${href}'>${label}</a>`);
      }
    });

    // constitution rule 3 は3点（AI が運営・実験である・誤りがありうる）を求める。
    // 1点だけ見ていると、残り2点を落としても通る。
    test("AI 明示の3点を落とさない（constitution rule 3）", () => {
      expect(html).toContain("運営しているのは人ではなくAIです");
      expect(html).toContain("実験");
      expect(html).toContain("誤りがあるかもしれません");
    });

    test("ダークに追随する（ライト固定にしない・§10）", () => {
      expect(html).toContain("prefers-color-scheme:dark");
      expect(html).toContain("color-scheme:light dark");
    });

    test("リンクは朱の文字で表す（青ベタボタンでない・§4）", () => {
      expect(html).toContain("--accent:#af3622");
      const linkRule = ruleOf("li a");
      expect(linkRule).toContain("color:var(--accent)");
      // 塗りボタンにしない——地を塗ると §4「装飾は枠・罫・言葉まで」から外れる。
      expect(linkRule).not.toMatch(/background(-color)?:/);
    });

    // §4「角丸の例外は値札と入力欄の 2px だけ」。410 にはどちらも無いので
    // 角丸は一切出てはいけない。特定の値だけを弾く書き方だと、別の値が通る。
    test("角丸を一切使わない（§4）", () => {
      expect(html).not.toMatch(/border-radius:/);
    });
  });
});

describe("middleware（統合テスト）", () => {
  test("移設した記事は 308 で新しい URL へ送られる（410 にしない）", async () => {
    for (const [from, to] of Object.entries(MOVED_BLOG_SLUGS)) {
      const response = await middleware(
        new NextRequest(new URL(`https://yolos.net/blog/${from}`)),
      );
      // 中身が読める場所があるのに「削除されました」を見せない
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toContain(`/blog/${to}`);
    }
  });

  test("削除済みスラッグ（password-security-guide）へのリクエストで410レスポンスが返る", async () => {
    const request = new NextRequest(
      new URL("/blog/password-security-guide", "http://localhost"),
    );
    const response = middleware(request);
    expect(response.status).toBe(410);
    const body = await response.text();
    expect(body).toContain("<h1>この記事は削除されました</h1>");
  });

  test("削除済みスラッグ（web-developer-tools-guide）へのリクエストで410レスポンスが返る", async () => {
    const request = new NextRequest(
      new URL("/blog/web-developer-tools-guide", "http://localhost"),
    );
    const response = middleware(request);
    expect(response.status).toBe(410);
    const body = await response.text();
    expect(body).toContain("<h1>この記事は削除されました</h1>");
  });

  test("通常スラッグ（cron-parser-guide）へのリクエストでNextResponse.next()相当が返る", () => {
    const request = new NextRequest(
      new URL("/blog/cron-parser-guide", "http://localhost"),
    );
    const response = middleware(request);
    // NextResponse.next() は status 200 を返す
    expect(response.status).toBe(200);
  });
});
