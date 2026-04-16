---
name: create-backlog-item
description: Canonical structure for elaborating backlog items with acceptance criteria, TDD plan, file scope, and definition of done.
---

# Create Backlog Item Skill

## Purpose
Ensure every backlog item follows the same structure, regardless of which agent creates it. This skill eliminates guesswork and provides specialists with clear, actionable tasks.

## When to Use This Skill
- You are the **Project Manager Agent** elaborating items from `developer_todo.md`
- You are **any specialist agent** asked to suggest a new backlog item
- You need to decompose a complex task into smaller, focused items

## How to Use This Skill

1. **Load the template** — Open `backlog-item-template.md` in this directory.
2. **Fill in each section** — Complete all required fields. Do not skip or simplify sections.
3. **Apply the constraints**:
   - **Title**: imperative, ≤100 characters, scoped to one domain
   - **Description**: plain language; explain *what* and *why*, not *how*
   - **Acceptance Criteria**: 3–5 observable, testable outcomes
   - **TDD Plan**: 3–5 failing test descriptions (test-first names, not code)
   - **File Scope**: list only the files the specialist will touch; ≤5 files preferred
   - **Definition of Done**: conditions that close the item (code review, tests passing, docs updated, etc.)
4. **Return the filled template** — Paste the complete item into your planning output or paste it into `developer_todo.md` as a new subsection.

## Quality Checks Before Returning
- [ ] Title is clear and imperative (starts with verb when possible)
- [ ] Description fits in 2–3 sentences; no vague language like "improve" or "fix"
- [ ] Each Acceptance Criterion is testable without requiring the reader to guess
- [ ] TDD Plan lists *failing test names*, not implementation details
- [ ] File Scope ≤5 files; if more files, the item is too broad — split it
- [ ] Definition of Done includes "tests passing" and specifies any docs to update
- [ ] The item can be completed by a single specialist in one session (~2–4 hours)

## Example: Well-Formed Item

```markdown
## BacklogItem: Add Real-Time Alert Component

**Title**  
Implement ThresholdBreachAlert component for compliance dashboard

**Description**  
The compliance team needs a visual alert when an account's transaction total crosses €10,000 within 24 hours. This alert must appear in the AccountActionPanel and drive the priority queue ranking. Currently, threshold breaches are detected but not surfaced in the UI.

**Acceptance Criteria**
- ThresholdBreachAlert component renders when an account breaches €10,000 threshold
- Alert displays threshold, current amount, and time window
- Clicking alert navigates to transaction detail view for that window
- Alert does not appear for non-breaching accounts

**TDD Plan**
1. Test: ThresholdBreachAlert renders with correct threshold and amount when breached
2. Test: ThresholdBreachAlert renders nothing when threshold not breached
3. Test: Clicking alert triggers navigation callback
4. Test: Empty state renders when no breach data provided

**File Scope**
- `src/components/compliance/ThresholdBreachAlert.jsx` (new)
- `src/components/compliance/AccountActionPanel.jsx` (import + render)
- `src/components/compliance/__tests__/ThresholdBreachAlert.test.js` (new)

**Definition of Done**
- Tests passing: `npm test` reports 4/4 green
- Component styled with Tailwind only
- No production code written before tests confirmed failing
- Compliance-ui instructions followed
```

## When the Item is Complete
A backlog item is **closed** when:
1. All tests pass
2. All acceptance criteria are observable and met
3. File scope was not exceeded (specialist stayed within listed files)
4. Definition of Done conditions are satisfied (code review, docs, tests)

If an item reveals a gap (e.g., data layer needs changes), stop and create a separate item for that gap. Do not merge unrelated work.

