<template>
  <div v-loading="loading">
    <template v-if="ticket">
      <el-alert v-if="ticket.overdue" type="error" :closable="false" class="mb16" :title="$t('ticket.overdueWarning')" />

      <div class="page-card">
        <div class="detail-head">
          <div>
            <h3 class="page-title" style="margin: 0">{{ ticket.title }}</h3>
            <div class="text-muted meta">
              {{ $t('ticket.no') }} {{ ticket.no }} ｜ {{ $t('ticket.category') }} {{ ticket.categoryName || '未分类' }}
              ｜ {{ $t('ticket.createdAt') }} {{ fmtTime(ticket.createdAt) }}
            </div>
          </div>
          <div class="head-tags">
            <el-tag :type="STATUS[ticket.status]?.type" size="large">{{ $t(STATUS[ticket.status]?.labelKey) }}</el-tag>
            <el-tag :type="PRIORITY[ticket.priority]?.type" size="large">{{ $t(PRIORITY[ticket.priority]?.labelKey) }}</el-tag>
            <el-tag size="large" type="info">{{ CHANNEL[ticket.channel] || ticket.channel }}</el-tag>
          </div>
        </div>
        <el-descriptions :column="3" border class="mt16" size="small">
          <el-descriptions-item :label="$t('ticket.customer')">{{ ticket.customerName }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ticket.staff')">{{ ticket.staffName || '未分配' }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ticket.updatedAt')">{{ fmtTime(ticket.updatedAt) }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ticket.slaResponse')">{{ fmtTime(ticket.slaResponseAt) }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ticket.slaResolve')">{{ fmtTime(ticket.slaResolveAt) }}</el-descriptions-item>
          <el-descriptions-item :label="$t('ticket.rate')">
            <span v-if="satisfaction">{{ '★'.repeat(satisfaction.rating) }}</span>
            <span v-else class="text-muted">-</span>
          </el-descriptions-item>
        </el-descriptions>

        <template v-if="fieldEntries.length">
          <h4 class="section-title">{{ $t('ticket.fieldValues') }}</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item v-for="[label, value] in fieldEntries" :key="label" :label="label">{{ value || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </div>

      <div class="page-card mt16">
        <h4 class="section-title">{{ $t('ticket.messages') }}（{{ messages.length }}）</h4>
        <div class="chat-list">
          <div v-for="m in messages" :key="m.id" :class="['chat-row', m.senderType === 'customer' ? 'left' : 'right']">
            <span class="chat-avatar" :class="m.senderType">{{ (m.senderName || '客').slice(0, 1) }}</span>
            <div class="chat-main">
              <div class="chat-meta">
                <span class="sender-name">{{ m.senderName }}</span>
                <span class="text-muted">{{ fmtTime(m.createdAt) }}</span>
              </div>
              <div :class="['chat-bubble', m.senderType]">{{ m.content }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canReply" class="page-card mt16">
        <h4 class="section-title">{{ $t('ticket.reply') }}</h4>
        <div v-if="role !== 'customer'" class="mb8 toolbar">
          <el-select v-model="selectedPhrase" :placeholder="$t('ticket.quickPhrase')" clearable style="width: 300px" @change="applyPhrase">
            <el-option v-for="p in phrases" :key="p.id" :label="p.content.slice(0, 26)" :value="p.content" />
          </el-select>
          <el-button type="warning" plain :loading="aiReplyLoading" @click="genAiReply">{{ $t('ticket.aiReply') }}</el-button>
          <el-button type="info" plain :loading="aiSummaryLoading" @click="genAiSummary">{{ $t('ticket.aiSummary') }}</el-button>
          <el-button type="success" plain :loading="aiClassifyLoading" @click="genAiClassify">{{ $t('ticket.aiClassify') }}</el-button>
        </div>
        <el-alert v-if="aiSuggestion" type="warning" :closable="true" class="mb8" @close="aiSuggestion = ''">
          <template #title>
            <div class="answer-head">
              <b>{{ $t('ticket.suggestion') }}</b>
              <el-button link type="primary" size="small" @click="replyContent = aiSuggestion">{{ $t('ticket.send') }}</el-button>
            </div>
          </template>
          <div class="answer-text">{{ aiSuggestion }}</div>
        </el-alert>
        <el-input v-model="replyContent" type="textarea" :rows="4" maxlength="2000" show-word-limit :placeholder="$t('ticket.reply')" />
        <div class="action-bar">
          <el-button type="primary" :loading="sending" @click="sendReply">{{ $t('ticket.send') }}</el-button>
        </div>
      </div>

      <div class="page-card mt16">
        <h4 class="section-title">{{ $t('ticket.operations') }}</h4>
        <div class="action-bar">
          <template v-if="isManager">
            <el-select v-model="assignStaffId" :placeholder="$t('ticket.selectStaff')" style="width: 200px" :disabled="ticket.status === 'closed'">
              <el-option v-for="s in staffList" :key="s.id" :label="`${s.name}（${s.account}）`" :value="s.id" />
            </el-select>
            <el-button type="primary" plain :disabled="ticket.status === 'closed'" @click="doAssign">
              {{ ticket.staffId ? $t('ticket.transfer') : $t('ticket.assign') }}
            </el-button>
          </template>
          <template v-if="isStaff || isManager">
            <el-button v-if="ticket.status === 'processing'" type="warning" plain @click="changeStatus('waiting')">
              {{ $t('ticket.markWaiting') }}
            </el-button>
            <el-button v-if="ticket.status === 'waiting'" type="primary" plain @click="changeStatus('processing')">
              {{ $t('ticket.continueHandle') }}
            </el-button>
            <el-button v-if="['processing', 'waiting'].includes(ticket.status)" type="success" plain @click="changeStatus('closed')">
              {{ $t('ticket.complete') }}
            </el-button>
          </template>
          <el-button v-if="isCustomer && ticket.status === 'waiting'" type="success" @click="confirmClose">
            {{ $t('ticket.confirmResolved') }}
          </el-button>
          <el-button v-if="isCustomer && ticket.status === 'closed' && !satisfaction" type="warning" @click="rateDialog.visible = true">
            {{ $t('ticket.rateNow') }}
          </el-button>
          <span v-if="isCustomer && satisfaction" class="rated">
            {{ $t('ticket.rateDone') }}：{{ '★'.repeat(satisfaction.rating) }}{{ satisfaction.comment ? `（${satisfaction.comment}）` : '' }}
          </span>
          <span v-if="role !== 'customer' && satisfaction" class="rated">
            {{ $t('ticket.customerScore') }}：{{ satisfaction.rating }}/5{{ satisfaction.comment ? `（${satisfaction.comment}）` : '' }}
          </span>
        </div>
      </div>

      <div class="page-card mt16">
        <h4 class="section-title">{{ $t('ticket.logs') }}</h4>
        <el-timeline>
          <el-timeline-item v-for="log in logs" :key="log.id" :timestamp="fmtTime(log.createdAt)">
            <b>{{ ACTION[log.action] || log.action }}</b>（{{ log.operatorName || '系统' }}）
            <div class="log-detail text-muted">{{ log.detail }}</div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </template>

    <el-dialog v-model="summaryDialog.visible" :title="$t('ticket.aiSummary')" width="520px">
      <div class="selectable" style="white-space: pre-wrap; line-height: 1.8">{{ summaryDialog.content }}</div>
    </el-dialog>

    <el-dialog v-model="classifyDialog.visible" :title="$t('ticket.aiClassify')" width="420px">
      <div v-if="classifyDialog.content" style="line-height: 1.8">
        AI 建议分类：<b>{{ classifyDialog.content.categoryName || '未识别' }}</b>
      </div>
    </el-dialog>

    <el-dialog v-model="rateDialog.visible" :title="$t('ticket.rate')" width="440px">
      <div class="rate-box">
        <el-rate v-model="rateDialog.rating" :max="5" show-score />
        <el-input v-model="rateDialog.comment" type="textarea" :rows="3" :placeholder="$t('ticket.ratePlaceholder')" class="mt16" />
      </div>
      <template #footer>
        <el-button @click="rateDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="rateSaving" @click="submitRate">{{ $t('common.submit') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../api'
import { useAuthStore } from '../store/auth'
import { ACTION, CHANNEL, PRIORITY, STATUS, fmtTime } from '../utils/status'
import { getSocket } from '../utils/socket'

const route = useRoute()
const auth = useAuthStore()
const id = route.params.id
const role = computed(() => auth.role)
const isCustomer = computed(() => auth.role === 'customer')
const isStaff = computed(() => auth.role === 'staff')
const isManager = computed(() => auth.role === 'manager')

const data = ref(null)
const satisfaction = ref(null)
const loading = ref(false)
const replyContent = ref('')
const sending = ref(false)
const staffList = ref([])
const phrases = ref([])
const assignStaffId = ref(null)
const selectedPhrase = ref('')
const aiSuggestion = ref('')
const aiReplyLoading = ref(false)
const aiSummaryLoading = ref(false)
const aiClassifyLoading = ref(false)
const summaryDialog = reactive({ visible: false, content: '' })
const classifyDialog = reactive({ visible: false, content: null })
const rateDialog = reactive({ visible: false, rating: 5, comment: '' })
const rateSaving = ref(false)

const ticket = computed(() => data.value?.ticket || null)
const messages = computed(() => data.value?.messages || [])
const logs = computed(() => data.value?.logs || [])
const canReply = computed(() => !!ticket.value && ticket.value.status !== 'closed')
const fieldEntries = computed(() => Object.entries(ticket.value?.fieldValues || {}))

async function load() {
  loading.value = true
  try {
    data.value = await api.ticket(id)
    assignStaffId.value = ticket.value?.staffId || null
    if (ticket.value?.status === 'closed') {
      try {
        satisfaction.value = await api.ticketSatisfaction(id)
      } catch (e) {
        satisfaction.value = null
      }
    } else {
      satisfaction.value = null
    }
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

async function sendReply() {
  const content = replyContent.value.trim()
  if (!content) return ElMessage.warning('请输入回复内容')
  sending.value = true
  try {
    data.value = await api.replyTicket(id, content)
    replyContent.value = ''
    selectedPhrase.value = ''
    ElMessage.success('回复成功')
  } catch (e) {
    // 拦截器已提示
  } finally {
    sending.value = false
  }
}

async function changeStatus(status) {
  try {
    data.value = await api.updateTicketStatus(id, { status })
    ElMessage.success('状态已更新')
    loadSatisfaction()
  } catch (e) {
    // 拦截器已提示
  }
}

async function loadSatisfaction() {
  if (ticket.value?.status === 'closed') {
    try {
      satisfaction.value = await api.ticketSatisfaction(id)
    } catch (e) {
      satisfaction.value = null
    }
  }
}

async function confirmClose() {
  try {
    data.value = await api.confirmTicket(id)
    ElMessage.success('已确认解决，工单关闭')
  } catch (e) {
    // 拦截器已提示
  }
}

async function doAssign() {
  if (!assignStaffId.value) return ElMessage.warning('请选择处理客服')
  try {
    data.value = await api.assignTicket(id, assignStaffId.value)
    ElMessage.success(ticket.value?.staffId ? '转派成功' : '分配成功')
  } catch (e) {
    // 拦截器已提示
  }
}

function applyPhrase(value) {
  if (value) replyContent.value = value
}

async function genAiReply() {
  aiReplyLoading.value = true
  aiSuggestion.value = ''
  try {
    const res = await api.aiReply({ ticketId: id, draft: replyContent.value })
    aiSuggestion.value = res.content
  } catch (e) {
    // 拦截器已提示
  } finally {
    aiReplyLoading.value = false
  }
}

async function genAiSummary() {
  aiSummaryLoading.value = true
  try {
    const res = await api.aiSummarize({ ticketId: id })
    summaryDialog.content = res.summary
    summaryDialog.visible = true
  } catch (e) {
    // 拦截器已提示
  } finally {
    aiSummaryLoading.value = false
  }
}

async function genAiClassify() {
  aiClassifyLoading.value = true
  try {
    classifyDialog.content = await api.aiClassify({ ticketId: id })
    classifyDialog.visible = true
  } catch (e) {
    // 拦截器已提示
  } finally {
    aiClassifyLoading.value = false
  }
}

async function submitRate() {
  rateSaving.value = true
  try {
    satisfaction.value = await api.rateTicket(id, { rating: rateDialog.rating, comment: rateDialog.comment })
    rateDialog.visible = false
    ElMessage.success('感谢您的评价')
  } catch (e) {
    // 拦截器已提示
  } finally {
    rateSaving.value = false
  }
}

let socket = null
let socketHandlers = []

onMounted(async () => {
  if (isStaff.value || isManager.value) {
    try {
      staffList.value = await api.staffList()
    } catch (e) {
      // 拦截器已提示
    }
    try {
      phrases.value = await api.phrases()
    } catch (e) {
      // 拦截器已提示
    }
  }
  load()
  socket = getSocket()
  const h1 = () => load()
  const h2 = () => load()
  socket.on('ticket:message', h1)
  socket.on('ticket:updated', h2)
  socketHandlers = [['ticket:message', h1], ['ticket:updated', h2]]
  socket.emit('joinTicket', Number(id))
})

onUnmounted(() => {
  if (socket) {
    for (const [evt, fn] of socketHandlers) socket.off(evt, fn)
    socket.emit('leaveTicket')
  }
})
</script>

<style scoped>
.detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.meta {
  margin-top: 6px;
}
.head-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.section-title {
  margin: 14px 0;
  color: #1f2d3d;
}
.chat-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.chat-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  max-width: 82%;
}
.chat-row.left {
  align-self: flex-start;
}
.chat-row.right {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.chat-avatar {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 800;
  font-size: 14px;
}
.chat-avatar.customer {
  background: var(--app-primary-soft);
  color: var(--app-primary);
}
.chat-avatar.staff {
  background: linear-gradient(135deg, var(--app-primary), var(--app-primary-deep));
  color: #fff;
}
.chat-avatar.system {
  background: var(--app-bg);
  color: var(--app-text-secondary);
}
.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 78%;
}
.chat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 4px 4px;
}
.sender-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--app-text);
}
.action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.mb8 {
  margin-bottom: 8px;
}
.mb16 {
  margin-bottom: 16px;
}
.mt16 {
  margin-top: 16px;
}
.answer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.answer-text {
  white-space: pre-wrap;
  line-height: 1.8;
}
.rated {
  color: #e6a23c;
  font-size: 13px;
}
.rate-box {
  text-align: center;
}
</style>
