# Claude Code 任务提示词模板

> 每次小程序任务都应遵循以下格式，确保上下文可追溯。

---

## 模板

```text
请基于 docs/mini-program/[相关文档].md 完成这次小程序任务。

当前总纲文档：
- docs/mini-program/README.md
- docs/mini-program/00-project-overview-plan.md

目标：
1. ...
2. ...

涉及文件：
- mini-program/src/...

必须完成：
1. ...
2. ...

工作完成后必须补充：
1. 将本次实际改动同步写回对应的 docs/mini-program 文档
2. 在文档里明确标注"已实现 / 已调整 / 已废弃 / 待开始"的内容
3. 如果本次改动影响了总体约定、页面结构、API、权限或流程，顺手更新 docs/mini-program/README.md 或相关总纲文档
4. 输出时单独列出"文档更新了什么"，不要只写代码改动

验收标准：
1. ...
2. ...

文档要求：
1. 更新 docs/mini-program/[对应文档].md
2. 是否需要同步 CLAUDE.md / PROJECT_MEMORY.md

输出要求：
1. 修改了哪些文件
2. 关键实现点
3. 是否需要 npm install / build
```

---

## 已有任务索引

| 任务 | 对应提示词 | 状态 |
|---|---|---|
| Phase 1: 骨架搭建 | 本次已完成 | 已完成 |
| Phase 2: 核心浏览（录音室列表+详情） | 已完成 | 已完成 |
| Phase 2.5: 创作者浏览（列表页+详情页） | 已完成 | 已完成 |
| Phase 3: 提交与反馈 | 待创建 | -- |
| Phase 4: 管理与同步 | 待创建 | -- |

---

## Phase 2 任务示例提示词

```text
请基于 docs/mini-program/02-ia.md 和 docs/mini-program/05-api-contract.md，
完成 PodcastHub 小程序 Phase 2：核心浏览页面实现。

目标：
1. 录音室列表页（TabBar 主入口）：搜索栏 + 城市筛选 + 卡片列表 + 提交/反馈按钮
2. 录音室详情：完整信息展示（名称、地址、价格、预约、联系方式、交通）

涉及文件：
- mini-program/src/pages/studios/index.tsx
- mini-program/src/pages/studio-detail/index.tsx
- mini-program/src/services/studio.ts
- mini-program/src/components/

必须完成：
1. 对接后端 API（GET /api/studios/list, /api/studios/detail/{id}, /api/studios/cities）
2. 列表页支持城市筛选和搜索
3. 详情页展示完整字段
4. 加载态和空态处理
5. 底部提交/反馈按钮

验收标准：
1. 列表页切换城市后数据更新
2. 详情页展示完整信息
3. npm run build:weapp 通过

文档要求：
1. 更新 docs/mini-program/02-ia.md 标注已实现区块
2. 同步 CLAUDE.md / PROJECT_MEMORY.md

输出要求：
- 修改文件清单
- 关键实现点
- build 结果
```

---

## Phase 2.5 任务示例提示词

```text
请基于 docs/mini-program/02-ia.md 和 docs/mini-program/05-api-contract.md，
完成 PodcastHub 小程序 Phase 2.5：创作者浏览页面实现。

目标：
1. 创作者列表页（TabBar 第二入口）：分段控件（剪辑师/制作人）+ 搜索 + 卡片列表
2. 创作者详情页：统一详情页，kind 参数条件渲染

涉及文件：
- mini-program/src/pages/creators/index.tsx（新建）
- mini-program/src/pages/creator-detail/index.tsx（新建）
- mini-program/src/services/creator.ts（新建）
- mini-program/src/types/index.ts（新增 Editor/Business 类型）

必须完成：
1. 对接后端 API（GET /api/editors/list, /api/editors/detail/{id}, /api/business/list, /api/business/detail/{id}）
2. 分段控件切换剪辑师/制作人列表
3. 搜索实时过滤
4. 详情页根据 kind 参数条件渲染
5. 空状态处理（"正在入驻中"）
6. 加载态和错误态处理

验收标准：
1. 分段切换后列表刷新
2. 详情页根据 kind 正确渲染
3. 空状态友好提示
4. npm run build:weapp 通过

文档要求：
1. 更新 docs/mini-program/02-ia.md 新增创作者页区块
2. 更新 docs/mini-program/04-data-model.md 新增 Editor/Business 模型
3. 更新 docs/mini-program/05-api-contract.md 新增剪辑师/商务 API
4. 同步 CLAUDE.md / PROJECT_MEMORY.md

输出要求：
- 修改文件清单
- 关键实现点
- build 结果
```
