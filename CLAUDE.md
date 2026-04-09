# CLAUDE.md — PodcastHub 项目规则

> **维护者**: huiyang (灰羊)
> **项目**: PodcastHub (播客名片)
> **最后更新**: 2026-04-09

---

## 项目定位

播客生态角色展示平台。核心是为三个角色提供"数字名片"：
1. **录音间** — 地图展示、城市筛选、地址/设备/价格/预约链接
2. **剪辑师** — 技能/作品/报价卡片
3. **商务资源** — 合作类型/案例/联系方式

录音间是主要功能，首页即为全屏地图。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| 后端 | Python + FastAPI + SQLAlchemy + SQLite |
| 地图 | 高德地图 JS API v2.0 (前端渲染) + Web Service API (后端地理编码) |
| HTTP | axios (前端) + httpx (后端) |
| 反馈 | 飞书自定义机器人 Webhook |

---

## 项目结构

```
PodcastHub/
├── CLAUDE.md                    # 本文件 — 项目级规则
├── README.md                    # 项目说明
├── .gitignore
├── .claude/
│   └── PROJECT_MEMORY.md        # 项目记忆（决策、进度、待办）
├── docs/
│   └── plans/                   # 设计方案
│
├── backend/                     # FastAPI 后端 (port 8000)
│   ├── .env                     # 环境变量（高德Key、飞书Webhook）
│   ├── config.py                # BASE_DIR + 集中配置
│   ├── main.py                  # FastAPI 入口 + CORS
│   ├── requirements.txt
│   ├── models/
│   │   ├── database.py          # SQLAlchemy 模型 (Studio/Editor/BusinessContact)
│   │   └── schemas.py           # Pydantic 请求/响应模型
│   ├── routers/
│   │   ├── studios.py           # 录音间 CRUD + /cities + 上传
│   │   ├── editors.py           # 剪辑师 CRUD
│   │   ├── business.py          # 商务 CRUD
│   │   └── feedback.py          # 飞书反馈提交
│   ├── services/
│   │   └── image_service.py     # 图片上传
│   ├── geocode_studios.py       # 高德地理编码脚本（手动/批量）
│   ├── import_data.py           # Excel 数据导入脚本
│   └── data/
│       ├── podcasthub.db        # SQLite 数据库
│       └── uploads/             # 上传文件
│
└── frontend/                    # Next.js 前端 (port 3000)
    ├── .env.local               # 前端环境变量 (API_BASE, AMAP_JS_KEY)
    ├── app/
    │   ├── layout.tsx           # 根布局 (Navbar, 无容器限制)
    │   ├── page.tsx             # 首页 — 全屏地图 + 城市筛选 + Tab切换
    │   ├── globals.css          # 全局样式 (动画/卡片/输入框)
    │   ├── studios/             # 录音间模块
    │   │   ├── page.tsx         # 列表页（卡片网格）
    │   │   ├── [id]/page.tsx    # 名片详情页
    │   │   └── new/page.tsx     # 新增表单
    │   ├── editors/             # 剪辑师模块（结构同上）
    │   ├── business/            # 商务模块（结构同上）
    │   └── components/
    │       ├── Navbar.tsx       # 导航栏（毛玻璃 + 移动端底部Tab）
    │       ├── StudioCard.tsx
    │       ├── EditorCard.tsx
    │       ├── BusinessCard.tsx
    │       ├── CityFilter.tsx
    │       ├── SearchBar.tsx
    │       ├── ContactInfo.tsx
    │       ├── TagList.tsx
    │       ├── FeedbackModal.tsx
    │       ├── EmptyState.tsx
    │       └── LoadingState.tsx
    ├── lib/
    │   ├── api.ts               # axios API 客户端
    │   └── types.ts             # TypeScript 类型定义
    ├── tailwind.config.js       # 自定义配色 (studio/editor/biz 三色系)
    └── hero-standalone.html     # Apple风格 Banner（设计参考）
```

---

## 数据库设计（3 张独立表）

| 表 | 核心字段 | 特色字段 |
|---|---|---|
| `studios` | name, city, district, address | longitude, latitude, equipment, booking_url, booking_note |
| `editors` | name, avatar, bio | skills, software, experience_years, price_per_episode |
| `business_contacts` | name, company, title | business_type, budget_range, cooperation_types |

所有表都有: tags (JSON), is_active, created_at, updated_at

---

## API 设计

### 录音间（核心）
```
GET  /api/studios/list?city=&tag=&search=&page=&size=  列表（城市筛选）
GET  /api/studios/cities                                  获取城市列表
GET  /api/studios/detail/{id}                             详情
POST /api/studios/create                                  创建
PUT  /api/studios/update/{id}                             更新
DELETE /api/studios/delete/{id}                           删除
```

### 剪辑师 / 商务（同理）
```
GET  /api/editors/list?skill=&search=&page=&size=
GET  /api/editors/detail/{id}
...
GET  /api/business/list?type=&search=&page=&size=
GET  /api/business/detail/{id}
...
```

### 反馈
```
POST /api/feedback    # 提交反馈 → 飞书Webhook
```

---

## 环境变量

### backend/.env
```
DEBUG=true
AMAP_JS_KEY=xxx           # 高德 JS API（前端地图）
AMAP_WEB_KEY=xxx          # 高德 Web Service API（地理编码）
FEISHU_WEBHOOK_URL=       # 飞书机器人 Webhook（待配置）
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_AMAP_JS_KEY=xxx    # 同 backend AMAP_JS_KEY
```

---

## 配色方案

```
podcast-500: '#a855f7'   # 主色紫色
studio:     '#f59e0b'    # 录音间 琥珀色
editor:     '#10b981'    # 剪辑师 绿色
business:   '#3b82f6'    # 商务 蓝色
```

每种角色色都有 50-600 完整色阶，定义在 `tailwind.config.js`。

---

## 启动命令

```bash
# 后端
cd backend
pip install -r requirements.txt
python -c "import uvicorn, main; uvicorn.run(main.app, host='0.0.0.0', port=8000)"
# 或者 uvicorn main:app --reload --port 8000

# 前端
cd frontend
npm install
npm run dev
```

---

## 关键设计决策

| 决策 | 原因 |
|---|---|
| 三张独立表而非单表多态 | 三种角色字段差异大(>60%)，合并会有大量空字段 |
| JSON列存列表数据 | MVP简单优先，未来可迁移到PostgreSQL |
| 首页全屏地图+侧边抽屉 | 地图是录音间的核心展示方式 |
| layout.tsx 不设容器 | 首页地图需要全宽，各页面自行添加 max-w-5xl 容器 |
| 前端 AMap JS API 动态加载 | 避免SSR问题，仅在客户端加载地图脚本 |
| 飞书 Webhook 收集反馈 | 最简方案，无需用户认证 |

---

## 已知问题

1. **高德 Web Service API 地理编码失败** — `USERKEY_PLAT_NOMATCH` 错误，当前 Key 可能仅为 JS API 类型。已手动设置7个录音间坐标。后续可通过前端 AMap.Geocoder 插件在前端做地理编码。
2. **飞书 Webhook 未配置** — `FEISHU_WEBHOOK_URL` 为空，反馈提交会静默失败。
3. **录音间自助提交 + 审核** — 已记录需求，待实现。计划流程：用户提交 → 飞书通知管理员 → 管理员后台审核上线。

---

## 工作规范

### Python 后端
- 使用 `pathlib.Path`，配置集中在 `config.py`
- BASE_DIR 模式作为路径基准
- 数据库操作统一用 SQLAlchemy Session

### Next.js 前端
- App Router 多页面，每个页面自备容器
- `'use client'` 标注客户端组件
- 类型定义集中在 `lib/types.ts`
- API 调用集中在 `lib/api.ts`
- 样式使用 Tailwind CSS，自定义类写在 `globals.css`
