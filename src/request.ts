import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import router from '@/router'

export interface Result<T = any> {
  code: number;
  msg?: string;  
  message?: string;
  data: T;
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api', 
  timeout: 10000, 
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    const token = userStore.token 

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data

    if (res.code !== 200) {
      ElMessage.error(res.msg || res.message || '系统未知错误')
      return Promise.reject(new Error(res.msg || res.message || 'Error'))
    } else {
      return res as any
    }
  },
  (error: AxiosError) => {
    let message = ''
    const status = error.response?.status

    switch (status) {
      case 401:
        message = '登录已过期或Token无效，请重新登录'
        const userStore = useUserStore()
        userStore.logout() 
        router.push('/login')
        break
      case 403:
        message = '权限不足，拒绝访问'
        break
      default:
        message = error.message || '网络连接异常'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service