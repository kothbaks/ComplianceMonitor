---
applyTo: "src/**/{rules,rule,policy,policies,controls,control,compliance,evaluator,evaluation,scoring,risk,detector,detection}/**/*.*"
---

# Business logic (compliance evaluation &amp; evidence) instructions

## Intent
When working in business-logic code, prioritize correctness, determinism, and auditability. The output should be explainable: a user must be able to see *why* a control passed/failed and what evidence supports it.

## Conventions
- Model the domain explicitly (controls, findings, evidence, severity, remediation).
- Keep rules pure when possible: `input -> findings` with minimal side effects.
- Make scoring deterministic and stable (avoid time/randomness unless injected).
- Prefer small, composable rules over large branching functions.
- Store/return human-readable explanations alongside machine-readable codes/IDs.

## Error handling
- Validate rule inputs at boundaries; fail fast with clear error messages.
- Wrap unexpected errors with context: control ID, target identifier, and operation.
- Never log secrets or raw tokens contained in evidence.

## Testing expectations
- Unit test each rule/control with:
  - pass case, fail case, and edge cases (missing fields, empty evidence).
  - stable snapshots/fixtures for evidence normalization.
- Ensure tests assert both the decision and the explanation text/metadata.
