import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAccounts, loadEdges, loadFlags, loadTransactions } from '../dataLoader';
import { NetworkError, HttpError, ParseError, SchemaError } from '../errors';

/** Minimal valid fixture objects matching the schema. */
const VALID_FLAG_EMBEDDED = {
  flagId: 'flag-1',
  typology: 'STRUCTURING',
  confidenceScore: 80,
  severity: 'HIGH',
  detectedAt: '2024-01-01T00:00:00Z',
  recommendedAction: 'SAR',
};

const VALID_ACCOUNT = {
  accountId: 'acc-1',
  customerName: 'Alice',
  iban: 'GB00TEST0001',
  accountType: 'PERSONAL',
  openedDate: '2020-01-01',
  riskRating: 'HIGH',
  amlFlags: [VALID_FLAG_EMBEDDED],
};

const VALID_FLAG_STANDALONE = {
  flagId: 'flag-1',
  accountId: 'acc-1',
  typology: 'STRUCTURING',
  confidenceScore: 80,
  severity: 'HIGH',
  detectedAt: '2024-01-01T00:00:00Z',
  recommendedAction: 'SAR',
};

const VALID_EDGE = {
  edgeId: 'edge-1',
  fromAccountId: 'acc-1',
  toAccountId: 'acc-2',
  amount: 9500,
  currency: 'EUR',
  hops: 2,
  timestamp: '2024-01-01T00:00:00Z',
  isFlagged: true,
};

const VALID_TRANSACTION = {
  transactionId: 'tx-1',
  accountId: 'acc-1',
  amount: 500,
  currency: 'EUR',
  timestamp: '2024-01-01T00:00:00Z',
};

/** Helper to set up a successful mock fetch returning the given JSON body. */
function mockFetchOk(body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

/** Helper to set up a mock fetch returning a non-2xx status. */
function mockFetchHttpError(status, statusText = 'Not Found') {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
  });
}

/** Helper to simulate a network failure (fetch rejects). */
function mockFetchNetworkError(message = 'Failed to fetch') {
  global.fetch = vi.fn().mockRejectedValue(new TypeError(message));
}

/** Helper to simulate a successful HTTP response with unparseable JSON. */
function mockFetchParseError() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.reject(new SyntaxError('Unexpected token')),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// loadAccounts
// ---------------------------------------------------------------------------
describe('loadAccounts', () => {
  it('should return a validated array of accounts on success', async () => {
    mockFetchOk([VALID_ACCOUNT]);
    const accounts = await loadAccounts();
    expect(accounts).toHaveLength(1);
    expect(accounts[0].accountId).toBe('acc-1');
  });

  it('should throw NetworkError when fetch rejects', async () => {
    mockFetchNetworkError('net fail');
    await expect(loadAccounts()).rejects.toBeInstanceOf(NetworkError);
  });

  it('should throw HttpError when server returns non-2xx status', async () => {
    mockFetchHttpError(404);
    const err = await loadAccounts().catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
  });

  it('should throw ParseError when response body is not valid JSON', async () => {
    mockFetchParseError();
    await expect(loadAccounts()).rejects.toBeInstanceOf(ParseError);
  });

  it('should throw SchemaError when an account record is missing required fields', async () => {
    mockFetchOk([{ accountId: 'acc-1' }]); // missing most fields
    await expect(loadAccounts()).rejects.toBeInstanceOf(SchemaError);
  });

  it('should throw SchemaError when amlFlags contains an invalid typology', async () => {
    const badAccount = {
      ...VALID_ACCOUNT,
      amlFlags: [{ ...VALID_FLAG_EMBEDDED, typology: 'UNKNOWN' }],
    };
    mockFetchOk([badAccount]);
    await expect(loadAccounts()).rejects.toBeInstanceOf(SchemaError);
  });

  it('should throw SchemaError when data is not an array', async () => {
    mockFetchOk({ accountId: 'not-an-array' });
    await expect(loadAccounts()).rejects.toBeInstanceOf(SchemaError);
  });
});

// ---------------------------------------------------------------------------
// loadEdges
// ---------------------------------------------------------------------------
describe('loadEdges', () => {
  it('should return a validated array of edges on success', async () => {
    mockFetchOk([VALID_EDGE]);
    const edges = await loadEdges();
    expect(edges).toHaveLength(1);
    expect(edges[0].edgeId).toBe('edge-1');
  });

  it('should throw NetworkError when fetch rejects', async () => {
    mockFetchNetworkError();
    await expect(loadEdges()).rejects.toBeInstanceOf(NetworkError);
  });

  it('should throw HttpError on non-2xx response', async () => {
    mockFetchHttpError(500, 'Internal Server Error');
    const err = await loadEdges().catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(500);
  });

  it('should throw ParseError on JSON parse failure', async () => {
    mockFetchParseError();
    await expect(loadEdges()).rejects.toBeInstanceOf(ParseError);
  });

  it('should throw SchemaError when isFlagged is not a boolean', async () => {
    mockFetchOk([{ ...VALID_EDGE, isFlagged: 'yes' }]);
    await expect(loadEdges()).rejects.toBeInstanceOf(SchemaError);
  });
});

// ---------------------------------------------------------------------------
// loadFlags
// ---------------------------------------------------------------------------
describe('loadFlags', () => {
  it('should return a validated array of AML flags on success', async () => {
    mockFetchOk([VALID_FLAG_STANDALONE]);
    const flags = await loadFlags();
    expect(flags).toHaveLength(1);
    expect(flags[0].flagId).toBe('flag-1');
  });

  it('should throw NetworkError when fetch rejects', async () => {
    mockFetchNetworkError();
    await expect(loadFlags()).rejects.toBeInstanceOf(NetworkError);
  });

  it('should throw HttpError on non-2xx response', async () => {
    mockFetchHttpError(403, 'Forbidden');
    const err = await loadFlags().catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(403);
  });

  it('should throw ParseError on JSON parse failure', async () => {
    mockFetchParseError();
    await expect(loadFlags()).rejects.toBeInstanceOf(ParseError);
  });

  it('should throw SchemaError when severity has an invalid value', async () => {
    mockFetchOk([{ ...VALID_FLAG_STANDALONE, severity: 'EXTREME' }]);
    await expect(loadFlags()).rejects.toBeInstanceOf(SchemaError);
  });
});

// ---------------------------------------------------------------------------
// loadTransactions
// ---------------------------------------------------------------------------
describe('loadTransactions', () => {
  it('should return a validated array of transactions on success', async () => {
    mockFetchOk([VALID_TRANSACTION]);
    const txns = await loadTransactions();
    expect(txns).toHaveLength(1);
    expect(txns[0].transactionId).toBe('tx-1');
  });

  it('should throw NetworkError when fetch rejects', async () => {
    mockFetchNetworkError();
    await expect(loadTransactions()).rejects.toBeInstanceOf(NetworkError);
  });

  it('should throw HttpError on non-2xx response', async () => {
    mockFetchHttpError(503, 'Service Unavailable');
    const err = await loadTransactions().catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(503);
  });

  it('should throw ParseError on JSON parse failure', async () => {
    mockFetchParseError();
    await expect(loadTransactions()).rejects.toBeInstanceOf(ParseError);
  });

  it('should throw SchemaError when timestamp is not a valid ISO 8601 date', async () => {
    mockFetchOk([{ ...VALID_TRANSACTION, timestamp: 'not-a-date' }]);
    await expect(loadTransactions()).rejects.toBeInstanceOf(SchemaError);
  });
});
