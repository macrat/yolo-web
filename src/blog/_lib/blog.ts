import fs from "node:fs";
import path from "node:path";
import {
  parseFrontmatter,
  markdownToHtml,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/markdown";
import type { TrustLevel } from "@/lib/trust-levels";

const BLOG_DIR = path.join(process.cwd(), "src/blog/content");

export type BlogCategory =
  | "ai-workflow"
  | "dev-notes"
  | "site-updates"
  | "tool-guides"
  | "japanese-culture";

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  "ai-workflow": "AIワークフロー",
  "dev-notes": "開発ノート",
  "site-updates": "サイト更新",
  "tool-guides": "ツールガイド",
  "japanese-culture": "日本語・文化",
};

export const ALL_CATEGORIES: BlogCategory[] = [
  "ai-workflow",
  "dev-notes",
  "site-updates",
  "tool-guides",
  "japanese-culture",
];

/** Series ID to display name mapping. */
export const SERIES_LABELS: Record<string, string> = {
  "ai-agent-ops": "AIエージェント運用記",
  "japanese-culture": "日本語・日本文化",
  "nextjs-deep-dive": "Next.js実践ノート",
};

/**
 * Category-specific descriptions shown on category listing pages.
 * Used for both page metadata and visible page header.
 */
export const CATEGORY_DESCRIPTIONS: Record<BlogCategory, string> = {
  "ai-workflow":
    "AIエージェントチームによるサイト運営の実践記録。ワークフロー設計、エージェント間協調、失敗と改善の過程を赤裸々に記録しています。",
  "dev-notes":
    "Next.js・TypeScriptを中心とした技術的な実装記録。設計パターン、落とし穴の解説、パフォーマンス改善など、実践から得た知見をまとめています。",
  "site-updates":
    "yolos.netの新機能リリースやサイト構成の変更をお知らせします。新しいツールの追加やデザイン改善など、サイトの最新情報はこちらで確認できます。",
  "tool-guides":
    "オンラインツールの使い方や関連知識を解説するガイド記事。文字数カウント、正規表現、cron式、JSON整形など実用的なトピックを扱います。",
  "japanese-culture":
    "四字熟語、ことわざ、伝統色など、日本語と日本文化を楽しく学べるコンテンツ。クイズやゲームと合わせてお楽しみください。",
};

/**
 * Minimum number of posts required for a tag page to be indexed by search engines.
 * Tag pages with fewer posts will have noindex meta tag set.
 */
export const MIN_POSTS_FOR_TAG_INDEX = 5;

/**
 * Descriptions for each tag, shown on tag listing pages.
 * Tags with 3+ posts are eligible for tag pages.
 * Each description is 100+ characters to provide meaningful context.
 */
export const TAG_DESCRIPTIONS: Record<string, string> = {
  設計パターン:
    "Webアプリケーション開発における設計パターンの実践集。コンポーネント設計、データフロー設計、ルーティング設計など、保守性と拡張性を高めるための具体的なアプローチを、実際のコード例とともに解説します。同じ問題に直面している開発者に役立つ内容です。",
  Web開発:
    "モダンなWeb開発の実践知識をまとめた記事集。Next.js・React・TypeScriptを中心に、フロントエンドからサーバーサイドまで幅広いトピックをカバーします。実際のプロジェクトで直面した課題とその解決策をわかりやすく解説します。",
  SEO: "検索エンジン最適化（SEO）の実践テクニック集。メタデータ設計、構造化データ（JSON-LD）の実装、サイトマップの設定、Core Web Vitalsの改善まで、検索流入を増やすための具体的な施策を幅広く解説します。",
  "Next.js":
    "Next.jsフレームワークの深掘り記事集。静的生成・サーバーサイドレンダリング・App Routerの使い方から、ハイドレーションエラーの解消、バンドルサイズ最適化、動的インポートまで実践的に解説します。",
  新機能:
    "yolos.netへ新たに追加された機能や改善内容のお知らせです。ツール・ゲーム・ブログ機能など、サイトをより便利で楽しくするためのアップデートを随時紹介します。フィードバックもお待ちしています。ぜひご覧ください。",
  オンラインツール:
    "yolos.netが提供するオンラインツールの使い方ガイドや関連知識の解説記事集。文字数カウント・cron式パーサー・JSON整形・正規表現テスターなど、開発者や一般ユーザーに役立つツールを多数紹介します。",
  UI改善:
    "ユーザーインターフェースの改善事例と設計思想をまとめた記事集。レスポンシブデザイン、アクセシビリティ対応、ダークモード実装、ナビゲーション改善など、訪問者体験を向上させるための取り組みを幅広く記録します。",
  TypeScript:
    "TypeScriptの型システムを活用した実践的なプログラミングの知見をまとめた記事集。型安全なコンポーネント設計、型エラーのデバッグ手法、型推論の活用、実際のプロジェクトで役立つパターンを解説します。",
  日本語:
    "日本語の語彙・表現・日本文化に関する記事集。四字熟語、ことわざ、敬語の使い方、伝統色など、日本語の奥深さを楽しく探求できるコンテンツをまとめています。日本語を学んでいる方にも興味深い内容が揃っています。",
  サイト運営:
    "AIエージェントが主体となってyolos.netを運営する過程のリアルな記録集。コンテンツ戦略の立案、品質管理の仕組み、失敗と学びの繰り返しなど、AI駆動のサイト運営の裏側を包み隠さず公開しています。",
  ゲーム:
    "yolos.netのブラウザゲームに関する記事集。四字熟語クイズ、ことわざゲーム、漢字パズルなど、日本語学習を楽しくするゲームの遊び方と、ゲーム開発の舞台裏を掲載しています。空き時間にぜひ遊んでみてください。",
  AIエージェント:
    "AIエージェントの設計・運用・改善に関する実践的な記録集。Claude Codeを活用した自律的なサイト運営の試み、エージェント同士の連携の仕組み、エラーからの学習プロセスを具体例とともに紹介します。",
  ワークフロー:
    "AIエージェントが作業を進めるためのワークフロー設計と改善の記録集。タスク分割の方法、品質チェックの仕組み、レビュープロセスの設計など、効率的かつ高品質なアウトプットを生み出す仕組みを詳しく解説します。",
  舞台裏:
    "yolos.netの開発・運営の舞台裏を公開する記事集。技術選定の理由や試行錯誤の詳細な過程、予想外のトラブルと解決策など、AIエージェントが主体のサイト運営のリアルな姿をありのままに記録しています。",
  漢字: "漢字の学習や活用に関する記事集。四字熟語や常用漢字の丁寧な解説、漢字を使ったブラウザゲームやオンラインツールの紹介など、漢字の面白さと実用性を幅広く取り上げています。漢字をもっと楽しく学んでいきましょう。",
  失敗と学び:
    "AIエージェントチームが経験した失敗事例とそこから得た教訓の記録集。ルール違反、品質問題、設計の誤りなど、率直に公開することでより良いシステムへの改善につなげています。失敗から学ぶことの大切さを伝えます。",
  伝統色:
    "日本の伝統色に関する記事集。紅梅色・萌黄色・藍色など、日本古来の色名とその背景にある文化・歴史を詳しく解説します。yolos.netの伝統色ツールの使い方や活用事例の紹介記事も合わせて掲載しています。",
  ワークフロー連載:
    "AIエージェントによるサイト運営ワークフローの進化を連載形式で記録したシリーズ記事集。初期設計から現在に至るまでの改善の軌跡と失敗の歴史を時系列で追うことができます。試行錯誤の積み重ねをご覧ください。",
  リファクタリング:
    "コードのリファクタリング事例と設計改善の記録をまとめた記事集。可読性・保守性・パフォーマンスを向上させるための具体的なアプローチや、大規模な改修プロジェクトの進め方をステップごとに実例とともに解説しています。",
  正規表現:
    "正規表現（Regular Expression）の実践的な使い方と落とし穴の解説記事集。パターンマッチング、文字列抽出・置換、グループ化など、日常の開発で役立つ正規表現テクニックを豊富な例とともに紹介します。",
  四字熟語:
    "四字熟語の意味・用法・語源に関する詳しい解説記事と、四字熟語を活用したクイズ・ゲームの紹介記事集。日本語の表現力を豊かにする四字熟語の奥深い世界を楽しみながら学べます。語彙力アップにも最適な内容です。",
  パフォーマンス:
    "Webサイトのパフォーマンス最適化に関する実践記事集。画像最適化の手法、JavaScriptバンドルサイズの削減、レンダリング戦略の適切な選択など、ユーザー体験を向上させるための高速化テクニックを詳しく解説します。",
  テキスト処理:
    "テキスト処理に関する技術記事集。文字数カウントの仕組みと実装方法、文字コードの扱い方、各種フォーマット変換の実装など、日常の開発やライティング作業で役立つテキスト操作の知識とツールを幅広く紹介しています。",
  チートシート:
    "開発者向けのクイックリファレンス記事集。コマンドの使い方、APIの仕様まとめ、各種設定ファイルの書き方など、すぐに参照できる形でまとめた実用的なチートシートを多数提供しています。作業効率化に役立ちます。",
  セキュリティ:
    "Webアプリケーションのセキュリティに関する実践記事集。XSS対策の具体的な実装、入力バリデーションの方法、安全なデータ処理など、脆弱性を防ぐための具体的な実装方法をわかりやすく丁寧に解説しています。",
  "Claude Code":
    "Anthropic社のAIコーディングアシスタント「Claude Code」の活用事例と知見をまとめた記事集。エージェントモードでの自律的なコード生成・修正・テストの実践や、効果的な使い方のコツをまとめています。",
};

interface BlogFrontmatter {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  category: string;
  series?: string;
  related_tool_slugs: string[];
  draft: boolean;
}

export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  category: BlogCategory;
  series?: string;
  related_tool_slugs: string[];
  draft: boolean;
  readingTime: number;
  /** Content trust level */
  trustLevel: TrustLevel;
}

export interface BlogPost extends BlogPostMeta {
  contentHtml: string;
  headings: { level: number; text: string; id: string }[];
}

/**
 * List all published blog posts, sorted by published_at descending.
 * Reads from src/blog/content/*.md at build time.
 * Excludes posts where draft: true.
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter<BlogFrontmatter>(raw);

    if (data.draft === true) continue;

    const meta: BlogPostMeta = {
      title: String(data.title || ""),
      slug: String(data.slug || file.replace(/\.md$/, "")),
      description: String(data.description || ""),
      published_at: String(data.published_at || ""),
      updated_at: String(data.updated_at || data.published_at || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: (data.category as BlogCategory) || "dev-notes",
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
      trustLevel: "generated" as const,
    };

    if (data.series) {
      meta.series = String(data.series);
    }

    posts.push(meta);
  }

  posts.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );

  return posts;
}

/** Get a single blog post by slug, with rendered HTML and headings. */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = parseFrontmatter<BlogFrontmatter>(raw);

    const postSlug = String(data.slug || file.replace(/\.md$/, ""));
    if (postSlug !== slug) continue;
    if (data.draft === true) continue;

    const post: BlogPost = {
      title: String(data.title || ""),
      slug: postSlug,
      description: String(data.description || ""),
      published_at: String(data.published_at || ""),
      updated_at: String(data.updated_at || data.published_at || ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: (data.category as BlogCategory) || "dev-notes",
      related_tool_slugs: Array.isArray(data.related_tool_slugs)
        ? data.related_tool_slugs.map(String)
        : [],
      draft: false,
      readingTime: estimateReadingTime(content),
      trustLevel: "generated" as const,
      contentHtml: markdownToHtml(content),
      headings: extractHeadings(content),
    };

    if (data.series) {
      post.series = String(data.series);
    }

    return post;
  }

  return null;
}

/**
 * Get all published posts belonging to a given series, sorted by
 * published_at ascending (oldest first).
 */
export function getSeriesPosts(seriesId: string): BlogPostMeta[] {
  const all = getAllBlogPosts();
  const filtered = all.filter((p) => p.series === seriesId);

  filtered.sort(
    (a, b) =>
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime(),
  );

  return filtered;
}

/** Get all slugs for generateStaticParams. */
export function getAllBlogSlugs(): string[] {
  return getAllBlogPosts().map((p) => p.slug);
}

/**
 * Scoring weights for related post calculation.
 * Same category posts get a significant base score, and each shared tag
 * adds incremental score to surface content-relevant posts.
 */
const SCORE_SAME_CATEGORY = 10;
const SCORE_PER_SHARED_TAG = 3;

/**
 * Calculate and return up to 3 related posts for the given post.
 *
 * Scoring rules:
 * - +10 for being in the same category
 * - +3 for each shared tag
 *
 * Exclusion rules:
 * - The current post itself is excluded
 * - Posts in the same series are excluded (SeriesNav handles those)
 *
 * This function is designed to be called at build time for static generation.
 */
export function getRelatedPosts(
  currentPost: BlogPostMeta,
  allPosts: BlogPostMeta[],
): BlogPostMeta[] {
  const MAX_RELATED = 3;

  const candidates = allPosts.filter((post) => {
    // Exclude self
    if (post.slug === currentPost.slug) return false;
    // Exclude posts in the same series (SeriesNav handles in-series navigation)
    if (
      currentPost.series &&
      post.series &&
      post.series === currentPost.series
    ) {
      return false;
    }
    return true;
  });

  const scored = candidates.map((post) => {
    let score = 0;

    if (post.category === currentPost.category) {
      score += SCORE_SAME_CATEGORY;
    }

    const sharedTagCount = post.tags.filter((tag) =>
      currentPost.tags.includes(tag),
    ).length;
    score += sharedTagCount * SCORE_PER_SHARED_TAG;

    return { post, score };
  });

  // Sort by score descending; preserve original order (published_at desc) as
  // a tiebreaker so results are deterministic across builds
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_RELATED).map(({ post }) => post);
}

/**
 * Get all unique tags used across published posts.
 * Returns tags sorted alphabetically.
 */
export function getAllTags(): string[] {
  const posts = getAllBlogPosts();
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/**
 * Get all published posts that have the given tag, sorted by published_at descending.
 */
export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllBlogPosts().filter((p) => p.tags.includes(tag));
}

/**
 * Get all tags that have at least the given minimum number of posts.
 * Used to determine which tags get their own static pages.
 */
export function getTagsWithMinPosts(minPosts: number): string[] {
  const posts = getAllBlogPosts();
  const tagCounts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(tagCounts.entries())
    .filter(([, count]) => count >= minPosts)
    .map(([tag]) => tag)
    .sort();
}
