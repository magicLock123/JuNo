import request from '@/request'
import type { ApiResponse, PageResult, Order } from '@/types'

const useRealAPI = true 

export const dispatchApi = {
  getList: async (params: { page: number; size: number }): Promise<ApiResponse<PageResult<Order>>> => {
    if (useRealAPI) {
      return request.get('/manager/order/findAll', { params })
    }
    return { 
      code: 200, 
      message: 'success',
      data: { records: [], total: 0, pages: 0, current: 1, size: 10 } 
    } as any
  },

  assignToPlayer: async (orderSn: string, playerId: number): Promise<ApiResponse<any>> => {
    if (useRealAPI) {
      return request.put('/manager/order/update', { orderSn, playerId })
    }
    return { code: 500, data: false, message: '操作失败' } as any
  },

  sendToHall: async (orderSn: string): Promise<ApiResponse<any>> => {
    if (useRealAPI) {
      return request.put('/manager/order/update', { orderSn, status: 'pending', playerId: null })
    }
    return { code: 404, data: false, message: '订单未找到' } as any
  },

  createOrder: async (data: any): Promise<ApiResponse<any>> => {
    if (useRealAPI) {
      return request.post('/manager/order/create', data)
    }
    return { code: 200, data: true, message: '创建成功' } as any
  }
}