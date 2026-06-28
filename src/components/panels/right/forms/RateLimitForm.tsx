import type { RateLimitData } from '../../../../types/nodes';
import { INPUT_CLASS, CHECKBOX_CLASS } from '../../../../constants/styles';

interface Props { data: RateLimitData; onChange: (d: Partial<RateLimitData>) => void; }

export function RateLimitForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS} onChange={(e) => onChange({ label: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">限制区域名 (zone)</span>
        <input type="text" value={data.zone} className={INPUT_CLASS} placeholder="limit_zone" onChange={(e) => onChange({ zone: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">速率</span>
        <input type="text" value={data.rate} className={INPUT_CLASS} placeholder="10r/s" onChange={(e) => onChange({ rate: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">例如 10r/s、30r/m</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">突发 (burst)</span>
        <input type="number" value={data.burst} className={INPUT_CLASS} onChange={(e) => onChange({ burst: parseInt(e.target.value, 10) || 0 })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">共享内存大小</span>
        <input type="text" value={data.zoneSize} className={INPUT_CLASS} placeholder="10m" onChange={(e) => onChange({ zoneSize: e.target.value })} />
      </label>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.nodelay} className={CHECKBOX_CLASS} onChange={(e) => onChange({ nodelay: e.target.checked })} />
        <span className="text-gray-600 dark:text-neutral-400">nodelay（超出突发立即拒绝）</span>
      </label>
    </div>
  );
}
