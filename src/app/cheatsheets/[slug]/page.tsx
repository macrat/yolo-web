import { notFound } from "next/navigation";
import {
  cheatsheetsBySlug,
  getAllCheatsheetSlugs,
} from "@/cheatsheets/registry";
import {
  generateCheatsheetMetadata,
  generateCheatsheetJsonLd,
} from "@/lib/seo";
import CheatsheetLayout from "@/components/cheatsheets/CheatsheetLayout";
import CheatsheetRenderer from "./CheatsheetRenderer";

export function generateStaticParams() {
  return getAllCheatsheetSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cheatsheet = cheatsheetsBySlug.get(slug);
  if (!cheatsheet) return {};
  return generateCheatsheetMetadata(cheatsheet.meta);
}

export default async function CheatsheetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cheatsheet = cheatsheetsBySlug.get(slug);
  if (!cheatsheet) notFound();

  return (
    <CheatsheetLayout meta={cheatsheet.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateCheatsheetJsonLd(cheatsheet.meta)),
        }}
      />
      <CheatsheetRenderer slug={slug} />
    </CheatsheetLayout>
  );
}
