// HTTPS
export const sslTermination = {
  name: 'HTTPS 网站',
  description: '启用 HTTPS + 反向代理',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: '安全站点', port: 443, ssl: true, sslCert: '/etc/nginx/ssl/cert.pem', sslKey: '/etc/nginx/ssl/key.pem', serverName: 'secure.example.com', aliases: '', hasStatic: false, root: '', index: '' } },
    { id: 'l1', type: 'location', position: { x: 250, y: 260 }, data: { label: '全部请求', path: '/', proxyPass: 'http://127.0.0.1:8080', xff: true, allow: '', deny: '', extra: '' } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', data: { label: '', order: 0 } },
  ],
};
