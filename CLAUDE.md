# 轻量企业客服工单系统 —— 项目级 AI 行为规则

本文件是 Claude Code 在本仓库工作时的项目级指令（对本仓库生效）。
团队共享，提交到 git；个人覆盖请写 `CLAUDE.local.md`（默认被 git 忽略）。

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
- 使用 `/review` 做代码审查、`/fix-issue` 修 Bug、`/deploy` 部署；
- 规则与规范见 `.claude/rules/`（code-style / testing / api-conventions），跨会话全局生效。

## 禁区

- 不修改 `node_modules/`、构建产物与运行日志；
- 不提交 `feishu-sync/`（内含飞书应用密钥）、`CLAUDE.local.md`、`.claude/settings.local.json`；
- 不做 `rm -rf`、`git reset --hard` 等破坏性操作。
