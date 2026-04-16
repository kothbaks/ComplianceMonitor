---
mode: test-engineer
tools:
  - read
  - write
  - terminal
  - search
reference_agents:
  - test-engineer
---

# TDD Loop Workflow Prompt

## Overview
This is the strict test-driven development sequence for the Test Engineer Agent. Every task goes through this exact workflow. No deviations. No production code before failing tests.

## The Six-Step TDD Loop

### Step 1 — Understand the Requirements
**Input:** A backlog item with Title, Description, Acceptance Criteria, TDD Plan, File Scope.

**Actions:**
- [ ] Read the backlog item completely
- [ ] Read the files listed in "File Scope" to understand current state
- [ ] Search for related tests that already exist
- [ ] Identify the exact behavior you need to drive via tests

**Output:** Clear understanding of what code needs to change and why.

**Example:**
> "BacklogItem: Implement PriorityQueue component
> 
> Acceptance Criteria: PriorityQueue renders sorted list by severity, CRITICAL first
> 
> TDD Plan:
> 1. Test: PriorityQueue sorts by severity (CRITICAL first)
> 2. Test: PriorityQueue secondary-sorts by confidence when severity equal
> 3. Test: PriorityQueue renders empty state
> 4. Test: PriorityQueue calls onSelectAccount when clicked"

---

### Step 2 — Write Failing Tests
**Input:** Clear behavior requirements and test names from TDD Plan.

**Actions:**
- [ ] Create test file (or add to existing) at the correct path:
  - `src/services/__tests__/[name].test.js` for service tests
  - `src/hooks/__tests__/[name].test.js` for hook tests
  - `src/components/[section]/__tests__/[Component].test.js` for component tests
- [ ] Write ALL test cases from the TDD Plan
- [ ] Write test names exactly as listed in TDD Plan
- [ ] Use the project's test setup (Vitest + React Testing Library)
- [ ] Use mock data from `data/` fixtures or create minimal test doubles
- [ ] Do NOT write any production code yet
- [ ] Do NOT skip any test case

**Test Structure Template (Vitest + RTL):**
```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityQueue } from '../PriorityQueue';

describe('PriorityQueue', () => {
  it('sorts by severity (CRITICAL first)', () => {
    const accounts = [
      { accountId: '1', amlFlags: [{ severity: 'MEDIUM' }] },
      { accountId: '2', amlFlags: [{ severity: 'CRITICAL' }] },
    ];
    render(<PriorityQueue accounts={accounts} />);
    const rows = screen.getAllByRole('row');
    expect(rows[0]).toHaveTextContent('account-2'); // CRITICAL first
  });

  it('renders empty state when no accounts', () => {
    render(<PriorityQueue accounts={[]} />);
    expect(screen.getByText(/no flagged accounts/i)).toBeInTheDocument();
  });

  // ... more tests
});
```

**Output:** Test file with all TDD Plan tests written but failing.

---

### Step 3 — Confirm Tests Fail for the Right Reason
**Input:** Test file written but not yet passing.

**Actions:**
- [ ] Run tests: `npm test -- [test-file-path]`
- [ ] Read the test output carefully
- [ ] Verify each test fails for the correct reason, NOT:
  - ❌ Import error (missing module)
  - ❌ Syntax error (typo in test code)
  - ❌ Wrong path (component doesn't exist yet)
  - ✅ Expected error (component doesn't exist yet, assertion fails)

**If tests fail for the wrong reason:**
- Fix the test scaffolding (imports, syntax, paths)
- Re-run and verify again
- Do NOT proceed until failures are correct

**Gate Statement (MANDATORY):**
Once you have confirmed all tests fail for the right reason, you MUST explicitly state:

```
✅ Tests written and failing for the right reason: [list failing test names]
```

Example:
```
✅ Tests written and failing for the right reason:
  - PriorityQueue sorts by severity
  - PriorityQueue secondary-sorts by confidence
  - PriorityQueue renders empty state
  - PriorityQueue calls onSelectAccount
```

**Do not proceed to Step 4 until this statement is made.**

**Output:** Confirmed failing tests with explicit gate statement.

---

### Step 4 — Implement Production Code
**Input:** Confirmed failing tests and gate statement.

**Actions:**
- [ ] Create production file (or edit existing) at the correct path matching File Scope
- [ ] Write the minimum code needed to make the tests pass
- [ ] Do not write more than the tests require
- [ ] Do not refactor yet
- [ ] Follow project conventions:
  - Named exports only
  - Tailwind classes for UI (no inline styles)
  - JSDoc for exported functions
  - Functional components, pure functions
- [ ] Do not modify files outside the stated File Scope

**Example Implementation (Minimal):**
```javascript
/**
 * PriorityQueue — Display flagged accounts ranked by risk.
 */
export function PriorityQueue({ accounts = [] }) {
  if (accounts.length === 0) {
    return <div>No flagged accounts.</div>;
  }

  const sorted = [...accounts].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sevA = severityOrder[a.amlFlags[0]?.severity] ?? 99;
    const sevB = severityOrder[b.amlFlags[0]?.severity] ?? 99;
    if (sevA !== sevB) return sevA - sevB;
    return (b.amlFlags[0]?.confidenceScore ?? 0) - (a.amlFlags[0]?.confidenceScore ?? 0);
  });

  return (
    <table>
      {sorted.map(acc => (
        <tr key={acc.accountId} onClick={() => onSelectAccount(acc.accountId)}>
          <td>{acc.customerName}</td>
        </tr>
      ))}
    </table>
  );
}
```

**Output:** Minimal production code that makes tests pass.

---

### Step 5 — Confirm All Tests Pass (Green)
**Input:** Production code written.

**Actions:**
- [ ] Run tests: `npm test -- [test-file-path]`
- [ ] Verify all tests pass (green, exit code 0)
- [ ] Verify no regressions in related tests: `npm test`
- [ ] Read the test output and note all passing counts

**Gate Statement (MANDATORY):**
Once all tests pass, you MUST explicitly state:

```
✅ All tests passing. No regressions.
```

**Output:** All tests passing with gate statement.

---

### Step 6 — Report and Refactor (Optional)
**Input:** All tests passing.

**Actions:**
- [ ] Optional: refactor code for clarity (only if tests still pass)
- [ ] Do not add new features
- [ ] Run tests after any refactoring to confirm no breakage

**Final Report:**
Return a concise test report with:
- Test file(s) created or modified
- Production file(s) changed
- Test cases added (count)
- Final pass/fail: `[N] tests passing, 0 failures`
- Any follow-up items or blockers for other specialists

**Example Report:**
```
## Test Report: PriorityQueue Component

**Test File:**
- `src/components/compliance/__tests__/PriorityQueue.test.js` (created)

**Production File:**
- `src/components/compliance/PriorityQueue.jsx` (created)

**Test Cases:**
1. ✅ PriorityQueue sorts by severity (CRITICAL first)
2. ✅ PriorityQueue secondary-sorts by confidence
3. ✅ PriorityQueue renders empty state
4. ✅ PriorityQueue calls onSelectAccount on click

**Result:**
✅ 4 tests passing, 0 failures

**Follow-up:**
- Component needs integration test with AccountActionPanel (refer to Compliance UI Agent)
```

---

## Mandatory Rules

1. **Never skip a step** — Each step must complete before the next begins
2. **Always state the gate messages** — "Tests written and failing..." and "All tests passing..." are non-negotiable
3. **Never write production code before Step 3 gate** — No exceptions
4. **Never skip test confirmation** — Always run tests and verify output
5. **Stay within File Scope** — Do not modify files outside the stated scope
6. **Use project conventions** — Follow Tailwind, named exports, JSDoc, functional style
7. **Keep tests focused** — One test case per behavior, not multiple assertions per test

---

## Troubleshooting

| Symptom | Action |
|---|---|
| Test fails but I don't know why | Read the full error message; check for import/syntax errors in test file |
| All tests pass on first run | You wrote code in Step 2; redo the test file to be failing |
| Tests fail after implementing | You implemented too much or the wrong behavior; review the TDD Plan and simplify |
| No test files created | Verify the correct path before running; check file system permissions |
| `npm test` command fails | Ensure you're in `aml-dashboard/` directory; verify `npm install` completed |

---

## Reference
- `.github/skills/run-tests/SKILL.md` — how to use the test-running script
- `aml-dashboard/vitest.config.js` — test runner configuration
- `aml-dashboard/test-setup.js` — global test setup (imports, mocks)
- React Testing Library docs: https://testing-library.com/react
- Vitest docs: https://vitest.dev

