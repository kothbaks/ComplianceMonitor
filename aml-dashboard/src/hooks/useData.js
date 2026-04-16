import { useState, useEffect } from 'react';
import { loadAccounts, loadEdges, loadFlags, loadTransactions } from '../services/dataLoader';

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
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { accounts, edges, flags, transactions, loading, error };
}
