import type { StaticData } from '../../../../types/nodes';

interface Props { data: StaticData; onChange: (d: Partial<StaticData>) => void; }

export function StaticForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">匹配路径</span>
        <input type="text" value={data.path} className="border rounded px-2.5 py-2 text-sm"
          placeholder="/static" onChange={(e) => onChange({ path: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">文件根目录</span>
        <input type="text" value={data.root} className="border rounded px-2.5 py-2 text-sm"
          placeholder="/var/www/static" onChange={(e) => onChange({ root: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">浏览器缓存时间</span>
        <input type="text" value={data.expires} className="border rounded px-2.5 py-2 text-sm"
          placeholder="30d" onChange={(e) => onChange({ expires: e.target.value })} />
        <span className="text-xs text-gray-400">例如 7d、30d、1h，留空不缓存</span>
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.autoindex}
          onChange={(e) => onChange({ autoindex: e.target.checked })} />
        <span className="text-gray-600">开启目录浏览</span>
        <span className="text-xs text-gray-400">让用户可以浏览文件列表</span>
      </label>
    </div>
  );
}
