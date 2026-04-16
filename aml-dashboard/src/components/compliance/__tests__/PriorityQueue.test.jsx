import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriorityQueue } from '../PriorityQueue';
import { ACTION_COLORS, TYPOLOGY_LABELS } from '../../../utils/constants';

// Controlled AppContext stub
let contextValue = {};

vi.mock('../../../context/AppContext', () => ({
  useApp: () => contextValue,
}));

function makeAccount(overrides = {}) {
  return {
    accountId: 'acc-1',
    customerName: 'Alice Smith',
    riskRating: 'HIGH',
    amlFlags: [],
    ...overrides,
  };
}

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

function setupContext(accounts, flags, edges = []) {
  contextValue = {
    accounts,
    flags,
    edges,
    setSelectedAccountId: vi.fn(),
    setActiveTab: vi.fn(),
  };
}

describe('PriorityQueue — empty state', () => {
  it('should show empty state message when no accounts have flags', () => {
    setupContext([makeAccount()], []);
    render(<PriorityQueue />);
    expect(screen.getByText('No accounts requiring action')).toBeDefined();
  });
});

describe('PriorityQueue — ordering', () => {
  it('should list higher severity accounts first', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1', customerName: 'Alice' }),
      makeAccount({ accountId: 'acc-2', customerName: 'Bob' }),
    ];
    const flags = [
      makeFlag({ accountId: 'acc-1', severity: 'MEDIUM', confidenceScore: 90 }),
      makeFlag({ flagId: 'f2', accountId: 'acc-2', severity: 'CRITICAL', confidenceScore: 50 }),
    ];
    setupContext(accounts, flags);
    render(<PriorityQueue />);

    const items = screen.getAllByText(/Alice|Bob/);
    // Bob (CRITICAL) should appear first
    expect(items[0].textContent).toContain('Bob');
    expect(items[1].textContent).toContain('Alice');
  });

  it('should show rank positions starting at #1', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText('#1')).toBeDefined();
  });

  it('should display the total number of flagged accounts in the heading', () => {
    const accounts = [
      makeAccount({ accountId: 'acc-1', customerName: 'Alice' }),
      makeAccount({ accountId: 'acc-2', customerName: 'Bob' }),
    ];
    const flags = [
      makeFlag({ accountId: 'acc-1' }),
      makeFlag({ flagId: 'f2', accountId: 'acc-2' }),
    ];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText(/2 accounts/)).toBeDefined();
  });
});

describe('PriorityQueue — rationale fields', () => {
  it('should display the confidence percentage for a flagged account', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1', confidenceScore: 75 })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText(/75%/)).toBeDefined();
  });

  it('should display the typology label for the top flag', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1', typology: 'LAYERING' })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText(TYPOLOGY_LABELS.LAYERING)).toBeDefined();
  });

  it('should show threshold breach signal when account exceeds 10k/24h', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    // Two edges that together exceed 10000
    const edges = [
      makeEdge({ edgeId: 'e1', fromAccountId: 'acc-1', amount: 6000, timestamp: '2024-01-01T10:00:00Z' }),
      makeEdge({ edgeId: 'e2', fromAccountId: 'acc-1', amount: 5000, timestamp: '2024-01-01T14:00:00Z' }),
    ];
    setupContext(accounts, flags, edges);
    render(<PriorityQueue />);
    expect(screen.getByText(/Threshold breach/)).toBeDefined();
  });

  it('should not show threshold breach signal when account is below threshold', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    const edges = [
      makeEdge({ edgeId: 'e1', fromAccountId: 'acc-1', amount: 4000, timestamp: '2024-01-01T10:00:00Z' }),
    ];
    setupContext(accounts, flags, edges);
    render(<PriorityQueue />);
    expect(screen.queryByText(/Threshold breach/)).toBeNull();
  });

  it('should display a Review button for each ranked account', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1' })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByRole('button', { name: /Review/ })).toBeDefined();
  });
});

describe('PriorityQueue — ActionBadge mapping', () => {
  it('should display action badge text from centralized ACTION_COLORS constants', () => {
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1', recommendedAction: 'FIU_ESCALATION' })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText(ACTION_COLORS.FIU_ESCALATION.label)).toBeDefined();
  });

  it('should use EDD fallback label when action is unknown', () => {
    // ActionBadge falls back to EDD for unknown actions
    const accounts = [makeAccount({ accountId: 'acc-1', customerName: 'Alice' })];
    const flags = [makeFlag({ accountId: 'acc-1', recommendedAction: 'UNKNOWN_ACTION' })];
    setupContext(accounts, flags);
    render(<PriorityQueue />);
    expect(screen.getByText(ACTION_COLORS.EDD.label)).toBeDefined();
  });
});
