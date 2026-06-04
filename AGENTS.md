# GuardX 原型系统 · AGENTS 指南

本文件用于约束与统一该仓库的实现方式，确保多人/多 Agent 协作时产出一致、可扩展、可维护的原型系统。

## 目标范围

- 以 [PRD.md](file:///d:/github/guardx-prd/PRD.md) 为基准实现 Admin 管理系统原型（组织/用户/设备/批次/告警等模块的页面与关键交互）。
- 同时补齐 Web 大屏（Wallboard）原型与登录页，形成端到端可演示闭环。
- 原型侧重信息结构、页面流转、交互反馈与视觉一致性；数据以本地 mock 为主，不接真实后端。

## 运行与校验

- 安装依赖：`npm i`
- 本地开发：`npm run dev`
- 构建：`npm run build`
- Lint：`npm run lint`

## 技术栈与边界

- Vite + React + TypeScript
- React Router（`react-router-dom`）
- TailwindCSS（以 class 驱动的 Light/Dark 主题）
- 不新增大型状态管理/组件库（避免引入复杂依赖）；优先用 React Context + hooks 组织全局状态

## 目录约定（建议最终形态）

- `src/app/`：应用级能力（路由、主题、鉴权、布局骨架、全局样式、providers）
- `src/pages/`：页面级组件（按路由拆分；只做组合与布局，不堆业务逻辑）
- `src/features/`：按业务域拆分（org/users/devices/batches/alarms/auth），包含视图片段、表单、表格、hooks
- `src/components/`：可复用的纯 UI 组件（Card/Button/Badge/Modal/Table 等）
- `src/lib/`：工具函数（格式化、校验、权限判断、className 合并等）
- `src/mocks/`：mock 数据与 mock 服务（内存 CRUD、延迟、错误模拟）
- `src/types/`：共享类型（实体、DTO、权限、枚举）

如果代码量较小，允许先以 `src/pages` + `src/components` 为主；一旦出现“一个文件承担多模块职责”，立即按上述结构拆分。

## 路由与信息架构（必须）

路由以“三段式”划分：

- `/login`：登录页
- `/wallboard`：Web 大屏首页（全局可访问；被 403 重定向的落点）
- `/admin/*`：Admin 管理系统（需登录；并受角色权限控制）

Admin 内部一级导航建议：

- `/admin/overview`：概览/仪表盘（聚合关键指标卡片）
- `/admin/orgs`：组织列表
- `/admin/orgs/:orgId`：组织详情（上方信息 + Tab：用户/设备/告警统计）
- `/admin/users`：用户列表（System Admin 专属；Org Admin 通过组织详情管理用户）
- `/admin/devices`：设备列表
- `/admin/devices/new`：新增设备（绑定页）
- `/admin/devices/:deviceId`：设备详情
- `/admin/batches`：批次列表（System Admin 专属）
- `/admin/batches/new`：新增批次
- `/admin/batches/:batchId`：批次详情（设备状态明细）
- `/admin/alarms`：告警列表

## 鉴权与权限（原型策略）

### 会话模型

- `accessToken` + `refreshToken`：存储在 `localStorage`（原型阶段即可；不打印、不落日志）
- `user`：包含 `id/name/orgId/role/permissions`

### 原型实现规则

- 登录成功后：写入 tokens 与 user，并跳转至 `/admin/overview`
- 退出登录：清理 tokens 与 user，并跳转至 `/login`
- 未登录访问 `/admin/*`：重定向 `/login`
- 已登录但无权限访问某路由：展示 403 页面，并提供“返回 Web 大屏”按钮，跳转 `/wallboard`

### 角色与权限枚举（建议）

- `SystemAdmin`
- `OrgAdmin`
- `OrgUser`

权限粒度用“模块访问 + 动作”表达（示例）：

- `org:read` / `org:write`
- `user:read` / `user:write`
- `device:read` / `device:write`
- `batch:read` / `batch:write`
- `alarm:read` / `alarm:write`

路由守卫以“模块访问”优先（例如访问 `/admin/batches` 需要 `batch:read`）。

## Mock 数据与交互底线

- 所有列表页必须具备：
  - 搜索（至少 1 个可用字段）
  - 筛选（至少 1 个维度）
  - 分页（前端分页即可）
  - 空态与加载态
- 表单必须具备：
  - 必填校验
  - 提交成功反馈（Toast 或页面内提示）
  - 提交失败反馈（可通过 mock 随机错误演示）
- 删除/危险操作必须二次确认（Modal）

## UI 实现规范（强约束）

- 页面风格：卡片式信息架构（内容全部落在 Card 内）
- 主题：军绿色（以 `DESIGN.md` 的 token 为准），支持 Light/Dark 切换
- 禁止在代码中新增解释性注释（如需说明请写进文档或通过更清晰的命名表达）
- 组件命名统一使用 PascalCase，文件名与导出保持一致
- 优先函数式组件与 hooks；避免 class component

## 交付检查清单（每次变更自检）

- 能从 `/login` 完成登录 → 进入 Admin → 退出回到登录
- Light/Dark 切换在刷新后保持（持久化）
- `/admin/*` 访问控制正确：未登录跳登录；无权限显示 403 并可返回大屏
- 任一列表页具备：加载态、空态、分页、筛选/搜索

