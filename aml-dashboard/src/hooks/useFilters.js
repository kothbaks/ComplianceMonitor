import { useState, useMemo } from 'react';

export function useFilters(edges) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [typologies, setTypologies] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [currency, setCurrency] = useState('');

  const filteredEdges = useMemo(() => {
    let result = edges;
    if (dateFrom) result = result.filter((e) => e.timestamp >= dateFrom);
    if (dateTo) result = result.filter((e) => e.timestamp <= dateTo + 'T23:59:59Z');
    if (flaggedOnly) result = result.filter((e) => e.isFlagged);
    if (currency) result = result.filter((e) => e.currency === currency);
    return result;
  }, [edges, dateFrom, dateTo, typologies, severities, flaggedOnly, currency]);

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTypologies([]);
    setSeverities([]);
    setFlaggedOnly(false);
    setCurrency('');
  };

  return {
    filters: { dateFrom, dateTo, typologies, severities, flaggedOnly, currency },
    setDateFrom,
    setDateTo,
    setTypologies,
    setSeverities,
    setFlaggedOnly,
    setCurrency,
    clearFilters,
    filteredEdges,
  };
}
