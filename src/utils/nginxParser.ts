import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import { generateId, generateEdgeId } from './idGenerator';
import { autoLayout } from './layoutGraph';
import { NODE_LABELS } from '../constants/labels';

interface NginxBlock {
  name: string;
  args: string;
  directives: Record<string, string>;
  blocks: NginxBlock[];
}

/** 从文本解析 nginx 配置为块结构 */
export function parseNginxConfig(config: string): NginxBlock[] {
  const tokens = tokenize(config);
  const blocks: NginxBlock[] = [];
  let i = 0;
  while (i < tokens.length) {
    const result = parseBlock(tokens, i, '');
    if (result) { blocks.push(result.block); i = result.next; }
    else i++;
  }
  return blocks;
}

/** 配置解析为 ReactFlow 节点+边（含自动布局） */
export function configToGraph(config: string): { nodes: Node<NodeData>[]; edges: Edge<GraphEdgeData>[] } {
  const blocks = parseNginxConfig(config);
  const rawNodes: Node<NodeData>[] = [];
  const edges: Edge<GraphEdgeData>[] = [];

  // upstreams
  for (const b of blocks) {
    if (b.name !== 'upstream') continue;
    const id = generateId();
    const strategy = b.directives['least_conn'] ? 'least-conn'
      : b.directives['ip_hash'] ? 'ip-hash' : 'round-robin';
    rawNodes.push({
      id, type: 'upstream', position: { x: 0, y: 0 },
      data: { label: NODE_LABELS['upstream'], name: b.args, strategy, keepalive: parseInt(b.directives['keepalive'] || '0', 10) || 0 } as NodeData,
    });
    for (const serverStr of (b.directives['_servers'] || '').split('\n').filter(Boolean)) {
      const beId = generateId();
      const parts = serverStr.split(/\s+/);
      const addr = parts[0];
      const params: Record<string, string> = {};
      for (const p of parts.slice(1)) {
        const [k, v] = p.split('=');
        if (k && v) params[k] = v;
      }
      rawNodes.push({
        id: beId, type: 'backend', position: { x: 0, y: 0 },
        data: {
          label: NODE_LABELS['backend'], address: addr,
          weight: parseInt(params['weight'] || '1', 10),
          maxFails: parseInt(params['max_fails'] || '0', 10),
          failTimeout: parseInt((params['fail_timeout'] || '30s').replace('s', ''), 10) || 30,
          backup: !!params['backup'],
        } as NodeData,
      });
      edges.push({ id: generateEdgeId(), source: id, target: beId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
    }
  }

  // 检测 80→443 重定向 server 块
  const redirectMap = new Map<string, string[]>(); // server_name → https server id 列表
  const redirectServers: typeof blocks = [];

  for (const b of blocks) {
    if (b.name !== 'server') continue;
    const hasReturn = !!b.directives['return'];
    const returnVal = b.directives['return'] || '';
    const returnMatch = returnVal.match(/^30[1278]\s+https?:\/\//);
    const listenLine = b.directives['listen'] || '';
    const isRedirectServer = hasReturn && returnMatch && !b.directives['ssl_certificate'] && !listenLine.includes('ssl') && (b.blocks || []).every((lb) => lb.name !== 'location');

    if (isRedirectServer) {
      redirectServers.push(b);
      continue; // 不创建独立节点，后续合并到 HTTPS server
    }

    // 非重定向 server 正常处理
    const sId = generateId();
    const serverName = b.directives['server_name'] || 'localhost';
    const listenVals = (b.directives['listen'] || '').split('\n').filter(Boolean);
    const ipv4Listen = listenVals.find((v: string) => !v.includes('[')) || '';
    // 匹配 IP:port、hostname:port、或纯端口
    const ipv4Match = ipv4Listen.match(/^([\d.]+):(\d+)/)
      || ipv4Listen.match(/^([^\s:]+):(\d+)/)
      || ipv4Listen.match(/^(\d+)/);
    const listenAddr = ipv4Match?.[1] && !/^\d+$/.test(ipv4Match[1]) ? ipv4Match[1] : '';
    const port = ipv4Match ? parseInt(ipv4Match[2] || ipv4Match[1], 10) : 80;
    const ssl = !!b.directives['ssl_certificate'] || ipv4Listen.includes('ssl');
    const ipv6Listen = listenVals.find((v: string) => v.includes('[')) || '';
    const ipv6Match = ipv6Listen.match(/\[([^\]]+)\]:(\d+)/);
    const ipv6Addr = ipv6Match?.[1] || '';
    const ipv6Port = ipv6Match ? parseInt(ipv6Match[2], 10) : 80;
    const mapped = new Set(['listen','server_name','ssl_certificate','ssl_certificate_key','root','index',
      'http2','ssl_protocols','ssl_stapling','ssl_stapling_verify','ssl_trusted_certificate',
      'add_header','client_max_body_size','access_log','error_log','chunked_transfer_encoding']);
    const extraLines: string[] = [];
    for (const [k, v] of Object.entries(b.directives)) {
      if (mapped.has(k)) continue;
      if (v) extraLines.push(`${k} ${v};`);
    }
    const serverNode: any = {
      id: sId, type: 'server', position: { x: 0, y: 0 },
      data: {
        label: NODE_LABELS['server'], serverName, listenAddr, port,
        ssl, sslCert: b.directives['ssl_certificate'] || '', sslKey: b.directives['ssl_certificate_key'] || '',
        aliases: '', root: b.directives['root'] || '', index: b.directives['index'] || '',
        http2: b.directives['http2'] === 'on',
        sslProtocols: b.directives['ssl_protocols'] || 'TLSv1.2 TLSv1.3',
        sslStapling: b.directives['ssl_stapling'] === 'on',
        sslStaplingVerify: b.directives['ssl_stapling_verify'] === 'on',
        sslTrustedCert: b.directives['ssl_trusted_certificate'] || '',
        addHeaders: b.directives['add_header'] || '',
        clientMaxBodySize: b.directives['client_max_body_size'] || '',
        accessLog: b.directives['access_log'] || '',
        errorLog: b.directives['error_log'] || '',
        listenIPv6: ipv6Addr, ipv6Port,
        chunkedTransfer: b.directives['chunked_transfer_encoding'] !== 'off',
        redirectHttp: false,
        gzip: false, gzipTypes: '', gzipMinLength: '',
      },
    };
    // 记录 server_name → serverNode，用于后续合并重定向
    const existing = redirectMap.get(serverName) || [];
    existing.push(sId);
    redirectMap.set(serverName, existing);
    rawNodes.push(serverNode);

    for (const loc of b.blocks) {
      if (loc.name !== 'location') continue;
      const lId = generateId();
      const hasReturn = !!loc.directives['return'];
      const hasProxy = !!loc.directives['proxy_pass'] || !!loc.directives['fastcgi_pass'];
      const returnVal = loc.directives['return'] || '';
      const returnParts = returnVal.split(/\s+/);
      const returnCode = parseInt(returnParts[0], 10);
      const isRedirect = hasReturn && (
        returnParts[0].startsWith('http') ||
        [301, 302, 303, 307, 308].includes(returnCode)
      );
      const mode = isRedirect ? 'redirect' : hasReturn ? 'block' : hasProxy ? 'proxy' : 'static';
      // location 修饰符：= ^~ ~ ~* !~ !~*
      const locArgs = loc.args;
      const modifierMatch = locArgs.match(/^(=|~|\^~|~\*|!~|!~\*)\s+/);
      const locPath = modifierMatch ? locArgs : locArgs;
      const locNode = {
        id: lId, type: 'location', position: { x: 0, y: 0 },
        data: {
          label: NODE_LABELS['location'], path: locPath, mode,
          proxyPass: loc.directives['proxy_pass'] || '',
          fastcgiPass: loc.directives['fastcgi_pass'] || '',
          xff: !!loc.directives['proxy_set_header'],
          blockStatus: returnCode && !isRedirect ? returnCode : (parseInt((returnVal || '403').split(' ')[0], 10) || 403),
          redirectUrl: isRedirect ? (returnParts[0].startsWith('http') ? returnVal : returnParts.slice(1).join(' ')) : '',
          redirectPermanent: isRedirect ? [301, 308].includes(returnCode) || returnParts[0].startsWith('http') : true,
          allow: loc.directives['allow'] || '', deny: loc.directives['deny'] || '', includes: loc.directives['include'] || '',
          fastcgiIndex: loc.directives['fastcgi_index'] || '',
          fastcgiParams: loc.directives['fastcgi_param'] || '',
          chunkedTransfer: loc.directives['chunked_transfer_encoding'] !== 'off', extra: '',
        } as NodeData,
      };
      rawNodes.push(locNode);
      edges.push({ id: generateEdgeId(), source: sId, target: lId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });

      // auth 指令 → 创建认证节点
      if (loc.directives['auth_basic'] || loc.directives['auth_request'] || loc.directives['auth_jwt']) {
        const authId = generateId();
        const authType = loc.directives['auth_request'] ? 'request' : loc.directives['auth_jwt'] ? 'jwt' : 'basic';
        rawNodes.push({
          id: authId, type: 'auth', position: { x: 0, y: 0 },
          data: {
            label: NODE_LABELS['auth'], authType,
            realm: (loc.directives['auth_basic'] || 'Restricted Access').replace(/"/g, ''),
            userFile: loc.directives['auth_basic_user_file'] || '/etc/nginx/.htpasswd',
            authUrl: loc.directives['auth_request'] || '/auth',
            jwtKey: loc.directives['auth_jwt_key'] || loc.directives['auth_jwt_key_file'] || '',
            jwtClaim: loc.directives['auth_jwt_claim'] || 'sub',
            jwtKeyFile: !!loc.directives['auth_jwt_key_file'],
          } as NodeData,
        });
        edges.push({ id: generateEdgeId(), source: lId, target: authId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
      }

      // proxy_cache → 创建关联的 cache 子节点
      if (loc.directives['proxy_cache']) {
        const cacheId = generateId();
        const zone = loc.directives['proxy_cache'];
        rawNodes.push({
          id: cacheId, type: 'cache', position: { x: 0, y: 0 },
          data: {
            label: NODE_LABELS['cache'], zone,
            time: (loc.directives['proxy_cache_valid'] || '1h'),
            maxSize: loc.directives['proxy_cache_path']?.match(/max_size=(\S+)/)?.[1] || '100m',
            zoneSize: '10m',
            keys: loc.directives['proxy_cache_key'] || '$scheme$proxy_host$request_uri',
            useStale: !!loc.directives['proxy_cache_use_stale'],
          } as NodeData,
        });
        edges.push({ id: generateEdgeId(), source: lId, target: cacheId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
      }

      // 静态 location → 静态配置直接存入 location 节点
      if (mode === 'static') {
        (locNode.data as any).root = loc.directives['root'] || '';
        (locNode.data as any).index = loc.directives['index'] || '';
        (locNode.data as any).tryFiles = loc.directives['try_files'] || '';
        (locNode.data as any).expires = loc.directives['expires'] || '';
        (locNode.data as any).autoindex = false;
        (locNode.data as any).cacheControl = '';
      }

      // proxy / fastcgi target
      const proxyPass = loc.directives['proxy_pass'] || loc.directives['fastcgi_pass'];
      if (proxyPass) {
        const target = proxyPass.replace(/^https?:\/\//, '').trim();
        if (!target) continue;
        const upstream = rawNodes.find((n) => n.type === 'upstream' && (n.data as { name: string }).name === target);
        if (upstream) {
          edges.push({ id: generateEdgeId(), source: lId, target: upstream.id, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
        } else if (target.includes(':') || target.includes('.')) {
          // IP:port or hostname → backend
          const beId = generateId();
          rawNodes.push({ id: beId, type: 'backend', position: { x: 0, y: 0 }, data: { label: NODE_LABELS['backend'], address: target } as NodeData });
          edges.push({ id: generateEdgeId(), source: lId, target: beId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
        } else {
          // probably upstream name like php-fpm — create upstream node
          const upId = generateId();
          rawNodes.push({ id: upId, type: 'upstream', position: { x: 0, y: 0 }, data: { label: NODE_LABELS['upstream'], name: target, strategy: 'round-robin', keepalive: 0 } as NodeData });
          edges.push({ id: generateEdgeId(), source: lId, target: upId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
        }
      }
    }
  }

  // 合并 80→443 重定向 server 到对应的 HTTPS server
  for (const rb of redirectServers) {
    const svName = rb.directives['server_name'] || 'localhost';
    const targetIds = redirectMap.get(svName);
    let merged = false;
    if (targetIds) {
      for (const targetId of targetIds) {
        const targetNode = rawNodes.find((n) => n.id === targetId);
        if (targetNode && (targetNode.data as any).ssl) {
          (targetNode.data as any).redirectHttp = true;
          merged = true;
          break;
        }
      }
    }
    if (merged) continue;
    // 找不到匹配的 HTTPS server，作为独立 server 保留
    const sId = generateId();
    rawNodes.push({
      id: sId, type: 'server', position: { x: 0, y: 0 },
      data: {
        label: NODE_LABELS['server'], serverName: svName, listenAddr: '', port: 80,
        ssl: false, sslCert: '', sslKey: '', aliases: '', root: '', index: '',
        http2: false, sslProtocols: 'TLSv1.2 TLSv1.3', sslStapling: false, sslStaplingVerify: false,
        sslTrustedCert: '', addHeaders: '', clientMaxBodySize: '', accessLog: '', errorLog: '',
        listenIPv6: '', ipv6Port: 80, chunkedTransfer: true, redirectHttp: false, gzip: false,
        gzipTypes: '', gzipMinLength: '', extra: '',
      },
    });
  }

  // 自动布局
  const nodes = autoLayout(rawNodes, edges);
  return { nodes, edges };
}

/* ---- 内部解析 ---- */

function tokenize(src: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === '#') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '{' || ch === '}' || ch === ';') { tokens.push(ch); i++; continue; }
    let token = '';
    if (ch === '"' || ch === "'") {
      const quote = ch;
      token = quote; i++;
      while (i < src.length && src[i] !== quote) token += src[i++];
      token += quote; i++;
    } else if (ch === '~') {
      // regex location modifier: ~ or ~*
      token = ch; i++;
      if (i < src.length && src[i] === '*') { token += '*'; i++; }
    } else {
      // 允许 $ [ ] . - _ / ? = & + 等 nginx 常用字符
      while (i < src.length && !/[\s{};]/.test(src[i]) && src[i] !== '#') token += src[i++];
    }
    if (token) tokens.push(token);
  }
  return tokens;
}

function parseBlock(tokens: string[], start: number, _context: string): { block: NginxBlock; next: number } | null {
  let i = start;
  while (i < tokens.length && tokens[i] === '}' ) i++;
  if (i >= tokens.length || tokens[i] === '}') return null;

  const name = tokens[i++];
  let args = '';
  // 收集 args，跳过 location 的正则修饰符 (~ / ~*) 和正则模式
  while (i < tokens.length && tokens[i] !== '{') args += (args ? ' ' : '') + tokens[i++];
  if (i >= tokens.length || tokens[i] !== '{') return null;
  i++; // skip '{'

  const directives: Record<string, string> = {};
  const blocks: NginxBlock[] = [];

  while (i < tokens.length && tokens[i] !== '}') {
    if (tokens[i] === ';') { i++; continue; }
    // 向前扫描：是否有 { 在 ; 或 } 之前出现（处理 location ~ pattern { 等）
    let isBlock = false;
    for (let j = i; j < tokens.length && tokens[j] !== ';' && tokens[j] !== '}'; j++) {
      if (tokens[j] === '{') { isBlock = true; break; }
    }
    if (isBlock) {
      const result = parseBlock(tokens, i, name);
      if (result) { blocks.push(result.block); i = result.next; }
      else i++;
    } else {
      const dirName = tokens[i++];
      let value = '';
      while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '{' && tokens[i] !== '}') value += (value ? ' ' : '') + tokens[i++];
      if (tokens[i] === ';') i++;
      // 同名指令叠加（如多个 listen, add_header）
      if (name === 'upstream' && dirName === 'server') {
        directives['_servers'] = (directives['_servers'] || '') + value + '\n';
      } else if (directives[dirName]) {
        directives[dirName] += '\n' + value;
      } else {
        directives[dirName] = value;
      }
    }
  }
  if (i < tokens.length && tokens[i] === '}') i++;

  return { block: { name, args, directives, blocks }, next: i };
}
