# 01 — 第一版范围与不做什么

> 状态：已更新（反映双 Tab 架构）
> 最后更新：2026-04-16

## 第一版必做

| 页面 | 路由 | 说明 |
|---|---|---|
| 录音室列表 | `pages/studios/index` | TabBar 主入口：城市筛选、关键词搜索、卡片列表、提交/反馈按钮 |
| 创作者 | `pages/creators/index` | TabBar 第二入口：分段控件（剪辑师/制作人）、搜索、卡片列表 |
| 创作者详情 | `pages/creator-detail/index` | 统一详情页，`?id=&kind=editor\|business`，共享头部 + 条件渲染 |
| 录音室详情 | `pages/studio-detail/index` | 名称、地址、价格、预约、联系方式、交通、图片 |
| 提交录音室 | `pages/submit-studio/index` | 引导页 -> 跳转飞书表单 |
| 反馈 | `pages/feedback/index` | 通用反馈 + 信息更正 |
| 管理员登录 | `pages/admin-login/index` | 密码验证 |
| 管理后台 | `pages/admin/index` | 轻量录音室管理 |

## 第一版不做

- 商务资源完整模块（制作人通过创作者 Tab 已支持基础浏览）
- 复杂评论社区
- 复杂实时同步
- 小程序内直接编辑所有字段的完整表单系统

## 与 Web 端的分工

- **Web**：完整展示、编辑、后台管理、审批同步、地图、完整剪辑师/商务模块
- **小程序**：轻量浏览、轻量提交、轻量反馈、轻量管理、创作者浏览（剪辑师+制作人）
