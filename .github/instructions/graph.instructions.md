---
applyTo: "aml-dashboard/src/components/graph/**"
---

# Graph UI Instructions

## Always Do
- Use Cytoscape.js conventions with clear separation between element data, layout config, and interaction handlers.
- Use the cose-bilkent layout unless a task explicitly requires a different layout.
- Render flagged edges with color #EF4444 and keep non-flagged edges visually distinct.
- Keep React components functional and use named exports only.
- Keep graph state transitions explicit: loading, empty, error, success.
- Keep graph presentation logic separate from AML scoring/business rules.
- Use Tailwind utility classes only for surrounding UI containers and controls.

## Never Do
- Never embed AML detection logic directly in graph components.
- Never use inline style attributes or style objects for component styling.
- Never trigger full graph reinitialization for small interaction updates when targeted updates suffice.
- Never hide graph render failures; always show safe fallback UI.
- Never couple graph component internals to unrelated compliance panel state.

## Security and Performance Concerns
- Sanitize/validate node and edge identifiers before creating Cytoscape elements.
- Minimize layout reruns; prefer memoized element transforms and bounded effect dependencies.
- Avoid expensive recalculation on every render for static datasets.
- Protect responsiveness under higher edge counts by reducing unnecessary DOM/Cytoscape updates.
- Keep interaction handlers lightweight to avoid UI jank during pan/zoom/select operations.
