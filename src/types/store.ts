import type { Node, Edge, OnNodesChange, OnEdgesChange, OnConnect } from '@xyflow/react';
import type { NodeData, NodeType } from './nodes';
import type { GraphEdgeData } from './edges';

export interface ConfigError {
  nodeId: string;
  severity: 'error' | 'warning';
  message: string;
}

export interface AppState {
  nodes: Node<NodeData>[];
  edges: Edge<GraphEdgeData>[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setSelectedNode: (id: string | null) => void;
  setSelectedEdge: (id: string | null) => void;

  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  removeEdge: (id: string) => void;

  clearCanvas: () => void;
  loadGraph: (nodes: Node<NodeData>[], edges: Edge<GraphEdgeData>[]) => void;

  deleteMode: boolean;
  toggleDeleteMode: () => void;

  panelCollapsed: boolean;
  panelPinned: boolean;
  panelTab: 'config' | 'output';
  configMode: 'main' | 'conf.d';
  setPanelCollapsed: (v: boolean) => void;
  setPanelPinned: (v: boolean) => void;
  setPanelTab: (v: 'config' | 'output') => void;
  setConfigMode: (v: 'main' | 'conf.d') => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  generatedConfig: string | null;
  configErrors: ConfigError[];
  generateConfig: () => void;
}
