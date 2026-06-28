import type { NodeType } from '../types/nodes';

export const NODE_LABELS: Record<NodeType, string> = {
  'server':   '网站',
  'location': '路径规则',
  'upstream': '后端组',
  'backend':  '后端服务器',
  'static':   '静态资源',
  'cache':      '缓存规则',
  'auth':       '认证',
  'rate_limit': '限流',
  'map':        '映射',
};

export const NODE_CATEGORIES = [
  {
    key: 'entry',
    label: '流量入口',
    types: ['server'] as NodeType[],
  },
  {
    key: 'routing',
    label: '路由转发',
    types: ['location', 'map'] as NodeType[],
  },
  {
    key: 'backend',
    label: '后端服务',
    types: ['upstream', 'backend'] as NodeType[],
  },
  {
    key: 'content',
    label: '内容处理',
    types: ['static', 'cache'] as NodeType[],
  },
  {
    key: 'security',
    label: '安全控制',
    types: ['auth', 'rate_limit'] as NodeType[],
  },
];
