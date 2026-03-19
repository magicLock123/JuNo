import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: localStorage.getItem('juno_username') || '',
    role: localStorage.getItem('juno_role') || '', 
    token: localStorage.getItem('juno_token') || '',
    isLogin: !!localStorage.getItem('juno_token'), 
    isNewbieFinished: true,
    userInfo: JSON.parse(localStorage.getItem('juno_userInfo') || '{}')
  }),
  
  actions: {
    loginSuccess(backendData: any) {
      this.token = backendData.token
      this.username = backendData.userInfo.nickname || '未知用户'
      this.isLogin = true
      this.userInfo = backendData.userInfo

      if (backendData.role === 'player') {
        this.role = 'Mercenary'
      } else if (backendData.role === 'admin') {
        this.role = 'Admin'
      } else if (backendData.role === 'cs') {
        this.role = 'Dispatcher'
      } else {
        this.role = backendData.role
      }

      localStorage.setItem('juno_token', this.token)
      localStorage.setItem('juno_role', this.role)
      localStorage.setItem('juno_username', this.username)
      localStorage.setItem('juno_userInfo', JSON.stringify(this.userInfo))
    },

    setRole(role: 'Admin' | 'Mercenary' | 'Dispatcher') {
      this.role = role
      localStorage.setItem('juno_role', role)
    },

    logout() {
      this.isLogin = false
      this.token = ''
      this.role = ''
      this.username = ''
      this.userInfo = {}
      localStorage.clear() 
      console.log('用户已登出，状态已重置')
    }
  }
})