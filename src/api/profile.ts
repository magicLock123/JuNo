import request from '@/request'
import type { ApiResponse, Order } from '@/types'

const useRealAPI = true

export const profileApi = {
  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    return request.get('/player/order/my-ongoing')
  },

  getMyInfo: async (params?: { startDate?: string, endDate?: string }): Promise<ApiResponse<any>> => {
    return request.get('/player/flow', { params })
  }
}