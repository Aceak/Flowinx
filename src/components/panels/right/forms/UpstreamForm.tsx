import type { UpstreamData } from '../../../../types/nodes';

interface Props { data: UpstreamData; onChange: (d: Partial<UpstreamData>) => void; }

const STRATEGY_OPTIONS = [
  { value: 'round-robin', label: '轮询', desc: '轮流分配给每个后端（默认）' },
  { value: 'least-conn', label: '最少连接数', desc: '谁空闲就给谁' },
  { value: 'ip-hash', label: 'IP 哈希', desc: '同一客户端固定到同一后端' },
] as const;

export function UpstreamForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">名称（给自己看的）</span>
        <input type="text" value={data.label} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">后端组名称（英文，用于标识）</span>
        <input type="text" value={data.name} className="border rounded px-2.5 py-2 text-sm"
          placeholder="backend"
          onChange={(e) => onChange({ name: e.target.value })} />
      </label>

      <div>
        <span className="text-gray-600 text-sm font-medium mb-2 block">负载均衡方式</span>
        <div className="flex flex-col gap-1">
          {STRATEGY_OPTIONS.map((opt) => (
            <label key={opt.value}
              className={`flex flex-col px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                data.strategy === opt.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio" name="strategy" className="sr-only"
                  checked={data.strategy === opt.value}
                  onChange={() => onChange({ strategy: opt.value as UpstreamData['strategy'] })}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </div>
              <span className="text-xs text-gray-400 ml-0">{opt.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">保持连接数</span>
        <input type="number" value={data.keepalive} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ keepalive: Number(e.target.value) })} />
        <span className="text-xs text-gray-400">与后端保持的长连接数量，默认 32</span>
      </label>
    </div>
  );
}
