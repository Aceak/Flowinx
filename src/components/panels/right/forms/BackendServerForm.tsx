import { useState } from 'react';
import type { BackendData } from '../../../../types/nodes';

interface Props { data: BackendData; onChange: (d: Partial<BackendData>) => void; }

export function BackendServerForm({ data, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">名称（给自己看的）</span>
        <input type="text" value={data.label} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">服务器地址</span>
        <input type="text" value={data.address} className="border rounded px-2.5 py-2 text-sm"
          placeholder="127.0.0.1:3000"
          onChange={(e) => onChange({ address: e.target.value })} />
        <span className="text-xs text-gray-400">格式：IP地址:端口，例如 192.168.1.10:3000</span>
      </label>

      {/* 快捷端口 */}
      <div>
        <span className="text-gray-500 text-xs mb-1 block">快捷设置端口</span>
        <div className="flex flex-wrap gap-1.5">
          {['3000', '5000', '8000', '8080'].map((port) => {
            const base = data.address.split(':')[0] || '127.0.0.1';
            return (
              <button key={port} type="button"
                onClick={() => onChange({ address: `${base}:${port}` })}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  data.address.endsWith(`:${port}`)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
              >
                :{port}
              </button>
            );
          })}
        </div>
      </div>

      {/* 高级 */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
        {showAdvanced ? '收起' : '展开'} 高级选项
      </button>

      {showAdvanced && (
        <div className="space-y-3 border-t pt-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs">权重（数字越大请求越多）</span>
              <input type="number" value={data.weight} min={1} className="border rounded px-2.5 py-2 text-sm"
                onChange={(e) => onChange({ weight: e.target.value === '' ? 1 : Number(e.target.value) || 1 })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs">最大失败次数</span>
              <input type="number" value={data.maxFails} min={0} className="border rounded px-2.5 py-2 text-sm"
                onChange={(e) => onChange({ maxFails: Number(e.target.value) })} />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 text-xs">失败超时(秒)</span>
              <input type="number" value={data.failTimeout} min={0} className="border rounded px-2.5 py-2 text-sm"
                onChange={(e) => onChange({ failTimeout: Number(e.target.value) })} />
            </label>
            <label className="flex items-center gap-2 text-sm mt-5 cursor-pointer">
              <input type="checkbox" checked={data.backup}
                onChange={(e) => onChange({ backup: e.target.checked })} />
              <span className="text-gray-600">备用</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
