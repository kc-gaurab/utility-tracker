import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Readings } from './components/Readings';
import { Bills } from './components/Bills';
import { Trends } from './components/Trends';
import { Ledger } from './components/Ledger';
import { Settings } from './components/Settings';
import { useStore } from './store/useStore';

type Tab = 'dashboard' | 'readings' | 'bills' | 'trends' | 'ledger' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { initializeFirebaseSync, isFirebaseSynced } = useStore();

  // Initialize Firebase sync on mount
  useEffect(() => {
    initializeFirebaseSync();
  }, [initializeFirebaseSync]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'readings', label: 'Meter Readings' },
    { id: 'bills', label: 'Bills' },
    { id: 'trends', label: 'Trends' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-ink text-bg px-10 py-7 border-b border-line">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif font-medium text-[32px] tracking-tight">
              Päivölänrinne 5 — Utility Tracker
            </h1>
            <div className="text-[13px] text-gray-400 mt-1 font-mono tracking-wider uppercase">
              House A & House B · water, heating & settlement
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isFirebaseSynced ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {isFirebaseSynced ? 'Synced' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-surface border-b border-line sticky top-0 z-10">
        <div className="flex gap-0 px-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-ink border-accent'
                  : 'text-ink-mute border-transparent hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="px-10 py-8 max-w-[1400px] mx-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'readings' && <Readings />}
        {activeTab === 'bills' && <Bills />}
        {activeTab === 'trends' && <Trends />}
        {activeTab === 'ledger' && <Ledger />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
