/**
 * Filtering hook for AML data.
 * Manages multiple filter criteria and applies them to accounts and edges.
 */

import { useState, useMemo } from 'react';

/**
 * Custom hook for managing and applying filters to accounts and edges.
 * Supports date range, typology, severity, flagged status, and currency filters.
 * Uses useMemo to optimize filtering performance.
 * 
 * @param {Array} accounts - Array of account objects to filter.
 * @param {Array} edges - Array of transaction edge objects to filter.
 * @param {Array} flags - Array of AML flag objects for account filtering.
 * @returns {Object} Filter state, setters, and filtered datasets:
 *   - filters: Object containing all current filter values
 *   - setDateFrom: Set start date for date range (ISO 8601 string)
 *   - setDateTo: Set end date for date range (ISO 8601 string)
 *   - setTypologies: Set array of typology filter values
 *   - setSeverities: Set array of severity filter values
 *   - setFlaggedOnly: Set boolean to filter only flagged items
 *   - setCurrency: Set currency filter string
 *   - clearFilters: Reset all filters to defaults
 *   - filteredAccounts: Filtered array of accounts
 *   - filteredEdges: Filtered array of edges
 */
export function useFilters(accounts = [], edges = [], flags = []) {
  // Validate inputs
  if (!Array.isArray(accounts) || !Array.isArray(edges) || !Array.isArray(flags)) {
    throw new TypeError('accounts, edges, and flags must be arrays');
  }

  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typologies, setTypologies] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [currency, setCurrency] = useState('');

  // Filter edges based on criteria
  const filteredEdges = useMemo(() => {
    let result = edges;

    // Date range filter (ISO 8601 comparison)
    if (dateFrom) {
      result = result.filter((edge) => {
        return edge.timestamp && edge.timestamp >= dateFrom;
      });
    }
    if (dateTo) {
      // Include entire end date by adding time component
      const endOfDay = dateTo.includes('T') ? dateTo : `${dateTo}T23:59:59Z`;
      result = result.filter((edge) => {
        return edge.timestamp && edge.timestamp <= endOfDay;
      });
    }

    // Flagged status filter
    if (flaggedOnly) {
      result = result.filter((edge) => edge.isFlagged === true);
    }

    // Currency filter
    if (currency) {
      result = result.filter((edge) => edge.currency === currency);
    }

    return result;
  }, [edges, dateFrom, dateTo, flaggedOnly, currency]);

  // Filter accounts based on criteria
  const filteredAccounts = useMemo(() => {
    let result = accounts;

    // Filter by flagged status (accounts with any flags)
    if (flaggedOnly) {
      const flaggedAccountIds = new Set(flags.map(flag => flag.accountId));
      result = result.filter((account) => flaggedAccountIds.has(account.accountId));
    }

    // Filter by typology (accounts with flags matching selected typologies)
    if (typologies.length > 0) {
      const typologyAccountIds = new Set(
        flags
          .filter(flag => typologies.includes(flag.typology))
          .map(flag => flag.accountId)
      );
      result = result.filter((account) => typologyAccountIds.has(account.accountId));
    }

    // Filter by severity (accounts with flags matching selected severities)
    if (severities.length > 0) {
      const severityAccountIds = new Set(
        flags
          .filter(flag => severities.includes(flag.severity))
          .map(flag => flag.accountId)
      );
      result = result.filter((account) => severityAccountIds.has(account.accountId));
    }

    return result;
  }, [accounts, flags, flaggedOnly, typologies, severities]);

  // Reset all filters to default state
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTypologies([]);
    setSeverities([]);
    setFlaggedOnly(false);
    setCurrency('');
  };

  return {
    filters: { 
      dateFrom, 
      dateTo, 
      typologies, 
      severities, 
      flaggedOnly, 
      currency 
    },
    setDateFrom,
    setDateTo,
    setTypologies,
    setSeverities,
    setFlaggedOnly,
    setCurrency,
    clearFilters,
    filteredAccounts,
    filteredEdges,
  };
}
