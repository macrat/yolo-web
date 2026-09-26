import type { Metadata } from "next";
import qrcode from "qrcode-generator";
import StorybookContent, {
  type ImageSample,
  type PhrasedSample,
} from "./StorybookContent";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import type { ItemListItem } from "@/components/ItemList";
import {
  LIST_SAMPLES,
  LIST_SAMPLE_IDS,
  listSampleBasePath,
} from "./list/samples";
import characterPersonalityQuiz from "@/play/quiz/data/character-personality";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";

/** /storybook は開発者向けのコンポーネントカタログ。
 * 来訪者の目に触れる想定はないため `robots: noindex` を指定する。
 * page.tsx を server component に保ち、インタラクティブな描画は子の client component に閉じ込める。 */
export const metadata: Metadata = {
  title: "Storybook（開発者向け） | yolos.net",
  description: "yolos.net のデザインシステムのコンポーネントカタログ。",
  robots: { index: false, follow: false },
};

const listSamples: ItemListItem[] = LIST_SAMPLE_IDS.map((id) => ({
  name: LIST_SAMPLES[id].list.pageTitle,
  href: listSampleBasePath(id),
  description: LIST_SAMPLES[id].note,
}));

/** character-personality のタイプを、見出しの区切りと書体の属性を付けて取り出す。 */
function characterType(id: string): PhrasedSample {
  const result = characterPersonalityQuiz.results.find(
    (candidate) => candidate.id === id,
  );
  if (!result) throw new Error(`character-personality に ${id} が無い`);
  const detail = result.detailedContent;
  return {
    id,
    title: result.title,
    phrases: splitIntoPhrases(result.title),
    headingFont: headingFontAttr(result.title),
    catchphrase:
      detail && "catchphrase" in detail ? detail.catchphrase : undefined,
    description: result.description,
  };
}

/** iOS の VoiceOver で見出しの読み方を聞き比べるタイプ。区切りの位置と括弧・記号の型が互いに違う。 */
const VOICE_OVER_TYPE_IDS = [
  "blazing-warden",
  "contrarian-professor",
  "creative-disruptor",
  "guardian-charger",
];

const QR_CELL_SIZE = 4;
const QR_MARGIN_CELLS = 4;

/** 画像の結果の見本。QR コードの道具と同じ部品で、このページの URL を符号にする。 */
function qrCodeSample(): ImageSample {
  const qr = qrcode(0, "M");
  qr.addData("https://yolos.net/storybook");
  qr.make();
  return {
    src: qr.createDataURL(QR_CELL_SIZE, QR_MARGIN_CELLS),
    size: (qr.getModuleCount() + 2 * QR_MARGIN_CELLS) * QR_CELL_SIZE,
  };
}

export default function StorybookPage() {
  // RelatedBlogPosts は @/lib/cross-links → @/blog/_lib/blog 経由で fs（node:fs）を
  // 参照するサーバー専用コンポーネント。client component の StorybookContent から
  // 直接 import すると Turbopack が node:fs をクライアントバンドルに含めようとして
  // ビルドが失敗する。そのため server component である本ページで描画し、
  // ReactNode を prop として渡す（Next.js の server-in-client パターン）。
  // BrowsableList の見本の行も、辞典のデータを読むのでここで組む。見出しの区切りはサーバーだけで作れるので
  // （@/lib/phrase-breaks）、結果のボックスと PhrasedText の見本の区切りもここで作って渡す。
  return (
    <StorybookContent
      relatedBlogPostsWithPosts={<RelatedBlogPosts slug="business-email" />}
      relatedBlogPostsEmpty={<RelatedBlogPosts slug="char-count" />}
      listSamples={listSamples}
      nameResult={characterType("blazing-warden")}
      quizTitle={characterPersonalityQuiz.meta.title}
      voiceOverSamples={VOICE_OVER_TYPE_IDS.map(characterType)}
      qrCode={qrCodeSample()}
    />
  );
}
