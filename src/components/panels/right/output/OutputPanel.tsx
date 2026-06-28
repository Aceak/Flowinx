import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../../store/useStore';
import CodeMirror from '@uiw/react-codemirror';
import { nginxLanguage } from '../../../../utils/nginxLang';
import { Copy, Download, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export function OutputPanel() {
  const { generatedConfig, configErrors, generateConfig, nodes } = useStore();
  const configMode = useStore((s) => s.configMode);
  const setConfigMode = useStore((s) => s.setConfigMode);
  const theme = useStore((s) => s.theme);
  const [editedConfig, setEditedConfig] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const displayConfig = editedConfig ?? generatedConfig;

  // 语法校验
  const { syntaxErrors } = useMemo(() => {
    const errMap = new Map<number, string>();
    if (!displayConfig) return { errorLines: new Set<number>(), syntaxErrors: [] as string[] };
    let depth = 0;
    const lines = displayConfig.split('\n');
    const lastLine = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;
      for (const ch of line) { if (ch === '{') depth++; if (ch === '}') depth--; }
      if (!line.endsWith('{') && !line.endsWith('}') && !line.endsWith(';') && depth >= 0) {
        errMap.set(i + 1, `缺少分号`);
      }
    }
    if (depth > 0) errMap.set(lastLine, `缺少 ${depth} 个闭合 }`);
    if (depth < 0) errMap.set(lastLine, `多余 ${-depth} 个 }`);
    const msgs = [...errMap.entries()].map(([ln, msg]) => `第 ${ln} 行: ${msg}`);
    return { errorLines: new Set(errMap.keys()), syntaxErrors: msgs };
  }, [displayConfig]);

  const allErrors = [...configErrors.map((e) => e.message), ...syntaxErrors];

  const handleCopy = useCallback(async () => {
    if (!displayConfig) return;
    try { await navigator.clipboard.writeText(displayConfig); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* fallback */ }
  }, [displayConfig]);

  const handleDownload = useCallback(() => {
    if (!displayConfig) return;
    const blob = new Blob([displayConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = configMode === 'main' ? 'nginx.conf' : 'site.conf';
    a.click(); URL.revokeObjectURL(url);
  }, [displayConfig, configMode]);

  if (!displayConfig) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-neutral-500 text-sm p-4 text-center gap-2">
        <FileText size={32} className="text-gray-300 dark:text-neutral-600" />
        <p>从左侧拖入节点开始配置</p>
        {nodes.length > 0 && (
          <button onClick={generateConfig}
            className="mt-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 text-sm">立即生成</button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 shrink-0 min-h-[40px] text-gray-700 dark:text-neutral-300">
        <div className="flex items-center gap-1.5">
          <FileText size={14} />
          <span className="text-sm font-semibold">{configMode === 'main' ? 'nginx.conf' : '站点配置'}</span>
          <div className="flex items-center rounded bg-gray-200 dark:bg-neutral-700 p-0.5 gap-0.5">
            <button onClick={() => { if (configMode !== 'conf.d') { setConfigMode('conf.d'); generateConfig(); } }}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${configMode === 'conf.d' ? 'bg-white dark:bg-neutral-600 text-gray-800 dark:text-neutral-200 shadow-sm' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300'}`}>站点配置</button>
            <button onClick={() => { if (configMode !== 'main') { setConfigMode('main'); generateConfig(); } }}
              className={`px-1.5 py-0.5 rounded text-xs transition-colors ${configMode === 'main' ? 'bg-white dark:bg-neutral-600 text-gray-800 dark:text-neutral-200 shadow-sm' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300'}`}>全局配置</button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300">
            <Copy size={13} />{copied ? '已复制' : '复制'}
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600">
            <Download size={13} />下载
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={displayConfig} height="100%"
          onChange={(v) => setEditedConfig(v)}
          style={{ height: '100%', fontSize: '13px', fontFamily: "'Consolas', 'JetBrains Mono', 'Fira Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', 'Microsoft YaHei', '微软雅黑', monospace" }}
          theme={theme === 'dark' ? 'dark' : 'light'}
          extensions={[nginxLanguage]}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false, highlightSelectionMatches: false }}
        />
      </div>

      {/* 状态栏 */}
      <div className={`shrink-0 border-t px-3 py-2 text-xs overflow-y-auto max-h-32 ${allErrors.length > 0 ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' : 'border-gray-200 dark:border-neutral-700 text-green-600 dark:text-green-400'}`}>
        {allErrors.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {allErrors.map((msg, i) => (
              <div key={i} className="flex items-center gap-1"><AlertTriangle size={11} />{msg}</div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1"><CheckCircle2 size={11} />就绪</div>
        )}
      </div>
    </div>
  );
}
