<template>
  <el-container class="layout">
    <el-aside :width="collapsed ? '68px' : '236px'" class="aside">
      <div class="logo" @click="$router.push('/home')">
        <div class="logo-mark">
          <el-icon :size="22"><Headset /></el-icon>
        </div>
        <span v-if="!collapsed" class="logo-text">{{ $t('app.name') }}</span>
      </div>
      <el-scrollbar class="menu-scroll">
        <el-menu
          :default-active="activeMenu"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="side-menu"
        >
          <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ $t(item.titleKey) }}</template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
      <div class="collapse-btn" @click="collapsed = !collapsed">
        <el-icon><component :is="collapsed ? 'Expand' : 'Fold'" /></el-icon>
      </div>
    </el-aside>

    <el-container class="right">
      <el-header class="header">
        <div class="header-title">{{ pageTitle }}</div>
        <div class="header-right">
          <el-tooltip :content="isDark ? '浅色模式' : '深色模式'" placement="bottom">
            <button class="icon-btn" @click="toggleDark">
              <el-icon :size="18"><component :is="isDark ? 'Sunny' : 'Moon'" /></el-icon>
            </button>
          </el-tooltip>
          <el-select v-model="lang" size="small" class="lang-select" @change="switchLang">
            <el-option label="中文" value="zh" />
            <el-option label="EN" value="en" />
          </el-select>
          <el-dropdown trigger="click">
            <el-badge :value="unread" :hidden="unread === 0" :max="99">
              <button class="icon-btn"><el-icon :size="18"><Bell /></el-icon></button>
            </el-badge>
            <template #dropdown>
              <div class="notif-panel">
                <div class="notif-head">
                  <b>{{ $t('notif.title') }}</b>
                  <el-button link type="primary" size="small" @click.stop="markAllRead">{{ $t('notif.markAll') }}</el-button>
                </div>
                <el-scrollbar max-height="320px">
                  <div v-for="n in notifList" :key="n.id" class="notif-item" :class="{ unread: !n.isRead }" @click="openNotif(n)">
                    <div class="notif-title">{{ n.title }}</div>
                    <div class="notif-content">{{ n.content }}</div>
                    <div class="notif-time">{{ fmtTime(n.createdAt) }}</div>
                  </div>
                  <el-empty v-if="!notifList.length" :description="$t('notif.empty')" :image-size="50" />
                </el-scrollbar>
              </div>
            </template>
          </el-dropdown>
          <el-dropdown @command="onCommand">
            <span class="user-info">
              <span class="avatar">{{ roleText.slice(0, 1) }}</span>
              <span v-if="!collapsed" class="user-name">{{ auth.user?.name }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>{{ roleText }}</el-dropdown-item>
                <el-dropdown-item divided command="logout">{{ $t('menu.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <div class="content-wrap">
          <router-view />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api'
import i18n from '../i18n'
import { useAuthStore } from '../store/auth'
import { fmtTime } from '../utils/status'
import { getSocket, resetSocket } from '../utils/socket'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const lang = ref(localStorage.getItem('ts_lang') || 'zh')
const isDark = ref(localStorage.getItem('ts_dark') === '1')
const collapsed = ref(localStorage.getItem('ts_collapsed') === '1')
const notifList = ref([])
const unread = ref(0)

function applyDark(val) {
  document.documentElement.classList.toggle('dark', val)
  localStorage.setItem('ts_dark', val ? '1' : '0')
}

function toggleDark() {
  isDark.value = !isDark.value
  applyDark(isDark.value)
}

const roleTextMap = {
  customer: () => i18n.global.t('role.customer'),
  staff: () => i18n.global.t('role.staff'),
  manager: () => i18n.global.t('role.manager')
}
const roleText = computed(() => roleTextMap[auth.role]?.() || auth.role)

const menusMap = {
  customer: [
    { path: '/home', titleKey: 'menu.home', icon: 'Odometer' },
    { path: '/tickets/new', titleKey: 'menu.newTicket', icon: 'EditPen' },
    { path: '/tickets', titleKey: 'menu.myTickets', icon: 'Tickets' },
    { path: '/ask', titleKey: 'menu.ask', icon: 'MagicStick' },
    { path: '/faqs', titleKey: 'menu.faqs', icon: 'QuestionFilled' },
    { path: '/bulletins', titleKey: 'menu.bulletins', icon: 'Bell' }
  ],
  staff: [
    { path: '/home', titleKey: 'menu.home', icon: 'Odometer' },
    { path: '/tickets', titleKey: 'menu.myTickets', icon: 'Tickets' },
    { path: '/faqs', titleKey: 'menu.faqs', icon: 'QuestionFilled' }
  ],
  manager: [
    { path: '/home', titleKey: 'menu.home', icon: 'Odometer' },
    { path: '/tickets', titleKey: 'menu.allTickets', icon: 'Tickets' },
    { path: '/manager/users', titleKey: 'menu.users', icon: 'User' },
    { path: '/manager/categories', titleKey: 'menu.categories', icon: 'FolderOpened' },
    { path: '/manager/faqs', titleKey: 'menu.faqManage', icon: 'QuestionFilled' },
    { path: '/manager/bulletins', titleKey: 'menu.bulletinManage', icon: 'Bell' },
    { path: '/manager/phrases', titleKey: 'menu.phrases', icon: 'ChatDotRound' },
    { path: '/manager/forms', titleKey: 'menu.forms', icon: 'Tickets' },
    { path: '/manager/channels', titleKey: 'menu.channels', icon: 'Connection' },
    { path: '/manager/system', titleKey: 'menu.system', icon: 'Setting' }
  ]
}

const menus = computed(() => menusMap[auth.role] || [])
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  const title = route.meta.title
  const map = {
    工作台: 'menu.home', 提交工单: 'menu.newTicket', 工单列表: 'menu.myTickets',
    工单详情: 'ticket.messages', 常见问题: 'menu.faqs', 公告: 'menu.bulletins', 智能问答: 'menu.ask',
    账号管理: 'menu.users', 工单分类: 'menu.categories', 常见问题管理: 'menu.faqManage',
    公告管理: 'menu.bulletinManage', 快捷回复: 'menu.phrases', 系统设置: 'menu.system',
    接入渠道: 'menu.channels', 表单配置: 'menu.forms'
  }
  return map[title] ? i18n.global.t(map[title]) : title
})

function switchLang(value) {
  i18n.global.locale.value = value
  localStorage.setItem('ts_lang', value)
}

async function loadNotifs() {
  try {
    const [list, count] = await Promise.all([api.notifications(), api.notifUnread()])
    notifList.value = list
    unread.value = count
  } catch (e) {
    // 拦截器已提示
  }
}

async function markAllRead() {
  try {
    await api.notifReadAll()
    loadNotifs()
  } catch (e) {
    // 拦截器已提示
  }
}

async function openNotif(n) {
  if (!n.isRead) {
    try {
      await api.notifRead(n.id)
    } catch (e) {
      // 忽略
    }
    loadNotifs()
  }
  if (n.link) router.push(n.link)
}

function onCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    resetSocket()
    router.push('/login')
  }
}

let timer = null
onMounted(() => {
  applyDark(isDark.value)
  loadNotifs()
  timer = setInterval(loadNotifs, 30000)
  const socket = getSocket()
  socket.on('ticket:new', () => loadNotifs())
  socket.on('ticket:notify', () => loadNotifs())
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.layout {
  height: 100%;
}

/* ---------- 侧边栏：靛蓝淡彩面板 ---------- */
.aside {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #eef0fb 0%, #f3f5fc 100%);
  border-right: 1px solid var(--app-border);
  transition: width 0.25s ease, background-color 0.25s ease;
  position: relative;
}
html.dark .aside {
  background: linear-gradient(180deg, #131a29 0%, #171f30 100%);
}
.aside::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.6;
  background-image:
    linear-gradient(to right, rgba(91, 108, 240, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(91, 108, 240, 0.05) 1px, transparent 1px);
  background-size: 26px 26px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  cursor: pointer;
  flex-shrink: 0;
}
.logo-mark {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-deep));
  clip-path: polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 0 100%);
  box-shadow: 0 3px 10px rgba(91, 108, 240, 0.35);
}
.logo-text {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
}

.menu-scroll {
  flex: 1;
}

.side-menu {
  border-right: none;
  background: transparent;
  padding: 6px 10px;
}
.side-menu :deep(.el-menu-item) {
  height: 44px;
  margin-bottom: 4px;
  border-radius: 10px;
  color: var(--app-text-secondary);
  font-weight: 600;
  position: relative;
  transition: all 0.18s ease;
}
.side-menu :deep(.el-menu-item:hover) {
  background: var(--app-primary-faint);
  color: var(--app-text);
}
.side-menu :deep(.el-menu-item.is-active) {
  background: var(--app-primary-soft);
  color: var(--app-primary);
}
.side-menu :deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 2px;
  background: var(--app-primary);
  box-shadow: 0 0 8px rgba(91, 108, 240, 0.55);
}
.side-menu:not(.el-menu--collapse) :deep(.el-menu-item.is-active)::after {
  content: '';
  position: absolute;
  right: -10px;
  top: 0;
  bottom: 0;
  width: 10px;
  background: linear-gradient(90deg, rgba(91, 108, 240, 0.16), transparent);
}

.collapse-btn {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-secondary);
  cursor: pointer;
  border-top: 1px solid var(--app-border);
  transition: color 0.18s ease;
}
.collapse-btn:hover {
  color: var(--app-primary);
}

/* ---------- 顶栏 ---------- */
.right {
  min-width: 0;
}
.header {
  height: 60px;
  background: var(--app-card);
  border-bottom: 1px solid var(--app-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 5;
  transition: background-color 0.25s ease;
}
.header-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--app-text);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-btn {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--app-border);
  border-radius: 9px;
  background: var(--app-card);
  color: var(--app-text-secondary);
  cursor: pointer;
  transition: all 0.18s ease;
}
.icon-btn:hover {
  color: var(--app-primary);
  border-color: var(--app-primary);
  box-shadow: var(--app-glow-primary);
}
.lang-select {
  width: 76px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
  color: var(--app-text-secondary);
}
.avatar {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-deep));
  color: #fff;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(91, 108, 240, 0.35);
}
.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
}

/* ---------- 内容区 ---------- */
.main {
  padding: 22px;
  overflow: auto;
}
.content-wrap {
  max-width: var(--app-content-max);
  margin: 0 auto;
}

/* ---------- 通知面板 ---------- */
.notif-panel {
  width: 320px;
}
.notif-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--app-border);
}
.notif-item {
  padding: 10px 14px;
  border-bottom: 1px solid var(--app-border);
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.notif-item:hover {
  background: var(--app-primary-faint);
}
.notif-item.unread .notif-title {
  font-weight: 700;
}
.notif-title {
  font-size: 13px;
  color: var(--app-text);
}
.notif-content {
  font-size: 12px;
  color: var(--app-text-secondary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notif-time {
  font-size: 11px;
  color: var(--app-text-secondary);
  margin-top: 2px;
}
</style>
