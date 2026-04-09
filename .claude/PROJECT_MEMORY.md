# PodcastHub 项目记忆

## 项目概览

- **核心问题**: 播客生态角色（录音间/剪辑师/商务）缺乏统一的信息展示和对接平台
- **目标用户**: 播客主理人、录音间运营者、音频剪辑师、商务合作方
- **成功标准**: 用户能快速找到合适的录音间、剪辑师或商务资源
- **首页形态**: 全屏高德地图 + 城市筛选 + 侧边抽屉详情

## 技术栈

- 前端: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- 后端: Python + FastAPI + SQLAlchemy + SQLite
- 地图: 高德地图 JS API v2.0 (前端渲染) + Web Service API (后端地理编码，当前不可用)
- 反馈: 飞书自定义机器人 Webhook
- 部署: 本地开发环境

## 项目结构

```
PodcastHub/
├── CLAUDE.md                     # 项目级规则（Claude Code 工作指引）
├── README.md                     # 项目说明
├── .claude/PROJECT_MEMORY.md     # 本文件
├── docs/plans/                   # 设计方案
├── backend/    → FastAPI 后端 (port 8000)
│   ├── models/ → database.py (3张表) + schemas.py (Pydantic)
│   ├── routers/ → studios/editors/business/feedback
│   └── services/ → image_service.py
└── frontend/   → Next.js 前端 (port 3000)
    ├── app/    → 首页地图 + studios/editors/business 各模块
    ├── components/ → 12个共享组件
    └── lib/    → api.ts + types.ts
```

## 重要决策

| 日期 | 决策 | 原因 | 影响 |
|------|------|------|------|
| 2026-04-09 | 三张独立表而非单表多态 | 三种角色字段差异大（>60%），合并会有大量空字段 | 各角色可独立扩展 |
| 2026-04-09 | JSON列存列表数据（tags/skills/equipment） | MVP阶段简单优先，避免创建关联表 | 未来可迁移到PostgreSQL |
| 2026-04-09 | 飞书Webhook收集反馈 | 最简方案，无需用户认证，消息直达 | 需配置Webhook URL |
| 2026-04-09 | App Router多页面 | 需要支持URL直接访问和分享名片链接 | 路由清晰 |
| 2026-04-09 | 首页全屏地图+侧边抽屉 | 地图是录音间的核心展示方式 | layout.tsx不设容器，各页面自备 |
| 2026-04-09 | AMap JS API 动态加载 | 避免SSR问题，仅在客户端加载地图脚本 | 首页需 'use client' |
| 2026-04-09 | layout.tsx 不设 max-w 容器 | 地图需要全宽 | 各子页面需自行添加 max-w-5xl 容器 |

## 进度日志

### 2026-04-09 项目初始化

- **完成**: 全部后端骨架（config/models/routers/services）
- **完成**: 全部前端页面（首页 + 录音间/剪辑师/商务 列表+详情+新建）
- **完成**: 导入7条上海录音间原始数据（来自Excel）
- **完成**: 飞书反馈收集功能（FeedbackModal + Webhook）
- **待配置**: 飞书机器人 Webhook URL (FEISHU_WEBHOOK_URL)

### 2026-04-09 UI 全面优化

- **完成**: 全局视觉风格重设（简约清新风格，暖白底色、柔和阴影、统一圆角）
- **完成**: 配色系统升级（studio/editor/biz 三色系，各有 50-600 色阶）
- **完成**: 导航栏重设（毛玻璃效果、桌面+移动双布局、底部Tab栏）
- **完成**: 首页重设计（特性标签、渐变图标、悬浮动效）
- **完成**: 录音间列表页优化（渐入动画、卡片悬浮效果、紧凑间距）
- **完成**: 录音间名片详情页优化（SVG图标、大号价格、渐变CTA按钮）
- **完成**: 新增表单页优化（统一 input-field 样式、提交审核按钮）
- **新增需求记录**: 录音间主理人自助上传 + 飞书审核通知

### 2026-04-09 地图功能实现

- **完成**: Studio 模型添加 longitude/latitude 字段
- **完成**: StudioListItem/StudioResponse schemas 添加坐标
- **完成**: 手动设置7个上海录音间经纬度坐标
- **完成**: 前端首页重写为全屏地图 + AMap JS API v2.0
- **完成**: 城市筛选栏（全部/上海/北京/深圳/广州/成都/杭州）
- **完成**: Tab 切换（录音间/剪辑师/商务）
- **完成**: 侧边抽屉显示选中录音间详情
- **完成**: 地图标记自适应缩放 (setFitView)
- **完成**: layout.tsx 去除容器限制，各子页面自备容器
- **完成**: Apple风格 Hero Banner (hero-standalone.html 设计参考)
- **未解决**: 高德 Web Service API 地理编码 USERKEY_PLAT_NOMATCH 错误

## 已知问题

1. **高德 Web API 地理编码不可用** — Key 类型不匹配，当前手动设置坐标。可改用前端 AMap.Geocoder 插件。
2. **飞书 Webhook 未配置** — FEISHU_WEBHOOK_URL 为空
3. **录音间自助提交 + 审核** — 待实现

## 待办事项

- [ ] **高优**: 配置飞书机器人 Webhook URL
- [ ] **高优**: 实现录音间自助提交 + 飞书审核通知
- [ ] **中优**: 解决高德 Web API Key 问题，或改用前端 Geocoder
- [ ] **中优**: 为录音间补充封面图片
- [ ] **中优**: 添加更多城市数据（北京、深圳等）
- [ ] **中优**: 补充剪辑师和商务数据
- [ ] **低优**: 用户认证系统
- [ ] **低优**: 图片上传功能完善

## 备注

- Excel原始数据路径: `/Users/lihuiyang/Desktop/录音间原始数据表.xlsx`
- 高德 API Key: JS `f8f8...9093` / Web Service `c378...c503`
- 前端环境变量在 `frontend/.env.local`
- 后端反馈主路由为 `POST /api/feedback`，兼容旧路径 `POST /api/feedback/submit`
- 启动后端: `uvicorn main:app --reload --port 8000`（从 backend 目录）
