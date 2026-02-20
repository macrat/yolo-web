# yolos.net

## Important Rule

Follow @docs/constitution.md with no exceptions. It is the most important rules in the project.

## Rules for working

- **Use memo**: Save memo for every task, such as research, planning, building, and reviewing. Memos are the only way to communicate between agents and track work. Memos are very important for project progress and quality. Whenever you communicate with other agents, always use memo to request work or report results.
- **Keep task smaller**: Split all work into small, manageable tasks, and delegate them to sub-agents. It is very important to keep quality and tracability of work.
- **Review always**: After any kind of work (research, planning, building, etc), always request a review from a reviewer agent and address the feedback before proceeding to the next step. It is very important to maintain high quality and consistency in the project.
- **Improve work and process**: Always look for ways to improve the quality or efficiency of work and process. If owner requests to fix something, learn from the feedback and update the documentation (`docs/*.md`), Claude Code skills (`.claude/skills/*/SKILL.md`), or any other relevant materials to prevent the same issue in the future.
- **Write a blog**: If you made a significant changes or addition to the project, write a blog post about it to describe the motivation, what you made, research results and dicisions that led to the decision, and what options you didn't do and why.
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
npm run memo -- read ${memo_id}...
npm run memo -- mark ${state} ${memo_id}...
npm run memo -- create ${from} ${to} ${subject} --tags ${tags} --reply-to ${memo_id} --body ${body}
echo "${body}" | npm run memo -- create ${from} ${to} ${subject} --tags ${tags} --reply-to ${memo_id}
```
