# GuardX 原型系统 · DESIGN 规范

本文件定义该原型系统的视觉语言与 UI 组件约束，目标是：卡片式信息架构、军绿色品牌气质、Light/Dark 一键切换、在 Admin 与 Web 大屏两端保持一致。

## 设计关键词

- 军绿色：克制、可靠、秩序感
- 卡片化：信息块清晰分组，降低表格/表单密度压力
- 高对比但不刺眼：Dark 模式优先降低纯黑纯白对比，强调“可读性”
- 数据表达：用 Badge/Tag/小型 KPI 卡片承载状态与数量

## 主题与 Token（实现要求）

采用 Tailwind + CSS Variables 组合方案：

- Tailwind `darkMode: 'class'`
- `:root` 定义 Light token；`html.dark` 覆盖 Dark token
- Tailwind 颜色映射到 token（避免在业务组件里写死颜色值）

### 核心颜色（建议值）

- Brand（军绿）
  - `--brand-600`: `#355e3b`
  - `--brand-700`: `#2a4b30`
  - `--brand-800`: `#203a25`
- Background
  - Light：`--bg`: `#0b0f0c` 的反向体系，即 `#f7f8f6`（偏冷灰白）
  - Dark：`--bg`: `#0b0f0c`（极深绿黑）
- Surface（卡片底色）
  - Light：`--surface`: `#ffffff`
  - Dark：`--surface`: `#111714`
- Border
  - Light：`--border`: `#e3e7e2`
  - Dark：`--border`: `#243029`
- Text
  - Light：`--fg`: `#0f1a12`，`--muted`: `#5a6b60`
  - Dark：`--fg`: `#e7efe9`，`--muted`: `#97a79d`
- Status
  - `--success`: `#22c55e`
  - `--warning`: `#f59e0b`
  - `--danger`: `#ef4444`
  - `--info`: `#38bdf8`

### 阴影与圆角

- 圆角：页面级 Card 统一 `rounded-2xl`；表格/小卡 `rounded-xl`
- 阴影：尽量克制，优先 `shadow-sm`，Hover 使用 `shadow-md`
- 边框优先于阴影：默认用 `border` 强调层级，阴影只用于可点击卡片

## 布局与栅格

### Admin

- 全局结构：左侧侧边栏（固定宽度） + 顶部栏（可选） + 内容区
- 内容区：所有内容必须落在 Card 容器内；页面背景只作为留白
- 列表页：
  - 顶部：页面标题 + 主操作（新增/导出）
  - 次行：筛选/搜索区（同一张 Card 或独立 Card）
  - 主体：表格 Card（含分页）

### Web 大屏（Wallboard）

- 基准分辨率：1920×1080 进行布局；可自适应缩放
- 结构：顶部状态条 + 3 列或 2 列网格 KPI/图表占位 + 底部告警滚动/列表
- 高密度信息：用“小卡 + 简洁字重”替代大段文字

## 组件规范（类名即契约）

下面是“必须实现/复用”的 UI 原语；各页面禁止自行发明不一致的样式体系。

### Card

- 容器：`bg-surface border border-border rounded-2xl`
- 标题区：`flex items-center justify-between gap-3`
- 内容区：统一内边距 `p-5`（大屏可 `p-4`/`p-6` 按密度调整）
- 可点击态：Hover 提升阴影与边框色（Brand 轻强调）

### Button

- Primary：军绿色底 + 白字；Hover 加深；Disabled 降饱和
- Secondary：Surface 底 + Border；Hover 提升阴影
- Danger：红色系仅用于删除/停用等危险动作

### Badge / StatusDot

- 在线：绿色
- 离线：灰色（Muted）
- 待处理：红
- 处理中：黄
- 已处理：绿

### Table

- 表头使用 `text-muted` + `bg` 的弱区分
- 行 Hover 轻微背景色变化；行内操作用 icon button（或 text button）
- 空态、加载态必须有可视化呈现（Skeleton 或占位文案均可）

### Modal / Confirm

- 危险操作二次确认（删除、停用、解绑）
- 必须有明确的主按钮文案（如“确认删除”）

### Form

- Label/Hint/Error 三行结构优先
- 必填校验：即时提示 + 提交拦截

## 交互细则

- 主题切换：
  - 默认跟随系统（首次进入）
  - 用户切换后写入本地持久化，刷新后保持
- 导航可见性：
  - System Admin：可见全量模块
  - Org Admin：隐藏批次管理、全局用户管理等无权限模块
  - Org User：只保留与告警/设备查看相关模块（原型可适当收敛）
- 403：
  - 明确文案：“无权限访问该页面”
  - 主按钮：“返回 Web 大屏”

## 图标与插画

- 优先使用内联 SVG（单色，跟随文字颜色）
- 大屏可使用轻量图标与几何装饰，但必须服从“军绿 + 克制”调性

