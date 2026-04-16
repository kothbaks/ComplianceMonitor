---
mode: data-layer
tools:
  - read
  - write
  - terminal
reference_agents:
  - data-layer
---

# Load AML Data Workflow Prompt

## Overview
You are loading and transforming JSON data files from `data/` into in-memory JavaScript structures that power the AML dashboard. This workflow ensures data is validated, error-handled, and accessible to the rest of the application via the data layer.

## Data Files
- `data/accounts.json` — 50 account records with accountId, customerName, iban, accountType, openedDate, riskRating, amlFlags
- `data/aml-flags.json` — AML typology flags with flagId, typology (STRUCTURING, LAYERING, ROUND_TRIPPING, SHELL_NETWORK), confidenceScore, severity, detectedAt, recommendedAction
- `data/transactions.json` — Transaction history with transactionId, accountId, timestamp, amount, currency, counterpartyId
- `data/transaction-edges.json` — Transaction relationships with edgeId, fromAccountId, toAccountId, amount, currency, hops, timestamp, isFlagged

## Step 1 — Understand the Data Schema
Read the JSON files to understand their structure:
- [ ] Read `data/accounts.json` — note field names, types (UUID, Enum, LocalDate)
- [ ] Read `data/aml-flags.json` — note typology values and confidence score range
- [ ] Read `data/transactions.json` — note timestamp format (ISO 8601)
- [ ] Read `data/transaction-edges.json` — note hops field and edge relationships

Document any assumptions about data shape (required fields, missing data, null handling).

## Step 2 — Design Data Loading Service
Plan the loader function in `aml-dashboard/src/services/dataLoader.js`:

**Responsibilities:**
- Fetch each JSON file via relative paths
- Parse and validate schema (check required fields exist)
- Handle errors: network, parse, schema validation
- Return an object: `{ accounts, amlFlags, transactions, edges }`

**Error Handling:**
- Network error (file not found) → throw `DataLoadError('FILE_NOT_FOUND', filename)`
- Parse error (invalid JSON) → throw `DataLoadError('PARSE_ERROR', filename, details)`
- Schema error (missing required field) → throw `DataLoadError('SCHEMA_INVALID', filename, field)`

**Function signature:**
```javascript
/**
 * Load all AML data files in parallel.
 * @returns {Promise<{ accounts, amlFlags, transactions, edges }>}
 * @throws {DataLoadError} if any file fails to load or validate
 */
export async function loadAmlData() { ... }
```

## Step 3 — Write Tests First (TDD)
Create `aml-dashboard/src/services/__tests__/dataLoader.test.js`.

**Test cases to write (before implementation):**
1. Test: `loadAmlData` loads all four files successfully
2. Test: `loadAmlData` throws DataLoadError on missing file
3. Test: `loadAmlData` throws DataLoadError on invalid JSON
4. Test: `loadAmlData` throws DataLoadError on schema mismatch (missing required field)
5. Test: `loadAmlData` returns object with accounts, amlFlags, transactions, edges keys

Write the tests without implementation. Use mock JSON fixtures for test data. Confirm tests fail before proceeding.

## Step 4 — Implement Data Loader
Implement `aml-dashboard/src/services/dataLoader.js`:

**Checklist:**
- [ ] Define `DataLoadError` class (extends Error, has code and details properties)
- [ ] Fetch all four JSON files using `fetch()`
- [ ] Parse JSON and catch parse errors
- [ ] Validate schema: check required fields per mock data structure
- [ ] Return object with accounts, amlFlags, transactions, edges
- [ ] All tests pass before moving on

## Step 5 — Design Data Transformation Functions (Optional)
If needed, add optional transformers in dataLoader.js:

**Examples:**
- `enrichAccountsWithFlags(accounts, amlFlags)` — attach flags to account objects
- `calculateThresholdBreaches(transactions)` — detect €10k/24h breaches
- `aggregateTransactionsByDate(edges)` — time-series helper

Keep transformers pure (no side effects) and testable.

## Step 6 — Create useData Hook
Create `aml-dashboard/src/hooks/useData.js` to wrap the loader:

**Hook responsibilities:**
- Call `loadAmlData()` on component mount
- Track loading, error, and data states
- Return `{ data, loading, error, refetch }`
- Convert service errors to user-facing messages

**Function signature:**
```javascript
/**
 * Load AML data on mount.
 * @returns {{ data: {accounts, amlFlags, transactions, edges}, loading: boolean, error: Error|null, refetch: () => void }}
 */
export function useData() { ... }
```

## Step 7 — Test the Hook
Create `aml-dashboard/src/hooks/__tests__/useData.test.js`.

**Test cases:**
1. Test: `useData` returns loading=true initially
2. Test: `useData` returns data when load succeeds
3. Test: `useData` returns error when load fails
4. Test: `useData` refetch clears error and reloads data

Confirm all tests pass.

## Step 8 — Integration Checkpoint
In the main app (`aml-dashboard/src/App.jsx`):

- [ ] Call `useData()` at top level
- [ ] Display loading spinner while `loading === true`
- [ ] Display error banner if error exists
- [ ] Pass data to child components once loaded
- [ ] Verify in dev server (http://localhost:5173):
  - Network tab shows all four JSON files with 200 status
  - Data loads within 2 seconds
  - No console errors

## Acceptance Criteria
- All data files load successfully
- Schema validation works (rejects malformed data)
- Error handling differentiates network, parse, and schema errors
- useData hook returns correct state shape
- All tests pass: `npm test -- dataLoader.test.js useData.test.js`
- App displays data without errors in dev server

## Reference
- Mock data schema: `README.md` "Mock Data Schema"
- Error handling guidance: `.github/instructions/data-layer.instructions.md`
- Hook patterns: React Hooks documentation + existing hooks in project

