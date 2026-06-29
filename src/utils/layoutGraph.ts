import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';

const NODE_W = 180;
const NODE_H = 90;
const V_GAP = 120, V_COMPACT = 60, H_GAP = 40, SIDE_GAP = 30, TOP = 50;

// 侧挂节点：挂在父节点左右同层
const SIDE_TYPES = new Set(['auth', 'cache', 'rate_limit', 'map']);

export function autoLayout(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[],
): Node<NodeData>[] {
  if (nodes.length === 0) return nodes;

  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const n of nodes) { children.set(n.id, []); parents.set(n.id, []); }
  for (const e of edges) {
    children.get(e.source)?.push(e.target);
    parents.get(e.target)?.push(e.source);
  }

  const roots = nodes.filter((n) => (parents.get(n.id)?.length || 0) === 0);
  if (roots.length === 0) return nodes;

  // BFS 分层：侧挂子节点与父节点同层，层级子节点深度+1
  const depth = new Map<string, number>();
  const nodeType = new Map(nodes.map((n) => [n.id, n.type || '']));
  function assignDepth(id: string): number {
    if (depth.has(id)) return depth.get(id)!;
    const p = parents.get(id) || [];
    if (p.length === 0) { depth.set(id, 0); return 0; }
    const isSide = SIDE_TYPES.has(nodeType.get(id) || '');
    const d = isSide ? assignDepth(p[0]) : Math.max(...p.map(assignDepth)) + 1;
    depth.set(id, d);
    return d;
  }
  for (const n of nodes) {
    if (!depth.has(n.id)) assignDepth(n.id);
  }

  // 叶子 backend 沉底（仅经过 upstream 的）
  const maxDepth = Math.max(...depth.values());
  const hasUpstreamAncestor = (id: string): boolean => {
    const pids = parents.get(id) || [];
    if (pids.length === 0) return false;
    return pids.some((pid) => {
      const pn = nodes.find((n) => n.id === pid);
      if (!pn) return false;
      if (pn.type === 'upstream') return true;
      return hasUpstreamAncestor(pid);
    });
  };
  for (const n of nodes) {
    if ((children.get(n.id)?.length || 0) === 0 && n.type === 'backend' && hasUpstreamAncestor(n.id)) {
      depth.set(n.id, maxDepth);
    }
  }

  // 重建层
  const layers = new Map<number, string[]>();
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d)!.push(n.id);
  }

  // 动态层间距
  const layerGap = new Map<number, number>();
  for (let d = 0; d < maxDepth; d++) {
    const parentsAtD = layers.get(d) || [];
    const multiChild = parentsAtD.some((pid) => {
      const ch = (children.get(pid) || []).filter((cid) => !SIDE_TYPES.has(nodeType.get(cid) || ''));
      return ch.length > 1;
    });
    layerGap.set(d, multiChild ? V_GAP : V_COMPACT);
  }

  // 布局
  const pos = new Map<string, { x: number; y: number }>();

  // 根节点
  const rootW = roots.length * NODE_W + (roots.length - 1) * H_GAP;
  let rx = -rootW / 2;
  for (const r of roots) {
    pos.set(r.id, { x: rx, y: depth.get(r.id)! });
    rx += NODE_W + H_GAP;
  }

  // 逐层布局层级子节点（下方）
  for (let d = 0; d < maxDepth; d++) {
    const currentLayer = layers.get(d) || [];
    for (const pid of currentLayer) {
      const ch = (children.get(pid) || []).filter((cid) => !SIDE_TYPES.has(nodeType.get(cid) || ''));
      if (ch.length === 0) continue;
      const pp = pos.get(pid)!;
      const totalW = ch.length * NODE_W + (ch.length - 1) * H_GAP;
      let cx = pp.x + (NODE_W - totalW) / 2;
      for (const cid of ch) {
        const childDepth = depth.get(cid)!;
        const siblings = layers.get(childDepth) || [];
        const existing = siblings
          .filter((sid) => sid !== cid && pos.has(sid))
          .map((sid) => pos.get(sid)!);
        let tx = cx;
        let attempt = 0;
        while (existing.some((e) => Math.abs(tx - e.x) < NODE_W + H_GAP) && attempt < 20) {
          tx += (NODE_W + H_GAP) * (attempt % 2 === 0 ? 1 : -1) * (Math.floor(attempt / 2) + 1);
          attempt++;
        }
        pos.set(cid, { x: tx, y: childDepth });
        cx += NODE_W + H_GAP;
      }
    }

    // 侧挂节点：放在父节点右侧（同层）
    for (const pid of currentLayer) {
      const sideCh = (children.get(pid) || []).filter((cid) => SIDE_TYPES.has(nodeType.get(cid) || ''));
      if (sideCh.length === 0) continue;
      const pp = pos.get(pid)!;
      // 侧挂节点排在父节点右边
      let sx = pp.x + NODE_W + SIDE_GAP;
      for (const cid of sideCh) {
        const childDepth = depth.get(cid)!;
        const siblings = layers.get(childDepth) || [];
        const existing = siblings
          .filter((sid) => sid !== cid && pos.has(sid))
          .map((sid) => pos.get(sid)!);
        let tx = sx;
        let attempt = 0;
        while (existing.some((e) => Math.abs(tx - e.x) < NODE_W + H_GAP) && attempt < 20) {
          tx += (NODE_W + SIDE_GAP) * (attempt % 2 === 0 ? 1 : -1) * (Math.floor(attempt / 2) + 1);
          attempt++;
        }
        pos.set(cid, { x: tx, y: childDepth });
        sx += NODE_W + SIDE_GAP;
      }
    }
  }

  // 计算每层实际 Y
  const layerY = new Map<number, number>();
  layerY.set(0, 0);
  for (let d = 1; d <= maxDepth; d++) {
    layerY.set(d, layerY.get(d - 1)! + NODE_H + (layerGap.get(d - 1) || V_GAP));
  }

  // 全局居中
  let minX = Infinity, maxX = -Infinity;
  for (const p of pos.values()) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x + NODE_W); }
  const center = (minX + maxX) / 2;
  const viewCx = 400;

  return nodes.map((n) => {
    const p = pos.get(n.id);
    if (!p) return n;
    return { ...n, position: { x: p.x - center + viewCx, y: TOP + (layerY.get(p.y) || 0) } };
  });
}
