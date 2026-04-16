# Compliance Monitor

A real-time AML dashboard visualizing transaction networks and detecting suspicious patterns (structuring, layering, round-tripping, shell networks) to help compliance teams prioritize accounts for Suspicious Activity Reports, enhanced due diligence, freezes, and regulatory escalations.

---

## Overview

**Project Type:** Anti-Money Laundering (AML) Pattern Detection Dashboard  
**Data Source:** Static JSON mock data (no backend required)  
**Development Approach:** Agent-driven development with GitHub Copilot  
**Workflow Guide:** [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md)

---

## Business Context

You are a developer at a bank's financial crime unit. The compliance team monitors transaction flows across account networks and needs a dashboard to:
- Visualise transaction chains in real time
- Identify AML pattern flags (structuring, layering, round-tripping, shell networks)
- Manage a priority queue of accounts for review
- Decide which accounts need immediate action before reporting deadlines

---

## Key Features

### 1. Transaction Chain Display
- Load and display paginated transaction histories for individual accounts
- Show relationship metadata: sending account, receiving account, intermediary hops
- Filter by date range, transaction type, and AML flag status
- Display account network as a graph (nodes = accounts, edges = transactions)
- Handle pagination of large datasets (30 records per page)

### 2. AML Pattern Visualisation
- Display detected AML typology indicators per account:
  - **Structuring**: multiple transactions just below reporting thresholds
  - **Layering**: rapid movement through intermediary accounts
  - **Round-tripping**: funds leaving and returning to the same account
  - **Shell network**: transactions concentrated through newly opened accounts
- Show a confidence score (0–100%) for each detected pattern
- Use colour-coded severity indicators (LOW / MEDIUM / HIGH / CRITICAL)
- Present time-series charts showing pattern intensity changes over a rolling 30-day window

### 3. Compliance Decision Support
- Display recommended compliance actions per account:
  - File SAR (Suspicious Activity Report)
  - Enhanced Due Diligence (EDD) review
  - Temporary account freeze
  - Escalate to Financial Intelligence Unit (FIU)
- Show a ranked priority queue of accounts requiring action
- Highlight threshold breaches (e.g., transactions aggregating above €10,000 within 24 hours)
- Present time-series data showing how flagged activity has evolved

---

## Mock Data Schema

### Account
```
Account
  accountId       : UUID
  customerName    : String
  iban            : String
  accountType     : Enum (PERSONAL, BUSINESS, OFFSHORE)
  openedDate      : LocalDate
  riskRating      : Enum (LOW, MEDIUM, HIGH, PEP)
  amlFlags        : List<AmlFlag>
```

### AmlFlag
```
AmlFlag
  flagId          : UUID
  typology        : Enum (STRUCTURING, LAYERING, ROUND_TRIPPING, SHELL_NETWORK)
  confidenceScore : Integer (0–100)
  severity        : Enum (LOW, MEDIUM, HIGH, CRITICAL)
  detectedAt      : Instant
  recommendedAction : Enum (SAR, EDD, FREEZE, FIU_ESCALATION)
```

### TransactionEdge
```
TransactionEdge
  edgeId          : UUID
  fromAccountId   : UUID
  toAccountId     : UUID
  amount          : BigDecimal
  currency        : String
  hops            : Integer
  timestamp       : Instant
  isFlagged       : Boolean
```

### Seed Data
- **50 accounts** with relationship edges forming a directed transaction graph
- **10 accounts** pre-configured with embedded suspicious patterns across all four typologies
- Provided as `data/accounts.json` and `data/transaction-edges.json`

---

## Project Structure

```
compliance-monitor/
├── .github/
│   ├── agents/              # Custom specialist agents
│   ├── skills/              # Reusable deterministic skills
│   ├── hooks/               # Automated triggers
│   ├── instructions/        # Base & domain-specific rules
│   └── prompts/             # Reusable prompt templates
├── data/
│   ├── accounts.json        # Mock account data
│   ├── transaction-edges.json  # Mock transaction relationships
│   ├── aml-flags.json       # Pre-configured AML patterns
│   └── transactions.json    # Transaction history
├── src/                     # Implementation code
├── tests/                   # Test suite
├── BLUEPRINT.md             # Architecture & design
├── developer_todo.md        # Backlog items
└── COMPLIANCE_MONITOR_README.md  # This file
```

---

## Getting Started

### Phase 0: Environment Setup
Ensure your environment is ready:
- [ ] VS Code + GitHub Copilot extension installed
- [ ] Agent mode enabled and functional
- [ ] Chat debug view accessible (`...` menu → "Open Chat Debug View")
- [ ] `.github/` infrastructure directories created

### Phase 1: Blueprint & Research (~30 min)
Follow the [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md) guide:
1. Define the project and requirements (Ask mode)
2. Analyse the mock data schema
3. Sketch architecture and data flows
4. Produce `BLUEPRINT.md` and `developer_todo.md`

### Phase 2-5: Implementation
Execute incremental feature development using TDD:
- Create specialist agents for domain logic
- Build reusable skills for testing and validation
- Implement features layer by layer (data → business logic → UI)
- Maintain human-in-the-loop approval at key checkpoints

### Phase 6: Retrospective
Review what was built, what worked, and lessons learned.

---

## Key Decisions & Constraints

- **No backend required** — All data is static JSON
- **Graph visualisation** — Essential for showing transaction networks
- **Real-time feel** — Dashboard updates immediately on filtering/search
- **Compliance domain** — Must match regulatory terminology and workflows
- **Accessibility** — Compliance teams need clear, unambiguous UI

---

## References

- **Agentic Workflow Guide:** [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md)
- **Main Project README:** [README.md](README.md)
- **Migration Guide (Project 3):** [MIGRATION.md](MIGRATION.md)

---

**Ready to begin?** Start with Phase 0 of [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md).
