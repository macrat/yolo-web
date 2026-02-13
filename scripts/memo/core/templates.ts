import type { TemplateType } from "../types.js";

const TEMPLATES: Record<TemplateType, string> = {
  task: `
## Context
<why this exists; link to related memo ids; relevant repo paths>

## Request
<what to do>

## Acceptance criteria
- [ ] <objective check>
- [ ] <objective check>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
- <other constraints>

## Notes
<risks, assumptions, options>
`,

  reply: `
## Summary
<what you did / found>

## Results
<details>

## Next actions
<what should happen next, if anything>
`,

  research: `
## Context
<why this research is needed>

## Questions
- <question to answer>

## Investigated paths
- <repo paths checked>

## External sources
- <URLs or references, if any>

## Findings
<details>

## Confidence & unknowns
- Confidence: <high/medium/low>
- Unknowns: <list>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,

  planning: `
## Context
<why this plan is needed>

## Goal
<what the plan achieves>

## Scope Boundaries
**In scope:**
- <item>

**Out of scope:**
- <item>

## Plan
### Step 1: <title>
- <details>

## Acceptance criteria
- [ ] <objective check>

## Required artifacts
- <docs/config/code>

## Rollback approach
<conceptual rollback strategy>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).

## Notes
<risks, assumptions, options>
`,

  implementation: `
## Context
<why this implementation is needed; link to plan memo>

## Exact scope
- <what to implement>

## Files to change
- <file path and description>

## Acceptance criteria
- [ ] <objective check>

## Do-not-change list
- <files/areas that must not be modified>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).

## Notes
<risks, assumptions, options>
`,

  review: `
## Context
<what was changed and why>

## Changes
- <commit ref or file list>

## Review focus areas
- <area to pay attention to>

## Acceptance criteria checklist
- [ ] <check>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,

  process: `
## Observed inefficiency
<what coordination problem was noticed>

## Proposed change
<what to change in the process>

## Trade-offs
- Pro: <benefit>
- Con: <cost>

## Rollout & revert plan
- Rollout: <how to deploy the change>
- Revert: <how to undo the change>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,
};

/**
 * Get the body template for a given memo type.
 */
export function getTemplate(type: TemplateType): string {
  return TEMPLATES[type];
}
