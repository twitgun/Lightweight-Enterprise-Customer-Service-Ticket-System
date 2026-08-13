export const STATUS = {
  pending: { label: '待分配', labelKey: 'status.pending', type: 'warning' },
  processing: { label: '处理中', labelKey: 'status.processing', type: 'primary' },
  waiting: { label: '待客户确认', labelKey: 'status.waiting', type: 'info' },
  closed: { label: '已完结', labelKey: 'status.closed', type: 'success' }
}

export const ACTION = {
  create: '创建工单',
  reply: '回复留言',
  assign: '分配工单',
  transfer: '转派工单',
  status: '更新状态',
  confirm: '客户确认解决'
}

export const PRIORITY = {
  low: { label: '低', labelKey: 'priority.low', type: 'info' },
  normal: { label: '普通', labelKey: 'priority.normal', type: 'primary' },
  high: { label: '高', labelKey: 'priority.high', type: 'warning' },
  urgent: { label: '紧急', labelKey: 'priority.urgent', type: 'danger' }
}

export const CHANNEL = {
  web: '网页',
  wechat: '微信',
  wecom: '企业微信',
  email: '邮件'
}

export function fmtTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
