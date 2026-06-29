import { fullStack } from './full-stack';
import { httpsSite } from './https-site';
import { microservice } from './microservice';
import { staticCdn } from './static-cdn';

export const templates: Record<string, { name: string; description: string; nodes: unknown[]; edges: unknown[] }> = {
  'full-stack': fullStack,
  'https-site': httpsSite,
  'microservice': microservice,
  'static-cdn': staticCdn,
};
