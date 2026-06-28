import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';

const NODE_W = 180, NODE_H = 84;
const V_GAP = 140, H_GAP = 40, TOP = 50;

export function autoLayout(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[],
): Node<NodeData>[] {
  if (nodes.length === 0) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map<string, string[]>();
  const parents = new Map<string, string[]>();
  for (const n of nodes) { children.set(n.id, []); parents.set(n.id, []); }
  for (const e of edges) {
    children.get(e.source)?.push(e.target);
    parents.get(e.target)?.push(e.source);
  }

  // 找根
  const roots = nodes.filter((n) => (parents.get(n.id)?.length || 0) === 0);
  if (roots.length === 0) return nodes;

  // BFS 分层 (按最长路径)
  const depth = new Map<string, number>();
  function assignDepth(id: string): number {
    if (depth.has(id)) return depth.get(id)!;
    const p = parents.get(id) || [];
    if (p.length === 0) { depth.set(id, 0); return 0; }
    const d = Math.max(...p.map(assignDepth)) + 1;
    depth.set(id, d);
    return d;
  }
  for (const n of nodes) assignDepth(n.id);

  // 构建层
  const layers = new Map<number, string[]>();
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d)!.push(n.id);
  }

  // 布局：自顶向下，每个父节点把子节点均匀分布在自己下方
  const pos = new Map<string, { x: number; y: number }>();

  // 先布局根节点（均匀水平分布）
  const rootW = roots.length * NODE_W + (roots.length - 1) * H_GAP;
  let rx = -rootW / 2;
  for (const r of roots) {
    pos.set(r.id, { x: rx, y: 0 });
    rx += NODE_W + H_GAP;
  }

  // 逐层布局子节点
  const maxDepth = Math.max(...depth.values());
  for (let d = 0; d < maxDepth; d++) {
    const currentLayer = layers.get(d) || [];
    for (const pid of currentLayer) {
      const ch = children.get(pid) || [];
      if (ch.length === 0) continue;
      const pp = pos.get(pid)!;
      const totalW = ch.length * NODE_W + (ch.length - 1) * H_GAP;
      let cx = pp.x + (NODE_W - totalW) / 2;
      for (const cid of ch) {
        pos.set(cid, { x: cx, y: d + 1 });
        cx += NODE_W + H_GAP;
      }
    }
  }

  // 全局居中
  let minX = Infinity, maxX = -Infinity;
  for (const p of pos.values()) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x + NODE_W); }
  const center = (minX + maxX) / 2;
  const viewCx = 400;

  return nodes.map((n) => {
    const p = pos.get(n.id);
    if (!p) return n;
    return { ...n, position: { x: p.x - center + viewCx, y: TOP + p.y * V_GAP } };
  });
}
