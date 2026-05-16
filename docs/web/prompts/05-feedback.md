# 任务 05 — 反馈功能

> 状态：已完成

## 目标

实现反馈弹窗，通过飞书 Webhook 推送。

## 涉及文件

- `frontend/app/studios/components/FeedbackModal.tsx` — 反馈弹窗
- `backend/routers/feedback.py` — 飞书 Webhook 推送

## 任务内容

1. FeedbackModal 组件（称呼 + 反馈详情）
2. 提交到后端 API
3. 后端转发到飞书 Webhook
4. 弱化"录音室信息更正"入口

## 验收标准

1. 提交成功后 toast 提示
2. 飞书群收到通知
3. 不打断主流程
4. `npm run build` 通过

## 飞书 Webhook

需配置环境变量 `FEISHU_WEBHOOK_URL`。
