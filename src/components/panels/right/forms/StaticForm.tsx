import type { StaticData } from '../../../../types/nodes';
import { INPUT_CLASS, CHECKBOX_CLASS } from '../../../../constants/styles';

interface Props { data: StaticData; onChange: (d: Partial<StaticData>) => void; }

export function StaticForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS}
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">文件根目录</span>
        <input type="text" value={data.root} className={INPUT_CLASS}
          placeholder="/var/www/static" onChange={(e) => onChange({ root: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">默认首页</span>
        <input type="text" value={data.index} className={INPUT_CLASS}
          placeholder="index.html index.htm" onChange={(e) => onChange({ index: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">try_files</span>
        <input type="text" value={data.tryFiles} className={INPUT_CLASS}
          placeholder="$uri $uri/ /index.html" onChange={(e) => onChange({ tryFiles: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">按顺序尝试文件，常用于 SPA</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">Cache-Control（浏览器缓存策略）</span>
        <input type="text" value={data.cacheControl} className={INPUT_CLASS}
          placeholder="public, max-age=31536000, immutable" onChange={(e) => onChange({ cacheControl: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">不写则用默认，no-cache / no-store / public max-age=...</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">浏览器缓存时间 (expires)</span>
        <input type="text" value={data.expires} className={INPUT_CLASS}
          placeholder="30d" onChange={(e) => onChange({ expires: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">例如 7d、30d、1h，留空不缓存</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.autoindex} className={CHECKBOX_CLASS}
          onChange={(e) => onChange({ autoindex: e.target.checked })} />
        <span className="text-gray-600 dark:text-neutral-400">开启目录浏览</span>
        <span className="text-xs text-gray-400 dark:text-neutral-500">让用户可以浏览文件列表</span>
      </label>
    </div>
  );
}
