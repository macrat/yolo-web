import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { generateHumorDictMetadata, safeJsonLdStringify } from "@/lib/seo";
import { getAllEntries } from "@/humor-dict/data";
import { humorDictMeta } from "@/humor-dict/meta";
import styles from "./page.module.css";

/**
 * ユーモア辞典トップ — DESIGN.md フェーズ R で「店構え」へ変換。
 *
 * 旧デザイン（淡色地カード・角丸・box-shadow・hover 地色替え・旧トークン --border/--bg/--r-*）を
 * 全廃し、§4「一覧の既定は品書き（罫区切りリスト）」に沿って作り直した。器は静か（紙墨朱・罫・
 * 組版のみ）、主役は 31 語の見出し。色・角丸・書体はすべてトークン経由（§10・直書き禁止）。
 *
 * 品書きの実装について（迷った判断・報告参照）: 共有の Shinagaki コンポーネントは
 * name/note/tags/meta の器で、辞典特有の「見出し語のよみがな（読み添え）」を品名の脇に
 * 置く枠を持たない。ここでは辞典の情報（語・よみ・語義プレビュー）を失わないことを優先し、
 * §4 の品書きと同じ視覚言語（上辺＋各行の一本罫・明朝の品名・16px の説明・hover で朱＋下線）を
 * このページ内で組んだ。Shinagaki は編集していない。
 *
 * 表示コピーは §6 の自然な日本語で書き下ろした（meta.ts の煽り気味の説明文は据え置き＝
 * メタデータ・JSON-LD 用の共有データのため、可視テキストのみ本ページで自然文に差し替える）。
 */

export const metadata: Metadata = generateHumorDictMetadata();

/**
 * 定義文から最初の一文を抽出してプレビューとして返す。
 * 句点（。）で区切り、なければ全文を返す。
 */
function getDefinitionPreview(definition: string): string {
  const firstSentenceEnd = definition.indexOf("。");
  if (firstSentenceEnd !== -1) {
    return definition.slice(0, firstSentenceEnd + 1);
  }
  return definition;
}

export default function HumorDictIndexPage() {
  const entries = getAllEntries();

  const definedTermSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: humorDictMeta.title,
    description: humorDictMeta.description,
    url: "https://yolos.net/dictionary/humor",
    inLanguage: "ja",
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(definedTermSetJsonLd),
        }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "ユーモア辞典" },
        ]}
      />

      {/* 自己紹介（器・店の名乗り）。§6 の言葉で、何が読めるかを具体に。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>{humorDictMeta.title}</h1>
        <p className={styles.lead}>
          AIが、ふだんの言葉に少しおかしな意味を付け直してみた辞典です。
        </p>
        <p className={styles.body}>
          「月曜日」や「二度寝」のような身近な言葉を、AIがまじめな顔で定義し直しました。もちろん本当の意味ではありませんが、読むと思わずうなずいたり笑ったりするかもしれません。全
          {entries.length}
          語を五十音順に並べています。気になる言葉を選ぶと、その定義と、言葉をめぐる短い解説が読めます。
        </p>
      </div>

      {/* 見出し語の品書き（§4 罫区切りリスト）。各行 = 見出し語（リンク）＋よみ＋語義プレビュー。 */}
      <ul className={styles.list} aria-label="ユーモア辞典 見出し語一覧">
        {entries.map((entry) => (
          <li key={entry.slug} className={styles.row}>
            <Link
              href={`/dictionary/humor/${entry.slug}`}
              className={styles.entryLink}
            >
              <span className={styles.headword}>
                <span className={styles.word}>{entry.word}</span>
                <span className={styles.reading}>【{entry.reading}】</span>
              </span>
              <span className={styles.preview}>
                {getDefinitionPreview(entry.definition)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
