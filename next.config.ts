import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // multiple root layouts 構成では通常の app/not-found.tsx で 404 を構成できないため、
    // Next.js v16.2 公式仕様に従い global-not-found.js を採用 (B-333-7, cycle-180)
    globalNotFound: true,
  },
  async redirects() {
    // Redirect old category URLs to /blog (301 permanent)
    // These categories were removed in the category reorganization (B-083)
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

    // Redirect /page/1 URLs to their canonical equivalents (301 permanent)
    const paginationRedirects = [
      {
        source: "/tools/page/1",
        destination: "/tools",
        permanent: true,
      },
      {
        source: "/blog/page/1",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/blog/category/:category/page/1",
        destination: "/blog/category/:category",
        permanent: true,
      },
      {
        source: "/blog/tag/:tag/page/1",
        destination: "/blog/tag/:tag",
        permanent: true,
      },
    ];

    // Redirect old /games URLs to /play (301 permanent)
    // Migrated in cycle-100 (B-201): games section is now under /play
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

    // Redirect old /quiz URLs to /play (301 permanent)
    // Migrated in cycle-102 (B-206): quiz and fortune sections are now under /play
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

    // Redirect /toolbox preview URL to the top page (308 permanent)
    // cycle-232 (B-336 Phase 10.3): 道具箱はトップ `/` として本公開された。
    // 旧 noindex プレビュー URL からの再訪者・ブックマークをトップへ恒久誘導する。
    // localStorage はオリジン単位のため、保存済みの道具箱構成はそのまま引き継がれる。
    const toolboxRedirects = [
      {
        source: "/toolbox",
        destination: "/",
        permanent: true,
      },
    ];

    // Redirect old /fortune URLs to /play (301 permanent)
    // Migrated in cycle-102 (B-206): fortune section is now under /play
    const fortuneRedirects = [
      {
        source: "/fortune/daily",
        destination: "/play/daily",
        permanent: true,
      },
    ];

    // Redirect old /colors URLs to /dictionary/colors (308 permanent)
    // Migrated in cycle-50 (B-122): colors is now under the dictionary section
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

    // Redirect old blog category URLs to new category URLs (301 permanent)
    // Category reorganization (B-xxx): blog categories renamed for clarity
    // Mapping: technical -> dev-notes, ai-ops -> ai-workflow, release -> site-updates,
    //          guide -> tool-guides, behind-the-scenes -> ai-workflow
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

    // cycle-244 (B-511): 7 トピックの早見表記事へ 301 恒久誘導する。
    // 6 トピック（regex/cron/git/sql/markdown/html-tags）は専用の早見表記事へ。
    // http-status は既存ガイドに網羅的な早見表セクションがあるため、その早見表アンカーへ誘導する
    // （独立記事を作らず重複/カニバリを避ける。アンカーは既存ガイド内リンクで実証済み）。
    // index (/cheatsheets) は早見表タグページ /blog/tag/早見表 へ向ける。
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
      ...toolboxRedirects,
      ...fortuneRedirects,
      ...colorsRedirects,
      ...blogCategoryRedirects,
      ...cheatsheetRedirects,
    ];
  },
};

export default nextConfig;
