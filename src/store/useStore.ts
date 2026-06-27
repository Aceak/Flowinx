import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import type { NodeData, NodeType } from '../types/nodes';
import type { GraphEdgeData } from '../types/edges';
import type { AppState, ConfigError } from '../types/store';
import { NODE_DEFAULTS } from '../constants/nodeDefaults';
import { generateId, generateEdgeId } from '../utils/idGenerator';
import { generateConfig as generateNginxConfig } from '../engine/configGenerator';
import { VALID_CONNECTIONS } from '../types/edges';

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[] });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<GraphEdgeData>[] });
  },

  onConnect: (connection) => {
    const { nodes } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (!sourceNode || !targetNode) return;

    const validTargets = VALID_CONNECTIONS[sourceNode.type as NodeType] ?? [];
    if (!validTargets.includes(targetNode.type as NodeType)) return;

    const newEdge: Edge<GraphEdgeData> = {
      ...connection,
      id: generateEdgeId(),
      type: 'bezier',
      data: { label: '', order: 0 },
    };
    set({ edges: [...get().edges, newEdge] });
  },

  selectedNodeId: null,
  setSelectedNode: (id) => set({ selectedNodeId: id }),

  addNode: (type, position) => {
    const defaults = NODE_DEFAULTS[type] ?? {};
    const newNode: Node<NodeData> = {
      id: generateId(),
      type, // domain type: 'server' | 'location' | 'upstream' | 'backend'
      position,
      data: { ...defaults } as NodeData,
    };
    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: newNode.id,
    });
  },

  removeNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
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
    set({ nodes: [], edges: [], selectedNodeId: null, generatedConfig: null, configErrors: [] });
  },

  loadGraph: (nodes, edges) => {
    set({ nodes, edges, selectedNodeId: null, generatedConfig: null, configErrors: [] });
  },

  generatedConfig: null,
  configErrors: [],

  generateConfig: () => {
    const { nodes, edges } = get();
    const result = generateNginxConfig(nodes, edges);
    set({
      generatedConfig: result.config,
      configErrors: result.errors as ConfigError[],
    });
  },

  activeTab: 'config',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
