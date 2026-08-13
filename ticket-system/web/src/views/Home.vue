<template>
  <div>
    <!-- 欢迎横幅 -->
    <div class="hero tex-grid">
      <div class="hero-left">
        <div class="hero-greet">{{ $t('home.welcome') }}，{{ auth.user?.name }}！</div>
        <div class="hero-title">Ticket OS</div>
        <div class="hero-desc">{{ heroDesc }}</div>
        <div class="hero-actions">
          <el-button v-if="role === 'customer'" type="primary" size="large" class="hero-btn" @click="$router.push('/tickets/new')">
            {{ $t('home.submitNew') }}
          </el-button>
          <el-button v-if="role === 'customer'" size="large" class="hero-btn ghost" @click="$router.push('/ask')">
            {{ $t('menu.ask') }}
          </el-button>
        </div>
      </div>
      <div class="hero-chips">
        <button v-if="role === 'customer'" class="hero-chip hero-chip-btn" @click="$router.push('/tickets/new')">
          <span class="chip-value num-mono">{{ $t('home.quickStart') }}</span>
          <span class="chip-label">{{ $t('home.submitNew') }}</span>
        </button>
        <div
          v-for="c in heroChips"
          :key="c.label"
          class="hero-chip"
          :class="{ clickable: !!c.to, 'chip-plain': !c.to }"
          @click="c.to && $router.push(c.to)"
        >
          <span class="chip-value num-mono">{{ c.value }}</span>
          <span class="chip-label">{{ c.label }}</span>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <template v-if="role === 'manager' && stats">
      <div class="stat-grid">
        <div
          v-for="c in managerCards"
          :key="c.label"
          class="stat-card panel-cut"
          :class="{ clickable: !!c.to }"
          :style="{ '--card-accent': c.color, '--card-soft': c.soft }"
          @click="c.to && $router.push(c.to)"
        >
          <div class="stat-icon"><el-icon :size="20"><component :is="c.icon" /></el-icon></div>
          <div class="stat-value num-mono">{{ c.value }}</div>
          <div class="stat-label">{{ c.label }}</div>
        </div>
      </div>
    </template>
    <template v-else-if="role === 'staff' && myStats">
      <div class="stat-grid">
        <div
          v-for="c in staffCards"
          :key="c.label"
          class="stat-card panel-cut"
          :class="{ clickable: !!c.to }"
          :style="{ '--card-accent': c.color, '--card-soft': c.soft }"
          @click="c.to && $router.push(c.to)"
        >
          <div class="stat-icon"><el-icon :size="20"><component :is="c.icon" /></el-icon></div>
          <div class="stat-value num-mono">{{ c.value }}</div>
          <div class="stat-label">{{ c.label }}</div>
        </div>
      </div>
    </template>

    <!-- 客服工作台：待处理 + 最新留言 + 快捷回复 -->
    <template v-if="role === 'staff'">
      <div class="staff-row">
        <div class="page-card">
          <div class="list-head">
            <h3 class="page-title" style="margin: 0">{{ $t('home.staffOpen') }}</h3>
            <el-button link type="primary" @click="$router.push('/tickets')">{{ $t('home.viewAll') }}</el-button>
          </div>
          <el-table
            :data="staffFeed.openTickets"
            size="small"
            style="cursor: pointer"
            @row-click="(row) => $router.push(`/tickets/${row.id}`)"
          >
            <el-table-column prop="no" :label="$t('ticket.no')" width="170" />
            <el-table-column prop="title" :label="$t('ticket.title')" min-width="150" show-overflow-tooltip />
            <el-table-column prop="customerName" :label="$t('ticket.customer')" width="90" />
            <el-table-column :label="$t('common.status')" width="105">
              <template #default="{ row }">
                <el-tag :type="STATUS[row.status]?.type" size="small">{{ $t(STATUS[row.status]?.labelKey) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="SLA" width="76">
              <template #default="{ row }">
                <el-tag v-if="row.overdue" type="danger" size="small">{{ $t('status.overdue') }}</el-tag>
                <span v-else class="text-muted">-</span>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!staffFeed.openTickets.length" :description="$t('common.empty')" :image-size="60" />
        </div>

        <div class="page-card">
          <h3 class="page-title">{{ $t('home.staffRecent') }}</h3>
          <div class="feed-list">
            <div v-for="m in staffFeed.recentMessages" :key="m.id" class="feed-item clickable" @click="$router.push(`/tickets/${m.ticketId}`)">
              <div class="feed-head">
                <span class="feed-no">{{ m.ticketNo }}</span>
                <span class="feed-sender">{{ m.senderName || '系统' }}</span>
                <span class="text-muted">{{ fmtTime(m.createdAt) }}</span>
              </div>
              <div class="feed-content">{{ m.content }}</div>
            </div>
          </div>
          <el-empty v-if="!staffFeed.recentMessages.length" :description="$t('common.empty')" :image-size="60" />
        </div>
      </div>

      <div class="page-card mt16">
        <h3 class="page-title">{{ $t('home.quickReplies') }}</h3>
        <div class="phrase-chips">
          <span v-for="p in phrases" :key="p.id" class="phrase-chip clickable" @click="copyPhrase(p.content)">{{ p.content }}</span>
        </div>
        <el-empty v-if="!phrases.length" :description="$t('common.empty')" :image-size="60" />
      </div>
    </template>

    <!-- 图表区（主管） -->
    <template v-if="role === 'manager' && stats">
      <div class="chart-row">
        <div class="page-card chart-card">
          <h3 class="page-title">{{ $t('home.trend') }}</h3>
          <div ref="trendRef" class="chart"></div>
        </div>
        <div class="page-card chart-card">
          <h3 class="page-title">{{ $t('home.categoryDist') }}</h3>
          <div ref="catRef" class="chart"></div>
        </div>
      </div>
      <div class="chart-row">
        <div class="page-card chart-card wide">
          <h3 class="page-title">{{ $t('home.staffPerf') }}</h3>
          <div ref="perfRef" class="chart"></div>
        </div>
        <div class="page-card chart-card">
          <h3 class="page-title">{{ $t('home.staffLoad') }}</h3>
          <el-table :data="stats.staffLoad" size="small">
            <el-table-column prop="name" :label="$t('ticket.staff')" />
            <el-table-column prop="count" label="在办" width="100" />
          </el-table>
          <el-empty v-if="!stats.staffLoad.length" :description="$t('common.empty')" :image-size="60" />
        </div>
      </div>
    </template>

    <!-- 最近工单 -->
    <div class="page-card mt16">
      <div class="list-head">
        <h3 class="page-title" style="margin: 0">{{ role === 'customer' ? $t('home.myRecent') : $t('home.recent') }}</h3>
        <el-button link type="primary" @click="$router.push('/tickets')">{{ $t('home.viewAll') }}</el-button>
      </div>
      <el-table
        :data="recent"
        size="small"
        style="cursor: pointer"
        @row-click="(row) => $router.push(`/tickets/${row.id}`)"
      >
        <el-table-column prop="no" :label="$t('ticket.no')" width="180" />
        <el-table-column prop="title" :label="$t('ticket.title')" min-width="180" show-overflow-tooltip />
        <el-table-column :label="$t('ticket.priority')" width="90">
          <template #default="{ row }">
            <el-tag :type="PRIORITY[row.priority]?.type" size="small">{{ $t(PRIORITY[row.priority]?.labelKey) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" :label="$t('ticket.category')" width="100" />
        <el-table-column v-if="role !== 'customer'" prop="customerName" :label="$t('ticket.customer')" width="100" />
        <el-table-column v-if="role === 'manager'" prop="staffName" :label="$t('ticket.staff')" width="100" />
        <el-table-column :label="$t('common.status')" width="110">
          <template #default="{ row }">
            <el-tag :type="STATUS[row.status]?.type" size="small">{{ $t(STATUS[row.status]?.labelKey) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('ticket.createdAt')" width="150">
          <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!recent.length" :description="$t('common.empty')" :image-size="80" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { api } from '../api'
import i18n from '../i18n'
import { useAuthStore } from '../store/auth'
import { PRIORITY, STATUS, fmtTime } from '../utils/status'

const C = {
  indigo: '#5b6cf0',
  orange: '#ff9d5c',
  cyan: '#3cc7e8',
  green: '#37c98c',
  purple: '#a78bfa',
  rose: '#f06a7a',
  amber: '#f2b441',
  slate: '#8f9aad'
}

const auth = useAuthStore()
const role = computed(() => auth.role)
const stats = ref(null)
const myStats = ref(null)
const staffFeed = ref({ openTickets: [], recentMessages: [] })
const phrases = ref([])
const recent = ref([])
const trendRef = ref(null)
const catRef = ref(null)
const perfRef = ref(null)
const charts = []

const heroDesc = computed(() => {
  if (role.value === 'manager') return '工单流转 · SLA 管控 · 团队绩效，一览无余'
  if (role.value === 'staff') return '专注处理分配给你的工单，AI 帮你更快应答'
  return '有问题先问 AI，再不行就提交工单，我们全程跟进'
})

const heroChips = computed(() => {
  if (role.value === 'manager' && stats.value) {
    return [
      { label: '今日新增', value: stats.value.todayNew, to: '/tickets' },
      { label: '待分配', value: stats.value.byStatus.pending, to: '/tickets?status=pending' },
      { label: '超时', value: stats.value.overdue, to: '/tickets?overdue=1' },
      { label: '满意度', value: stats.value.csatAvg, to: null }
    ]
  }
  if (role.value === 'staff' && myStats.value) {
    return [
      { label: '在办', value: myStats.value.processing, to: '/tickets' },
      { label: '今日完结', value: myStats.value.todayClosed, to: '/tickets?status=closed' },
      { label: '超时', value: myStats.value.overdue, to: '/tickets?overdue=1' }
    ]
  }
  return []
})

const managerCards = computed(() => [
  { label: '全部工单', value: stats.value?.total ?? 0, color: C.indigo, soft: 'rgba(91,108,240,.12)', icon: 'Tickets', to: '/tickets' },
  { label: '待分配', value: stats.value?.byStatus.pending ?? 0, color: C.amber, soft: 'rgba(242,180,65,.14)', icon: 'AlarmClock', to: '/tickets?status=pending' },
  { label: '处理中', value: stats.value?.byStatus.processing ?? 0, color: C.cyan, soft: 'rgba(60,199,232,.13)', icon: 'Loading', to: '/tickets?status=processing' },
  { label: '待客户确认', value: stats.value?.byStatus.waiting ?? 0, color: C.slate, soft: 'rgba(143,154,173,.16)', icon: 'Clock', to: '/tickets?status=waiting' },
  { label: '已完结', value: stats.value?.byStatus.closed ?? 0, color: C.green, soft: 'rgba(55,201,140,.13)', icon: 'CircleCheck', to: '/tickets?status=closed' },
  { label: '今日新增', value: stats.value?.todayNew ?? 0, color: C.orange, soft: 'rgba(255,157,92,.14)', icon: 'TrendCharts', to: '/tickets' },
  { label: '超时', value: stats.value?.overdue ?? 0, color: C.rose, soft: 'rgba(240,106,122,.13)', icon: 'Warning', to: '/tickets?overdue=1' },
  { label: '平均满意度', value: stats.value?.csatAvg ?? 0, color: C.purple, soft: 'rgba(167,139,250,.14)', icon: 'Star', to: null }
])

const staffCards = computed(() => [
  { label: '我的在办', value: myStats.value?.processing ?? 0, color: C.indigo, soft: 'rgba(91,108,240,.12)', icon: 'Tickets', to: '/tickets' },
  { label: '累计完结', value: myStats.value?.closed ?? 0, color: C.green, soft: 'rgba(55,201,140,.13)', icon: 'CircleCheck', to: '/tickets?status=closed' },
  { label: '今日完结', value: myStats.value?.todayClosed ?? 0, color: C.cyan, soft: 'rgba(60,199,232,.13)', icon: 'Sunny', to: '/tickets?status=closed' },
  { label: '超时', value: myStats.value?.overdue ?? 0, color: C.rose, soft: 'rgba(240,106,122,.13)', icon: 'Warning', to: '/tickets?overdue=1' }
])

function gradient(color, from = 0.35) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color },
    { offset: 1, color: color + '22' }
  ])
}

async function copyPhrase(content) {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success(i18n.global.t('common.copied'))
  } catch (e) {
    // 剪贴板不可用时忽略
  }
}

function renderCharts() {
  if (!stats.value) return
  charts.forEach((c) => c.dispose())
  charts.length = 0

  if (trendRef.value) {
    const chart = echarts.init(trendRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['新增', '完结'], textStyle: { color: '#8f9aad' } },
      grid: { left: 42, right: 16, top: 38, bottom: 28 },
      xAxis: { type: 'category', data: stats.value.trend.map((t) => t.date), axisLine: { lineStyle: { color: '#dfe3f0' } }, axisLabel: { color: '#8f9aad' } },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eef0f8' } }, axisLabel: { color: '#8f9aad' } },
      series: [
        {
          name: '新增', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
          data: stats.value.trend.map((t) => t.created),
          lineStyle: { width: 3, color: C.indigo },
          itemStyle: { color: C.indigo, borderColor: '#fff', borderWidth: 2 },
          areaStyle: { color: gradient(C.indigo) },
          animationDuration: 900
        },
        {
          name: '完结', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
          data: stats.value.trend.map((t) => t.closed),
          lineStyle: { width: 3, color: C.green },
          itemStyle: { color: C.green, borderColor: '#fff', borderWidth: 2 },
          areaStyle: { color: gradient(C.green) },
          animationDuration: 1100
        }
      ]
    })
    charts.push(chart)
  }

  if (catRef.value) {
    const chart = echarts.init(catRef.value)
    const palette = [C.indigo, C.orange, C.cyan, C.green, C.purple, C.rose, C.amber, C.slate]
    chart.setOption({
      tooltip: { trigger: 'item' },
      color: palette,
      series: [
        {
          type: 'pie',
          radius: ['36%', '64%'],
          center: ['50%', '50%'],
          itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
          label: { color: '#8f9aad' },
          data: stats.value.categoryDist.map((c) => ({ name: c.name, value: c.count })),
          animationDuration: 900
        }
      ]
    })
    charts.push(chart)
  }

  if (perfRef.value) {
    const chart = echarts.init(perfRef.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['在办', '完结'], textStyle: { color: '#8f9aad' } },
      grid: { left: 42, right: 16, top: 38, bottom: 28 },
      xAxis: { type: 'category', data: stats.value.staffPerformance.map((p) => p.name), axisLine: { lineStyle: { color: '#dfe3f0' } }, axisLabel: { color: '#8f9aad' } },
      yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eef0f8' } }, axisLabel: { color: '#8f9aad' } },
      series: [
        {
          name: '在办', type: 'bar', barWidth: 16,
          data: stats.value.staffPerformance.map((p) => p.openCount),
          itemStyle: { color: gradient(C.indigo, 0.75), borderRadius: [5, 5, 0, 0] },
          animationDuration: 800
        },
        {
          name: '完结', type: 'bar', barWidth: 16,
          data: stats.value.staffPerformance.map((p) => p.closedCount),
          itemStyle: { color: gradient(C.green, 0.75), borderRadius: [5, 5, 0, 0] },
          animationDuration: 1000
        }
      ]
    })
    charts.push(chart)
  }
}

onMounted(async () => {
  try {
    if (role.value === 'manager') {
      stats.value = await api.dashboardStats()
      await nextTick()
      renderCharts()
    } else if (role.value === 'staff') {
      const [ms, feed, ph] = await Promise.all([api.myStats(), api.staffFeed(), api.phrases()])
      myStats.value = ms
      staffFeed.value = feed
      phrases.value = ph
    }
  } catch (e) {
    // 拦截器已提示
  }
  try {
    const res = await api.tickets({ size: 5 })
    recent.value = res.list
  } catch (e) {
    // 拦截器已提示
  }
})
</script>

<style scoped>
/* 欢迎横幅 */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 30px 34px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(120deg, #e8ebfd 0%, #f3ecfb 55%, #eaf6fd 100%);
  border: 1px solid rgba(91, 108, 240, 0.14);
  box-shadow: var(--app-shadow);
}
html.dark .hero {
  background: linear-gradient(120deg, #1b2340 0%, #26213f 55%, #16283a 100%);
  border-color: rgba(91, 108, 240, 0.25);
}
.hero-left {
  position: relative;
  z-index: 1;
}
.hero-greet {
  font-size: 15px;
  color: var(--app-primary);
  font-weight: 700;
  margin-bottom: 6px;
}
.hero-title {
  font-family: var(--app-font-mono);
  font-size: 38px;
  font-weight: 900;
  letter-spacing: 1px;
  color: var(--app-text);
  margin-bottom: 8px;
}
.hero-desc {
  color: var(--app-text-secondary);
  font-size: 14px;
  margin-bottom: 18px;
}
.hero-actions {
  display: flex;
  gap: 10px;
}
.hero-btn {
  border-radius: 10px;
  font-weight: 700;
}
.hero-btn.ghost {
  background: rgba(255, 255, 255, 0.55);
  border-color: rgba(91, 108, 240, 0.25);
  color: var(--app-primary);
}
html.dark .hero-btn.ghost {
  background: rgba(91, 108, 240, 0.16);
}
.hero-chips {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
}
.hero-chip {
  min-width: 86px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(91, 108, 240, 0.16);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
  backdrop-filter: blur(4px);
}
button.hero-chip-btn {
  font-family: inherit;
  border-color: rgba(91, 108, 240, 0.45);
  box-shadow: 0 2px 10px rgba(91, 108, 240, 0.2);
  transition: all 0.18s ease;
}
button.hero-chip-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--app-glow-primary);
}
.hero-chip.chip-plain {
  border-style: dashed;
  border-color: var(--app-border);
  background: transparent;
}
html.dark .hero-chip {
  background: rgba(30, 40, 70, 0.6);
}
.chip-value {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: var(--app-text);
}
.chip-label {
  font-size: 12px;
  color: var(--app-text-secondary);
}

/* 统计卡片 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 14px;
  margin-top: 18px;
}
.stat-card {
  --card-accent: #5b6cf0;
  --card-soft: rgba(91, 108, 240, 0.12);
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 13px;
  padding: 16px 12px;
  text-align: center;
  cursor: default;
}
.stat-icon {
  width: 36px;
  height: 36px;
  margin: 0 auto 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--card-accent);
  background: var(--card-soft);
}
.stat-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--app-text);
  line-height: 1.2;
}
.stat-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--app-text-secondary);
}

/* 图表 */
.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.chart-row .wide {
  grid-column: span 1;
}

/* 客服工作台 */
.staff-row {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  margin-top: 18px;
}
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.feed-item {
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-bg);
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}
.feed-item:hover {
  border-color: var(--app-primary);
  box-shadow: 0 2px 10px rgba(91, 108, 240, 0.14);
}
.feed-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.feed-no {
  font-family: var(--app-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--app-primary);
}
.feed-sender {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-text);
}
.feed-content {
  font-size: 13px;
  color: var(--app-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.phrase-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.phrase-chip {
  padding: 8px 14px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-bg);
  font-size: 13px;
  color: var(--app-text);
  transition: all 0.18s ease;
}
.phrase-chip:hover {
  border-color: var(--app-primary);
  color: var(--app-primary);
  background: var(--app-primary-soft);
  transform: translateY(-1px);
}
.chart-card .chart {
  height: 280px;
}

.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.mt16 {
  margin-top: 16px;
}

@media (max-width: 1400px) {
  .stat-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1100px) {
  .staff-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
