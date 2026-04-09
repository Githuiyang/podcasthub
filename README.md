# PodcastHub - 播客名片

播客生态角色展示平台，以地图为核心展示录音间，连接剪辑师和商务资源。

## 核心功能

- **录音间** — 首页全屏地图展示，城市筛选（上海/北京/深圳/广州/成都/杭州），点击标记弹出侧边抽屉显示详情、价格、预约链接
- **剪辑师** — 展示音频剪辑师技能、作品、报价
- **商务资源** — 展示合作资源、案例、联系方式
- **反馈收集** — 用户反馈通过飞书机器人实时推送

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| 后端 | Python + FastAPI + SQLAlchemy + SQLite |
| 地图 | 高德地图 JS API v2.0 |
| 反馈 | 飞书自定义机器人 Webhook |

## 快速开始

### 1. 启动后端

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

后端启动后自动创建 SQLite 数据库，Swagger 文档: http://localhost:8000/docs

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 环境变量

### backend/.env

```env
DEBUG=true
AMAP_WEB_KEY=你的高德Web服务Key
AMAP_JS_KEY=你的高德JS_API_Key
FEISHU_WEBHOOK_URL=飞书机器人Webhook地址
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_AMAP_JS_KEY=同backend的AMAP_JS_KEY
```

## 项目结构

```
PodcastHub/
├── CLAUDE.md                 # 项目级规则（Claude Code 工作指引）
├── README.md
├── .claude/
│   └── PROJECT_MEMORY.md     # 项目记忆（决策日志、进度、待办）
│
├── backend/                  # FastAPI 后端 (port 8000)
│   ├── config.py             # 集中配置 (BASE_DIR)
│   ├── main.py               # 应用入口 + CORS
│   ├── models/
│   │   ├── database.py       # 3张表: Studio / Editor / BusinessContact
│   │   └── schemas.py        # Pydantic 请求/响应模型
│   ├── routers/
│   │   ├── studios.py        # 录音间 CRUD + /cities + 坐标
│   │   ├── editors.py        # 剪辑师 CRUD
│   │   ├── business.py       # 商务 CRUD
│   │   └── feedback.py       # 飞书反馈
│   ├── geocode_studios.py    # 批量地理编码脚本
│   └── data/                 # SQLite + 上传文件
│
└── frontend/                 # Next.js 前端 (port 3000)
    ├── app/
    │   ├── page.tsx          # 首页 — 全屏地图 + 城市筛选 + Tab
    │   ├── layout.tsx        # 根布局 (Navbar, 无容器)
    │   ├── studios/          # 录音间列表/详情/新增
    │   ├── editors/          # 剪辑师列表/详情/新增
    │   ├── business/         # 商务列表/详情/新增
    │   └── components/       # 共享组件 (12个)
    ├── lib/
    │   ├── api.ts            # axios API 客户端
    │   └── types.ts          # TypeScript 类型
    └── tailwind.config.js    # 三色系 (studio/editor/biz)
```

## API 概览

```
# 录音间
GET  /api/studios/list?city=上海&size=100   列表（支持城市/标签/搜索筛选）
GET  /api/studios/cities                     获取所有城市
GET  /api/studios/detail/{id}                详情（含坐标）
POST /api/studios/create                     创建

# 剪辑师
GET  /api/editors/list?search=               列表
GET  /api/editors/detail/{id}                详情

# 商务
GET  /api/business/list?search=              列表
GET  /api/business/detail/{id}               详情

# 反馈
POST /api/feedback                           提交反馈 → 飞书Webhook
```

## 数据库

三张独立表，JSON 列存列表数据（tags/skills/equipment），SQLite 存储。

当前数据：7 个上海录音间（含经纬度坐标）。
