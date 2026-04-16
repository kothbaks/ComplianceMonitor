import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TabNav } from './components/layout/TabNav';
import { TransactionGraph } from './components/graph/TransactionGraph';
import { TransactionTable } from './components/transactions/TransactionTable';
import { AccountFlagPanel } from './components/aml/AccountFlagPanel';
import { TypologyLegend } from './components/aml/TypologyLegend';
import { PatternTimeSeriesChart } from './components/aml/PatternTimeSeriesChart';
import { SeveritySummaryChart } from './components/aml/SeveritySummaryChart';
import { TypologyBreakdownChart } from './components/aml/TypologyBreakdownChart';
import { PriorityQueue } from './components/compliance/PriorityQueue';
import { AccountActionPanel } from './components/compliance/AccountActionPanel';
import { ThresholdBreachAlert } from './components/compliance/ThresholdBreachAlert';
import { ActivityEvolutionChart } from './components/compliance/ActivityEvolutionChart';
import { RiskScoreGauge } from './components/compliance/RiskScoreGauge';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorBanner } from './components/common/ErrorBanner';
import { Toast } from './components/common/Toast';
import { rankAccounts } from './services/amlDetection';
import './App.css';

function Dashboard() {
  const { loading, error, activeTab, accounts, edges, flags, selectedAccountId, toasts, removeToast } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const ranked = rankAccounts(accounts, edges, flags);
  const rankedAccount = ranked.find((a) => a.accountId === selectedAccountId);

  return (
    <div className="h-full flex flex-col bg-slate-100">
      <Header />
      <ThresholdBreachAlert />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <TabNav />
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'graph' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-[3] min-h-[280px] overflow-hidden">
                  <TransactionGraph />
                </div>
                <div className="flex-[2] min-h-[180px] border-t border-slate-200 overflow-auto">
                  <TransactionTable />
                </div>
              </div>
            )}

            {activeTab === 'aml' && (
              <div className="overflow-auto">
                <div className="space-y-4 p-4">
                  <TypologyLegend />
                  <AccountFlagPanel />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <PatternTimeSeriesChart />
                    <SeveritySummaryChart />
                  </div>
                  <TypologyBreakdownChart />
                  {rankedAccount && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <RiskScoreGauge account={rankedAccount} />
                      <AccountActionPanel />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'queue' && (
              <div className="overflow-auto">
                <div className="space-y-4">
                  <PriorityQueue />
                  <div className="px-4">
                    <ActivityEvolutionChart />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function App() {
  return <Dashboard />;
}
