import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cheatsheetsBySlug } from "@/cheatsheets/registry";
import {
  generateCheatsheetMetadata,
  generateCheatsheetJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import CheatsheetLayout from "@/cheatsheets/_components/CheatsheetLayout";
import GitComponent from "@/cheatsheets/git/Component";

const SLUG = "git";
const cheatsheet = cheatsheetsBySlug.get(SLUG);

export const metadata: Metadata = cheatsheet
  ? generateCheatsheetMetadata(cheatsheet.meta)
  : {};

export default function GitCheatsheetPage() {
  if (!cheatsheet) notFound();

  return (
    <CheatsheetLayout meta={cheatsheet.meta}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdStringify(
            generateCheatsheetJsonLd(cheatsheet.meta),
          ),
        }}
      />
      <GitComponent />
    </CheatsheetLayout>
  );
}
