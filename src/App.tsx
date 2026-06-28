// ====== 主布局（右侧面板可拖拽调整宽度） ======

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/sidebar/Sidebar';
import { FlowCanvas } from './components/canvas/FlowCanvas';
import { RightPanel } from './components/panels/right/RightPanel';

const MIN_W = 340, MAX_W = 600;

function App() {
  const theme = useStore((s) => s.theme);
  const panelCollapsed = useStore((s) => s.panelCollapsed);
  const setPanelCollapsed = useStore((s) => s.setPanelCollapsed);
  const [panelWidth, setPanelWidth] = useState(() =>
    window.innerWidth < 768 ? window.innerWidth * 0.85 : 360
  );
  const [resizing, setResizing] = useState(false);
  const [edgeHover, setEdgeHover] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  // 主题生效
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    return () => document.documentElement.classList.remove('dark');
  }, [theme]);

  // 拖拽开始
  const beginResize = useCallback((clientX: number) => {
    dragging.current = true;
    startX.current = clientX;
    startW.current = panelWidth;
    setResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  const EDGE = 3;

  const inEdgeZone = (clientX: number, rect: DOMRect) =>
    clientX >= rect.left - EDGE && clientX <= rect.left + EDGE;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!inEdgeZone(e.clientX, e.currentTarget.getBoundingClientRect())) return;
    e.preventDefault();
    beginResize(e.clientX);
  }, [beginResize]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (!inEdgeZone(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())) return;
    e.preventDefault();
    beginResize(e.touches[0].clientX);
  }, [beginResize]);

  const onPanelMouseMove = useCallback((e: React.MouseEvent) => {
    setEdgeHover(inEdgeZone(e.clientX, e.currentTarget.getBoundingClientRect()));
  }, []);
  const onPanelMouseLeave = useCallback(() => setEdgeHover(false), []);

  // 拖拽中：直接操作 DOM，避免 React 重渲染卡顿
  useEffect(() => {
    const onMove = (clientX: number) => {
      if (!dragging.current || !panelRef.current) return;
      const dx = startX.current - clientX;
      const w = Math.min(MAX_W, Math.max(MIN_W, startW.current + dx));
      panelRef.current.style.width = Math.min(w, window.innerWidth * 0.85) + 'px';
    };
    const onEnd = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      // 同步最终宽度到 state
      if (panelRef.current) {
        const w = parseFloat(panelRef.current.style.width);
        if (!isNaN(w)) setPanelWidth(w);
      }
      setResizing(false);
    };

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientX); };
    const onMouseUp = () => onEnd();
    const onTouchEnd = () => onEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />

        <FlowCanvas />

        {/* 右侧面板 — border-l 为分割线，::before 向左延伸隐形拖拽检测区 */}
        <div
          ref={panelRef}
          style={{ width: Math.min(panelCollapsed ? 4 : panelWidth, window.innerWidth * 0.85) }}
          className={`shrink-0 overflow-hidden h-full panel-edge ${edgeHover ? 'edge-hover' : ''}
            ${panelCollapsed ? '' : 'border-l border-gray-200 dark:border-white/10'}
            transition-[border-color,box-shadow] duration-150 ease-out
            ${resizing ? '' : 'transition-[width] duration-200'}`}
          onMouseDown={panelCollapsed ? undefined : onMouseDown}
          onTouchStart={panelCollapsed ? undefined : onTouchStart}
          onMouseMove={onPanelMouseMove}
          onMouseLeave={onPanelMouseLeave}
          onDoubleClick={() => setPanelCollapsed(!panelCollapsed)}
          title={panelCollapsed ? '双击展开面板' : '双击折叠面板 · 拖拽调整宽度'}
        >
          {!panelCollapsed && <RightPanel />}
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
