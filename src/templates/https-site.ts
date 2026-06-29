export const httpsSite = {
  name: '全站 HTTPS',
  description: '80→443 重定向 + HSTS + HTTP/2 + API 反代 + 缓存',
  nodes: [
    { id: 's1', type: 'server', position: { x: 310, y: 0 }, data: { label: '安全站点', listenAddr: '0.0.0.0', port: 443, ssl: true, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem', serverName: 'secure.example.com', root: '', index: '', http2: true, sslProtocols: 'TLSv1.2 TLSv1.3', sslStapling: true, redirectHttp: true, addHeaders: 'Strict-Transport-Security "max-age=31536000; includeSubDomains"\nX-Frame-Options "DENY"', clientMaxBodySize: '10m', gzip: true, chunkedTransfer: true } },
    { id: 'l1', type: 'location', position: { x: 310, y: 160 }, data: { label: 'API 接口', path: '/api/', mode: 'proxy', xff: true, chunkedTransfer: true } },
    { id: 'b1', type: 'backend', position: { x: 180, y: 480 }, data: { label: '后端服务', address: '127.0.0.1:8080', weight: 1, maxFails: 3, failTimeout: 30 } },
    { id: 'c1', type: 'cache', position: { x: 440, y: 480 }, data: { label: 'API 缓存', zone: 'api_cache', time: '10m', maxSize: '500m', zoneSize: '20m', keys: '$scheme$request_method$host$request_uri', useStale: true } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e2', source: 'l1', target: 'b1', type: 'bezier', sourceHandle: 'bottom-source', targetHandle: 'top-target', data: { label: '', order: 0 } },
    { id: 'e3', source: 'l1', target: 'c1', type: 'bezier', sourceHandle: 'right-source', targetHandle: 'left-target', data: { label: '', order: 1 } },
  ],
};
