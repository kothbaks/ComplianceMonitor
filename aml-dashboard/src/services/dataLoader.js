/**
 * Data loader service for AML dashboard datasets.
 * All functions fetch local JSON files and throw typed errors on failure.
 */

/**
 * Base class for data loading errors.
 */
export class DataLoadError extends Error {
  constructor(message, category, details = {}) {
    super(message);
    this.name = 'DataLoadError';
    this.category = category;
    this.details = details;
  }
}

/**
 * Network-level failure (fetch rejected, CORS, timeout, etc.).
 */
export class NetworkError extends DataLoadError {
  constructor(message, details) {
    super(message, 'NETWORK', details);
    this.name = 'NetworkError';
  }
}

/**
 * HTTP-level failure (4xx, 5xx status codes).
 */
export class HttpError extends DataLoadError {
  constructor(message, statusCode, details) {
    super(message, 'HTTP', details);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

/**
 * JSON parse failure.
 */
export class ParseError extends DataLoadError {
  constructor(message, details) {
    super(message, 'PARSE', details);
    this.name = 'ParseError';
  }
}

/**
 * Schema validation failure (missing required fields).
 */
export class SchemaValidationError extends DataLoadError {
  constructor(message, details) {
    super(message, 'SCHEMA', details);
    this.name = 'SchemaValidationError';
  }
}

/**
 * Generic fetch and parse helper.
 * @param {string} url - The URL to fetch.
 * @param {string} datasetName - Human-readable dataset name for error messages.
 * @returns {Promise<any>} Parsed JSON data.
 * @throws {NetworkError} On network failure.
 * @throws {HttpError} On HTTP error status.
 * @throws {ParseError} On JSON parse failure.
 */
async function fetchJson(url, datasetName) {
  let response;
  
  try {
    response = await fetch(url);
  } catch (error) {
    throw new NetworkError(
      `Network failure loading ${datasetName}`,
      { url, originalError: error.message }
    );
  }

  if (!response.ok) {
    throw new HttpError(
      `HTTP ${response.status} loading ${datasetName}`,
      response.status,
      { url, statusText: response.statusText }
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new ParseError(
      `JSON parse failure loading ${datasetName}`,
      { url, originalError: error.message }
    );
  }

  return data;
}

/**
 * Loads accounts dataset from accounts.json.
 * @returns {Promise<Array>} Array of account objects.
 * @throws {DataLoadError} On fetch, HTTP, parse, or validation failure.
 */
export async function loadAccounts() {
  const data = await fetchJson('/data/accounts.json', 'accounts');
  
  if (!Array.isArray(data)) {
    throw new SchemaValidationError(
      'Accounts dataset is not an array',
      { receivedType: typeof data }
    );
  }

  // Validate required fields on first record as smoke test
  if (data.length > 0) {
    const required = ['accountId', 'customerName', 'iban', 'accountType', 'openedDate', 'riskRating'];
    const missing = required.filter(field => !(field in data[0]));
    if (missing.length > 0) {
      throw new SchemaValidationError(
        'Accounts missing required fields',
        { missingFields: missing, sampleRecord: data[0] }
      );
    }
  }

  return data;
}

/**
 * Loads transaction edges dataset from transaction-edges.json.
 * @returns {Promise<Array>} Array of edge objects.
 * @throws {DataLoadError} On fetch, HTTP, parse, or validation failure.
 */
export async function loadEdges() {
  const data = await fetchJson('/data/transaction-edges.json', 'transaction edges');
  
  if (!Array.isArray(data)) {
    throw new SchemaValidationError(
      'Transaction edges dataset is not an array',
      { receivedType: typeof data }
    );
  }

  // Validate required fields on first record as smoke test
  if (data.length > 0) {
    const required = ['edgeId', 'fromAccountId', 'toAccountId', 'amount', 'currency', 'timestamp'];
    const missing = required.filter(field => !(field in data[0]));
    if (missing.length > 0) {
      throw new SchemaValidationError(
        'Transaction edges missing required fields',
        { missingFields: missing, sampleRecord: data[0] }
      );
    }
  }

  return data;
}

/**
 * Loads AML flags dataset from aml-flags.json.
 * @returns {Promise<Array>} Array of flag objects.
 * @throws {DataLoadError} On fetch, HTTP, parse, or validation failure.
 */
export async function loadFlags() {
  const data = await fetchJson('/data/aml-flags.json', 'AML flags');
  
  if (!Array.isArray(data)) {
    throw new SchemaValidationError(
      'AML flags dataset is not an array',
      { receivedType: typeof data }
    );
  }

  // Validate required fields on first record as smoke test
  if (data.length > 0) {
    const required = ['flagId', 'accountId', 'typology', 'confidenceScore', 'severity', 'detectedAt'];
    const missing = required.filter(field => !(field in data[0]));
    if (missing.length > 0) {
      throw new SchemaValidationError(
        'AML flags missing required fields',
        { missingFields: missing, sampleRecord: data[0] }
      );
    }
  }

  return data;
}

/**
 * Loads transactions dataset from transactions.json.
 * @returns {Promise<Array>} Array of transaction objects.
 * @throws {DataLoadError} On fetch, HTTP, parse, or validation failure.
 */
export async function loadTransactions() {
  const data = await fetchJson('/data/transactions.json', 'transactions');
  
  if (!Array.isArray(data)) {
    throw new SchemaValidationError(
      'Transactions dataset is not an array',
      { receivedType: typeof data }
    );
  }

  // Validate required fields on first record as smoke test
  if (data.length > 0) {
    const required = ['transactionId', 'accountId', 'amount', 'currency', 'timestamp', 'type'];
    const missing = required.filter(field => !(field in data[0]));
    if (missing.length > 0) {
      throw new SchemaValidationError(
        'Transactions missing required fields',
        { missingFields: missing, sampleRecord: data[0] }
      );
    }
  }

  return data;
}
