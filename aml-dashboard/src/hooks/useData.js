/**
 * Data loading hook for AML dashboard.
 * Loads all datasets in parallel and provides loading/error states.
 */

import { useState, useEffect } from 'react';
import { loadAccounts, loadEdges, loadFlags, loadTransactions } from '../services/dataLoader';

/**
 * Custom hook that loads all AML datasets in parallel on mount.
 * Uses Promise.all for concurrent fetching to minimize load time.
 * Includes cleanup to prevent state updates after unmount.
 * 
 * @returns {Object} Data and state object with the following properties:
 *   - accounts: Array of account objects (empty array while loading)
 *   - edges: Array of transaction edge objects (empty array while loading)
 *   - flags: Array of AML flag objects (empty array while loading)
 *   - transactions: Array of transaction objects (empty array while loading)
 *   - loading: Boolean indicating if data is still loading
 *   - error: Error object if any loader failed (null otherwise, preserves error.category and error.details)
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
        // Load all datasets in parallel for optimal performance
        const [accts, edgs, flgs, txns] = await Promise.all([
          loadAccounts(),
          loadEdges(),
          loadFlags(),
          loadTransactions(),
        ]);

        // Only update state if component is still mounted
        if (!cancelled) {
          console.log('useData: Loaded data - accounts:', accts.length, 'edges:', edgs.length, 'flags:', flgs.length, 'transactions:', txns.length);
          setAccounts(accts);
          setEdges(edgs);
          setFlags(flgs);
          setTransactions(txns);
        }
      } catch (err) {
        // Preserve full error object with category and details for error handling
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, []);

  return { accounts, edges, flags, transactions, loading, error };
}
