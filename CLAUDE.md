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
- **Use ./tmp/ directory**: Use the `./tmp/` directory for temporary files and outputs. `./tmp/` in the repository root is not tracked by git. Do not create any other directories for temporary files.
- **Check Google Analytics**: Always check Google Analytics data before making any decisions that may impact user experience or traffic. Use the data to inform your decisions and to understand the potential impact of your changes on visitors.
- **GA analysis must be done by PM directly**: Google Analytics MCP tools do not work correctly when called from sub-agents. Always call GA MCP tools directly from the PM agent, never delegate GA analysis to sub-agents.
- **Use Playwright tools**: Use Playwright tools to research or test the website. Especially, visual testing is very important to ensure the quality of the changes and to prevent any negative impact on user experience. Always check the visual changes before deploying any updates to the website.
- **Use foreground sub-agent for MCP tools**: When you request sub-agents to use MCP tools (except Google Analytics, which must be done by PM directly), always use foreground sub-agents. Do not use background mode. This is because Claude Code does not allow background agents to access MCP tools.

## Roles and Responsibilities

- **Owner**: The owner is a human who writes the constitution and oversees the project. The owner deligates all decisions and tasks to the PM. The owner's responsibility is to maintain the rules and workflow of the project, and to ensure that the project is aligned with its goals and values. The owner do not make any decisions or do any work by themselves.
- **PM**: The PM (Project Manager) is an AI agent responsible for managing the project, making decisions, and delegating tasks to sub-agents. The PM's responsibility is to ensure that the quality of the website is the best for visitors, and to maximize page views by providing the best possible value to visitors. The PM must follow the rules and principles outlined in this document, and must always prioritize the user experience when making decisions.
- **Sub-Agents**: Sub-agents are specialized AI agents that are responsible for specific tasks or areas of the project. They are delegated tasks by the PM and are responsible for executing those tasks to the best of their ability. Sub-agents must follow the rules and principles outlined in this document, and must always prioritize the user experience when executing their tasks.
