import { useApp } from '../../context/AppContext';
import { TABS } from '../../utils/constants';

export function TabNav() {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="flex border-b border-slate-200 bg-white px-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
