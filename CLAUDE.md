# yolos.net

## Important Rule

Follow @docs/constitution.md with no exceptions. It is the most important rules in the project.

## Decision Making Principle

When multiple approaches exist, always choose the one that maximizes value for the user (visitor), even if it requires significantly more implementation effort. The ultimate goal of this project is to maximize page views by providing the best possible value to visitors, as defined in `docs/constitution.md`. Implementation cost (time, number of files, complexity of changes) must never be a reason to choose an approach that delivers inferior UX. If the better UX option is achievable, it must be chosen.

## Rules for working

- **Use memo**: Save memo for every task, such as research, planning, building, and reviewing. Memos are the only way to communicate between agents and track work. Memos are very important for project progress and quality. Whenever you communicate with other agents, always use memo to request work or report results. Do not start agents without memo.
- **Keep task smaller**: Split all work into small, manageable tasks, and delegate them to sub-agents. For example, You want sub-agent to do something on three blog articles or games, you have to execute three agents for each tasks instead of just one agent for all three contents. It is very important to keep quality and tracability of work.
- **Review always**: After any kind of work (research, planning, building, etc), always request a review from a reviewer agent and address the feedback before proceeding to the next step. It is very important to maintain high quality and consistency in the project.
- **Improve work and process**: Always look for ways to improve the quality or efficiency of work and process. If owner requests to fix something, learn from the feedback and update the documentation (`docs/*.md`), Claude Code skills (`.claude/skills/*/SKILL.md`), or any other relevant materials to prevent the same issue in the future.
- **Write a blog**: Judge whether to write a blog post from the **target user's perspective**, not the developer's. The criterion is whether the article provides learning or enjoyment for readers — not whether the change was technically significant. After drafting, review strictly as if you are the reader. Do not publish if it lacks value for readers.
- **Use Skills and Sub-Agents**: Use proper skills and sub-agents for each task. Do not do everything by yourself. It is important to use the right tool for the right job and to delegate work to specialized agents when appropriate.

## Memo

Memo is a communication way between owner-agent and between agents. It is also a way to track work and decisions.

Memo has three states: `inbox`, `active`, and `archive`:

- `inbox`: New memos that have not been processed yet. You need to triage them by reading and mark them as `active` or `archive`.
- `active`: Memos that are currently being worked on. You need to move them to `archive` when the task is completed.
- `archive`: Memos that are completed or no longer relevant. They are kept for record and reference.

You can manage memos using `npm run memo` command:

```
npm run memo -- list --state inbox
npm run memo -- list --state all --limit 100    # increase result limit (default: 10)
npm run memo -- list --state all --tag cycle-66  # filter by tag
npm run memo -- read ${memo_id}...
npm run memo -- mark ${state} ${memo_id}...
echo "${body}" | npm run memo -- create ${from} ${to} ${subject} --tags ${tags} --reply-to ${memo_id}
```

The `from` and `to` fields are agent names such as `pm`, `researcher`, `planner`, `builder`, and `reviewer`.
The `owner` is a special name for the project owner (the user, not an AI agent).

### Searching memos

- **Full-text search**: Use the Grep tool on the `memo/` directory to search memo contents directly (e.g., `Grep pattern="匿名" path="memo/"`). This is much faster than reading memos one by one.
- **List with more results**: The `list` command defaults to 10 results. Use `--limit 50` or `--limit 100` to see more.
- **Filter by tag**: Use `--tag <tag>` to narrow results. Tags use AND logic when repeated.
