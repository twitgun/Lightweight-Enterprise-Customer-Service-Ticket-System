# 代码风格规范（全局生效）

## 后端（NestJS + TypeScript）

- 模块化：每个业务域一个 Module，控制器只做参数解析与守卫声明，业务逻辑放 Service；
- 命名：类 `PascalCase`、方法/变量 `camelCase`、常量 `UPPER_SNAKE`，表字段统一 `snake_case`；
- 实体集中在 `entities.ts`，字段类型与数据库一致，外键用 `xxxId` 命名；
- 异步统一 `async/await`，错误抛 `HttpException` 并给出中文提示；
- 查询使用 TypeORM 参数绑定（`:param`），禁止字符串拼接 SQL；
- 接口必须声明角色：`@Roles('staff', 'manager')`，未声明默认需登录。

## 前端（Vue 3 + Element Plus）

- 组件 `PascalCase.vue`，页面按角色分目录（`views/customer|staff|manager`）；
- 请求统一走 `src/api/` 封装，页面不直接写 axios；
- 状态管理用 Pinia（`store/auth.js`），本地偏好（语言/主题）持久化；
- 文案走 `src/i18n/zh.js` / `en.js`，新文案两个语言包都要补；
- 样式使用 `src/styles/` 的主题变量，不写魔法色值。

## Git 提交

- 提交信息中文，格式：`<类型>: <摘要>`（feat/fix/refactor/docs/style/test/chore）；
- 不提交：`node_modules/`、`dist/`、`*.log`、`*.err`、`feishu-sync/`、个人覆盖文件。
