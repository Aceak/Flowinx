import type { NodeType } from '../types/nodes';

export const NODE_COLORS: Record<NodeType, { bg: string; border: string; badge: string }> = {
  // 流量入口（网站）→ 蓝色，信任/入口感
  'server':     { bg: 'bg-blue-50 dark:bg-blue-900/30',         border: 'border-blue-400 dark:border-blue-600',         badge: 'bg-blue-500 dark:bg-blue-600' },
  // 路由转发（路径规则）→ 青色，决策/分流
  'location':   { bg: 'bg-teal-50 dark:bg-teal-900/30',         border: 'border-teal-400 dark:border-teal-600',         badge: 'bg-teal-500 dark:bg-teal-600' },
  // 后端组 → 紫色，编排/调度
  'upstream':   { bg: 'bg-purple-50 dark:bg-purple-900/30',     border: 'border-purple-400 dark:border-purple-600',     badge: 'bg-purple-500 dark:bg-purple-600' },
  // 后端服务器 → 绿色，服务/健康
  'backend':    { bg: 'bg-emerald-50 dark:bg-emerald-900/30',   border: 'border-emerald-400 dark:border-emerald-600',   badge: 'bg-emerald-500 dark:bg-emerald-600' },
  // 静态资源 → 琥珀色，文件/内容
  'static':     { bg: 'bg-amber-50 dark:bg-amber-900/30',       border: 'border-amber-400 dark:border-amber-600',       badge: 'bg-amber-500 dark:bg-amber-600' },
  // 缓存 → 橙色，速度/热度
  'cache':      { bg: 'bg-orange-50 dark:bg-orange-900/30',     border: 'border-orange-400 dark:border-orange-600',     badge: 'bg-orange-500 dark:bg-orange-600' },
  // 认证 → 红色，安全/锁
  'auth':       { bg: 'bg-red-50 dark:bg-red-900/30',           border: 'border-red-400 dark:border-red-600',           badge: 'bg-red-500 dark:bg-red-600' },
  // 限流 → 玫红，警告/限制
  'rate_limit': { bg: 'bg-rose-50 dark:bg-rose-900/30',         border: 'border-rose-400 dark:border-rose-600',         badge: 'bg-rose-500 dark:bg-rose-600' },
  // 映射 → 灰色，转换/工具
  'map':        { bg: 'bg-gray-50 dark:bg-gray-700/30',         border: 'border-gray-400 dark:border-gray-600',         badge: 'bg-gray-500 dark:bg-gray-600' },
};
