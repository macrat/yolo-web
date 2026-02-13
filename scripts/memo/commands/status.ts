import fs from "node:fs";
import { inboxDir, archiveDir } from "../core/paths.js";
import { VALID_ROLES } from "../types.js";

function countMdFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep").length;
}

export function showStatus(): void {
  console.log("Role                Inbox  Archive");
  console.log(
    "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  );

  let totalInbox = 0;
  let totalArchive = 0;

  for (const role of VALID_ROLES) {
    const inboxCount = countMdFiles(inboxDir(role));
    const archiveCount = countMdFiles(archiveDir(role));
    totalInbox += inboxCount;
    totalArchive += archiveCount;

    const paddedRole = role.padEnd(20);
    const paddedInbox = String(inboxCount).padStart(5);
    const paddedArchive = String(archiveCount).padStart(8);
    console.log(`${paddedRole}${paddedInbox}${paddedArchive}`);
  }

  console.log(
    "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  );
  const paddedTotal = "Total".padEnd(20);
  console.log(
    `${paddedTotal}${String(totalInbox).padStart(5)}${String(totalArchive).padStart(8)}`,
  );
}
