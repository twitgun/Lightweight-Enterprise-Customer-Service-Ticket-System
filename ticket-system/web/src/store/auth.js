import { defineStore } from 'pinia'
import { api } from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('ts_token') || '',
    user: JSON.parse(localStorage.getItem('ts_user') || 'null')
  }),
  getters: {
    isLogin: (s) => !!s.token,
    role: (s) => s.user?.role || ''
  },
  actions: {
    setAuth(data) {
      this.token = data.token
      this.user = data.user
      localStorage.setItem('ts_token', data.token)
      localStorage.setItem('ts_user', JSON.stringify(data.user))
    },
    async login(form) {
      const data = await api.login(form)
      this.setAuth(data)
      return data
    },
    async register(form) {
      const data = await api.register(form)
      this.setAuth(data)
      return data
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('ts_token')
      localStorage.removeItem('ts_user')
    }
  }
})
