import type { NodeType } from '../types/nodes';

export const NODE_LABELS: Record<NodeType, string> = {
  'server':   '网站',
  'location': '路径规则',
  'upstream': '后端组',
  'backend':  '后端服务器',
  'redirect': '重定向',
  'static':   '静态资源',
};

export const NODE_CATEGORIES = [
  {
    key: 'main',
    label: '主要',
    types: ['server', 'location'] as NodeType[],
  },
  {
    key: 'proxy',
    label: '反向代理',
    types: ['upstream', 'backend'] as NodeType[],
  },
  {
    key: 'extra',
    label: '其他功能',
    types: ['redirect', 'static'] as NodeType[],
  },
];
