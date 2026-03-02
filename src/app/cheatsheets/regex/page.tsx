import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cheatsheetsBySlug } from "@/cheatsheets/registry";
import {
  generateCheatsheetMetadata,
  generateCheatsheetJsonLd,
  safeJsonLdStringify,
} from "@/lib/seo";
import CheatsheetLayout from "@/cheatsheets/_components/CheatsheetLayout";
import RegexComponent from "@/cheatsheets/regex/Component";

const SLUG = "regex";
const cheatsheet = cheatsheetsBySlug.get(SLUG);

export const metadata: Metadata = cheatsheet
  ? generateCheatsheetMetadata(cheatsheet.meta)
  : {};

export default function RegexCheatsheetPage() {
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
      <RegexComponent />
    </CheatsheetLayout>
  );
}
