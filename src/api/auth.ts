import request from '@/request'
import type { ApiResponse } from '@/types'

export const authApi = {
  login: async (data: any): Promise<ApiResponse<any>> => {
    return request.post('/user/login', data)
  }
}