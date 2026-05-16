# 任务 09 — SEO 与分析

> 状态：待开始

## 目标

为 Web 端接入基础 SEO 和访问分析。

## 涉及文件

- `frontend/app/layout.tsx` — 根布局（metadata）
- `frontend/app/page.tsx` — 首页 metadata
- `frontend/app/studios/` — 各页面 metadata
- `frontend/lib/analytics.ts` — 待创建（埋点工具）
- `frontend/package.json` — 添加 @vercel/analytics

## 任务内容

### SEO

1. 各页面 title + description（通过 Next.js metadata API）
2. Open Graph 标签
3. sitemap.xml 生成
4. robots.txt
5. 结构化数据（LocalBusiness / ItemList）
6. H1 层级规范化

### 分析

1. 接入 Vercel Analytics（页面浏览）
2. 接入 Vercel Speed Insights（性能）
3. 封装 `frontend/lib/analytics.ts` 统一埋点工具
4. 关键事件埋点（city_click / studio_card_click / submit_click / feedback_click）

### 排除范围

- 管理后台页面（`/admin/*`）不纳入统计

## 验收标准

1. 每个页面有正确的 title 和 description
2. OG 标签正确
3. Vercel Analytics 控制台能看到页面浏览数据
4. 自定义事件在控制台可见
5. `npm run build` 通过

## 详细设计

参考 `docs/web/09-seo-analytics.md`。
