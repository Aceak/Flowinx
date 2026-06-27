// ====== 节点类型定义 ======

export const NODE_TYPES = [
  'server',
  'location',
  'upstream',
  'backend',
  'redirect',
  'static',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];

export interface ServerData {
  label: string;
  /** 监听地址，空表示所有网卡 */
  listenAddr: string;
  port: number;
  ssl: boolean;
  sslCert: string;
  sslKey: string;
  serverName: string;
  aliases: string;
  /** 是否提供静态文件 */
  hasStatic: boolean;
  root: string;
  index: string;
}

export interface LocationData {
  label: string;
  path: string;
  /** 'proxy' | 'static' | 'block' */
  mode: 'proxy' | 'static' | 'block';
  /** 反代目标 */
  proxyPass: string;
  /** 静态文件根目录 */
  root: string;
  /** 是否自定义首页 */
  useIndex: boolean;
  /** 默认首页 */
  index: string;
  /** 传递 X-Forwarded-For */
  xff: boolean;
  /** 禁止访问时的状态码 */
  blockStatus: number;
  /** IP 白名单 */
  allow: string;
  /** IP 黑名单 */
  deny: string;
  /** 额外指令 */
  extra: string;
}

export interface UpstreamData {
  label: string;
  name: string;
  strategy: 'round-robin' | 'least-conn' | 'ip-hash';
  keepalive: number;
}

export interface BackendData {
  label: string;
  address: string;
  weight: number;
  maxFails: number;
  failTimeout: number;
  backup: boolean;
}

export interface RedirectData {
  label: string;
  /** 来源域名（通常是 HTTP 的域名，跳转到 HTTPS） */
  fromDomain: string;
  /** 目标 URL */
  toUrl: string;
  /** 是否永久重定向 */
  permanent: boolean;
}

export interface StaticData {
  label: string;
  /** 匹配路径 */
  path: string;
  /** 文件根目录 */
  root: string;
  /** 缓存过期时间 */
  expires: string;
  /** 是否开启目录浏览 */
  autoindex: boolean;
}

export type NodeData = ServerData | LocationData | UpstreamData | BackendData | RedirectData | StaticData;
