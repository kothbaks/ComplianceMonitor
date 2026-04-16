import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { useApp } from '../../context/AppContext';
import { RISK_COLORS, FLAGGED_EDGE_COLOR, UNFLAGGED_EDGE_COLOR } from '../../utils/constants';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorBanner } from '../common/ErrorBanner';
import { EmptyState } from '../common/EmptyState';

cytoscape.use(coseBilkent);

/** Validate that a value is a non-empty string safe for use as a Cytoscape element ID */
function isValidId(id) {
  return typeof id === 'string' && id.length > 0;
}

/** Compute the set of account IDs within 2 hops of a focal account */
function computeEgoNetwork(edges, focalId) {
  const hop1 = new Set([focalId]);
  edges.forEach((e) => {
    if (e.fromAccountId === focalId) hop1.add(e.toAccountId);
    if (e.toAccountId === focalId) hop1.add(e.fromAccountId);
  });
  const hop2 = new Set(hop1);
  edges.forEach((e) => {
    if (hop1.has(e.fromAccountId)) hop2.add(e.toAccountId);
    if (hop1.has(e.toAccountId)) hop2.add(e.fromAccountId);
  });
  return hop2;
}

/** Build Cytoscape node elements from a set of visible account IDs */
function buildNodes(visibleAccountIds, accountMap) {
  return Array.from(visibleAccountIds)
    .filter(isValidId)
    .map((id) => {
      const acc = accountMap.get(id);
      const label = acc ? acc.customerName.split(' ')[0] : id.slice(-4);
      const risk = acc?.riskRating || 'LOW';
      return { data: { id, label, risk } };
    });
}

/** Build Cytoscape edge elements from visible transaction edges */
function buildEdges(visibleEdges) {
  return visibleEdges
    .filter((e) => isValidId(e.edgeId) && isValidId(e.fromAccountId) && isValidId(e.toAccountId))
    .map((e) => ({
      data: {
        id: e.edgeId,
        source: e.fromAccountId,
        target: e.toAccountId,
        amount: `${e.currency} ${e.amount.toLocaleString()}`,
        isFlagged: e.isFlagged,
        hops: e.hops,
      },
    }));
}

/** Cytoscape stylesheet — uses data() selectors for conditional styling */
const GRAPH_STYLE = [
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
    selector: 'node.selected',
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
  // Visual encoding of hop distance — higher hop count = thicker edge
  {
    selector: 'edge[hops >= 3]',
    style: { width: 3 },
  },
  {
    selector: 'edge[hops >= 4]',
    style: { width: 4 },
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
];

const RISK_LEGEND = [
  { key: 'LOW', label: 'Low', dotClass: 'bg-green-500' },
  { key: 'MEDIUM', label: 'Medium', dotClass: 'bg-yellow-500' },
  { key: 'HIGH', label: 'High', dotClass: 'bg-orange-500' },
  { key: 'PEP', label: 'PEP', dotClass: 'bg-purple-500' },
];

export function TransactionGraph() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const { accounts, edges, selectedAccountId, setSelectedAccountId, loading, error } = useApp();
  const [focusMode, setFocusMode] = useState(false);
  const tooltipRef = useRef(null);
  const [tooltipData, setTooltipData] = useState(null);

  const accountMap = useMemo(
    () => new Map(accounts.map((a) => [a.accountId, a])),
    [accounts]
  );

  // In focus mode the ego-network target drives which elements are shown;
  // when off all elements are visible regardless of selection.
  const egoTarget = focusMode ? selectedAccountId : null;

  // Effect 1: Build graph elements, run layout, attach tap handler.
  // Only rebuilds when the element set actually changes.
  useEffect(() => {
    if (!containerRef.current || accounts.length === 0) return;

    // Check container dimensions
    const rect = containerRef.current.getBoundingClientRect();
    console.log('TransactionGraph: Container dimensions:', rect.width, 'x', rect.height);
    
    if (rect.width === 0 || rect.height === 0) {
      console.warn('TransactionGraph: Container has no dimensions yet, deferring render');
      return;
    }

    console.log('TransactionGraph: Building graph with', accounts.length, 'accounts and', edges.length, 'edges');

    const involvedAccountIds = new Set();
    edges.forEach((e) => {
      involvedAccountIds.add(e.fromAccountId);
      involvedAccountIds.add(e.toAccountId);
    });

    console.log('TransactionGraph: involvedAccountIds size:', involvedAccountIds.size);

    let visibleEdges = edges;
    let visibleAccountIds = involvedAccountIds;

    if (egoTarget) {
      visibleAccountIds = computeEgoNetwork(edges, egoTarget);
      visibleEdges = edges.filter(
        (e) => visibleAccountIds.has(e.fromAccountId) && visibleAccountIds.has(e.toAccountId)
      );
    }

    const nodes = buildNodes(visibleAccountIds, accountMap);
    const cyEdges = buildEdges(visibleEdges);

    console.log('TransactionGraph: Built', nodes.length, 'nodes and', cyEdges.length, 'edges');

    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...cyEdges],
      style: GRAPH_STYLE,
      // cose-bilkent: force-directed layout tuned for small AML transaction networks
      layout: { name: 'cose-bilkent', animate: false, nodeRepulsion: 8000, idealEdgeLength: 120 },
    });

    console.log('TransactionGraph: Cytoscape instance created');

    cyRef.current.on('tap', 'node', (evt) => {
      setSelectedAccountId(evt.target.id());
    });

    // Node tooltip — positioned via ref to avoid inline style attributes in JSX
    cyRef.current.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const pos = node.renderedPosition();
      const acc = accountMap.get(node.id());
      if (tooltipRef.current) {
        tooltipRef.current.style.transform = `translate(${pos.x + 15}px, ${pos.y - 10}px)`;
      }
      setTooltipData({
        name: acc?.customerName || node.id(),
        risk: acc?.riskRating || 'Unknown',
        type: acc?.accountType || 'Unknown',
      });
    });

    cyRef.current.on('mouseout', 'node', () => {
      setTooltipData(null);
    });

    // Hide tooltip during pan/zoom since rendered positions shift
    cyRef.current.on('pan zoom', () => setTooltipData(null));

    return () => {
      setTooltipData(null);
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [accounts, edges, egoTarget, accountMap, setSelectedAccountId]);

  // Effect 2: Update selection highlight without full graph rebuild.
  // Runs on every selectedAccountId change — lightweight class toggle only.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().removeClass('selected');
      if (selectedAccountId) {
        cy.getElementById(selectedAccountId).addClass('selected');
      }
    });
  }, [selectedAccountId]);

  const handleZoomToFit = useCallback(() => {
    cyRef.current?.fit(undefined, 30);
  }, []);

  const handleZoomIn = useCallback(() => {
    const cy = cyRef.current;
    if (cy) cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  const handleZoomOut = useCallback(() => {
    const cy = cyRef.current;
    if (cy) cy.zoom({ level: cy.zoom() / 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  }, []);

  console.log('TransactionGraph render: loading=', loading, 'error=', error, 'accounts=', accounts.length, 'edges=', edges.length);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={`Failed to load graph data: ${error}`} />;
  if (accounts.length === 0 || edges.length === 0) {
    console.log('TransactionGraph: Showing empty state');
    return <EmptyState message="No transaction network data available" />;
  }

  return (
    <div className="flex flex-col h-full">
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
      <div className="relative flex-1 min-h-[400px] overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 bg-slate-50" />
        {/* Graph toolbar — zoom controls rendered as React siblings to Cytoscape container */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={handleZoomToFit}
            className="flex items-center justify-center w-7 h-7 rounded bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"
            title="Zoom to fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex items-center justify-center w-7 h-7 rounded bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="flex items-center justify-center w-7 h-7 rounded bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
        </div>
        {/* Node tooltip — dynamically positioned via ref for Cytoscape coordinate mapping */}
        <div
          ref={tooltipRef}
          className={`absolute top-0 left-0 z-10 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg shadow-lg pointer-events-none transition-opacity ${tooltipData ? 'opacity-100' : 'opacity-0 invisible'}`}
        >
          {tooltipData && (
            <>
              <p className="font-semibold text-slate-700">{tooltipData.name}</p>
              <p className="text-slate-500">Risk: <span className="font-medium">{tooltipData.risk}</span></p>
              <p className="text-slate-500">Type: <span className="font-medium">{tooltipData.type}</span></p>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-slate-200 text-[10px] text-slate-500">
        {RISK_LEGEND.map((item) => (
          <span key={item.key} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${item.dotClass}`} />
            {item.label}
          </span>
        ))}
        <span className="mx-2">|</span>
        <span className="flex items-center gap-1">
          <span className="w-6 border-t-2 border-dashed border-red-500" /> Flagged
        </span>
        <span className="flex items-center gap-1">
          <span className="w-6 border-t-2 border-slate-400" /> Normal
        </span>
        <span className="mx-2">|</span>
        <span className="flex items-center gap-1">
          <span className="w-4 border-t border-slate-400" /> 1-2 hops
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 border-t-2 border-slate-400" /> 3 hops
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 border-t-4 border-slate-400" /> 4+ hops
        </span>
      </div>
    </div>
  );
}
