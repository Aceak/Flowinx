import type { Node, Edge } from '@xyflow/react';
import type { NodeData } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';

export function getChildNodes(
  nodes: Node<NodeData>[],
  edges: Edge<GraphEdgeData>[],
  parentId: string
): Node<NodeData>[] {
  const childIds = edges.filter((e) => e.source === parentId).map((e) => e.target);
  return nodes.filter((n) => childIds.includes(n.id));
}

export function collectUpstreamGroups(
  nodes: Node<NodeData>[],
  _edges: Edge<GraphEdgeData>[]
): Node<NodeData>[] {
  return nodes.filter((n) => n.type === 'upstream');
}
