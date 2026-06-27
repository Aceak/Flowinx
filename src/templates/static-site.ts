export const staticSite = {
  name: '静态网站',
  description: '纯静态文件托管',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: '静态站', listenAddr: '', port: 80, ssl: false, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'mysite.com', aliases: 'www.mysite.com', hasStatic: true, root: '/var/www/mysite', index: 'index.html' } },
    { id: 'l1', type: 'location', position: { x: 250, y: 220 }, data: { label: '首页', path: '/', mode: 'static', proxyPass: '', root: '', useIndex: false, index: 'index.html', xff: false, blockStatus: 403, allow: '', deny: '', extra: 'try_files $uri $uri/ /index.html;' } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', data: { label: '', order: 0 } },
  ],
};
