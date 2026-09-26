import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` は AI エージェントを検出すると nextjs-agent-rules ブロックを
  // AGENTS.md / CLAUDE.md へ自動 upsert する（Next.js 16.3+ の既定 ON）。
  // 本プロジェクトでは CLAUDE.md が Claude Code の動作指示そのものであり、
  // 外部ツールがそこへ書き込むと指示の完全性が損なわれるので、公式の opt-out で無効化する。
  agentRules: false,
  experimental: {
    // どのルートにも一致しない URL の 404 を src/app/global-not-found.js で描く。
    globalNotFound: true,
  },
  async redirects() {
    // なくなったブログの分類は、行き先の分類が無いので /blog へ送る。
    const oldCategories = [
      "decision",
      "collaboration",
      "failure",
      "entertainment",
      "learning",
      "milestone",
    ];

    const oldCategoryRedirects = oldCategories.map((category) => ({
      source: `/blog/category/${category}`,
      destination: "/blog",
      permanent: true,
    }));

    // 一覧の1ページ目はいつも元のパスなので、`/page/1` は元のパスへ 308 で送る。2ページ目からは
    // 一覧ごとの `page/[page]` の経路が静的に生成し、範囲の外の番号は 404 になる。
    const listBasePaths = [
      "/tools",
      "/play",
      "/blog",
      "/blog/category/:category",
      "/blog/tag/:tag",
      "/dictionary/kanji",
      "/dictionary/kanji/grade/:grade",
      "/dictionary/kanji/radical/:radical",
      "/dictionary/kanji/stroke/:count",
      "/dictionary/yoji",
      "/dictionary/yoji/category/:category",
      "/dictionary/colors",
      "/dictionary/colors/category/:category",
      "/dictionary/humor",
    ];
    const paginationRedirects = listBasePaths.map((basePath) => ({
      source: `${basePath}/page/1`,
      destination: basePath,
      permanent: true,
    }));

    // ゲームは /play の下にあるので、/games の URL をそこへ送る。
    const gamesRedirects = [
      {
        source: "/games",
        destination: "/play",
        permanent: true,
      },
      {
        source: "/games/:slug",
        destination: "/play/:slug",
        permanent: true,
      },
    ];

    // クイズ・診断は /play の下にあるので、/quiz の URL をそこへ送る。
    const quizRedirects = [
      {
        source: "/quiz",
        destination: "/play",
        permanent: true,
      },
      {
        source: "/quiz/:slug",
        destination: "/play/:slug",
        permanent: true,
      },
      {
        source: "/quiz/:slug/result/:path*",
        destination: "/play/:slug/result/:path*",
        permanent: true,
      },
    ];

    // /toolbox には同じ道具を並べた一覧 /tools があるので、410 にせずそこへ送る。
    // ブックマーク・被リンク・検索インデックスから来た人が、同じ道具の一覧に着く。
    const toolboxRedirects = [
      {
        source: "/toolbox",
        destination: "/tools",
        permanent: true,
      },
    ];

    // 占いは /play の下にあるので、/fortune の URL をそこへ送る。
    const fortuneRedirects = [
      {
        source: "/fortune/daily",
        destination: "/play/daily",
        permanent: true,
      },
    ];

    // 伝統色は辞典の下にあるので、/colors の URL をそこへ送る。
    const colorsRedirects = [
      {
        source: "/colors",
        destination: "/dictionary/colors",
        permanent: true,
      },
      {
        source: "/colors/category/:category",
        destination: "/dictionary/colors/category/:category",
        permanent: true,
      },
      {
        source: "/colors/:slug",
        destination: "/dictionary/colors/:slug",
        permanent: true,
      },
    ];

    // 名前の替わったブログの分類は、同じ記事を持ついまの分類へ送る。
    const oldBlogCategoryMapping: Array<{
      old: string;
      new: string;
    }> = [
      { old: "technical", new: "dev-notes" },
      { old: "ai-ops", new: "ai-workflow" },
      { old: "release", new: "site-updates" },
      { old: "guide", new: "tool-guides" },
      { old: "behind-the-scenes", new: "ai-workflow" },
    ];

    const blogCategoryRedirects = oldBlogCategoryMapping.flatMap(
      ({ old, new: newCategory }) => [
        {
          source: `/blog/category/${old}`,
          destination: `/blog/category/${newCategory}`,
          permanent: true,
        },
        {
          source: `/blog/category/${old}/page/:path*`,
          destination: `/blog/category/${newCategory}/page/:path*`,
          permanent: true,
        },
      ],
    );

    // 早見表はブログの記事なので、/cheatsheets の URL を同じ主題の記事へ送る。
    // http-status はガイドの記事が早見表の節を持つので、同じ記事を2本作らずその節へ送る。
    // /cheatsheets は早見表のタグのページへ送る。
    const cheatsheetRedirects = [
      {
        source: "/cheatsheets/cron",
        destination: "/blog/cron-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets/git",
        destination: "/blog/git-command-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets/html-tags",
        destination: "/blog/html-tags-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets/http-status-codes",
        destination:
          "/blog/http-status-code-guide-for-rest-api#httpステータスコード一覧早見表",
        permanent: true,
      },
      {
        source: "/cheatsheets/markdown",
        destination: "/blog/markdown-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets/regex",
        destination: "/blog/regex-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets/sql",
        destination: "/blog/sql-cheatsheet",
        permanent: true,
      },
      {
        source: "/cheatsheets",
        destination: "/blog/tag/早見表",
        permanent: true,
      },
    ];

    return [
      ...oldCategoryRedirects,
      ...paginationRedirects,
      ...gamesRedirects,
      ...quizRedirects,
      ...fortuneRedirects,
      ...colorsRedirects,
      ...blogCategoryRedirects,
      ...cheatsheetRedirects,
      ...toolboxRedirects,
    ];
  },
};

export default nextConfig;
