# Plan: AML Pattern Detection Dashboard

## Project Overview

Build a fully client-side compliance monitoring web application that loads AML data sources (`data/accounts.json`, `data/aml-flags.json`, `data/transactions.json`, `data/transaction-edges.json`) via `fetch()`, visualises the directed transaction graph, surfaces AML typology flags with severity scoring, and presents a ranked compliance action queue — all with zero backend. The app follows the agentic workflow defined in `AGENTIC_WORKFLOW.md`.

**Tech stack:** React 18 + Vite, Cytoscape.js (graph), Chart.js (charts), Tailwind CSS, Vitest (testing).

---

## Workflow Phases

| Phase | Title | Time | Mode(s) | Checkpoint |
|---|---|---|---|---|
| [0](#phase-0--environment--project-foundation-20-min) | Environment & Project Foundation | ~20 min | Agent | Verify environment & enable Chat Debug View |
| [1](#phase-1--blueprint--research-30-min-hard-stop) | Blueprint & Research | ~30 min *(hard stop)* | Ask | Review `BLUEPRINT.md` & `developer_todo.md` |
| [2](#phase-2--base--domain-instructions-20-min) | Base & Domain Instructions | ~20 min | Ask → Agent | Validate no contradictions in instructions |
| [3](#phase-3--specialist-agents-25-min) | Specialist Agents | ~25 min | Ask → Agent | Test agent boundaries & approve designs |
| [4](#phase-4--skills-15-min) | Skills | ~15 min | Agent | Verify all skills scaffold correctly |
| [5](#phase-5--feature-implementation-60-90-min) | Feature Implementation | 60–90 min | Plan | End-to-end one backlog item; cross-domain validation |
| [6](#phase-6--retrospective-15-min) | Retrospective | ~15 min | Ask | Discuss agent drift, timing, improvements |
| [7](#phase-7--stretch-hooks--orchestration) | Stretch: Hooks & Orchestration | open-ended | Agent | *(Post-workshop)* |

---

## Phase 0 — Environment & Project Foundation (~20 min)
*Verify your environment and create the infrastructure directories.*

**Checklist**

- [ ] **0.1** Verify IDE and Copilot extensions are installed and functional
- [ ] **0.2** Confirm agent mode is available and you can switch between custom agents
- [ ] **0.3** Enable Chat Debug View: open Chat panel, select `...` menu → **Open Chat Debug View**
- [ ] **0.4** Create infrastructure directories (Agent mode):
  ```
  .github/agents/
  .github/skills/
  .github/hooks/
  .github/instructions/
  .github/prompts/
  ```

**Checkpoint:** Proceed to Phase 1 only after all four items are confirmed.

---

## Phase 1 — Blueprint & Research (~30 min — hard stop)

*Produce foundational artefacts before writing implementation code.*

**Mode: Ask** (use AI as a sparring partner, not a code generator)

### 1.1 Define the Project with AI (Ask Mode)

Quiz yourself with AI as a guide:
- Problem solved & who it serves
- Key features & user interactions
- Data model & layering (data layer, logic, presentation)
- Constraints (no external APIs, in-memory, mock endpoints, etc.)

### 1.2 Generate `BLUEPRINT.md` (Ask Mode)

Have AI produce a project specification covering:
- **Purpose & user scenarios** — who uses it, what they need to see
- **Feature list** — broken down by functional area
- **Data model** — entities, fields, relationships (reference exact field names from `accounts.json`, `aml-flags.json`, `transaction-edges.json`, `transactions.json`)
- **API surface** — React hooks and service functions that expose data
- **Constraints** — €10,000/24h threshold, 30 records/page pagination, no backend
- **Colour/severity mapping** — constants for UI rendering

### 1.3 Generate `developer_todo.md` (Ask Mode)

Have AI produce a phased task breakdown. **Every task must:**
- Be completable in a **single agent context window** (≤5 files touched)
- Have a clear **acceptance criterion** (testable statement of done)
- Include a **TDD requirement** (what tests exist before task is done)
- Be tagged with domain: `data-layer`, `graph`, `compliance-ui`, `testing`, or `polish`

Tasks exceeding 5 files must be split. Review and approve all tasks before Phase 2.

**Checkpoint:** Do not proceed until `BLUEPRINT.md` and `developer_todo.md` exist and are reviewed.

---

## Phase 2 — Base & Domain Instructions (~20 min)

*Encode project standards so every agent follows them without repetition.*

### 2.1 Generate Base Custom Instructions (Ask Mode)

Create `.github/copilot-instructions.md` with:
- Project purpose (one paragraph)
- Code style: functional React, named exports, Tailwind only, no inline `style=`, ISO 8601 dates, `UPPER_SNAKE_CASE` enums
- Error handling expectations
- Documentation & commit expectations

### 2.2 Identify Your Domains (Ask Mode)

With AI, identify 2–3 domains relevant to your project:
- **Data layer** — data loading, service functions, graph analysis, AML detection
- **Graph UI** — Cytoscape.js components, styling, interactions
- **Compliance UI** — AML patterns, priority queue, action panels
- **Testing** — Vitest conventions, TDD loop

For each, note a glob pattern (e.g., `src/services/**`, `src/components/graph/**`) and key concerns.

### 2.3 Generate Domain Instruction Files (Agent Mode)

For each domain, create `.github/instructions/<domain>.instructions.md`:
- Glob pattern in YAML `applyTo` field (auto-activates when matching files open)
- What to always do (patterns, validations, structure)
- What to never do (anti-patterns, shortcuts that cause problems)
- Domain-specific security/performance concerns

Examples:
- `data-layer.instructions.md` (applies to `src/services/**`, `src/hooks/**`) — fetch error handling, pure functions, typed errors
- `graph.instructions.md` (applies to `src/components/graph/**`) — Cytoscape.js conventions, `cose-bilkent` layout, flagged-edge colour `#EF4444`
- `compliance-ui.instructions.md` (applies to `src/components/compliance/**`) — severity colour mapping, action badge constants

### 2.4 Validate for Contradictions (Agent Mode)

Add all instruction files as context. Ask AI: are there contradictions between domain and base instructions, or gaps? Resolve all issues. Keep to **5 minutes**.

**Checkpoint:** All instruction files created and validated before Phase 3.

---

## Phase 3 — Specialist Agents (~25 min)

*Create focused AI assistants with clear roles and enforced boundaries.*

### 3.1 Design Your Specialists with AI (Ask Mode)

Design each specialist:
- Single responsibility
- Required tools (read, search, terminal, problems — only what it needs)
- Explicit boundaries (what files/domains it must not touch)
- Output protocols (format, review steps)

### 3.2 Create Specialist Agent Files (Agent Mode)

Create `.github/agents/<name>.agent.md` for each specialist:

**Data Layer Agent** (applies to `src/services/**`, `src/hooks/**`)
- Responsibility: data loading, service functions, graph analysis, AML detection algorithms
- Tools: read, write, search, terminal, problems
- Boundary: never touches `src/components/**`
- Output: service/hook functions with typed errors, JSDoc comments

**Graph UI Agent** (applies to `src/components/graph/**`)
- Responsibility: Cytoscape.js graph visualisation, node/edge styling, interactions
- Tools: read, write, search, problems
- Boundary: never touches `src/services/**` or other component domains
- Output: React components following Cytoscape conventions, Tailwind-only styling

**Compliance UI Agent** (applies to `src/components/compliance/**`)
- Responsibility: AML patterns, priority queue, action panels, alerts, charts
- Tools: read, write, search, problems
- Boundary: never touches `src/services/**` or graph components
- Output: React components connected to data layer, following AML domain conventions

**Test Engineer Agent** (applies to `src/**/__tests__/**`, `src/**/*.test.js`)
- Responsibility: write failing tests first, confirm failure reason, then implement production code
- Tools: read, write, terminal, search
- Boundary: never skips the TDD sequence; always tests before implementation
- Output: passing test suites with integration coverage
- Protocol: explicitly state "Tests written and failing for the right reason" before implementation

**Project Manager Agent** (applies to project planning only)
- Responsibility: assess project state, select backlog items, produce elaborated tasks
- Tools: read, search (never write production code)
- Boundary: never implements features; only planning & elaboration
- Skills: uses `project-metrics` (collect state), `create-backlog-item` (structure tasks)
- Output: structured backlog items ready for specialist approval

### 3.3 Validate Agent Boundaries (Agent Mode)

Test each specialist:
- Ask a domain question it should answer — verify correct response
- Ask a question outside its domain — verify it declines and suggests the correct agent
- For a cross-domain feature — verify each agent maintains focus on its boundary

**Checkpoint:** All specialist agents created and boundaries validated.

---

## Phase 4 — Skills (~15 min)

*Replace LLM guesswork with deterministic, reusable capabilities.*

### 4.1 Create `create-backlog-item` Skill (Agent Mode)

Create `.github/skills/create-backlog-item/` with:
- `SKILL.md` — instructs agents to use the included template for all backlog items
- `backlog-item-template.md` — canonical structure: title, description, acceptance criteria, TDD plan, file scope (≤5 files), definition of done

Reference this skill explicitly in PM Agent instructions.

### 4.2 Create `run-tests` Skill (Agent Mode)

Create `.github/skills/run-tests/` with:
- `SKILL.md` — instructions for correct test execution
- `run-tests.sh` — script that runs `npm test`, captures output, reports: test count, failing test names, exit code, summary

Reusable across all agents needing to verify tests.

### 4.3 Create `project-metrics` Skill (Agent Mode)

Create `.github/skills/project-metrics/` with:
- `SKILL.md` — instructs PM agent to collect project state
- `project-metrics.sh` — script that counts: source files by layer, test file count, lint/build status signals

PM uses this before selecting backlog items instead of guessing project state.

### 4.4 Create Workflow Prompt Files (Agent Mode)

Create reusable prompts in `.github/prompts/`:

1. **`load-aml-data.prompt.md`** — workflow for loading & transforming JSON files (accounts, flags, transactions, edges) into in-memory structures
2. **`build-ui-component.prompt.md`** — workflow for creating a React component connected to data layer with loading/error/empty states
3. **`tdd-loop.prompt.md`** — workflow for TDD sequence: write failing tests → confirm fail → implement → green tests → refactor

Each prompt has:
- YAML frontmatter: mode, tools, reference agents
- Structured body guiding multi-step task

**Checkpoint:** All skills and prompts scaffold correctly and are loaded into agent contexts.

---

## Phase 5 — Feature Implementation (60–90 min)

*Use the full domain system to build one complete backlog item end-to-end. Example: Epic 1 (Data Layer).*

### 5.0 Select a Feature (with PM Agent)

**Mode: Agent**

Use the PM Agent to:
1. Run `project-metrics` skill — collect current project state
2. Review `developer_todo.md` — select next logical backlog item
3. Use `create-backlog-item` skill — produce elaborated task card

Approve the item before proceeding. If it touches >5 files, ask PM to split it.

### 5.1 Data & Logic Layer Implementation

**Mode: Plan** (multi-file, sequenced work)

Use **Data Layer Agent** with `load-aml-data.prompt.md` workflow:

1. Create `src/services/dataLoader.js`:
   - `loadAccounts()` — fetches `accounts.json`, returns array with error handling
   - `loadEdges()` — fetches `transaction-edges.json`, returns array with error handling
   - `loadFlags()` — fetches `aml-flags.json`, returns array with error handling
   - `loadTransactions()` — fetches `transactions.json`, returns array with error handling
   - All throw typed errors on fetch failure

2. Create `src/services/graphAnalysis.js`:
   - `buildAdjacencyMap(edges)` — pure function
   - `detectCycles(adjacencyMap)` — returns round-trip chains
   - `findHighHopPaths(edges, minHops)` — returns layering candidates
   - `groupByAccount(edges)` — returns `Map<accountId, Edge[]>`

3. Create `src/services/amlDetection.js`:
   - `getStructuringEdges(edges)` — amount between 9000–9999
   - `aggregateByAccount24h(edges)` — sum per account per 24h window
   - `breachesThreshold(sum)` — returns `true` if > 10000
   - `rankAccounts(accounts, edges, flags)` — returns sorted priority array

4. Create `src/hooks/useData.js`:
   - Calls all loaders in parallel via `Promise.all`
   - Exposes: `{ accounts, edges, flags, transactions, loading, error }`

5. Create `src/hooks/usePagination.js`:
   - Takes `items[]` and `pageSize=30`
   - Exposes: `{ page, totalPages, currentItems, nextPage, prevPage, goToPage }`

6. Create `src/hooks/useFilters.js`:
   - Manages: `dateRange`, `typology`, `severity`, `isFlagged`, `currency`
   - Exposes filtered subset of accounts/edges

7. Implement error handling for missing/malformed data

8. Ask specialist to review for standards compliance before moving on

### 5.2 Testing — Strict TDD Loop

**Mode: Plan** (with Test Engineer Agent using `tdd-loop.prompt.md`)

**Sequence (mandatory order):**

1. **Write failing tests first** in `src/services/__tests__/` using Vitest:
   - Map each acceptance criterion to a test case
   - Write tests for: dataLoader functions, graphAnalysis functions, amlDetection functions
   - Run tests using `run-tests` skill — confirm they fail for the right reason
   - Do NOT implement production code yet

2. **Confirm failure** — ask Test Engineer to verify test names/reasons in output

3. **Implement production code** — production code goes into services (step 1–6 above)

4. **Run tests again** using `run-tests` skill — loop until all pass

5. **Do not declare success** until `run-tests` skill reports all green

### 5.3 Presentation Layer Integration (Optional — depends on feature size)

**Mode: Plan** (with Graph UI or Compliance UI Agent)

If the backlog item includes UI:
- Create React components connected to data layer from 5.1
- Handle loading, empty, and error states
- Test component integration with data flow

### 5.4 Cross-Domain Validation

**Mode: Agent**

Return to general mode. Verify:
- Does frontend consume data layer correctly?
- Do tests cover integration points, not just units?
- Final review for security, performance, standards compliance
- All acceptance criteria met?

**Checkpoint:** Feature complete and approved before Phase 6.

---

## Phase 6 — Retrospective (~15 min)

*Look back and improve the workflow.*

**Mode: Ask**

Discuss with AI:
- Where did agents stay within boundaries — and where did they drift?
- Which steps took longer than expected?
- What would you change in instructions/skills for the next feature?
- Review Chat Debug View: what did you learn from tool invocations and skill execution logs?

Use these prompts:
- How specific should instructions be vs. allowing model judgment?
- Where are the right human checkpoints?
- Which skills are reusable vs. agent-specific?
- How to redirect incorrect agent output without losing context?

---

## Phase 7 — Stretch: Hooks & Orchestration

*(Post-workshop, if time allows)*

### 7.1 Smart Gatekeeper Hook (Phase 7 A)

Review `.github/hooks/gatekeeper.json` and `.github/hooks/scripts/gatekeeper.sh`. Adjust safe/danger patterns for your project commands. Test: safe command auto-approves, destructive command prompts. Verify in Chat Debug View.

### 7.2 Post-Edit Quality Hook (Phase 7 B)

Create a `PostToolUse` hook JSON that runs linter/formatter after every file edit. Enforces code quality as a system guarantee.

### 7.3 PM Audit Hook (Phase 7 C)

Add `hooks` field to PM Agent `.agent.md` frontmatter. On `Stop`, append timestamped entry to `.github/pm-audit.log`. Verify hook updates after PM session and appears in Chat Debug View.

### 7.4 Orchestration (Phase 7 D)

Eliminate manual agent switching via three-role orchestration:
- **Coordinator** — delegates to subagents, sees only summaries
- **Researcher** — reads files, returns compact summary
- **Implementer** — receives precise instructions, writes code

Steps:
- Set `user-invocable: false` on specialist agents
- Add I/O contracts to each agent's instructions
- Create Coordinator agent with `tools: [agent]` only
- Run one feature from `developer_todo.md` end-to-end

---

## Design Checklist

Before considering any phase complete, review:

- [ ] Does each agent stop for human approval at key decision points?
- [ ] Could any LLM guesswork be replaced with a deterministic tool (script, skill)?
- [ ] Are agent instructions under ~150 lines and clearly structured?
- [ ] Is each agent's tool list minimal — only what it actually needs?
- [ ] Does each agent have a defined input/output contract?
- [ ] Have you tested each agent with a concrete task and observed its behaviour?

---

## Verification Checklist (Phase 5 Example)

- Run `npm test` — all Vitest tests green (data layer + services)
- Run `npm run dev` — Vite dev server starts; navigate to `http://localhost:5173`
- Network tab: 200 responses for all four JSON files with correct record counts
- Data layer: `useData()` hook loads all data in parallel
- Accounts loaded: 50 records with all fields present
- Edges loaded: 40 records with typology and flag fields
- Flags loaded: 34 records with severity and confidence scores
- Transactions loaded: records present for all 30 days in April 2026
- Graph analysis: cycle detection works on test data
- AML detection: structuring edges (9000–9999) identified correctly
- Threshold breach: aggregation detects accounts exceeding €10,000 in 24h windows
- Pagination: `usePagination` hook works with 30-item pages
- Filters: `useFilters` hook correctly filters by date range, typology, severity, flag status

---

## Appendix: Target Project File Tree

```
ComplianceMonitor/
├── .github/
│   ├── agents/
│   │   ├── data-layer.agent.md
│   │   ├── graph-ui.agent.md
│   │   ├── compliance-ui.agent.md
│   │   ├── test-engineer.agent.md
│   │   └── pm.agent.md
│   ├── instructions/
│   │   ├── data-layer.instructions.md
│   │   ├── graph.instructions.md
│   │   └── compliance-ui.instructions.md
│   ├── skills/
│   │   ├── create-backlog-item/
│   │   │   ├── SKILL.md
│   │   │   └── backlog-item-template.md
│   │   ├── run-tests/
│   │   │   ├── SKILL.md
│   │   │   └── run-tests.sh
│   │   └── project-metrics/
│   │       ├── SKILL.md
│   │       └── project-metrics.sh
│   ├── prompts/
│   │   ├── load-aml-data.prompt.md
│   │   ├── build-ui-component.prompt.md
│   │   └── tdd-loop.prompt.md
│   ├── hooks/
│   │   ├── gatekeeper.json
│   │   └── scripts/
│   │       └── gatekeeper.sh
│   ├── copilot-instructions.md
│   └── pm-audit.log (created during Phase 7)
├── aml-dashboard/
│   ├── src/
│   │   ├── services/
│   │   │   ├── dataLoader.js
│   │   │   ├── graphAnalysis.js
│   │   │   ├── amlDetection.js
│   │   │   └── __tests__/
│   │   │       ├── dataLoader.test.js
│   │   │       ├── graphAnalysis.test.js
│   │   │       └── amlDetection.test.js
│   │   ├── hooks/
│   │   │   ├── useData.js
│   │   │   ├── usePagination.js
│   │   │   ├── useFilters.js
│   │   │   ├── useToast.js
│   │   │   └── __tests__/
│   │   │       └── hooks.test.js
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── TabNav.jsx
│   │   │   ├── graph/
│   │   │   │   ├── TransactionGraph.jsx
│   │   │   │   ├── HopBadge.jsx
│   │   │   │   └── __tests__/
│   │   │   │       └── TransactionGraph.test.js
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionTable.jsx
│   │   │   │   ├── FilterBar.jsx
│   │   │   │   ├── TransactionDetail.jsx
│   │   │   │   └── __tests__/
│   │   │   │       └── TransactionTable.test.js
│   │   │   ├── aml/
│   │   │   │   ├── AmlFlagCard.jsx
│   │   │   │   ├── AccountFlagPanel.jsx
│   │   │   │   ├── TypologyLegend.jsx
│   │   │   │   ├── PatternTimeSeriesChart.jsx
│   │   │   │   ├── ConfidenceBar.jsx
│   │   │   │   ├── SeveritySummaryChart.jsx
│   │   │   │   └── TypologyBreakdownChart.jsx
│   │   │   ├── compliance/
│   │   │   │   ├── PriorityQueue.jsx
│   │   │   │   ├── AccountActionPanel.jsx
│   │   │   │   ├── ThresholdBreachAlert.jsx
│   │   │   │   ├── ActivityEvolutionChart.jsx
│   │   │   │   ├── ActionBadge.jsx
│   │   │   │   ├── RiskScoreGauge.jsx
│   │   │   │   └── __tests__/
│   │   │   │       └── PriorityQueue.test.js
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── ErrorBanner.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       └── Toast.jsx
│   │   ├── context/
│   │   │   └── AppContext.jsx
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── exportCsv.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── App.css
│   ├── public/
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .gitignore
├── data/
│   ├── accounts.json
│   ├── aml-flags.json
│   ├── transactions.json
│   └── transaction-edges.json
├── BLUEPRINT.md
├── developer_todo.md
├── Plan.md (this file)
├── AGENTIC_WORKFLOW.md
└── README.md
```

---

## Notes

- **Phase 1 hard stop:** Must complete in 30 minutes even if incomplete. An incomplete blueprint is better than no time for implementation.
- **Context windows:** Each task ≤5 files to fit in a single agent context.
- **Human-in-the-loop:** Every phase has a checkpoint where a human reviews and approves before proceeding.
- **Mode discipline:** Ask mode for decisions, Plan mode for multi-file sequenced work, Agent mode for direct execution.
- **Design Checklist:** Review before advancing from any phase.
- **Chat Debug View:** Open and monitor throughout to understand agent reasoning and tool invocations.