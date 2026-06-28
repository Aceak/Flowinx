import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, CircleCheck, Ban } from 'lucide-react';
import type { NodeData, NodeType, ServerData, LocationData, UpstreamData, BackendData, RedirectData, StaticData } from '../../types/nodes';
import { NodeIcon } from './NodeIcon';
import { NODE_COLORS } from '../../constants/colors';
import { NODE_LABELS } from '../../constants/labels';
import { useStore } from '../../store/useStore';

interface CustomNodeProps { id: string; type: string; data: NodeData; selected: boolean; }

export const CustomNode = memo(function CustomNode({ id, type, data, selected }: CustomNodeProps) {
  const nodeType = type as NodeType;
  const colors = NODE_COLORS[nodeType] ?? NODE_COLORS['server'];
  const label = (data as { label: string }).label || NODE_LABELS[nodeType] || '';
  const setSelectedNode = useStore((s) => s.setSelectedNode);

  return (
    <div
      onClick={() => setSelectedNode(id)}
      className={`${colors.bg} ${colors.border} border-2 rounded-lg shadow-sm w-[180px] transition-all duration-200 cursor-pointer ${selected ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-neutral-800 shadow-md' : ''}`}
    >
      <div className={`${colors.badge} text-white px-2.5 py-1 rounded-t-md flex items-center gap-1.5 text-xs font-medium`}>
        <NodeIcon type={nodeType} size={13} />
        <span>{label}</span>
      </div>
      <div className="px-2.5 pt-1 pb-2 leading-relaxed flex flex-col justify-center" style={{ minHeight: 60 }}>
        {nodeType === 'server' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as ServerData).serverName}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate flex items-center gap-1">
              {(data as ServerData).ssl ? 'https' : 'http'}://{(data as ServerData).listenAddr || '0.0.0.0'}:{(data as ServerData).port}
              {(data as ServerData).ssl && <Lock size={10} className="text-gray-400 dark:text-neutral-500 shrink-0" />}
            </p>
          </>
        ) : nodeType === 'location' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as LocationData).path}</p>
            {(data as LocationData).mode === 'proxy' && (data as LocationData).proxyPass && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">→ {(data as LocationData).proxyPass}</p>
            )}
            {(data as LocationData).mode === 'static' && (data as LocationData).root && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{(data as LocationData).root}</p>
            )}
            {(data as LocationData).mode === 'block' && (
              <p className="text-xs text-red-500 dark:text-red-400 truncate">禁止访问 ({(data as LocationData).blockStatus || 403})</p>
            )}
            {((data as LocationData).allow || (data as LocationData).deny) && (
              <p className="text-xs truncate mt-0.5 flex items-center gap-1.5">
                {(data as LocationData).allow && (
                  <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                    <CircleCheck size={10} />{(data as LocationData).allow.split('\n').filter(Boolean).join(', ')}
                  </span>
                )}
                {(data as LocationData).deny && (
                  <span className="flex items-center gap-0.5 text-red-500 dark:text-red-400">
                    <Ban size={10} />{(data as LocationData).deny.split('\n').filter(Boolean).join(', ')}
                  </span>
                )}
              </p>
            )}
          </>
        ) : nodeType === 'upstream' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as UpstreamData).name}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
              {{ 'round-robin': '轮询', 'least-conn': '最少连接', 'ip-hash': 'IP哈希' }[(data as UpstreamData).strategy] || (data as UpstreamData).strategy}
              {typeof (data as UpstreamData).keepalive === 'number' && (data as UpstreamData).keepalive > 0 ? ` · ${(data as UpstreamData).keepalive}连接` : ''}
            </p>
          </>
        ) : nodeType === 'backend' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as BackendData).address}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
              {[
                (data as BackendData).weight > 1 ? `权重${(data as BackendData).weight}` : '',
                (data as BackendData).maxFails > 0 ? `最多失败${(data as BackendData).maxFails}次` : '',
                (data as BackendData).backup ? '备用' : '',
              ].filter(Boolean).join(' · ') || ''}
            </p>
          </>
        ) : nodeType === 'redirect' ? (
          <>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">http://{(data as RedirectData).fromDomain}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">→ {(data as RedirectData).toUrl}</p>
          </>
        ) : nodeType === 'static' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as StaticData).path}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">{(data as StaticData).root}</p>
            {(data as StaticData).expires && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 truncate">缓存 {(data as StaticData).expires}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-neutral-400">未知类型</p>
        )}
      </div>
      <Handle type="target" position={Position.Top} id="top" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="target" position={Position.Left} id="left" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Right} id="right" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
    </div>
  );
});
