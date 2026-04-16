---
applyTo: "aml-dashboard/src/{services,hooks}/**"
---

# Data Layer Instructions

## Always Do
- Treat all source datasets as untrusted input and validate required fields before use.
- Differentiate and propagate categorized errors for network, HTTP, JSON parse, and schema validation failures.
- Keep transformation and scoring logic pure and deterministic where possible.
- Keep service and hook functions small and composable.
- Use ISO 8601 date handling for all time comparisons and 24-hour AML windows.
- Use named exports only and add concise JSDoc for exported service and hook functions.
- Keep one-day POC scope in mind: prioritize correctness and demo reliability over abstractions.

## Never Do
- Never swallow errors or return silent fallbacks that hide data-quality problems.
- Never mutate input arrays/objects directly in analysis functions.
- Never mix UI rendering concerns into service-level logic.
- Never hardcode magic numbers for AML thresholds without constants and tests.
- Never assume accountId formats are compatible across all datasets without normalization.

## Security and Performance Concerns
- Guard against malformed or oversized records by validating shape before processing.
- Avoid repeated O(n^2) scans when a map/grouped structure can be reused.
- Avoid recomputing expensive aggregations in hooks unless inputs change.
- Ensure ranking and threshold calculations are deterministic to avoid audit confusion.
- Surface safe, user-facing error messages in hooks while preserving categorized error context for debugging.
