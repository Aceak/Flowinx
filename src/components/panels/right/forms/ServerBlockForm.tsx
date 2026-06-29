import { useState } from 'react';
import type { ServerData } from '../../../../types/nodes';
import { Lock } from 'lucide-react';
import { INPUT_CLASS, INPUT_CLASS_COMPACT, CHECKBOX_CLASS } from '../../../../constants/styles';

interface Props { data: ServerData; onChange: (d: Partial<ServerData>) => void; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 dark:border-neutral-800 pt-3">
      <h4 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 mb-2.5">{title}</h4>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function ServerBlockForm({ data, onChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* 基本信息 */}
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">网站名称（给自己看的）</span>
        <input type="text" value={data.label} className={INPUT_CLASS}
          onChange={(e) => onChange({ label: e.target.value })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-gray-600 dark:text-neutral-400 text-sm font-medium">域名</span>
        <input type="text" value={data.serverName} className={INPUT_CLASS}
          placeholder="www.example.com" onChange={(e) => onChange({ serverName: e.target.value })} />
      </label>

      {/* 监听 */}
      <Section title="监听">
        {!data.listenAddr && !data.listenIPv6 && (
          <p className="text-red-500 text-xs">至少启用一个监听地址</p>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 dark:text-neutral-500 w-9 shrink-0">IPv4</span>
          <input type="text" value={data.listenAddr} className="border dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 rounded px-2.5 py-2 text-sm flex-1"
            placeholder="留空不启用 IPv4"
            onChange={(e) => onChange({ listenAddr: e.target.value })} />
          <span className="text-gray-400 dark:text-neutral-500 text-sm">:</span>
          <input type="number" value={data.port} className="border dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 rounded px-2.5 py-2 text-sm w-20"
            onChange={(e) => onChange({ port: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 dark:text-neutral-500 w-9 shrink-0">IPv6</span>
          <input type="text" value={data.listenIPv6} className="border dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 rounded px-2.5 py-2 text-sm flex-1"
            placeholder="留空不启用 IPv6"
            onChange={(e) => onChange({ listenIPv6: e.target.value })} />
          <span className="text-gray-400 dark:text-neutral-500 text-sm">:</span>
          <input type="number" value={data.ipv6Port} className="border dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-200 rounded px-2.5 py-2 text-sm w-20"
            onChange={(e) => onChange({ ipv6Port: Number(e.target.value) })} />
        </div>
      </Section>

      {/* HTTPS */}
      <Section title="HTTPS">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.ssl} className={CHECKBOX_CLASS}
            onChange={(e) => {
              const checked = e.target.checked;
              const port = checked ? 443 : (data.port === 443 ? 80 : data.port);
              onChange({ ssl: checked, port });
            }} />
          <Lock size={14} className="text-gray-500 dark:text-neutral-400" />
          <span className="text-gray-700 dark:text-neutral-300 font-medium">启用 HTTPS</span>
          <span className="text-xs text-gray-400 dark:text-neutral-500">（需要 SSL 证书）</span>
        </label>
        {data.ssl && (
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-neutral-700 ml-5">
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-neutral-400 text-xs">证书文件路径</span>
              <input type="text" value={data.sslCert} className={INPUT_CLASS_COMPACT}
                placeholder="/etc/nginx/ssl/fullchain.pem" onChange={(e) => onChange({ sslCert: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-neutral-400 text-xs">私钥文件路径</span>
              <input type="text" value={data.sslKey} className={INPUT_CLASS_COMPACT}
                placeholder="/etc/nginx/ssl/privkey.pem" onChange={(e) => onChange({ sslKey: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer pt-1 border-t dark:border-neutral-700">
              <input type="checkbox" checked={data.redirectHttp} className={CHECKBOX_CLASS}
                onChange={(e) => onChange({ redirectHttp: e.target.checked })} />
              <span className="text-gray-600 dark:text-neutral-400 text-xs">自动将 80 端口重定向到 443</span>
            </label>
            <div className="pt-1 border-t dark:border-neutral-700 space-y-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={data.http2} className={CHECKBOX_CLASS}
                  onChange={(e) => onChange({ http2: e.target.checked })} />
                <span className="text-gray-600 dark:text-neutral-400 text-xs">启用 HTTP/2</span>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-gray-500 dark:text-neutral-400 text-xs">SSL 协议版本</span>
                <input type="text" value={data.sslProtocols} className={INPUT_CLASS_COMPACT}
                  placeholder="TLSv1.2 TLSv1.3" onChange={(e) => onChange({ sslProtocols: e.target.value })} />
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={data.sslStapling} className={CHECKBOX_CLASS}
                  onChange={(e) => onChange({ sslStapling: e.target.checked })} />
                <span className="text-gray-600 dark:text-neutral-400 text-xs">OCSP Stapling</span>
              </label>
              {data.sslStapling && (
                <>
                  <label className="flex items-center gap-2 text-sm cursor-pointer pl-4">
                    <input type="checkbox" checked={data.sslStaplingVerify} className={CHECKBOX_CLASS}
                      onChange={(e) => onChange({ sslStaplingVerify: e.target.checked })} />
                    <span className="text-gray-600 dark:text-neutral-400 text-xs">OCSP 证书验证</span>
                  </label>
                  <label className="flex flex-col gap-1 pl-4">
                    <span className="text-gray-500 dark:text-neutral-400 text-xs">可信证书链文件</span>
                    <input type="text" value={data.sslTrustedCert} className={INPUT_CLASS_COMPACT}
                      placeholder="/etc/nginx/ssl/chain.pem" onChange={(e) => onChange({ sslTrustedCert: e.target.value })} />
                  </label>
                </>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* 静态文件 */}
      <Section title="静态文件">
        <label className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-neutral-400 text-xs">网站文件目录</span>
          <input type="text" value={data.root} className={INPUT_CLASS}
            placeholder="/var/www/html（留空则不设置 root）" onChange={(e) => onChange({ root: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-gray-500 dark:text-neutral-400 text-xs">默认首页</span>
          <input type="text" value={data.index} className={INPUT_CLASS}
            placeholder="index.html index.htm（留空则不设置 index）" onChange={(e) => onChange({ index: e.target.value })} />
        </label>
      </Section>

      {/* 传输与压缩 */}
      <Section title="传输与压缩">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.gzip} className={CHECKBOX_CLASS}
            onChange={(e) => onChange({ gzip: e.target.checked })} />
          <span className="text-gray-700 dark:text-neutral-300 font-medium">Gzip 压缩</span>
        </label>
        {data.gzip && (
          <div className="space-y-2 pl-5">
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-neutral-400 text-xs">压缩类型</span>
              <input type="text" value={data.gzipTypes} className={INPUT_CLASS}
                onChange={(e) => onChange({ gzipTypes: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-gray-500 dark:text-neutral-400 text-xs">最小压缩长度 (bytes)</span>
              <input type="text" value={data.gzipMinLength} className={INPUT_CLASS}
                placeholder="1000" onChange={(e) => onChange({ gzipMinLength: e.target.value })} />
            </label>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={data.chunkedTransfer} className={CHECKBOX_CLASS}
            onChange={(e) => onChange({ chunkedTransfer: e.target.checked })} />
          <span className="text-gray-700 dark:text-neutral-300 font-medium">分块传输</span>
        </label>
      </Section>

      {/* 高级选项 */}
      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-xs text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300 flex items-center gap-1 mt-1">
        {showAdvanced ? '收起' : '展开'} 高级选项
      </button>

      {showAdvanced && (
        <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">域名别名（空格分隔）</span>
            <input type="text" value={data.aliases} className={INPUT_CLASS}
              placeholder="example.com m.example.com" onChange={(e) => onChange({ aliases: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">自定义响应头（一行一个，如 HSTS）</span>
            <textarea value={data.addHeaders} rows={3} className={INPUT_CLASS_COMPACT + ' font-mono'}
              placeholder={`Strict-Transport-Security "max-age=31536000; includeSubDomains"\nX-Frame-Options "DENY"\nX-Content-Type-Options "nosniff"`}
              onChange={(e) => onChange({ addHeaders: e.target.value })} />
            <span className="text-xs text-gray-400 dark:text-neutral-500">格式：Header-Name "value"</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">最大请求体大小 (client_max_body_size)</span>
            <input type="text" value={data.clientMaxBodySize} className={INPUT_CLASS}
              placeholder="10m（留空使用默认 1m）" onChange={(e) => onChange({ clientMaxBodySize: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">访问日志 (access_log)</span>
            <input type="text" value={data.accessLog} className={INPUT_CLASS}
              placeholder="/var/log/nginx/access.log" onChange={(e) => onChange({ accessLog: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">错误日志 (error_log)</span>
            <input type="text" value={data.errorLog} className={INPUT_CLASS}
              placeholder="/var/log/nginx/error.log" onChange={(e) => onChange({ errorLog: e.target.value })} />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-gray-500 dark:text-neutral-400 text-xs">额外 nginx 配置</span>
            <textarea value={data.extra} rows={3} className={INPUT_CLASS_COMPACT + ' font-mono'}
              placeholder="proxy_read_timeout 60s;"
              onChange={(e) => onChange({ extra: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );
}
