import * as bcrypt from 'bcryptjs';
import { AppDataSource } from './database';
import { Bulletin, Category, Channel, Faq, FormField, Message, Phrase, Satisfaction, Setting, SlaPolicy, Ticket, TicketLog, User } from './entities';

function genNo() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `TS${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${Math.floor(Math.random() * 900 + 100)}`;
}

async function ensureDefaults() {
  const fieldRepo = AppDataSource.getRepository(FormField);
  if ((await fieldRepo.count()) === 0) {
    await fieldRepo.save([
      { label: '设备型号', type: 'text', required: 0, options: null, sort: 1, status: 1 },
      { label: '问题紧急程度', type: 'select', required: 1, options: JSON.stringify(['一般', '紧急', '非常紧急']), sort: 2, status: 1 },
      { label: '期望解决时间', type: 'date', required: 0, options: null, sort: 3, status: 1 },
    ]);
    console.log('[seed] 自定义工单表单字段 3 条');
  }

  const slaRepo = AppDataSource.getRepository(SlaPolicy);
  if ((await slaRepo.count()) === 0) {
    await slaRepo.save([
      { priority: 'low', responseHours: 24, resolveHours: 72 },
      { priority: 'normal', responseHours: 8, resolveHours: 24 },
      { priority: 'high', responseHours: 4, resolveHours: 8 },
      { priority: 'urgent', responseHours: 1, resolveHours: 4 },
    ]);
    console.log('[seed] SLA 策略 4 条');
  }

  const chanRepo = AppDataSource.getRepository(Channel);
  if ((await chanRepo.count()) === 0) {
    await chanRepo.save([
      { type: 'web', name: '网页端', enabled: 1, config: null },
      { type: 'wechat', name: '微信公众号', enabled: 0, config: JSON.stringify({ appId: '', appSecret: '' }) },
      { type: 'wecom', name: '企业微信', enabled: 0, config: JSON.stringify({ corpId: '', agentId: '', secret: '' }) },
      { type: 'email', name: '电子邮件', enabled: 0, config: JSON.stringify({ imapHost: '', imapPort: 993, inbox: 'support@example.com' }) },
    ]);
    console.log('[seed] 接入渠道 4 条（网页端默认启用）');
  }

  const settingRepo = AppDataSource.getRepository(Setting);
  const defaults: Array<[string, string]> = [
    ['ai_enabled', '0'],
    ['ai_provider', 'openai'],
    ['ai_api_url', 'https://api.openai.com/v1'],
    ['ai_api_key', ''],
    ['ai_model', 'gpt-4o-mini'],
    ['auto_assign_enabled', '0'],
  ];
  for (const [key, value] of defaults) {
    if (!(await settingRepo.findOne({ where: { key } }))) {
      await settingRepo.save(settingRepo.create({ key, value }));
    }
  }
  console.log('[seed] 系统设置默认值就绪（AI 默认关闭，可在主管端开启并填写接口）');
}

async function seed() {
  await AppDataSource.initialize();
  console.log('[seed] 数据库连接成功');

  await ensureDefaults();

  const userRepo = AppDataSource.getRepository(User);
  if ((await userRepo.count()) > 0) {
    console.log('[seed] 检测到已有用户数据，跳过演示业务数据（系统配置类数据已就绪）');
    await AppDataSource.destroy();
    return;
  }

  const pwd = bcrypt.hashSync('123456', 10);
  const manager = await userRepo.save({
    account: 'manager', password: pwd, name: '王主管', phone: '13800000001',
    role: 'manager', status: 1,
  });
  const staff1 = await userRepo.save({
    account: 'staff01', password: pwd, name: '李客服', phone: '13800000002',
    role: 'staff', status: 1,
  });
  const staff2 = await userRepo.save({
    account: 'staff02', password: pwd, name: '张客服', phone: '13800000003',
    role: 'staff', status: 1,
  });
  const customer1 = await userRepo.save({
    account: 'customer01', password: pwd, name: '陈客户', phone: '13900000001',
    company: '示例科技有限公司', role: 'customer', status: 1,
  });
  const customer2 = await userRepo.save({
    account: 'customer02', password: pwd, name: '刘客户', phone: '13900000002',
    company: '示例贸易公司', role: 'customer', status: 1,
  });
  console.log('[seed] 演示账号：manager / staff01 / staff02 / customer01 / customer02，密码均为 123456');

  const catRepo = AppDataSource.getRepository(Category);
  const categories = await catRepo.save([
    { name: '软件故障', sort: 1, status: 1 },
    { name: '硬件故障', sort: 2, status: 1 },
    { name: '账号与权限', sort: 3, status: 1 },
    { name: '其他问题', sort: 4, status: 1 },
  ]);
  console.log('[seed] 工单分类 4 条');

  const faqRepo = AppDataSource.getRepository(Faq);
  await faqRepo.save([
    { question: '如何提交售后工单？', answer: '登录后点击“提交工单”，填写标题、问题描述并选择分类即可，系统会自动生成工单编号。', sort: 1, status: 1 },
    { question: '忘记登录密码怎么办？', answer: '请联系客服主管，由管理员在“账号管理”中为您重置密码。', sort: 2, status: 1 },
    { question: '工单多久会被处理？', answer: '工单提交后会自动通知客服主管，主管会尽快分配处理人，通常在 1 个工作日内响应。', sort: 3, status: 1 },
    { question: '如何确认工单已解决？', answer: '当客服将工单标记为“待客户确认”后，您可以在工单详情中查看处理结果，并点击“确认解决”关闭工单。', sort: 4, status: 1 },
    { question: '工单已完结还能继续提问吗？', answer: '已完结的工单不能再追加留言，您可以新建一张工单继续反馈问题。', sort: 5, status: 1 },
  ]);
  console.log('[seed] 常见问题 5 条');

  const bulletinRepo = AppDataSource.getRepository(Bulletin);
  await bulletinRepo.save([
    { title: '欢迎使用轻量企业客服工单系统', content: '本系统支持在线提交工单、进度跟踪、实时会话、AI 智能助手与满意度评价。演示账号密码均为 123456。', status: 1 },
    { title: '系统维护通知（示例）', content: '为提升服务稳定性，系统将于每周日凌晨 02:00-04:00 进行例行维护。', status: 1 },
  ]);

  const phraseRepo = AppDataSource.getRepository(Phrase);
  await phraseRepo.save([
    { content: '您好，已收到您的工单，我们正在为您处理，请耐心等待。', sort: 1, status: 1 },
    { content: '您好，您描述的问题已定位，正在为您修复，稍后回复您处理结果。', sort: 2, status: 1 },
    { content: '您好，经排查该问题已解决，请您确认后点击“确认解决”，感谢您的反馈。', sort: 3, status: 1 },
    { content: '您好，您的问题需要进一步核实，我们将在 1 个工作日内给您答复。', sort: 4, status: 1 },
  ]);
  console.log('[seed] 公告 2 条、快捷回复 4 条');

  const ticketRepo = AppDataSource.getRepository(Ticket);
  const msgRepo = AppDataSource.getRepository(Message);
  const logRepo = AppDataSource.getRepository(TicketLog);

  const slaRepo = AppDataSource.getRepository(SlaPolicy);
  const sla = await slaRepo.findOne({ where: { priority: 'normal' } });
  const hoursLater = (h: number) => new Date(Date.now() + h * 3600 * 1000);

  const t1 = await ticketRepo.save({
    no: genNo(), title: '登录系统提示账号或密码错误', content: '早上开始登录系统一直提示“账号或密码错误”，已确认密码没有输错，请帮忙核查。',
    categoryId: categories[2].id, customerId: customer1.id, staffId: staff1.id, status: 'processing',
    priority: 'high', fieldValues: JSON.stringify({ '问题紧急程度': '紧急' }), channel: 'web',
    slaResponseAt: sla ? hoursLater(sla.responseHours) : null, slaResolveAt: sla ? hoursLater(sla.resolveHours) : null,
  });
  const t2 = await ticketRepo.save({
    no: genNo(), title: '打印报表时出现乱码', content: '导出 PDF 报表时中文全部变成乱码，之前是正常的。',
    categoryId: categories[0].id, customerId: customer2.id, staffId: staff2.id, status: 'waiting',
    priority: 'normal', fieldValues: null, channel: 'web',
    slaResponseAt: sla ? hoursLater(sla.responseHours) : null, slaResolveAt: sla ? hoursLater(sla.resolveHours) : null,
  });
  const t3 = await ticketRepo.save({
    no: genNo(), title: '扫码枪无法识别条码', content: '新采购的扫码枪连接电脑后无法识别条码，驱动已安装。',
    categoryId: categories[1].id, customerId: customer1.id, staffId: staff1.id, status: 'closed', closedAt: new Date(),
    priority: 'normal', fieldValues: JSON.stringify({ '设备型号': 'Honeywell 1470G', '问题紧急程度': '一般' }), channel: 'web',
    slaResponseAt: sla ? hoursLater(sla.responseHours) : null, slaResolveAt: sla ? hoursLater(sla.resolveHours) : null,
  });

  await msgRepo.save([
    { ticketId: t1.id, senderId: customer1.id, senderType: 'customer', content: '早上开始登录系统一直提示“账号或密码错误”，已确认密码没有输错，请帮忙核查。' },
    { ticketId: t1.id, senderId: staff1.id, senderType: 'staff', content: '您好，已收到您的工单。请确认账号是否包含大写字母，我们正在为您核查账号状态。' },
    { ticketId: t2.id, senderId: customer2.id, senderType: 'customer', content: '导出 PDF 报表时中文全部变成乱码，之前是正常的。' },
    { ticketId: t2.id, senderId: staff2.id, senderType: 'staff', content: '您好，已定位为报表字体缺失问题，已为您更新字体配置，请重新导出试试，确认后点击“确认解决”。' },
    { ticketId: t3.id, senderId: customer1.id, senderType: 'customer', content: '新采购的扫码枪连接电脑后无法识别条码，驱动已安装。' },
    { ticketId: t3.id, senderId: staff1.id, senderType: 'staff', content: '您好，经排查是扫码枪默认输入法冲突，已为您调整为 USB-HID 模式，问题解决。' },
  ]);
  await logRepo.save([
    { ticketId: t1.id, operatorId: customer1.id, action: 'create', detail: '客户提交工单' },
    { ticketId: t1.id, operatorId: manager.id, action: 'assign', detail: '分配给 李客服（staff01）' },
    { ticketId: t1.id, operatorId: staff1.id, action: 'reply', detail: '客服回复留言' },
    { ticketId: t2.id, operatorId: customer2.id, action: 'create', detail: '客户提交工单' },
    { ticketId: t2.id, operatorId: manager.id, action: 'assign', detail: '分配给 张客服（staff02）' },
    { ticketId: t2.id, operatorId: staff2.id, action: 'reply', detail: '客服回复留言' },
    { ticketId: t2.id, operatorId: staff2.id, action: 'status', detail: '状态变更为 待客户确认' },
    { ticketId: t3.id, operatorId: customer1.id, action: 'create', detail: '客户提交工单' },
    { ticketId: t3.id, operatorId: manager.id, action: 'assign', detail: '分配给 李客服（staff01）' },
    { ticketId: t3.id, operatorId: staff1.id, action: 'reply', detail: '客服回复留言' },
    { ticketId: t3.id, operatorId: staff1.id, action: 'status', detail: '状态变更为 已完结' },
    { ticketId: t3.id, operatorId: customer1.id, action: 'confirm', detail: '客户确认解决方案，工单关闭' },
  ]);

  const satRepo = AppDataSource.getRepository(Satisfaction);
  await satRepo.save({ ticketId: t3.id, rating: 5, comment: '处理很快，服务态度很好，非常满意！' });
  console.log('[seed] 示例工单 3 张 + 留言/日志/评价');

  await AppDataSource.destroy();
  console.log('[seed] 种子数据写入完成');
}

seed().catch((err) => {
  console.error('[seed] 失败：', err);
  process.exit(1);
});
