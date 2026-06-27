import type { Node, Edge } from '@xyflow/react';
import type { NodeData, ServerData, LocationData, UpstreamData, BackendData, RedirectData, StaticData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import type { ConfigError } from '../types/store';
import { getChildNodes } from './graphTraversal';

export function generateConfig(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[]
): { config: string; errors: ConfigError[] } {
  const errors: ConfigError[] = [];
  if (nodes.length === 0) {
    return { config: '', errors: [{ nodeId: 'graph', severity: 'error', message: '画布为空' }] };
  }

  const lines: string[] = [];
  lines.push('# Nginx 配置 — 由 Nginx 配置生成器生成');
  lines.push('');
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
  lines.push('');

  const upstreams = nodes.filter((n) => n.type === 'upstream');
  const servers = nodes.filter((n) => n.type === 'server') as Node<ServerData>[];

  // upstream
  for (const us of upstreams) {
    const d = us.data as UpstreamData;
    const backends = getChildNodes(nodes, edges, us.id).filter((n) => n.type === 'backend') as Node<BackendData>[];
    lines.push(`    upstream ${d.name} {`);
    if (d.strategy === 'least-conn') lines.push('        least_conn;');
    if (d.strategy === 'ip-hash') lines.push('        ip_hash;');
    if (d.keepalive > 0) lines.push(`        keepalive ${d.keepalive};`);
    for (const be of backends) {
      const b = be.data as BackendData;
      const p = [`server ${b.address}`];
      if (b.weight > 1) p.push(`weight=${b.weight}`);
      if (b.maxFails > 0) p.push(`max_fails=${b.maxFails}`);
      if (b.failTimeout > 0) p.push(`fail_timeout=${b.failTimeout}s`);
      if (b.backup) p.push('backup');
      lines.push(`        ${p.join(' ')};`);
    }
    lines.push('    }');
    lines.push('');
  }

  // server blocks
  for (const server of servers) {
    const s = server.data as ServerData;
    const children = getChildNodes(nodes, edges, server.id);

    // redirects → separate HTTP server
    const redirects = children.filter((n) => n.type === 'redirect') as Node<RedirectData>[];
    for (const rd of redirects) {
      const r = rd.data as RedirectData;
      lines.push('    server {');
      lines.push('        listen 80;');
      lines.push(`        server_name ${r.fromDomain};`);
      const suffix = r.toUrl.endsWith('/') || r.toUrl.includes('?') ? '' : '$request_uri';
      lines.push(`        return ${r.permanent ? 301 : 302} ${r.toUrl}${suffix};`);
      lines.push('    }');
      lines.push('');
    }

    // main server
    const addr = s.listenAddr ? `${s.listenAddr}:` : '';
    lines.push('    server {');
    lines.push(`        listen ${addr}${s.port}${s.ssl ? ' ssl' : ''};`);
    lines.push(`        server_name ${s.serverName}${s.aliases ? ' ' + s.aliases : ''};`);

    if (s.ssl) {
      if (s.sslCert) lines.push(`        ssl_certificate ${s.sslCert};`);
      if (s.sslKey) lines.push(`        ssl_certificate_key ${s.sslKey};`);
      lines.push('        ssl_protocols TLSv1.2 TLSv1.3;');
    }
    if (s.hasStatic !== false) {
      if (s.root) lines.push(`        root ${s.root};`);
      if (s.index) lines.push(`        index ${s.index};`);
    }

    // locations
    const locations = children.filter((n) => n.type === 'location') as Node<LocationData>[];
    for (const loc of locations) {
      const l = loc.data as LocationData;
      const mode = l.mode || 'static';

      lines.push('');
      const locPath = l.path || '/';
      lines.push(`        location ${locPath} {`);

      if (mode === 'block') {
        lines.push(`            return ${l.blockStatus || 403};`);
      } else if (mode === 'proxy') {
        const usChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'upstream');
        const beChild = getChildNodes(nodes, edges, loc.id).find((n) => n.type === 'backend');
        if (usChild) {
          lines.push(`            proxy_pass http://${(usChild.data as UpstreamData).name};`);
        } else if (beChild) {
          lines.push(`            proxy_pass http://${(beChild.data as BackendData).address};`);
        } else if (l.proxyPass) {
          lines.push(`            proxy_pass ${l.proxyPass};`);
        }
        if (l.xff) {
          lines.push('            proxy_set_header Host $host;');
          lines.push('            proxy_set_header X-Real-IP $remote_addr;');
          lines.push('            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
          lines.push('            proxy_set_header X-Forwarded-Proto $scheme;');
        }
      } else {
        if (l.root) lines.push(`            root ${l.root};`);
        if (l.useIndex && l.index) lines.push(`            index ${l.index};`);
      }

      for (const ip of (l.allow || '').split('\n').filter(Boolean)) lines.push(`            allow ${ip.trim()};`);
      for (const ip of (l.deny || '').split('\n').filter(Boolean)) lines.push(`            deny ${ip.trim()};`);
      for (const line of (l.extra || '').split('\n').filter(Boolean)) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        lines.push(`            ${t.endsWith(';') || t.endsWith('}') ? t : t + ';'}`);
      }
      lines.push('        }');
    }

    // statics
    const statics = children.filter((n) => n.type === 'static') as Node<StaticData>[];
    for (const st of statics) {
      const d = st.data as StaticData;
      lines.push('');
      lines.push(`        location ${d.path || '/static'} {`);
      if (d.root) lines.push(`            root ${d.root};`);
      if (d.expires) lines.push(`            expires ${d.expires};`);
      if (d.autoindex) lines.push('            autoindex on;');
      lines.push('        }');
    }

    // direct backends — only generate one location /, use upstream if multiple
    const directBEs = children.filter((n) => n.type === 'backend') as Node<BackendData>[];
    if (directBEs.length > 0 && locations.length === 0) {
      if (directBEs.length === 1) {
        const b = directBEs[0].data as BackendData;
        lines.push('');
        lines.push('        location / {');
        lines.push(`            proxy_pass http://${b.address};`);
        lines.push('            proxy_set_header Host $host;');
        lines.push('            proxy_set_header X-Real-IP $remote_addr;');
        lines.push('            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;');
        lines.push('            proxy_set_header X-Forwarded-Proto $scheme;');
        lines.push('        }');
      }
    }

    lines.push('    }');
    lines.push('');
  }

  lines.push('}');
  return { config: lines.join('\n'), errors };
}
