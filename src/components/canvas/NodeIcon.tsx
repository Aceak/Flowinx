import type { NodeType } from '../../types/nodes';
import { Globe, MapPin, Share2, Database, CornerDownRight, FolderOpen } from 'lucide-react';

const iconMap: Record<NodeType, React.ComponentType<{ size?: number }>> = {
  'server':   Globe,
  'location': MapPin,
  'upstream': Share2,
  'backend':  Database,
  'redirect': CornerDownRight,
  'static':   FolderOpen,
};

export function NodeIcon({ type, size = 16 }: { type: NodeType; size?: number }) {
  const Icon = iconMap[type];
  if (!Icon) return null;
  return <Icon size={size} />;
}
