import type { CacheData } from '../../../../types/nodes';
import { INPUT_CLASS, CHECKBOX_CLASS } from '../../../../constants/styles';

interface Props { data: CacheData; onChange: (d: Partial<CacheData>) => void; }

export function CacheForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS}
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">缓存区名称</span>
        <input type="text" value={data.zone} className={INPUT_CLASS}
          placeholder="my_cache" onChange={(e) => onChange({ zone: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">缓存时长</span>
        <input type="text" value={data.time} className={INPUT_CLASS}
          placeholder="1h" onChange={(e) => onChange({ time: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">例如 10m、1h、1d</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">最大缓存大小</span>
        <input type="text" value={data.maxSize} className={INPUT_CLASS}
          placeholder="100m" onChange={(e) => onChange({ maxSize: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">例如 100m、1g</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">内存区大小（keys_zone）</span>
        <input type="text" value={data.zoneSize || '10m'} className={INPUT_CLASS}
          placeholder="10m" onChange={(e) => onChange({ zoneSize: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">缓存索引的内存大小，通常 1-10m</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">缓存键（proxy_cache_key）</span>
        <input type="text" value={data.keys} className={INPUT_CLASS}
          placeholder="$scheme$proxy_host$request_uri" onChange={(e) => onChange({ keys: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">决定如何区分不同请求的缓存</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.useStale} className={CHECKBOX_CLASS}
          onChange={(e) => onChange({ useStale: e.target.checked })} />
        <span className="text-gray-600 dark:text-neutral-400">允许返回过期缓存（proxy_cache_use_stale）</span>
        <span className="text-xs text-gray-400 dark:text-neutral-500">后端不可用时使用过期缓存</span>
      </label>
    </div>
  );
}
