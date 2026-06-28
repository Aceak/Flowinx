export const simpleProxy = {
  name: '反向代理',
  description: '一个网站，反向代理到后端服务',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: 'example.com', listenAddr: '', port: 80, ssl: false, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'example.com', aliases: '', hasStatic: true, root: '/var/www/html', index: 'index.html index.htm' } },
    { id: 'l1', type: 'location', position: { x: 100, y: 220 }, data: { label: '/api', path: '/api', mode: 'proxy', proxyPass: 'http://127.0.0.1:3000', root: '', useIndex: false, index: 'index.html index.htm', xff: true, blockStatus: 403, allow: '', deny: '', extra: '' } },
    { id: 'b1', type: 'backend', position: { x: 100, y: 380 }, data: { label: '127.0.0.1:3000', address: '127.0.0.1:3000', weight: 1, maxFails: 0, failTimeout: 30, backup: false } },
    { id: 'l2', type: 'location', position: { x: 370, y: 220 }, data: { label: '/', path: '/', mode: 'static', proxyPass: '', root: '', useIndex: false, index: 'index.html index.htm', xff: false, blockStatus: 403, allow: '', deny: '', extra: '' } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e2', source: 'l1', target: 'b1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e3', source: 's1', target: 'l2', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
  ],
};
