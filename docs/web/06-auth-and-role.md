# 06 — Web 端认证与权限

> 状态：已实现
> 最后更新：2026-04-15

## 认证方案

### 管理员认证

- **方式**：密码验证 + HMAC token
- **入口**：`/admin` 路由（从导航栏底部隐藏入口或直接访问）
- **密码存储**：Vercel 环境变量 `ADMIN_PASSWORD`
- **Token 生成**：`POST /api/auth/admin/login` → HMAC 签名 token
- **Token 验证**：`GET /api/auth/admin/verify`
- **Token 存储**：前端 localStorage
- **Token 传递**：Authorization header

### 游客态

- 无需认证
- 可访问所有公开页面（首页、列表、详情、提交、反馈）
- 不可访问 `/admin/*` 路由

### 路由守卫

- `AdminAuthGuard` 组件包裹 `/admin/*` 路由
- 未认证时重定向到登录页
- Token 过期时自动跳转登录页

## 权限矩阵

| 功能 | 游客 | 管理员 |
|---|---|---|
| 查看录音室 | Y | Y |
| 查看地图 | Y | Y |
| 搜索/筛选 | Y | Y |
| 提交反馈 | Y | Y |
| 提交录音室（飞书表单） | Y | Y |
| 编辑录音室 | N | Y |
| 删除录音室 | N | Y |
| 飞书同步 | N | Y |
| 变更审批 | N | Y |
| 上传图片 | N | Y |

## 安全注意事项

- 密码不在代码中硬编码，仅存 Vercel 环境变量
- Token 使用 HMAC 签名，不可伪造
- 管理员路由服务端不暴露敏感操作（前端守卫 + 后端 token 校验）
- CORS 限制只允许已知前端域名
