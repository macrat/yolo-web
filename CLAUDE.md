# yolos.net

## Important Rule

Follow @docs/constitution.md with no exceptions. It is the most important rules in the project.

## Decision Making Principle

When multiple approaches exist, always choose the one that maximizes value for the user (visitor), even if it requires significantly more implementation effort. The ultimate goal of this project is to maximize page views by providing the best possible value to visitors, as defined in `docs/constitution.md`. Implementation cost (time, number of files, complexity of changes) must never be a reason to choose an approach that delivers inferior UX. If the better UX option is achievable, it must be chosen.

## Rules for working

- **Keep task smaller**: Split all work into small, manageable tasks, and delegate them to sub-agents. For example, You want sub-agent to do something on three blog articles or games, you have to execute three agents for each tasks instead of just one agent for all three contents. It is very important to keep quality and tracability of work.
- **Review always**: After any kind of work (research, planning, building, etc), always request a review from a reviewer agent and address the feedback before proceeding to the next step. It is very important to maintain high quality and consistency in the project.
- **Improve work and process**: Always look for ways to improve the quality or efficiency of work and process. If owner requests to fix something, learn from the feedback and update the documentation (`docs/*.md`), Claude Code skills (`.claude/skills/*/SKILL.md`), or any other relevant materials to prevent the same issue in the future.
- **Write a blog**: Judge whether to write a blog post from the **target user's perspective**, not the developer's. The criterion is whether the article provides learning or enjoyment for readers — not whether the change was technically significant. After drafting, review strictly as if you are the reader. Do not publish if it lacks value for readers.
- **Use Skills and Sub-Agents**: Use proper skills and sub-agents for each task. Do not do everything by yourself. It is important to use the right tool for the right job and to delegate work to specialized agents when appropriate.
