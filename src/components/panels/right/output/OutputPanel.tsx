import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../../../../store/useStore';
import CodeMirror from '@uiw/react-codemirror';
import { nginxLanguage } from '../../../../utils/nginxLang';
import { configToGraph } from '../../../../utils/nginxParser';
import { Copy, AlertTriangle, CheckCircle2, FileText, Loader2 } from 'lucide-react';

export function OutputPanel() {
  const { generatedConfig, configErrors, generateConfig } = useStore();
  const configMode = useStore((s) => s.configMode);
  const setConfigMode = useStore((s) => s.setConfigMode);
  const theme = useStore((s) => s.theme);
  const [editedConfig, setEditedConfig] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const lastSynced = useRef<string | null>(null);

  const displayConfig = editedConfig ?? generatedConfig ?? '';

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

  // 手动编辑时只显示语法错误，不显示画布生成错误
  const allErrors = editedConfig
    ? syntaxErrors
    : [...configErrors.map((e) => e.message), ...syntaxErrors];

  // 双向同步：配置无错误且用户编辑过 → 解析回画布
  useEffect(() => {
    if (!editedConfig || allErrors.length > 0) { setSyncing(false); return; }
    if (editedConfig === lastSynced.current) { setSyncing(false); return; }
    setSyncing(true);
    const timer = setTimeout(() => {
      try {
        if (allErrors.length > 0) { setSyncing(false); return; }
        const { nodes, edges } = configToGraph(editedConfig);
        lastSynced.current = editedConfig;
        useStore.getState().loadGraph(nodes, edges);
        useStore.getState().generateConfig();
      } catch { /* 解析失败 */ }
      setSyncing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [editedConfig, allErrors.length]);

  const handleCopy = useCallback(async () => {
    if (!displayConfig) return;
    try { await navigator.clipboard.writeText(displayConfig); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* fallback */ }
  }, [displayConfig]);

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
        {syncing ? (
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <Loader2 size={11} className="animate-spin" />同步中…
          </div>
        ) : allErrors.length > 0 ? (
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
