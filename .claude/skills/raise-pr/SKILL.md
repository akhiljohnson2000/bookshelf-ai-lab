---
name: raise-pr
description: Take the current feature branch from code to a GitHub pull request — gate on lint/typecheck/test, run an AI code review, then commit, push, and open the PR via the GitHub MCP. Use when asked to raise/open a PR, ship a branch, or run the PR workflow.
---

# Raise a pull request (BookShelf)

Drive a branch from working changes to an open PR, with quality gates first.
This is a **sequential pipeline** — do NOT parallelise the commit/push/PR steps.
Only the pre-flight *checks* run concurrently.

## When to use
- "Raise a PR", "open a PR for this branch", "run the PR workflow", "ship this feature".

## Preconditions
- A feature branch is checked out with the change to ship.
- GitHub MCP is authenticated (PAT in `.env`; verify with `mcp__github__list_commits`).
- Know the **base branch** — for a focused PR use the branch the feature was cut from
  (e.g. `day3`), NOT `main` if `main` is far behind.

## Steps (in order — a failure at any gate STOPS the pipeline)

### 1. Pre-flight gate (checks run in parallel; ALL must pass)
Run concurrently as plain shell (no sub-agents needed):
- `npm run lint`
- `npx tsc -p apps/api/tsconfig.json --noEmit` (compile/typecheck)
- `npm test` (Vitest)

If any fails → **STOP**, report the failure, fix, re-run. Never commit on a red gate.

### 2. AI code review
Run `/code-review` on the diff (`git diff <base>...HEAD` + working tree). Triage findings:
- Fix CONFIRMED correctness issues before committing.
- Surface the rest for the human (see step 3).
- Adding/repairing tests for a real gap counts as a fix, not scope creep.

### 3. Human review checkpoint
Present the diff summary + the AI findings (useful vs noise) to the user. **Do not push
without their go-ahead.** This is the "AI first pass, human decides" principle.

### 4. Commit (scoped)
Stage ONLY the files that belong to this feature — keep tooling/docs/unrelated changes
out of the PR. Use a clear conventional message:
```
<type>(<scope>): <summary>

<what changed and why, 1-3 lines>
```
e.g. `feat(api): add GET /api/books/:id/rating`.

### 5. Push
`git push -u origin <branch>` (uses existing git credentials).

### 6. Open the PR via GitHub MCP
`mcp__github__create_pull_request` with `owner`, `repo`, `base` (the chosen base branch),
`head` (the feature branch), `title`, and a `body` filled from the template below.
Return the PR URL.

## PR description template
```markdown
## Summary
<1-2 sentences: what this PR adds and why>

## Changes
- <file/area>: <what changed>

## API (if applicable)
`<METHOD> <path>` → `<response shape>` · errors: <codes>

## Testing
- [ ] lint  - [ ] typecheck  - [ ] unit tests
<what scenarios are covered>

## Notes / follow-ups
<edge cases, known limitations, anything for the reviewer>
```

## Constraints
- Sequential: commit → push → PR. Parallelise only the step-1 checks.
- Never push on a failed gate or without the human checkpoint.
- Scope the commit — one feature per PR; leave unrelated files unstaged.
- Use the chosen base branch (not `main`) when `main` is behind.
- No new npm dependencies without discussing first.

## Optional user instructions
$ARGUMENTS
