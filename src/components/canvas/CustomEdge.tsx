import { useState } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { GraphEdgeData } from '../../types/edges';
import { useStore } from '../../store/useStore';

const SELECTED_STYLE = {
  stroke: '#3b82f6',
  strokeWidth: 3,
  filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.5))',
};

const DELETE_HOVER_STYLE = {
  stroke: '#ef4444',
  strokeWidth: 3,
  filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.5))',
};

export function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, selected, markerEnd,
}: EdgeProps<GraphEdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const deleteMode = useStore((s) => s.deleteMode);
  const [hovered, setHovered] = useState(false);

  const style = selected ? SELECTED_STYLE
    : (deleteMode && hovered) ? DELETE_HOVER_STYLE
    : undefined;

  return (
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {/* 透明宽路径扩大点击/悬浮区域 */}
      {deleteMode && (
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      )}
    </g>
  );
}
