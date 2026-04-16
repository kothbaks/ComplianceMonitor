import { useState, useEffect } from 'react';
import { loadAccounts, loadEdges, loadFlags, loadTransactions } from '../services/dataLoader';
import { NetworkError, HttpError, ParseError, SchemaError } from '../services/errors';

/**
 * Produces a safe, user-facing error message from a categorized load error.
 * @param {Error} err
 * @returns {string}
 */
function toUserMessage(err) {
  if (err instanceof NetworkError) {
    return 'Unable to load data — check your network connection and try refreshing.';
  }
  if (err instanceof HttpError) {
    return `Data files could not be retrieved (HTTP ${err.status}). Ensure the dev server is running.`;
  }
  if (err instanceof ParseError) {
    return 'Data files appear to be corrupted or in an unexpected format.';
  }
  if (err instanceof SchemaError) {
    return 'Data validation failed — one or more data files contain unexpected values.';
  }
  return 'An unexpected error occurred while loading data.';
}

/**
 * Loads all datasets in parallel and exposes loading/error/data state.
 * @returns {{ accounts: object[], edges: object[], flags: object[], transactions: object[], loading: boolean, error: string|null }}
 */
export function useData() {
  const [accounts, setAccounts] = useState([]);
  const [edges, setEdges] = useState([]);
  const [flags, setFlags] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [accts, edgs, flgs, txns] = await Promise.all([
          loadAccounts(),
          loadEdges(),
          loadFlags(),
          loadTransactions(),
        ]);
        if (!cancelled) {
          setAccounts(accts);
          setEdges(edgs);
          setFlags(flgs);
          setTransactions(txns);
        }
      } catch (err) {
        if (!cancelled) setError(toUserMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { accounts, edges, flags, transactions, loading, error };
}
