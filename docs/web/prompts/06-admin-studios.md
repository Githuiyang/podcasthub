# 任务 06 — 管理后台录音室编辑

> 状态：已完成

## 目标

实现管理后台录音室编辑页，支持增删改查。

## 涉及文件

- `frontend/app/admin/layout.tsx` — AdminAuthGuard
- `frontend/app/admin/studios/page.tsx` — 编辑页
- `backend/routers/auth.py` — 认证
- `backend/routers/studios.py` — CRUD
- `backend/services/image_service.py` — 图片上传

## 任务内容

1. 管理员密码认证
2. 录音室列表（支持城市筛选）
3. 行内编辑（联系方式、收费方式、预约信息）
4. 图片上传（Supabase Storage）
5. 预约二维码上传
6. 软删除（is_active=false）

## 验收标准

1. 未认证不可访问
2. 编辑保存成功
3. 图片上传正常
4. 软删除后前台自动过滤
5. `npm run build` 通过
