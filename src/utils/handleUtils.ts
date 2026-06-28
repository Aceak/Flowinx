const NODE_W = 180, NODE_H = 84;

export function getBestHandles(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
): { sourceHandle: string; targetHandle: string } {
  const scx = sourcePos.x + NODE_W / 2;
  const scy = sourcePos.y + NODE_H / 2;
  const tcx = targetPos.x + NODE_W / 2;
  const tcy = targetPos.y + NODE_H / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  // 根据节点中心偏移决定用上下还是左右
  if (Math.abs(dy) >= Math.abs(dx)) {
    // 纵向连接
    return dy > 0
      ? { sourceHandle: 'bottom-source', targetHandle: 'top-target' }   // 目标在下方
      : { sourceHandle: 'top-source', targetHandle: 'bottom-target' };   // 目标在上方
  } else {
    // 横向连接
    return dx > 0
      ? { sourceHandle: 'right-source', targetHandle: 'left-target' }    // 目标在右侧
      : { sourceHandle: 'left-source', targetHandle: 'right-target' };   // 目标在左侧
  }
}
