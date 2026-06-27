// 负载均衡
export const loadBalanced = {
  name: '负载均衡',
  description: '多个后端服务器负载均衡',
  nodes: [
    { id: 's1', type: 'server', position: { x: 250, y: 50 }, data: { label: 'API 网关', port: 80, ssl: false, sslCert: '', sslKey: '', serverName: 'api.example.com', aliases: '', hasStatic: false, root: '', index: '' } },
    { id: 'l1', type: 'location', position: { x: 250, y: 220 }, data: { label: '/api', path: '/api', proxyPass: '', xff: true, allow: '', deny: '', extra: '' } },
    { id: 'u1', type: 'upstream', position: { x: 250, y: 380 }, data: { label: 'API 后端组', name: 'api_backend', strategy: 'least-conn', keepalive: 32 } },
    { id: 'b1', type: 'backend', position: { x: 150, y: 540 }, data: { label: '服务器 1', address: '10.0.0.1:3000', weight: 2, maxFails: 3, failTimeout: 30, backup: false } },
    { id: 'b2', type: 'backend', position: { x: 350, y: 540 }, data: { label: '服务器 2', address: '10.0.0.2:3000', weight: 1, maxFails: 3, failTimeout: 30, backup: false } },
  ],
  edges: [
    { id: 'e1', source: 's1', target: 'l1', type: 'bezier', data: { label: '', order: 0 } },
    { id: 'e2', source: 'l1', target: 'u1', type: 'bezier', data: { label: '', order: 0 } },
    { id: 'e3', source: 'u1', target: 'b1', type: 'bezier', data: { label: '', order: 0 } },
    { id: 'e4', source: 'u1', target: 'b2', type: 'bezier', data: { label: '', order: 0 } },
  ],
};
