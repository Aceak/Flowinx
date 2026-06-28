// ====== 主布局（右侧面板可拖拽调整宽度） ======

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/sidebar/Sidebar';
import { FlowCanvas } from './components/canvas/FlowCanvas';
import { RightPanel } from './components/panels/right/RightPanel';

function App() {
  const theme = useStore((s) => s.theme);
  const [panelWidth, setPanelWidth] = useState(360);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // 主题生效：在 document.documentElement 上切换 dark class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [theme]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [panelWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = startX.current - e.clientX;
      setPanelWidth(Math.min(600, Math.max(260, startWidth.current + dx)));
    };
    const onMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 dark:bg-neutral-950">
        <Sidebar />

        <FlowCanvas />

        {/* 可拖拽的分隔条 — 点击区 8px，视觉线 1px */}
        <div
          onMouseDown={onMouseDown}
          className="w-2 cursor-col-resize shrink-0 flex justify-center group"
          title="拖动调整宽度"
        >
          <div className="w-px h-full bg-gray-300 dark:bg-neutral-600 group-hover:bg-blue-400 transition-colors" />
        </div>

        {/* 右侧面板，宽度可调，限制最大不超过视口 60% */}
        <div style={{ width: Math.min(panelWidth, window.innerWidth * 0.65) }} className="shrink-0 overflow-hidden">
          <RightPanel />
        </div>
      </div>
    </ReactFlowProvider>
  );
}

export default App;
