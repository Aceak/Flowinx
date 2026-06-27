import type { NodeType } from './nodes';

const ALL: NodeType[] = ['server', 'location', 'upstream', 'backend', 'redirect', 'static'];

export const VALID_CONNECTIONS: Record<NodeType, NodeType[]> = {
  'server':   ALL,
  'location': ALL,
  'upstream': ALL,
  'backend':  ALL,
  'redirect': ALL,
  'static':   ALL,
};

export interface GraphEdgeData {
  [key: string]: unknown;
  label: string;
  order: number;
}
