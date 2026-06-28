import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { NodePalette } from './DraggableItem';
import { ThemeToggle } from '../theme/ThemeToggle';
import { Trash2, FileCode2, FileUp, FileDown, Menu, X } from 'lucide-react';
import { configToGraph } from '../../utils/nginxParser';
import { templates } from '../../templates';

export function Sidebar() {
  const { clearCanvas, generateConfig, loadGraph, nodes } = useStore();
  const setPanelCollapsed = useStore((s) => s.setPanelCollapsed);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (confirm('确定清空画布？')) clearCanvas();
  };

  const handleGenerate = () => {
    generateConfig();
    setPanelTab('output');
    setPanelCollapsed(false);
  };

  const handleLoadTemplate = (key: string) => {
    const t = templates[key];
    if (!t) return;
    if (nodes.length > 0 && !confirm('加载模板会替换当前内容，继续？')) return;
    loadGraph(t.nodes as never, t.edges as never);
  };

  // 导出为 nginx 配置文件
  const handleExport = () => {
    const state = useStore.getState();
    if (!state.generatedConfig) { state.generateConfig(); }
    const config = useStore.getState().generatedConfig;
    if (!config) return;
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = state.configMode === 'main' ? 'nginx.conf' : 'site.conf';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 nginx .conf 文件并解析为架构图
  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.conf,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const text = r.result as string;
          const { nodes, edges } = configToGraph(text);
          if (nodes.length === 0) { alert('未能从配置文件中解析出有效结构'); return; }
          if (useStore.getState().nodes.length > 0 && !confirm('导入会替换当前内容，继续？')) return;
          loadGraph(nodes as never, edges as never);
          useStore.getState().generateConfig();
        } catch { alert('无效的 nginx 配置文件'); }
      };
      r.readAsText(file);
    };
    input.click();
  };

  const sidebarContent = (
    <div className="w-64 bg-gray-50 dark:bg-neutral-800 border-r border-gray-200 dark:border-neutral-700 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800 dark:text-neutral-100 flex items-center gap-2">
            <img src="Flowinx.png" alt="Flowinx" className="w-7 h-7" />
            Flowinx
          </h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {/* 移动端关闭按钮 */}
            <button onClick={() => setOpen(false)} className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NodePalette />
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-neutral-700">
        <h3 className="text-sm font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2">预设模板</h3>
        <div className="flex flex-col gap-1.5">
          {Object.entries(templates).map(([k, t]) => (
            <button key={k} onClick={() => { handleLoadTemplate(k); setOpen(false); }}
              className="text-left text-sm px-3 py-2 rounded bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-gray-700 dark:text-neutral-300">
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-neutral-700 flex flex-col gap-1.5">
        <button onClick={handleGenerate}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm font-medium">
          <FileCode2 size={15} />配置文件
        </button>
        <div className="flex gap-1.5">
          <button onClick={handleExport} disabled={nodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 disabled:opacity-40 text-xs">
            <FileUp size={13} />导出配置
          </button>
          <button onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-neutral-300 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-xs">
            <FileDown size={13} />导入配置
          </button>
        </div>
        <button onClick={handleClear} disabled={nodes.length === 0}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 text-sm">
          <Trash2 size={14} />清空画布
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 移动端汉堡按钮 */}
      <button onClick={() => setOpen(true)}
        className="md:hidden absolute top-3 left-3 z-20 p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm text-gray-500 dark:text-neutral-400">
        <Menu size={20} />
      </button>

      {/* 桌面端：固定侧边栏 */}
      <aside className="hidden md:flex shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* 移动端：浮层 overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative z-10 h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
