import type { MapData } from '../../../../types/nodes';
import { INPUT_CLASS, INPUT_CLASS_COMPACT } from '../../../../constants/styles';

interface Props { data: MapData; onChange: (d: Partial<MapData>) => void; }

export function MapForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS} onChange={(e) => onChange({ label: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">源变量</span>
        <input type="text" value={data.source} className={INPUT_CLASS} placeholder="$http_upgrade" onChange={(e) => onChange({ source: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">例如 $http_upgrade、$host</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">目标变量</span>
        <input type="text" value={data.target} className={INPUT_CLASS} placeholder="$connection_upgrade" onChange={(e) => onChange({ target: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">映射规则（一行一条：key value;）</span>
        <textarea value={data.rules} rows={4} className={INPUT_CLASS_COMPACT + ' font-mono'} placeholder={`upgrade websocket;\ndefault $default_value;`}
          onChange={(e) => onChange({ rules: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">默认值</span>
        <input type="text" value={data.defaultValue} className={INPUT_CLASS} placeholder="close" onChange={(e) => onChange({ defaultValue: e.target.value })} />
      </label>
    </div>
  );
}
