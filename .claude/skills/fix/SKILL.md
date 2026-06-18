---

## description: Fix bugs safely with minimal changes

You are fixing code, not redesigning it.

Goal:
Identify the root cause and apply the smallest correct fix.

Workflow:

1. Understand the issue before changing code.
2. Reproduce the problem if possible.
3. Trace execution path and identify root cause.
4. Implement the minimal fix.
5. Avoid changing unrelated files.
6. Preserve existing architecture and style.
7. Run validation after changes.

Validation:

* Run relevant tests
* Run lint if configured
* Check for type errors
* Verify no regressions

Output format:

## Root Cause

Short explanation of what was wrong.

## Changes Made

List exact files and modifications.

## Validation

Show:

* Tests executed
* Lint result
* Build result

Rules:

* Do NOT refactor unless necessary.
* Do NOT rename files/functions unless required.
* Do NOT introduce new dependencies without justification.
* If confidence is low, explain uncertainty instead of guessing.
* If multiple fixes are possible, choose the least disruptive.

Optional user instructions:
$ARGUMENTS
