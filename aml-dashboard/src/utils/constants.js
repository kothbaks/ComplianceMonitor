export const SEVERITY_COLORS = {
  LOW: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-400', hex: '#4ade80' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-400', hex: '#facc15' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', hex: '#f97316' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-600', hex: '#dc2626' },
};

export const RISK_COLORS = {
  LOW: { bg: 'bg-green-100', text: 'text-green-700', hex: '#22c55e' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', hex: '#eab308' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', hex: '#f97316' },
  PEP: { bg: 'bg-purple-100', text: 'text-purple-700', hex: '#a855f7' },
};

export const TYPOLOGY_LABELS = {
  STRUCTURING: 'Structuring',
  LAYERING: 'Layering',
  ROUND_TRIPPING: 'Round Tripping',
  SHELL_NETWORK: 'Shell Network',
};

export const TYPOLOGY_COLORS = {
  STRUCTURING: '#3b82f6',
  LAYERING: '#f97316',
  ROUND_TRIPPING: '#ef4444',
  SHELL_NETWORK: '#8b5cf6',
};

export const ACTION_COLORS = {
  SAR: { bg: 'bg-red-100', text: 'text-red-700', label: 'File SAR' },
  EDD: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Request EDD' },
  FREEZE: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Freeze Account' },
  FIU_ESCALATION: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Escalate to FIU' },
};

export const SEVERITY_SCORE = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 100,
};

export const PAGE_SIZE = 30;
export const THRESHOLD_AMOUNT = 10000;
export const STRUCTURING_MIN = 9000;
export const STRUCTURING_MAX = 9999;

export const FLAGGED_EDGE_COLOR = '#EF4444';
export const UNFLAGGED_EDGE_COLOR = '#94A3B8';

export const ACCOUNT_TYPES = ['PERSONAL', 'BUSINESS', 'OFFSHORE'];
export const TYPOLOGIES = ['STRUCTURING', 'LAYERING', 'ROUND_TRIPPING', 'SHELL_NETWORK'];
export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const RISK_RATINGS = ['LOW', 'MEDIUM', 'HIGH', 'PEP'];
export const RECOMMENDED_ACTIONS = ['SAR', 'EDD', 'FREEZE', 'FIU_ESCALATION'];
export const CURRENCIES = ['EUR', 'USD', 'SEK', 'GBP'];

export const TABS = [
  { id: 'graph', label: 'Transaction Graph' },
  { id: 'aml', label: 'AML Patterns' },
  { id: 'queue', label: 'Priority Queue' },
];
