# PodcastHub - 全国录音间展示与选择平台

帮助用户查看全国各地录音间的位置、基本信息、价格、联系方式、交通便利程度，并快速做出选择或联系。

当前线上地址：
- 前端：[https://podcasthub.daydayup.media](https://podcasthub.daydayup.media)
- 后端 API：[https://api.daydayup.media](https://api.daydayup.media)
- 录音室管理后台：[https://podcasthub.daydayup.media/admin/studios](https://podcasthub.daydayup.media/admin/studios)
- 录音室提交页：[https://podcasthub.daydayup.media/submit-studio](https://podcasthub.daydayup.media/submit-studio)

## 核心功能

- **录音间地图** — 首页全屏地图展示，动态城市列表（API 获取），支持全国概览和城市切换，hover 可预览地址、价格、交通枢纽距离与打车时间
- **详情弹窗** — 双 Tab（录音室信息 / 图片），默认打开信息 Tab，按名称+描述 → 地址 → 预约/开放/价格 → 联系方式 → 交通枢纽排序
- **独立详情页** — 信息去重后按 名称→地址→价格→开放时间→设备→房间→介绍→预约与联系→交通→CTA 展示，与首页弹窗共用归一化逻辑
- **录音间列表页** — 搜索、城市筛选、深度查找与对比
- **录音室征集** — 导航栏"添加我的录音室"为全站主入口；首页地图 FAB 为场景化弱入口（轻量灰色"+"→展开"收录录音室"）；录音间列表页保留描边风格辅助入口；飞书共享表单
- **录音室后台** — 轻量管理页，可直接编辑线上录音室的联系方式、收费方式、预约说明等字段，支持按城市筛选；支持软删除（移除后从列表隐藏，数据不清除）；已加密码保护
- **变更审核** — 变更申请审批页，支持"申请→审批→diff预览→确认同步上线"全链路
- **审核流** — 飞书表单收集 → 变更申请系统（审批 + diff 确认 + 同步上线）
- **微信小程序** — Taro + React + TypeScript，复用同一后端 API。项目文档见 `docs/mini-program/`。Phase 2 核心浏览已完成（首页+列表+详情）。
- **剪辑师 / 商务** — 导航栏各自独立一级入口；剪辑师页面已重构为"人物主页 + 作品展示"结构（人才墙列表 + LinkedIn 风格详情页），等待补充数据
- **反馈收集** — 用户反馈通过飞书机器人推送；录音室详情页和首页弹窗底部有"信息有误？告诉我们"弱入口，可绑定具体录音室上下文（studio_id/studio_name/source），飞书卡片用橙色标题区分
- **交互体验** — 详情弹窗点击后立即展示骨架预览，后台操作通过轻量 toast 反馈而非阻塞式 alert

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| 后端 | Python + FastAPI + SQLAlchemy |
| 数据库 | Supabase Postgres |
| 存储 | Supabase Storage |
| 部署 | 双 Vercel 项目（前端 / 后端分离） |
| 地图 | 高德地图 JS API v2.0 |
| 反馈 | 飞书自定义机器人 Webhook |

## 快速开始

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

本地开发默认可继续使用 SQLite；如果要直连 Supabase，请在 `backend/.env` 或 shell 中提供 `DATABASE_URL`。

Swagger 文档：
[http://localhost:8000/docs](http://localhost:8000/docs)

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问：
[http://localhost:3000](http://localhost:3000)

## 环境变量

### backend/.env（本地）

```env
DEBUG=true
DATABASE_URL=sqlite:///绝对路径/到/backend/data/podcasthub.db
AUTO_INIT_DB=true
AMAP_WEB_KEY=你的高德Web服务Key
AMAP_JS_KEY=你的高德JS_API_Key
FEISHU_WEBHOOK_URL=飞书机器人Webhook地址
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
SUPABASE_STORAGE_BUCKET=podcasthub-media
```

### frontend/.env.local（本地）

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_AMAP_JS_KEY=同 backend 的 AMAP_JS_KEY
NEXT_PUBLIC_STUDIO_SUBMISSION_URL=https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15
```

### Vercel 生产环境

前端：

```env
NEXT_PUBLIC_API_BASE=https://api.daydayup.media
NEXT_PUBLIC_AMAP_JS_KEY=你的高德JS_API_Key
NEXT_PUBLIC_STUDIO_SUBMISSION_URL=https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15
```

后端：

```env
DATABASE_URL=postgresql+psycopg://...
AUTO_INIT_DB=false
CORS_ALLOW_ORIGINS=https://podcasthub.daydayup.media,https://daydayup.media
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_STORAGE_BUCKET=podcasthub-media
```

## 项目结构

```text
PodcastHub/
├── CLAUDE.md                 # 项目级规则
├── README.md                 # 面向人的项目说明
├── .claude/PROJECT_MEMORY.md # 决策 / 进度 / 错误日志
│
├── backend/
│   ├── api/index.py          # Vercel Python 入口
│   ├── config.py             # DATABASE_URL / Supabase / CORS
│   ├── main.py               # FastAPI 入口
│   ├── alembic/              # 数据库迁移
│   ├── models/               # SQLAlchemy + Pydantic 模型
│   ├── routers/              # studios/editors/business/feedback
│   ├── services/             # image_service + studio_pricing
│   ├── scripts/              # SQLite/Supabase 导入导出脚本
│   ├── supabase/             # SQL mirror / seed
│   └── data/                 # 本地 SQLite / uploads（仅本地开发保留）
│
└── frontend/
    ├── app/
    │   ├── page.tsx          # 首页地图（双Tab详情弹窗）
    │   ├── admin/studios     # 录音室管理后台
│   ├── admin/feishu-sync # 飞书结果表同步页
    │   ├── submit-studio     # 录音室征集与提交流程页
    │   ├── studios/          # 录音间列表 / 详情 / 新增
    │   ├── editors/          # 剪辑师
    │   ├── business/         # 商务
    │   └── components/       # 共享组件
    ├── lib/
    │   ├── api.ts            # axios API 客户端
    │   ├── studioForm.ts     # 录音室表单转换
    │   ├── studioPresentation.ts # 开放时间/预约/联系方式展示归一化
    │   ├── studioSubmission.ts # 飞书表单提交入口常量
    │   ├── studioTransport.ts# 距离 / 打车时间估算
    │   └── types.ts          # TypeScript 类型
    └── tailwind.config.js
```

## API 概览

```text
# 录音间
GET    /api/studios/list?city=上海&size=100   列表（支持城市/标签/搜索筛选）
GET    /api/studios/cities                    获取所有城市
GET    /api/studios/detail/{id}               详情（含坐标、联系方式、收费方式）
POST   /api/studios/create                    创建
PUT    /api/studios/update/{id}               更新
DELETE /api/studios/delete/{id}               软删除
POST   /api/studios/{id}/upload               上传封面图
POST   /api/studios/{id}/upload-qr            上传预约二维码图片

# 剪辑师
GET  /api/editors/list?search=
GET  /api/editors/detail/{id}

# 商务
GET  /api/business/list?search=
GET  /api/business/detail/{id}

# 反馈
POST /api/feedback
POST /api/feedback/submit

# 录音室体验评价
POST   /api/reviews                         提交体验评价（按录音室绑定）
GET    /api/reviews/studio/{studio_id}       获取已发布评价
GET    /api/reviews/studio/{studio_id}/count 评价数量
GET    /api/reviews/counts                   批量评价数量

# 变更申请（审批 + diff + 同步上线）
POST   /api/change-requests/create              创建变更申请
GET    /api/change-requests/list?status=pending   列表
GET    /api/change-requests/detail/{id}           详情
GET    /api/change-requests/diff/{id}             预览差异
PUT    /api/change-requests/approve/{id}          审批通过
PUT    /api/change-requests/reject/{id}           拒绝
PUT    /api/change-requests/apply/{id}            应用变更
```

## 数据说明

线上当前数据：
- `studios=33`（上海 11 / 北京 9 / 杭州 3 / 广州 1 / 成都 1 / 深圳 1 / 福州 1 / 天津 1 / 景德镇 1 / 武汉 1 / 南京 1 / 秦皇岛 1）
- `editors=0`
- `business_contacts=0`

当前录音室征集链路：
- 用户从导航栏"添加我的录音室"（全站主入口）、首页地图 FAB（弱入口）、或录音间列表页进入提交页
- 填写飞书问卷：https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15
- 数据进入飞书结果表：https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd
- 运营人员在结果表中整理和删改 → 通过后台飞书同步页比对 diff → 确认后同步上线

录音间当前重点字段：
- 经纬度
- 联系方式（联系人 / 电话 / 微信）
- 收费方式 `charging_method`
- 预约说明
- 预约二维码图片 `booking_qr_image`（支持小程序码、公众号二维码等非网页预约方式）
- 交通枢纽距离与预计打车时间（按需启用：只为有录音棚的城市注册枢纽，没有录音棚的城市不生成任何数据）

## 线上部署

```bash
# 后端
cd backend
vercel --prod --yes

# 前端
cd frontend
vercel --prod --yes
```

## 当前注意事项

- `admin/studios` 已加密码保护，密码通过 Vercel 环境变量 `ADMIN_PASSWORD` 配置。
- 录音室征集已接到飞书表单，后台有飞书同步页支持 diff 确认后同步上线。问卷和结果表是两条独立链接。
- Supabase migration history 还需要后续单独清理；当前线上字段已真实落库，但不要贸然修 migration ledger。
- 打车时间目前是经验估算值，不是高德实时路径规划结果。
- 交通枢纽按城市注册表按需启用：已覆盖全部 12 个有录音棚的城市（上海/北京/杭州/广州/成都/深圳/福州/天津/景德镇/武汉/南京/秦皇岛），新增城市在 `cityTransportHubs` 追加一条即可。

## 项目文档体系

本项目有两套并列的文档体系，分别服务于 Web 端和小程序端：

| 文档目录 | 服务端 | 说明 |
|---|---|---|
| `docs/web/` | Web 主站 | 总纲 + 11 个分文档 + 10 个任务提示词 |
| `docs/mini-program/` | 微信小程序 | 总纲 + 9 个分文档 + 任务提示词 |

### Web 端文档（`docs/web/`）

- [总索引](./docs/web/README.md)
- [项目总纲](./docs/web/00-project-overview-plan.md)
- [页面信息架构](./docs/web/02-ia.md)
- [数据模型](./docs/web/04-data-model.md)
- [API 约定](./docs/web/05-api-contract.md)
- [认证与权限](./docs/web/06-auth-and-role.md)
- [飞书同步与后台](./docs/web/07-sync-and-admin.md)
- [SEO 与分析](./docs/web/09-seo-analytics.md)
- [任务提示词](./docs/web/prompts/)

### 小程序文档（`docs/mini-program/`）

- [总索引](./docs/mini-program/README.md)

后续 Claude Code 任务应先读对应端的总纲文档，再拆分具体任务。
