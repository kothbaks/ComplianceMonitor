---
applyTo: "{src,app}/**/{integrations,connectors,clients,adapters,providers,ingest,ingestion,fetchers}/**/*.*"
---

# Integrations &amp; data ingestion (connectors) instructions

## Intent
Connector code should be resilient, observable, and safe with credentials. It should convert external system data into internal domain models cleanly.

## Conventions
- Keep transport concerns separate from mapping:
  - `Client` = HTTP/API calls + pagination + retries
  - `Mapper/Translator` = external -&gt; internal models
  - `Service` = orchestration and scheduling
- Prefer dependency injection for HTTP clients/time to simplify tests.
- Respect external API limits: pagination, throttling, backoff.
- Add structured logging (component, endpoint, correlation id), never raw bodies if they can contain secrets.

## Error handling
- Classify errors:
  - transient (timeouts, 429/5xx) =&gt; retry with backoff
  - permanent (4xx auth/validation) =&gt; fail with actionable message
- Always include enough context for debugging: provider name, operation, resource id.
- Never include credentials in exceptions, logs, or returned errors.

## Testing expectations
- Unit test mapping logic with fixtures.
- Integration tests should mock network calls; avoid flaky live-network tests.
- Assert retry behavior and error classification where relevant.
