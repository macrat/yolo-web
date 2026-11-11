import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listPageTitle } from "@/lib/list-pages";
import ListSampleView from "../ListSampleView";
import { LIST_SAMPLES, LIST_SAMPLE_IDS } from "../samples";

interface Props {
  params: Promise<{ sample: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{ sample: string }> {
  return LIST_SAMPLE_IDS.map((sample) => ({ sample }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sample } = await params;
  return {
    title: listPageTitle(LIST_SAMPLES[sample].list.pageTitle, 1),
    robots: { index: false, follow: false },
  };
}

/** /storybook/list/[sample] は BrowsableList の見本の1ページ目。開発者向けで、来訪者の目に触れる想定はない。 */
export default async function ListSamplePage({ params }: Props) {
  const { sample } = await params;
  if (!(sample in LIST_SAMPLES)) notFound();
  return <ListSampleView id={sample} page={1} />;
}
