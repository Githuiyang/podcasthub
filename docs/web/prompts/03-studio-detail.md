# 任务 03 — 录音室详情页

> 状态：已完成

## 目标

实现独立录音室详情页，展示完整信息。

## 涉及文件

- `frontend/app/studios/[id]/` — 详情页路由
- `frontend/lib/studioPresentation.ts` — 展示归一化
- `frontend/lib/studioTransport.ts` — 交通枢纽
- `frontend/app/studios/components/StudioDetailSection.tsx`
- `frontend/app/studios/components/StudioTransitGrid.tsx`

## 任务内容

1. 封面图大图展示
2. 名称 + 地址 + 价格 + 标签
3. 开放时间 / 设备 / 房间特性
4. 补充介绍
5. 预约方式（链接 + 二维码 + 说明）
6. 联系方式
7. 交通枢纽信息
8. 图片展示

## 验收标准

1. 信息去重（`studioPresentation.ts` 归一化）
2. 交通信息正确展示
3. 预约二维码正确展示
4. `npm run build` 通过
