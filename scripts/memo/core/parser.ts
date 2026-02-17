import fs from "node:fs";
import type { Memo, MemoFrontmatter } from "../types.js";

/**
 * Parse a memo file into its frontmatter and body.
 * Uses simple string parsing (no YAML library dependency).
 * Normalizes \r\n to \n before parsing.
 * Unknown frontmatter fields (e.g. legacy "public") are silently ignored.
 *
 * NOTE: Similar frontmatter parsing exists in src/lib/markdown.ts (web app).
 * Changes to memo frontmatter format must be reflected in both locations.
 */
export function parseMemoFile(filePath: string): Memo {
  const raw = fs.readFileSync(filePath, "utf-8");
  const content = raw.replace(/\r\n/g, "\n");
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid memo format in ${filePath}: missing frontmatter`);
  }

  const yamlBlock = match[1];
  const body = match[2];

  const fm: MemoFrontmatter = {
    id: extractYamlValue(yamlBlock, "id"),
    subject: extractYamlValue(yamlBlock, "subject"),
    from: extractYamlValue(yamlBlock, "from"),
    to: extractYamlValue(yamlBlock, "to"),
    created_at: extractYamlValue(yamlBlock, "created_at"),
    tags: extractYamlList(yamlBlock, "tags"),
    reply_to: extractYamlNullableValue(yamlBlock, "reply_to"),
  };

  return { frontmatter: fm, body, filePath };
}

function extractYamlValue(yaml: string, key: string): string {
  const regex = new RegExp(`^${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const match = yaml.match(regex);
  if (!match) {
    throw new Error(`Missing required field: ${key}`);
  }
  // Reverse the escaping: \" -> " and \\ -> \
  return match[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function extractYamlNullableValue(yaml: string, key: string): string | null {
  const nullRegex = new RegExp(`^${key}:\\s*null`, "m");
  if (nullRegex.test(yaml)) return null;
  return extractYamlValue(yaml, key);
}

function extractYamlList(yaml: string, key: string): string[] {
  // Handle inline format: tags: ["tag1", "tag2"]
  const inlineRegex = new RegExp(`^${key}:\\s*\\[(.*)\\]`, "m");
  const inlineMatch = yaml.match(inlineRegex);
  if (inlineMatch) {
    if (inlineMatch[1].trim() === "") return [];
    return inlineMatch[1].split(",").map((s) => s.trim().replace(/"/g, ""));
  }

  // Handle block format:
  // tags:
  //   - tag1
  //   - tag2
  const items: string[] = [];
  const lines = yaml.split("\n");
  let inList = false;
  for (const line of lines) {
    if (line.startsWith(`${key}:`)) {
      inList = true;
      continue;
    }
    if (inList) {
      const itemMatch = line.match(/^\s+-\s+(.+)/);
      if (itemMatch) {
        items.push(itemMatch[1].replace(/"/g, "").trim());
      } else {
        break;
      }
    }
  }
  return items;
}
