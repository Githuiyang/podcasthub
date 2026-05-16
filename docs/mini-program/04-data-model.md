# 04 — 数据模型与字段映射

> 状态：已更新（新增 Editor / Business 数据模型）
> 最后更新：2026-04-16

## 录音室（Studio）

| 字段 | 类型 | 说明 | 录音室页 | 详情页 |
|---|---|---|---|---|
| id | number | 主键 | 路由参数 | 路由参数 |
| name | string | 名称 | 卡片标题 | 页面标题 |
| cover_image | string? | 封面图 | 卡片封面 | 头图 |
| description | string? | 补充介绍 | - | 介绍区 |
| open_hours | string? | 开放时间 | - | 详情区 |
| city | string? | 城市 | 城市筛选 | 地址拼接 |
| district | string? | 区划 | 卡片区域 | 地址拼接 |
| address | string? | 详细地址 | 卡片地址 | 地址区（可复制） |
| longitude | number? | 经度 | - | - |
| latitude | number? | 纬度 | - | - |
| equipment | string[]? | 设备 | - | 标签列表 |
| room_count | number | 房间数 | - | 详情区 |
| room_features | string? | 房间特性 | - | 详情区 |
| capacity | number? | 容纳人数 | 卡片标签 | 详情区 |
| charging_method | string? | 收费方式 | 卡片价格 | 价格区 |
| price_per_hour | number? | 时价 | 列表价格 fallback | 价格区 |
| price_per_day | number? | 天价 | 列表价格 fallback | 价格区 |
| price_note | string? | 价格说明 | - | 价格备注 |
| booking_url | string? | 预约链接 | - | CTA按钮（复制） |
| booking_note | string? | 预约说明 | - | 预约区 |
| booking_qr_image | string? | 预约二维码 | - | 二维码图片 |
| contact_name | string? | 联系人 | - | 联系区 |
| contact_phone | string? | 电话 | - | 一键拨号 |
| contact_wechat | string? | 微信 | - | 复制微信号 |
| contact_info | string? | 联系方式（原始） | - | 联系区（兜底） |
| portfolio_images | string[]? | 作品图片 | - | 图片预览 |
| portfolio_links | string[]? | 作品链接 | - | - |
| tags | string[]? | 标签 | - | 标签区 |
| is_active | boolean | 是否上线 | - | - |

## 剪辑师（Editor）

| 字段 | 类型 | 说明 | 创作者列表页 | 创作者详情页 |
|---|---|---|---|---|
| id | number | 主键 | 路由参数 | 路由参数 |
| name | string | 名称 | 卡片标题 | 页面标题 |
| avatar | string? | 头像 | 卡片头像 | 头部头像 |
| bio | string? | 简介 | 卡片简介 | 头部简介 |
| skills | string[]? | 擅长技能 | - | 标签列表 |
| tags | string[]? | 标签 | 卡片标签 | 头部标签 |
| editor_type | string? | 类型（剪辑师/制作人/混合） | - | 详情区 |
| availability_status | string? | 接单状态 | - | 详情区 |
| strengths | string? | 擅长描述 | - | 详情区 |
| portfolio_works | string? | 作品展示 | - | 作品区 |
| coop_review | string? | 合作评价 | - | 评价区 |
| pricing | string? | 报价 | - | 报价区 |
| contact_info | string? | 联系方式 | - | 联系区 |
| is_active | boolean | 是否上线 | - | - |

## 商务/制作人（Business）

| 字段 | 类型 | 说明 | 创作者列表页 | 创作者详情页 |
|---|---|---|---|---|
| id | number | 主键 | 路由参数 | 路由参数 |
| name | string | 名称 | 卡片标题 | 页面标题 |
| avatar | string? | 头像 | 卡片头像 | 头部头像 |
| bio | string? | 简介 | 卡片简介 | 头部简介 |
| tags | string[]? | 标签 | 卡片标签 | 头部标签 |
| business_type | string? | 商务类型 | - | 详情区 |
| industry | string? | 行业领域 | - | 详情区 |
| services | string? | 服务类型 | - | 详情区 |
| contact_info | string? | 联系方式 | - | 联系区 |
| is_active | boolean | 是否上线 | - | - |

## 各页面数据来源

### 录音室页（TabBar 主入口）— 搜索与筛选
- `GET /api/studios/cities` -> 城市列表
- `GET /api/studios/list?city=xxx&search=xxx&size=200` -> 录音室列表

### 录音室详情页 — 决策与判断
- `GET /api/studios/detail/{id}` -> 录音室完整信息（使用 Studio 类型）

### 创作者页（TabBar 第二入口）— 分段切换浏览
- `GET /api/editors/list?search=xxx&page=1&size=20` -> 剪辑师列表（使用 EditorListItem 类型）
- `GET /api/business/list?search=xxx&page=1&size=20` -> 制作人列表（使用 BusinessListItem 类型）

### 创作者详情页 — 了解与联系
- `GET /api/editors/detail/{id}` -> 剪辑师完整信息（使用 Editor 类型，kind=editor）
- `GET /api/business/detail/{id}` -> 制作人完整信息（使用 Business 类型，kind=business）

## 与 Web 端完全复用

小程序直接调用 Web 端同一套 API（`https://api.daydayup.media`），字段结构一致，不做额外映射。
