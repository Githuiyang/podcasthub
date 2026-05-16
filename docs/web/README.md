# PodcastHub Web 端项目总览

这是 PodcastHub Web 端扩展的总索引文档。
后续所有 Web 端的规划、任务拆分、Claude Code 提示词、页面结构、接口设计和验收标准，都以这里的说明为准。

## 文档用途

这个目录是 Web 端项目的**单一事实来源（Single Source of Truth）**：

- 先在这里定义项目边界和目标
- 再从这里拆分页面、功能、接口、权限、同步、发布
- 最后把这里的内容转成 Claude Code 可执行的任务提示词

## 现有架构概览

PodcastHub Web 端已经完成从本地 MVP 到线上双项目架构的切换：

| 层 | 当前实现 |
|---|---|
| 前端 | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS |
| 后端 | FastAPI + SQLAlchemy（Vercel Python Runtime） |
| 数据库 | Supabase Postgres |
| 文件存储 | Supabase Storage（桶：`podcasthub-media`） |
| 地图 | 高德 JS API v2.0（前端渲染） + Web Service API（后端地理编码） |
| 部署前端 | Vercel 项目 `podcasthub`，域名 `podcasthub.daydayup.media` |
| 部署后端 | Vercel 项目 `podcasthub-api`，域名 `api.daydayup.media` |
| 反馈 | 飞书自定义机器人 Webhook |

## Web 端核心定位

Web 端是 PodcastHub 的完整能力平台：

1. **全屏地图总览** — 首页地图 + hover 卡 + 双 Tab 详情弹窗
2. **录音间列表** — 搜索、城市筛选、深度查找与对比
3. **独立详情页** — 信息去重，按固定顺序展示
4. **录音室征集** — 飞书表单入口 + 变更申请系统
5. **剪辑师 / 商务** — 人物主页 + 作品展示（导航栏独立一级入口）
6. **管理后台** — 线上录音室编辑、飞书同步、变更审批
7. **反馈** — 飞书 Webhook 收集

Web 端与小程序的分工：

| 能力 | Web 端 | 小程序端 |
|---|---|---|
| 地图 | 全屏高德地图 + hover 卡 + 弹窗 | 轻量地图预览（辅助空间感） |
| 列表 | 完整筛选、搜索、城市过滤 | 筛选、搜索、城市过滤 |
| 详情 | 双 Tab 弹窗 + 独立页 | 完整详情页 |
| 后台 | 完整编辑、审批、同步 | 轻量管理（暂缓） |
| 提交 | 飞书表单 + 变更申请系统 | 飞书表单入口 |

## 文档索引

- [项目说明与总体计划](./00-project-overview-plan.md)
- [范围定义](./01-scope.md)
- [页面信息架构与路由](./02-ia.md)
- [用户流程](./03-user-flows.md)
- [数据模型与字段映射](./04-data-model.md)
- [API 约定](./05-api-contract.md)
- [认证与权限](./06-auth-and-role.md)
- [飞书同步与后台管理](./07-sync-and-admin.md)
- [设计系统](./08-design-system.md)
- [SEO 与分析](./09-seo-analytics.md)
- [发布与验收](./10-release-qa.md)
- [Claude Code 任务提示词](./prompts/)

## 实现进度

### 已完成

- **首页全屏地图** — 高德地图 + 城市按录音室数量降序排列 + 默认选中录音室最多城市 + 城市 fitView + hover 预览卡 + 双 Tab 详情弹窗
- **录音间列表页** — 搜索 + 城市筛选（按录音室数量降序） + 卡片列表
- **独立详情页** — 信息去重展示 + 交通信息 + 预约 + 联系方式
- **录音室征集** — 飞书表单入口页
- **反馈弹窗** — FeedbackModal + 飞书 Webhook
- **录音室信息反馈** — 详情页/首页弹窗底部弱入口，绑定 studio_id/studio_name 上下文，飞书卡片橙色标题区分
- **管理后台** — 密码认证 + 录音室编辑 + 软删除
- **飞书同步** — 结果表拉取 + diff + 同步上线
- **变更申请** — 审批 + diff + 同步上线
- **交通枢纽** — 距离 + 打车时间估算（9 城市全覆盖）
- **信息去重** — studioPresentation 归一化
- **剪辑师/商务** — 人物主页 + 作品展示 + 人才墙

### 进行中

（暂无）

### 待开始

- SEO 优化
- 访问分析与埋点
- 性能优化（首页地图加载、图片懒加载等）
