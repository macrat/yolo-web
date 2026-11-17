import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getKanjiStrokeCounts } from "@/dictionary/_lib/kanji";
import {
  isKanjiStrokeCount,
  kanjiListMetadata,
  type KanjiListScope,
} from "@/dictionary/_lib/kanji-list";
import KanjiListView from "@/dictionary/_components/kanji/KanjiListView";

interface Props {
  params: Promise<{ count: string }>;
}

export function generateStaticParams(): Array<{ count: string }> {
  return getKanjiStrokeCounts().map((count) => ({ count: String(count) }));
}

async function resolveScope(params: Props["params"]): Promise<KanjiListScope> {
  const { count } = await params;
  if (!isKanjiStrokeCount(count)) notFound();
  return { type: "stroke", strokeCount: Number(count) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanjiListMetadata(await resolveScope(params), 1);
}

/** /dictionary/kanji/stroke/[count] は1つの画数の漢字の一覧の1ページ目。 */
export default async function KanjiStrokePage({ params }: Props) {
  return <KanjiListView scope={await resolveScope(params)} page={1} />;
}
