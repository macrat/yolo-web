import type { Metadata } from "next";
import {
  listPageFromParam,
  listPageStaticParams,
  listPageTitle,
} from "@/lib/list-pages";
import ListSampleView from "../../../ListSampleView";
import { LIST_SAMPLES, LIST_SAMPLE_IDS } from "../../../samples";

interface Props {
  params: Promise<{ sample: string; page: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): Array<{
  sample: string;
  page: string;
}> {
  return LIST_SAMPLE_IDS.flatMap((sample) => {
    const { items, perPage } = LIST_SAMPLES[sample].list;
    return listPageStaticParams(items.length, perPage).map(({ page }) => ({
      sample,
      page,
    }));
  });
}

async function resolve(params: Props["params"]) {
  const { sample, page } = await params;
  const { list } = LIST_SAMPLES[sample];
  return {
    sample,
    list,
    page: listPageFromParam(page, list.items.length, list.perPage),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { list, page } = await resolve(params);
  return {
    title: listPageTitle(list.pageTitle, page),
    robots: { index: false, follow: false },
  };
}

/** /storybook/list/[sample]/page/[page] は BrowsableList の見本の2ページ目から。 */
export default async function ListSamplePagedPage({ params }: Props) {
  const { sample, page } = await resolve(params);
  return <ListSampleView id={sample} page={page} />;
}
