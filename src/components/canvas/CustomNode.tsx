import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Lock, CircleCheck, Ban, ArrowRightLeft, Folder, ShieldBan, CornerDownRight } from 'lucide-react';
import type { NodeData, NodeType, ServerData, LocationData, UpstreamData, BackendData, StaticData, CacheData, AuthData, RateLimitData, MapData } from '../../types/nodes';
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
  const deleteMode = useStore((s) => s.deleteMode);
  const [hovered, setHovered] = useState(false);

  const isDeleteTarget = deleteMode && hovered;

  return (
    <div
      onClick={() => setSelectedNode(id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${isDeleteTarget ? 'bg-red-50 dark:bg-red-950/50 border-red-400 dark:border-red-500' : `${colors.bg} ${colors.border}`} border-2 rounded-lg shadow-sm w-[180px] transition-all duration-150 ${selected ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-neutral-800 shadow-md' : ''} ${isDeleteTarget ? 'ring-2 ring-red-400 dark:ring-red-500 ring-offset-1 dark:ring-offset-neutral-800' : ''}`}
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
            {((data as ServerData).root || (data as ServerData).index || (data as ServerData).gzip || (data as ServerData).http2) && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 truncate flex items-center gap-1 flex-wrap">
                {[(data as ServerData).root && `root`, (data as ServerData).index && `index`, (data as ServerData).http2 && 'HTTP/2', (data as ServerData).gzip && 'Gzip'].filter(Boolean).join(' · ')}
              </p>
            )}
          </>
        ) : nodeType === 'location' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate flex items-center justify-between">
              {(data as LocationData).path}
              <span className="shrink-0 ml-1">
                {(data as LocationData).mode === 'proxy' && <ArrowRightLeft size={12} className="text-purple-500" />}
                {(data as LocationData).mode === 'static' && <Folder size={12} className="text-amber-500" />}
                {(data as LocationData).mode === 'block' && <ShieldBan size={12} className="text-red-500" />}
                {(data as LocationData).mode === 'redirect' && <CornerDownRight size={12} className="text-cyan-500" />}
              </span>
            </p>
            {(data as LocationData).mode === 'proxy' && (data as LocationData).proxyPass && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">→ {(data as LocationData).proxyPass}</p>
            )}
            {(data as LocationData).mode === 'static' && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">静态资源</p>
            )}
            {(data as LocationData).mode === 'block' && (
              <p className="text-xs text-red-500 dark:text-red-400 truncate">禁止 ({(data as LocationData).blockStatus || 403})</p>
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
        ) : nodeType === 'static' ? (
          <>
            {(data as StaticData).root && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">root {(data as StaticData).root}</p>
            )}
            {(data as StaticData).index && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">index {(data as StaticData).index}</p>
            )}
            {(data as StaticData).tryFiles && (
              <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">try {(data as StaticData).tryFiles}</p>
            )}
            {(data as StaticData).expires && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 truncate">缓存 {(data as StaticData).expires}</p>
            )}
          </>
        ) : nodeType === 'cache' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as CacheData).zone}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">缓存 {(data as CacheData).time} · 最大 {(data as CacheData).maxSize}</p>
          </>
        ) : nodeType === 'auth' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">
              {{ basic: 'Basic', request: '子请求', jwt: 'JWT' }[(data as AuthData).authType] || '认证'}
            </p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
              {(data as AuthData).authType === 'basic' && (data as AuthData).userFile}
              {(data as AuthData).authType === 'request' && (data as AuthData).authUrl}
              {(data as AuthData).authType === 'jwt' && ((data as AuthData).jwtClaim || 'JWT')}
            </p>
          </>
        ) : nodeType === 'rate_limit' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as RateLimitData).rate}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">burst {(data as RateLimitData).burst}{' '}{(data as RateLimitData).nodelay ? 'nodelay' : ''}</p>
          </>
        ) : nodeType === 'map' ? (
          <>
            <p className="text-sm font-medium text-gray-800 dark:text-neutral-100 truncate">{(data as MapData).source}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">→ {(data as MapData).target}</p>
          </>
        ) : (
          <p className="text-xs text-gray-500 dark:text-neutral-400">未知类型</p>
        )}
      </div>
      {/* 每边 target + source 完全重叠（target 在下用于边路径计算，source 在上用于拖拽连线），视觉上每个边只有一个点 */}
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2.5 !h-2.5 !bg-gray-400 dark:!bg-neutral-500 !border-2 !border-white dark:!border-neutral-800" />
    </div>
  );
});
