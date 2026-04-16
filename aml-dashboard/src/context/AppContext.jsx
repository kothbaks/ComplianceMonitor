import { createContext, useContext, useState } from 'react';
import { useData } from '../hooks/useData';
import { useToast } from '../hooks/useToast';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const data = useData();
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [activeTab, setActiveTab] = useState('graph');
  const toast = useToast();

  const selectedAccount = data.accounts.find((a) => a.accountId === selectedAccountId) || null;

  return (
    <AppContext.Provider
      value={{
        ...data,
        selectedAccountId,
        setSelectedAccountId,
        selectedAccount,
        activeTab,
        setActiveTab,
        ...toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
