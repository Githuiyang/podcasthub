# PodcastHub Web 端项目说明与总体计划

> 版本：v1.0
> 状态：已上线运行
> 适用对象：产品 / 设计 / 开发 / Claude Code / 后续接手的协作者

## 1. 项目目标

PodcastHub Web 端是全国录音间展示与选择平台的完整能力入口，目标：

1. 让用户通过全屏地图快速扫视全国录音间分布
2. 让用户通过 hover 卡和详情弹窗深入了解每间录音室
3. 让用户通过列表页按城市、关键词筛选和比较
4. 让录音室主理人通过飞书表单提交录音室
5. 让管理员在后台完成审核、编辑、飞书同步

### 核心原则

- **录音室优先**：主任务始终是录音室发现与选择
- **地图即首页**：Web 端首页是全屏高德地图，和小程序端的轻量地图预览不同
- **信息去重**：通过 `studioPresentation.ts` 归一化，避免同一信息重复出现
- **信息清晰**：每个页面只承担一个主要任务
- **前后端分离**：前端 Next.js + 后端 FastAPI，双 Vercel 项目独立部署

## 2. 产品边界

### 2.1 Web 端已完成的功能

- 全屏地图首页（高德 JS API v2.0，动态城市列表按录音室数量降序 + 默认选中录音室最多城市 + 全国概览 + 城市切换）
- 录音间列表页（搜索 + 城市筛选）
- 独立详情页（信息 + 图片双 Tab）
- 双 Tab 详情弹窗（地图内 hover → 弹窗）
- 录音室征集页（飞书表单入口）
- 反馈弹窗（飞书 Webhook）
- 管理后台（密码认证 + 录音室编辑 + 软删除）
- 飞书同步（结果表拉取 + diff + 同步上线）
- 变更申请系统（审批 + diff + 同步上线）
- 剪辑师 / 商务模块（人物主页 + 作品展示）
- 交通枢纽信息（9 城市全覆盖，距离 + 打车时间）

### 2.2 Web 端暂未完成

- SEO 优化（meta、sitemap、structured data）
- 访问分析与埋点
- 性能优化（地图加载、图片懒加载）
- 录音室评价系统（后端已有 API，前端尚未接入）

### 2.3 Web 端与小程序的分工

| 能力 | Web 端 | 小程序端 |
|---|---|---|
| 首页 | 全屏地图 + hover 卡 + 弹窗 | 发现页 + 轻量地图预览 |
| 列表 | 完整筛选搜索 | 筛选搜索 |
| 详情 | 双 Tab 弹窗 + 独立页 | 完整详情页 |
| 后台 | 完整编辑审批同步 | 轻量管理（暂缓） |
| 提交 | 飞书表单 + 变更申请 | 飞书表单入口 |

## 3. 技术架构

### 3.1 前端

- **框架**：Next.js 14 (App Router)
- **UI**：React 18 + TypeScript + Tailwind CSS
- **地图**：高德 JS API v2.0（客户端动态加载）
- **HTTP**：axios
- **部署**：Vercel

### 3.2 后端

- **框架**：FastAPI + SQLAlchemy
- **数据库**：Supabase Postgres
- **存储**：Supabase Storage
- **迁移**：Alembic
- **部署**：Vercel Python Runtime

### 3.3 数据流

```text
用户 → Next.js 前端 → FastAPI 后端 → Supabase Postgres
                                    → Supabase Storage
                                    → 飞书 Webhook（反馈）
                                    → 飞书结果表（同步）
```

## 4. 第一版页面地图

### 4.1 首页 — 全屏地图

回答："全国录音间在哪里？哪间离我近？"

包含：全屏高德地图、城市 fitView、hover 预览卡、双 Tab 详情弹窗（信息/图片）、录音室征集 FAB（场景化弱入口）

### 4.2 录音间列表页

回答："同一城市有哪些录音室可以比较？"

包含：搜索、城市筛选、录音室卡片列表

### 4.3 录音室详情页

回答："这间录音室值不值得去？"

包含：名称、描述、地址、预约方式、开放时间、价格、联系方式、交通枢纽、图片

### 4.4 提交录音室

回答："我怎么把我的录音室提交给 PodcastHub？"

包含：轻量引导 + 飞书表单链接

### 4.5 反馈

回答："我怎么告诉你这里需要改进？"

包含：FeedbackModal（称呼 + 反馈详情），提交到飞书 Webhook

### 4.5a 录音室信息反馈

回答："这间录音室信息有误或过时了，怎么反馈？"

包含：详情页和首页弹窗底部的"信息有误？告诉我们"弱入口，点击打开带录音室上下文的 FeedbackModal，自动传入 studio_id/studio_name/source，飞书卡片用橙色标题区分

### 4.6 管理后台

包含：密码认证、录音室编辑/删除、飞书同步、变更审批

### 4.7 剪辑师 / 商务

包含：人才墙列表、人物主页（头部 + 统计 + 擅长 + 作品 + 评价 + 报价 + 联系）

## 5. 信息架构原则

### 5.1 地图即首页

Web 端首页是全屏地图，不是列表页。地图承载"快速扫视"任务，列表页承载"筛选比较"任务。

### 5.2 信息去重

通过 `studioPresentation.ts` 归一化开放时间、价格、预约、联系方式的展示，避免同一条信息在多个区块重复。

### 5.3 详情弹窗 ≠ 详情页

地图内的双 Tab 弹窗用于快速预览，独立详情页用于深入了解。两者共用数据但展示粒度不同。

### 5.4 管理能力隔离

后台功能通过密码认证隔离，游客态不可见。

## 6. 目录结构

```text
frontend/
├── app/
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首页 — 全屏地图 + hover 卡 + 双 Tab 弹窗
│   ├── admin/
│   │   ├── layout.tsx           # AdminAuthGuard
│   │   ├── studios/page.tsx     # 线上录音室编辑
│   │   ├── feishu-sync/         # 飞书同步
│   │   └── change-requests/     # 变更审批
│   ├── submit-studio/           # 录音室征集
│   ├── editors/                 # 剪辑师
│   ├── business/                # 商务
│   └── studios/
│       └── components/          # 共享组件（注：部分组件已提升到 app/components/）
├── components/                  # 全局共享组件
├── lib/
│   ├── api.ts                   # axios API 客户端
│   ├── studioForm.ts            # 录音室表单转换
│   ├── studioPresentation.ts    # 展示归一化
│   ├── studioSubmission.ts      # 飞书表单入口
│   ├── studioTransport.ts       # 交通距离估算
│   └── types.ts                 # TypeScript 类型
└── tailwind.config.js

backend/
├── main.py                      # FastAPI 入口
├── config.py                    # 集中配置
├── models/
│   ├── database.py              # SQLAlchemy 模型
│   └── schemas.py               # Pydantic 模型
├── routers/
│   ├── studios.py               # 录音间 CRUD
│   ├── editors.py               # 剪辑师 CRUD
│   ├── business.py              # 商务 CRUD
│   ├── feedback.py              # 飞书反馈
│   ├── reviews.py               # 评价 CRUD
│   ├── auth.py                  # 后台认证
│   ├── change_requests.py       # 变更申请
│   └── feishu_sync.py           # 飞书同步
├── services/
│   ├── image_service.py         # 图片上传
│   └── studio_pricing.py        # 收费方式推导
└── supabase/                    # SQL mirror / seed
```

## 7. 阶段执行记录

### Phase 1：基础搭建（已完成）
- 后端骨架、前端骨架、数据导入

### Phase 2：核心展示（已完成）
- 全屏地图首页、列表页、详情页

### Phase 3：管理与同步（已完成）
- 管理后台、飞书同步、变更申请

### Phase 4：扩展模块（已完成）
- 剪辑师/商务人物主页、评价 API

### Phase 5：质量与增长（待开始）
- SEO、埋点、性能优化
