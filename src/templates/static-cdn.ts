export const staticCdn = {
  name: '静态资源服务器',
  description: 'SPA 入口 + 长缓存静态资源 + Gzip + IPv6 双栈',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 0 }, data: { label: 'CDN 站点', listenAddr: '0.0.0.0', port: 80, listenIPv6: '::', ipv6Port: 80, ssl: false, serverName: 'cdn.example.com', root: '/var/www/cdn', index: 'index.html', gzip: true, gzipTypes: 'text/plain text/css application/json application/javascript image/svg+xml application/wasm', gzipMinLength: '256', chunkedTransfer: true, clientMaxBodySize: '50m', accessLog: '/var/log/nginx/cdn.log' } },
    { id: 'l1', type: 'location', position: { x: 80, y: 160 }, data: { label: 'SPA 入口', path: '/', mode: 'static', root: '/var/www/cdn/app', index: 'index.html', tryFiles: '$uri $uri/ /index.html', expires: '-1', cacheControl: 'no-cache', accessLog: '/var/log/nginx/app.log' } },
    { id: 'l2', type: 'location', position: { x: 420, y: 160 }, data: { label: '静态资源', path: '/assets/', mode: 'static', root: '/var/www/cdn', index: '', expires: '365d', cacheControl: 'public, max-age=31536000, immutable', autoindex: false } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e2', source: 's1', target: 'l2', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 1 } },
  ],
};
