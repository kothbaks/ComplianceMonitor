import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useApp } from '../../context/AppContext';
import { RISK_COLORS, FLAGGED_EDGE_COLOR, UNFLAGGED_EDGE_COLOR } from '../../utils/constants';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBanner } from '../common/ErrorBanner';
import { EmptyState } from '../common/EmptyState';

cytoscape.use(coseBilkent);

/** Sanitize an identifier so it is safe to use as a Cytoscape element id. */
function sanitizeId(id) {
  if (typeof id !== 'string' || id.trim() === '') return null;
  return id.replace(/[^\w-]/g, '_');
}

export function TransactionGraph() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const { accounts, edges, loading, error, selectedAccountId, setSelectedAccountId } = useApp();
  const [focusMode, setFocusMode] = useState(true);

  useEffect(() => {
    if (!containerRef.current || loading || error || accounts.length === 0) return;

    const involvedAccountIds = new Set();
    edges.forEach((e) => {
      if (sanitizeId(e.fromAccountId)) involvedAccountIds.add(e.fromAccountId);
      if (sanitizeId(e.toAccountId)) involvedAccountIds.add(e.toAccountId);
    });

    const accountMap = new Map(accounts.map((a) => [a.accountId, a]));

    let visibleEdges = edges;
    let visibleAccountIds = involvedAccountIds;

    if (focusMode && selectedAccountId) {
      const hop1 = new Set();
      hop1.add(selectedAccountId);
      edges.forEach((e) => {
        if (e.fromAccountId === selectedAccountId) hop1.add(e.toAccountId);
        if (e.toAccountId === selectedAccountId) hop1.add(e.fromAccountId);
      });
      const hop2 = new Set(hop1);
      edges.forEach((e) => {
        if (hop1.has(e.fromAccountId)) hop2.add(e.toAccountId);
        if (hop1.has(e.toAccountId)) hop2.add(e.fromAccountId);
      });
      visibleAccountIds = hop2;
      visibleEdges = edges.filter((e) => visibleAccountIds.has(e.fromAccountId) && visibleAccountIds.has(e.toAccountId));
    }

    const nodes = Array.from(visibleAccountIds)
      .filter((id) => sanitizeId(id) !== null)
      .map((id) => {
        const acc = accountMap.get(id);
        const name = acc ? acc.customerName.split(' ')[0] : id.slice(-4);
        const risk = acc?.riskRating || 'LOW';
        return { data: { id: sanitizeId(id), label: name, risk, isSelected: id === selectedAccountId } };
      });

    const cyEdges = visibleEdges
      .filter((e) => sanitizeId(e.edgeId) && sanitizeId(e.fromAccountId) && sanitizeId(e.toAccountId))
      .map((e) => ({
        data: {
          id: sanitizeId(e.edgeId),
          source: sanitizeId(e.fromAccountId),
          target: sanitizeId(e.toAccountId),
          amount: `${e.currency} ${e.amount.toLocaleString()}`,
          isFlagged: e.isFlagged,
          hops: e.hops,
        },
      }));

    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...cyEdges],
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'text-valign': 'center',
            'font-size': '10px',
            'font-weight': 'bold',
            color: '#334155',
            'text-outline-color': '#fff',
            'text-outline-width': 2,
            width: 40,
            height: 40,
            'border-width': 2,
            'border-color': '#cbd5e1',
          },
        },
        {
          selector: 'node[risk = "LOW"]',
          style: { 'background-color': RISK_COLORS.LOW.hex },
        },
        {
          selector: 'node[risk = "MEDIUM"]',
          style: { 'background-color': RISK_COLORS.MEDIUM.hex },
        },
        {
          selector: 'node[risk = "HIGH"]',
          style: { 'background-color': RISK_COLORS.HIGH.hex },
        },
        {
          selector: 'node[risk = "PEP"]',
          style: { 'background-color': RISK_COLORS.PEP.hex },
        },
        {
          selector: 'node[?isSelected]',
          style: { 'border-width': 4, 'border-color': '#2563eb', width: 50, height: 50 },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': UNFLAGGED_EDGE_COLOR,
            'target-arrow-color': UNFLAGGED_EDGE_COLOR,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(amount)',
            'font-size': '8px',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            color: '#64748b',
          },
        },
        {
          selector: 'edge[?isFlagged]',
          style: {
            'line-color': FLAGGED_EDGE_COLOR,
            'target-arrow-color': FLAGGED_EDGE_COLOR,
            'line-style': 'dashed',
            width: 3,
          },
        },
      ],
      layout: { name: 'cose-bilkent', animate: false, nodeRepulsion: 8000, idealEdgeLength: 120 },
    });

    cyRef.current.on('tap', 'node', (evt) => {
      setSelectedAccountId(evt.target.id());
    });

    return () => { if (cyRef.current) cyRef.current.destroy(); };
  }, [accounts, edges, loading, error, selectedAccountId, focusMode, setSelectedAccountId]);

  if (loading) {
    return (
      <div className="flex flex-col h-full" data-testid="graph-loading">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Transaction Network</h3>
        </div>
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full" data-testid="graph-error">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Transaction Network</h3>
        </div>
        <div className="flex-1 bg-slate-50 p-4">
          <ErrorBanner message={error} />
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col h-full" data-testid="graph-empty">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Transaction Network</h3>
        </div>
        <div className="flex-1 bg-slate-50">
          <EmptyState message="No accounts available to display" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="graph-success">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700">Transaction Network</h3>
        <label className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={focusMode}
            onChange={(e) => setFocusMode(e.target.checked)}
            className="rounded border-slate-300"
          />
          Focus on selected (2-hop ego network)
        </label>
      </div>
      <div ref={containerRef} className="flex-1 bg-slate-50 min-h-[400px]" />
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-slate-200 text-[10px] text-slate-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500" /> High</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500" /> PEP</span>
        <span className="mx-2">|</span>
        <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-dashed border-red-500" /> Flagged</span>
        <span className="flex items-center gap-1"><span className="w-6 border-t-2 border-slate-400" /> Normal</span>
      </div>
    </div>
  );
}
