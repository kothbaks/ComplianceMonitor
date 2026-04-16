const BASE_URL = '/data';

async function fetchJson(path) {
  const response = await fetch(`${BASE_URL}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function loadAccounts() {
  return fetchJson('accounts.json');
}

export async function loadEdges() {
  return fetchJson('transaction-edges.json');
}

export async function loadFlags() {
  return fetchJson('aml-flags.json');
}

export async function loadTransactions() {
  return fetchJson('transactions.json');
}
