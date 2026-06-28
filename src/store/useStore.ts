import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
} from '@xyflow/react';
import type { NodeData, NodeType } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import type { AppState } from '../types/store';
import { NODE_DEFAULTS } from '../constants/nodeDefaults';
import { generateId, generateEdgeId } from '../utils/idGenerator';
import { getBestHandles } from '../utils/handleUtils';
import { autoLayout } from '../utils/layoutGraph';
import { generateConfig as generateNginxConfig } from '../engine/configGenerator';
import { VALID_CONNECTIONS } from '../types/edges';

function readPersistedTheme(): 'light' | 'dark' {
  try {
    const v = localStorage.getItem('flowinx-theme');
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function persistTheme(theme: 'light' | 'dark') {
  try { localStorage.setItem('flowinx-theme', theme); } catch { /* noop */ }
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],

  deleteMode: false,
  toggleDeleteMode: () => set({ deleteMode: !get().deleteMode }),

  panelCollapsed: false,
  panelPinned: false,
  panelTab: 'config' as const,
  configMode: 'conf.d' as const,
  setPanelCollapsed: (v) => set({ panelCollapsed: v }),
  setPanelPinned: (v) => set({ panelPinned: v }),
  setPanelTab: (v) => set({ panelTab: v }),
  setConfigMode: (v) => set({ configMode: v }),

  // 主题状态（localStorage 持久化）
  theme: readPersistedTheme(),
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    persistTheme(next);
    set({ theme: next });
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes as Node[]) as Node<NodeData>[] });
  },

  onEdgesChange: (changes) => {
    const next = applyEdgeChanges(changes, get().edges as Edge[]) as Edge<GraphEdgeData>[];
    const sid = get().selectedEdgeId;
    set({ edges: next, selectedEdgeId: sid && next.some((e) => e.id === sid) ? sid : null });
  },

  onConnect: (connection) => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return;
    if (connection.source === connection.target) return;

    const validTargets = VALID_CONNECTIONS[sourceNode.type as NodeType] ?? [];
    if (!validTargets.includes(targetNode.type as NodeType)) return;

    const exists = get().edges.some(
      (e) => e.source === connection.source && e.target === connection.target
    );
    if (exists) return;

    // 用户手动拖了哪个把手就尊重用户选择，没指定（loose 模式）才自动计算
    const handles = getBestHandles(sourceNode.position, targetNode.position);

    const newEdge: Edge<GraphEdgeData> = {
      ...connection,
      id: generateEdgeId(),
      type: 'bezier',
      sourceHandle: connection.sourceHandle || handles.sourceHandle,
      targetHandle: connection.targetHandle || handles.targetHandle,
      data: { label: '', order: 0 },
    };
    set({ edges: [...get().edges, newEdge] });
  },

  selectedNodeId: null,
  selectedEdgeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  addNode: (type, position) => {
    const defaults = NODE_DEFAULTS[type] ?? {};
    const newNode: Node<NodeData> = {
      id: generateId(),
      type,
      position,
      data: { ...defaults } as NodeData,
    };
    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: newNode.id,
    });
  },

  removeNode: (id) => {
    const nextEdges = get().edges.filter((e) => e.source !== id && e.target !== id);
    const sid = get().selectedEdgeId;
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: nextEdges,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
      selectedEdgeId: sid && nextEdges.some((e) => e.id === sid) ? sid : null,
    });
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    });
  },

  removeEdge: (id) => {
    set({ edges: get().edges.filter((e) => e.id !== id) });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null, generatedConfig: null, configErrors: [] });
  },

  loadGraph: (nodes, edges) => {
    const laidOut = autoLayout(nodes, edges);
    set({ nodes: laidOut, edges, selectedNodeId: null, selectedEdgeId: null, generatedConfig: null, configErrors: [] });
  },

  generatedConfig: null,
  configErrors: [],

  generateConfig: () => {
    const { nodes, edges, configMode } = get();
    try {
      const result = generateNginxConfig(nodes, edges, configMode);
      set({ generatedConfig: result.config, configErrors: result.errors });
    } catch (err) {
      set({
        generatedConfig: null,
        configErrors: [{
          nodeId: 'store',
          severity: 'error',
          message: `配置生成失败: ${err instanceof Error ? err.message : String(err)}`,
        }],
      });
    }
  },
}));
