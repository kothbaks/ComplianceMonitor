/**
 * Graph analysis service for transaction network.
 * All functions are pure and do not mutate input data.
 */

/**
 * Builds an adjacency map from transaction edges.
 * Maps each source account ID to an array of outgoing edges.
 * @param {Array} edges - Array of edge objects with fromAccountId and toAccountId.
 * @returns {Map<string, Array>} Map of accountId to array of outgoing edges.
 */
export function buildAdjacencyMap(edges) {
  if (!Array.isArray(edges)) {
    throw new TypeError('edges must be an array');
  }

  const map = new Map();
  for (const edge of edges) {
    if (!edge.fromAccountId || !edge.toAccountId) {
      continue; // Skip edges with missing account IDs
    }
    if (!map.has(edge.fromAccountId)) {
      map.set(edge.fromAccountId, []);
    }
    map.get(edge.fromAccountId).push(edge);
  }
  return map;
}

/**
 * Detects round-trip transaction cycles in the graph.
 * Uses depth-first search to find paths that return to the starting account.
 * Limited to cycles of max length 6 to avoid performance issues.
 * @param {Map<string, Array>} adjacencyMap - Adjacency map from buildAdjacencyMap.
 * @returns {Array<Array>} Array of cycles, where each cycle is an array of edges.
 */
export function detectCycles(adjacencyMap) {
  if (!(adjacencyMap instanceof Map)) {
    throw new TypeError('adjacencyMap must be a Map');
  }

  const cycles = [];
  const visited = new Set();
  const MAX_CYCLE_LENGTH = 6;

  function dfs(startId, currentId, path) {
    // Found a cycle back to start
    if (path.length > 1 && currentId === startId) {
      cycles.push([...path]);
      return;
    }
    
    // Prevent infinite loops and limit cycle length
    if (path.length > MAX_CYCLE_LENGTH) {
      return;
    }
    
    const visitKey = `${startId}-${currentId}-${path.length}`;
    if (visited.has(visitKey)) {
      return;
    }
    visited.add(visitKey);

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

/**
 * Finds edges with hop count >= minHops, indicating layering patterns.
 * @param {Array} edges - Array of edge objects with hops field.
 * @param {number} minHops - Minimum hop count threshold (default: 3).
 * @returns {Array} Filtered array of high-hop edges.
 */
export function findHighHopPaths(edges, minHops = 3) {
  if (!Array.isArray(edges)) {
    throw new TypeError('edges must be an array');
  }
  if (typeof minHops !== 'number' || minHops < 0) {
    throw new TypeError('minHops must be a non-negative number');
  }

  return edges.filter((edge) => {
    return typeof edge.hops === 'number' && edge.hops >= minHops;
  });
}

/**
 * Groups edges by account ID, including both source and target accounts.
 * Each account maps to all edges where it appears as either source or target.
 * @param {Array} edges - Array of edge objects.
 * @returns {Map<string, Array>} Map of accountId to array of related edges.
 */
export function groupByAccount(edges) {
  if (!Array.isArray(edges)) {
    throw new TypeError('edges must be an array');
  }

  const map = new Map();
  
  for (const edge of edges) {
    if (!edge.fromAccountId || !edge.toAccountId) {
      continue; // Skip edges with missing account IDs
    }

    // Add to source account
    if (!map.has(edge.fromAccountId)) {
      map.set(edge.fromAccountId, []);
    }
    map.get(edge.fromAccountId).push(edge);

    // Add to target account
    if (!map.has(edge.toAccountId)) {
      map.set(edge.toAccountId, []);
    }
    map.get(edge.toAccountId).push(edge);
  }
  
  return map;
}
