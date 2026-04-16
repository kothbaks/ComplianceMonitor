import { ACCOUNT_TYPES, TYPOLOGIES, SEVERITIES, RISK_RATINGS, RECOMMENDED_ACTIONS } from '../utils/constants';
import { SchemaError } from './errors';

const REQUIRED_STRING = (field, value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SchemaError(`Missing or invalid field: ${field}`, field);
  }
};

const REQUIRED_NUMBER = (field, value) => {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new SchemaError(`Missing or invalid field: ${field}`, field);
  }
};

const REQUIRED_BOOLEAN = (field, value) => {
  if (typeof value !== 'boolean') {
    throw new SchemaError(`Missing or invalid field: ${field}`, field);
  }
};

const VALID_ISO_DATE = (field, value) => {
  if (typeof value !== 'string' || isNaN(Date.parse(value))) {
    throw new SchemaError(`Invalid ISO 8601 date for field: ${field}`, field);
  }
};

const VALID_ENUM = (field, value, allowed) => {
  if (!allowed.includes(value)) {
    throw new SchemaError(`Invalid enum value for ${field}: ${value}`, field);
  }
};

/**
 * Validates a single AML flag object (embedded in an account).
 * @param {object} flag
 * @returns {object} flag if valid
 */
function validateFlag(flag) {
  if (!flag || typeof flag !== 'object') throw new SchemaError('AML flag must be an object', 'flag');
  REQUIRED_STRING('flagId', flag.flagId);
  VALID_ENUM('typology', flag.typology, TYPOLOGIES);
  REQUIRED_NUMBER('confidenceScore', flag.confidenceScore);
  VALID_ENUM('severity', flag.severity, SEVERITIES);
  VALID_ISO_DATE('detectedAt', flag.detectedAt);
  VALID_ENUM('recommendedAction', flag.recommendedAction, RECOMMENDED_ACTIONS);
  return flag;
}

/**
 * Validates a single Account record.
 * @param {object} account
 * @returns {object} account if valid
 */
export function validateAccount(account) {
  if (!account || typeof account !== 'object') throw new SchemaError('Account must be an object', 'account');
  REQUIRED_STRING('accountId', account.accountId);
  REQUIRED_STRING('customerName', account.customerName);
  REQUIRED_STRING('iban', account.iban);
  VALID_ENUM('accountType', account.accountType, ACCOUNT_TYPES);
  REQUIRED_STRING('openedDate', account.openedDate);
  VALID_ENUM('riskRating', account.riskRating, RISK_RATINGS);
  if (!Array.isArray(account.amlFlags)) throw new SchemaError('amlFlags must be an array', 'amlFlags');
  account.amlFlags.forEach((f, i) => {
    try {
      validateFlag(f);
    } catch (err) {
      throw new SchemaError(`Account ${account.accountId} amlFlags[${i}]: ${err.message}`, err.field);
    }
  });
  return account;
}

/**
 * Validates a single AML flag record (standalone, from aml-flags.json).
 * @param {object} flag
 * @returns {object} flag if valid
 */
export function validateAmlFlag(flag) {
  if (!flag || typeof flag !== 'object') throw new SchemaError('AML flag must be an object', 'flag');
  REQUIRED_STRING('flagId', flag.flagId);
  REQUIRED_STRING('accountId', flag.accountId);
  VALID_ENUM('typology', flag.typology, TYPOLOGIES);
  REQUIRED_NUMBER('confidenceScore', flag.confidenceScore);
  VALID_ENUM('severity', flag.severity, SEVERITIES);
  VALID_ISO_DATE('detectedAt', flag.detectedAt);
  VALID_ENUM('recommendedAction', flag.recommendedAction, RECOMMENDED_ACTIONS);
  return flag;
}

/**
 * Validates a single TransactionEdge record.
 * @param {object} edge
 * @returns {object} edge if valid
 */
export function validateEdge(edge) {
  if (!edge || typeof edge !== 'object') throw new SchemaError('Edge must be an object', 'edge');
  REQUIRED_STRING('edgeId', edge.edgeId);
  REQUIRED_STRING('fromAccountId', edge.fromAccountId);
  REQUIRED_STRING('toAccountId', edge.toAccountId);
  REQUIRED_NUMBER('amount', edge.amount);
  REQUIRED_STRING('currency', edge.currency);
  REQUIRED_NUMBER('hops', edge.hops);
  VALID_ISO_DATE('timestamp', edge.timestamp);
  REQUIRED_BOOLEAN('isFlagged', edge.isFlagged);
  return edge;
}

/**
 * Validates a single Transaction record.
 * @param {object} tx
 * @returns {object} tx if valid
 */
export function validateTransaction(tx) {
  if (!tx || typeof tx !== 'object') throw new SchemaError('Transaction must be an object', 'transaction');
  REQUIRED_STRING('transactionId', tx.transactionId);
  REQUIRED_STRING('accountId', tx.accountId);
  REQUIRED_NUMBER('amount', tx.amount);
  REQUIRED_STRING('currency', tx.currency);
  VALID_ISO_DATE('timestamp', tx.timestamp);
  return tx;
}

/**
 * Validates an array of records using the provided per-item validator.
 * @param {unknown} data
 * @param {Function} itemValidator
 * @param {string} datasetName
 * @returns {object[]} validated array
 */
export function validateArray(data, itemValidator, datasetName) {
  if (!Array.isArray(data)) {
    throw new SchemaError(`${datasetName}: expected array, got ${typeof data}`, datasetName);
  }
  return data.map((item, i) => {
    try {
      return itemValidator(item);
    } catch (err) {
      throw new SchemaError(`${datasetName}[${i}]: ${err.message}`, err.field);
    }
  });
}
