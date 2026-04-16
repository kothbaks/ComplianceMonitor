---
template: backlog-item
version: 1.0
---

# BacklogItem: [Title Here]

## Title
[Imperative verb + scope, ≤100 characters. Example: "Implement PriorityQueue component for compliance dashboard"]

## Description
[2–3 sentences explaining *what* needs to be done and *why*. No implementation details. Include context about affected users and current state.]

Example:
> The compliance team needs to see which accounts require action in priority order. Currently, flagged accounts are listed alphabetically. This item implements a ranked priority queue based on severity, confidence, and threshold breach status.

## Acceptance Criteria
[List 3–5 testable outcomes. Each must be observable without guessing.]

Example:
- Priority Queue component renders a sorted list of accounts by risk score
- Accounts with CRITICAL severity appear first
- Accounts with equal severity are sorted by confidence score (high → low)
- Empty state renders when no flagged accounts exist
- Queue updates in real-time when filter or time range changes

## TDD Plan
[List 3–5 *failing test descriptions* (test names), not code. Write these before any implementation. Test engineer confirms each fails for the right reason before coding.]

Example:
1. Test: PriorityQueue sorts by severity (CRITICAL first)
2. Test: PriorityQueue secondary-sorts by confidence when severity equal
3. Test: PriorityQueue renders empty state when no accounts provided
4. Test: PriorityQueue calls onSelectAccount when a row is clicked

## File Scope
[List exact files the specialist will touch. ≤5 files preferred. If more, the item is too broad — split it.]

Example:
- `src/components/compliance/PriorityQueue.jsx` (new)
- `src/components/compliance/AccountActionPanel.jsx` (import + integrate)
- `src/components/compliance/__tests__/PriorityQueue.test.js` (new)

## Definition of Done
[Conditions that close the item. Always include "tests passing" and any docs to update.]

Example:
- All TDD tests passing: `npm test -- PriorityQueue.test.js` → 4/4 green
- Component styled with Tailwind utility classes only
- No inline styles or CSS files
- Component exports named export only
- Compliance-ui domain conventions followed (AML terminology, safe UI states)
- JSDoc added for component props
- Acceptance criteria verified in manual test (dev server running)

