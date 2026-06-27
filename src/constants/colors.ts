import type { NodeType } from '../types/nodes';

export const NODE_COLORS: Record<NodeType, { bg: string; border: string; badge: string }> = {
  'server':   { bg: 'bg-emerald-50', border: 'border-emerald-400', badge: 'bg-emerald-500' },
  'location': { bg: 'bg-teal-50',    border: 'border-teal-400',    badge: 'bg-teal-500' },
  'upstream': { bg: 'bg-purple-50',  border: 'border-purple-400',  badge: 'bg-purple-500' },
  'backend':  { bg: 'bg-pink-50',    border: 'border-pink-400',    badge: 'bg-pink-500' },
  'redirect': { bg: 'bg-cyan-50',    border: 'border-cyan-400',    badge: 'bg-cyan-500' },
  'static':   { bg: 'bg-amber-50',   border: 'border-amber-400',   badge: 'bg-amber-500' },
};
