import type { NodeType } from '../types/nodes';

export const NODE_COLORS: Record<NodeType, { bg: string; border: string; badge: string }> = {
  'server':   { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-400 dark:border-emerald-600', badge: 'bg-emerald-500 dark:bg-emerald-600' },
  'location': { bg: 'bg-teal-50 dark:bg-teal-900/30',       border: 'border-teal-400 dark:border-teal-600',       badge: 'bg-teal-500 dark:bg-teal-600' },
  'upstream': { bg: 'bg-purple-50 dark:bg-purple-900/30',   border: 'border-purple-400 dark:border-purple-600',   badge: 'bg-purple-500 dark:bg-purple-600' },
  'backend':  { bg: 'bg-pink-50 dark:bg-pink-900/30',       border: 'border-pink-400 dark:border-pink-600',       badge: 'bg-pink-500 dark:bg-pink-600' },
  'redirect': { bg: 'bg-cyan-50 dark:bg-cyan-900/30',       border: 'border-cyan-400 dark:border-cyan-600',       badge: 'bg-cyan-500 dark:bg-cyan-600' },
  'static':   { bg: 'bg-amber-50 dark:bg-amber-900/30',     border: 'border-amber-400 dark:border-amber-600',     badge: 'bg-amber-500 dark:bg-amber-600' },
};
