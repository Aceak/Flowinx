// 简单的 ID 生成器
let counter = 0;

export function generateId(): string {
  counter++;
  return `node_${Date.now()}_${counter}`;
}

export function generateEdgeId(): string {
  counter++;
  return `edge_${Date.now()}_${counter}`;
}
