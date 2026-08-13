export default {
  app: { name: '轻量企业客服工单系统' },
  common: {
    submit: '提交', cancel: '取消', save: '保存', delete: '删除', edit: '编辑', create: '新建',
    search: '查询', confirm: '确认', close: '关闭', action: '操作', status: '状态', all: '全部',
    loading: '加载中...', empty: '暂无数据', copied: '已复制'
  },
  status: { pending: '待分配', processing: '处理中', waiting: '待客户确认', closed: '已完结', overdue: '已超时' },
  priority: { low: '低', normal: '普通', high: '高', urgent: '紧急' },
  channel: { web: '网页', wechat: '微信', wecom: '企业微信', email: '邮件' },
  role: { customer: '客户', staff: '客服专员', manager: '客服主管' },
  menu: {
    home: '工作台', newTicket: '提交工单', myTickets: '我的工单', allTickets: '全部工单',
    users: '账号管理', categories: '工单分类', faqs: '常见问题', faqManage: '常见问题管理',
    bulletins: '公告', bulletinManage: '公告管理', phrases: '快捷回复', system: '系统设置',
    channels: '接入渠道', forms: '表单配置', ask: '智能问答', logout: '退出登录'
  },
  login: {
    title: '登录', account: '账号', password: '密码', submit: '登 录',
    register: '注册客户账号', demo: '演示账号（密码均为 123456）', success: '登录成功'
  },
  register: {
    title: '注册客户账号', account: '账号（3-32 位字母/数字/下划线）', name: '姓名 / 称呼',
    password: '密码（至少 6 位）', confirm: '确认密码', company: '公司名称', phone: '手机号',
    submit: '注 册', toLogin: '已有账号，去登录'
  },
  home: {
    welcome: '您好', submitNew: '提交新工单', myRecent: '我的最近工单', recent: '最近工单',
    viewAll: '查看全部', totalTickets: '全部工单', todayNew: '今日新增', categoryDist: '工单分类分布',
    staffLoad: '客服负载（未完结工单）', staffPerf: '客服绩效排行', trend: '近 14 天工单趋势',
    created: '新增', closedLine: '完结', myProcessing: '我的在办工单', myClosed: '累计完结工单',
    todayClosed: '今日完结工单', overdueCount: '超时工单', csatAvg: '平均满意度', avgResponse: '平均响应(分钟)',
    avgResolve: '平均解决(小时)', quickAsk: '有问题？先问问智能助手', quickStart: '开始',
    staffOpen: '待处理工单', staffRecent: '最新客户留言', quickReplies: '快捷回复'
  },
  ticket: {
    no: '工单号', title: '标题', category: '分类', customer: '客户', staff: '处理客服',
    createdAt: '创建时间', updatedAt: '更新时间', channel: '来源渠道', priority: '优先级',
    submitNew: '提交新工单', keyword: '工单号 / 标题', reply: '回复工单', send: '发送回复',
    messages: '沟通记录', logs: '操作日志', operations: '工单操作', assign: '分配客服', transfer: '转派客服',
    selectStaff: '选择处理客服', confirmResolved: '确认已解决并关闭工单', markWaiting: '标记待客户确认',
    continueHandle: '继续处理', complete: '完结工单', aiReply: 'AI 回复建议', aiSummary: 'AI 工单摘要',
    aiClassify: 'AI 自动分类', quickPhrase: '选择快捷回复', fieldValues: '扩展信息',
    slaResponse: '响应时限', slaResolve: '解决时限', overdueWarning: '该工单已超过解决时限（SLA 超时）',
    rate: '满意度评价', rateNow: '去评价', rateDone: '已评价', ratePlaceholder: '请输入评价内容（选填）',
    customerScore: '客户评分', suggestion: 'AI 建议', noSuggest: '无建议内容'
  },
  ask: {
    title: '智能问答', placeholder: '请输入您的问题，例如：如何提交工单', search: '开始提问',
    matched: '为您找到以下答案', noMatch: '知识库暂未找到答案，建议您提交工单由人工处理',
    submitTicket: '提交工单', sourceKb: '知识库', sourceLlm: 'AI 生成'
  },
  manager: {
    users: '账号管理', createUser: '新建账号', role: '角色', name: '姓名', phone: '手机号',
    company: '公司', enabled: '正常', disabled: '禁用', resetPwd: '重置密码', editUser: '编辑账号',
    categories: '工单分类', createCategory: '新建分类', sort: '排序', faqs: '常见问题管理', createFaq: '新建 FAQ',
    question: '问题', answer: '答案', bulletins: '公告管理', createBulletin: '发布公告', title: '标题', content: '内容',
    phrases: '快捷回复', createPhrase: '新建快捷回复', system: '系统设置', aiConfig: 'AI 智能客服配置',
    aiEnabled: '启用 AI', aiProvider: '服务商', aiApiUrl: '接口地址', aiApiKey: 'API Key', aiModel: '模型',
    autoAssign: '工单自动分配（按负载最少自动指派）', slaConfig: 'SLA 策略配置',
    responseHours: '响应时限(小时)', resolveHours: '解决时限(小时)', channels: '接入渠道',
    channelName: '渠道名称', channelEnabled: '启用', channelConfig: '配置(JSON)', testInbound: '模拟来信',
    forms: '表单配置', fieldLabel: '字段名称', fieldType: '字段类型', fieldRequired: '必填',
    fieldOptions: '选项（逗号分隔）', typeText: '单行文本', typeTextarea: '多行文本',
    typeSelect: '下拉选择', typeDate: '日期'
  },
  notif: { title: '通知', markAll: '全部已读', empty: '暂无通知' }
}
