# 10 — Web 端发布与验收

> 状态：骨架版
> 最后更新：2026-04-15

## 发布前检查清单

### 核心功能

- [ ] 首页地图正常加载，marker 显示正确
- [ ] 城市 fitView 正常，只基于录音棚 marker
- [ ] 城市按钮按录音室数量降序排列
- [ ] 首页默认选中录音室数量最多的城市
- [ ] hover 预览卡正常显示（名称 + 地址 + 价格）
- [ ] 双 Tab 详情弹窗正常打开（信息 Tab + 图片 Tab）
- [ ] 录音间列表页搜索和城市筛选正常
- [ ] 录音室详情页展示完整
- [ ] 交通枢纽信息正常显示
- [ ] 提交录音室页飞书表单链接正确
- [ ] 提交录音室入口层级清晰：导航栏为全站主入口（黑按钮），首页 FAB 为弱入口（灰色描边），列表页为辅助入口（描边按钮）
- [ ] 首页不同时出现两个同等强度的"添加我的录音室"CTA
- [ ] 反馈弹窗提交正常（飞书 Webhook 推送）
- [ ] 录音室详情页底部有"信息有误？告诉我们"弱入口，点击打开带录音室上下文的 FeedbackModal
- [ ] 首页弹窗底部有同类弱入口，点击打开带录音室上下文的 FeedbackModal
- [ ] 录音室信息反馈弹窗显示"正在反馈：xxx录音室"上下文提示条
- [ ] 全站普通反馈（导航栏按钮）不受录音室上下文影响

### 管理后台

- [ ] 管理员登录流程正常
- [ ] 录音室编辑保存正常
- [ ] 图片上传正常（Supabase Storage）
- [ ] 软删除正常（前台自动过滤）
- [ ] 飞书同步流程正常
- [ ] 变更审批流程正常

### 技术检查

- [ ] 前端 `npm run build` 通过
- [ ] 后端 `python3 -m compileall` 通过
- [ ] 无 console 错误（前台）
- [ ] 无 API 500 错误
- [ ] CORS 配置正确
- [ ] 环境变量完整

### SEO（待接入后检查）

- [ ] 每个页面有 title 和 description
- [ ] OG 标签正确
- [ ] sitemap 可访问
- [ ] robots.txt 正确

### 性能

- [ ] 首页地图加载时间 < 3s
- [ ] API 响应时间 < 500ms
- [ ] 图片使用适当压缩

## 部署流程

### 前端部署

```bash
cd frontend
vercel --prod --yes
```

环境变量：
- `NEXT_PUBLIC_API_BASE=https://api.daydayup.media`
- `NEXT_PUBLIC_AMAP_JS_KEY=xxx`
- `NEXT_PUBLIC_STUDIO_SUBMISSION_URL=https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15`

### 后端部署

```bash
cd backend
vercel --prod --yes
```

环境变量：
- `DATABASE_URL=postgresql+psycopg://...`
- `AUTO_INIT_DB=false`
- `CORS_ALLOW_ORIGINS=https://podcasthub.daydayup.media,https://daydayup.media`
- `SUPABASE_URL=https://<ref>.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `SUPABASE_STORAGE_BUCKET=podcasthub-media`
- `ADMIN_PASSWORD=...`
- `FEISHU_WEBHOOK_URL=...`

## 回滚策略

- Vercel 支持即时回滚到上一版本
- 数据库变更需通过 Alembic 迁移，可 `alembic downgrade`
- 图片文件在 Supabase Storage 中持久化，不受部署影响

## 域名配置

- 前端：`podcasthub.daydayup.media`
- 后端：`api.daydayup.media`
- DNS 在 Vercel 中管理
