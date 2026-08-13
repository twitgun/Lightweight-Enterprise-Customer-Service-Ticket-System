import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const http = axios.create({
  baseURL: 'http://127.0.0.1:3000/api/v1',
  timeout: 15000
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ts_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const status = err.response?.status
    const msg = err.response?.data?.message || '请求失败，请稍后重试'
    if (status === 401) {
      localStorage.removeItem('ts_token')
      localStorage.removeItem('ts_user')
      if (router.currentRoute.value.path !== '/login') router.push('/login')
    }
    ElMessage.error(Array.isArray(msg) ? msg.join('；') : msg)
    return Promise.reject(err)
  }
)

export default http
