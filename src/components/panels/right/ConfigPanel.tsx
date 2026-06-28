import { useStore } from '../../../store/useStore';
import { NODE_LABELS } from '../../../constants/labels';
import { NodeIcon } from '../../canvas/NodeIcon';
import type { NodeType, NodeData } from '../../../types/nodes';
import { ServerBlockForm } from './forms/ServerBlockForm';
import { LocationForm } from './forms/LocationForm';
import { UpstreamForm } from './forms/UpstreamForm';
import { BackendServerForm } from './forms/BackendServerForm';
import { StaticForm } from './forms/StaticForm';
import { CacheForm } from './forms/CacheForm';
import { AuthForm } from './forms/AuthForm';
import { RateLimitForm } from './forms/RateLimitForm';
import { MapForm } from './forms/MapForm';
import { Trash2, X } from 'lucide-react';

function renderForm(type: NodeType, data: NodeData, onChange: (d: Partial<NodeData>) => void) {
  switch (type) {
    case 'server':   return <ServerBlockForm data={data as never} onChange={onChange as never} />;
    case 'location': return <LocationForm data={data as never} onChange={onChange as never} />;
    case 'upstream': return <UpstreamForm data={data as never} onChange={onChange as never} />;
    case 'backend':  return <BackendServerForm data={data as never} onChange={onChange as never} />;
    case 'static':   return <StaticForm data={data as never} onChange={onChange as never} />;
    case 'cache':      return <CacheForm data={data as never} onChange={onChange as never} />;
    case 'auth':       return <AuthForm data={data as never} onChange={onChange as never} />;
    case 'rate_limit': return <RateLimitForm data={data as never} onChange={onChange as never} />;
    case 'map':        return <MapForm data={data as never} onChange={onChange as never} />;
    default: return <p className="text-sm text-gray-500 dark:text-neutral-400">未知节点类型</p>;
  }
}

export function ConfigPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const nodes = useStore((s) => s.nodes);
  const updateNodeData = useStore((s) => s.updateNodeData);
  const removeNode = useStore((s) => s.removeNode);
  const setSelectedNode = useStore((s) => s.setSelectedNode);

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-neutral-500 text-sm p-4 text-center">
        <div>
          <p className="text-lg mb-1">从左侧拖入节点</p>
          <p className="text-xs">然后在这里填写配置</p>
        </div>
      </div>
    );
  }

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) { setSelectedNode(null); return null; }

  const nodeType = node.type as NodeType;
  const label = NODE_LABELS[nodeType] || nodeType;

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 shrink-0 min-h-[40px] text-gray-700 dark:text-neutral-300">
        <div className="flex items-center gap-1.5">
          <NodeIcon type={nodeType} size={14} />
          <span className="text-sm font-semibold">{label} 属性</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => removeNode(node.id)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400" title="删除">
            <Trash2 size={14} />
          </button>
          <button onClick={() => setSelectedNode(null)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 dark:text-neutral-500 hover:text-gray-600 dark:hover:text-neutral-300" title="关闭">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {renderForm(nodeType, node.data, (partial) => updateNodeData(node.id, partial))}
      </div>
    </div>
  );
}
