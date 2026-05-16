# 09 — Web 端 SEO 与分析

> 状态：待实现
> 最后更新：2026-04-15

## SEO 现状

### 已实现

- Next.js App Router 默认 SSR（服务端渲染）
- 页面 title 通过 metadata API 设置

### 待实现

#### 基础 SEO

- [ ] 每个页面的 `<title>` 和 `<meta name="description">`
- [ ] Open Graph 标签（og:title, og:description, og:image）
- [ ] canonical URL
- [ ] H1 层级结构规范化
- [ ] sitemap.xml 生成
- [ ] robots.txt 配置

#### 结构化数据

- [ ] 录音室页面：LocalBusiness schema
- [ ] 列表页面：ItemList schema
- [ ] 首页：WebSite schema + SearchAction

#### 技术 SEO

- [ ] 图片 alt 属性补充
- [ ] 页面加载性能优化
- [ ] Core Web Vitals 监控

## 分析现状

### 已实现

- （暂无）

### 待实现

#### 基础访问统计

- [ ] 接入 Vercel Analytics（页面浏览）
- [ ] 接入 Vercel Speed Insights（性能）

#### 自定义事件

建议事件列表：

| 事件名 | 参数 | 说明 |
|---|---|---|
| `city_click` | city | 城市筛选 |
| `studio_card_click` | studio_id, name | 录音室卡片点击 |
| `studio_marker_hover` | studio_id | 地图 marker hover |
| `studio_modal_open` | studio_id, source | 详情弹窗打开 |
| `submit_studio_click` | - | 提交录音室入口点击 |
| `feedback_click` | - | 反馈入口点击 |
| `booking_click` | studio_id, type | 预约按钮点击 |

#### 统计范围

- 默认统计前台公开页面
- 排除管理后台页面（`/admin/*`）
- 排除内部同步页面

#### 工具封装

建议在 `frontend/lib/analytics.ts` 封装统一埋点工具：

```typescript
// 建议接口
trackEvent(name: string, params?: Record<string, string | number>)
trackPageView(path: string)
trackStudioClick(studioId: number, studioName: string, source: string)
```
