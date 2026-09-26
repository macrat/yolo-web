import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiRadicals } from "@/dictionary/_lib/kanji";
import {
  isKanjiRadical,
  kanjiListMetadata,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ radical: string }>;
}

export function generateStaticParams(): Array<{ radical: string }> {
  return getKanjiRadicals().map((radical) => ({ radical }));
}

async function resolveScope(params: Props["params"]): Promise<KanjiListScope> {
  const radical = decodeURIComponent((await params).radical);
  if (!isKanjiRadical(radical)) notFound();
  return { type: "radical", radical };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanjiListMetadata(await resolveScope(params), 1);
}

/** /dictionary/kanji/radical/[radical] は1つの部首の漢字の一覧の1ページ目。 */
export default async function KanjiRadicalPage({ params }: Props) {
  return <KanjiListView scope={await resolveScope(params)} page={1} />;
}
