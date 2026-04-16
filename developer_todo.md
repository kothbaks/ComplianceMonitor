# developer_todo: One-Day POC Plan

## Delivery Goal
Ship a demo-ready AML dashboard POC in one day with trustworthy core logic, minimal but functional UI, and targeted automated tests.

## Rules for Every Task
- Maximum 5 files touched.
- Must have clear acceptance criteria.
- Must include a TDD requirement.
- Must include domain tag: data-layer, graph, compliance-ui, testing, or polish.

## Phase A: Core Data and Logic (Morning)

### Task POC-DL-01
- Domain: data-layer
- Objective: Scaffold data loader with typed errors and validations.
- File scope (<=5):
  - aml-dashboard/src/services/dataLoader.js
  - aml-dashboard/src/services/errors.js
  - aml-dashboard/src/services/validators.js
  - aml-dashboard/src/services/__tests__/dataLoader.test.js
- Acceptance criteria:
  - loadAccounts/loadFlags/loadEdges/loadTransactions return validated arrays.
  - Network, HTTP, parse, and schema failures throw typed errors.
- TDD requirement:
  - Write failing tests for each loader success/failure path first.

### Task POC-DL-02
- Domain: data-layer
- Objective: Implement graph analysis utilities.
- File scope (<=5):
  - aml-dashboard/src/services/graphAnalysis.js
  - aml-dashboard/src/services/__tests__/graphAnalysis.test.js
- Acceptance criteria:
  - buildAdjacencyMap, detectCycles, findHighHopPaths, groupByAccount return expected outputs for fixture inputs.
- TDD requirement:
  - Add failing tests for one cycle and one high-hop candidate before implementation.

### Task POC-DL-03
- Domain: data-layer
- Objective: Implement AML detection and ranking logic.
- File scope (<=5):
  - aml-dashboard/src/services/amlDetection.js
  - aml-dashboard/src/services/__tests__/amlDetection.test.js
  - aml-dashboard/src/utils/constants.js
- Acceptance criteria:
  - Structuring edges (9000-9999) detected correctly.
  - 24-hour aggregation computed correctly.
  - Threshold breach uses strict total > 10000.
  - rankAccounts returns deterministic descending order.
- TDD requirement:
  - Boundary tests for 9999, 10000, and 10000.01 fail first.

## Phase B: Hooks and Data Flow (Early Afternoon)

### Task POC-DL-04
- Domain: data-layer
- Objective: Create useData with parallel loading.
- File scope (<=5):
  - aml-dashboard/src/hooks/useData.js
  - aml-dashboard/src/hooks/__tests__/useData.test.js
  - aml-dashboard/src/services/dataLoader.js
- Acceptance criteria:
  - Hook loads all datasets in parallel and exposes loading/error/data state.
- TDD requirement:
  - Start with failing tests for loading->success and loading->error transitions.

### Task POC-UI-01
- Domain: compliance-ui
- Objective: Create usePagination and useFilters hooks.
- File scope (<=5):
  - aml-dashboard/src/hooks/usePagination.js
  - aml-dashboard/src/hooks/useFilters.js
  - aml-dashboard/src/hooks/__tests__/hooks.test.js
- Acceptance criteria:
  - Pagination defaults to 30 items and handles boundaries.
  - Filters apply dateRange, typology, severity, isFlagged, and currency.
- TDD requirement:
  - Write failing boundary and filter-combination tests first.

## Phase C: Demo UI Slices (Late Afternoon)

### Task POC-GR-01
- Domain: graph
- Objective: Build graph panel with state handling.
- File scope (<=5):
  - aml-dashboard/src/components/graph/TransactionGraph.jsx
  - aml-dashboard/src/components/graph/HopBadge.jsx
  - aml-dashboard/src/components/common/LoadingSpinner.jsx
  - aml-dashboard/src/components/common/ErrorBanner.jsx
  - aml-dashboard/src/components/graph/__tests__/TransactionGraph.test.js
- Acceptance criteria:
  - Graph panel renders loading/error/empty/success states.
  - Flagged edges are visually distinct.
- TDD requirement:
  - Add failing tests for state rendering and flagged style behavior first.

### Task POC-CU-01
- Domain: compliance-ui
- Objective: Build priority queue and action panel.
- File scope (<=5):
  - aml-dashboard/src/components/compliance/PriorityQueue.jsx
  - aml-dashboard/src/components/compliance/AccountActionPanel.jsx
  - aml-dashboard/src/components/compliance/ActionBadge.jsx
  - aml-dashboard/src/components/compliance/__tests__/PriorityQueue.test.js
- Acceptance criteria:
  - Queue lists ranked accounts with severity and recommended action.
  - Account panel shows rationale fields (typology, confidence, breach/cycle signals).
- TDD requirement:
  - Tests for ordering, badge mapping, and panel content fail first.

## Phase D: Integration and Demo Readiness (End of Day)

### Task POC-TS-01
- Domain: testing
- Objective: Add integration-level checks for service-to-hook-to-UI handoff.
- File scope (<=5):
  - aml-dashboard/src/hooks/__tests__/hooks.test.js
  - aml-dashboard/src/services/__tests__/dataLoader.test.js
  - aml-dashboard/src/services/__tests__/amlDetection.test.js
  - aml-dashboard/src/components/compliance/__tests__/PriorityQueue.test.js
- Acceptance criteria:
  - Integration tests verify that loaded data drives ranked queue output.
- TDD requirement:
  - Introduce at least one failing integration assertion before glue fixes.

### Task POC-PL-01
- Domain: polish
- Objective: Demo polish and consistency pass.
- File scope (<=5):
  - aml-dashboard/src/utils/constants.js
  - aml-dashboard/src/App.jsx
  - aml-dashboard/src/components/common/ErrorBanner.jsx
  - aml-dashboard/src/components/compliance/PriorityQueue.jsx
  - aml-dashboard/src/components/graph/TransactionGraph.jsx
- Acceptance criteria:
  - Severity colors and labels are consistent across graph and queue.
  - User-facing error copy is clear and non-technical.
- TDD requirement:
  - Add/adjust assertions covering constants-to-UI consistency where practical.

## Day-End Definition of Done
- Core services implemented and tested.
- Hooks implemented and tested.
- Graph and queue demo slices functional.
- POC demonstrates at least:
  - one structuring signal
  - one threshold breach
  - one cycle or high-hop pattern
- Test suite for implemented scope is green.
