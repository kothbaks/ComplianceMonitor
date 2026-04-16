import { STRUCTURING_MIN, STRUCTURING_MAX, THRESHOLD_AMOUNT, SEVERITY_SCORE } from '../utils/constants';

export function getStructuringEdges(edges) {
  return edges.filter((e) => e.amount >= STRUCTURING_MIN && e.amount <= STRUCTURING_MAX);
}

export function aggregateByAccount24h(edges) {
  const groups = new Map();
  for (const edge of edges) {
    const date = new Date(edge.timestamp);
    const dayKey = date.toISOString().slice(0, 10);
    const key = `${edge.fromAccountId}|${dayKey}`;
    if (!groups.has(key)) groups.set(key, { accountId: edge.fromAccountId, day: dayKey, total: 0, edges: [] });
    const group = groups.get(key);
    group.total += edge.amount;
    group.edges.push(edge);
  }
  return Array.from(groups.values());
}

export function breachesThreshold(sum) {
  return sum > THRESHOLD_AMOUNT;
}

export function getThresholdBreaches(edges) {
  const aggregated = aggregateByAccount24h(edges);
  return aggregated.filter((g) => breachesThreshold(g.total));
}

export function rankAccounts(accounts, flags) {
  const accountsWithFlags = accounts.map((account) => {
    const accountFlags = flags.filter((f) => f.accountId === account.accountId);
    const maxSeverity = accountFlags.reduce((max, f) => {
      const score = SEVERITY_SCORE[f.severity] || 0;
      return score > max ? score : max;
    }, 0);
    const maxConfidence = accountFlags.reduce((max, f) => Math.max(max, f.confidenceScore || 0), 0);
    const flagCount = accountFlags.length;
    const riskScore = flagCount > 0
      ? Math.min(100, Math.round(maxSeverity * (maxConfidence / 100) * (1 + 0.1 * flagCount)))
      : 0;
    return { ...account, flags: accountFlags, flagCount, maxSeverity, maxConfidence, riskScore };
  });

  return accountsWithFlags
    .filter((a) => a.flagCount > 0)
    .sort((a, b) => {
      if (b.maxSeverity !== a.maxSeverity) return b.maxSeverity - a.maxSeverity;
      if (b.maxConfidence !== a.maxConfidence) return b.maxConfidence - a.maxConfidence;
      return b.flagCount - a.flagCount;
    });
}
