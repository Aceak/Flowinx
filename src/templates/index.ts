import { simpleProxy } from './simple-proxy';
import { loadBalanced } from './load-balanced';
import { staticSite } from './static-site';
import { sslTermination } from './ssl-termination';

export const templates: Record<string, { name: string; description: string; nodes: unknown[]; edges: unknown[] }> = {
  'simple-proxy': simpleProxy,
  'load-balanced': loadBalanced,
  'static-site': staticSite,
  'ssl-termination': sslTermination,
};
