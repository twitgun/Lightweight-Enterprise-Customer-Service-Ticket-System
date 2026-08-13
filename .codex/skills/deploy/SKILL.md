---
name: deploy
description: 部署轻量企业客服工单系统（本地演示 / 生产环境），含验证清单与回滚
---

# 部署

## 本地部署（开发/演示）

1. 确认 MySQL 8 运行中，库 `ticket_system` 可连接（`server/src/database.ts`）；
2. 初始化数据：`cd ticket-system/server && npm run seed`（幂等，可重复执行）；
3. 启动后端：`cd ticket-system/server && npm start`（:3000）；
4. 启动前端：`cd ticket-system/web && npm run dev`（:5173）；
5. 浏览器访问 http://127.0.0.1:5173 ，用演示账号验证登录。

验证清单：登录 → 建单 → 分配 → 回复 → 确认 → 看板 → 智能问答 → 实时推送。

## 生产部署（参考）

1. 前端构建：`cd ticket-system/web && npm run build`，产物部署到 Nginx/静态托管，`/api` 反向代理到后端；
2. 后端：使用 `pm2` 或 systemd 常驻运行 `npm start`，配置环境变量覆盖数据库连接；
3. 检查项：JWT 密钥、CORS 白名单、AI 服务商 API Key（存环境变量）、HTTPS；
4. 发布后跑一遍 TC001-TC024 核心回归（见 `08-测试用例.md`）。

## 回滚

- 保留上一版本构建产物与数据库备份；出问题时切回旧产物/旧版本代码并恢复备份。
