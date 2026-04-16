/**
 * AML detection service for pattern identification and risk scoring.
 * All functions are pure and do not mutate input data.
 */

import { STRUCTURING_MIN, STRUCTURING_MAX, THRESHOLD_AMOUNT, SEVERITY_SCORE } from '../utils/constants';

/**
 * Filters edges to find structuring patterns (amounts between 9000-9999).
 * Structuring is a technique to evade reporting thresholds by breaking large transactions
 * into smaller amounts just below regulatory limits.
 * @param {Array} edges - Array of transaction edge objects with amount field.
 * @returns {Array} Filtered array of edges with amounts in structuring range.
 */
export function getStructuringEdges(edges) {
  if (!Array.isArray(edges)) {
    throw new TypeError('edges must be an array');
  }

  return edges.filter((edge) => {
    return typeof edge.amount === 'number' && 
           edge.amount >= STRUCTURING_MIN && 
           edge.amount <= STRUCTURING_MAX;
  });
}

/**
 * Aggregates transaction amounts by account per 24-hour window.
 * Groups edges by source account and calendar day (ISO 8601 date string).
 * @param {Array} edges - Array of edge objects with fromAccountId, amount, and timestamp.
 * @returns {Array} Array of aggregation objects with accountId, day, total, and edges array.
 */
export function aggregateByAccount24h(edges) {
  if (!Array.isArray(edges)) {
    throw new TypeError('edges must be an array');
  }

  const groups = new Map();
  
  for (const edge of edges) {
    if (!edge.fromAccountId || typeof edge.amount !== 'number' || !edge.timestamp) {
      continue; // Skip edges with missing required fields
    }

    let date;
    try {
      date = new Date(edge.timestamp);
      // Validate date is valid
      if (isNaN(date.getTime())) {
        continue;
      }
    } catch (error) {
      continue; // Skip edges with malformed timestamps
    }

    // Extract YYYY-MM-DD from ISO 8601 timestamp
    const dayKey = date.toISOString().slice(0, 10);
    const key = `${edge.fromAccountId}|${dayKey}`;
    
    if (!groups.has(key)) {
      groups.set(key, { 
        accountId: edge.fromAccountId, 
        day: dayKey, 
        total: 0, 
        edges: [] 
      });
    }
    
    const group = groups.get(key);
    group.total += edge.amount;
    group.edges.push(edge);
  }
  
  return Array.from(groups.values());
}

/**
 * Checks if an amount exceeds the AML reporting threshold.
 * @param {number} sum - The aggregated transaction amount to check.
 * @returns {boolean} True if sum exceeds threshold (>10000), false otherwise.
 */
export function breachesThreshold(sum) {
  if (typeof sum !== 'number') {
    throw new TypeError('sum must be a number');
  }
  return sum > THRESHOLD_AMOUNT;
}

/**
 * Finds all 24-hour windows where accounts exceeded the reporting threshold.
 * Helper function combining aggregation and threshold checking.
 * @param {Array} edges - Array of transaction edges.
 * @returns {Array} Array of aggregations that breach the threshold.
 */
export function getThresholdBreaches(edges) {
  const aggregated = aggregateByAccount24h(edges);
  return aggregated.filter((group) => breachesThreshold(group.total));
}

/**
 * Ranks accounts by AML risk priority based on flags, severity, and confidence.
 * Calculates risk score using severity, confidence, and flag count.
 * Returns sorted array with highest-risk accounts first.
 * @param {Array} accounts - Array of account objects.
 * @param {Array} edges - Array of transaction edges (reserved for future use).
 * @param {Array} flags - Array of AML flag objects with accountId, severity, and confidenceScore.
 * @returns {Array} Sorted array of accounts with computed risk metrics (only flagged accounts).
 */
export function rankAccounts(accounts, edges, flags) {
  if (!Array.isArray(accounts)) {
    throw new TypeError('accounts must be an array');
  }
  if (!Array.isArray(flags)) {
    throw new TypeError('flags must be an array');
  }
  // edges parameter reserved for future volume-based risk scoring

  const accountsWithFlags = accounts.map((account) => {
    const accountFlags = flags.filter((flag) => flag.accountId === account.accountId);
    
    // Calculate maximum severity score
    const maxSeverity = accountFlags.reduce((max, flag) => {
      const score = SEVERITY_SCORE[flag.severity] || 0;
      return score > max ? score : max;
    }, 0);
    
    // Calculate maximum confidence score
    const maxConfidence = accountFlags.reduce((max, flag) => {
      return Math.max(max, flag.confidenceScore || 0);
    }, 0);
    
    const flagCount = accountFlags.length;
    
    // Composite risk score: severity weighted by confidence, boosted by flag count
    const riskScore = flagCount > 0
      ? Math.min(100, Math.round(maxSeverity * (maxConfidence / 100) * (1 + 0.1 * flagCount)))
      : 0;
    
    return { 
      ...account, 
      flags: accountFlags, 
      flagCount, 
      maxSeverity, 
      maxConfidence, 
      riskScore 
    };
  });

  // Return only flagged accounts, sorted by severity, confidence, then flag count
  return accountsWithFlags
    .filter((account) => account.flagCount > 0)
    .sort((a, b) => {
      if (b.maxSeverity !== a.maxSeverity) return b.maxSeverity - a.maxSeverity;
      if (b.maxConfidence !== a.maxConfidence) return b.maxConfidence - a.maxConfidence;
      return b.flagCount - a.flagCount;
    });
}
