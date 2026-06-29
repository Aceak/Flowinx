export const fullStack = {
  name: '前后端分离',
  description: 'HTTPS + API 反代负载均衡 + 静态文件 + 限流',
  nodes: [
    { id: 's1', type: 'server', position: { x: 310, y: 0 }, data: { label: '前后端分离站点', listenAddr: '0.0.0.0', port: 443, ssl: true, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'www.example.com', aliases: 'example.com', root: '/var/www/frontend', index: 'index.html', http2: true, sslProtocols: 'TLSv1.2 TLSv1.3', redirectHttp: true, gzip: true, chunkedTransfer: true } },
    { id: 'l1', type: 'location', position: { x: 90, y: 160 }, data: { label: '前端静态文件', path: '/', mode: 'static', root: '/var/www/frontend', index: 'index.html', tryFiles: '$uri $uri/ /index.html', expires: '7d' } },
    { id: 'l2', type: 'location', position: { x: 530, y: 160 }, data: { label: 'API 接口', path: '/api/', mode: 'proxy', xff: true, chunkedTransfer: true } },
    { id: 'u1', type: 'upstream', position: { x: 480, y: 320 }, data: { label: 'API 后端组', name: 'api_backend', strategy: 'least-conn', keepalive: 64 } },
    { id: 'rl1', type: 'rate_limit', position: { x: 700, y: 320 }, data: { label: 'API 限流', zone: 'api_limit', rate: '30r/s', burst: 50, nodelay: true, zoneSize: '10m' } },
    { id: 'b1', type: 'backend', position: { x: 350, y: 480 }, data: { label: 'API 服务器 1', address: '10.0.1.10:3000', weight: 2, maxFails: 3, failTimeout: 30 } },
    { id: 'b2', type: 'backend', position: { x: 610, y: 480 }, data: { label: 'API 服务器 2', address: '10.0.1.11:3000', weight: 1, maxFails: 3, failTimeout: 30 } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e2', source: 's1', target: 'l2', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 1 } },
    { id: 'e3', source: 'l2', target: 'u1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '负载均衡', order: 0 } },
    { id: 'e4', source: 'u1', target: 'b1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e5', source: 'u1', target: 'b2', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 1 } },
    { id: 'e6', source: 'l2', target: 'rl1', type: 'bezier', sourceHandle: 'right-source', targetHandle: 'left-target', data: { label: '', order: 1 } },
  ],
};
