import request from '@/request' 
import type { ApiResponse } from '@/types'

export interface DashboardStats {
  totalRevenue: number;   
  activePlayers: number;  
  totalPlayers: number;   
  pendingOrders: number;  
  todayOrders: number;  
}

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return {
      code: 200,
      msg: 'success',
      data: {
        totalRevenue: 0.00,
        activePlayers: 0,
        totalPlayers: 0,
        pendingOrders: 0,
        todayOrders: 0
      }
    } as any
  },

  getRecentActivity: async (): Promise<ApiResponse<any[]>> => {
    try {
      const res: any = await request.get('/manager/order/findAll', { 
        params: { page: 1, size: 5 } 
      })
      
      return {
        code: res.code,
        msg: res.msg,
        data: res.data?.records || []
      } as any
    } catch (error) {
      return { code: 500, msg: '获取动态失败', data: [] } as any
    }
  }
}