# 05 — API 约定

> 状态：已更新（新增剪辑师/商务 API）
> 最后更新：2026-04-16

## 基地址

```
https://api.daydayup.media
```

## 小程序用到的接口

### 录音室

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/studios/list?city=&search=&page=&size=` | 列表 |
| GET | `/api/studios/cities` | 城市列表 |
| GET | `/api/studios/detail/{id}` | 详情 |

### 剪辑师

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/editors/list?skill=&tag=&search=&page=&size=` | 列表 |
| GET | `/api/editors/detail/{id}` | 详情 |

### 商务/制作人

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/business/list?business_type=&industry=&search=&page=&size=` | 列表 |
| GET | `/api/business/detail/{id}` | 详情 |

### 反馈

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/feedback` | 提交反馈 |

### 管理员

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/admin/login` | 密码登录 |
| GET | `/api/auth/admin/verify` | 验证 token |
| PUT | `/api/studios/update/{id}` | 更新录音室 |
| DELETE | `/api/studios/delete/{id}` | 软删除 |

## 请求规范

- Content-Type: `application/json`
- 管理员接口需 Header: `Authorization: Bearer {token}`
- 所有接口与 Web 端完全一致，小程序不做独立后端
