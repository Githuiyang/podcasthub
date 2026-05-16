# 07 — Web 端飞书同步与后台管理

> 状态：已实现
> 最后更新：2026-04-15

## 数据收集链路

```text
飞书问卷 → 飞书结果表 → 人工确认 diff → 同步线上 studios 表
```

### 关键链接

- 问卷（收集入口）：`https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15`
- 结果表（整理工作台）：`https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd`

### 数据流说明

1. 用户在飞书问卷中填写录音室信息
2. 数据进入飞书结果表
3. 管理员在结果表中整理、删改数据
4. 管理员在 Web 后台触发"飞书同步"
5. 后端通过 lark-cli 读取飞书结果表数据
6. 按名称比对线上 studios 表
7. 生成 diff（新增/更新/软删除）
8. 管理员确认后同步写入

## 管理后台功能

### 录音室编辑页（`/admin/studios`）

- 表格展示所有录音室
- 支持按城市筛选
- 行内编辑字段：联系方式、收费方式、预约信息等
- 图片上传（Supabase Storage）
- 预约二维码上传（`POST /api/studios/{id}/upload-qr`）
- 软删除（设置 `is_active=false`，前台和后台自动过滤）

### 飞书同步页（`/admin/feishu-sync`）

- 拉取飞书结果表数据（`GET /api/feishu-sync/records`）
- 与线上数据比对（`GET /api/feishu-sync/compare`）
- 展示 diff 结果
- 确认后执行同步（`POST /api/feishu-sync/apply`）
- 同步操作：新增录音室、更新字段、软删除

### 变更审批页（`/admin/change-requests`）

- 查看待审批变更申请列表
- 预览字段级 diff（`GET /api/change-requests/diff/{id}`）
- 批准（`PUT /api/change-requests/approve/{id}`）
- 拒绝（`PUT /api/change-requests/reject/{id}`）
- 应用变更（`PUT /api/change-requests/apply/{id}`）— 自动写入 studios 表

## 删除策略

- 所有删除为软删除（`is_active=false`）
- 软删除后从前台列表、地图、后台列表自动过滤
- 以飞书结果表中保留的记录为准
- 不在飞书结果表中的录音室会被标记为非活跃

## 注意事项

- 飞书结果表中的数据比线上 studios 表更权威
- 同步前必须先 diff 确认
- 同步是单向的：飞书 → 线上
- 变更申请可以由任何人通过 API 创建，但只有管理员可以审批
