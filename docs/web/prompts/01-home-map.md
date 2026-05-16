# 任务 01 — 首页地图优化

> 状态：已完成（可作为后续优化的参考提示词）

## 目标

优化首页全屏地图的加载性能和用户体验。

## 涉及文件

- `frontend/app/page.tsx` — 首页（地图主组件）
- `frontend/lib/studioTransport.ts` — 交通枢纽
- `frontend/lib/studioPresentation.ts` — 展示归一化
- `frontend/app/studios/components/` — 共享组件

## 任务内容

1. 地图加载优化（AMap JS API 动态加载）
2. hover 卡点击热区修复
3. 城市 fitView 只基于录音棚 marker（排除交通枢纽）
4. 双 Tab 详情弹窗（信息 Tab / 图片 Tab）
5. 地图销毁清理（destroyMap）
6. 录音室征集 FAB 按钮

## 验收标准

1. 地图正常加载，marker 显示正确
2. hover 卡不被底层 marker 抢点击
3. fitView 不被远距离枢纽拉大
4. 详情弹窗双 Tab 正常切换
5. 页面离开时地图资源释放
6. `npm run build` 通过

## 文档要求

1. 更新 docs/web/02-ia.md
2. 更新 docs/web/README.md 实现进度
