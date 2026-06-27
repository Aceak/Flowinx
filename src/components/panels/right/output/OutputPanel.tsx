import { useCallback, useState } from 'react';
import { useStore } from '../../../../store/useStore';
import CodeMirror from '@uiw/react-codemirror';
import { nginxLanguage } from '../../../../utils/nginxLang';
import { Copy, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

export function OutputPanel() {
  const { generatedConfig, configErrors, generateConfig, nodes } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!generatedConfig) return;
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = generatedConfig;
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedConfig]);

  const handleDownload = useCallback(() => {
    if (!generatedConfig) return;
    const blob = new Blob([generatedConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'nginx.conf'; a.click();
    URL.revokeObjectURL(url);
  }, [generatedConfig]);

  if (!generatedConfig) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-4 text-center gap-2">
        <FileText size={32} className="text-gray-300" />
        <p>点击左侧「生成配置」按钮</p>
        {nodes.length > 0 && (
          <button onClick={generateConfig}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            立即生成
          </button>
        )}
      </div>
    );
  }

  const hasErrors = configErrors.some((e) => e.severity === 'error');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">生成的配置</h3>
          {hasErrors ? (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">
              <AlertTriangle size={12} />{configErrors.filter((e) => e.severity === 'error').length} 个错误
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              <CheckCircle size={12} />就绪
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-100">
            <Copy size={13} />{copied ? '已复制!' : '复制'}
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            <Download size={13} />下载 .conf
          </button>
        </div>
      </div>

      {configErrors.length > 0 && (
        <div className="border-b border-gray-200 bg-amber-50 p-2 max-h-24 overflow-y-auto shrink-0">
          {configErrors.map((err, i) => (
            <div key={i} className={`text-xs flex items-center gap-1 py-0.5 ${err.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
              <span className={err.severity === 'error' ? 'text-red-500 font-bold' : 'text-amber-500'}>
                {err.severity === 'error' ? '✕' : '⚠'}
              </span>
              {err.message}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={generatedConfig} height="100%"
          style={{ height: '100%', fontSize: '13px',
            fontFamily: "'Consolas', 'JetBrains Mono', 'Fira Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', 'Microsoft YaHei', '微软雅黑', monospace" }}
          theme="light" readOnly
          extensions={[nginxLanguage]}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: false, highlightSelectionMatches: false }}
        />
      </div>
    </div>
  );
}
