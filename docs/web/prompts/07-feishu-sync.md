# 任务 07 — 飞书结果表同步

> 状态：已完成

## 目标

实现飞书结果表与线上数据的同步链路。

## 涉及文件

- `frontend/app/admin/feishu-sync/` — 同步页
- `backend/routers/feishu_sync.py` — 同步 API
- `backend/routers/change_requests.py` — 变更申请 API

## 任务内容

1. 拉取飞书结果表数据（lark-cli）
2. 与线上 studios 表按名称比对
3. 生成 diff（新增/更新/软删除）
4. 管理员确认后执行同步
5. 变更申请系统（审批 + diff + 同步上线）

## 验收标准

1. 拉取飞书数据正常
2. diff 展示清晰
3. 同步写入成功
4. 新增录音室出现在前台
5. 软删除录音室从前台消失
6. `npm run build` 通过

## 关键链接

- 飞书问卷：`shrcn9doOMBwCO0nL76ovDqMG15`
- 飞书结果表：`GbOqbmrqEaM7F2sWDhecsjr4nOd`
