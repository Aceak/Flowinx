export const simpleProxy = {
  name: '反向代理',
  description: '一个网站，反向代理到后端服务',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: '我的网站', listenAddr: '', port: 80, ssl: false, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'example.com', aliases: '', hasStatic: true, root: '/var/www/html', index: 'index.html index.htm' } },
    { id: 'l1', type: 'location', position: { x: 250, y: 220 }, data: { label: 'API 接口', path: '/api', mode: 'proxy', proxyPass: 'http://127.0.0.1:3000', root: '', useIndex: false, index: 'index.html index.htm', xff: true, blockStatus: 403, allow: '', deny: '', extra: '' } },
    { id: 'l2', type: 'location', position: { x: 250, y: 380 }, data: { label: '静态首页', path: '/', mode: 'static', proxyPass: '', root: '', useIndex: false, index: 'index.html index.htm', xff: false, blockStatus: 403, allow: '', deny: '', extra: '' } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', data: { label: '', order: 0 } },
    { id: 'e2', source: 's1', target: 'l2', type: 'bezier', data: { label: '', order: 0 } },
  ],
};
