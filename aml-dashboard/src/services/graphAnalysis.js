export function buildAdjacencyMap(edges) {
  const map = new Map();
  for (const edge of edges) {
    if (!map.has(edge.fromAccountId)) map.set(edge.fromAccountId, []);
    map.get(edge.fromAccountId).push(edge);
  }
  return map;
}

export function detectCycles(adjacencyMap) {
  const cycles = [];
  const visited = new Set();

  function dfs(startId, currentId, path) {
    if (path.length > 1 && currentId === startId) {
      cycles.push([...path]);
      return;
    }
    if (path.length > 6 || visited.has(`${startId}-${currentId}-${path.length}`)) return;
    visited.add(`${startId}-${currentId}-${path.length}`);

    const neighbors = adjacencyMap.get(currentId) || [];
    for (const edge of neighbors) {
      dfs(startId, edge.toAccountId, [...path, edge]);
    }
  }

  for (const [accountId] of adjacencyMap) {
    dfs(accountId, accountId, []);
  }
  return cycles;
}

export function findHighHopPaths(edges, minHops = 3) {
  return edges.filter((e) => e.hops >= minHops);
}

export function groupByAccount(edges) {
  const map = new Map();
  for (const edge of edges) {
    if (!map.has(edge.fromAccountId)) map.set(edge.fromAccountId, []);
    map.get(edge.fromAccountId).push(edge);
    if (!map.has(edge.toAccountId)) map.set(edge.toAccountId, []);
    map.get(edge.toAccountId).push(edge);
  }
  return map;
}
