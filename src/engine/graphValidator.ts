import type { Node, Edge } from '@xyflow/react';
import type { NodeData, NodeType } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import { VALID_CONNECTIONS } from '../types/edges';
import type { ConfigError } from '../types/store';
import { getChildNodes } from './graphTraversal';

export function validateGraph(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[]
): ConfigError[] {
  const errors: ConfigError[] = [];

  // 检查连接合法性
  for (const edge of edges) {
    const src = nodes.find((n) => n.id === edge.source);
    const tgt = nodes.find((n) => n.id === edge.target);
    if (!src || !tgt) continue;
    const valid = VALID_CONNECTIONS[src.type as NodeType] ?? [];
    if (!valid.includes(tgt.type as NodeType)) {
      errors.push({
        nodeId: edge.id,
        severity: 'error',
        message: `不能从「${src.type}」连接到「${tgt.type}」`,
      });
    }
  }

  // upstream 必须有 backend
  for (const n of nodes) {
    if (n.type === 'upstream') {
      const children = getChildNodes(nodes, edges, n.id);
      if (!children.some((c) => c.type === 'backend')) {
        errors.push({
          nodeId: n.id,
          severity: 'error',
          message: '后端组需要至少一个后端服务器',
        });
      }
    }
  }

  // 重复 upstream 名称
  const names: Record<string, string[]> = {};
  for (const n of nodes) {
    if (n.type !== 'upstream') continue;
    const name = (n.data as { name: string }).name || '';
    if (!names[name]) names[name] = [];
    names[name].push(n.id);
  }
  for (const [name, ids] of Object.entries(names)) {
    if (ids.length > 1) {
      errors.push({
        nodeId: ids[0],
        severity: 'error',
        message: `后端组名称「${name}」重复了`,
      });
    }
  }

  return errors;
}
