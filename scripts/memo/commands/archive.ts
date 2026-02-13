import fs from "node:fs";
import path from "node:path";
import { inboxDir, archiveDir } from "../core/paths.js";
import type { RoleSlug } from "../types.js";

export function archiveMemo(role: RoleSlug, id: string): string {
  const inbox = inboxDir(role);
  const archive = archiveDir(role);

  const files = fs.readdirSync(inbox).filter((f) => f.startsWith(`${id}-`));
  if (files.length === 0) {
    throw new Error(`No memo with ID "${id}" found in ${role} inbox`);
  }

  const fileName = files[0];
  const src = path.join(inbox, fileName);
  const dst = path.join(archive, fileName);

  fs.mkdirSync(archive, { recursive: true });
  fs.renameSync(src, dst);

  return `Archived: ${src} -> ${dst}`;
}
