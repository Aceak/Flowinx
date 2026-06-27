import { useState } from 'react';
import type { ServerData } from '../../../../types/nodes';
import { Lock, Folder, ArrowRightLeft } from 'lucide-react';

interface Props { data: ServerData; onChange: (d: Partial<ServerData>) => void; }

export function ServerBlockForm({ data, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">网站名称（给自己看的）</span>
        <input type="text" value={data.label} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">域名</span>
        <input type="text" value={data.serverName} className="border rounded px-2.5 py-2 text-sm"
          placeholder="www.example.com" onChange={(e) => onChange({ serverName: e.target.value })} />
      </label>

      {/* 监听地址 + 端口 */}
      <div>
        <span className="text-gray-600 text-sm font-medium mb-1 block">监听地址</span>
        <div className="flex items-center gap-1.5">
          <input type="text" value={data.listenAddr} className="border rounded px-2.5 py-2 text-sm flex-1"
            placeholder="0.0.0.0（留空=所有网卡）"
            onChange={(e) => onChange({ listenAddr: e.target.value })} />
          <span className="text-gray-400 text-sm">:</span>
          <input type="number" value={data.port} className="border rounded px-2.5 py-2 text-sm w-20"
            onChange={(e) => onChange({ port: Number(e.target.value) })} />
        </div>
      </div>

      {/* HTTPS 复选框 */}
      <label className="flex items-center gap-2 text-sm cursor-pointer py-1">
        <input type="checkbox" checked={data.ssl}
          onChange={(e) => {
            const checked = e.target.checked;
            // 勾选 HTTPS 自动切 443，取消勾选自动切回 80
            const port = checked ? 443 : (data.port === 443 ? 80 : data.port);
            onChange({ ssl: checked, port });
          }} />
        <Lock size={14} className="text-gray-500" />
        <span className="text-gray-700 font-medium">启用 HTTPS</span>
        <span className="text-xs text-gray-400">（需要 SSL 证书）</span>
      </label>

      {/* SSL 证书 */}
      {data.ssl && (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">证书文件路径</span>
            <input type="text" value={data.sslCert} className="border rounded px-2.5 py-1.5 text-sm"
              placeholder="/etc/nginx/ssl/fullchain.pem" onChange={(e) => onChange({ sslCert: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">私钥文件路径</span>
            <input type="text" value={data.sslKey} className="border rounded px-2.5 py-1.5 text-sm"
              placeholder="/etc/nginx/ssl/privkey.pem" onChange={(e) => onChange({ sslKey: e.target.value })} />
          </label>
        </div>
      )}

      {/* 静态文件 / 纯反代 */}
      <div>
        <span className="text-gray-600 text-sm font-medium mb-2 block">这个网站的类型</span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button"
            onClick={() => onChange({ hasStatic: true, root: data.root || '/var/www/html', index: data.index || 'index.html index.htm' })}
            className={`py-3 px-3 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${
              data.hasStatic ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            <Folder size={16} className="mb-0.5" />提供静态文件<span className="text-xs font-normal text-gray-400">有网页文件</span>
          </button>
          <button type="button"
            onClick={() => onChange({ hasStatic: false })}
            className={`py-3 px-3 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${
              !data.hasStatic ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            <ArrowRightLeft size={16} className="mb-0.5" />纯反向代理<span className="text-xs font-normal text-gray-400">只转发流量</span>
          </button>
        </div>
      </div>

      {data.hasStatic && (
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 text-sm font-medium">网站文件目录</span>
          <input type="text" value={data.root} className="border rounded px-2.5 py-2 text-sm"
            placeholder="/var/www/html" onChange={(e) => onChange({ root: e.target.value })} />
        </label>
      )}

      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
        {showAdvanced ? '收起' : '展开'} 高级选项
      </button>

      {showAdvanced && (
        <div className="space-y-3 border-t pt-3">
          {data.hasStatic && (
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs">首页文件（空格分隔）</span>
              <input type="text" value={data.index} className="border rounded px-2.5 py-2 text-sm"
                onChange={(e) => onChange({ index: e.target.value })} />
            </label>
          )}
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">域名别名（空格分隔，可选）</span>
            <input type="text" value={data.aliases} className="border rounded px-2.5 py-2 text-sm"
              placeholder="example.com m.example.com" onChange={(e) => onChange({ aliases: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}
