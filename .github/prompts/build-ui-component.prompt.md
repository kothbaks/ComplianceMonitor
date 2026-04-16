---
mode: compliance-ui
tools:
  - read
  - write
  - search
reference_agents:
  - compliance-ui
  - data-layer
---

# Build UI Component Workflow Prompt

## Overview
You are building a React component for the compliance dashboard that is wired to the data layer, handles loading/error/empty states, and follows AML domain conventions (severity colors, action labels, Tailwind styling).

## Component Lifecycle
1. Component receives data or connects to hooks
2. Component renders loading spinner while data loads
3. Component renders empty state if no data
4. Component renders error banner if error occurs
5. Component renders full content with user interactions once data loads

## Step 1 — Understand Requirements
Read the backlog item and answer:

- [ ] What is the component's responsibility? (e.g., "Display priority queue of flagged accounts")
- [ ] What data does it need? (e.g., "list of accounts with AML flags, severity, confidence scores")
- [ ] What are the loading/empty/error states?
- [ ] What user interactions does it need? (e.g., "click to view details", "sort by severity")
- [ ] Does it have child components?

Read existing compliance components to understand patterns:
- [ ] Open `aml-dashboard/src/components/compliance/*.jsx` — note naming, imports, structure
- [ ] Read `aml-dashboard/src/context/AppContext.jsx` — understand data context shape
- [ ] Read `aml-dashboard/src/hooks/*.js` — understand available hooks

## Step 2 — Design Component Props and States
Document the component contract:

**Props:**
- List inputs the component receives (e.g., `accounts`, `onSelectAccount`, `sortBy`)
- Mark each as required or optional
- Note type (Array, Function, String, Enum)

**Internal State (if using useState):**
- Only for UI state (e.g., sort order, filter selection), not data state
- Data state comes from props or hooks

**Example:**
```javascript
/**
 * PriorityQueue — Display flagged accounts ranked by risk.
 * @param {Array<Account>} accounts - accounts with AML flags
 * @param {Function} onSelectAccount - callback when row clicked
 * @param {string} sortBy - sort field: 'severity' | 'confidence' | 'detectedAt'
 */
```

## Step 3 — Plan Safe UI States
Define how the component renders in each state:

**Loading State:**
- Display `<LoadingSpinner />` from `aml-dashboard/src/components/common/LoadingSpinner.jsx`
- Brief message: "Loading priority queue..."

**Empty State:**
- Display `<EmptyState />` from `aml-dashboard/src/components/common/EmptyState.jsx`
- Encourage next action: "No flagged accounts. Great compliance posture!"

**Error State:**
- Display `<ErrorBanner error={error} />` from `aml-dashboard/src/components/common/ErrorBanner.jsx`
- Suggest action: "Failed to load accounts. Please refresh."

**Content State:**
- Display full component with data

## Step 4 — Design Component Tree
Sketch the DOM structure using Tailwind classes only:

**Example for PriorityQueue:**
```
<div className="flex flex-col gap-4 p-4">
  <h2 className="text-lg font-bold">Priority Queue</h2>
  <table className="w-full border-collapse">
    <thead>
      <tr className="bg-gray-100">
        <th className="px-2 py-1 text-left">Account</th>
        <th className="px-2 py-1 text-left">Severity</th>
        <th className="px-2 py-1 text-left">Confidence</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map(account => (
        <tr key={account.accountId} className="hover:bg-gray-50 cursor-pointer">
          <td className="px-2 py-1">{account.customerName}</td>
          <td><SeverityBadge severity={account.amlFlags[0]?.severity} /></td>
          <td><ConfidenceBar score={account.amlFlags[0]?.confidenceScore} /></td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

No inline styles, only Tailwind utilities.

## Step 5 — Write Tests First (TDD)
Create `aml-dashboard/src/components/compliance/__tests__/[ComponentName].test.js`.

**Test cases to write (before component code):**
1. Test: Component renders loading spinner while `loading === true`
2. Test: Component renders empty state when data is empty array
3. Test: Component renders error banner when error exists
4. Test: Component renders content with all accounts when data loads
5. Test: Component calls `onSelectAccount` when row clicked (if applicable)
6. Test: Component sorts accounts by severity (CRITICAL first) (if applicable)
7. Test: Component handles missing AML flags gracefully

Write tests using React Testing Library. Use mock data from `data/` fixtures. Confirm tests fail before proceeding.

## Step 6 — Implement Component
Create `aml-dashboard/src/components/compliance/[ComponentName].jsx`:

**Checklist:**
- [ ] Functional component with named export only
- [ ] Accept props matching the design from Step 2
- [ ] Use hooks to get data (if needed): `useData()`, `useFilters()`, `usePagination()`
- [ ] Render loading state → empty state → error state → content state
- [ ] Use only Tailwind classes for styling (no inline styles)
- [ ] Use shared components: LoadingSpinner, EmptyState, ErrorBanner, ActionBadge, SeverityBadge
- [ ] Add JSDoc for component and props
- [ ] All tests pass

**Minimal example:**
```javascript
import React from 'react';
import { LoadingSpinner, EmptyState, ErrorBanner } from '../common';

/**
 * PriorityQueue — Display flagged accounts ranked by risk.
 * @param {Array<Account>} accounts - accounts with AML flags
 * @param {Function} onSelectAccount - callback on row click
 * @param {boolean} loading - loading state
 * @param {Error|null} error - error state
 * @returns {JSX.Element}
 */
export function PriorityQueue({ accounts = [], onSelectAccount, loading, error }) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner error={error} />;
  if (accounts.length === 0) return <EmptyState message="No flagged accounts." />;

  return (
    <div className="flex flex-col gap-4">
      {/* content here */}
    </div>
  );
}
```

## Step 7 — Integrate into Parent Component
Find the parent component that should use this new component (e.g., `AccountActionPanel`):

- [ ] Import the new component
- [ ] Pass required props from parent's data/state
- [ ] Test in dev server (http://localhost:5173)
- [ ] Verify component renders without errors

## Step 8 — Verify with App-Level Test
In `aml-dashboard/src/App.jsx`:

- [ ] Verify component is rendered in the correct tab/panel
- [ ] Test in dev server with real data from `data/` files
- [ ] Check no console warnings or errors
- [ ] Verify all safe states work:
  - [ ] Loading state appears (add artificial delay if needed)
  - [ ] Empty state appears (filter data empty if needed)
  - [ ] Error state appears (simulate error if needed)
  - [ ] Content state displays correctly with real data

## Step 9 — Code Review Checklist
Before marking complete:

- [ ] All tests pass: `npm test -- [ComponentName].test.js`
- [ ] No console warnings: check browser DevTools
- [ ] Tailwind classes only (no CSS files, no inline styles)
- [ ] Component is named export only
- [ ] Props are documented with JSDoc
- [ ] Safe states handled: loading, empty, error
- [ ] Component is composable (small, single responsibility)
- [ ] Severity/confidence scores use correct AML colors/ranges
- [ ] No service layer logic duplicated (data transformation in hooks/context only)

## Acceptance Criteria
- Component renders correctly in all states
- All tests pass
- No console errors/warnings
- Only Tailwind styling
- Wired to data layer correctly
- Follows AML domain naming and conventions

## Reference
- AML domain conventions: `.github/instructions/compliance-ui.instructions.md`
- Component patterns: existing files in `aml-dashboard/src/components/compliance/`
- Tailwind utility reference: https://tailwindcss.com/docs
- React Testing Library: https://testing-library.com/react

