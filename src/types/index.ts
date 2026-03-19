export interface ApiResponse<T = any> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  pages?: number;
  current?: number;
  size?: number;
}

export interface Order {
  id: number;
  orderSn: string;
  gameName: string;
  orderType: number;
  projectContent: string;
  amount: number;
  playerAmount: number;
  positionNote: string;
  status: string;
  createdAt: string;
  acceptedAt: string;
  finishedAt: string;
  isDouble: string;
  cs?: { id: number; nickname: string; role: string };
  player?: { id: number; nickname: string; role: string };
  playerId2?: { id: number; nickname: string; role: string };
}

export interface Player {
  id: number;
  nickname: string;
  username?: string;
  role: string;
  isTrained: number;
  canTakeOrder: number;
  partnerId: number | null;
  revenue?: number;
  todayOrders?: number;
  level: number;
}

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' };
  return map[level] ?? '未知';
}