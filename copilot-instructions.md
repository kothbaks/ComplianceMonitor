# Copilot instructions

## Project purpose
ComplianceMonitor is a repository for building and operating tooling that monitors systems and artifacts for compliance requirements, captures evidence, and produces actionable reporting/alerts to help teams detect drift and remediate non-compliant states.

## Code style conventions
- Prefer clear, intention-revealing names. Use:
  - `snake_case` for file names unless the existing project convention differs.
  - `PascalCase` for types/classes.
  - `camelCase` for variables, parameters, and functions/methods.
  - `UPPER_SNAKE_CASE` for constants and environment variables.
- Keep modules small and focused. One primary responsibility per file.
- Organize code by feature/domain first (e.g., `src/<feature>/...`) and by technical layer second (e.g., `controllers`, `services`, `clients`, `models`, `utils`).
- Prefer pure functions and dependency injection where practical to improve testability.
- Avoid large “god” utilities; create narrowly-scoped helpers.
- Formatting:
  - Use an auto-formatter/linter if present in the repo; do not fight it.
  - Keep lines reasonably short (aim ~100 chars) unless unavoidable.
  - Use consistent import ordering (stdlib/third-party/internal) when applicable.

## Universal error handling expectations
- Never swallow errors silently.
- Add context when rethrowing/wrapping errors (include the operation and key identifiers).
- Validate external inputs at boundaries (API requests, CLI args, file/env configuration). Return/raise helpful, user-safe messages.
- Log errors with enough context to debug (request id/correlation id, component, inputs minus secrets).
- Do not log secrets (tokens, passwords, private keys, full certificates). Redact sensitive fields.
- Prefer typed/domain-specific errors where the language supports it; map them to clear exit codes/HTTP responses.
- Ensure resources are cleaned up (files, network connections) via `finally`/defer patterns.

## Commit and documentation expectations
- Write commits in imperative mood and keep them scoped (one logical change per commit).
- Prefer Conventional Commits when possible (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Update or add tests alongside behavior changes.
- Update documentation when changing behavior, configuration, APIs, or developer workflows.
- Public-facing changes should include:
  - clear README updates (setup, usage, configuration)
  - examples (sample config, CLI examples, or API snippets) when applicable
  - notes on backwards compatibility or migration steps if needed
