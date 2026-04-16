/**
 * Categorized error types for data loading failures.
 * Consumers can use instanceof checks to differentiate failure modes.
 */

/** Thrown when a network-level failure occurs (fetch could not connect). */
export class NetworkError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

/** Thrown when the server returns a non-2xx HTTP status. */
export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Thrown when the response body cannot be parsed as JSON. */
export class ParseError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'ParseError';
    this.cause = cause;
  }
}

/** Thrown when parsed data does not match the expected schema. */
export class SchemaError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'SchemaError';
    this.field = field;
  }
}
