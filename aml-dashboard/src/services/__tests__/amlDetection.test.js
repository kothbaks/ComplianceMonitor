import { describe, it, expect } from 'vitest';
import {
  getStructuringEdges,
  aggregateByAccount24h,
  breachesThreshold,
  getThresholdBreaches,
  rankAccounts,
} from '../amlDetection';
import { STRUCTURING_MIN, STRUCTURING_MAX, THRESHOLD_AMOUNT } from '../../utils/constants';

/** Build a minimal edge fixture. */
function makeEdge(overrides = {}) {
  return {
    edgeId: 'e1',
    fromAccountId: 'acc-1',
    toAccountId: 'acc-2',
    amount: 5000,
    currency: 'EUR',
    hops: 1,
    timestamp: '2024-01-01T10:00:00Z',
    isFlagged: false,
    ...overrides,
  };
}

/** Build a minimal account fixture. */
function makeAccount(overrides = {}) {
  return {
    accountId: 'acc-1',
    customerName: 'Alice',
    riskRating: 'LOW',
    amlFlags: [],
    ...overrides,
  };
}

/** Build a minimal AML flag fixture. */
function makeFlag(overrides = {}) {
  return {
    flagId: 'flag-1',
    accountId: 'acc-1',
    typology: 'STRUCTURING',
    confidenceScore: 80,
    severity: 'HIGH',
    detectedAt: '2024-01-01T00:00:00Z',
    recommendedAction: 'SAR',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Constants sanity checks
// ---------------------------------------------------------------------------
describe('AML constants', () => {
  it('STRUCTURING_MIN should be 9000', () => {
    expect(STRUCTURING_MIN).toBe(9000);
  });

  it('STRUCTURING_MAX should be 9999', () => {
    expect(STRUCTURING_MAX).toBe(9999);
  });

  it('THRESHOLD_AMOUNT should be 10000', () => {
    expect(THRESHOLD_AMOUNT).toBe(10000);
  });
});

// ---------------------------------------------------------------------------
// getStructuringEdges — boundary tests
// ---------------------------------------------------------------------------
describe('getStructuringEdges', () => {
  it('should include an edge with amount exactly at STRUCTURING_MIN (9000)', () => {
    const edges = [makeEdge({ amount: 9000 })];
    expect(getStructuringEdges(edges)).toHaveLength(1);
  });

  it('should include an edge with amount exactly at STRUCTURING_MAX (9999)', () => {
    const edges = [makeEdge({ amount: 9999 })];
    expect(getStructuringEdges(edges)).toHaveLength(1);
  });

  it('should exclude an edge just below STRUCTURING_MIN (8999)', () => {
    const edges = [makeEdge({ amount: 8999 })];
    expect(getStructuringEdges(edges)).toHaveLength(0);
  });

  it('should exclude an edge at exactly 10000 (above structuring range)', () => {
    const edges = [makeEdge({ amount: 10000 })];
    expect(getStructuringEdges(edges)).toHaveLength(0);
  });

  it('should handle an empty edge list', () => {
    expect(getStructuringEdges([])).toHaveLength(0);
  });

  it('should return only edges within the structuring range from a mixed list', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', amount: 8999 }),
      makeEdge({ edgeId: 'e2', amount: 9000 }),
      makeEdge({ edgeId: 'e3', amount: 9500 }),
      makeEdge({ edgeId: 'e4', amount: 9999 }),
      makeEdge({ edgeId: 'e5', amount: 10000 }),
    ];
    const result = getStructuringEdges(edges);
    expect(result).toHaveLength(3);
    expect(result.map((e) => e.edgeId)).toEqual(['e2', 'e3', 'e4']);
  });

  it('should not mutate the input array', () => {
    const edges = [makeEdge({ amount: 9500 })];
    const original = [...edges];
    getStructuringEdges(edges);
    expect(edges).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// breachesThreshold — boundary tests
// ---------------------------------------------------------------------------
describe('breachesThreshold', () => {
  it('should return false when total is exactly 10000', () => {
    expect(breachesThreshold(10000)).toBe(false);
  });

  it('should return false when total is below 10000 (9999)', () => {
    expect(breachesThreshold(9999)).toBe(false);
  });

  it('should return true when total is 10000.01 (just above threshold)', () => {
    expect(breachesThreshold(10000.01)).toBe(true);
  });

  it('should return true when total is well above threshold (50000)', () => {
    expect(breachesThreshold(50000)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(breachesThreshold(0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// aggregateByAccount24h
// ---------------------------------------------------------------------------
describe('aggregateByAccount24h', () => {
  it('should aggregate totals for the same account on the same calendar day', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', amount: 5000, timestamp: '2024-01-01T08:00:00Z' }),
      makeEdge({ edgeId: 'e2', amount: 6000, timestamp: '2024-01-01T20:00:00Z' }),
    ];
    const result = aggregateByAccount24h(edges);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(11000);
  });

  it('should produce separate groups for the same account on different calendar days', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', amount: 5000, timestamp: '2024-01-01T10:00:00Z' }),
      makeEdge({ edgeId: 'e2', amount: 6000, timestamp: '2024-01-02T10:00:00Z' }),
    ];
    const result = aggregateByAccount24h(edges);
    expect(result).toHaveLength(2);
  });

  it('should produce separate groups for different accounts on the same day', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', fromAccountId: 'acc-1', amount: 5000, timestamp: '2024-01-01T10:00:00Z' }),
      makeEdge({ edgeId: 'e2', fromAccountId: 'acc-2', amount: 6000, timestamp: '2024-01-01T10:00:00Z' }),
    ];
    const result = aggregateByAccount24h(edges);
    expect(result).toHaveLength(2);
  });

  it('should return an empty array for empty input', () => {
    expect(aggregateByAccount24h([])).toHaveLength(0);
  });

  it('should store day as ISO 8601 date string (YYYY-MM-DD)', () => {
    const edges = [makeEdge({ timestamp: '2024-06-15T23:00:00Z' })];
    const result = aggregateByAccount24h(edges);
    expect(result[0].day).toBe('2024-06-15');
  });
});

// ---------------------------------------------------------------------------
// getThresholdBreaches
// ---------------------------------------------------------------------------
describe('getThresholdBreaches', () => {
  it('should detect a breach when daily total exceeds 10000', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', amount: 6000, timestamp: '2024-01-01T10:00:00Z' }),
      makeEdge({ edgeId: 'e2', amount: 5000, timestamp: '2024-01-01T14:00:00Z' }),
    ];
    const breaches = getThresholdBreaches(edges);
    expect(breaches).toHaveLength(1);
    expect(breaches[0].total).toBe(11000);
  });

  it('should not report a breach when daily total is exactly 10000', () => {
    const edges = [
      makeEdge({ edgeId: 'e1', amount: 5000, timestamp: '2024-01-01T10:00:00Z' }),
      makeEdge({ edgeId: 'e2', amount: 5000, timestamp: '2024-01-01T14:00:00Z' }),
    ];
    expect(getThresholdBreaches(edges)).toHaveLength(0);
  });

  it('should return empty for an empty edge list', () => {
    expect(getThresholdBreaches([])).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// rankAccounts
// ---------------------------------------------------------------------------
describe('rankAccounts', () => {
  it('should return only accounts with at least one flag', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1' }),
      makeAccount({ accountId: 'acc-2' }),
    ];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    const result = rankAccounts(accounts, flags);
    expect(result).toHaveLength(1);
    expect(result[0].accountId).toBe('acc-1');
  });

  it('should rank higher severity accounts first', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1' }),
      makeAccount({ accountId: 'acc-2' }),
    ];
    const flags = [
      makeFlag({ accountId: 'acc-1', severity: 'MEDIUM', confidenceScore: 90 }),
      makeFlag({ accountId: 'acc-2', severity: 'CRITICAL', confidenceScore: 50 }),
    ];
    const result = rankAccounts(accounts, flags);
    expect(result[0].accountId).toBe('acc-2');
    expect(result[1].accountId).toBe('acc-1');
  });

  it('should use confidence score as tiebreaker when severity is equal', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1' }),
      makeAccount({ accountId: 'acc-2' }),
    ];
    const flags = [
      makeFlag({ accountId: 'acc-1', severity: 'HIGH', confidenceScore: 60 }),
      makeFlag({ accountId: 'acc-2', severity: 'HIGH', confidenceScore: 90 }),
    ];
    const result = rankAccounts(accounts, flags);
    expect(result[0].accountId).toBe('acc-2');
  });

  it('should use flag count as second tiebreaker when severity and confidence are equal', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1' }),
      makeAccount({ accountId: 'acc-2' }),
    ];
    const flags = [
      makeFlag({ flagId: 'f1', accountId: 'acc-1', severity: 'HIGH', confidenceScore: 80 }),
      makeFlag({ flagId: 'f2', accountId: 'acc-2', severity: 'HIGH', confidenceScore: 80 }),
      makeFlag({ flagId: 'f3', accountId: 'acc-2', severity: 'LOW', confidenceScore: 30 }),
    ];
    const result = rankAccounts(accounts, flags);
    expect(result[0].accountId).toBe('acc-2');
  });

  it('should produce deterministic order for identical inputs', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1' }),
      makeAccount({ accountId: 'acc-2' }),
    ];
    const flags = [
      makeFlag({ accountId: 'acc-1', severity: 'HIGH', confidenceScore: 80 }),
      makeFlag({ accountId: 'acc-2', severity: 'HIGH', confidenceScore: 80 }),
    ];
    const first = rankAccounts(accounts, flags).map((a) => a.accountId);
    const second = rankAccounts(accounts, flags).map((a) => a.accountId);
    expect(first).toEqual(second);
  });

  it('should return empty array when no accounts have flags', () => {
    const accounts = [makeAccount({ accountId: 'acc-1' })];
    expect(rankAccounts(accounts, [])).toHaveLength(0);
  });

  it('should attach flags and riskScore to each ranked account', () => {
    const accounts = [makeAccount({ accountId: 'acc-1' })];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    const [ranked] = rankAccounts(accounts, flags);
    expect(ranked.flags).toBeDefined();
    expect(ranked.riskScore).toBeGreaterThan(0);
    expect(ranked.maxSeverity).toBeGreaterThan(0);
    expect(ranked.maxConfidence).toBeGreaterThan(0);
  });
});
