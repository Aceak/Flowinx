import { useState } from 'react';
import type { LocationData } from '../../../../types/nodes';
import { Lightbulb, ArrowRightLeft, Folder, ShieldBan } from 'lucide-react';

interface Props { data: LocationData; onChange: (d: Partial<LocationData>) => void; }

const PATH_OPTIONS = [
  { value: '/', label: '所有路径 (/)' },
  { value: '/api', label: 'API 接口 (/api)' },
  { value: '/api/', label: 'API 接口 (/api/*)' },
  { value: '/images/', label: '图片 (/images/*)' },
  { value: '/static/', label: '静态资源 (/static/*)' },
  { value: '__custom__', label: '自定义路径（支持正则）' },
];

const PROXY_PRESETS = [
  { value: 'http://127.0.0.1:3000', label: '本机 3000 端口' },
  { value: 'http://127.0.0.1:8080', label: '本机 8080 端口' },
  { value: 'http://127.0.0.1:5000', label: '本机 5000 端口' },
  { value: 'http://127.0.0.1:8000', label: '本机 8000 端口' },
  { value: '__custom__', label: '自定义地址...' },
];

export function LocationForm({ data, onChange }: Props) {
  const [showAccess, setShowAccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPath, setCustomPath] = useState(!PATH_OPTIONS.slice(0, -1).some((o) => o.value === data.path));
  const [customProxy, setCustomProxy] = useState(!PROXY_PRESETS.slice(0, -1).some((o) => o.value === data.proxyPass));

  const mode = data.mode || 'static';

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 text-sm font-medium">名称（给自己看的）</span>
        <input type="text" value={data.label} className="border rounded px-2.5 py-2 text-sm"
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>

      {/* 路径选择 */}
      <div>
        <span className="text-gray-600 text-sm font-medium mb-2 block">匹配路径</span>
        <div className="flex flex-col gap-1">
          {PATH_OPTIONS.map((opt) => (
            <label key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                (opt.value === '__custom__' && customPath) || data.path === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <input type="radio" name="path" className="sr-only"
                checked={opt.value === '__custom__' ? customPath : data.path === opt.value}
                onChange={() => {
                  if (opt.value === '__custom__') { setCustomPath(true); }
                  else { setCustomPath(false); onChange({ path: opt.value }); }
                }}
              />
              {opt.label}
            </label>
          ))}
        </div>
        {customPath && (
          <>
            <input type="text" value={data.path} className="border rounded px-2.5 py-2 text-sm mt-1 w-full"
              placeholder="/custom 或 ~ \.php$" autoFocus
              onChange={(e) => onChange({ path: e.target.value })} />
            <p className="text-xs text-gray-400 mt-1">支持正则：<code className="text-xs bg-gray-100 px-1 rounded">~ \.php$</code> 或 <code className="text-xs bg-gray-100 px-1 rounded">~* /admin</code></p>
          </>
        )}
      </div>

      {/* 模式选择 */}
      <div>
        <span className="text-gray-600 text-sm font-medium mb-2 block">这个路径用来做什么</span>
        <div className="grid grid-cols-3 gap-2">
          <button type="button"
            onClick={() => onChange({ mode: 'proxy', proxyPass: data.proxyPass || 'http://127.0.0.1:3000' })}
            className={`py-2.5 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${
              mode === 'proxy' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            <ArrowRightLeft size={16} className="mb-0.5" />反代<span className="text-xs font-normal text-gray-400">转发流量</span>
          </button>
          <button type="button"
            onClick={() => onChange({ mode: 'static', proxyPass: '' })}
            className={`py-2.5 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${
              mode === 'static' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            <Folder size={16} className="mb-0.5" />静态<span className="text-xs font-normal text-gray-400">本地文件</span>
          </button>
          <button type="button"
            onClick={() => onChange({ mode: 'block', proxyPass: '' })}
            className={`py-2.5 px-2 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center ${
              mode === 'block' ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            <ShieldBan size={16} className="mb-0.5" />禁止<span className="text-xs font-normal text-gray-400">拒绝访问</span>
          </button>
        </div>
      </div>

      {/* === 反代模式 === */}
      {mode === 'proxy' && (
        <>
          <div>
            <span className="text-gray-600 text-sm font-medium mb-2 block">转发到哪个后端</span>
            <div className="flex flex-col gap-1">
              {PROXY_PRESETS.map((opt) => (
                <label key={opt.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    (opt.value === '__custom__' && customProxy) || data.proxyPass === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <input type="radio" name="proxy" className="sr-only"
                    checked={opt.value === '__custom__' ? customProxy : data.proxyPass === opt.value}
                    onChange={() => {
                      if (opt.value === '__custom__') { setCustomProxy(true); }
                      else { setCustomProxy(false); onChange({ proxyPass: opt.value }); }
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {customProxy && (
              <input type="text" value={data.proxyPass} className="border rounded px-2.5 py-2 text-sm mt-1 w-full"
                placeholder="http://10.0.0.5:3000" autoFocus
                onChange={(e) => onChange({ proxyPass: e.target.value })} />
            )}
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
            也可通过连线指定目标：连「后端服务器」= 直接反代，连「后端组」= 负载均衡。
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.xff}
              onChange={(e) => onChange({ xff: e.target.checked })} />
            <span className="text-gray-700">传递客户端真实 IP（X-Forwarded-For）</span>
          </label>
        </>
      )}

      {/* === 静态模式 === */}
      {mode === 'static' && (
        <>
          <label className="flex flex-col gap-1">
            <span className="text-gray-600 text-sm font-medium">文件目录</span>
            <input type="text" value={data.root} className="border rounded px-2.5 py-2 text-sm"
              placeholder="留空则使用网站的根目录"
              onChange={(e) => onChange({ root: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={data.useIndex}
              onChange={(e) => onChange({ useIndex: e.target.checked, index: e.target.checked ? data.index : 'index.html index.htm' })} />
            <span className="text-gray-700">自定义首页文件</span>
          </label>
          {data.useIndex && (
            <input type="text" value={data.index} className="border rounded px-2.5 py-2 text-sm"
              onChange={(e) => onChange({ index: e.target.value })} />
          )}
        </>
      )}

      {/* === 禁止模式 === */}
      {mode === 'block' && (
        <div>
          <span className="text-gray-600 text-sm font-medium mb-2 block">返回哪个状态码</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { code: 403, label: '403 禁止访问', desc: '常见：拒绝特定IP' },
              { code: 404, label: '404 不存在', desc: '常见：隐藏路径' },
              { code: 401, label: '401 未授权', desc: '需要登录' },
              { code: 444, label: '444 直接断开', desc: 'nginx 专用，无响应' },
              { code: 405, label: '405 方法不允许', desc: '限制 HTTP 方法' },
              { code: 410, label: '410 已删除', desc: '永久删除' },
              { code: 502, label: '502 网关错误', desc: '伪装后端故障' },
              { code: 503, label: '503 服务不可用', desc: '维护中' },
            ].map(({ code, label, desc }) => (
              <button key={code} type="button"
                onClick={() => onChange({ blockStatus: code })}
                className={`py-2.5 px-2 rounded-lg border-2 text-sm transition-all text-left ${
                  data.blockStatus === code ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
                <span className="font-medium block">{label}</span>
                <span className="text-xs text-gray-400">{desc}</span>
              </button>
            ))}
            {/* 自定义状态码 */}
            <div className={`py-2 px-2 rounded-lg border-2 text-sm transition-all col-span-2 flex items-center gap-2 ${
              ![403,404,401,444,405,410,502,503].includes(data.blockStatus) ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
            }`}>
              <span className="text-gray-500 shrink-0">自定义</span>
              <input type="number" min={100} max={599}
                value={[403,404,401,444,405,410,502,503].includes(data.blockStatus) ? '' : data.blockStatus}
                placeholder="418"
                className="border rounded px-1.5 py-1 text-sm w-full"
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (v >= 100 && v <= 599) onChange({ blockStatus: v });
                  else if (e.target.value === '') onChange({ blockStatus: 403 });
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* === 通用：IP 访问控制 === */}
      <button type="button" onClick={() => setShowAccess(!showAccess)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
        {showAccess ? '收起' : '展开'} IP 访问控制
      </button>
      {showAccess && (
        <div className="bg-orange-50 rounded-lg p-3 space-y-2">
          <p className="text-xs text-orange-700 mb-1">限制谁能访问</p>
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">允许的 IP（一行一个，留空=全部允许）</span>
            <textarea value={data.allow} rows={2} className="border rounded px-2.5 py-1.5 text-sm"
              placeholder="192.168.1.0/24"
              onChange={(e) => onChange({ allow: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 text-xs">禁止的 IP（一行一个）</span>
            <textarea value={data.deny} rows={2} className="border rounded px-2.5 py-1.5 text-sm"
              placeholder="1.2.3.4"
              onChange={(e) => onChange({ deny: e.target.value })} />
          </label>
          <p className="text-xs text-gray-400 flex items-center gap-1"><Lightbulb size={11} /> 单个IP、网段 192.168.0.0/16、或 all</p>
        </div>
      )}

      {/* === 通用：高级 === */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
        {showAdvanced ? '收起' : '展开'} 高级
      </button>
      {showAdvanced && (
        <label className="flex flex-col gap-1 pt-2">
          <span className="text-gray-500 text-xs">额外 nginx 配置（可选）</span>
          <textarea value={data.extra} rows={3} className="border rounded px-2.5 py-1.5 text-sm font-mono"
            placeholder="proxy_read_timeout 60s;"
            onChange={(e) => onChange({ extra: e.target.value })} />
        </label>
      )}
    </div>
  );
}
