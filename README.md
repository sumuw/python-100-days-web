# Python-100-Days 学习导航台

把 [jackfrued/Python-100-Days](https://github.com/jackfrued/Python-100-Days) 全部课程按 **Day 1–100** 结构化，提供按天导航、文档/代码阅读、学习进度标记与可视化统计的本地 Vue 应用。

## 本地启动

```bash
# 1. 安装依赖（Node ≥ 18.18）
npm install

# 2. 生成课程内容（首次必须；源仓库默认取 ../Python-100-Days）
npm run sync
npm run sync -- --offline        # 已有本地克隆时离线生成
npm run sync -- --assets=remote  # 图片不落地，改用 GitHub raw 链接

# 3. 启动
npm run dev        # http://localhost:5173
npm run build      # 产物 → dist/
npm run preview
```

> 内容产物写入 `public/content/`，生成后完全离线可用。

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
  layouts/  views/  components/  composables-free，直接组件化
  utils/            markdown-it + highlight.js 封装、日期工具
```

## 源仓库要点（管线已处理）

- 文件名三种形态：单天 `01.x.md`、跨天 `32-33.x.md`、一天多篇 `62.x-1/2.md`
- 图片引用两种写法：Markdown `![](...)` 与 HTML `<img src="...">`，共 340 张
- `code/` 目录 3 个共 67 个文件，按显式规则 / 文档提及 / 阶段级三级归属
- Day58/59/60/100 为占位存根，UI 上标注"内容待补充"
- Day45 有 2 张图片在源仓库中本身缺失

## 环境变量

复制 `.env.example` 为 `.env` 可调整源仓库地址与输出目录；`CONTENT_*` 只被 `npm run sync` 读取，不进前端包。
