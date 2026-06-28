import { useState } from 'react';
import { ConfigPanel } from './ConfigPanel';
import { OutputPanel } from './output/OutputPanel';
import { Settings, FileText } from 'lucide-react';

export function RightPanel() {
  const [activeTab, setActiveTab] = useState<'config' | 'output'>('config');

  return (
    <aside className="bg-white dark:bg-neutral-900 flex flex-col h-full w-full overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-neutral-700 shrink-0">
        <button onClick={() => setActiveTab('config')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'config' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
          }`}>
          <Settings size={14} />属性
        </button>
        <button onClick={() => setActiveTab('output')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'output' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
          }`}>
          <FileText size={14} />输出
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {activeTab === 'config' ? <ConfigPanel /> : <OutputPanel />}
      </div>
    </aside>
  );
}
