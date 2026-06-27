import { useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { NodePalette } from './DraggableItem';
import { Trash2, Download, Play, FileJson, Upload } from 'lucide-react';
import { templates } from '../../templates';

export function Sidebar() {
  const { clearCanvas, generateConfig, loadGraph, nodes, generatedConfig } = useStore();

  const handleClear = () => {
    if (nodes.length === 0) return;
    if (confirm('确定清空画布？')) clearCanvas();
  };

  const handleGenerate = () => generateConfig();

  const handleDownload = useCallback(() => {
    const state = useStore.getState();
    if (!state.generatedConfig) state.generateConfig();
    const config = useStore.getState().generatedConfig;
    if (!config) return;
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nginx.conf'; a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleLoadTemplate = (key: string) => {
    const t = templates[key];
    if (!t) return;
    if (nodes.length > 0 && !confirm('加载模板会替换当前内容，继续？')) return;
    loadGraph(t.nodes as never, t.edges as never);
  };

  const handleExport = () => {
    const s = useStore.getState();
    const blob = new Blob([JSON.stringify({ nodes: s.nodes, edges: s.edges }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nginx-architecture.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const d = JSON.parse(r.result as string);
          if (d.nodes && d.edges) {
            if (nodes.length > 0 && !confirm('导入会替换当前内容，继续？')) return;
            loadGraph(d.nodes, d.edges);
          }
        } catch { alert('无效的 JSON 文件'); }
      };
      r.readAsText(file);
    };
    input.click();
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <img src="/Flowinx.png" alt="Flowinx" className="w-7 h-7" />
          Flowinx
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <NodePalette />
      </div>

      <div className="p-3 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">预设模板</h3>
        <div className="flex flex-col gap-1.5">
          {Object.entries(templates).map(([k, t]) => (
            <button key={k} onClick={() => handleLoadTemplate(k)}
              className="text-left text-sm px-3 py-2 rounded bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 flex flex-col gap-1.5">
        <button onClick={handleGenerate} disabled={nodes.length === 0}
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium">
          <Play size={15} />生成配置
        </button>
        <div className="flex gap-1.5">
          <button onClick={handleExport} disabled={nodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-40 text-xs">
            <Upload size={13} />导出
          </button>
          <button onClick={handleImport}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 text-xs">
            <FileJson size={13} />导入
          </button>
        </div>
        <div className="flex gap-1.5">
          <button onClick={handleClear} disabled={nodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white border border-red-300 text-red-600 rounded hover:bg-red-50 disabled:opacity-40 text-xs">
            <Trash2 size={13} />清空
          </button>
          <button onClick={handleDownload} disabled={!generatedConfig && nodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 text-xs">
            <Download size={13} />下载 .conf
          </button>
        </div>
      </div>
    </aside>
  );
}
