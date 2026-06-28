import type { AuthData } from '../../../../types/nodes';
import { INPUT_CLASS, CHECKBOX_CLASS } from '../../../../constants/styles';
import { Shield, ArrowRightLeft, Key } from 'lucide-react';

interface Props { data: AuthData; onChange: (d: Partial<AuthData>) => void; }

export function AuthForm({ data, onChange }: Props) {
  const t = data.authType || 'basic';

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">名称</span>
        <input type="text" value={data.label} className={INPUT_CLASS} onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      <div>
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium mb-2 block">认证方式</span>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => onChange({ authType: 'basic' })}
            className={`py-2 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${t === 'basic' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm' : 'border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-500'}`}>
            <Shield size={15} className="mb-0.5" />Basic<span className="text-xs font-normal">密码文件</span>
          </button>
          <button type="button" onClick={() => onChange({ authType: 'request' })}
            className={`py-2 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${t === 'request' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm' : 'border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-500'}`}>
            <ArrowRightLeft size={15} className="mb-0.5" />子请求<span className="text-xs font-normal">转发验证</span>
          </button>
          <button type="button" onClick={() => onChange({ authType: 'jwt' })}
            className={`py-2 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${t === 'jwt' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-sm' : 'border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-500'}`}>
            <Key size={15} className="mb-0.5" />JWT<span className="text-xs font-normal">令牌验证</span>
          </button>
        </div>
      </div>

      {t === 'basic' && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">提示文字 (realm)</span>
            <input type="text" value={data.realm} className={INPUT_CLASS} placeholder="Restricted Access" onChange={(e) => onChange({ realm: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">密码文件路径</span>
            <input type="text" value={data.userFile} className={INPUT_CLASS} placeholder="/etc/nginx/.htpasswd" onChange={(e) => onChange({ userFile: e.target.value })} />
            <span className="text-xs text-gray-400 dark:text-neutral-500">htpasswd -c /etc/nginx/.htpasswd user</span>
          </label>
        </>
      )}

      {t === 'request' && (
        <label className="flex flex-col gap-1">
          <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">认证子请求 URI</span>
          <input type="text" value={data.authUrl} className={INPUT_CLASS} placeholder="/auth" onChange={(e) => onChange({ authUrl: e.target.value })} />
          <span className="text-xs text-gray-400 dark:text-neutral-500">请求转发到此地址验证，返回 2xx 表示通过</span>
        </label>
      )}

      {t === 'jwt' && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">JWT 密钥</span>
            <input type="text" value={data.jwtKey} className={INPUT_CLASS} placeholder="mysecret 或 /path/to/key.pem" onChange={(e) => onChange({ jwtKey: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">验证字段 (claim)</span>
            <input type="text" value={data.jwtClaim} className={INPUT_CLASS} placeholder="sub" onChange={(e) => onChange({ jwtClaim: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.jwtKeyFile} className={CHECKBOX_CLASS} onChange={(e) => onChange({ jwtKeyFile: e.target.checked })} />
            <span className="text-gray-600 dark:text-neutral-400">密钥是文件路径（auth_jwt_key_file）</span>
          </label>
        </>
      )}
    </div>
  );
}
