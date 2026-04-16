import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionGraph } from '../TransactionGraph';
import { FLAGGED_EDGE_COLOR } from '../../../utils/constants';

// Mock Cytoscape to avoid DOM/canvas dependency in tests
vi.mock('cytoscape', () => {
  const mockCy = {
    on: vi.fn(),
    destroy: vi.fn(),
  };
  const cytoscape = vi.fn(() => mockCy);
  cytoscape.use = vi.fn();
  return { default: cytoscape };
});

vi.mock('cytoscape-cose-bilkent', () => ({ default: {} }));

// Controlled AppContext stub
let contextValue = {};

vi.mock('../../../context/AppContext', () => ({
  useApp: () => contextValue,
}));

function makeAccount(overrides = {}) {
  return {
    accountId: 'acc-1',
    customerName: 'Alice Smith',
    riskRating: 'LOW',
    amlFlags: [],
    ...overrides,
  };
}

function makeEdge(overrides = {}) {
  return {
    edgeId: 'edge-1',
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

describe('TransactionGraph states', () => {
  it('should render the loading state when loading is true', () => {
    contextValue = {
      accounts: [],
      edges: [],
      loading: true,
      error: null,
      selectedAccountId: null,
      setSelectedAccountId: vi.fn(),
    };
    render(<TransactionGraph />);
    expect(screen.getByTestId('graph-loading')).toBeDefined();
  });

  it('should render the error state when error is set', () => {
    contextValue = {
      accounts: [],
      edges: [],
      loading: false,
      error: 'Unable to load data — check your network connection and try refreshing.',
      selectedAccountId: null,
      setSelectedAccountId: vi.fn(),
    };
    render(<TransactionGraph />);
    expect(screen.getByTestId('graph-error')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    // Should not expose raw technical trace
    expect(screen.queryByText(/stack|undefined|null|TypeError/)).toBeNull();
  });

  it('should render the empty state when accounts array is empty (no error, not loading)', () => {
    contextValue = {
      accounts: [],
      edges: [],
      loading: false,
      error: null,
      selectedAccountId: null,
      setSelectedAccountId: vi.fn(),
    };
    render(<TransactionGraph />);
    expect(screen.getByTestId('graph-empty')).toBeDefined();
    expect(screen.getByText('No accounts available to display')).toBeDefined();
  });

  it('should render the success state when accounts are available', () => {
    contextValue = {
      accounts: [makeAccount()],
      edges: [makeEdge()],
      loading: false,
      error: null,
      selectedAccountId: null,
      setSelectedAccountId: vi.fn(),
    };
    render(<TransactionGraph />);
    expect(screen.getByTestId('graph-success')).toBeDefined();
    expect(screen.getByText('Transaction Network')).toBeDefined();
  });
});

describe('TransactionGraph flagged edge color constant', () => {
  it('should use #EF4444 as the flagged edge color', () => {
    expect(FLAGGED_EDGE_COLOR).toBe('#EF4444');
  });
});
