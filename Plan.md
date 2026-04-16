# Plan: AML Pattern Detection Dashboard
 
## Overview
 
Build a fully client-side compliance monitoring web application that loads the two Project 2 data sources (`data/accounts.json` and `data/transaction-edges.json`) via `fetch()`, visualises the directed transaction graph, surfaces AML typology flags with severity scoring, and presents a ranked compliance action queue — all with zero backend. The app follows the agentic workflow defined in `AGENTIC_WORKFLOW.md`: produce `BLUEPRINT.md` and `developer_todo.md` first, then implement feature-by-feature using a TDD loop.
 
**Tech stack chosen:** React 18 + Vite (fast static dev server, no build complexity), Cytoscape.js (directed-graph network), Chart.js (time-series + bar charts), Tailwind CSS (utility-first styling). All dependencies served from CDN or bundled via Vite — no backend required.
 
---
 
## Phase 0 — Agentic Workflow Infrastructure (~20 min)
 
*Create the shared documentation artefacts and agent configuration files before touching any feature code.*
 
**Steps**
 
1. Create `BLUEPRINT.md` in the workspace root documenting: tech stack rationale, data model (exact field names from `accounts.json` / `transaction-edges.json`), component API surface, colour/severity mapping constants, pagination strategy (30 records/page), and the €10,000/24h threshold rule.
 
2. Create `developer_todo.md` in the workspace root with phased tasks, acceptance criteria, and TDD requirements for each feature epic (Epics 1–6 below).
 
3. Fill `.github/copilot-instructions.md` (currently blank) with universal coding conventions: functional React components, no class components, named exports only, Tailwind for all styles, no inline `style=` attributes, ISO 8601 date formatting, enum values always `UPPER_SNAKE_CASE`.
 
4. Create `.github/instructions/aml-domain.instructions.md` (applies to `src/**`) — AML domain rules: severity colour map, typology labels, recommended action labels, structuring threshold constant (9999.99), pagination page size constant (30).
 
5. Create `.github/instructions/graph.instructions.md` (applies to `src/components/graph/**`) — Cytoscape.js node/edge styling conventions, layout algorithm (`cose-bilkent`), flagged-edge colour (`#EF4444`), unflagged-edge colour (`#94A3B8`).
 
6. Create `.github/agents/data-layer.agent.md` — agent responsible only for `src/services/` and `src/hooks/`; model `Claude Sonnet 4.6`; tools: read, search, run tests.
 
7. Create `.github/agents/graph-viz.agent.md` — agent responsible only for `src/components/graph/`; Cytoscape.js expert persona.
 
8. Create `.github/agents/compliance-ui.agent.md` — agent responsible only for `src/components/compliance/`; AML domain expert persona.
 
9. Create `.github/skills/create-backlog-item/SKILL.md` — prompts agent to take a `developer_todo.md` item and expand it into a full task card with acceptance criteria, affected files, test cases.
 
10. Create `.github/skills/run-tests/SKILL.md` — prompts agent to run `npm test`, capture output, and report pass/fail summary.
 
11. Create `.github/prompts/feature-tdd.prompt.md` — reusable workflow: write failing tests → confirm fail → implement → confirm green → update `developer_todo.md`.
 
---
 
## Phase 1 — Project Scaffold & Data Layer (Epic 1)
 
*Greenfield setup. No implementation code exists yet.*
 
**Steps**
 
1. Initialise a Vite + React project inside the workspace:
   `npm create vite@latest aml-dashboard -- --template react` → produces `aml-dashboard/` sibling to `data/`.
 
2. Install dependencies: `cytoscape`, `cytoscape-cose-bilkent`, `chart.js`, `react-chartjs-2`, `tailwindcss`, `@tailwindcss/vite`, `date-fns`, `uuid`.
 
3. Configure Vite `vite.config.js` to serve the parent-level `data/` folder as a static asset path so `fetch('/data/accounts.json')` resolves correctly during dev.
 
4. Create `src/services/dataLoader.js` — exports two async functions: `loadAccounts()` (fetches `accounts.json`, returns array of 50 account objects) and `loadEdges()` (fetches `transaction-edges.json`, returns array of 40 edge objects). Both functions must throw typed errors on fetch failure.
 
5. Create `src/services/graphAnalysis.js` — pure functions: `buildAdjacencyMap(edges)`, `detectCycles(adjacencyMap)` (returns round-trip chains), `findHighHopPaths(edges, minHops)` (returns layering candidates), `groupByAccount(edges)` (returns `Map<accountId, Edge[]>`).
 
6. Create `src/services/amlDetection.js` — pure functions: `getStructuringEdges(edges)` (amount between 9000–9999), `aggregateByAccount24h(edges)` (sum per account per 24h window), `breachesThreshold(sum)` (returns `true` if > 10000), `rankAccounts(accounts, edges)` (returns sorted priority array by highest severity + highest confidence).
 
7. Create `src/hooks/useData.js` — React hook that calls `loadAccounts()` + `loadEdges()` in parallel via `Promise.all`, stores results in state, exposes `{ accounts, edges, loading, error }`.
 
8. Create `src/hooks/usePagination.js` — generic hook: takes `items[]` and `pageSize=30`, exposes `{ page, totalPages, currentItems, nextPage, prevPage, goToPage }`.
 
9. Create `src/hooks/useFilters.js` — manages filter state: `dateRange`, `typology`, `severity`, `isFlagged`, `currency`; exposes filtered subset of accounts/edges.
 
10. Write unit tests for all services in `src/services/__tests__/` using Vitest. TDD order: write tests → confirm fail → implement → green.
 
---
 
## Phase 2 — Application Shell & Navigation (Epic 2)
 
**Steps**
 
1. Create `src/App.jsx` — root component. Layout: fixed top `<Header>`, collapsible left `<Sidebar>` (account list), main content area with tab navigation for the three feature panels.
 
2. Create `src/components/layout/Header.jsx` — app title "AML Compliance Dashboard", global search input (filters account list by name/IBAN), date shown as "Last updated: April 16, 2026".
 
3. Create `src/components/layout/Sidebar.jsx` — scrollable list of all 50 accounts; each row shows avatar initials, customer name, account type badge, risk rating badge, flag count chip. Clicking a row sets the `selectedAccountId` global state.
 
4. Create `src/components/layout/TabNav.jsx` — three tabs: "Transaction Graph", "AML Patterns", "Priority Queue". Active tab drives which panel renders in main content.
 
5. Create `src/context/AppContext.jsx` — React context holding: `selectedAccountId`, `setSelectedAccountId`, `accounts`, `edges`, `loading`, `error`. Wrap `App.jsx` in `<AppProvider>`.
 
6. Define all colour/severity constants in `src/utils/constants.js`:
   - Severity → Tailwind class map: `LOW → green-400`, `MEDIUM → yellow-400`, `HIGH → orange-500`, `CRITICAL → red-600`
   - Typology label map: `STRUCTURING → "Structuring"`, etc.
   - Action badge colour map: `SAR → red`, `EDD → orange`, `FREEZE → blue`, `FIU_ESCALATION → purple`
 
---
 
## Phase 3 — Transaction Chain Display (Epic 3, Feature 1)
 
*Covers paginated transaction history, filters, and graph visualisation.*
 
**Steps**
 
1. Create `src/components/graph/TransactionGraph.jsx` — Cytoscape.js canvas. Nodes = accounts (circle, labelled with `customerName` shortened), edges = transaction amounts (labelled with amount + currency). Flagged edges rendered red dashed; unflagged edges rendered grey. Layout: `cose-bilkent`. On node click → update `selectedAccountId`.
 
2. Configure Cytoscape node styles: node colour by `riskRating` (LOW=green, MEDIUM=yellow, HIGH=orange, PEP=purple), border pulse animation on selected node.
 
3. Add a "Focus Account" control: when `selectedAccountId` is set, filter graph to show only the ego-network (1–2 hops from that account) with a toggle to expand to full graph.
 
4. Create `src/components/transactions/TransactionTable.jsx` — table of edges involving the selected account. Columns: Edge ID, From, To, Amount, Currency, Hops, Timestamp, Flagged. Sorted by timestamp descending. Paginated at 30 rows/page using `usePagination` hook.
 
5. Create `src/components/transactions/FilterBar.jsx` — filter controls: date range picker (from/to), typology multi-select chip group, severity multi-select chip group, "Flagged only" toggle, currency dropdown. All filters wired to `useFilters` hook.
 
6. Create `src/components/transactions/TransactionDetail.jsx` — side drawer or modal: shows full edge metadata + hop chain for a selected transaction edge. Lists all intermediate accounts in the hop path.
 
7. Create `src/components/transactions/HopBadge.jsx` — small badge rendering hop count with tooltip. Hops ≥ 3 renders in amber; hops ≥ 4 renders in red.
 
---
 
## Phase 4 — AML Pattern Visualisation (Epic 4, Feature 2)
 
**Steps**
 
1. Create `src/components/aml/AmlFlagCard.jsx` — card component for one AML flag. Shows: typology label (icon + text), confidence score as a radial arc (0–100%), severity chip (colour-coded), `detectedAt` formatted as relative time, recommended action badge.
 
2. Create `src/components/aml/AccountFlagPanel.jsx` — for the selected account, renders a grid of `<AmlFlagCard>` for each flag in `account.amlFlags`. Shows "No flags detected" empty state if array is empty.
 
3. Create `src/components/aml/TypologyLegend.jsx` — static explainer component defining each typology in plain language (shown as a collapsible info panel).
 
4. Create `src/components/aml/PatternTimeSeriesChart.jsx` — Chart.js line chart. X-axis: 30 days rolling back from today (April 16, 2026). Y-axis: number of flagged edges active per day (derived from `timestamp` in `transaction-edges.json`). Separate line per typology, colour-coded. Uses `react-chartjs-2`.
 
5. Create `src/components/aml/ConfidenceBar.jsx` — horizontal progress bar visualising `confidenceScore` 0–100, coloured by severity level.
 
6. Create `src/components/aml/SeveritySummaryChart.jsx` — Chart.js doughnut chart showing distribution of severities across all 34 flags system-wide (CRITICAL=11, HIGH=13, MEDIUM=7, LOW=3).
 
7. Create `src/components/aml/TypologyBreakdownChart.jsx` — Chart.js horizontal bar chart showing flag counts per typology (STRUCTURING=11, LAYERING=10, ROUND_TRIPPING=9, SHELL_NETWORK=7).
 
---
 
## Phase 5 — Compliance Decision Support (Epic 5, Feature 3)
 
**Steps**
 
1. Create `src/components/compliance/PriorityQueue.jsx` — ranked list of accounts requiring action. Rank algorithm (from `rankAccounts()` in `amlDetection.js`): sort by (1) highest severity level, (2) highest `confidenceScore`, (3) most flags. Each row shows rank position, customer name, flag count, top recommended action, risk rating badge, and a "Review" button.
 
2. Create `src/components/compliance/AccountActionPanel.jsx` — for the selected account from the priority queue, shows four action buttons: "File SAR", "Request EDD", "Freeze Account", "Escalate to FIU". Buttons are decorative (no backend); clicking shows a confirmation toast "Action logged (mock)".
 
3. Create `src/components/compliance/ThresholdBreachAlert.jsx` — scans `transaction-edges.json` edges grouped by `fromAccountId` within any 24h window. Renders a dismissible alert banner for each account whose 24h aggregate exceeds €10,000. Uses `aggregateByAccount24h()` from `amlDetection.js`.
 
4. Create `src/components/compliance/ActivityEvolutionChart.jsx` — Chart.js line chart. Plots total volume of flagged transactions per day over the past 30 days for the selected account. Overlays a red dashed horizontal line at €10,000 threshold.
 
5. Create `src/components/compliance/ActionBadge.jsx` — pill badge showing recommended action with colour: SAR=red, EDD=orange, FREEZE=blue, FIU_ESCALATION=purple.
 
6. Create `src/components/compliance/RiskScoreGauge.jsx` — derived composite risk gauge (0–100) computed from: max severity score (CRITICAL=100, HIGH=75, MEDIUM=50, LOW=25) × (confidenceScore/100) × (1 + 0.1 × flagCount). Display as a semi-circular gauge using Chart.js.
 
---
 
## Phase 6 — Polish & Cross-Cutting Concerns (Epic 6)
 
**Steps**
 
1. Implement `src/components/common/LoadingSpinner.jsx` — shown during `fetch()` calls.
 
2. Implement `src/components/common/ErrorBanner.jsx` — shown if either data file fails to load.
 
3. Implement `src/components/common/EmptyState.jsx` — shown when filters return no results.
 
4. Implement `src/components/common/Toast.jsx` + `src/hooks/useToast.js` — transient notification for mock compliance actions.
 
5. Add `src/utils/exportCsv.js` — exports the current priority queue or filtered transaction list as a CSV download (no server needed — uses `Blob` + `URL.createObjectURL`).
 
6. Make the layout responsive: sidebar collapses to a hamburger on screens < 768px; graph panel shrinks gracefully.
 
7. Ensure keyboard accessibility: all filter controls are focusable, graph nodes are navigable via arrow keys (Cytoscape a11y).
 
8. Write integration-style component tests in `src/components/__tests__/` using Vitest + React Testing Library for `PriorityQueue`, `AmlFlagCard`, and `TransactionTable`.
 
---
 
## Verification
 
- Run `npm test` — all Vitest unit tests green (data layer + services + components).
- Run `npm run dev` — Vite dev server starts; open `http://localhost:5173`.
- Load check: network tab shows 200 responses for `accounts.json` (50 records) and `transaction-edges.json` (40 records).
- Graph renders: 50 nodes visible, 40 directed edges, 22 flagged edges are red dashed.
- Pagination: selecting an account with > 30 edges shows page controls.
- Priority queue: `acct-...046` (Svetlana Morozova — 3 CRITICAL flags) appears in rank #1 or #2 position.
- Threshold breach: accounts in the round-trip EUR clusters (acct-3, acct-5, acct-7 chain) trigger the €10k alert banner.
- Charts render: 30-day time-series shows activity spikes around April 5–11, 2026 (matching edge timestamps).
- Filters: toggling "Flagged only" hides all 18 unflagged edges from the transaction table.
- Export: clicking CSV export downloads a valid file with correct headers.
 
---
 
## File Tree (Target State)