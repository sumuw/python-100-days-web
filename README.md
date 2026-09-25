# Python-100-Days 学习导航台

把 [jackfrued/Python-100-Days](https://github.com/jackfrued/Python-100-Days) 全部课程按 **Day 1–100** 结构化，提供按天导航、文档/代码阅读、学习进度标记与可视化统计的本地 Vue 应用。

## 本地启动

前置条件：Node.js ≥ 18.18、npm 和 Git。首次同步会自动克隆课程源仓库；网络受限时请先自行克隆，再使用离线模式。

```bash
# 1. 安装依赖（优先使用锁定版本）
npm ci

# 2. 生成课程内容（首次必须；源仓库默认取 ../Python-100-Days）
npm run sync
npm run sync -- --offline        # 已有本地克隆时离线生成
npm run sync -- --assets=remote  # 图片不落地，改用 GitHub raw 链接

# 3. 启动
npm run dev        # http://localhost:5173
npm run build      # 产物 → dist/
npm run preview
```

> 默认的 `copy` 模式会将内容与图片写入 `public/content/`，其中也会纳入 `scripts/offline-assets/` 的上游外链图片兜底资源；生成后可完全离线阅读。`remote` 模式依赖网络加载图片。

### 更新课程内容

同步脚本不会自动更新已存在的源仓库。更新课程后，请在源目录执行 `git pull`（或切换到所需分支/标签），再运行：

```bash
npm run sync -- --offline
```

首次自动克隆时会读取 `CONTENT_REF`；已有源目录以其当前检出版本为准。非 GitHub 源仓库使用远程图片模式时，还需设置 `CONTENT_ASSETS_BASE`。

## 功能

| 模块 | 说明 |
|---|---|
| 按天导航 | 9 大阶段分组 + 100 格 Day 网格，支持未完成/已完成/收藏筛选 |
| 文档阅读 | Markdown 渲染、代码高亮、图片本地化、右侧 TOC 锚点、一天多篇切换 |
| 代码区 | 文档内抽取的代码块（语言过滤/一键复制）+ 仓库配套 `code/` 文件浏览 |
| 进度标记 | 单天完成、区间批量标记、收藏、笔记，全部存 localStorage |
| 可视化 | 总进度环、9 阶段进度条、打卡日历热力图、近 30 天趋势、预计完成日 |
| 数据安全 | 进度导出/导入 JSON，可清空重来 |
| 快捷键 | `←` / `→` 切换天 |

## 目录结构

```
scripts/            内容管线（Node，无第三方依赖）
  sync-content.mjs  主入口：解析 → 图片重写 → 代码块抽取 → 生成 manifest
  lib/              阶段表 / 文件名解析 / 代码块抽取 / 资产收集 / code 归属
public/content/     构建期产物（manifest + days + blocks + code + extras + res）
src/
  api/              内容读取（带内存缓存）
  stores/           curriculum（索引）/ progress（进度，持久化）
  layouts/  views/  components/  直接组件化
  utils/            markdown-it + highlight.js 封装、日期工具
```

## 源仓库要点（管线已处理）

- 文件名三种形态：单天 `01.x.md`、跨天 `32-33.x.md`、一天多篇 `62.x-1/2.md`
- 图片引用两种写法：Markdown `![](...)` 与 HTML `<img src="...">`，共 340 张
- `code/` 目录 3 个共 67 个文件，按显式规则 / 文档提及 / 阶段级三级归属
- Day58/59/60/100 为占位存根，UI 上标注"内容待补充"
- Day45 有 2 张图片在源仓库中本身缺失

## 环境变量

复制 `.env.example` 为 `.env` 可调整源仓库地址、版本、输出目录与图片策略；`CONTENT_*` 只被 `npm run sync` 读取，不进前端包。`VITE_BASE` 用于部署到子路径，例如 `/python-100-days-web/`。

## 部署

```bash
# .env.production 示例：部署在 https://example.com/python-100-days-web/
VITE_BASE=/python-100-days-web/
npm run build
```

将 `dist/` 部署为静态站点即可。由于使用 HTML5 History 路由，服务器需要将未知前端路由回退到 `index.html`；同时应将 `VITE_BASE` 配置为实际站点子路径。根路径部署保持默认 `VITE_BASE=/`。

## 数据与内容说明

- 学习进度、收藏和笔记只保存在当前浏览器的 localStorage 中；清除站点数据、使用隐私模式或更换设备后不会保留。请定期通过“设置 → 导出进度 JSON”备份。
- `public/content/` 是同步生成的课程内容与资源，目前约 113 MiB。维护者应明确选择提交该产物以便开箱即用，或在发布包 / 静态资源托管中提供它，避免使用者首次启动时缺少内容。
- `scripts/offline-assets/` 保存课程中原本引用第三方或 `localhost` 的 12 张图片，以及 2 张上游已缺失原图的明确标注占位图。不要删除该目录；重新同步时会将它们复制到 `public/content/res/offline/`。
- 本项目是对 [jackfrued/Python-100-Days](https://github.com/jackfrued/Python-100-Days) 的学习导航与展示工具。发布或再分发同步内容前，请核实并遵守上游仓库及所含图片、代码资源的许可与署名要求。
