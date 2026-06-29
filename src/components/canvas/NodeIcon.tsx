import type { NodeType } from '../../types/nodes';
import { Globe, MapPin, Share2, Database, HardDrive, Shield, Gauge, GitFork } from 'lucide-react';

const iconMap: Record<NodeType, React.ComponentType<{ size?: number }>> = {
  'server':     Globe,
  'location':   MapPin,
  'upstream':   Share2,
  'backend':    Database,
  'cache':      HardDrive,
  'auth':       Shield,
  'rate_limit': Gauge,
  'map':        GitFork,
};

export function NodeIcon({ type, size = 16 }: { type: NodeType; size?: number }) {
  const Icon = iconMap[type];
  if (!Icon) return null;
  return <Icon size={size} />;
}
