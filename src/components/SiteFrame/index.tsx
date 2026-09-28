import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import { MAIN_CONTENT_ID } from "@/lib/site-frame";
import styles from "./SiteFrame.module.css";

/**
 * どのページにも共通の枠（DESIGN.md §5 レイアウト）。スキップのリンク・上端・中間・下端を順に置く。
 * ルートのレイアウト（src/app/layout.tsx）が body の中に置く。404 もルートのレイアウトの中に描かれ、同じ枠を持つ。
 */
export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 最初にフォーカスが入る要素。上端のリンクを Tab で越えずに本文へ跳べるようにする（WCAG 2.4.1）。 */}
      <SkipLink />
      <Header />
      {/* tabIndex={-1}: スキップのリンクからフォーカスを移し、次の Tab を本文の最初のリンクから始める。 */}
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
        {children}
      </main>
      <Footer />
    </>
  );
}
