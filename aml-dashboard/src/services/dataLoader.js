import { NetworkError, HttpError, ParseError } from './errors';
import {
  validateAccount,
  validateAmlFlag,
  validateEdge,
  validateTransaction,
  validateArray,
} from './validators';

const BASE_URL = '/data';

/**
 * Fetches a JSON file from the data directory and returns the parsed body.
 * Throws typed errors for network, HTTP, and parse failures.
 * @param {string} path - Filename within /data
 * @returns {Promise<unknown>} Parsed JSON
 */
async function fetchJson(path) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/${path}`);
  } catch (err) {
    throw new NetworkError(`Network error loading ${path}: ${err.message}`, err);
  }
  if (!response.ok) {
    throw new HttpError(
      `HTTP ${response.status} loading ${path}: ${response.statusText}`,
      response.status,
    );
  }
  try {
    return await response.json();
  } catch (err) {
    throw new ParseError(`Failed to parse JSON for ${path}: ${err.message}`, err);
  }
}

/**
 * Loads and validates the accounts dataset.
 * @returns {Promise<object[]>} Validated account records
 */
export async function loadAccounts() {
  const data = await fetchJson('accounts.json');
  return validateArray(data, validateAccount, 'accounts');
}

/**
 * Loads and validates the transaction edges dataset.
 * @returns {Promise<object[]>} Validated edge records
 */
export async function loadEdges() {
  const data = await fetchJson('transaction-edges.json');
  return validateArray(data, validateEdge, 'transaction-edges');
}

/**
 * Loads and validates the AML flags dataset.
 * @returns {Promise<object[]>} Validated AML flag records
 */
export async function loadFlags() {
  const data = await fetchJson('aml-flags.json');
  return validateArray(data, validateAmlFlag, 'aml-flags');
}

/**
 * Loads and validates the transactions dataset.
 * @returns {Promise<object[]>} Validated transaction records
 */
export async function loadTransactions() {
  const data = await fetchJson('transactions.json');
  return validateArray(data, validateTransaction, 'transactions');
}
