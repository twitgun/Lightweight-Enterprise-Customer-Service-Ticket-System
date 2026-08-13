# 轻量企业客服工单系统 —— 软件工程考核文档（最终版）

项目为前后端分离的企业客服工单系统：**Vue 3 + Element Plus + Vite** 前端、**NestJS** 后端、**MySQL** 数据库，覆盖客户提交 → 主管分配 → 客服处理 → 客户确认 → 满意度评价的完整闭环，并具备 AI 智能客服、知识库问答、实时会话、多渠道、SLA、通知、自定义表单、多语言等现代能力。

## 文档索引

| 序号 | 文档 | 类型 | 内容 |
| --- | --- | --- | --- |
| 1 | [00-项目要求.md](00-项目要求.md) | 需求 | 项目点子、目标、范围与边界 |
| 2 | [01-项目概述.md](01-项目概述.md) | 概述 | 定位、技术栈、功能模块、演示数据 |
| 3 | [02-参与者与业务场景.md](02-参与者与业务场景.md) | 需求分析 | 三角色、经典场景、权限矩阵 |
| 4 | [03-UML用例图.md](03-UML用例图.md) | UML | 20 个用例 + PlantUML 源码 |
| 5 | [04-UML类图.md](04-UML类图.md) | UML | 继承/扩展/组合/聚合 + PlantUML 源码 |
| 6 | [05-UML时序图.md](05-UML时序图.md) | UML | 核心闭环时序 + PlantUML 源码 |
| 7 | [06-UML活动图.md](06-UML活动图.md) | UML | 工单全生命周期活动图 + PlantUML 源码 |
| 8 | [07-用例规约.md](07-用例规约.md) | 用例规约 | 6 份规约（创建/分配/回复/确认/问答/评价） |
| 9 | [08-测试用例.md](08-测试用例.md) | 测试 | 双人分工 TC001-TC024 + 结果记录表 |
| 10 | [09-飞书-项目变更记录.md](09-飞书-项目变更记录.md) | 变更记录 | 项目全过程变更记录（可粘贴到飞书） |

## 运行方式

```bash
# 1. 初始化演示数据（可重复执行）
项目实践\ticket-system\seed.bat

# 2. 启动前后端
项目实践\ticket-system\start.bat
```

访问 <http://127.0.0.1:5173>，演示账号密码均为 `123456`（manager / staff01 / staff02 / customer01 / customer02）。

## 技术说明

- 后端模块：auth、users、categories、tickets、faqs、bulletins、phrases、stats、ai、realtime、notifications、channels、satisfactions、forms、system、settings
- 数据库：`ticket_system`（users、tickets、messages、ticket_logs、satisfactions、notifications、categories、faqs、bulletins、phrases、form_fields、channels、sla_policies、settings）
- 接口前缀：`/api/v1`，实时通道：Socket.IO
