# 05 — Web 端 API 约定

> 状态：已冻结
> 最后更新：2026-04-15

## 基础约定

- 基础 URL：`https://api.daydayup.media`
- 本地开发：`http://localhost:8000`
- 前端通过 `NEXT_PUBLIC_API_BASE` 环境变量配置
- 前端 API 客户端：`frontend/lib/api.ts`（axios 封装）

## 录音间 API

```text
GET    /api/studios/list?city=&tag=&search=&page=&size=  列表（分页）
GET    /api/studios/cities                               城市列表（按录音室数量降序，返回 {city, count}[]）
GET    /api/studios/detail/{id}                          详情
POST   /api/studios/create                               创建
PUT    /api/studios/update/{id}                          更新
DELETE /api/studios/delete/{id}                          软删除（is_active=false）
POST   /api/studios/{id}/upload                          上传封面图
POST   /api/studios/{id}/upload-qr                       上传预约二维码
```

### 列表响应

```json
{
  "items": [StudioListItem],
  "total": 26,
  "page": 1,
  "size": 10
}
```

### 城市列表响应

```json
[
  {"city": "上海", "count": 9},
  {"city": "北京", "count": 7},
  {"city": "杭州", "count": 2}
]
```

- 按 `count` 降序排序，相同数量按城市名升序
- 前端通过 `studioCities.ts` 共享模块提取排序后的城市名列表

### 详情响应

返回完整 Studio 对象，包含所有字段。

## 剪辑师 API

```text
GET  /api/editors/list?skill=&search=&page=&size=   列表
GET  /api/editors/detail/{id}                       详情
POST /api/editors/create                            创建
PUT  /api/editors/update/{id}                       更新
DELETE /api/editors/delete/{id}                     软删除
```

## 商务 API

```text
GET  /api/business/list?type=&search=&page=&size=   列表
GET  /api/business/detail/{id}                      详情
POST /api/business/create                           创建
PUT  /api/business/update/{id}                      更新
DELETE /api/business/delete/{id}                    软删除
```

## 反馈 API

```text
POST /api/feedback              提交反馈（称呼 + 详情 → 飞书 Webhook）
POST /api/feedback/submit       兼容旧路径
```

### 反馈请求体

```json
{
  "name": "可选-称呼",
  "contact": "可选-联系方式",
  "type": "general",
  "content": "反馈内容（必填）",
  "source": "web_detail",
  "studio_id": 1,
  "studio_name": "录音室名称",
  "feedback_type": "correction"
}
```

- `source`/`studio_id`/`studio_name`/`feedback_type` 全部可选，用于绑定录音室上下文
- `source` 可选值：`web_detail`（详情页）、`web_modal`（首页弹窗）、`general`（全站）
- `feedback_type` 可选值：`correction`/`status`/`price`/`booking`/`contact`/`experience`
- 有录音室上下文时，飞书卡片标题显示录音室名称，使用橙色模板区分

## 评价 API

```text
POST   /api/reviews                           提交评价
GET    /api/reviews/studio/{studio_id}        获取评价列表
GET    /api/reviews/studio/{studio_id}/count  获取评价数量
GET    /api/reviews/counts                    批量获取评价数量
```

## 认证 API

```text
POST /api/auth/admin/login   密码验证 → HMAC token
GET  /api/auth/admin/verify  验证 token 有效性
```

## 变更申请 API

```text
POST   /api/change-requests/create              创建变更申请
GET    /api/change-requests/list?status=pending   列表
GET    /api/change-requests/detail/{id}           详情
GET    /api/change-requests/diff/{id}             预览差异
PUT    /api/change-requests/approve/{id}          批准
PUT    /api/change-requests/reject/{id}           拒绝
PUT    /api/change-requests/apply/{id}            应用变更
```

## 飞书同步 API

```text
GET  /api/feishu-sync/records    拉取飞书结果表数据
GET  /api/feishu-sync/compare    比对飞书与线上
POST /api/feishu-sync/apply      执行同步
```

## CORS 配置

后端 `CORS_ALLOW_ORIGINS` 环境变量控制允许的前端域名：

- 线上：`https://podcasthub.daydayup.media,https://daydayup.media`
- 本地：`http://localhost:3000,http://127.0.0.1:3000`
