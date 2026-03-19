import request from '@/request'
// 移除 Mock 依赖，直接对接后端
import type { ApiResponse, PageResult, Order } from '@/types'

const useRealAPI = true

export const dashboardApi = {
  /**
   * 抢单大厅：获取所有待接单订单
   * 对接后端: GET /player/order/pending
   */
getHallOrders: async (params: { page: number; size: number; level?: number | ''; gameZone?: string }): Promise<ApiResponse<PageResult<Order>>> => {
    const res: any = await request.get('/player/order/pending')
    
    let allRecords = res.data || []
    
    // ✨ 新增：在前端模拟分页前，先进行等级筛选
    if (params.level !== undefined && params.level !== '') {
      allRecords = allRecords.filter((order: any) => order.orderType === params.level)
    }

    if (params.gameZone) {
      allRecords = allRecords.filter((order: any) => order.gameName === params.gameZone)
    }
    
    const start = (params.page - 1) * params.size
    
    return {
      code: res.code,
      msg: res.msg,
      data: {
        records: allRecords.slice(start, start + params.size),
        total: allRecords.length
      }
    }
  },

  /**
   * 普通抢单 (单护或补位)
   * 对接后端: POST /player/order/grab
   * 载荷要求: OrderGrabDTO { orderSn }
   */
  grabOrder: async (orderSn: string): Promise<ApiResponse<any>> => {
    return request.post('/player/order/grab', { orderSn })
  },

  /**
   * 双护航抢单后的模式确认 (理论三个参数已全部接入)
   * 对接后端: POST /player/order/confirm-double
   * 载荷要求: OrderConfirmDTO { orderSn, actionType, partnerId }
   */
  grabDoubleOrder: async (
    orderSn: string,
    doubleType: 'random' | 'partner',
    partnerId?: number | null
  ): Promise<ApiResponse<any>> => {
    const actionType = doubleType === 'partner' ? 'ASSIGN_PARTNER' : 'WAIT_OTHER'

    return request.post('/player/order/confirm-double', {
      orderSn,
      actionType,
      partnerId: doubleType === 'partner' ? partnerId : null
    })
  }
}