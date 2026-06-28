import type { RedirectData } from '../../../../types/nodes';
import { INPUT_CLASS, CHECKBOX_CLASS } from '../../../../constants/styles';

interface Props { data: RedirectData; onChange: (d: Partial<RedirectData>) => void; }

export function RedirectForm({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS}
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">来源域名</span>
        <input type="text" value={data.fromDomain} className={INPUT_CLASS}
          placeholder="example.com"
          onChange={(e) => onChange({ fromDomain: e.target.value })} />
        <span className="text-xs text-gray-400 dark:text-neutral-500">哪个域名需要跳转（HTTP 的域名）</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">跳转到</span>
        <input type="text" value={data.toUrl} className={INPUT_CLASS}
          placeholder="https://example.com"
          onChange={(e) => onChange({ toUrl: e.target.value })} />
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={data.permanent} className={CHECKBOX_CLASS}
          onChange={(e) => onChange({ permanent: e.target.checked })} />
        <span className="text-gray-600 dark:text-neutral-400">永久重定向（301）</span>
        <span className="text-xs text-gray-400 dark:text-neutral-500">取消则为临时重定向（302）</span>
      </label>
    </div>
  );
}
