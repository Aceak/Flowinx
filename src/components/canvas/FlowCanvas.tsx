import { useCallback, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, useReactFlow, type Node } from '@xyflow/react';
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

const NODE_W = 180, NODE_H = 84, SNAP = 10;

function snap(n: number, g: number): number { return Math.round(n / g) * g; }

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useStore();
  const [gridLines, setGridLines] = useState(false);
  const [panMode, setPanMode] = useState(true);

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

  // 拖拽吸附：中心对齐其他节点 > 网格
  const onNodeDrag = useCallback((_e: MouseEvent | TouchEvent, dragged: Node) => {
    const all = useStore.getState().nodes;
    let { x, y } = dragged.position;
    const cx = x + NODE_W / 2, cy = y + NODE_H / 2;
    let alignedX = false, alignedY = false;

    for (const o of all) {
      if (o.id === dragged.id) continue;
      const ocx = o.position.x + NODE_W / 2, ocy = o.position.y + NODE_H / 2;
      if (Math.abs(cx - ocx) < SNAP) { x = ocx - NODE_W / 2; alignedX = true; }
      if (Math.abs(cy - ocy) < SNAP) { y = ocy - NODE_H / 2; alignedY = true; }
    }

    if (!alignedX) x = snap(x, 20);
    if (!alignedY) y = snap(y, 20);

    if (x !== dragged.position.x || y !== dragged.position.y) {
      onNodesChange([{ type: 'position', id: dragged.id, position: { x, y }, dragging: true }]);
    }
  }, [onNodesChange]);

  const isValidConnection = useCallback((c: { source: string; target: string }) => {
    const src = nodes.find((n) => n.id === c.source);
    const tgt = nodes.find((n) => n.id === c.target);
    if (!src || !tgt) return false;
    return (VALID_CONNECTIONS[src.type as NodeType] ?? []).includes(tgt.type as NodeType);
  }, [nodes]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full relative" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick} onNodeDrag={onNodeDrag}
        isValidConnection={isValidConnection} nodeTypes={nodeTypes}
        fitView deleteKeyCode={['Backspace', 'Delete']}
        panOnDrag={panMode}
        selectionOnDrag={!panMode}
        panActivationKeyCode="Space"
        multiSelectionKeyCode="Shift"
        defaultEdgeOptions={{ type: 'bezier', animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } }}
      >
        <Background
          variant={gridLines ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={20} size={gridLines ? 0.3 : 0.8} color="#d1d5db"
        />
        <Controls showZoom={false} showFitView={false} showInteractive={false} />
        <MiniMap nodeStrokeColor="#94a3b8"
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              'server': '#10b981', 'location': '#14b8a6', 'upstream': '#a855f7',
              'backend': '#ec4899', 'redirect': '#06b6d4', 'static': '#f59e0b',
            };
            return colors[n.type || ''] || '#6b7280';
          }}
        />
      </ReactFlow>

      <div className="absolute bottom-4 left-4 z-10 flex gap-1.5">
        <button onClick={() => setGridLines(!gridLines)}
          title={gridLines ? '切换为点阵' : '切换为网格线'}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          {gridLines ? <Grid3x3 size={16} /> : <Minus size={16} />}
        </button>
        <div className="w-px bg-gray-200 my-1" />
        <button onClick={() => setPanMode(false)}
          title="框选多个节点"
          className={`p-2 border rounded-lg shadow-sm transition-colors ${!panMode ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'}`}>
          <MousePointer2 size={16} />
        </button>
        <button onClick={() => setPanMode(true)}
          title="拖动画布"
          className={`p-2 border rounded-lg shadow-sm transition-colors ${panMode ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'}`}>
          <Hand size={16} />
        </button>
        <div className="w-px bg-gray-200 my-1" />
        <button onClick={() => zoomIn()} title="放大"
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => zoomOut()} title="缩小"
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <ZoomOut size={16} />
        </button>
        <button onClick={() => fitView()} title="适应画布"
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-500 transition-colors">
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}
