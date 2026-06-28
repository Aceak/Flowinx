// ====== 可拖拽节点项（桌面 HTML5 拖拽 + 触控拖拽幽灵） ======

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReactFlow } from '@xyflow/react';
import { useStore } from '../../store/useStore';
import type { NodeType } from '../../types/nodes';
import { NodeIcon } from '../canvas/NodeIcon';
import { NODE_LABELS, NODE_CATEGORIES } from '../../constants/labels';
import { NODE_COLORS } from '../../constants/colors';

interface DraggableItemProps {
  type: NodeType;
}

function Ghost({ x, y, colors, label, type }: { x: number; y: number; colors: { bg: string; border: string; badge: string }; label: string; type: NodeType }) {
  return createPortal(
    <div
      className={`${colors.bg} ${colors.border} fixed border-2 rounded-lg px-3 py-2.5 shadow-xl opacity-90 pointer-events-none z-[9999] flex items-center gap-2`}
      style={{ left: x - 90, top: y - 24, width: 180 }}
    >
      <span className={`${colors.badge} text-white p-1 rounded`}>
        <NodeIcon type={type} size={14} />
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</span>
    </div>,
    document.body,
  );
}

export function DraggableItem({ type }: DraggableItemProps) {
  const colors = NODE_COLORS[type] ?? NODE_COLORS['server'];
  const label = NODE_LABELS[type] || type;
  const { screenToFlowPosition } = useReactFlow();
  const touched = useRef(false);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);

  // 桌面端 HTML5 拖拽
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow-type', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  // 触控拖拽开始
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    setGhost({ x: t.clientX, y: t.clientY });
  }, []);

  // 全局 touchmove 更新幽灵位置
  useEffect(() => {
    if (!ghost) return;
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      setGhost({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    window.addEventListener('touchmove', onMove, { passive: false });
    return () => window.removeEventListener('touchmove', onMove);
  }, [ghost]);

  // 触控拖拽结束：在手指位置放节点
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    touched.current = true;
    const t = e.changedTouches[0];
    const pos = screenToFlowPosition({ x: t.clientX, y: t.clientY });
    useStore.getState().addNode(type, { x: pos.x - 90, y: pos.y - 42 });
    setGhost(null);
  }, [type, screenToFlowPosition]);

  // 桌面点击：放到视口中央（触控已由 onTouchEnd 处理）
  const onClick = useCallback(() => {
    if (touched.current) { touched.current = false; return; }
    const pos = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    useStore.getState().addNode(type, { x: pos.x - 90, y: pos.y - 42 });
  }, [type, screenToFlowPosition]);

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={onClick}
        className={`
          ${colors.bg} ${colors.border}
          border rounded-lg px-3 py-2.5 cursor-grab active:cursor-grabbing
          hover:shadow-md transition-shadow duration-150
          flex items-center gap-2 select-none
          touch-none
        `}
      >
        <span className={`${colors.badge} text-white p-1 rounded`}>
          <NodeIcon type={type} size={14} />
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">{label}</span>
      </div>

      {/* 触控拖拽幽灵：跟随手指的半透明节点 */}
      {ghost && <Ghost x={ghost.x} y={ghost.y} colors={colors} label={label} type={type} />}
    </>
  );
}

export function NodePalette() {
  return (
    <div className="flex flex-col gap-4">
      {NODE_CATEGORIES.map((cat) => (
        <div key={cat.key}>
          <h3 className="text-xs font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
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
