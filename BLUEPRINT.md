# BLUEPRINT: AML Pattern Detection Dashboard (One-Day POC)

## 1. Purpose
Build a browser-only AML monitoring dashboard that loads local JSON datasets, highlights suspicious patterns in a transaction graph, and gives compliance users a ranked action queue.

This is a one-day proof of concept. Prioritize correctness, visibility of AML patterns, and clear investigation workflow over production-hardening.

## 2. Users and Scenarios
- AML Analyst: identify suspicious accounts quickly, inspect graph links, and review typology flags.
- Compliance Officer: review top-risk accounts and recommended action (EDD, SAR, FREEZE, FIU escalation).
- Team Lead: verify the system surfaces meaningful risk signals and can support next-phase productization.

## 3. POC Scope (In)
- Local data fetch from:
  - data/accounts.json
  - data/aml-flags.json
  - data/transaction-edges.json
  - data/transactions.json
- Service functions for data loading, graph analysis, and AML scoring.
- Hooks for data loading, filtering, and pagination.
- Core UI slices:
  - graph visualization area
  - priority queue list
  - key AML summary cards/charts
- Basic loading, error, and empty states.
- Unit tests for service logic and key hooks.

## 4. Out of Scope (One-Day POC)
- Backend APIs and persistence.
- Real-time stream ingestion.
- Full case-management workflows.
- Authentication and role management.
- Full test coverage for every UI component.

## 5. Data Model (Exact Field Names)

### Account record (accounts.json)
- accountId
- customerName
- iban
- accountType
- openedDate
- riskRating
- amlFlags[]
  - flagId
  - typology
  - confidenceScore
  - severity
  - detectedAt
  - recommendedAction

### AML flag record (aml-flags.json)
- flagId
- accountId
- typology
- confidenceScore
- severity
- detectedAt
- recommendedAction

### Edge record (transaction-edges.json)
- edgeId
- fromAccountId
- toAccountId
- amount
- currency
- hops
- timestamp
- isFlagged

### Transaction record (transactions.json)
- transactionId
- accountId
- customerName
- amount
- currency
- merchantName
- merchantCategory
- originCountry
- destinationCountry
- riskScore
- fraudIndicators
- timestamp
- status

## 6. Data Relationships and Constraint Notes
- accounts.accountId links to aml-flags.accountId.
- accounts.accountId links to transaction-edges.fromAccountId and transaction-edges.toAccountId.
- transactions.accountId currently uses a different format than accounts.accountId in sample data.
  - POC decision: treat transactions as a related but separate stream unless a deterministic mapping is introduced.

## 7. Architecture and Layering
- Data layer:
  - load and validate records
  - normalize safe internal shapes
- Logic layer:
  - graph traversal and cycle detection
  - structuring and threshold analysis
  - risk ranking
- Presentation layer:
  - graph panel
  - compliance queue and action components
  - filters, pagination, and summaries

## 8. API Surface

### Services
- loadAccounts()
- loadFlags()
- loadEdges()
- loadTransactions()
- buildAdjacencyMap(edges)
- detectCycles(adjacencyMap)
- findHighHopPaths(edges, minHops)
- groupByAccount(edges)
- getStructuringEdges(edges)
- aggregateByAccount24h(edges)
- breachesThreshold(total)
- rankAccounts(accounts, edges, flags)

### Hooks
- useData()
  - returns: accounts, edges, flags, transactions, loading, error
- usePagination(items, pageSize = 30)
  - returns: page, totalPages, currentItems, nextPage, prevPage, goToPage
- useFilters(data)
  - filters: dateRange, typology, severity, isFlagged, currency

## 9. Core Business Rules
- Structuring candidate range: 9000 to 9999 inclusive.
- Threshold breach rule: total > 10000 inside a rolling 24-hour window.
- Pagination default: 30 records per page.
- Dates and times should be handled as ISO 8601.

## 10. Severity and Color Mapping Constants
- LOW: #22C55E
- MEDIUM: #F59E0B
- HIGH: #F97316
- CRITICAL: #EF4444
- Flagged edge color: #EF4444

## 11. Non-Functional Expectations for POC
- Fast local startup and deterministic behavior.
- Errors surfaced with clear user-facing messages.
- No silent failures in data loading or scoring.

## 12. One-Day Success Criteria
- All four datasets load and are visible in UI-derived outputs.
- At least one suspicious cycle and one high-hop chain are surfaced.
- Threshold breaches are detected and shown in priority queue context.
- Core service and hook tests pass.
- Demo-ready flow exists from data load to investigation queue.
