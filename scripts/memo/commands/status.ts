import fs from "node:fs";
import { inboxDir, activeDir, archiveDir } from "../core/paths.js";
import { VALID_ROLES } from "../types.js";

function countMdFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep").length;
}

export function showStatus(): void {
  console.log("Role                Inbox  Active  Archive");
  console.log(
    "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  );

  let totalInbox = 0;
  let totalActive = 0;
  let totalArchive = 0;

  for (const role of VALID_ROLES) {
    const inboxCount = countMdFiles(inboxDir(role));
    const activeCount = countMdFiles(activeDir(role));
    const archiveCount = countMdFiles(archiveDir(role));
    totalInbox += inboxCount;
    totalActive += activeCount;
    totalArchive += archiveCount;

    const paddedRole = role.padEnd(20);
    const paddedInbox = String(inboxCount).padStart(5);
    const paddedActive = String(activeCount).padStart(7);
    const paddedArchive = String(archiveCount).padStart(8);
    console.log(`${paddedRole}${paddedInbox}${paddedActive}${paddedArchive}`);
  }

  console.log(
    "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
  );
  const paddedTotal = "Total".padEnd(20);
  console.log(
    `${paddedTotal}${String(totalInbox).padStart(5)}${String(totalActive).padStart(7)}${String(totalArchive).padStart(8)}`,
  );
}
