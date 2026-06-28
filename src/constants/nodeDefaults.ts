import type { NodeData, NodeType } from '../types/nodes';

export const NODE_DEFAULTS: Record<NodeType, Partial<NodeData>> = {
  'server': {
    label: '我的网站', listenAddr: '', port: 80, ssl: false, sslCert: '/etc/nginx/ssl/fullchain.pem', sslKey: '/etc/nginx/ssl/privkey.pem',
    serverName: 'example.com', aliases: '', hasStatic: true, root: '/var/www/html', index: 'index.html index.htm',
    http2: false, sslProtocols: 'TLSv1.2 TLSv1.3', sslStapling: false, sslStaplingVerify: false, sslTrustedCert: '',
    addHeaders: '', clientMaxBodySize: '', accessLog: '', errorLog: '', listenIPv6: '',
    gzip: true, gzipTypes: 'text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript', gzipMinLength: '1000', redirectHttp: false, extra: '',
  },
  'location': {
    label: '首页', path: '/', mode: 'static', proxyPass: '', fastcgiPass: '', xff: true, blockStatus: 403,
    redirectUrl: '', redirectPermanent: true, blockPage: '', allow: '', deny: '', includes: '', fastcgiIndex: '', fastcgiParams: '', extra: '',
  },
  'upstream': {
    label: '后端服务器组', name: 'backend', strategy: 'round-robin', keepalive: 32,
  },
  'backend': {
    label: '后端', address: '127.0.0.1:3000', weight: 1, maxFails: 3, failTimeout: 30, backup: false,
  },
  'static': {
    label: '静态资源', root: '/var/www/html', index: '', tryFiles: '', expires: '30d', autoindex: false, cacheControl: '',
  },
  'cache': {
    label: '缓存规则', zone: 'my_cache', time: '1h', maxSize: '100m', zoneSize: '10m', keys: '$scheme$proxy_host$request_uri', useStale: false,
  },
  'auth': {
    label: '认证', authType: 'basic', realm: 'Restricted Access', userFile: '/etc/nginx/.htpasswd',
    authUrl: '/auth', jwtKey: '', jwtClaim: 'sub', jwtKeyFile: false,
  },
  'rate_limit': {
    label: '限流', zone: 'limit_zone', rate: '10r/s', burst: 20, nodelay: true, zoneSize: '10m',
  },
  'map': {
    label: '映射', source: '$http_upgrade', target: '$connection_upgrade', rules: '', defaultValue: 'close',
  },
};
