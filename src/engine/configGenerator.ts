import type { Node, Edge } from '@xyflow/react';
import type { NodeData, ServerData, LocationData, UpstreamData, BackendData, StaticData, CacheData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import type { ConfigError } from '../types/store';
import { getChildNodes } from './graphTraversal';

const INDENT = (n: number) => '    '.repeat(n);

export function generateConfig(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[],
  mode: 'main' | 'conf.d' = 'conf.d',
): { config: string; errors: ConfigError[] } {
  const errors: ConfigError[] = [];
  if (nodes.length === 0) {
    return { config: '', errors: [{ nodeId: 'graph', severity: 'error', message: '画布为空' }] };
  }

  const lines: string[] = [];
  const isMain = mode === 'main';
  const base = isMain ? 1 : 0; // 主配置缩进一级（在 http 内）

  lines.push(`# Flowinx — ${isMain ? '全局配置 nginx.conf' : '站点配置 conf.d/site.conf'}`);
  lines.push('');

  if (isMain) {
    lines.push('user nginx;');
    lines.push('worker_processes auto;');
    lines.push('error_log /var/log/nginx/error.log warn;');
    lines.push('pid /var/run/nginx.pid;');
    lines.push('');
    lines.push('events {');
    lines.push('    worker_connections 1024;');
    lines.push('}');
    lines.push('');
    lines.push('http {');
    lines.push('    include /etc/nginx/mime.types;');
    lines.push('    default_type application/octet-stream;');
    lines.push('    sendfile on;');
    lines.push('    keepalive_timeout 65;');
    lines.push('    include /etc/nginx/conf.d/*.conf;');
    lines.push('');
  }

  const upstreams = nodes.filter((n) => n.type === 'upstream');
  const servers = nodes.filter((n) => n.type === 'server') as Node<ServerData>[];

  // 收集所有缓存区
  const cacheZones = new Map<string, CacheData>();
  for (const cn of nodes.filter((n) => n.type === 'cache')) {
    const c = cn.data as CacheData;
    if (c.zone && !cacheZones.has(c.zone)) cacheZones.set(c.zone, c);
  }

  // proxy_cache_path
  for (const [zone, c] of cacheZones) {
    const keysZoneSize = c.zoneSize || '10m';
    lines.push(INDENT(base) + `proxy_cache_path /var/cache/nginx/${zone} levels=1:2 keys_zone=${zone}:${keysZoneSize} max_size=${c.maxSize} inactive=${c.time};`);
  }
  if (cacheZones.size > 0) lines.push('');

  // upstream
  for (const us of upstreams) {
    const d = us.data as UpstreamData;
    const backends = getChildNodes(nodes, edges, us.id).filter((n) => n.type === 'backend') as Node<BackendData>[];
    lines.push(INDENT(base) + `upstream ${d.name} {`);
    if (d.strategy === 'least-conn') lines.push(INDENT(base + 1) + 'least_conn;');
    if (d.strategy === 'ip-hash') lines.push(INDENT(base + 1) + 'ip_hash;');
    if (d.keepalive > 0) lines.push(INDENT(base + 1) + `keepalive ${d.keepalive};`);
    for (const be of backends) {
      const b = be.data as BackendData;
      const p = [`server ${b.address}`];
      if (b.weight > 1) p.push(`weight=${b.weight}`);
      if (b.maxFails > 0) p.push(`max_fails=${b.maxFails}`);
      if (b.failTimeout > 0) p.push(`fail_timeout=${b.failTimeout}s`);
      if (b.backup) p.push('backup');
      lines.push(INDENT(base + 1) + p.join(' ') + ';');
    }
    lines.push(INDENT(base) + '}');
    lines.push('');
  }

  // limit_req_zone（全局去重）
  const rateZones = new Set<string>();
  for (const rln of nodes.filter((n) => n.type === 'rate_limit')) {
    const rl = rln.data as { zone: string; zoneSize: string; rate: string };
    if (rateZones.has(rl.zone)) continue;
    rateZones.add(rl.zone);
    lines.push(INDENT(base) + `limit_req_zone $binary_remote_addr zone=${rl.zone}:${rl.zoneSize} rate=${rl.rate};`);
  }

  // map 节点
  for (const mn of nodes.filter((n) => n.type === 'map')) {
    const m = mn.data as { source: string; target: string; rules: string; defaultValue: string };
    lines.push(INDENT(base) + `map ${m.source} ${m.target} {`);
    for (const r of (m.rules || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 1) + r.trim());
    if (m.defaultValue) lines.push(INDENT(base + 1) + `default ${m.defaultValue};`);
    lines.push(INDENT(base) + '}');
    lines.push('');
  }

  // server blocks
  for (const server of servers) {
    const s = server.data as ServerData;

    // 自动 80 → 443 重定向
    if (s.redirectHttp && s.ssl) {
      lines.push(INDENT(base) + 'server {');
      lines.push(INDENT(base + 1) + 'listen 80;');
      lines.push(INDENT(base + 1) + `server_name ${s.serverName}${s.aliases ? ' ' + s.aliases : ''};`);
      lines.push(INDENT(base + 1) + 'return 301 https://$host$request_uri;');
      lines.push(INDENT(base) + '}');
      lines.push('');
    }

    const children = getChildNodes(nodes, edges, server.id);

    // main server
    const addr = s.listenAddr ? `${s.listenAddr}:` : '';
    lines.push(INDENT(base) + 'server {');
    lines.push(INDENT(base + 1) + `listen ${addr}${s.port}${s.ssl ? ' ssl' : ''};`);
    lines.push(INDENT(base + 1) + `server_name ${s.serverName}${s.aliases ? ' ' + s.aliases : ''};`);

    if (s.http2) lines.push(INDENT(base + 1) + 'http2 on;');
    if (s.ssl) {
      if (s.sslCert) lines.push(INDENT(base + 1) + `ssl_certificate ${s.sslCert};`);
      if (s.sslKey) lines.push(INDENT(base + 1) + `ssl_certificate_key ${s.sslKey};`);
      if (s.sslProtocols) lines.push(INDENT(base + 1) + `ssl_protocols ${s.sslProtocols};`);
      if (s.sslStapling) lines.push(INDENT(base + 1) + 'ssl_stapling on;');
      if (s.sslStaplingVerify) lines.push(INDENT(base + 1) + 'ssl_stapling_verify on;');
      if (s.sslTrustedCert) lines.push(INDENT(base + 1) + `ssl_trusted_certificate ${s.sslTrustedCert};`);
    }
    if (s.listenIPv6) lines.push(INDENT(base + 1) + `listen ${s.listenIPv6};`);
    for (const h of (s.addHeaders || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 1) + `add_header ${h};`);
    if (s.clientMaxBodySize) lines.push(INDENT(base + 1) + `client_max_body_size ${s.clientMaxBodySize};`);
    if (s.accessLog) lines.push(INDENT(base + 1) + `access_log ${s.accessLog};`);
    if (s.errorLog) lines.push(INDENT(base + 1) + `error_log ${s.errorLog};`);
    if (s.hasStatic !== false) {
      if (s.root) lines.push(INDENT(base + 1) + `root ${s.root};`);
      if (s.index) lines.push(INDENT(base + 1) + `index ${s.index};`);
    }
    if (s.gzip) {
      lines.push(INDENT(base + 1) + 'gzip on;');
      if (s.gzipTypes) lines.push(INDENT(base + 1) + `gzip_types ${s.gzipTypes};`);
      if (s.gzipMinLength) lines.push(INDENT(base + 1) + `gzip_min_length ${s.gzipMinLength};`);
    }
    for (const line of (s.extra || '').split('\n').filter(Boolean)) {
      lines.push(INDENT(base + 1) + line.trim());
    }

    // locations
    const locations = children.filter((n) => n.type === 'location') as Node<LocationData>[];
    for (const loc of locations) {
      const l = loc.data as LocationData;
      const mode = l.mode || 'static';

      lines.push('');
      const stChild = mode === 'static' ? getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'static') as Node<StaticData> | undefined : undefined;
      const locPath = l.path || '/';
      lines.push(INDENT(base + 1) + `location ${locPath} {`);

      if (mode === 'block') {
        if (l.blockPage) {
          lines.push(INDENT(base + 2) + `error_page ${l.blockStatus || 403} ${l.blockPage};`);
          lines.push(INDENT(base + 2) + `return ${l.blockStatus || 403};`);
        } else {
          lines.push(INDENT(base + 2) + `return ${l.blockStatus || 403};`);
        }
      } else if (mode === 'redirect') {
        const suffix = (l.redirectUrl || '').endsWith('/') || (l.redirectUrl || '').includes('?') ? '' : '$request_uri';
        lines.push(INDENT(base + 2) + `return ${l.redirectPermanent !== false ? 301 : 302} ${l.redirectUrl || 'https://example.com'}${suffix};`);
      } else if (mode === 'proxy') {
        if (l.fastcgiPass) {
          const usChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'upstream');
          const beChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'backend');
          if (usChild) lines.push(INDENT(base + 2) + `fastcgi_pass ${(usChild.data as UpstreamData).name};`);
          else if (beChild) lines.push(INDENT(base + 2) + `fastcgi_pass ${(beChild.data as BackendData).address};`);
          else lines.push(INDENT(base + 2) + `fastcgi_pass ${l.fastcgiPass};`);
          if (l.fastcgiIndex) lines.push(INDENT(base + 2) + `fastcgi_index ${l.fastcgiIndex};`);
          for (const p of (l.fastcgiParams || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 2) + `fastcgi_param ${p};`);
        } else {
          const usChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'upstream');
          const beChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'backend');
          if (usChild) lines.push(INDENT(base + 2) + `proxy_pass http://${(usChild.data as UpstreamData).name};`);
          else if (beChild) lines.push(INDENT(base + 2) + `proxy_pass http://${(beChild.data as BackendData).address};`);
          else if (l.proxyPass) lines.push(INDENT(base + 2) + `proxy_pass ${l.proxyPass};`);
          if (l.xff) {
            lines.push(INDENT(base + 2) + 'proxy_set_header Host $host;');
            lines.push(INDENT(base + 2) + 'proxy_set_header X-Real-IP $remote_addr;');
            lines.push(INDENT(base + 2) + 'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
            lines.push(INDENT(base + 2) + 'proxy_set_header X-Forwarded-Proto $scheme;');
          }
        }
      } else {
        // 静态模式：从关联的 static 子节点读取配置
        const st = stChild?.data;
        if (st?.root) lines.push(INDENT(base + 2) + `root ${st.root};`);
        if (st?.index) lines.push(INDENT(base + 2) + `index ${st.index};`);
        if (st?.tryFiles) lines.push(INDENT(base + 2) + `try_files ${st.tryFiles};`);
        if (st?.expires) lines.push(INDENT(base + 2) + `expires ${st.expires};`);
        if (st?.cacheControl) lines.push(INDENT(base + 2) + `add_header Cache-Control "${st.cacheControl}";`);
        if (st?.autoindex) lines.push(INDENT(base + 2) + 'autoindex on;');
      }

      // 缓存节点
      const cacheChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'cache') as Node<CacheData> | undefined;
      if (cacheChild) {
        const c = cacheChild.data;
        lines.push(INDENT(base + 2) + `proxy_cache ${c.zone};`);
        lines.push(INDENT(base + 2) + `proxy_cache_key ${c.keys};`);
        lines.push(INDENT(base + 2) + `proxy_cache_valid ${c.time.includes(' ') ? c.time : `200 ${c.time}`};`);
        if (c.useStale) lines.push(INDENT(base + 2) + 'proxy_cache_use_stale error timeout updating;');
      }

      // 认证节点
      const authChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'auth');
      if (authChild) {
        const a = authChild.data as { authType: string; realm: string; userFile: string; authUrl: string; jwtKey: string; jwtClaim: string; jwtKeyFile: boolean };
        if (a.authType === 'request') {
          lines.push(INDENT(base + 2) + `auth_request ${a.authUrl || '/auth'};`);
        } else if (a.authType === 'jwt') {
          lines.push(INDENT(base + 2) + `auth_jwt "${a.realm || 'API'}" token=$http_authorization;`);
          if (a.jwtKeyFile) lines.push(INDENT(base + 2) + `auth_jwt_key_file ${a.jwtKey};`);
          else lines.push(INDENT(base + 2) + `auth_jwt_key "${a.jwtKey}";`);
          if (a.jwtClaim) lines.push(INDENT(base + 2) + `auth_jwt_claim ${a.jwtClaim};`);
        } else {
          lines.push(INDENT(base + 2) + `auth_basic "${a.realm || 'Restricted Access'}";`);
          lines.push(INDENT(base + 2) + `auth_basic_user_file ${a.userFile || '/etc/nginx/.htpasswd'};`);
        }
      }
      // 限流节点
      const rlChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'rate_limit');
      if (rlChild) {
        const rl = rlChild.data as { zone: string; burst: number; nodelay: boolean };
        lines.push(INDENT(base + 2) + `limit_req zone=${rl.zone} burst=${rl.burst}${rl.nodelay ? ' nodelay' : ''};`);
      }

      if (l.tryFiles) lines.push(INDENT(base + 2) + `try_files ${l.tryFiles};`);
      if (l.expires) lines.push(INDENT(base + 2) + `expires ${l.expires};`);
      for (const inc of (l.includes || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 2) + `include ${inc};`);
      for (const ip of (l.allow || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 2) + `allow ${ip.trim()};`);
      for (const ip of (l.deny || '').split('\n').filter(Boolean)) lines.push(INDENT(base + 2) + `deny ${ip.trim()};`);
      for (const line of (l.extra || '').split('\n').filter(Boolean)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        lines.push(INDENT(base + 2) + t);
      }
      lines.push(INDENT(base + 1) + '}');
    }

    // direct backends
    const directBEs = children.filter((n) => n.type === 'backend') as Node<BackendData>[];
    if (directBEs.length > 0 && locations.length === 0) {
      if (directBEs.length === 1) {
        const b = directBEs[0].data as BackendData;
        lines.push('');
        lines.push(INDENT(base + 1) + 'location / {');
        lines.push(INDENT(base + 2) + `proxy_pass http://${b.address};`);
        lines.push(INDENT(base + 2) + 'proxy_set_header Host $host;');
        lines.push(INDENT(base + 2) + 'proxy_set_header X-Real-IP $remote_addr;');
        lines.push(INDENT(base + 2) + 'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
        lines.push(INDENT(base + 2) + 'proxy_set_header X-Forwarded-Proto $scheme;');
        lines.push(INDENT(base + 1) + '}');
      } else {
        errors.push({
          nodeId: server.id,
          severity: 'warning',
          message: '多个后端直连无法同时生效，请添加「后端组」节点实现负载均衡',
        });
      }
    }

    lines.push(INDENT(base) + '}');
    lines.push('');
  }

  if (isMain) lines.push('}');
  return { config: lines.join('\n'), errors };
}
