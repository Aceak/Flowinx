import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import { generateId, generateEdgeId } from './idGenerator';
import { autoLayout } from './layoutGraph';

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
      data: { label: b.args, name: b.args, strategy, keepalive: parseInt(b.directives['keepalive'] || '0') || 0 } as NodeData,
    });
    for (const serverStr of (b.directives['_servers'] || '').split('\n').filter(Boolean)) {
      const beId = generateId();
      rawNodes.push({
        id: beId, type: 'backend', position: { x: 0, y: 0 },
        data: { label: serverStr.split(' ')[0], address: serverStr } as NodeData,
      });
      edges.push({ id: generateEdgeId(), source: id, target: beId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
    }
  }

  // servers
  for (const b of blocks) {
    if (b.name !== 'server') continue;
    const sId = generateId();
    const ssl = !!b.directives['ssl_certificate'] || (b.directives['listen'] || '').includes('ssl');
    const serverName = b.directives['server_name'] || 'localhost';
    rawNodes.push({
      id: sId, type: 'server', position: { x: 0, y: 0 },
      data: {
        label: serverName, serverName,
        listenAddr: '', port: parseInt((b.directives['listen'] || '80').replace(/\D/g, '') || '80') || 80,
        ssl, sslCert: b.directives['ssl_certificate'] || '', sslKey: b.directives['ssl_certificate_key'] || '',
        aliases: '', hasStatic: true, root: b.directives['root'] || '', index: b.directives['index'] || '',
      } as NodeData,
    });

    // locations
    for (const loc of b.blocks) {
      if (loc.name !== 'location') continue;
      const lId = generateId();
      const hasReturn = !!loc.directives['return'];
      const hasProxy = !!loc.directives['proxy_pass'];
      const mode = hasReturn ? 'block' : hasProxy ? 'proxy' : 'static';
      const locPath = loc.args;
      const locLabel = locPath === '/' ? '首页' : locPath;
      rawNodes.push({
        id: lId, type: 'location', position: { x: 0, y: 0 },
        data: {
          label: locLabel, path: locPath, mode,
          proxyPass: loc.directives['proxy_pass'] || '',
          root: loc.directives['root'] || '', useIndex: false,
          index: loc.directives['index'] || '', xff: !!loc.directives['proxy_set_header'],
          blockStatus: parseInt((loc.directives['return'] || '403').split(' ')[0]) || 403,
          allow: '', deny: '', extra: '',
        } as NodeData,
      });
      edges.push({ id: generateEdgeId(), source: sId, target: lId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });

      // proxy target
      const proxyPass = loc.directives['proxy_pass'];
      if (proxyPass && proxyPass.startsWith('http://')) {
        const target = proxyPass.replace('http://', '').trim();
        const upstream = rawNodes.find((n) => n.type === 'upstream' && (n.data as { name: string }).name === target);
        if (upstream) {
          edges.push({ id: generateEdgeId(), source: lId, target: upstream.id, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
        } else if (target.includes(':')) {
          const beId = generateId();
          rawNodes.push({ id: beId, type: 'backend', position: { x: 0, y: 0 }, data: { label: target, address: target } as NodeData });
          edges.push({ id: generateEdgeId(), source: lId, target: beId, type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } });
        }
      }
    }
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
      const quote = ch; i++;
      while (i < src.length && src[i] !== quote) token += src[i++];
      i++;
    } else {
      while (i < src.length && !/[\s{};]/.test(src[i]) && src[i] !== '#') token += src[i++];
    }
    if (token) tokens.push(token);
  }
  return tokens;
}

function parseBlock(tokens: string[], start: number, context: string): { block: NginxBlock; next: number } | null {
  let i = start;
  while (i < tokens.length && tokens[i] === '}' ) i++;
  if (i >= tokens.length || tokens[i] === '}') return null;

  const name = tokens[i++];
  let args = '';
  while (i < tokens.length && tokens[i] !== '{') args += (args ? ' ' : '') + tokens[i++];
  if (i >= tokens.length) return null;
  i++; // skip '{'

  const directives: Record<string, string> = {};
  const blocks: NginxBlock[] = [];

  while (i < tokens.length && tokens[i] !== '}') {
    if (tokens[i] === ';') { i++; continue; }
    if (tokens[i + 1] === '{' || (tokens[i + 2] === '{' && tokens[i + 1] !== ';')) {
      const result = parseBlock(tokens, i, name);
      if (result) { blocks.push(result.block); i = result.next; }
      else i++;
    } else {
      const dirName = tokens[i++];
      let value = '';
      while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '{' && tokens[i] !== '}') value += (value ? ' ' : '') + tokens[i++];
      if (tokens[i] === ';') i++;
      // special: collect servers in upstream
      if (name === 'upstream' && dirName === 'server') {
        directives['_servers'] = (directives['_servers'] || '') + value + '\n';
      } else {
        directives[dirName] = value;
      }
    }
  }
  if (i < tokens.length && tokens[i] === '}') i++;

  return { block: { name, args, directives, blocks }, next: i };
}
