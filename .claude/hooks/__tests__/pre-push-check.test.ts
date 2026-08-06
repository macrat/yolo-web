import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * `.claude/hooks/pre-push-check.sh` の傍受判定（どの Bash コマンドを
 * 「git push」とみなすか）の回帰テスト。
 *
 * なぜ試験で固定するか: この判定が壊れたときの失敗モードは
 * 「エラーを出さずにゲートが消える」で、push は素通りし、誰も気づけない。
 * 逆に広すぎれば無関係なコマンドで約7分のフルスイートが回り、
 * チェックが赤ければそのコマンド自体が exit 2 で止まる。両側とも高くつく。
 *
 * フック本体をそのまま実行してはいけない（5ゲート + e2e が走り数分かかる）。
 * そこで本体から傍受判定の部分だけを機械的に切り出して評価する。
 * 切り出しが壊れると試験が「何も検証していないのに緑」になるので、
 * 切り出しそのものにも下の guard を掛けてある（切り出せなければ落ちる）。
 */

const HOOK_PATH = join(process.cwd(), ".claude/hooks/pre-push-check.sh");

// 切り出す範囲の目印。COMMAND を読み終えた次の行から、
// 「push でなければ何もせず抜ける」判定の直前まで ＝ 傍受判定のすべて。
const START_ANCHOR =
  /^COMMAND=\$\(echo "\$INPUT" \| jq -r '\.tool_input\.command'\)$/;
const END_ANCHOR = /^if \[ "\$IS_PUSH" != 1 \]; then$/;

// 切り出した断片に必ず含まれていなければならないもの。
// 本体をリファクタして判定の一部が範囲外へ出たら、ここで落ちる。
const REQUIRED_SNIPPETS = [
  "remove_heredocs() {",
  "split_commands() {",
  "is_git_push() {",
  "ASSIGN_RE=",
  "WRAPPER_RE=",
  "OPT_RE=",
  "OPTARG_RE=",
  "TIMEARG_RE=",
  "PAREN_RE=",
  'if is_git_push "$subcmd"; then',
];

// 逆に、切り出した断片に入っていてはいけないもの。
// 入っていたら 5ゲート本体を巻き込んでおり、試験が数分かかる形になっている。
const FORBIDDEN_SNIPPETS = [
  "run_check",
  "npm run",
  "next build",
  "npx playwright",
];

// 傍受判定の中で定義される関数。フック全体でちょうど1回だけ定義され、
// かつその定義が切り出し範囲の中にあることを確かめる。
const MATCHER_FUNCTIONS = ["remove_heredocs", "split_commands", "is_git_push"];

interface Extraction {
  hookSource: string;
  region: string;
  matcherScript: string;
}

/**
 * フック本体から傍受判定の部分を機械的に切り出す。
 * 目印が見つからない・複数ある・順序が逆・中身が痩せている場合は例外を投げる
 * （＝テストが赤くなる）。黙って空を返して緑になることがないようにする。
 */
function extractMatcher(): Extraction {
  const hookSource = readFileSync(HOOK_PATH, "utf8");
  const lines = hookSource.split("\n");

  const starts = lines.flatMap((l, i) => (START_ANCHOR.test(l) ? [i] : []));
  const ends = lines.flatMap((l, i) => (END_ANCHOR.test(l) ? [i] : []));

  if (starts.length !== 1) {
    throw new Error(
      `傍受判定の開始位置を特定できません（COMMAND= の行が ${starts.length} 個）。` +
        "pre-push-check.sh を変更したなら START_ANCHOR も合わせてください。",
    );
  }
  if (ends.length !== 1) {
    throw new Error(
      `傍受判定の終了位置を特定できません（IS_PUSH の判定行が ${ends.length} 個）。` +
        "pre-push-check.sh を変更したなら END_ANCHOR も合わせてください。",
    );
  }
  const [start] = starts;
  const [end] = ends;
  if (end <= start + 1) {
    throw new Error(
      "傍受判定の範囲が空です（終了位置が開始位置より前か直後）。",
    );
  }

  const region = lines.slice(start + 1, end).join("\n");
  if (!hookSource.includes(region)) {
    throw new Error("切り出した断片が本体の文字列と一致しません。");
  }

  return {
    hookSource,
    region,
    // 本体の COMMAND は hook の stdin(JSON) 由来。試験では第1引数で差し替え、
    // 末尾に結果の出力だけを足す。判定ロジック自体は1文字も書き換えない。
    matcherScript: [
      'COMMAND="$1"',
      region,
      'if [ "$IS_PUSH" = 1 ]; then echo MATCH; else echo SKIP; fi',
    ].join("\n"),
  };
}

// NUL 区切りで受け取ったコマンドを1件ずつ切り出し済みの判定に通し、
// 結果を NUL 区切りで返す。1件ごとに別プロセスにするのは、
// 安いふるいの `exit 0` がドライバごと終わらせないようにするため。
const DRIVER = `
matcher="$1"; cases="$2"
while IFS= read -r -d '' cmd; do
  out=$(bash "$matcher" "$cmd" 2>/dev/null); rc=$?
  if [ "$rc" -ne 0 ]; then
    res="ERROR(rc=$rc)"
  else
    res=$(printf '%s' "$out" | tail -1)
    [ -z "$res" ] && res=SKIP
  fi
  printf '%s\\0' "$res"
done < "$cases"
`;

interface Case {
  section: string;
  expect: string;
  cmd: string;
}

// tmp/ にあった92ケースの試験集をそのまま移したもの。
// 「傍受されるべきなのに素通りしていた実例」と
// 「傍受されるべきでない実例」の両方を含む。
const CASES: Case[] = [
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "cd /mnt/data/yolo-web\ngit push",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "npm run format\ngit add .\ngit push",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "echo done\ngit push origin main",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: 'if [ -z "$x" ]; then git push; fi',
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "for i in 1; do git push; done",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "GIT_TRACE=1 git push",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: 'GIT_SSH_COMMAND="ssh -v" git push',
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "time git push",
  },
  {
    section: "レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "nohup git push",
  },
  {
    section: "レビュアーが挙げた誤爆（すべて SKIP であるべき）",
    expect: "SKIP",
    cmd: 'git commit -m "サイクル完了、 push まで済ませた"',
  },
  {
    section: "レビュアーが挙げた誤爆（すべて SKIP であるべき）",
    expect: "SKIP",
    cmd: 'git log --oneline -5\necho "next step is push"',
  },
  { section: "従来からの基本ケース", expect: "MATCH", cmd: "git push" },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git push origin main",
  },
  { section: "従来からの基本ケース", expect: "MATCH", cmd: "git  push" },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git -C /mnt/data/yolo-web push",
  },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git -C /path push origin main",
  },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "cd /tmp && git push",
  },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git add . ; git commit -m x ; git push",
  },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git push --force-with-lease origin main",
  },
  { section: "従来からの基本ケース", expect: "MATCH", cmd: "sudo git push" },
  {
    section: "従来からの基本ケース",
    expect: "MATCH",
    cmd: "git -c user.name=x push",
  },
  { section: "従来からの基本ケース", expect: "MATCH", cmd: "git push &" },
  {
    section: "素通りすべきもの",
    expect: "SKIP",
    cmd: 'echo "remember to git push"',
  },
  { section: "素通りすべきもの", expect: "SKIP", cmd: 'git commit -m "fix"' },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "git status" },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "npm test" },
  {
    section: "素通りすべきもの",
    expect: "SKIP",
    cmd: "cat docs/how-to-git-push.md",
  },
  {
    section: "素通りすべきもの",
    expect: "SKIP",
    cmd: 'grep -r "git push" docs/',
  },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "git log --oneline" },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "git pushx" },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "echo git-push" },
  { section: "素通りすべきもの", expect: "SKIP", cmd: "./scripts/deploy.sh" },
  {
    section: "素通りすべきもの",
    expect: "SKIP",
    cmd: "git push-mirror-config",
  },
  {
    section: "素通りすべきもの",
    expect: "SKIP",
    cmd: "cat > doc.md <<EOF\ngit push origin main\nEOF",
  },
  { section: "追加の境界ケース", expect: "MATCH", cmd: "VAR='a b' git push" },
  {
    section: "追加の境界ケース",
    expect: "MATCH",
    cmd: "env GIT_TRACE=1 git push",
  },
  { section: "追加の境界ケース", expect: "MATCH", cmd: "git --no-pager push" },
  {
    section: "追加の境界ケース",
    expect: "MATCH",
    cmd: "while :; do git push; break; done",
  },
  {
    section: "追加の境界ケース",
    expect: "SKIP",
    cmd: 'git commit -m "fix (push later)"',
  },
  {
    section: "追加の境界ケース",
    expect: "SKIP",
    cmd: 'echo "$(cat notes.md | grep push)"',
  },
  { section: "追加の境界ケース", expect: "SKIP", cmd: "git remote -v" },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "if git push; then echo ok; fi",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "while ! git push; do sleep 1; done",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "until git push; do sleep 1; done",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "! git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "if false; then :; elif git push; then echo ok; fi",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "timeout 300 git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "exec git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "xargs git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: 'bash -c "git push"',
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "sh -c 'git push'",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "/usr/bin/git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "git push&",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "sleep 1 & git push",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "git \\\npush origin main",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "git push \\\norigin main",
  },
  {
    section: "2巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "until git push; do git pull --rebase; done",
  },
  {
    section: "誤爆していないこと（2巡目レビュアー指摘）",
    expect: "SKIP",
    cmd: 'git commit -m "hook: `git push` を分解方式で判定"',
  },
  {
    section: "誤爆していないこと（2巡目レビュアー指摘）",
    expect: "SKIP",
    cmd: 'git commit -m "fix (git push) の判定"',
  },
  {
    section: "誤爆していないこと（2巡目レビュアー指摘）",
    expect: "SKIP",
    cmd: 'git commit -m "$(cat <<EOF\nlint && git push を通した\nEOF\n)"',
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "(git push)",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "(cd /repo && git push)",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "eval git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: 'eval "git push"',
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "env -i git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "sudo -u me git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "xargs -n1 git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "timeout --foreground 300 git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: 'bash -lc "git push"',
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "nice git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "stdbuf -o0 git push",
  },
  {
    section: "3巡目レビュアーが挙げた取りこぼし（すべて MATCH であるべき）",
    expect: "MATCH",
    cmd: "setsid git push",
  },
  {
    section: "括弧を足しても誤爆していないこと",
    expect: "SKIP",
    cmd: 'git commit -m "直した (git push)"',
  },
  {
    section: "括弧を足しても誤爆していないこと",
    expect: "SKIP",
    cmd: 'git commit -m "fix (push later)"',
  },
  {
    section: "括弧を足しても誤爆していないこと",
    expect: "SKIP",
    cmd: 'echo "(git push)" >> notes.md',
  },
  {
    section: "値付きオプションのラッパー",
    expect: "MATCH",
    cmd: "xargs -n 1 git push",
  },
  {
    section: "値付きオプションのラッパー",
    expect: "MATCH",
    cmd: "timeout -k 30 600 git push",
  },
  {
    section: "値付きオプションのラッパー",
    expect: "MATCH",
    cmd: "env -u FOO git push",
  },
  {
    section: "値付きオプションのラッパー",
    expect: "SKIP",
    cmd: "sudo -u me npm run deploy-push",
  },
  {
    section: "4巡目: コマンド置換",
    expect: "MATCH",
    cmd: "out=$(git push 2>&1)",
  },
  {
    section: "4巡目: コマンド置換",
    expect: "MATCH",
    cmd: 'echo "$(git push)"',
  },
  { section: "4巡目: コマンド置換", expect: "MATCH", cmd: "$(git push)" },
  {
    section: "4巡目: コマンド置換",
    expect: "SKIP",
    cmd: "SHA=$(git rev-parse HEAD); echo push",
  },
  {
    section: "4巡目: コマンド置換",
    expect: "SKIP",
    cmd: "git log --format=$(echo push)",
  },
  {
    section: "4巡目: コマンド置換",
    expect: "SKIP",
    cmd: 'git commit -m "hook: `git push` を直した"',
  },
  {
    section: "4巡目: コマンド置換",
    expect: "SKIP",
    cmd: 'echo "remember to git push"',
  },
  {
    section: "4巡目: コマンド置換",
    expect: "SKIP",
    cmd: "git config push.default",
  },
  {
    section: "5巡目: 取りこぼしと明記した形（コメントの記述と一致すること）",
    expect: "SKIP",
    cmd: "git -C $(pwd) push",
  },
  {
    section: "5巡目: 取りこぼしと明記した形（コメントの記述と一致すること）",
    expect: "SKIP",
    cmd: 'git -C "$(pwd)" push',
  },
  {
    section: "5巡目: 取りこぼしと明記した形（コメントの記述と一致すること）",
    expect: "SKIP",
    cmd: "git --git-dir=$(pwd)/.git push",
  },
  {
    section: "5巡目: 取りこぼしと明記した形（コメントの記述と一致すること）",
    expect: "SKIP",
    cmd: "GIT_SSH_COMMAND=$(which ssh) git push",
  },
  {
    section: "5巡目: 過剰傍受と明記した形（MATCH＝誤爆するが安全側）",
    expect: "MATCH",
    cmd: "git commit -m 'TODO: $(git push) を実行'",
  },
];

function runAll(matcherScript: string, cases: Case[]): string[] {
  const dir = mkdtempSync(join(tmpdir(), "pre-push-matcher-"));
  const matcherPath = join(dir, "matcher.sh");
  const casesPath = join(dir, "cases.bin");
  writeFileSync(matcherPath, matcherScript);
  writeFileSync(
    casesPath,
    Buffer.concat(cases.map((c) => Buffer.from(c.cmd + "\0", "utf8"))),
  );

  const stdout = execFileSync(
    "bash",
    ["-c", DRIVER, "--", matcherPath, casesPath],
    {
      encoding: "utf8",
      timeout: 120_000,
    },
  );
  const results = stdout.split("\0");
  results.pop(); // 末尾の NUL のあとの空要素
  if (results.length !== cases.length) {
    throw new Error(
      `判定結果の件数が合いません（期待 ${cases.length} / 実際 ${results.length}）。`,
    );
  }
  return results;
}

describe("pre-push-check.sh の切り出し", () => {
  let extraction: Extraction;

  beforeAll(() => {
    extraction = extractMatcher();
  });

  it("フック本体から傍受判定を切り出せる", () => {
    expect(extraction.region.split("\n").length).toBeGreaterThan(50);
  });

  it.each(REQUIRED_SNIPPETS)("切り出した断片に %s が含まれる", (snippet) => {
    expect(extraction.region).toContain(snippet);
  });

  it.each(FORBIDDEN_SNIPPETS)("切り出した断片に %s が含まれない", (snippet) => {
    expect(extraction.region).not.toContain(snippet);
  });

  it.each(MATCHER_FUNCTIONS)(
    "%s はフック全体でちょうど1回だけ定義され、その定義が切り出し範囲にある",
    (fn) => {
      const defs = extraction.hookSource.match(
        new RegExp(`^${fn}\\(\\) \\{$`, "gm"),
      );
      expect(defs).toHaveLength(1);
      expect(extraction.region).toMatch(new RegExp(`^${fn}\\(\\) \\{$`, "m"));
    },
  );
});

describe("pre-push-check.sh の傍受判定", () => {
  let results: string[];

  beforeAll(() => {
    results = runAll(extractMatcher().matcherScript, CASES);
  }, 120_000);

  it("92ケースすべてを網羅している", () => {
    expect(CASES).toHaveLength(92);
  });

  CASES.forEach((c, i) => {
    const label = c.cmd.replace(/\n/g, "\\n");
    it(`[${c.section}] ${c.expect}: ${label}`, () => {
      expect(results[i]).toBe(c.expect);
    });
  });
});
