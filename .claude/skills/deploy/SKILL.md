---
name: deploy
description: 部署轻量企业客服工单系统（本地演示 / 生产环境）
---

# 部署工作流

## 前置检查

- 环境：Node.js ≥ 20、MySQL 8（库 `ticket_system`，utf8mb4）、npm；
- 数据库连接可通（`server/src/database.ts` 或环境变量）；
- 依赖已安装（`server` 与 `web` 各 `npm install`）。

## 本地部署

```bash
cd ticket-system/server && npm run seed   # 初始化演示数据（幂等）
cd ticket-system/server && npm start      # 后端 :3000
cd ticket-system/web && npm run dev       # 前端 :5173
```

验证清单：登录（任一演示账号）→ 建单 → 分配 → 回复 → 确认 → 看板 → 智能问答 → 实时推送。

## 生产部署

1. 前端：`npm run build`，产物放 Nginx/静态托管，`/api` 与 Socket.IO 反向代理到后端；
2. 后端：pm2/systemd 常驻，敏感配置走环境变量（DB、JWT_SECRET、AI API Key）；
3. 安全：HTTPS、CORS 白名单、限流、日志脱敏；
4. 上线后跑一遍 TC001-TC024 核心回归（见 `08-测试用例.md`）。

## 回滚

- 保留上一版本构建产物与数据库备份；出问题时切回旧产物/旧版本代码并恢复备份。
