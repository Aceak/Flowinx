import { useCallback, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, MiniMap, BackgroundVariant, useReactFlow, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store/useStore';
import { CustomNode } from './CustomNode';
import type { NodeType } from '../../types/nodes';
import { VALID_CONNECTIONS } from '../../types/edges';
import { Grid3x3, Minus, MousePointer2, Hand, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

const nodeTypes = {
  server: CustomNode, location: CustomNode, upstream: CustomNode,
  backend: CustomNode, redirect: CustomNode, static: CustomNode,
};

const NODE_W = 180, NODE_H = 84;

function snap(n: number, g: number): number { return Math.round(n / g) * g; }

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useStore();
  const theme = useStore((s) => s.theme);
  const [gridLines, setGridLines] = useState(false);
  const [panMode, setPanMode] = useState(true);

  const isDark = theme === 'dark';

  // 动态颜色（响应主题切换）
  const bgColor = isDark ? '#404040' : '#d1d5db';
  const edgeColor = isDark ? '#525252' : '#a3a3a3';

  const defaultEdgeOptions = useMemo(() => ({
    type: 'bezier' as const,
    animated: true,
    style: { stroke: edgeColor, strokeWidth: 2 },
  }), [edgeColor]);

  const miniMapNodeColor = useCallback((n: { type?: string }) => {
    const colors: Record<string, string> = isDark ? {
      'server': '#6ee7b7', 'location': '#5eead4', 'upstream': '#d8b4fe',
      'backend': '#f9a8d4', 'redirect': '#67e8f9', 'static': '#fcd34d',
    } : {
      'server': '#10b981', 'location': '#14b8a6', 'upstream': '#a855f7',
      'backend': '#ec4899', 'redirect': '#06b6d4', 'static': '#f59e0b',
    };
    return colors[n.type || ''] || (isDark ? '#737373' : '#6b7280');
  }, [isDark]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const typeStr = e.dataTransfer.getData('application/reactflow-type');
    if (!typeStr) return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(typeStr as NodeType, { x: pos.x - 90, y: pos.y - 42 });
  }, [addNode, screenToFlowPosition]);

  const onNodeClick = useCallback((_e: React.MouseEvent, node: { id: string }) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => setSelectedNode(null), [setSelectedNode]);

  // 拖拽吸附：中心点在横/竖线上靠近时对齐，否则网格吸附
  const SNAP_DIST = 10;
  const snapPosition = useCallback((nodeId: string, pos: { x: number; y: number }) => {
    const all = useStore.getState().nodes;
    const cx = pos.x + NODE_W / 2, cy = pos.y + NODE_H / 2;
    let x = pos.x, y = pos.y;

    for (const o of all) {
      if (o.id === nodeId) continue;
      const ocx = o.position.x + NODE_W / 2, ocy = o.position.y + NODE_H / 2;
      if (Math.abs(cx - ocx) < SNAP_DIST) x = ocx - NODE_W / 2;
      if (Math.abs(cy - ocy) < SNAP_DIST) y = ocy - NODE_H / 2;
    }

    if (x === pos.x) x = snap(pos.x, 20);
    if (y === pos.y) y = snap(pos.y, 20);
    return { x, y };
  }, []);

  const onNodeDrag = useCallback((_e: MouseEvent | TouchEvent, dragged: Node) => {
    const snapped = snapPosition(dragged.id, dragged.position);
    if (snapped.x !== dragged.position.x || snapped.y !== dragged.position.y) {
      onNodesChange([{ type: 'position', id: dragged.id, position: snapped, dragging: true }]);
    }
  }, [onNodesChange, snapPosition]);

  const onNodeDragStop = useCallback((_e: MouseEvent | TouchEvent, dragged: Node) => {
    const snapped = snapPosition(dragged.id, dragged.position);
    onNodesChange([{ type: 'position', id: dragged.id, position: snapped }]);
  }, [onNodesChange, snapPosition]);

  const isValidConnection = useCallback((c: { source: string; target: string }) => {
    const src = nodes.find((n) => n.id === c.source);
    const tgt = nodes.find((n) => n.id === c.target);
    if (!src || !tgt) return false;
    return (VALID_CONNECTIONS[src.type as NodeType] ?? []).includes(tgt.type as NodeType);
  }, [nodes]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative bg-gray-50 dark:bg-neutral-950" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick} onNodeDrag={onNodeDrag} onNodeDragStop={onNodeDragStop}
        isValidConnection={isValidConnection} nodeTypes={nodeTypes}
        fitView deleteKeyCode={['Backspace', 'Delete']}
        connectionMode="loose"
        panOnDrag={panMode}
        selectionOnDrag={!panMode}
        panActivationKeyCode="Space"
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={defaultEdgeOptions}
        className={isDark ? 'dark' : undefined}
      >
        <Background
          variant={gridLines ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={20} size={gridLines ? 0.3 : 0.8} color={bgColor}
        />
        <MiniMap
          nodeStrokeColor={edgeColor}
          nodeColor={miniMapNodeColor}
          maskColor={isDark ? 'rgba(0,0,0,0.6)' : 'rgba(240,240,240,0.6)'}
          style={isDark ? { backgroundColor: '#0a0a0a' } : undefined}
        />
      </ReactFlow>

      <div className="absolute bottom-4 left-4 z-10 flex gap-1.5">
        <button onClick={() => setGridLines(!gridLines)}
          title={gridLines ? '切换为点阵' : '切换为网格线'}
          className="p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          {gridLines ? <Grid3x3 size={16} /> : <Minus size={16} />}
        </button>
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
        <button onClick={() => setPanMode(false)}
          title="框选多个节点"
          className={`p-2 border rounded-lg shadow-sm transition-colors ${!panMode ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
          <MousePointer2 size={16} />
        </button>
        <button onClick={() => setPanMode(true)}
          title="拖动画布"
          className={`p-2 border rounded-lg shadow-sm transition-colors ${panMode ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
          <Hand size={16} />
        </button>
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
        <button onClick={() => zoomIn()} title="放大"
          className="p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => zoomOut()} title="缩小"
          className="p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <ZoomOut size={16} />
        </button>
        <button onClick={() => fitView()} title="适应画布"
          className="p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
