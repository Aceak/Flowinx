// ====== 节点类型定义 ======

export const NODE_TYPES = [
  'server',
  'location',
  'upstream',
  'backend',
  'cache',
  'auth',
  'rate_limit',
  'map',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export interface ServerData {
  [key: string]: unknown;
  label: string;
  listenAddr: string;
  port: number;
  ssl: boolean;
  sslCert: string;
  sslKey: string;
  serverName: string;
  aliases: string;
  root: string;
  index: string;
  http2: boolean;
  sslProtocols: string;
  sslStapling: boolean;
  sslStaplingVerify: boolean;
  sslTrustedCert: string;
  addHeaders: string;
  clientMaxBodySize: string;
  accessLog: string;
  errorLog: string;
  listenIPv6: string;
  ipv6Port: number;
  gzip: boolean;
  gzipTypes: string;
  gzipMinLength: string;
  /** 自动将 80 端口重定向到 443 */
  redirectHttp: boolean;
  /** 分块传输编码 */
  chunkedTransfer: boolean;
  extra: string;
}

export interface LocationData {
  [key: string]: unknown;
  label: string;
  path: string;
  mode: 'proxy' | 'static' | 'block' | 'redirect';
  proxyPass: string;
  fastcgiPass: string;
  xff: boolean;
  blockStatus: number;
  blockPage: string;
  redirectUrl: string;
  redirectPermanent: boolean;
  allow: string;
  deny: string;
  includes: string;
  fastcgiIndex: string;
  fastcgiParams: string;
  /** 静态模式：文件根目录 */
  root: string;
  /** 静态模式：默认首页 */
  index: string;
  /** 静态模式：try_files */
  tryFiles: string;
  /** 静态模式：浏览器缓存时间 */
  expires: string;
  /** 静态模式：目录浏览 */
  autoindex: boolean;
  /** 静态模式：Cache-Control */
  cacheControl: string;
  /** 分块传输编码（反代模式） */
  chunkedTransfer: boolean;
  accessLog: string;
  errorLog: string;
  extra: string;
}

export interface UpstreamData {
  [key: string]: unknown;
  label: string;
  name: string;
  strategy: 'round-robin' | 'least-conn' | 'ip-hash';
  keepalive: number;
}

export interface BackendData {
  [key: string]: unknown;
  label: string;
  address: string;
  weight: number;
  maxFails: number;
  failTimeout: number;
  backup: boolean;
}

export interface AuthData {
  [key: string]: unknown;
  label: string;
  /** 'basic' | 'request' | 'jwt' */
  authType: 'basic' | 'request' | 'jwt';
  /** basic: 提示文字 */
  realm: string;
  /** basic: 密码文件路径 */
  userFile: string;
  /** request: 认证子请求 URI */
  authUrl: string;
  /** jwt: 密钥字符串或文件路径 */
  jwtKey: string;
  /** jwt: 声明字段 */
  jwtClaim: string;
  /** jwt: 密钥是文件路径 */
  jwtKeyFile: boolean;
}

export interface RateLimitData {
  [key: string]: unknown;
  label: string;
  /** 限制区域名 */
  zone: string;
  /** 每秒请求数 */
  rate: string;
  /** 突发 */
  burst: number;
  /** 不延迟 */
  nodelay: boolean;
  /** 共享内存大小 */
  zoneSize: string;
}

export interface MapData {
  [key: string]: unknown;
  label: string;
  /** 源变量 */
  source: string;
  /** 目标变量 */
  target: string;
  /** 映射规则 key value; 一行一条 */
  rules: string;
  /** 默认值 */
  defaultValue: string;
}

export interface CacheData {
  [key: string]: unknown;
  label: string;
  /** 缓存区名称 */
  zone: string;
  /** 缓存时长 */
  time: string;
  /** 最大缓存大小 */
  maxSize: string;
  zoneSize: string;
  /** 缓存键 */
  keys: string;
  /** 允许返回过期缓存 */
  useStale: boolean;
}

export type NodeData = ServerData | LocationData | UpstreamData | BackendData | CacheData | AuthData | RateLimitData | MapData;
