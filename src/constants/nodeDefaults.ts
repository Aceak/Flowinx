import type { NodeData, NodeType } from '../types/nodes';

export const NODE_DEFAULTS: Record<NodeType, Partial<NodeData>> = {
  'server': {
    label: '我的网站', listenAddr: '', port: 80, ssl: false, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem',
    serverName: 'example.com', aliases: '', hasStatic: true, root: '/var/www/html', index: 'index.html index.htm',
  },
  'location': {
    label: '首页', path: '/', mode: 'static', proxyPass: '', root: '', useIndex: false, index: 'index.html index.htm', xff: true, blockStatus: 403, allow: '', deny: '', extra: '',
  },
  'upstream': {
    label: '后端服务器组', name: 'backend', strategy: 'round-robin', keepalive: 32,
  },
  'backend': {
    label: '后端', address: '127.0.0.1:3000', weight: 1, maxFails: 3, failTimeout: 30, backup: false,
  },
  'redirect': {
    label: 'HTTP 跳转', fromDomain: 'example.com', toUrl: 'https://example.com', permanent: true,
  },
  'static': {
    label: '静态资源', path: '/static', root: '/var/www/html', expires: '30d', autoindex: false,
  },
};
