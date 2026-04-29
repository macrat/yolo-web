import Link from "next/link";
import styles from "./Footer.module.css";

/** AI 運営の通知文（constitution Rule 3 の安全装置）。
 * 差し替え可能にすると本サイトの来訪者向け通知が漏れるリスクがあるため、
 * 内部固定にして上書きできない構造にしている。文言の改訂は本ファイルを
 * 編集する形で行う。 */
const NOTE =
  "このサイトは AI による実験的プロジェクトです。コンテンツは AI が生成しており、内容が不正確な場合があります。";

/** フッターサイトマップの4カラム構成。
 * 外部リンクは external: true を指定して新規タブ＋ rel="noopener noreferrer" で開く。
 * ブログカテゴリは `/blog/category/[slug]` ルートが実在するもののみ採用（確認済）。
 * 「ツール」= インタラクティブな道具、「その他」= 静的リファレンス・補助動線。
 * 追加・削除は本ファイルを編集する形で行う。 */
const FOOTER_SECTIONS: {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
    ariaLabel?: string;
  }[];
}[] = [
  {
    title: "ツール",
    links: [
      { label: "ツール一覧", href: "/tools" },
      { label: "文字カウンター", href: "/tools/char-count" },
      { label: "JSON 整形", href: "/tools/json-formatter" },
      { label: "色変換", href: "/tools/color-converter" },
    ],
  },
  {
    title: "遊び",
    links: [
      { label: "全コンテンツ", href: "/play" },
      { label: "今日の運勢", href: "/play#fortune" },
      { label: "タイプ診断", href: "/play#personality" },
      { label: "知識クイズ", href: "/play#knowledge" },
      { label: "毎日のパズル", href: "/play#game" },
    ],
  },
  {
    title: "ブログ",
    links: [
      { label: "ブログ一覧", href: "/blog" },
      { label: "AI ワークフロー", href: "/blog/category/ai-workflow" },
      { label: "開発ノート", href: "/blog/category/dev-notes" },
      { label: "ツールガイド", href: "/blog/category/tool-guides" },
      { label: "日本語・文化", href: "/blog/category/japanese-culture" },
      { label: "サイト更新", href: "/blog/category/site-updates" },
    ],
  },
  {
    title: "その他",
    links: [
      { label: "チートシート", href: "/cheatsheets" },
      { label: "辞典", href: "/dictionary" },
      { label: "実績", href: "/achievements" },
      { label: "サイト紹介", href: "/about" },
      { label: "プライバシー", href: "/privacy" },
      {
        label: "GitHub",
        href: "https://github.com/macrat/yolo-web",
        external: true,
        ariaLabel: "GitHub（外部サイト・新しいタブで開く）",
      },
    ],
  },
];

/**
 * Footer — サイトフッター。
 *
 * - 4カラム式サイトマップ（ツール / 遊び / ブログ / その他）
 * - AI 運営の注記（constitution Rule 3 への対応）
 * - 「© 年 yolos.net」
 *
 * 内容はすべてサイト全体で共通のため props を受け取らない。一貫性の確保と
 * layout 側の boilerplate 回避のため、リンクと注記は内部固定。AI 運営注記は
 * 上書きできない構造にして constitution Rule 3 の安全装置として機能させる。
 *
 * デザイン:
 * - 背景は `--bg`（ヘッダーと統一感のある通常背景）
 * - 文字色は `--fg` / `--fg-soft`、リンクは `--accent`、ホバーで `--accent-strong`
 * - 上辺に border-top でヘッダーの border-bottom と対称的な区切りを設ける
 * - 4カラムは grid でレスポンシブ対応。モバイルでは 2 カラムに自動折り返し
 */
export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* 4カラムサイトマップ — Header の <nav aria-label="メインナビゲーション"> と
            対称的に <nav aria-label="サイトマップ"> でランドマーク化 */}
        <nav aria-label="サイトマップ" className={styles.sitemap}>
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className={styles.column}>
              <h3 className={styles.columnTitle}>{section.title}</h3>
              <ul className={styles.columnLinks}>
                {section.links.map((link) =>
                  link.external ? (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.ariaLabel}
                      >
                        {link.label}
                        {/* DESIGN.md §3: アイコンサイズ 16px 相当のテキスト記号 */}
                        <span
                          className={styles.externalIcon}
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </a>
                    </li>
                  ) : (
                    <li key={link.href}>
                      <Link href={link.href} className={styles.link}>
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </nav>

        {/* フッター下部: AI 運営注記と著作権 */}
        <div className={styles.bottom}>
          <p className={styles.note}>{NOTE}</p>
          <span className={styles.copyright}>
            &copy; {new Date().getFullYear()} yolos.net
          </span>
        </div>
      </div>
    </footer>
  );
}
