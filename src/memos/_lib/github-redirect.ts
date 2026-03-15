// The commit hash at which memo files were archived in the repository.
// Used to construct permanent GitHub links to the archived memo files.
export const MEMO_COMMIT_HASH = "6f35080";

const GITHUB_REPO_BASE = "https://github.com/macrat/yolo-web";

/** URL of the memo directory listing at the archived commit. */
export const GITHUB_MEMO_LIST_URL = `${GITHUB_REPO_BASE}/tree/${MEMO_COMMIT_HASH}/memo`;

/**
 * Build a GitHub blob URL for a specific memo file.
 *
 * @param filePath - The relative path stored in memo-path-map.json,
 *   e.g. "memo/agent/archive/19c54f3a6a0-bootstrap-instructions.md"
 */
export function buildGitHubMemoFileUrl(filePath: string): string {
  return `${GITHUB_REPO_BASE}/blob/${MEMO_COMMIT_HASH}/${filePath}`;
}
