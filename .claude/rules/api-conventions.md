# API 设计规范（全局生效）

## 基础约定

- 统一前缀 `/api/v1`；认证方式：`Authorization: Bearer <JWT>`；
- 语义化 REST：`GET` 查询、`POST` 创建、`PUT` 更新、`DELETE` 删除；
- 响应：成功直接返回业务数据（对象/数组），失败返回 `{ statusCode, message }`；
- 列表接口支持 `page` / `size` 分页，返回 `{ list, total, page, size }`；
- 时间统一 ISO 8601（UTC），前端自行本地化展示。

## 工单状态机

`pending`（待分配）→ `processing`（处理中）→ `pending_confirm`（待客户确认）→ `closed`（已完结）。

- 创建工单：`POST /api/v1/tickets`（客户）；
- 分配/转派：`PUT /api/v1/tickets/:id/assign`（主管）；
- 回复留言：`POST /api/v1/tickets/:id/messages`（客户/处理客服）；
- 状态流转：`PUT /api/v1/tickets/:id/status`（客服/主管）；
- 确认解决：`PUT /api/v1/tickets/:id/confirm`（客户）；
- 满意度：`POST /api/v1/satisfactions/tickets/:id`（客户，已完结工单）。

## 权限与安全

- 控制器用 `@Roles(...)` 声明角色，服务内再校验资源归属（如工单的 customerId / staffId）；
- 跨用户接口必须校验「数据归属」，不能只靠前端隐藏入口；
- 渠道 webhook（`channels/inbound/:type`）为公开接口，后续接入真实凭证时需加签名校验。

## 实时事件（Socket.IO）

- 连接鉴权：握手时携带 JWT；事件按工单房间隔离（`ticket:{id}`）；
- 留言/状态变更通过服务端事件广播，客户端不自行拼装消息。
