applyTo: "aml-dashboard/src/components/{compliance,aml}/**"
---

# Compliance UI Instructions

## Always Do
- Use severity and action mappings from centralized constants.
- Keep priority queue ordering deterministic and aligned with service ranking output.
- Show clear rationale fields in account actions (typology, confidence, threshold/cycle signals when available).
- Implement safe UI states for loading, empty, and error.
- Keep components functional and use named exports only.
- Use Tailwind utilities only; maintain consistency with project severity colors.
- Apply the same severity, typology, and badge conventions across both compliance panels and AML summary/chart components.
- Preserve one-day POC focus: clear investigation flow first, polish second.

## Never Do
- Never invent or recompute risk scores in UI when service outputs exist.
- Never hardcode severity labels/colors directly in components when constants are available.
- Never display internal/low-level error traces to end users.
- Never bypass pagination/filter state contracts exposed by hooks.
- Never mix graph rendering logic into compliance components.

## Security and Performance Concerns
- Ensure user-visible text is safe and resilient to malformed source values.
- Keep list rendering efficient with stable keys and minimal recalculation.
- Avoid broad rerenders by deriving filtered/paginated subsets via memoized selectors where appropriate.
- Preserve auditability by ensuring displayed rank/order exactly matches underlying scored data.
- Prevent action ambiguity by using consistent badge semantics for EDD, SAR, FREEZE, and FIU escalation.
