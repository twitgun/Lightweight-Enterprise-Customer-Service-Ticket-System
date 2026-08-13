# 轻量企业客服工单系统 —— Codex 项目指令

本文件是 Codex 在本仓库工作时的项目级指令（对本仓库生效）。
团队共享，提交到 git。

## 项目简介

一个**小而完整**的企业售后客服工单系统：

- 前端：Vue 3 + Element Plus + Pinia + Vite（`ticket-system/web`）
- 后端：NestJS 10 + TypeORM + JWT + Socket.IO（`ticket-system/server`）
- 数据库：MySQL 8，库名 `ticket_system`，连接配置在 `server/src/database.ts`（本地 root/root）
- 角色：`customer`（客户）/ `staff`（客服专员）/ `manager`（客服主管）

核心闭环：客户提交工单 → 主管分配 → 客服处理回复 → 标记待确认 → 客户确认完结 → 满意度评价。

## 常用命令

```bash
# 后端（默认 3000）
cd ticket-system/server && npm start          # 启动 API
cd ticket-system/server && npm run seed       # 初始化/补全演示数据（幂等）

# 前端（默认 5173）
cd ticket-system/web && npm run dev           # 开发服务器
cd ticket-system/web && npm run build         # 构建产物
```

演示账号：`manager` / `staff01` / `staff02` / `customer01` / `customer02`，密码均为 `123456`。

## 架构约定

- 接口统一前缀 `/api/v1`，全部走 JWT 鉴权（`common/guards.ts` 的 JwtAuthGuard + RolesGuard）；
- 后端按业务模块拆分：`auth / users / categories / tickets / faqs / bulletins / phrases / stats / ai / realtime / notifications / channels / satisfactions / forms / system / settings`；
- 数据表实体集中在 `server/src/entities.ts`，新增模块需在 `app.module.ts` 注册；
- 前端路由按角色渲染菜单（`web/src/router/index.js`），接口封装在 `web/src/api/`；
- 实时消息走 Socket.IO（`web/src/utils/socket.js` ↔ `server/src/realtime/`）。

## 工作方式

- 改动前先读相关模块代码，复用现有工具函数与守卫，不要重复造轮子；
- 后端接口必须带角色约束；涉及跨用户数据的接口要确认越权校验；
- 数据库改动优先走 seed 脚本或说明迁移步骤，不要手改生产数据；
- 提交信息使用中文、简短描述「做了什么 + 为什么」；
- 用技能完成专项任务：`@review`（代码审查）、`@fix-issue`（修 Bug）、`@deploy`（部署）、`@security-review`（安全评审）；
- 项目规范见下方「规范要点」，跨会话持续生效。

## 规范要点

### 代码风格

- 后端：模块化（Controller 只做解析与守卫，逻辑在 Service）；类 `PascalCase`、变量 `camelCase`、表字段 `snake_case`；异步用 `async/await`；错误抛 `HttpException` 并给中文提示；查询用 TypeORM 参数绑定，禁止拼接 SQL；
- 前端：组件 `PascalCase.vue`，页面按角色分目录（`views/customer|staff|manager`）；请求统一走 `src/api/`；文案补 `src/i18n/zh.js` 与 `en.js` 两个语言包；样式用 `src/styles/` 主题变量；
- 提交信息：`<类型>: <摘要>`（feat/fix/refactor/docs/style/test/chore）。

### 测试与回归

- 考核用例见 `08-测试用例.md`（TC001-TC024，双人分工）；
- 每次改动至少回归核心闭环：客户建单 → 分配 → 回复 → 待确认 → 确认 → 评价；
- 重点验证：越权（403）、状态机流转、实时推送、看板数字、多语言/主题切换；
- 新缺陷登记到 `08-测试用例.md` 的「测试结果记录表」。

### API 约定

- 统一前缀 `/api/v1`；认证 `Authorization: Bearer <JWT>`；REST 语义（GET/POST/PUT/DELETE）；
- 列表接口支持 `page` / `size`，返回 `{ list, total, page, size }`；
- 工单状态机：`pending → processing → pending_confirm → closed`（待确认时客户追加留言回到 processing）；
- 关键接口：`POST /api/v1/tickets`、`PUT /api/v1/tickets/:id/assign`、`POST /api/v1/tickets/:id/messages`、`PUT /api/v1/tickets/:id/status`、`PUT /api/v1/tickets/:id/confirm`、`POST /api/v1/satisfactions/tickets/:id`；
- Socket.IO：握手携带 JWT，按工单房间（`ticket:{id}`）隔离广播。

## 禁区

- 不修改 `node_modules/`、构建产物与运行日志；
- 不提交 `feishu-sync/`（内含飞书应用密钥）；
- 不做 `rm -rf`、`git reset --hard` 等破坏性操作。
