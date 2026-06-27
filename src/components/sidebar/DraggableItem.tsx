// ====== 可拖拽节点项 ======

import type { NodeType } from '../../types/nodes';
import { NodeIcon } from '../canvas/NodeIcon';
import { NODE_LABELS, NODE_CATEGORIES } from '../../constants/labels';
import { NODE_COLORS } from '../../constants/colors';

interface DraggableItemProps {
  type: NodeType;
}

export function DraggableItem({ type }: DraggableItemProps) {
  const colors = NODE_COLORS[type] ?? NODE_COLORS['nginx-server'];
  const label = NODE_LABELS[type] || type;

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`
        ${colors.bg} ${colors.border}
        border rounded-lg px-3 py-2.5 cursor-grab active:cursor-grabbing
        hover:shadow-md transition-shadow duration-150
        flex items-center gap-2 select-none
      `}
    >
      <span className={`${colors.badge} text-white p-1 rounded`}>
        <NodeIcon type={type} size={14} />
      </span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

export function NodePalette() {
  return (
    <div className="flex flex-col gap-4">
      {NODE_CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {cat.label}
          </h3>
          <div className="flex flex-col gap-2">
            {cat.types.map((type) => (
              <DraggableItem key={type} type={type} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
