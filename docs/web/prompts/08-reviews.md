# 任务 08 — 录音室评价

> 状态：后端已完成，前端待接入

## 目标

为录音室接入评价系统。

## 涉及文件

- `backend/routers/reviews.py` — 评价 API（已实现）
- `frontend/app/studios/components/` — 待实现评价组件
- `frontend/lib/api.ts` — 待增加评价 API 调用

## 后端 API（已实现）

```text
POST   /api/reviews                         提交评价
GET    /api/reviews/studio/{studio_id}        获取评价列表
GET    /api/reviews/studio/{studio_id}/count  获取评价数量
GET    /api/reviews/counts                    批量获取评价数量
```

## 待实现前端

1. 评价列表组件（在详情页/弹窗中展示）
2. 评价数量 badge（在卡片/marker 上展示）
3. 提交评价表单（轻量）

## 验收标准

1. 评价列表正常展示
2. 评价数量正确
3. 提交评价后状态为 pending，管理员发布后可见
4. `npm run build` 通过
