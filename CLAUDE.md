# CLAUDE.md — PodcastHub 项目规则

> **维护者**: huiyang (灰羊)
> **项目**: PodcastHub
> **最后更新**: 2026-04-16

---

## 项目定位

全国录音间展示与选择平台。帮助用户查看全国各地录音间的位置、基本信息、价格、联系方式、交通便利程度，并快速做出选择或联系。

- **首页** — 全屏地图总览（录音间专属），hover 预览地址/价格/交通，点击打开双 Tab 详情弹窗；默认选中录音室数量最多的城市（通过 `studioCities.ts` 共享逻辑），城市按钮按录音室数量降序排列
- **录音间列表页** — 搜索、城市筛选、深度查找与对比
- **独立详情页** — 信息去重，按"名称+城市+地址→价格→预约与联系（含 CTA）→开放时间→设备+房间→介绍→交通→作品→评价"展示，与首页弹窗、列表卡片共用 `studioPresentation` 归一化逻辑；预约按钮/二维码/联系方式合并为一个决策区块
- **录音室征集** — 导航栏"添加我的录音室"为全站主入口；首页地图 FAB 为场景化弱入口（轻量灰色"+"按钮，展开后显示"收录录音室"描边按钮）；录音间列表页保留描边风格辅助入口
- **剪辑师 / 商务** — 导航栏各自独立一级入口；剪辑师页面为"人物墙 + 人物主页"结构（4 列卡片列表 + 居中头部详情页）；商务合作为剪辑师页面内二级链接；两线边界：录音间是找场地，剪辑师是找人
- **导航架构（Web）** — 四主入口（首页 / 录音间 / 剪辑师 / 商务）+ "添加我的录音室" + 反馈
- **导航架构（小程序）** — 双 Tab（录音室 + 创作者）；创作者 Tab 内分段控件切换剪辑师/制作人

---

## 启动必读

每次重新接手这个项目时，按下面顺序建立上下文：

1. 先读本文件 `CLAUDE.md`
   目的：快速了解真实架构、目录索引、当前线上状态、关键已知问题。
2. 再读 [PROJECT_MEMORY.md](/Users/lihuiyang/Desktop/工作区/01-项目孵化器/PodcastHub/.claude/PROJECT_MEMORY.md)
   目的：了解最近做了什么、踩过哪些坑、接下来做什么。
3. 最后读 [README.md](/Users/lihuiyang/Desktop/工作区/01-项目孵化器/PodcastHub/README.md)
   目的：查看面向人的功能说明、环境变量、启动/部署方式。

凡是涉及：
- 上线
- 数据库
- Vercel
- Supabase
- 域名
- 地图
- 后台编辑页

都默认属于**跨系统任务**，必须先计划再执行。

---

## 当前线上架构

当前项目已经完成从本地 MVP 到线上双项目架构的切换：

| 层 | 当前实现 |
|---|---|
| 前端 | Vercel 项目 `podcasthub` |
| 后端 | Vercel 项目 `podcasthub-api`（FastAPI Python Runtime） |
| 数据库 | Supabase Postgres |
| 文件存储 | Supabase Storage（桶：`podcasthub-media`） |
| 前端正式域名 | `https://podcasthub.daydayup.media` |
| 后端正式域名 | `https://api.daydayup.media` |
| 录音室提交入口 | `https://podcasthub.daydayup.media/submit-studio` → 跳转飞书表单（新链接） |
| 地图 | 高德 JS API v2.0（前端加载） |

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| 后端 | Python + FastAPI + SQLAlchemy |
| 数据库 | Supabase Postgres（本地开发兼容 SQLite） |
| 存储 | Supabase Storage |
| 地图 | 高德地图 JS API v2.0 (前端渲染) + Web Service API (后端地理编码) |
| HTTP | axios (前端) + httpx (后端) |
| 反馈 | 飞书自定义机器人 Webhook |

---

## 项目结构

```text
PodcastHub/
├── CLAUDE.md                    # 本文件 — 项目级规则
├── README.md                    # 面向人的项目说明
├── .claude/
│   └── PROJECT_MEMORY.md        # 决策、进度、错误日志
│
├── backend/                     # FastAPI 后端（本地可跑 / Vercel可部署）
│   ├── .env                     # 本地环境变量
│   ├── .python-version          # Vercel Python Runtime 版本
│   ├── config.py                # DATABASE_URL / Supabase / CORS 等集中配置
│   ├── main.py                  # FastAPI 入口 + CORS + 条件静态挂载
│   ├── requirements.txt
│   ├── api/
│   │   └── index.py             # Vercel Python 入口（from main import app）
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/            # 数据库迁移
│   ├── models/
│   │   ├── database.py          # SQLAlchemy 模型
│   │   └── schemas.py           # Pydantic 模型
│   ├── routers/
│   │   ├── studios.py           # 录音间 CRUD + /cities + 上传 + charging_method推导
│   │   ├── editors.py           # 剪辑师 CRUD
│   │   ├── business.py          # 商务 CRUD
│   │   ├── feedback.py          # 飞书反馈提交
│   │   ├── reviews.py           # 录音室评价 CRUD
│   │   ├── auth.py              # 后台密码认证
│   │   ├── change_requests.py   # 变更申请（审批 + diff + 同步上线）
│   │   └── feishu_sync.py       # 飞书结果表同步（拉取 + 比对 + 同步）
│   ├── services/
│   │   ├── image_service.py     # 图片上传（支持 Supabase Storage）
│   │   └── studio_pricing.py    # 收费方式推导
│   ├── scripts/                 # SQLite/Supabase 导入导出与切换脚本
│   ├── supabase/
│   │   ├── migrations/          # 供 Supabase 使用的 SQL mirror
│   │   └── seed.sql             # 当前种子数据 mirror
│   ├── geocode_studios.py       # 高德地理编码脚本
│   ├── import_data.py           # Excel 导入脚本
│   └── data/                    # 本地开发遗留数据目录
│
└── frontend/                    # Next.js 前端
    ├── .env.local               # 前端环境变量
    ├── app/
    │   ├── layout.tsx           # 根布局
│   ├── page.tsx             # 首页 — 地图 + hover卡 + 双Tab详情弹窗（录音室信息/图片）
│   ├── admin/
│   │   ├── layout.tsx           # 后台认证守卫（AdminAuthGuard）
│   │   ├── studios/page.tsx     # 线上录音室编辑页
│   │   ├── feishu-sync/         # 飞书结果表同步页（拉取 + diff + 确认上线）
│   │   └── change-requests/     # 变更申请审核页（审批 + diff + 同步上线）
│   ├── submit-studio/       # 录音室征集页，跳转飞书表单
│   ├── studios/             # 录音间模块
    │   ├── editors/             # 剪辑师模块
    │   ├── business/            # 商务模块
    │   └── components/
    │       ├── Navbar.tsx
    │       ├── StudioTransitGrid.tsx
    │       ├── StudioRecruitmentFab.tsx
    │       ├── StudioDetailSection.tsx
    │       ├── StudioDetailInfoTab.tsx
    │       ├── StudioDetailImageTab.tsx
    │       ├── FeedbackModal.tsx
    │       └── ...
    ├── lib/
    │   ├── api.ts               # axios API 客户端
    │   ├── studioForm.ts        # 录音室表单转换
    │   ├── studioPresentation.ts# 开放时间/预约/联系方式展示归一化
    │   ├── studioCities.ts      # 城市排序与默认选中共享逻辑（按录音室数量降序）
    │   ├── studioSubmission.ts  # 飞书表单提交入口常量
    │   ├── studioTransport.ts   # 距离/打车时间估算
    │   └── types.ts             # TypeScript 类型定义
    └── tailwind.config.js

├── mini-program/                 # 微信小程序（Taro 4.2.0 + React + TypeScript）
│   ├── package.json
│   ├── project.config.json       # AppID: wx35e6dc5fa25601ab
│   ├── tsconfig.json
│   ├── config/index.ts           # Taro 构建配置
│   └── src/
│       ├── app.tsx
│       ├── app.config.ts
│       ├── pages/
│       │   ├── studios/          # TabBar 主入口：搜索+城市筛选+卡片列表+提交/反馈按钮（已实现）
│       │   ├── creators/         # TabBar 第二入口：分段控件（剪辑师/制作人）+搜索+卡片列表（已实现）
│       │   ├── studio-detail/    # 详情页：决策与判断（已实现）
│       │   ├── creator-detail/   # 创作者详情页：kind=editor|business（已实现）
│       │   ├── submit-studio/    # 提交录音室（已实现基础版）
│       │   ├── feedback/         # 反馈（占位版）
│       │   ├── admin-login/      # 管理员登录（占位）
│       │   └── admin/            # 管理后台（占位）
│       ├── services/
│       │   ├── request.ts        # Taro.request 封装
│       │   ├── studio.ts         # 录音室 API（getCities/getStudios/getStudioDetail）
│       │   └── creator.ts        # 创作者 API（getEditors/getEditorDetail/getBusinessList/getBusinessDetail）
│       ├── types/
│       │   └── index.ts          # StudioListItem/Studio/EditorListItem/Editor/BusinessListItem/Business/PaginatedResponse
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── utils/
│       ├── assets/
│       └── styles/
│
├── docs/mini-program/            # 小程序项目文档（总纲 + 9 个子文档 + prompts/）
├── docs/web/                     # Web 端项目文档（总纲 + 11 个子文档 + prompts/）
```

---

## 数据模型重点

### studios

关键字段：
- `name`
- `description`（补充介绍，不再兼任开放时间）
- `open_hours`（独立开放时间字段，2026-04-11 新增）
- `city`
- `district`
- `address`
- `longitude`
- `latitude`
- `equipment`
- `price_per_hour`
- `price_per_day`
- `price_note`
- `charging_method`
- `booking_url`
- `booking_note`
- `booking_qr_image`（预约二维码图片，2026-04-12 新增，支持小程序码/公众号二维码等非网页预约方式）
- `contact_name`
- `contact_phone`
- `contact_wechat`

说明：
- `charging_method` 是 2026-04-10 新增的正式字段，用于结构化展示"免费 / 按小时收费 / 按时段收费 / 按天收费 / 咨询后报价"等信息。
- 首页 hover、详情页、后台页都已经接入这个字段。
- `open_hours` 是 2026-04-11 新增的独立字段，将开放时间从 `description` 中拆分出来。之前开放时间通过 `description` 里手写 `开放时间:` 前缀再正则解析，现在直接读独立字段。旧数据已迁移，展示层保留 fallback 兼容。
- `description` 现在只用于存储"补充介绍"，不再兼任开放时间。
- `booking_qr_image` 是 2026-04-12 新增字段，存储预约二维码图片 URL（如微信小程序码、公众号二维码）。后台支持文件上传和手动填写 URL，前台详情页和弹窗以 128x128 图片 + "扫码预约" 标题展示。预约区域现在统一支持三层能力：链接预约、扫码预约、预约说明，三者互不覆盖。
- 展示层额外通过 `studioPresentation.ts` 对 `price_note`、`booking_note`、联系方式做去重归一化，避免同一条信息在多个卡片区块重复出现。

---

## API 设计

### 录音间

```text
GET    /api/studios/list?city=&tag=&search=&page=&size=  列表
GET    /api/studios/cities                               城市列表（按录音室数量降序，返回 {city, count}[]）
GET    /api/studios/detail/{id}                          详情
POST   /api/studios/create                               创建
PUT    /api/studios/update/{id}                          更新
DELETE /api/studios/delete/{id}                          软删除
POST   /api/studios/{id}/upload                          上传封面图
POST   /api/studios/{id}/upload-qr                       上传预约二维码图片
```

### 剪辑师 / 商务

```text
GET  /api/editors/list?skill=&search=&page=&size=
GET  /api/editors/detail/{id}
...
GET  /api/business/list?type=&search=&page=&size=
GET  /api/business/detail/{id}
...
```

### 反馈

```text
POST /api/feedback
POST /api/feedback/submit   # 兼容旧路径
```

### 录音室评价

```text
POST   /api/reviews                         提交体验评价（绑定 studio_id，默认 pending）
GET    /api/reviews/studio/{studio_id}       获取已发布评价列表
GET    /api/reviews/studio/{studio_id}/count 获取评价数量
GET    /api/reviews/counts                   批量获取所有录音室评价数量
```

### 后台认证

```text
POST   /api/auth/admin/login   密码验证（返回 HMAC token）
GET    /api/auth/admin/verify   验证 token 有效性
```

### 变更申请（审批 + diff + 同步上线）

```text
POST   /api/change-requests/create              创建变更申请
GET    /api/change-requests/list?status=pending   列表（支持状态筛选）
GET    /api/change-requests/detail/{id}           详情
GET    /api/change-requests/diff/{id}             预览差异（不写入）
PUT    /api/change-requests/approve/{id}          审批通过
PUT    /api/change-requests/reject/{id}           拒绝
PUT    /api/change-requests/apply/{id}            应用变更（生成 diff → 写入 studios 表）
```

### 飞书结果表同步（拉取 + 比对 + 同步）

```text
GET    /api/feishu-sync/records                    拉取飞书结果表数据（映射后的）
GET    /api/feishu-sync/compare                    比对飞书结果表与线上数据，返回 diff
POST   /api/feishu-sync/apply                      执行同步（新增/更新/软删除）
```

工作流：飞书问卷收集 → 飞书结果表整理 → 人工确认 diff → 同步线上
- 问卷链接：`https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15`
- 结果表：`https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd`
- 后端通过 lark-cli 读取飞书结果表，按名称比对线上 studios 表
- 删除为软删除（`is_active=false`），以飞书结果表中保留的记录为准

---

## 环境变量

### backend/.env（本地）

```env
DEBUG=true
DATABASE_URL=sqlite:///绝对路径/到/backend/data/podcasthub.db
AUTO_INIT_DB=true
AMAP_JS_KEY=xxx
AMAP_WEB_KEY=xxx
FEISHU_WEBHOOK_URL=
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=podcasthub-media
```

### frontend/.env.local（本地）

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_AMAP_JS_KEY=xxx
```

### Vercel 线上环境变量

前端至少需要：

```env
NEXT_PUBLIC_API_BASE=https://api.daydayup.media
NEXT_PUBLIC_AMAP_JS_KEY=xxx
NEXT_PUBLIC_STUDIO_SUBMISSION_URL=https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15
```

后端至少需要：

```env
DATABASE_URL=postgresql+psycopg://...
AUTO_INIT_DB=false
CORS_ALLOW_ORIGINS=https://podcasthub.daydayup.media,https://daydayup.media
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=podcasthub-media
```

---

## 启动与部署

### 本地开发

```bash
# 后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

### 线上部署

```bash
# 后端
cd backend
vercel --prod --yes

# 前端
cd frontend
vercel --prod --yes
```

---

## 关键设计决策

| 决策 | 原因 |
|---|---|
| 三张独立表而非单表多态 | 三种角色字段差异大，避免大量空字段 |
| JSON 列存列表数据 | MVP 简单优先，线上已迁到 Postgres JSONB |
| 首页地图 + hover 卡 + 双 Tab 详情弹窗 | 兼顾快速扫点和深入查看；信息优先于图片 |
| 前端 AMap JS API 动态加载 | 避免 SSR 问题，仅在客户端加载地图脚本 |
| 前后端拆成双 Vercel 项目 | 保持前端轻量，同时让 FastAPI 拥有独立 API 子域名 |
| 数据切到 Supabase + 图片切到 Storage | 摆脱 SQLite 和本地 uploads 的线上限制 |
| 后台先做轻量录音室管理页 | 先把线上编辑链路打通，认证和权限下一轮补 |
| 后台列表支持按城市筛选 | 录音室增多后需城市维度管理 | 动态城市列表 + 搜索叠加过滤，前端本地筛选 |
| 录音室征集先走飞书问卷 + 人工审核 | 用最小成本把"用户提交 -> 站内上线"链路跑通 |
| 简洁版问卷：同类信息合并成一道题 | 旧问卷字段拆得太细（20+ 题），合并为 9 题更自然 | 空间特性/收费/预约等用长文本填空，导入时再解析 |
| 城市首屏 fitView 只基于录音室 marker | 交通枢纽（浦东机场等远距离点）会拉大视野，把录音室挤偏；枢纽仍显示但不参与 bounds 计算 |
| 交通枢纽按需启用（城市注册表） | 只为有录音棚的城市注册和展示交通枢纽，没有录音棚的城市不生成任何枢纽数据 | `cityTransportHubs` 注册表，已覆盖全部 12 个城市（上海 4 / 北京 2 / 杭州 4 / 广州 4 / 成都 4 / 深圳 3 / 福州 3 / 天津 3 / 景德镇 2 / 武汉 4 / 南京 3 / 秦皇岛 2），新增城市时追加一条记录即可 |
| 批量导入录音间网站数据去重 | 同一录音室可能出现在自有数据和外部数据源中 | 通过名称+地址比对，删旧留新，保留仅自有数据独有的录音室 |
| 点击响应体验优化 | 体感速度比实际网络速度更重要 | 详情弹窗 preview 骨架优先、反馈/后台去 alert 改 toast、后台列表刷新非阻塞 |
| 独立详情页信息去重与顺序收敛 | 价格/预约/联系方式在首页弹窗和独立详情页共用 `studioPresentation` 归一化规则 | 去掉价格同义重复、CTA 与预约说明不重复、设备与房间拆分、交通信息后移 |
| 反馈弹窗内嵌"录音室信息更正"弱链接 | 录音室主理人发现信息有误时需要便捷反馈渠道 | 弹窗放大为 max-w-md（448px），底部通用提示"无论是使用的体验还是功能的期待，欢迎提出你的建议"，次级"录音室信息更正"入口降为 text-[10px] text-gray-200 |
| 录音室信息反馈入口（绑定上下文） | 用户在详情页/弹窗发现信息错误时可直接反馈，避免手动说明是哪一间录音室 | 详情页底部和首页弹窗底部新增"信息有误？告诉我们"弱入口（text-xs text-slate-300）；点击打开 FeedbackModal，自动传入 studio_id/studio_name/source；后端飞书消息卡片用橙色标题区分录音室反馈与全站反馈；FeedbackModal 根据 studioContext 切换标题、placeholder 和成功文案 |
| 预约二维码图片 `booking_qr_image` 字段 | 部分录音室通过小程序码/公众号二维码预约，不是网页链接 | 可选字段，后台支持上传图片，前台 128px 展示 + "扫码预约"标题，与链接预约、预约说明三层共存 |
| 剪辑师/制作人模块重构为"人物主页 + 作品展示" | 简单列表不体现人物质感，需类似轻量版 LinkedIn 的结构 | 列表页 → 人才墙（4列人物卡）；详情页 → 人物主页（居中头部+统计卡+擅长+作品+评价+报价+联系） |
| Editor 新增 5 字段 | 支撑"人物主页"展示需要更丰富的人物维度 | editor_type/availability_status/strengths/portfolio_works/coop_review |
| 变更申请审批同步链路 `studio_change_requests` | 录音室数据变更需要审批→diff确认→同步上线 | 飞书表单收集 → 后端变更申请表（pending→approved→applied）→ 字段级 diff → 写入 studios 表 |
| 飞书表单链接统一为共享表单 | 新链接 `shrcn9doOMBwCO0nL76ovDqMG15` 替代旧链接 | 全站统一一个入口，问卷负责收集，结果表负责整理 |
| 飞书结果表同步 | 飞书问卷收集→飞书结果表整理→人工确认diff→同步线上 | 结果表 `GbOqbmrqEaM7F2sWDhecsjr4nOd` 作为整理工作台，`/api/feishu-sync` 提供拉取/比对/同步 |
| 城市默认按录音室数量排序 | 让用户更快看到内容最丰富的城市，避免随机或固定顺序 | 后端 `/cities` 返回 `{city, count}[]` 按 count DESC；前端 `studioCities.ts` 收敛排序逻辑；首页默认选中录音室最多的城市 |

---

## 当前已知问题

1. **Supabase migration history 未完全对齐**
   线上字段已经实际落库，但 Supabase CLI migration ledger 仍需单独清理；不要在未确认前直接 repair。
2. **后台已加认证**
   `admin/studios` 已通过密码保护（`POST /api/auth/admin/login`），密码存储在 Vercel 环境变量 `ADMIN_PASSWORD` 中。后台支持软删除（`DELETE /api/studios/delete/{id}`，设置 `is_active=false`），删除后从前台和后台列表自动过滤。
3. **高德 Web Service API 地理编码仍未彻底打通**
   当前坐标主要依赖已有数据维护。
4. **打车时间是经验估算值**
   目前没有接高德路径规划 API。
5. **录音室新提交自动通知未接通**
   当前已完成"站内入口 → 飞书表单 → 变更申请系统（审批+diff+同步上线）"，但飞书新记录提醒还未接成独立 webhook / workflow。

---

## 工作规范

### Python 后端
- 使用 `pathlib.Path`
- 配置集中在 `config.py`
- 数据库操作统一走 SQLAlchemy Session
- 任何涉及 schema 的变更，同时更新：
  - Alembic revision
  - Supabase SQL mirror
  - 必要时的导入/种子脚本

### Next.js 前端
- App Router 多页面
- `'use client'` 明确标注客户端组件
- 类型定义集中在 `lib/types.ts`
- API 调用集中在 `lib/api.ts`
- 录音室表单统一走 `lib/studioForm.ts`
- 交通展示统一走 `lib/studioTransport.ts`（`cityTransportHubs` 城市注册表，已覆盖全部 12 个有录音棚的城市，新增城市在注册表追加一条即可）

---

## 更新纪律

凡是涉及以下任一变化，收尾时必须同步更新三份文档：
- 架构变化
- 上线路径变化
- 数据模型变化
- 后台入口变化
- 关键已知问题变化
- 阶段进展变化

必须同步更新：
1. [CLAUDE.md](/Users/lihuiyang/Desktop/工作区/01-项目孵化器/PodcastHub/CLAUDE.md)
2. [README.md](/Users/lihuiyang/Desktop/工作区/01-项目孵化器/PodcastHub/README.md)
3. [PROJECT_MEMORY.md](/Users/lihuiyang/Desktop/工作区/01-项目孵化器/PodcastHub/.claude/PROJECT_MEMORY.md)
