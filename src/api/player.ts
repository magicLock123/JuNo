import request from '@/request'
import type { ApiResponse, Player } from '@/types'

const useRealAPI = true

export const playerApi = {
  // 查询打手列表
  getList: async (): Promise<ApiResponse<Player[]>> => {
    return request.get('/manager/user/list')
  },

  // 招募新打手
  createPlayer: async (data: any): Promise<ApiResponse<boolean>> => {
    return request.post('/manager/user/create', data)
  },

  // 修改打手资料
  updatePlayer: async (data: any): Promise<ApiResponse<boolean>> => {
    return request.put(`/manager/user/update`, data) 
  },

  // 绑定搭档
  bindPartner: async (player1Id: number, player2Id: number): Promise<ApiResponse<any>> => {
    return request.post('/manager/partner/bind', { player1Id, player2Id })
  },

  // 解绑搭档
  unbindPartner: async (player1Id: number): Promise<ApiResponse<any>> => {
    return request.post('/manager/partner/unbind', { player1Id })
  }
}