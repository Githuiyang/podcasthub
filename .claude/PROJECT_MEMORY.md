# PodcastHub 项目记忆

## 项目概览

- **定位**: 全国录音间展示与选择平台
- **核心任务**: 帮助用户查看全国各地录音间的位置、基本信息、价格、联系方式、交通便利程度，并快速做出选择或联系
- **目标用户**: 播客主理人、录音间运营者、需要录音空间的内容创作者
- **成功标准**: 用户能快速找到合适的录音间，录音间主理人能方便地提交信息
- **首页形态**: 全屏高德地图总览（录音间专属，无 Tab 切换）
- **录音间页形态**: 列表 + 搜索 + 城市筛选（深度查找与对比）
- **剪辑师/商务**: 导航栏独立一级入口（剪辑师 + 商务各自一条）
- **导航架构（Web）**: 四主入口（首页 / 录音间 / 剪辑师 / 商务）+ 添加我的录音室 + 反馈
- **导航架构（小程序）**: 双 Tab（录音室 + 创作者）；创作者 Tab 内分段控件切换剪辑师/制作人
- **地图生命周期**: 首页 initMap 负责创建（含旧实例清理），destroyMap 负责页面卸载时释放所有资源
- **详情弹窗**: 双 Tab（录音室信息 / 图片），默认打开信息 Tab；Tab 重置在 openStudioModal 中执行，不依赖关闭时机
- **录音室征集入口**: 导航栏"添加我的录音室"为全站主入口（桌面端+移动端）；首页地图 FAB（StudioRecruitmentFab）为场景化弱入口（轻量灰色"+"按钮→展开"收录录音室"描边按钮）；录音间列表页保留描边风格辅助入口
- **城市排序**: 城市按钮按录音室数量降序排列；首页默认选中录音室最多的城市；排序逻辑收敛在 `studioCities.ts`

## 当前真实架构

- 前端: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- 后端: Python + FastAPI + SQLAlchemy（Vercel Python Runtime）
- 数据库: Supabase Postgres
- 存储: Supabase Storage（桶：`podcasthub-media`）
- 地图: 高德地图 JS API v2.0 (前端渲染) + Web Service API (后端地理编码，当前不可用)
- 反馈: 飞书自定义机器人 Webhook
- 部署:
  - 前端 `https://podcasthub.daydayup.media`
  - 后端 `https://api.daydayup.media`

## 项目结构

```text
PodcastHub/
├── CLAUDE.md
├── README.md
├── .claude/PROJECT_MEMORY.md
├── backend/
│   ├── api/         → Vercel 入口
│   ├── alembic/     → 迁移
│   ├── models/      → database.py + schemas.py
│   ├── routers/     → studios/editors/business/feedback
│   ├── services/    → image_service.py + studio_pricing.py
│   ├── scripts/     → SQLite/Supabase 导入导出
│   └── supabase/    → SQL mirror / seed
└── frontend/
    ├── app/         → 首页地图 + admin/studios + studios/editors/business 各模块
    ├── components/  → 共享组件（StudioTransitGrid、StudioRecruitmentFab、StudioDetailSection、StudioDetailInfoTab、StudioDetailImageTab、FeedbackModal 等）
    └── lib/         → api.ts + studioForm.ts + studioPresentation.ts + studioTransport.ts + types.ts
```

## 重要决策

| 日期 | 决策 | 原因 | 影响 |
|------|------|------|------|
| 2026-04-09 | 三张独立表而非单表多态 | 三种角色字段差异大（>60%） | 各角色可独立扩展 |
| 2026-04-09 | JSON 列存列表数据 | MVP 简单优先 | 已平滑迁到 Postgres JSONB |
| 2026-04-09 | 飞书 Webhook 收集反馈 | 最简方案，无需用户认证 | 需配置 Webhook URL |
| 2026-04-09 | App Router 多页面 | 需要支持直接访问和分享 | 路由清晰 |
| 2026-04-09 | AMap JS API 动态加载 | 避免 SSR 问题 | 首页需 `use client` |
| 2026-04-09 | layout.tsx 不设 max-w 容器 | 地图需要全宽 | 各子页面自备容器 |
| 2026-04-10 | 前后端拆成双 Vercel 项目 | 降低运维复杂度并保留 FastAPI | 前端 / 后端独立部署 |
| 2026-04-10 | 数据切到 Supabase Postgres | 摆脱 SQLite 线上限制 | 线上与本地开发数据脱钩 |
| 2026-04-10 | 图片切到 Supabase Storage | 摆脱 Vercel 本地文件系统限制 | 图片返回公网 URL |
| 2026-04-10 | 后台先做轻量 `admin/studios` | 先打通线上编辑链路 | 暂无认证，后续补保护 |
| 2026-04-10 | 收费方式独立成 `charging_method` | 避免只靠 `price_note` 难以结构化展示 | 前后端与后台统一对齐 |
| 2026-04-10 | 交通信息展示“距离 + 打车时间” | 距离 alone 难判断通勤成本 | 当前为启发式估算 |
| 2026-04-10 | 详情展示先做字段归一化再渲染 | 原始数据里常把开放时间/收费/预约/联系方式混写在多个字段中 | 首页弹窗与详情页改为先去重再展示 |
| 2026-04-10 | 公开展示改为“地址优先” | 城市/区域与详细地址同时出现时信息重复 | 首页卡片、首页弹窗、详情页优先展示完整地址 |
| 2026-04-11 | 录音室征集先走飞书问卷 + 人工审核 | 先把用户提交链路跑通，再补自动通知和导入 | 站内新增 `/submit-studio` 入口 |
| 2026-04-11 | 项目定位收敛为"全国录音间展示与选择平台" | 录音间是唯一明确的主任务，剪辑师/商务抢注意力 | 首页纯地图总览，录音间页列表筛选，剪辑师/商务降级到"更多服务" |
| 2026-04-11 | "添加录音室"入口从导航栏移到地图 FAB | 导航栏应保持简洁，征集入口仅首页需要 | 新建 `StudioRecruitmentFab.tsx`，导航栏三处按钮全部删除 |
| 2026-04-11 | 详情弹窗改为双 Tab 单栏布局 | 图片不应占首屏面积，信息阅读优先 | 拆为 `StudioDetailInfoTab` + `StudioDetailImageTab`，信息按优先级排序 |
| 2026-04-11 | 城市首屏 fitView 只基于录音室 marker | 交通枢纽（如浦东机场）远距离点会拉大 bounds，把录音室主分布挤偏 | hub marker 仍显示但不参与 fitView |
| 2026-04-11 | 开放时间独立为 `open_hours` 字段 | description 混用导致编辑体验差、展示依赖正则解析 | 后台拆成两个独立输入，展示层优先读新字段 |
| 2026-04-11 | 后台录音室列表增加城市筛选 | 录音室增多后需城市维度管理 | 前端本地筛选，动态城市列表，搜索叠加 |
| 2026-04-11 | 简洁版飞书问卷（9 题） | 旧问卷 20+ 题拆得太细，同类信息合并成一道题 | 空间特性/收费/预约用长文本填空，导入时再解析 |
| 2026-04-11 | 独立详情页信息去重与顺序收敛 | 价格/预约/联系方式存在同义重复，交通信息抢占比 | 共用 studioPresentation 归一化，按决策路径排序，CTA 去重 |
| 2026-04-11 | 反馈弹窗内嵌"录音室信息更正"弱链接 | 录音室主理人发现信息有误时需要反馈渠道 | 放在反馈表单提交按钮下方，视觉弱化，不干扰主流程 |
| 2026-04-12 | 预约二维码图片 `booking_qr_image` 字段 | 部分录音室通过小程序码/公众号二维码预约 | 可选字段，后台支持上传，前台 128px 展示，与链接/说明三层共存 |
| 2026-04-12 | 录音室体验评价系统 `studio_reviews` | 以录音室为原子收集体验反馈，不是全站反馈 | 独立表 + 独立路由，新提交 pending 审核后才 published 展示 |
| 2026-04-12 | 剪辑师页面重构为"人物主页 + 作品展示" | 简单列表不体现人物质感，类似轻量版 LinkedIn 的结构更专业 | 列表页 → 人才墙（4列人物卡）；详情页 → 人物主页（居中头部+统计卡+擅长+作品+评价+报价+联系） |
| 2026-04-12 | 编辑器新增 5 个字段 | 支持"人物主页"展示需要更丰富的人物维度 | editor_type/availability_status/strengths/portfolio_works/coop_review |
| 2026-04-12 | 后台认证保护 | admin/studios 无认证，任何人可编辑线上数据 | HMAC-SHA256 token + admin layout 包裹 AuthGuard + Vercel 环境变量存密码 |
| 2026-04-13 | 交通枢纽按需启用（城市注册表） | 硬编码 `SHANGHAI_HUBS` 无法扩展，对所有城市全量预生成浪费资源 | `cityTransportHubs` 注册表，只有有录音棚的城市注册枢纽；`getCityHubs()` + `isCityTransitEnabled()` 公共 API |
| 2026-04-15 | 顶层导航收敛为双 Tab（已回滚） | 原导航 primaryLinks + serviceLinks + "更多服务"下拉入口冗余，录音室和剪辑师信息层级不对等 | 曾改为双主 Tab（录音室 + 剪辑师/制作人），商务降级为二级入口，admin 入口从公开页面移除；同日回滚为四入口（首页/录音间/剪辑师/商务）+ 添加录音室 + 反馈 |
| 2026-04-16 | 小程序双 Tab 重构：录音室 + 创作者 | 原"首页 + 录音室"双 Tab 定位模糊，首页发现页功能与录音室列表重复 | 删除首页（home），录音室 Tab 升为主入口，新增创作者 Tab（分段控件切换剪辑师/制作人），统一详情页 kind=editor|business |

## 进度日志

### 2026-04-15 顶层导航重构（双 Tab 架构）→ 已回滚

- **背景**: 原导航有 2 个 primary + "更多服务"下拉 + 移动端菜单，入口冗余；录音室列表页泄露"管理"链接到 admin 后台
- **完成**: Navbar 重构为双主 Tab：录音室（`/` + `/studios` + `/submit-studio`）+ 剪辑师/制作人（`/editors` + `/business`）
- **完成**: 移除"更多服务"下拉菜单，桌面端 2 Tab + 反馈按钮，移动端 2 Tab 底部导航 + 反馈图标
- **完成**: 录音室列表页移除公开"管理"入口（admin 仅通过直接 URL 访问）
- **完成**: 剪辑师页面增加"商务合作"二级链接（页面右上角，指向 `/business`）
- **路由匹配**: `isTabActive` 通过 `matchPrefixes` 数组支持子路由高亮
- **构建**: `npm run build` 通过（14 个页面，0 错误）
- **⚠️ 已回滚**: 同日因"本应改小程序但误改了 Web"而回滚，Navbar 恢复为四入口（首页/录音间/剪辑师/商务）+ 添加录音室 + 反馈

### 2026-04-15 Web 导航回滚（恢复四入口）

- **背景**: 双 Tab 导航重构属于"本应只改小程序端但误改了 Web 端"的操作，需要回滚 Web 端
- **回滚方式**: 手动恢复（因只有 1 个 git commit，无法 git revert）
- **回滚文件**:
  - `Navbar.tsx` — 恢复为四入口（首页/录音间/剪辑师/商务）+ "添加我的录音室"黑色按钮 + 反馈；移动端顶栏恢复"添加录音室"按钮 + 反馈文字按钮
  - `editors/page.tsx` — 删除"商务合作 →"二级链接（商务已恢复为导航栏一级入口）
- **保留不改的文件**:
  - `page.tsx`（首页纯地图总览、destroyMap、cancelled flag、动态城市列表）— 这些是独立功能改进
  - `studios/page.tsx`（"提交录音室信息"按钮、结果统计）— UX 改进独立于导航架构
  - `StudioRecruitmentFab.tsx`（FAB 悬浮入口）— 独立组件，与导航结构无关
  - `layout.tsx`（SEO metadata）— 独立功能
  - 其他所有文件（评价系统、后台认证、交通枢纽等）
- **验证**: `npm run build` 通过（14 页面，0 错误）

### 2026-04-15 Web 端文档体系建立

- **新建**: `docs/web/` 目录，与 `docs/mini-program/` 并列
- **内容**: 12 个文档文件（README + 00-10）+ 10 个任务提示词（task-template + 01-09）
- **覆盖范围**: 项目总纲、范围定义、信息架构、用户流程、数据模型、API 约定、认证权限、飞书同步、设计系统、SEO 分析、发布验收、任务提示词
- **定位**: Web 端是 PodcastHub 主站（全屏地图 + 完整后台 + 同步审核），小程序是轻量移动端入口
- **同步更新**: CLAUDE.md 已增加 `docs/web/` 目录索引

### 2026-04-15 录音室详情页信息收敛

- **背景**: 详情页之前用 `card-section` 均匀堆叠，信息层级不清晰，预约入口分散在多个区块
- **改动**:
  - 展示顺序收敛：名称+城市+地址 → 价格 → **预约与联系（CTA+二维码+联系方式合并为一个决策区块）** → 开放时间 → 设备+房间 → 介绍 → 交通 → 作品 → 评价
  - 去掉 `card-section` 均匀卡片感，改为 `border-b border-slate-100` 分隔的阅读流
  - 色系统一为 slate（与首页弹窗一致），不再混用 gray/slate
  - 新增城市+区域信息行（`studio.city · studio.district`）
  - CTA 按钮从页面底部提到"预约与联系"区块顶部
- **展示口径对齐**: `StudioCard`（列表卡片）价格展示改用 `getStudioPriceText()` 归一化函数，与详情页和首页弹窗一致
- **验证**: `npm run build` 通过（14 页面，0 错误）

### 2026-04-15 剪辑师/制作人板块收敛

- **背景**: 剪辑师页面用 emerald 色系与全站 slate 不统一，详情页用 card-section 均匀堆叠，商务入口与剪辑师入口重复
- **改动**:
  - 色系统一：emerald → slate（列表页、详情页、EditorCard 全部统一）
  - 详情页去掉 card-section，改为 border-b border-slate-100 分隔阅读流（与录音室详情页一致）
  - 详情页展示顺序收敛：头像+姓名+类型+简介 → 统计卡 → 擅长方向 → 专业能力 → 过往作品 → 合作评价 → 报价 → 联系方式
  - 剪辑师列表页加回"商务合作 →"二级链接（右上角，指向 `/business`）
  - 商务页标题从"商务资源"改为"商务合作"，副标题从"共 X 条商务信息"改为"播客生态商务对接"
  - 两线边界明确：录音间 = 找场地，剪辑师 = 找人
- **验证**: `npm run build` 通过，线上已部署

### 2026-04-15 城市默认排序与首页默认选中

- **后端 `/cities` 改造**: 返回 `{city, count}[]` 并按 count DESC + city ASC 排序，不再返回纯 `string[]`
- **前端共享逻辑**: 新建 `lib/studioCities.ts`，收敛 `sortCitiesByCount` / `extractCityNames` / `getDefaultCity`
- **首页默认城市**: 从硬编码 `DEFAULT_CITY = '上海'` 改为动态确定（录音室最多的城市）；`selectedCity` 初始 `null`，cities API 返回后设置
- **排序一致性**: 首页城市按钮、列表页城市 chips 均按录音室数量降序
- **类型**: 新增 `CityWithCount` 接口
- **验证**: `npm run build` 通过（14 页面 0 错误），前后端均已部署

### 2026-04-15 Web 首页地图总览优化

- **城市列表动态化**: 从硬编码 6 个城市改为 `GET /api/studios/cities` 动态获取，现覆盖全部 9 个城市
- **补全城市坐标**: 新增福州 [119.30, 26.08]、天津 [117.20, 39.13]、景德镇 [117.21, 29.29]
- **移动端适配修复**: 地图高度从 `calc(100vh-48px)` 改为移动端 `calc(100vh-96px)`（扣除顶部导航 48px + 底部 Tab 48px），桌面端保持 `calc(100vh-48px)`
- **全国概览模式**: 已有城市聚合 marker（显示城市名+数量），点击切换到城市视图
- **构建**: `npm run build` 通过

### 2026-04-09 项目初始化

- **完成**: 后端骨架（config/models/routers/services）
- **完成**: 前端页面（首页 + 录音间/剪辑师/商务 列表+详情+新建）
- **完成**: 导入 7 条上海录音间原始数据（来自 Excel）
- **完成**: 飞书反馈收集功能（FeedbackModal + Webhook）

### 2026-04-09 UI 与地图阶段

- **完成**: 全局视觉风格重设
- **完成**: 导航栏重设（桌面 + 移动双布局）
- **完成**: 首页全屏地图 + 城市筛选 + Tab
- **完成**: 录音间列表页、详情页、新增页优化
- **完成**: 手动设置 7 个上海录音间经纬度
- **完成**: 首页 hover 卡、中心详情卡交互基础形态

### 2026-04-10 线上架构切换

- **完成**: Supabase 建表并导入现有数据
- **完成**: 后端部署到 Vercel，正式域名 `api.daydayup.media`
- **完成**: 前端部署到 Vercel，正式域名 `podcasthub.daydayup.media`
- **完成**: 前端正式切到线上 API，不再依赖 `localhost`
- **完成**: 图片上传改为支持 Supabase Storage
- **完成**: `charging_method` 字段上线并回填 7 条录音间
- **完成**: 轻量后台 `admin/studios`，可直接编辑线上录音间联系方式、收费方式和预约信息

### 2026-04-10 体验与交互收口

- **完成**: marker hover 卡点击热区修复，不再被底层 marker 抢点击
- **完成**: 首页 hover 卡、中心详情卡、录音间详情页统一展示交通信息
- **完成**: 交通信息从“只展示距离”升级为“距离 + 预计打车时间”
- **完成**: 首页中心详情卡和录音间详情页增加字段归一化展示，避免开放时间/价格/预约/联系方式重复
- **完成**: 线上录音间展示改为“详细地址优先 + 联系人/联系方式合并”
- **完成**: 后台保存链路已验证，线上 `PUT /api/studios/update/{id}` 可用
- **完成**: 前端 `npm run build` 通过
- **完成**: 后端 `python3 -m compileall backend` 通过
- **完成**: 正式域名和 API 域名可用

### 2026-04-11 项目定位收敛起

- **完成**: 项目定位从"播客生态角色平台"收敛为"全国录音间展示与选择平台"
- **完成**: 顶部导航改造：首页/录音间/添加录音室/更多服务（下拉）/反馈
- **完成**: 首页去掉"录音间/剪辑师/商务"Tab 切换，纯地图总览定位
- **完成**: 录音间列表页强化为"查找录音间"定位，突出搜索和筛选
- **完成**: 剪辑师和商务入口降级到导航栏"更多服务"下拉菜单
- **完成**: 反馈表单简化为 2 个字段（称呼 + 反馈详情）
- **完成**: 飞书反馈机器人配置并验证通过
- **完成**: 站点标题和描述更新

### 2026-04-11 结构收尾

- **完成**: 移动端底部导航与桌面端统一，不再直接暴露剪辑师/商务一级入口
- **完成**: 导航配置统一为 primaryLinks + serviceLinks，桌面和移动共享数据源
- **完成**: 首页地图补齐 unmount cleanup（destroyMap：清除定时器、关闭 hover、销毁地图、清空 ref）
- **完成**: initMap 职责（重建前清理旧实例）与 destroyMap 职责（页面离开时最终释放）清晰分离

### 2026-04-11 征集与审核入口

- **完成**: 新建站内录音室提交页 `/submit-studio`
- **完成**: 首页 / 导航 / 录音间列表页新增"添加我的录音室"入口
- **完成**: 飞书最终版问卷与 `admin/studios` 当前字段完全对齐
- **完成**: 飞书问卷草稿文档改写为最终版映射说明
- **确认**: 当前流程为"飞书问卷收集 -> 人工审核 -> admin/studios 上线"

### 2026-04-11 征集入口 UI 重构

- **完成**: 删除顶部导航栏（桌面+移动端）和底部导航的"添加录音室"按钮，导航更简洁
- **完成**: 首页地图上的大征集卡片替换为轻量 FAB（`StudioRecruitmentFab.tsx`）：默认黑色 "+" 按钮，hover/点击展开征集提示+CTA
- **完成**: `ensureAmapScript().then(...)` 加 `cancelled` flag 防止页面卸载后仍 setState
- **完成**: `npm run build` 通过

### 2026-04-11 详情弹窗重构

- **完成**: 详情弹窗从"左图右文双列"改为"单栏 + 双 Tab（录音室信息 / 图片）"
- **完成**: 默认打开"录音室信息" Tab，图片不再占首屏核心面积
- **完成**: 信息 Tab 按 5 级优先级重排：名称+描述 → 地址 → 预约/开放/价格 → 联系方式 → 交通枢纽
- **完成**: 新建 `StudioDetailSection`（信息分区）、`StudioDetailInfoTab`（信息 Tab）、`StudioDetailImageTab`（图片 Tab）组件
- **完成**: 房间数降级为名称旁的弱标注（仅 >1 间时显示），不再与价格同级
- **完成**: 删除旧的双列布局和并列卡片拼接结构
- **完成**: `npm run build` 通过

### 2026-04-11 详情弹窗信息精简

- **完成**: 价格区块去重——有明确价格时 charging_method 仅作为次级补充出现一次；无明确价格时 charging_method 已是主文案，不再追加"收费方式：xxx"
- **完成**: 价格补充信息增加 `priceSupplement !== priceText` 保护，避免与主文案重复
- **完成**: 预约方式区块——去掉"暂无线上预约链接"低价值提示；优先展示真实预约说明
- **完成**: 联系方式兜底文案——简化为"暂无公开联系方式"，不再重复提独立详情页
- **完成**: 无描述兜底文案——从"暂无详细描述，建议联系主理人确认录音环境、设备和档期。"缩短为"暂无补充介绍"
- **完成**: `npm run build` 通过

### 2026-04-11 首页 marker 首屏渲染修复

- **完成**: 修复首次进入首页时录音室 marker 不自动显示的时序问题
- **根因**: `initMap()` 完成后只设了 `mapRef.current`（ref），不触发 React 重渲染。当数据先于地图到达时，marker 渲染 effect 跑一次但因为 map 为空而提前返回；地图就绪后没有状态变化驱动 effect 重新执行
- **方案**: 新增 `isMapReady` 状态（`useState(false)`），在 `initMap()` 末尾 `setIsMapReady(true)`，在 `destroyMap()` 开头 `setIsMapReady(false)`；marker 渲染 effect 依赖数组加入 `isMapReady`，守卫条件从检查 `AMap` 全局变量改为检查 `isMapReady`
- **完成**: `handleCitySelect` 去掉重复 `loadStudios()` 调用——原来既直接调 `loadStudios(city)` 又通过 `setSelectedCity(city)` 触发 `useEffect([loadStudios, selectedCity])`，导致每次切换城市双倍 API 请求
- **完成**: `npm run build` 通过

### 2026-04-11 首页地图首屏视野优化

- **完成**: 城市首屏 fitView 从"录音室 + 交通枢纽"改为"只基于录音室 marker"
- **根因**: 浦东机场等远距离枢纽点拉大 bounds，导致录音室主分布偏左
- **方案**: `setFitView(markersRef.current)` 不再包含 `hubOverlays`；交通枢纽 marker 仍正常显示，只是不参与首屏视野计算
- **完成**: `npm run build` 通过

### 2026-04-11 开放时间独立字段拆分

- **完成**: 新增 `open_hours` 独立字段（后端 model/schema + 前端 types/form）
- **根因**: 后台只有一个 `description` 文本框，运营人员把"录音室介绍"和"开放时间"混在一起；前台靠 `description` 里匹配 `开放时间:` 正则来拆分，体验差且不可靠
- **方案**: 后端新增 `open_hours` 字段；后台编辑页拆为"开放时间"（input）+ "补充介绍"（textarea）两个独立输入；展示层 `getStudioOpenHours()` 优先读 `open_hours`，旧数据 fallback 到 description 正则解析
- **完成**: Supabase 已执行 ALTER TABLE + 数据回填（7 条录音间的开放时间已从 description 迁移到 open_hours，description 已清空）
- **完成**: 前端 snapshot 数据已补齐 `open_hours: null`
- **完成**: SQL mirror 文件已创建（`20260411_000001_add_studio_open_hours.sql`）
- **完成**: 后端 + 前端部署上线
- **完成**: `npm run build` 通过

### 2026-04-11 后台录音室列表增加城市筛选

- **完成**: admin/studios 左侧列表新增城市筛选条（动态城市列表，从全量数据中提取）
- **根因**: 后台只有搜索没有城市维度，录音室增多后管理效率下降
- **方案**: 前端本地筛选（已一次性拉全量数据），`visibleStudios` useMemo 扩展为先按城市过滤再按搜索过滤
- **完成**: 切换城市后 selectedId 不在筛选结果中时，自动跳转到第一条，避免"左上海右北京"状态错乱
- **完成**: 空状态区分"城市下无录音室"和"搜索无匹配"
- **完成**: `npm run build` 通过，前端已部署

### 2026-04-11 点击响应体验优化

- **完成**: 首页详情弹窗 — 点击 marker 后立即展示 preview（名称+地址）+ skeleton 骨架，不再整块空白等 API 返回
- **完成**: 反馈弹窗 — 失败提示从 `alert()` 改为弹窗内红色文字，提交时禁用表单防止重复操作
- **完成**: 后台保存 — `alert()` 改为页面顶部轻量 toast（2 秒自动消失），`refreshList()` 改为非阻塞（不 await）
- **完成**: 后台上传 — 同样改为 toast 提示 + 非阻塞列表刷新
- **结论**: 城市切换按钮已经是即时高亮响应，不需要额外修改
- **完成**: `npm run build` 通过，前端已部署

### 2026-04-11 飞书问卷简洁版重建

- **完成**: 在 Base `GerTbzGuuaI2hoshMBYc5WIbnWe` 内新建表 `录音室提交表（简洁版）`（`tblyPBiOkf6ZRkBd`），含 10 个字段（1 ID + 9 业务）
- **完成**: 创建表单 `PodcastHub 录音室信息收集问卷（简洁版）`（`vewBPJZ00V`），9 道题目按顺序配置、必填和描述
- **完成**: 旧表和旧问卷保留不动，新问卷作为后续正式版本
- **完成**: 前端 `studioSubmission.ts` 默认 URL 已更新为新表单链接，Vercel 环境变量已更新
- **方案**: 同类信息合并成一道题（空间特性/设备 → 长文本填空，收费+价格 → 一道题，开放时间+预约方式 → 一道题），导入时再由人工或脚本解析
- **完成**: `npm run build` 通过，前端已部署

### 2026-04-11 批量导入全国录音室数据

- **来源**: `backend/data/luyinjian_studios_2025.json`（录音间网站 luyinjian.cn 数据）
- **完成**: 通过 API 批量创建 23 条新录音室，覆盖北京/上海/杭州/广州/成都/深圳/福州/天津/景德镇 9 个城市
- **去重**: 发现 4 组冲突（内容中苔、小宇宙录音室、CCPA S36、荔枝播客安贞门），已按"删旧留新"处理，删除旧 id=1/2/4 和新 id=24
- **原有保留**: id=3（尽管吱声）、id=6（Inspirer）、id=7（788创意社区）不在新数据中，保留不动
- **当前**: 25 条录音室，9 个城市，无重复

### 2026-04-11 飞书表单题目顺序修复

- **问题**: 简洁版表单 9 道题顺序混乱（录音室名称排第 8），且缺少引导描述
- **方案**: 删除全部 9 道题，按正确顺序重建：录音室名称 → 描述 → 地址 → 空间/设备 → 收费/价格 → 开放时间/预约 → 联系人 → 联系方式 → 照片，每题加 description
- **确认**: 线上前端链接已指向新表单 `vewBPJZ00V`，不是旧 16 题表单

### 2026-04-11 独立详情页信息去重与顺序优化

- **完成**: 价格区块去重 — 使用统一的 `getStudioPriceText()` + `shouldShowChargingMethodAsSupplement()`，不再出现"免费"与"收费方式：免费"同框
- **完成**: CTA 与预约说明去重 — 删除 CTA 按钮下方的重复 bookingSummary 文本，预约说明移入正文"预约与联系"区块，CTA 按钮文案改为"前往预约"
- **完成**: 预约方式 + 联系方式合并为"预约与联系"单一区块，不再分成两个独立 card-section
- **完成**: 设备与房间拆分 — 设备单独一个区块（标签列表），房间信息（容纳人数/自带设备/录音间数量）独立一个区块
- **完成**: 交通枢纽顺序后移 — 从第 4 位移到第 8 位（在预约与联系之后）
- **完成**: 详情页和首页弹窗共用 `studioPresentation.ts` 的归一化函数（`getStudioPriceText`、`shouldShowChargingMethodAsSupplement`、`getStudioPriceSupplement` 等）
- **完成**: `npm run build` 通过

### 2026-04-11 反馈弹窗增加录音室信息更正入口

- **完成**: 在 `FeedbackModal.tsx` 表单提交按钮下方增加"录音室信息更正"弱链接，指向飞书文档 `https://my.feishu.cn/wiki/OzEEwyasziC7VFk7YrxcnH8lnre`
- **样式**: `text-[11px] text-gray-300 hover:text-gray-500`，视觉弱于主按钮和反馈表单

### 2026-04-12 预约二维码图片字段（booking_qr_image）

- **背景**: 部分录音室通过微信小程序码或公众号二维码预约，不是网页链接
- **完成**: 后端新增 `booking_qr_image` 字段（database.py, schemas.py）
- **完成**: 后端新增 `POST /api/studios/{id}/upload-qr` 上传接口
- **完成**: 前端 types.ts、studioForm.ts 补齐新字段
- **完成**: 前端 api.ts 新增 `uploadQr` 方法
- **完成**: 后台 admin/studios 增加二维码上传按钮 + 预览 + 移除
- **完成**: 前台首页弹窗 `StudioDetailInfoTab` 在预约方式区展示二维码 + "扫码预约"
- **完成**: 前台独立详情页 `studios/[id]` 在"预约与联系"区块展示二维码
- **展示规则**: 链接预约（按钮）+ 扫码预约（128px 图片）+ 预约说明（文字）三层共存互不覆盖
- **兼容性**: 新字段 nullable，已有数据不受影响
- **问卷同步**: 下一版飞书问卷应增加"预约二维码图片"上传题
- **完成**: `npm run build` 通过

### 2026-04-12 录音室体验反馈/评价系统

- **背景**: 需要以"录音室"为原子收集用户体验评价，不是全站反馈
- **完成**: 后端新增 `studio_reviews` 表（studio_id, rating, content, nickname, status, source）
- **完成**: 后端新增 `POST /api/reviews`（提交评价）、`GET /api/reviews/studio/{id}`（列表）、`GET /api/reviews/studio/{id}/count`（计数）、`GET /api/reviews/counts`（批量计数）
- **完成**: 前端新增 `StudioReviewSection` 组件 — 详情页底部展示已发布评价（最多5条），空状态显示"暂无体验反馈"
- **完成**: 前端新增 `StudioReviewModal` 组件 — 轻量表单（评分可选 + 体验文字必填 + 署名可选），提交后进入 pending 审核
- **完成**: 详情页 `studios/[id]` 底部集成评价区 + "分享你的录音体验"低打扰入口
- **审核策略**: 新提交默认 `pending`，通过后台或直接 SQL 审核为 `published` 后才展示
- **与全站反馈区分**: 全站反馈走飞书 Webhook（`/api/feedback`）；录音室评价走独立表（`/api/reviews`），绑定 studio_id
- **完成**: `npm run build` 通过，前后端已部署

### 2026-04-12 剪辑师/制作人模块重构

- **背景**: 剪辑师页面从简单列表升级为"人物主页 + 作品展示"结构，类似轻量版 LinkedIn
- **完成**: 后端 Editor 模型新增 5 个字段：`editor_type`（类型/级别）、`availability_status`（接单状态）、`strengths`（擅长方向）、`portfolio_works`（过往作品文本）、`coop_review`（合作评价）
- **完成**: 后端 Pydantic schemas（EditorCreate/Update/Response/ListItem）全部同步更新
- **完成**: 前端 types.ts Editor/EditorListItem 接口同步更新
- **完成**: 列表页重写为"人才墙"布局 — 纵向人物卡，4 列网格，突出头像/姓名/类型/状态/bio/代表作/报价/标签
- **完成**: EditorCard 组件重写为居中人物卡 — 大头像（80px）、类型/状态标签、bio 摘要、代表作片段、报价
- **完成**: 详情页重写为"人物主页"风格 — 居中头部（头像+名字+类型+状态+bio+标签）、统计卡（经验/报价/作品数）、擅长方向、专业能力、过往作品（文字+图片+链接+作品集主页）、合作评价（blockquote 样式）、报价、联系方式
- **完成**: 列表页底部增加"加入制作人名录"弱化报名入口
- **完成**: 去掉"添加剪辑师"操作按钮，列表页不再暴露直接操作入口
- **完成**: Supabase ALTER TABLE 添加 5 个新列（editors 表当前为空，无数据迁移）
- **完成**: `npm run build` 通过，前后端已部署

### 2026-04-12 后台管理认证保护

- **背景**: `admin/studios` 后台无任何认证，任何人都可访问和编辑线上录音室数据
- **完成**: 后端新增 `POST /api/auth/admin/login`（密码验证返回 HMAC token）和 `GET /api/auth/admin/verify`（token 有效性验证）
- **完成**: 后端 config.py 新增 `ADMIN_PASSWORD` 和 `ADMIN_SECRET_KEY` 环境变量
- **完成**: 前端新增 `AdminAuthGuard` 组件 — 密码输入框 + localStorage 存储 token + 自动验证已有 token
- **完成**: 新建 `app/admin/layout.tsx` 包裹 AuthGuard，所有 admin 子页面均受保护
- **Token 策略**: HMAC-SHA256 + 按天窗口，24 小时过期，检查前/当/后三个窗口
- **密码**: `PodcastHub2026!`，存储在 Vercel 环境变量 `ADMIN_PASSWORD` 中
- **完成**: `npm run build` 通过，前后端已部署

### 2026-04-12 飞书表单链接替换 + 变更申请审批系统

- **背景**: 旧飞书问卷链接（Base/view 形式）替换为共享表单链接；同时搭建"申请→审批→diff确认→同步上线"全链路
- **完成**: 飞书链接统一替换为 `https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15`
- **完成**: `studioSubmission.ts` 精简为单一导出 `STUDIO_SUBMISSION_FORM_URL`，清除旧 Base/view/wiki 链接
- **完成**: 提交页 `submit-studio/page.tsx` 文案更新：步骤改为"填写表单→进入审核→确认上线"，去掉旧文案和旧文档链接
- **完成**: 后端新增 `studio_change_requests` 表（studio_id/request_type/source/proposed_data/status/diff_snapshot/reviewed_at/applied_at）
- **完成**: 后端新增变更申请路由 `/api/change-requests`（create/list/detail/approve/reject/apply/diff）
- **完成**: 前端新增 `changeRequestsApi`（api.ts）
- **完成**: 前端新增 `/admin/change-requests` 页面 — 左侧列表（状态筛选）+ 右侧详情（拟写入数据 + diff 预览 + 审批/拒绝/应用操作）
- **完成**: admin/studios 后台顶部增加"变更审核"导航入口
- **工作流**: 飞书表单收集 → 人工在飞书查看 → 创建变更申请（`/api/change-requests/create`）→ 审批通过（`approve`）→ 预览 diff（`diff`）→ 确认同步上线（`apply`）
- **Supabase**: `studio_change_requests` 表已创建
- **完成**: `npm run build` 通过，前后端已部署

### 2026-04-12 交通枢纽名称统一调整

- **背景**: 交通枢纽卡片标题语义不清，"虹桥"不够明确，"南站""浦东"缺少城市前缀
- **完成**: `studioTransport.ts` SHANGHAI_HUBS shortName 调整："虹桥"→"虹桥枢纽（机场/火车站）"，"南站"→"上海南站"，"浦东"→"浦东机场"，"上海站"不变
- **完成**: 前端已部署

### 2026-04-12 反馈弹窗优化

- **背景**: 反馈弹窗偏小（max-w-sm），底部"录音室信息更正"文案不适合作为主提示
- **完成**: 弹窗放大为 max-w-md（448px），内边距 p-6 sm:p-7
- **完成**: 表单间距 space-y-4，textarea 4 行，提交按钮 py-3 text-sm
- **完成**: 底部拆为两层：通用反馈提示"无论是使用的体验还是功能的期待，欢迎提出你的建议"+ 次级"录音室信息更正"入口（text-[10px] text-gray-200）
- **完成**: 两层间用 border-t border-gray-100 分隔线隔开
- **完成**: 反馈流程不变（称呼 + 反馈详情 + 提交）

### 2026-04-12 后台录音室软删除功能

- **背景**: 后台只有编辑/保存能力，缺少删除入口；后端已有软删除接口 `DELETE /api/studios/delete/{id}`（设置 `is_active=false`）
- **完成**: 后台页面底部增加"移除录音室"按钮（红色描边，危险操作提示）
- **完成**: 点击后弹出确认弹窗，显示录音室名称和软删除说明，用户需二次确认
- **完成**: 调用 `studiosApi.delete(id)` 接口，成功后刷新列表并自动切换到下一条可见录音室
- **完成**: 删除失败时通过 toast 提示错误信息
- **说明**: 软删除，不物理清除数据；前台和后台列表均通过 `is_active==True` 过滤

### 2026-04-12 飞书问卷+结果表+同步链路

- **背景**: 旧问卷链接替换；飞书结果表明确为整理和同步工作台；后台增加批量同步能力
- **新问卷链接**: `https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15`（收集入口）
- **结果表链接**: `https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd`（整理工作台，table: tblZtDyWE2zJZUdE）
- **完成**: 全站问卷链接替换为新链接
- **完成**: 后端新增 `feishu_sync.py` 路由 — 3 个 API：拉取记录 / 比对 diff / 执行同步
- **完成**: 前端新增 `/admin/feishu-sync` 页面 — 拉取比对 → 查看 diff（新增/更新/删除） → 确认同步
- **完成**: 录音室管理后台顶部增加"飞书同步"导航入口
- **字段映射**: 录音室名称→name, 详细地址→address, 录音室描述→description, 开放时间与预约方式→open_hours, 收费方式和价格→price_note, 空间特性与设备→equipment, 联系人→contact_name, 联系方式→contact_info
- **同步逻辑**: 按名称比对，飞书有线上无→新增，两边都有但字段不同→更新，线上有飞书无→软删除
- **工作流**: 飞书问卷收集 → 飞书结果表整理 → 后台 diff 确认 → 同步线上

### 2026-04-12 基础 SEO 优化

- **背景**: 站点标题、描述、H1 和结构化数据偏产品内部命名，搜索引擎难以理解
- **完成**: 根 layout metadata 更新为 `title.template` 模式，包含 keywords / OG / Twitter / canonical / robots
- **完成**: 首页 sr-only H1「PodcastHub - 中国播客录音室展示与选择平台」
- **完成**: 录音室列表页 layout metadata + H1 改为「查找播客录音室」
- **完成**: 提交页 layout metadata + H1 改为「提交我的播客录音室」
- **完成**: 详情页 layout 带 generateMetadata，动态标题「名称 - 城市播客录音室详情」
- **完成**: 根 layout JSON-LD 结构化数据（WebSite + Organization）
- **完成**: 导航「录音间」→「录音室」，FAB/列表页按钮文案统一为「提交录音室信息」
- **关键词**: 播客录音室、录音棚、播客录制、录音室预约、城市录音室、播客录制空间

### 2026-04-13 Keyone Studio 地址修正

- **背景**: Keyone Studio & 播客公社（ID=22，北京）地址为「北京市朝阳区首创·郎园Station」，坐标为天安门附近（116.407, 39.904），偏差约 12km
- **修正**: 地址统一改为「北京市朝阳区郎园Station（将台东路）」，去掉「首创·」前缀，加「将台东路」消除同名歧义
- **修正**: 经纬度修正为郎园Station 实际坐标（116.523281, 39.97271），来源百度地图
- **方式**: 通过线上 API `PUT /api/studios/update/22` 直接修正，无需改代码或重新部署
- **飞书结果表**: 该录音室不在当前飞书结果表中，无需同步

### 2026-04-13 飞书表格新录音室同步（maono闪克 × 泽尔达）

- **来源**: 飞书 Wiki 电子表格「中国播客录音间地图（持续更新）」`OzEEwyasziC7VFk7YrxcnH8lnre` → sheet `XJaYsw0vrhiSsitiuFOc5Tp1neh`
- **操作**: 识别第 26 行新增录音室 `maono闪克 × 泽尔达 视频播客间`（上海宝山区），确认线上不存在同名记录
- **创建**: 通过 `POST /api/studios/create` 创建（ID=32），再 `PUT /api/studios/update/32` 补入经纬度
- **地理编码**: 高德 Web Service API 解析「上海市宝山区三门路561号复旦软件园」→ `121.488468, 31.311635`，区划：宝山区
- **字段映射**: name/city/district/address/longitude/latitude/charging_method/price_note/booking_note/contact_name/contact_info/equipment 全部从飞书表格映射
- **缺失字段**: open_hours（空）、description（空）、cover_image（空），待后续补充

### 2026-04-13 交通枢纽机制重构（按需启用 + 城市注册表）

- **背景**: 原先交通枢纽硬编码为 `SHANGHAI_HUBS` + `city === '上海'` 判断，无法扩展到其他城市
- **重构**: 将 `SHANGHAI_HUBS` 常量替换为 `cityTransportHubs` 城市注册表
- **新 API**: `getCityHubs(city)` 获取城市枢纽配置，`isCityTransitEnabled(city)` 判断是否启用
- **触发条件**: 只有注册在 `cityTransportHubs` 中的城市才会生成和展示交通枢纽
- **扩展方式**: 在 `cityTransportHubs` 中追加一条城市记录即可启用新城市
- **地图标记**: `page.tsx` 中 `selectedCity === '上海'` 硬编码改为 `getCityHubs(selectedCity)` 动态查询
- **不改动的组件**: `StudioTransitGrid`、`StudioDetailInfoTab`、`studios/[id]/page.tsx` 无需修改（已通过 `getStudioTransitItems` 间接使用注册表）
- **上海**: 作为参考模板保留在注册表中（4 个枢纽），其他城市后续按需追加
- **npm run build**: 通过

### 2026-04-13 交通枢纽全城市覆盖

- **背景**: 重构后仅上海和北京有枢纽配置，其余 7 个城市有录音棚但无枢纽
- **操作**: 在 `cityTransportHubs` 注册表中补齐全部 9 个城市的枢纽配置
- **配置明细**:
  - 上海（4）：虹桥枢纽、上海站、上海南站、浦东机场
  - 北京（2）：首都国际机场、北京南站
  - 杭州（4）：萧山国际机场、杭州东站、杭州站、杭州西站
  - 广州（4）：白云国际机场、广州南站、广州站、广州东站
  - 成都（4）：双流国际机场、成都东站、成都南站、成都站
  - 深圳（3）：宝安国际机场、深圳北站、深圳站
  - 福州（3）：长乐国际机场、福州站、福州南站
  - 天津（3）：滨海国际机场、天津站、天津西站
  - 景德镇（2）：罗家机场、景德镇北站
  - 武汉（4）：天河国际机场、武汉站、汉口站、武昌站
  - 南京（3）：禄口国际机场、南京南站、南京站
- **部署**: 前端已部署到线上
- **文档**: CLAUDE.md / README.md / PROJECT_MEMORY.md 已同步更新

### 2026-04-14 小程序骨架搭建（Phase 1）

- **技术栈**: Taro 4.2.0 + React 18 + TypeScript + Sass（从 3.6.35 升级，因 Node.js v24 不兼容 3.6.35）
- **目录**: `mini-program/` 独立于 Web 前端，复用同一后端 API（`api.daydayup.media`）
- **页面占位**: 7 个页面路由已建立（home / studios / studio-detail / submit-studio / feedback / admin-login / admin）
- **TabBar**: 首页 + 录音室两个 Tab
- **配置文件**: package.json / project.config.json / tsconfig.json / babel.config.js / config/index.ts / app.config.ts / app.tsx
- **文档体系**: `docs/mini-program/` 下 9 个子文档 + prompts/task-template.md 已创建
- **AppID**: `wx35e6dc5fa25601ab`
- **构建**: `npm run build:weapp` 编译成功，dist/ 已生成（webpack 5.91.0 锁定版本）
- **关键依赖**: babel-preset-taro@4.2.0, @babel/preset-react, @babel/preset-env, @babel/preset-typescript
- **状态**: Phase 1 骨架完成，可在微信开发者工具中打开 `mini-program/` 预览，待 Phase 2 实现核心浏览页面

### 2026-04-14 小程序首页发现页实现（Phase 2 首页）

- **首页定位**: 录音室发现入口页，不是 Web 地图复制品
- **首页结构**: 品牌头部（深色 #111827）→ 城市入口（胶囊按钮）→ 推荐录音室卡片（6 张）→ 提交录音室/反馈按钮 → 品牌底部
- **API 接入**:
  - `GET /api/studios/cities` → 城市列表（9 个城市）
  - `GET /api/studios/list?size=6` → 推荐录音室
- **API 服务层**: `services/request.ts`（基于 Taro.request 的通用请求函数）+ `services/studio.ts`（getCities / getStudios / getStudioDetail）
- **导航**: 城市按钮 → 录音室列表页（带 city 参数），录音室卡片 → 详情页（带 id 参数），"查看全部" → switchTab 列表页，"提交录音室" → 提交页，"意见反馈" → 反馈页
- **状态处理**: loading 骨架屏、error 错误提示 + 重试按钮、空数据提示
- **自定义导航栏**: `navigationStyle: 'custom'`，品牌头部占满顶部
- **额外实现**:
  - 提交录音室页：4 步流程引导 + 复制飞书表单链接按钮
  - 反馈页：占位版，显示"功能开发中"
  - 录音室详情页：占位版，接收 id 参数显示
- **构建**: `npm run build:weapp` 通过，新增 `postcss-import` 依赖
- **文档**: 02-ia.md / 03-user-flows.md / 00-project-overview-plan.md / README.md 已更新

### 2026-04-15 小程序录音室详情页实现（Phase 2 详情页）

- **详情页定位**: 决策与判断页，用户在此完成最终选择（是否预约/联系）
- **页面结构**: 顶部封面（320rpx）→ 名称+收费方式 → 地址 → 预约与联系 → 开放时间 → 设备 → 介绍 → 交通枢纽 → 底部 CTA（"拨打电话"/"复制微信"）
- **API 接入**: `GET /api/studios/detail/{id}` → 完整录音室信息
- **展示归一化**: 复用 Web 端 `studioPresentation.ts` 的逻辑（收费方式/预约方式/联系方式），在小程序端用 TS 重新实现
- **CTA 逻辑**: 有电话 → "拨打电话"（Taro.makePhoneCall）；无电话有微信 → "复制微信号"（Taro.setClipboardData）；两者都有 → 双按钮
- **封面占位**: 无封面图时用品牌首字母+渐变背景
- **状态处理**: loading 骨架屏、error 重试、空数据
- **构建**: `npm run build:weapp` 通过
- **文档**: docs/mini-program/ 已全部更新

### 2026-04-15 小程序首页地图移除 + 列表发现页

- **判断**: 360rpx 地图在 ScrollView 内有触摸冲突，信息密度与卡片风格冲突，空间分布价值有限
- **决定**: 移除地图，改为"列表优先的发现页"
- **新首页结构**: 品牌头部 → 城市入口 → 城市录音室卡片列表（最多 8 张） → 操作入口 → 底部
- **城市筛选联动**: 城市按钮切换后筛选下方卡片列表（前端 filter，不再单独加载地图数据）
- **数据加载**: 一次加载全部录音室（size=50），前端按城市筛选
- **卡片改进**: 价格从绿色标签改为琥珀色 pill badge（#fffbeb + #d97706），更醒目
- **构建**: `npm run build:weapp` 通过
- **文档**: docs/mini-program/02-ia.md 已更新（移除地图预览相关描述）

### 2026-04-15 小程序录音室列表页实现（Phase 2 列表页）

- **列表页定位**: 筛选、比较、浏览录音室的核心页面，与首页分工（首页发现，列表页比较）
- **页面结构**: 搜索栏 → 城市筛选 chips（横向可滚动）→ 结果摘要 → 录音室卡片列表
- **城市筛选**:
  - 横向 chip 组：全部 + 9 个城市（成都/深圳/广州/天津/杭州/上海/景德镇/福州/北京）
  - 选中态深色（#111827），未选中浅灰（#f3f4f6）
  - 支持反选（再点一次取消）
  - 从首页带 `?city=xxx` 参数进入时自动选中
- **搜索**: 圆角搜索框，实时按名称/地址过滤，带清除按钮
- **API 接入**:
  - `GET /api/studios/cities` → 城市 chip 列表
  - `GET /api/studios/list?city=xxx&search=xxx&size=200` → 录音室列表（size=200 一次拉完）
- **卡片字段**: 封面图（或首字占位）+ 名称 + 收费方式 + 容纳人数 + 地址
- **类型更新**: `StudioListItem` 新增 `price_per_hour / price_per_day / capacity / contact_info / is_active` 字段（与实际 API 对齐）
- **状态处理**: loading 骨架屏（5 张）、error 重试、空结果（区分城市无数据 / 搜索无结果）、搜索无结果提供"清除搜索"
- **构建**: `npm run build:weapp` 通过
- **文档**: 02-ia.md / 03-user-flows.md / 00-project-overview-plan.md / README.md 已更新

### 2026-04-16 小程序双 Tab 重构：录音室 + 创作者

- **背景**: 原"首页 + 录音室"双 Tab 定位模糊，首页发现页（城市入口 + 推荐卡片）与录音室列表页功能重复
- **设计方案**: 删除首页（home），录音室 Tab 升为唯一主入口，新增创作者 Tab（分段控件切换剪辑师/制作人）
- **完成**: 删除 `pages/home/`（3 文件：index.tsx / index.scss / index.config.ts）
- **完成**: `app.config.ts` 更新 — pages 数组去掉 home，加入 creators/creator-detail，studios 排第一；tabBar 改为录音室 + 创作者
- **完成**: `types/index.ts` 新增 4 个接口 — EditorListItem / Editor / BusinessListItem / Business（对齐后端 Pydantic schemas）
- **完成**: `services/creator.ts` 新建 — getEditors / getEditorDetail / getBusinessList / getBusinessDetail
- **完成**: `pages/creators/` 新建（3 文件）— 分段控件 + 搜索 + 卡片列表 + 空状态"正在入驻中"
- **完成**: `pages/creator-detail/` 新建（3 文件）— 统一详情页 `?id=&kind=editor|business`，共享头部 + 条件渲染
- **完成**: `pages/studios/index.tsx` 增强 — 底部增加"提交录音室"（主按钮）+ "意见反馈"（次按钮）
- **完成**: `pages/studios/index.scss` 增强 — 追加 .studios-actions / .action-btn 等样式
- **构建**: `npm run build:weapp` 通过（3.98s，0 错误）
- **文档**: docs/mini-program/ 下 10 个文档全部更新 + CLAUDE.md + PROJECT_MEMORY.md 同步

### 2026-04-15 小程序文档体系全面同步（已由 2026-04-16 双 Tab 重构文档更新覆盖）

- **背景**: 首页曾做"轻量地图预览"（360rpx Map 组件 + marker/callout），后因视觉效果不满意改为列表型发现页；文档中仍保留大量旧地图描述
- **范围**: docs/mini-program/ 下 9 个文档 + prompts/task-template.md
- **改动要点**:
  - 全部"首页发现页 + 轻量地图预览"→ 改为"首页发现页 + 城市筛选联动卡片列表"
  - 删除所有 marker / callout / 地图联动 / 360rpx / 空间感辅助 / Map 组件描述
  - 详情页描述从简单 bullet 升级为完整 10 区块结构文档（含条件渲染、交互、数据来源）
  - 02-ia.md 修正列表页参数传递描述（TabBar 页面不支持 URL 参数，switchTab 不传 city）
  - 03-user-flows.md 全部 4 条用户流程重写
  - 08-design-system.md 删除"首页地图预览视觉原则"章节，替换为"首页视觉原则"（列表型）
  - 09-release-qa.md 删除"首页地图预览专项验收"9 条检查项，替换为列表型验收标准
  - 04-data-model.md 字段表格中 longitude/latitude 首页列从"地图 marker"改为"-"（不再使用）
- **未改动**: 05-api-contract.md / 06-auth-and-role.md / 07-sync-and-admin.md（内容准确，无地图相关描述）
- **额外发现**: 列表页代码有 `router.params.city` 解析逻辑，但首页实际用 `switchTab` 跳转（不支持参数），属于冗余代码但不影响功能

### 2026-04-21 新增录音室数据（Cashmere Studios + Flo Lab 3 城）

- **Cashmere Studios 羊绒工作室**（ID=33，上海静安区）— 专业录音棚，5 个录音间，SSL Origin 32 / API 2448 / Dolby Atmos
  - 通过 API 创建 + 坐标补充
  - 飞书表格追加为 #27
- **毅风酒店 - Flo Lab 声音实验室** × 3（ID=34/35/36，杭州/武汉/南京）
  - 同品牌、同联系方式（Lucie, 15318863884），免费开放，6:00-24:00
  - 预约方式：微信小程序搜索"播客录音不知可否"
  - 通过 API 批量创建 + 坐标补充
  - 飞书表格追加为 #28/#29/#30
- **新增城市**: 武汉、南京
- **交通枢纽**: 武汉（4：天河机场/武汉站/汉口站/武昌站）、南京（3：禄口机场/南京南站/南京站）已添加到 `cityTransportHubs`

### 2026-05-02 Web 端"提交录音室"入口收敛

- **背景**: 首页同时存在导航栏"添加我的录音室"黑按钮和地图 FAB "+"按钮，两个同等强度的 CTA 指向同一 `/submit-studio`，造成视觉和语义重复
- **方案选择**: 方案 1 — 保留导航栏黑按钮作为全站主入口，弱化首页 FAB 为场景化辅助入口
- **理由**: 导航栏按钮在所有页面可见（跨页一致性），FAB 只在首页出现，弱化 FAB 不影响全局
- **改动**:
  - `StudioRecruitmentFab.tsx` — FAB 按钮从 `bg-black h-10 w-10` 改为 `bg-white/90 border border-slate-200 h-8 w-8`；展开态 CTA 从 `bg-black` 改为 `border border-slate-200 bg-white` 描边按钮；文案从"提交我的录音室"改为"收录录音室"
  - `studios/page.tsx` — 列表页头"提交录音室信息"从 `bg-black` 改为 `border border-slate-200` 描边按钮，视觉弱于导航栏主入口
  - `Navbar.tsx` — 不修改，导航栏"添加我的录音室"（桌面端）/ "添加录音室"（移动端）作为全站主入口
- **入口策略（新）**:
  - 全站主入口：导航栏"添加我的录音室"黑按钮（桌面+移动端）
  - 首页弱入口：地图 FAB（灰色"+"→展开"收录录音室"描边按钮）
  - 列表页辅助入口：页头"提交录音室信息"描边按钮
- **文档同步**: CLAUDE.md / README.md / PROJECT_MEMORY.md / docs/web/ 下 7 个文档已更新
- **验证**: `npm run build` 通过

### 2026-05-16 新增录音室数据（页听录 + 深夜谈谈 3 城）

- **页听录播客间**（ID=37，上海黄浦区）— 八号桥产业园区，全套罗德设备+调音台，适合2-30人，按时段收费（上午666元/3h，下午888元/4h），首次体验赠送2h
  - 联系人：郑先生 / 微信 hay2xu
  - 通过 API 创建 + 坐标补充（121.471094, 31.210775）
- **北京深夜谈谈录音室**（ID=38，北京朝阳区）— 苹果社区北区，RODE podmic+监听耳机，适合3-4人，咨询后报价
  - 预约：大内夜市有赞小程序，或添加"夜市谈谈子"微信
  - 通过 API 创建 + 坐标补充（116.469608, 39.899796）
- **上海Studio Merci**（ID=39，上海徐汇区）— 岳阳路200弄，与北京深夜谈谈同品牌同设备
  - 通过 API 创建 + 坐标补充（121.451600, 31.204452）
- **秦皇岛阿那亚空岛录音室**（ID=40，秦皇岛北戴河区）— 阿那亚社区，与深夜谈谈同品牌同设备
  - 通过 API 创建 + 坐标补充（119.486062, 39.831989）
  - 秦皇岛为新增城市
- **交通枢纽**: 秦皇岛（2：北戴河机场/秦皇岛站）已添加到 `cityTransportHubs`
- **修正**: 页听录 price_note 中"免费"→"赠送"，避免 charging_method 误推导为"免费"

### 2026-05-13 Web 端性能与体验优化（Batch 1-4）

- **分支**: `perf/optimize-ux-loading`
- **Batch 1: `<img>` → `next/image` + 搜索防抖**
  - 全站 13 处 `<img>` 替换为 `next/image`（StudioCard/EditorCard/BusinessCard/StudioDetailInfoTab/studios/[id]/editors/[id]/admin/studios），启用自动懒加载、响应式尺寸、WebP 格式优化、blur 占位
  - `next.config.js` 新增 `images.remotePatterns`（`*.supabase.co` + `localhost:8000`）
  - 新建 `lib/useDebounce.ts` 通用防抖 hook（300ms）
  - 录音间/剪辑师/商务三个列表页搜索接入 debounce，消除每次按键触发 API 请求
- **Batch 2: 代码分割 + 路由级边界**
  - 首页 `StudioRecruitmentFab`/`StudioDetailInfoTab`/`StudioDetailImageTab`/`FeedbackModal` 改为 `next/dynamic` 懒加载（`ssr: false`），减少首页 bundle 约 4KB
  - 新增 `app/loading.tsx`（全局路由 loading 骨架）
  - 新增 `app/error.tsx`（全局路由错误边界 + 重试按钮）
  - 新增 `app/not-found.tsx`（品牌化 404 页面）
  - 新增 `app/studios/loading.tsx`、`app/editors/loading.tsx`、`app/business/loading.tsx`
- **Batch 3: SWR 缓存层**
  - 安装 `swr` 依赖
  - 新建 `lib/fetcher.ts` — 通用 fetcher + SWR key 工厂 + useCities/useStudiosList/useStudioDetail/useEditorsList/useBusinessList hooks
  - 录音间列表页、剪辑师列表页改用 SWR hooks（自动去重、缓存、revalidate）
  - 首页城市加载改用 `useCities()`（与列表页共享缓存，消除重复请求）
  - 首页去掉手动 `studiosApi.cities()` useEffect，改用 SWR + `citiesInitializedRef` 首次设置默认城市
- **Batch 4: 后端性能优化**
  - SQLAlchemy engine 新增 Postgres 连接池配置：`pool_size=5, max_overflow=10, pool_pre_ping=True, pool_recycle=300`
  - `/api/studios/cities` 新增 5 分钟内存缓存（`_cities_cache` dict），避免每次请求都执行 GROUP BY + COUNT 查询
- **构建验证**: `npm run build` 通过（14 页面 0 错误）

### 2026-05-02 Web 端新增录音室信息反馈入口（绑定上下文）

- **背景**: 用户在具体录音室详情页发现信息错误时，缺少一个绑定当前录音室的反馈入口；全站反馈只是通用产品建议，无法区分"哪间录音室的什么信息有误"
- **改动**:
  - `backend/routers/feedback.py` — `FeedbackRequest` 新增 4 个可选字段：`source`（web_detail/web_modal）、`studio_id`、`studio_name`、`feedback_type`；飞书消息卡片根据有无录音室上下文显示不同标题（橙色 vs 蓝色）和内容
  - `frontend/app/components/FeedbackModal.tsx` — 新增 `studioContext` 可选 prop（studio_id/studio_name/source）；有上下文时切换标题为"反馈录音室信息"、显示"正在反馈：xxx录音室"提示条、placeholder 改为"地址、价格、预约方式或营业状态是否有变化？"
  - `frontend/app/studios/[id]/page.tsx` — 底部评价区下方新增"信息有误？告诉我们"弱入口（text-xs text-slate-300），点击打开带 studioContext 的 FeedbackModal
  - `frontend/app/components/StudioDetailInfoTab.tsx` — 新增 `onStudioFeedback` 可选回调 prop；底部操作区下方新增"信息有误？告诉我们"弱入口
  - `frontend/app/page.tsx` — 新增 `studioFeedbackOpen` 状态和 FeedbackModal 实例，传入 `onStudioFeedback` 回调给 InfoTab
- **入口策略（新）**:
  - 全站产品反馈：导航栏反馈按钮 → FeedbackModal（无 studioContext）
  - 录音室信息反馈：详情页/首页弹窗底部"信息有误？告诉我们" → FeedbackModal（有 studioContext，飞书卡片橙色标题）
- **后端兼容**: 新字段全部可选，旧反馈请求不受影响
- **验证**: `npm run build` 通过

## 当前状态总结

- `studios=33`（上海 11 / 北京 9 / 杭州 3 / 广州 1 / 成都 1 / 深圳 1 / 福州 1 / 天津 1 / 景德镇 1 / 武汉 1 / 南京 1 / 秦皇岛 1）
- `editors=0`
- `business_contacts=0`
- 首页和详情页已能展示 `charging_method`
- 后台地址：
  [https://podcasthub.daydayup.media/admin/studios](https://podcasthub.daydayup.media/admin/studios)
- 飞书问卷（收集入口）：
  [https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15](https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15)
- 飞书结果表（整理和同步工作台）：
  [https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd](https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd)
- 站内录音室提交入口：
  [https://podcasthub.daydayup.media/submit-studio](https://podcasthub.daydayup.media/submit-studio)

## 已知问题

1. **Supabase migration history 未对齐**
   线上 schema 已真实变更，但 CLI migration ledger 仍需单独清理。
2. **后台已加认证**
   `admin/studios` 已通过 HMAC token 密码保护，密码存 Vercel 环境变量 `ADMIN_PASSWORD`。
3. **高德 Web API 地理编码不可用**
   Key 类型问题仍未彻底解决，坐标目前主要靠现有数据维护。
4. **录音室问卷新提交自动通知未接通**
   目前已经能收集并人工审核，但还没有独立 webhook / workflow 提醒。
5. **打车时间是估算值**
   当前没有接高德路径规划 API。

## 待办事项

- [x] **高优**: 给 `admin/studios` 增加登录保护
- [x] **高优**: 实现录音间自助提交 + 审核流 → 已通过飞书表单 + 变更申请系统实现
- [x] **高优**: 为飞书问卷新提交补自动通知（Webhook / Workflow）→ 已通过变更申请系统替代纯 webhook 方案
- [ ] **中优**: 解决 Supabase migration ledger 对齐问题
- [ ] **中优**: 将打车时间从启发式估算升级为真实路径规划
- [ ] **中优**: 为录音间补充封面图片
- [ ] **中优**: 添加更多城市数据（北京、深圳等）
- [ ] **中优**: 补充剪辑师和商务数据
- [ ] **低优**: 用户认证系统

## 备注

- Excel 原始数据路径: `/Users/lihuiyang/Desktop/录音间原始数据表.xlsx`
- 高德 API Key: JS `f8f8...9093` / Web Service `c378...c503`
- 前端环境变量在 `frontend/.env.local`
- 后端反馈主路由为 `POST /api/feedback`，兼容旧路径 `POST /api/feedback/submit`
- 反馈接收方式: 飞书群机器人 Webhook → 群「PodcastHub 反馈通知」
- 反馈表单已简化为 2 个字段: 称呼 + 反馈详情
- 本地启动后端: `uvicorn main:app --reload --port 8000`（从 `backend` 目录）

## 错误日志

### ERR-001 Supabase SQL mirror 版本号与 CLI migration ledger 冲突

- 现象: `supabase db push` 因 `schema_migrations_pkey` 冲突失败。
- 原因: 第二条 SQL mirror 文件的版本前缀与第一条 migration 被 CLI 解析成同一版本。
- 当前处理: 线上字段直接执行 SQL 落库，功能先恢复。
- 后续建议: 单独整理 migration ledger，不要在生产库盲目 repair。

### ERR-002 类型定义扩展后，旧 snapshot 数据未同步

- 现象: 新增 `charging_method` 后，前端 `next build` 因 `studioSnapshot` 缺字段失败。
- 原因: 运行时已不依赖 snapshot，但类型检查仍会扫描该文件。
- 当前处理: 为 snapshot 和 list mirror 补齐字段。
- 结论: 以后扩展 `Studio` 类型时，任何兜底数据也要同步更新。

### ERR-003 首页 hover 卡热区被底层 marker 抢走

- 现象: 看起来点按钮，实际触发的是底层 marker。
- 原因: hover 卡和按钮没有在 pointer/mouse/touch 阶段拦截事件。
- 当前处理: 在卡片和按钮层显式拦截事件并提高交互层级。

### ERR-004 Supabase 缺列导致 API 500（CORS 只是表象）

- 现象: 前端报 CORS 错误，实际后端 `/api/studios/list` 返回 500。
- 原因: SQLAlchemy 模型新增了 `capacity`、`need_own_equipment_for_video`、`contact_info` 字段，但 Supabase 线上数据库没有执行对应的 ALTER TABLE。查询时 SQL 报 `UndefinedColumn` → 500 → 浏览器看到的是"没有 CORS 头"。
- 解决: 手动连接 Supabase 执行 `ALTER TABLE studios ADD COLUMN IF NOT EXISTS ...`。
- **⚠️ 重要教训**: 修改 `models/database.py` 中的字段后，必须同步做以下三件事：
  1. **写 SQL mirror 文件**（`backend/supabase/migrations/` 下新建迁移脚本）
  2. **手动在 Supabase 执行 ALTER TABLE**（migration ledger 未对齐，不能靠 `supabase db push`）
  3. **部署后端前先确认线上数据库已有对应列**（可 `curl` 线上 API 验证）
- 预防: 后续涉及任何字段增删改，流程固定为：改模型 → 写迁移 SQL → 在 Supabase 执行 → 再部署后端。

### ERR-005 高德 InfoWindow 内按钮点击无响应

- 现象: 地图 hover 卡上的「点击查看详情」按钮点击后没有任何反应。
- 原因: 高德 `InfoWindow.setContent(DOM节点)` 内部会将 DOM 序列化为 innerHTML，导致事件监听器丢失；同时 `map.on('click')` 会关闭 InfoWindow，mousedown 冒泡到地图后卡片被移除，onclick 没机会触发。
- 解决: 改用纯 HTML 字符串 + `onclick="window.__podcasthubOpenStudio(id)"` 全局函数桥接 + 最外层 div 加 `onmousedown="event.stopPropagation()"` 阻止冒泡到地图。
- 教训: 高德地图 InfoWindow 内的交互不能依赖 DOM 事件绑定，必须用内联 `onclick` + `window` 全局函数 + `stopPropagation`。

### ERR-006 首页 marker 首次加载不显示（ref vs state 时序）

- 现象: 首页首次加载时地图渲染了但录音室 marker 不出现，需要手动切换城市才触发。
- 原因: `initMap()` 完成后只更新 `mapRef.current`（React ref），ref 变更不触发重渲染。marker 渲染 effect 在数据到达时执行一次，但此时 map 尚未就绪，effect 提前返回；map 就绪后没有任何状态变化让 effect 重新跑。
- 解决: 新增 `isMapReady`（`useState`），在 `initMap()` 中设 `true`、`destroyMap()` 中设 `false`，加入 marker effect 依赖数组。
- 预防: 凡是 useEffect 依赖"某个异步初始化是否完成"作为守卫条件时，必须用 state 而不是 ref 来传递就绪信号，否则 effect 无法在就绪后自动重执行。

### ERR-007 Vercel 环境变量通过管道添加时带入隐藏字符

- 现象: `echo URL | vercel env add` 后，httpx 报 `Invalid non-printable ASCII character in URL`。
- 原因: `echo` 默认在末尾加换行符 `\n`，Vercel 原样存入环境变量。
- 解决: 用 `printf '%s' 'URL' | vercel env add` 代替 `echo`。
- 预防: 以后通过管道给 `vercel env add` 传值时，一律用 `printf '%s'` 而不是 `echo`。

### ERR-008 Taro 3.6.35 + Node.js v24 不兼容

- 现象: `npm run build:weapp` 报 `MODULE_NOT_FOUND` 找不到 webpack5-prebundle 相关模块链。
- 原因: Taro 3.6.35 不支持 Node.js v24（其 webpack5-prebundle 依赖在 v24 下解析失败）。
- 解决: 全部 Taro 包升级到 4.2.0（最新稳定版）。
- 预防: Taro 项目需注意 Node.js 版本兼容性；Taro 4.x 支持 Node.js v24。

### ERR-009 webpack 5.106.x 与 Taro 4.2.0 ProgressPlugin API 不兼容

- 现象: `ValidationError: Invalid options object. Progress Plugin has been initialized using an options object that does not match the API schema`，涉及 name/color/reporters 等属性。
- 原因: `package.json` 中 webpack 写了 `"^5.91.0"`，npm 解析到 5.106.1，新版本的 ProgressPlugin API 不再支持 name/color/reporters 等旧参数，而 Taro 4.2.0 内部仍在使用这些参数。
- 解决: 将 webpack 版本锁定为精确 `"5.91.0"`（Taro webpack5-runner 的 peerDependencies 要求）。
- 预防: Taro 项目的 webpack 版本必须精确锁定，不能用 `^` 前缀。

### ERR-010 babel-preset-taro 及其依赖缺失

- 现象: 构建报 `Cannot find package 'babel-preset-taro'`，安装后又报 `Cannot find module '@babel/preset-react'`。
- 原因: babel-preset-taro 及其依赖（@babel/preset-react, @babel/preset-env, @babel/preset-typescript）没有显式声明在 package.json 中，`--legacy-peer-deps` 安装时不会自动拉取。
- 解决: 显式添加 `babel-preset-taro@4.2.0` + `@babel/preset-react` + `@babel/preset-env` + `@babel/preset-typescript` 到 package.json。
- 预防: Taro 项目初始化时，确保 babel-preset-taro 和核心 babel presets 都在 devDependencies 中。

## 关键流程备忘

### 排错第一原则

**遇到报错时，先检索错误日志（ERR-001 ~ ERR-010）和关键流程备忘**，灰羊的项目场景相似，重复踩坑概率高。特别是：
- 涉及 CORS / 500 → 先查 ERR-004（大概率是缺列）
- 涉及高德地图交互 → 先查 ERR-005（InfoWindow 事件问题）
- 涉及类型/构建失败 → 先查 ERR-002（schema 未同步）
- 涉及 marker / effect 不触发 → 先查 ERR-006（ref vs state 时序）
- 涉及字段变更 → 先看「字段增删改标准流程」
- 涉及 Taro 构建 → 先查 ERR-008/009/010（Node.js 版本 / webpack 锁版本 / babel 依赖）

### 字段增删改标准流程（必须遵循）

当需要修改 `studios`/`editors`/`business_contacts` 表结构时：

```
1. 改 SQLAlchemy 模型  →  backend/models/database.py
2. 改 Pydantic schema  →  backend/models/schemas.py
3. 写 SQL mirror       →  backend/supabase/migrations/YYYYMMDD_NNNN_xxx.sql
4. 手动执行 SQL        →  连 Supabase 执行 ALTER TABLE（不能用 db push）
5. 部署后端            →  cd backend && vercel --prod --yes
6. 验证线上            →  curl https://api.daydayup.media/api/xxx/list?size=1
```

连接 Supabase 的快捷方式：
```bash
# 从 Vercel 拉生产环境变量
cd backend && vercel env pull .env.production --environment=production -y
# 用 python3 + psycopg 执行 SQL
python3 -c "
import psycopg
url = '<从 .env.production 取 DATABASE_URL，去掉 +psycopg 后缀>'
with psycopg.connect(url) as conn:
    with conn.cursor() as cur:
        cur.execute('ALTER TABLE ...')
        conn.commit()
"
# 清理
rm .env.production
```
