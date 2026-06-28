import type { NodeType } from './nodes';

export const VALID_CONNECTIONS: Record<NodeType, NodeType[]> = {
  'server':     ['location', 'map'],
  'location':   ['upstream', 'backend', 'static', 'cache', 'auth', 'rate_limit'],
  'upstream':   ['backend'],
  'backend':    [],
  'static':     [],
  'cache':      [],
  'auth':       [],
  'rate_limit': [],
  'map':        [],
};

export interface GraphEdgeData {
  [key: string]: unknown;
  label: string;
  order: number;
}
