---
name: run-tests
description: Deterministic test execution with structured output reporting test count, failing test names, exit code, and summary.
---

# Run Tests Skill

## Purpose
Ensure all agents run tests consistently with the correct command, flags, and structured output parsing. Eliminates agent guesswork about test commands and produces machine-readable summaries.

## When to Use This Skill
- You are the **Test Engineer Agent** confirming tests fail or pass during TDD
- You are any **specialist agent** asked to verify tests after a change
- You need objective evidence of test status (pass/fail counts, failing names)

## How to Use This Skill

### Option 1: Run via Script
```bash
bash .github/skills/run-tests/run-tests.sh [optional-path]
```

**Arguments:**
- `[optional-path]` — optionally specify a test file or directory. Default: run all tests.

Examples:
```bash
bash .github/skills/run-tests/run-tests.sh                                     # all tests
bash .github/skills/run-tests/run-tests.sh src/services/__tests__/             # data layer tests only
bash .github/skills/run-tests/run-tests.sh src/components/compliance/__tests__/ # compliance UI tests only
```

### Option 2: Run Inline Command
```bash
npm test -- [optional-path]
```

Then parse the output yourself for:
- Total test count
- Failing test names
- Exit code
- Summary line

## Script Output Format

The `run-tests.sh` script returns structured output:

```
========================================
TEST EXECUTION REPORT
========================================
Command: npm test -- [path]
Exit Code: 0

Test Summary
────────────
Total Tests:  15
Passed:       15
Failed:       0

Failing Tests:
(none)

Summary:
✅ All tests passing.
========================================
```

Or, if tests fail:

```
========================================
TEST EXECUTION REPORT
========================================
Command: npm test -- src/components/compliance/__tests__/
Exit Code: 1

Test Summary
────────────
Total Tests:  8
Passed:       6
Failed:       2

Failing Tests:
  ❌ PriorityQueue sorts by severity
  ❌ PriorityQueue calls onSelectAccount

Summary:
⚠️ 2 test(s) failing. Review error details above.
========================================
```

## Output Parsing Guide

When you run the script or `npm test`, read the output for:

1. **Exit Code** — 0 = all pass, non-zero = failures exist
2. **Test Count** — total number of tests run (usually printed by Vitest)
3. **Failing Test Names** — exact names of failed tests
4. **Summary Line** — quick indicator (✅ or ⚠️)

### For Test Engineer Agent Only
You must explicitly state one of:
- ✅ Tests written and failing for the right reason: `[failing test name(s)]`
- ✅ All tests passing. No regressions.

Do not skip this statement. It is your gate to the next step in TDD.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `npm: command not found` | Node.js not installed or not in PATH | Install Node.js from nodejs.org; verify `node --version` |
| `npm ERR! missing: vitest` | Dependencies not installed | Run `npm install` in `aml-dashboard/` directory |
| Script hangs or no output | Test runner stalled | Press Ctrl+C; check for infinite loops in test setup |
| Exit code 0 but tests show failures | Vitest capturing but not reporting | Run `npm test -- --reporter=verbose` |

## Quality Checks Before Proceeding

After running tests:
- [ ] Exit code is 0 (for ✅ all passing) or non-zero (for ⚠️ failures)
- [ ] Test count matches your expectation (not 0 tests run)
- [ ] If expecting failures: failing test names are clearly listed
- [ ] No errors about missing files or syntax errors in test setup
- [ ] Summary line is present and accurate

If any check fails, re-run with verbose flags:
```bash
npm test -- --reporter=verbose
```

## Integration with Agents

- **Test Engineer Agent**: Run before/after every code change. Always state the explicit gate message.
- **Compliance UI Agent**: Run after changes to verify no regressions in compliance components.
- **Data Layer Agent**: Run after changes to verify service and hook logic.
- **PM Agent**: Run via this skill to collect test metrics for project state summary.

