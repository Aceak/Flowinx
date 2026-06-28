import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, Background, MiniMap, BackgroundVariant, useReactFlow, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store/useStore';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import type { NodeType } from '../../types/nodes';
import type { GraphEdgeData } from '../../types/edges';
import { VALID_CONNECTIONS } from '../../types/edges';
import { Grid3x3, Minus, MousePointer2, Hand, Eraser, ZoomIn, ZoomOut, Maximize, Trash2, Pin, PinOff } from 'lucide-react';

const nodeTypes = {
  server: CustomNode, location: CustomNode, upstream: CustomNode,
  backend: CustomNode, redirect: CustomNode, static: CustomNode,
};

const edgeTypes = { bezier: CustomEdge };

const NODE_W = 180, NODE_H = 84;

function snap(n: number, g: number): number { return Math.round(n / g) * g; }

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView, deleteElements } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode, setSelectedEdge, selectedNodeId, selectedEdgeId, deleteMode, toggleDeleteMode, removeNode } = useStore();
  const panelCollapsed = useStore((s) => s.panelCollapsed);
  const panelPinned = useStore((s) => s.panelPinned);
  const setPanelCollapsed = useStore((s) => s.setPanelCollapsed);
  const setPanelPinned = useStore((s) => s.setPanelPinned);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const theme = useStore((s) => s.theme);
  const [gridLines, setGridLines] = useState(false);
  const [panMode, setPanMode] = useState(true);
  const [multiSelectedNodeIds, setMultiSelectedNodeIds] = useState<string[]>([]);

  // 实时自动生成配置（debounce 500ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      useStore.getState().generateConfig();
    }, 500);
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  const isDark = theme === 'dark';

  // 动态颜色（响应主题切换）
  const bgColor = isDark ? '#404040' : '#d1d5db';
  const edgeColor = isDark ? '#525252' : '#a3a3a3';

  const defaultEdgeOptions = useMemo(() => ({
    type: 'bezier' as const,
    animated: true,
    style: { stroke: edgeColor, strokeWidth: 2 },
    interactionWidth: 30,
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
    if (deleteMode) {
      removeNode(node.id);
    } else {
      setSelectedNode(node.id);
      setPanelTab('config');
      if (panelCollapsed) setPanelCollapsed(false);
    }
  }, [deleteMode, removeNode, setSelectedNode, setPanelTab, panelCollapsed, setPanelCollapsed]);

  const onEdgeClick = useCallback((_e: React.MouseEvent, edge: { id: string }) => {
    if (deleteMode) {
      useStore.getState().removeEdge(edge.id);
    } else {
      setSelectedEdge(edge.id);
      if (panelCollapsed) setPanelCollapsed(false);
    }
  }, [deleteMode, setSelectedEdge, panelCollapsed, setPanelCollapsed]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setMultiSelectedNodeIds([]);
    if (!panelPinned) setPanelCollapsed(true);
  }, [setSelectedNode, setSelectedEdge, panelPinned, setPanelCollapsed]);

  const onSelectionChange = useCallback(({ nodes: selected }: { nodes: { id: string }[] }) => {
    setMultiSelectedNodeIds(selected.map((n) => n.id));
  }, []);

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

  const enterSelectMode = useCallback(() => {
    if (deleteMode) toggleDeleteMode();
    setPanMode(false);
  }, [deleteMode, toggleDeleteMode]);

  const enterPanMode = useCallback(() => {
    if (deleteMode) toggleDeleteMode();
    setPanMode(true);
  }, [deleteMode, toggleDeleteMode]);

  const deleteSelected = useCallback(() => {
    const state = useStore.getState();
    const nodesToDelete: { id: string }[] = [];
    const edgesToDelete: { id: string }[] = [];

    // 框选多节点
    for (const id of multiSelectedNodeIds) {
      nodesToDelete.push({ id });
    }
    // 单击选中节点（去重）
    if (state.selectedNodeId && !multiSelectedNodeIds.includes(state.selectedNodeId)) {
      nodesToDelete.push({ id: state.selectedNodeId });
    }
    // 单击选中连线
    if (state.selectedEdgeId) {
      edgesToDelete.push({ id: state.selectedEdgeId });
    }

    if (nodesToDelete.length > 0 || edgesToDelete.length > 0) {
      deleteElements({ nodes: nodesToDelete, edges: edgesToDelete });
    }
  }, [multiSelectedNodeIds, deleteElements]);

  const hasSelection = multiSelectedNodeIds.length > 0 || !!selectedNodeId || !!selectedEdgeId;

  const edgesWithSelection = useMemo(() =>
    edges.map((e) => ({ ...e, selected: e.id === selectedEdgeId })),
  [edges, selectedEdgeId]);

  return (
    <div ref={reactFlowWrapper} className={`flex-1 h-full relative bg-gray-50 dark:bg-neutral-900 ${deleteMode ? 'cursor-pointer' : ''}`} onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes} edges={edgesWithSelection}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        onNodeClick={onNodeClick} onEdgeClick={onEdgeClick} onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onNodeDrag={onNodeDrag} onNodeDragStop={onNodeDragStop}
        isValidConnection={isValidConnection} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView deleteKeyCode={['Backspace', 'Delete']}
        connectionMode="loose"
        panOnDrag={panMode}
        selectionOnDrag={!panMode && !deleteMode}
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
          className="hidden sm:block"
        />
      </ReactFlow>

      <div className="absolute bottom-3 left-2 sm:bottom-4 sm:left-4 z-10 flex gap-1 sm:gap-1.5">
        <button onClick={() => setGridLines(!gridLines)}
          title={gridLines ? '切换为点阵' : '切换为网格线'}
          className="p-1.5 sm:p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          {gridLines ? <Grid3x3 size={15} /> : <Minus size={15} />}
        </button>
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
        {/* 模式切换：箭头(选择) / 手(拖拽) / 橡皮擦(删除) 三选一 */}
        <button onClick={enterSelectMode}
          title="选择模式"
          className={`p-1.5 sm:p-2 border rounded-lg shadow-sm transition-colors ${!panMode && !deleteMode ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
          <MousePointer2 size={15} />
        </button>
        <button onClick={enterPanMode}
          title="拖拽模式"
          className={`p-1.5 sm:p-2 border rounded-lg shadow-sm transition-colors ${panMode && !deleteMode ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
          <Hand size={15} />
        </button>
        <button onClick={toggleDeleteMode}
          title="删除模式"
          className={`p-1.5 sm:p-2 border rounded-lg shadow-sm transition-colors ${deleteMode ? 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400'}`}>
          <Eraser size={15} />
        </button>
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
        <button onClick={() => setPanelPinned(!panelPinned)}
          title={panelPinned ? '已固定 · 点击取消' : '未固定 · 点击固定'}
          className={`p-1.5 sm:p-2 border rounded-lg shadow-sm transition-colors ${panelPinned ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-500 dark:text-blue-400' : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-400 dark:text-neutral-500'}`}>
          {panelPinned ? <Pin size={15} /> : <PinOff size={15} />}
        </button>
        <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
        <button onClick={() => zoomIn()} title="放大"
          className="p-1.5 sm:p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <ZoomIn size={15} />
        </button>
        <button onClick={() => zoomOut()} title="缩小"
          className="p-1.5 sm:p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <ZoomOut size={15} />
        </button>
        <button onClick={() => fitView()} title="适应画布"
          className="p-1.5 sm:p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-500 dark:text-neutral-400 transition-colors">
          <Maximize size={15} />
        </button>
        {/* 动态工具区域 — 选中任意节点或连线后才出现垃圾桶 */}
        {hasSelection && (
          <>
            <div className="w-px bg-gray-200 dark:bg-neutral-700 my-1" />
            <button onClick={deleteSelected}
              title="删除选中项"
              className="p-1.5 sm:p-2 bg-white dark:bg-neutral-800 border border-red-200 dark:border-red-800 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
