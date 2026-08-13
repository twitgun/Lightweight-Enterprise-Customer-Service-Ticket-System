import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', component: () => import('../views/Home.vue'), meta: { title: '工作台' } },
      { path: 'tickets/new', component: () => import('../views/customer/CreateTicket.vue'), meta: { title: '提交工单', roles: ['customer'] } },
      { path: 'tickets', component: () => import('../views/TicketList.vue'), meta: { title: '工单列表' } },
      { path: 'tickets/:id', component: () => import('../views/TicketDetail.vue'), meta: { title: '工单详情' } },
      { path: 'faqs', component: () => import('../views/FaqList.vue'), meta: { title: '常见问题' } },
      { path: 'bulletins', component: () => import('../views/BulletinList.vue'), meta: { title: '公告' } },
      { path: 'ask', component: () => import('../views/CustomerAsk.vue'), meta: { title: '智能问答' } },
      { path: 'manager/users', component: () => import('../views/manager/Users.vue'), meta: { title: '账号管理', roles: ['manager'] } },
      { path: 'manager/categories', component: () => import('../views/manager/Categories.vue'), meta: { title: '工单分类', roles: ['manager'] } },
      { path: 'manager/faqs', component: () => import('../views/manager/Faqs.vue'), meta: { title: '常见问题管理', roles: ['manager'] } },
      { path: 'manager/bulletins', component: () => import('../views/manager/Bulletins.vue'), meta: { title: '公告管理', roles: ['manager'] } },
      { path: 'manager/phrases', component: () => import('../views/manager/Phrases.vue'), meta: { title: '快捷回复', roles: ['manager'] } },
      { path: 'manager/system', component: () => import('../views/manager/System.vue'), meta: { title: '系统设置', roles: ['manager'] } },
      { path: 'manager/channels', component: () => import('../views/manager/Channels.vue'), meta: { title: '接入渠道', roles: ['manager'] } },
      { path: 'manager/forms', component: () => import('../views/manager/Forms.vue'), meta: { title: '表单配置', roles: ['manager'] } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const token = localStorage.getItem('ts_token')
  if (!token && to.path !== '/login' && to.path !== '/register') return '/login'
  if (token && (to.path === '/login' || to.path === '/register')) return '/home'
  const user = JSON.parse(localStorage.getItem('ts_user') || 'null')
  const roles = to.meta.roles
  if (roles && (!user || !roles.includes(user.role))) return '/home'
  return true
})

export default router
