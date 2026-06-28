export const sslTermination = {
  name: 'HTTPS 网站',
  description: '启用 HTTPS + 反向代理',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: 'secure.example.com', listenAddr: '', port: 443, ssl: true, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'secure.example.com', aliases: '', hasStatic: false, root: '', index: '' } },
    { id: 'l1', type: 'location', position: { x: 250, y: 260 }, data: { label: '/', path: '/', mode: 'proxy', proxyPass: 'http://127.0.0.1:8080', root: '', useIndex: false, index: 'index.html index.htm', xff: true, blockStatus: 403, allow: '', deny: '', extra: '' } },
    { id: 'b1', type: 'backend', position: { x: 250, y: 420 }, data: { label: '127.0.0.1:8080', address: '127.0.0.1:8080', weight: 1, maxFails: 0, failTimeout: 30, backup: false } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e2', source: 'l1', target: 'b1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
  ],
};
