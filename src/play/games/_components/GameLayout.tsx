import type { GameMeta } from "@/play/games/types";
import Breadcrumb from "@/components/Breadcrumb";
import FaqSection from "@/components/FaqSection";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import ShareButtons from "@/components/ShareButtons";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import RecommendedContent from "@/play/_components/RecommendedContent";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { phraseFaq } from "@/lib/faq-phrases";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import RelatedGames from "./RelatedGames";
import styles from "./GameLayout.module.css";

interface GameLayoutProps {
  meta: GameMeta;
  children: React.ReactNode;
  /** ゲーム固有の帰属表示（例: KANJIDIC2クレジット、辞典リンク） */
  attribution?: React.ReactNode;
}

/**
 * ゲームのページの共通の組み方。
 *
 * ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *   1. ゲームのセクション。パンくず・h1（ゲーム名）・要約・凡例・ゲーム本体（各ゲームの GameContainer）・帰属表示。
 *      盤と結果は1つの遊びの流れなので、あいだに罫線を引かない。結果のあとの共有・今日のほかのパズル・
 *      ほかの分類は、このセクションの中の小見出しとしてゲーム本体が描く
 *   2. よくある質問（FAQPage の JSON-LD を持つ）
 *   3. このゲームを人に勧めるページの共有
 *   4. 関連のゲーム（RelatedGames）
 *   5. ほかの分類のおすすめ（RecommendedContent）
 *   6. 関連の記事（RelatedBlogPosts）
 * 2・4〜6 は、並べるものが無ければセクションごと描かない。
 *
 * 遊び始めるのに要ること（何のゲームか・何を当てるか・盤の印の意味）は、読み込みを待たずに誰にも見えるよう
 * サーバーで描き、そのすぐ下にゲーム本体を置く。
 */
export default function GameLayout({
  meta,
  children,
  attribution,
}: GameLayoutProps) {
  const faq = phraseFaq(meta.faq);
  return (
    <>
      <Section>
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "遊び", href: "/play" },
            { label: meta.title, href: `/play/${meta.slug}` },
          ]}
        />
        <header className={styles.header}>
          <PhrasedText
            as="h1"
            phrases={splitIntoPhrases(meta.title)}
            {...headingFontAttr(meta.title)}
          />
          <p className={styles.summary}>{meta.summary}</p>
          {meta.legend && (
            <ul className={styles.legend} aria-label={meta.legend.name}>
              {meta.legend.entries.map((entry) => (
                <li key={entry.meaning}>
                  {entry.mark && (
                    <span className={styles.mark} aria-hidden="true">
                      {entry.mark}
                    </span>
                  )}
                  {entry.meaning}
                </li>
              ))}
            </ul>
          )}
        </header>
        <section aria-label="ゲーム">{children}</section>
        {attribution && (
          <footer className={styles.attribution}>{attribution}</footer>
        )}
      </Section>

      {faq.length > 0 && (
        <Section>
          <FaqSection faq={faq} />
        </Section>
      )}

      <Section>
        <PhrasedText
          as="h2"
          className={styles.sectionHeading}
          phrases={["この", "ゲームを", "勧める"]}
        />
        <ShareButtons
          url={`/play/${meta.slug}`}
          title={meta.title}
          sns={["x", "line", "hatena", "copy"]}
          contentType="game"
          contentId={meta.slug}
        />
      </Section>

      <RelatedGames
        currentSlug={meta.slug}
        relatedSlugs={meta.relatedGameSlugs}
      />
      <RecommendedContent currentSlug={meta.slug} />
      <RelatedBlogPosts slug={meta.slug} />
    </>
  );
}
