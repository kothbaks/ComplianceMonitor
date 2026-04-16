# Copilot Instructions

## Project Purpose
This project is a one-day proof-of-concept AML Pattern Detection Dashboard built as a fully client-side React application. It loads local JSON datasets for accounts, AML flags, transaction edges, and transactions, then helps compliance users detect suspicious activity through graph analysis, typology signals, and a ranked action queue. Prioritize clarity, deterministic behavior, and demo reliability over broad feature expansion.

## Code Style
- Use functional React components only.
- Use named exports only; avoid default exports unless a framework file requires one.
- Use Tailwind utility classes only for styling.
- Do not use inline style attributes or style objects.
- Use ISO 8601 format for all date/time values and comparisons.
- Use UPPER_SNAKE_CASE for enums and enum-like constants.
- Keep functions small and composable.
- Prefer pure functions for data transformation and AML scoring logic.

## Error Handling Expectations
- Never swallow errors.
- For data loading, handle and differentiate network, HTTP, parsing, and schema validation failures.
- Throw typed or clearly categorized errors from services.
- In hooks/components, convert low-level errors into clear user-facing messages.
- Always render safe fallback states: loading, empty, and error.
- Validate required fields from input JSON before using them in business logic.

## Documentation Expectations
- Add concise JSDoc for exported service and hook functions.
- Document assumptions for AML rules, especially thresholds and scoring behavior.
- Keep README and blueprint-aligned docs updated when APIs or behavior changes.
- Include short comments only where logic is non-obvious.

## Commit Expectations
- Keep commits focused and scoped to one task.
- Use clear commit messages with intent and scope (for example: feat(data-layer): add 24h threshold aggregation).
- Ensure tests relevant to changed code pass before committing.
- Do not mix unrelated refactors with feature or bug-fix commits.
- When adding rules or constants, include or update tests that prove behavior.
