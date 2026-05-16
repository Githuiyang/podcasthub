# 04 — Web 端数据模型与字段映射

> 状态：已冻结
> 最后更新：2026-04-15

## 核心数据表

### studios（录音室）

| 字段 | 类型 | 说明 | Web 展示 |
|---|---|---|---|
| id | integer | 主键 | 路由参数 |
| name | string | 名称 | 标题 / marker |
| cover_image | string? | 封面图 | 卡片 / 详情头图 / 弹窗 |
| description | string? | 补充介绍 | 详情页介绍区 |
| open_hours | string? | 开放时间 | hover 卡 / 详情 / 弹窗 |
| city | string? | 城市 | 列表筛选 / fitView |
| district | string? | 区划 | 详情地址 |
| address | string? | 详细地址 | hover 卡 / 详情 / 弹窗 |
| longitude | float? | 经度 | 地图 marker 定位 |
| latitude | float? | 纬度 | 地图 marker 定位 |
| equipment | jsonb | 设备列表 | 详情 / 弹窗 |
| room_count | integer | 房间数 | 详情 |
| room_features | string? | 房间特性 | 详情 |
| capacity | integer? | 容纳人数 | 详情 / 弹窗 |
| charging_method | string? | 收费方式（结构化） | hover 卡 / 详情 / 弹窗 / 后台 |
| price_per_hour | float? | 时价 | 详情 |
| price_per_day | float? | 天价 | 详情 |
| price_note | string? | 价格说明 | 详情 |
| booking_url | string? | 预约链接 | CTA 按钮 |
| booking_note | string? | 预约说明 | 详情 / 弹窗 |
| booking_qr_image | string? | 预约二维码图片 | 详情 / 弹窗（128x128） |
| contact_name | string? | 联系人 | 详情 |
| contact_phone | string? | 电话 | 一键拨打 |
| contact_wechat | string? | 微信 | 复制 |
| contact_info | string? | 联系方式（原始） | 详情 |
| portfolio_images | jsonb | 作品图片 | 图片 Tab |
| portfolio_links | jsonb | 作品链接 | - |
| tags | jsonb | 标签 | 详情 |
| is_active | boolean | 是否上线 | 软删除标记 |
| created_at | datetime | 创建时间 | 后台 |
| updated_at | datetime | 更新时间 | 后台 |

### editors（剪辑师）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| name | string | 姓名 |
| role | string | 角色（editor/producer/mixer 等） |
| avatar_url | string? | 头像 |
| bio | string? | 简介 |
| skills | jsonb | 技能标签 |
| strengths | jsonb | 擅长领域 |
| portfolio_works | jsonb | 作品列表 |
| pricing_info | string? | 报价 |
| city | string? | 所在城市 |
| editor_type | string? | 类型标签 |
| availability_status | string? | 可用状态 |

### business_contacts（商务）

结构与 editors 类似，字段差异大所以独立建表。

### studio_change_requests（变更申请）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| studio_id | integer | 关联录音室 |
| field_name | string | 变更字段名 |
| old_value | string? | 旧值 |
| new_value | string? | 新值 |
| status | string | pending/approved/rejected/applied |
| created_at | datetime | 创建时间 |

### reviews（评价）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| studio_id | integer | 关联录音室 |
| rating | integer | 评分 |
| content | string | 评价内容 |
| status | string | pending/published |

## 前端 TypeScript 类型

定义在 `frontend/lib/types.ts`：

- `Studio` — 详情数据
- `StudioListItem` — 列表/地图数据
- `CityWithCount` — 城市及录音室数量（`{city, count}`）
- `Editor` / `EditorListItem` — 剪辑师
- `BusinessContact` / `BusinessListItem` — 商务
- `Review` — 评价

## 交通枢纽数据

定义在 `frontend/lib/studioTransport.ts`：

- `cityTransportHubs` 注册表，按城市配置枢纽列表
- 已覆盖 9 城市（上海 4 / 北京 2 / 杭州 4 / 广州 4 / 成都 4 / 深圳 3 / 福州 3 / 天津 3 / 景德镇 2）
- 新增城市时在注册表追加一条即可

## 展示归一化

定义在 `frontend/lib/studioPresentation.ts`：

- 去除价格同义重复
- 去除预约说明与 CTA 重复
- 开放时间独立展示
- 联系方式合并展示

## 城市排序与默认选中

定义在 `frontend/lib/studioCities.ts`：

- `extractCityNames(data)` — 从 `{city, count}[]` 提取按数量降序排列的城市名列表
- `getDefaultCity(data)` — 获取录音室数量最多的城市名
- `sortCitiesByCount(data)` — 按数量降序 + 城市名升序排序
- 后端 `/cities` 返回已排序的数据，前端兜底保证一致性
