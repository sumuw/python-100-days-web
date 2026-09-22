import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { STAGES, TOTAL_DAYS, stageOfDay, pad2 } from './lib/stages.mjs'
import { parseDayFile, groupByDay, outSlug } from './lib/parse-day.mjs'
import { extractBlocks } from './lib/extract-blocks.mjs'
import { rewriteAssets } from './lib/collect-assets.mjs'
import { resolveCodeOwner, langOfExt } from './lib/register-code.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const argv = process.argv.slice(2)
const argOf = (k, d) => {
  const hit = argv.find((a) => a.startsWith(`--${k}=`))
  return hit ? hit.slice(k.length + 3) : d
}
const hasFlag = (k) => argv.includes(`--${k}`)

const REPO_URL = process.env.CONTENT_REPO || 'https://github.com/jackfrued/Python-100-Days.git'
const REPO_DIR = path.resolve(ROOT, argOf('repo', process.env.CONTENT_DIR || '../Python-100-Days'))
const OUT_DIR = path.resolve(ROOT, argOf('out', process.env.CONTENT_OUT || 'public/content'))
const ASSETS_MODE = argOf('assets', process.env.CONTENT_ASSETS || 'copy')
const OFFLINE = hasFlag('offline')

const mkdirp = (d) => fs.mkdirSync(d, { recursive: true })
const rmrf = (d) => fs.rmSync(d, { recursive: true, force: true })
const countWords = (s) =>
  (s.match(/[一-龥]/g) || []).length +
  (s.replace(/[一-龥]/g, ' ').match(/[A-Za-z0-9_]+/g) || []).length

function walk(dir, base = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...walk(path.join(dir, e.name), rel))
    else out.push(rel)
  }
  return out
}

function ensureRepo() {
  if (fs.existsSync(path.join(REPO_DIR, 'README.md'))) return
  if (OFFLINE) throw new Error(`源仓库不存在且已指定 --offline：${REPO_DIR}`)
  console.log(`克隆 ${REPO_URL} → ${REPO_DIR}`)
  mkdirp(path.dirname(REPO_DIR))
  const r = spawnSync('git', ['clone', '--depth', '1', REPO_URL, REPO_DIR], { stdio: 'inherit' })
  if (r.status !== 0) throw new Error('git clone 失败')
}

function gitMeta() {
  const r = spawnSync('git', ['-C', REPO_DIR, 'log', '-1', '--format=%H|%ci'], { encoding: 'utf8' })
  if (r.status !== 0 || !r.stdout.trim()) return { commit: 'unknown', date: null }
  const [commit, date] = r.stdout.trim().split('|')
  return { commit, date }
}

console.log('— Python-100-Days 内容管线 —')
console.log(`源目录: ${REPO_DIR}`)
console.log(`输出目录: ${OUT_DIR}`)
console.log(`图片策略: ${ASSETS_MODE}`)

ensureRepo()

rmrf(OUT_DIR)
for (const sub of ['days', 'blocks', 'code', 'extras', 'res']) mkdirp(path.join(OUT_DIR, sub))

const allByDay = new Map()
const copiedAssets = new Set()
const missingAssets = new Set()
let assetCount = 0

function assetResolver(baseDir, stageDir) {
  return (rel) => {
    const src = path.join(baseDir, rel)
    if (!fs.existsSync(src)) {
      missingAssets.add(`${stageDir}/${rel}`)
      return null
    }
    // 保留 res/ 下的子目录结构，避免不同子目录同名文件互相覆盖
    const sub = rel.replace(/^res\//, '')
    if (ASSETS_MODE === 'copy' && !copiedAssets.has(src)) {
      copiedAssets.add(src)
      const target = path.join(OUT_DIR, 'res', stageDir, sub)
      mkdirp(path.dirname(target))
      fs.copyFileSync(src, target)
      assetCount += 1
    }
    return `/content/res/${encodeURIComponent(stageDir)}/${sub.split('/').map(encodeURIComponent).join('/')}`
  }
}

let docCount = 0
for (const stage of STAGES) {
  const dir = path.join(REPO_DIR, stage.dir)
  if (!fs.existsSync(dir)) {
    console.warn(`[warn] 缺少目录 ${stage.dir}`)
    continue
  }
  const parsed = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map(parseDayFile)
    .filter(Boolean)

  const written = new Set()
  for (const item of parsed) {
    item.content = fs.readFileSync(path.join(dir, item.fileName), 'utf8')
    item.slug = outSlug(item)
    if (!written.has(item.slug)) {
      written.add(item.slug)
      const rewritten = rewriteAssets(item.content, assetResolver(dir, stage.dir))
      fs.writeFileSync(path.join(OUT_DIR, 'days', `${item.slug}.md`), rewritten, 'utf8')
      docCount += 1
    }
  }
  const byDay = groupByDay(parsed)
  for (const [day, items] of byDay) {
    allByDay.set(day, [...(allByDay.get(day) || []), ...items])
  }
}

const days = []
let blockTotal = 0
for (let day = 1; day <= TOTAL_DAYS; day += 1) {
  const stage = stageOfDay(day)
  const items = allByDay.get(day) || []
  const docs = items.map((it, i) => ({
    order: it.seq || i + 1,
    title: it.title,
    file: it.fileName,
    url: `/content/days/${it.slug}.md`,
    size: Buffer.byteLength(it.content, 'utf8'),
    wordCount: countWords(it.content),
  }))
  const blocks = []
  items.forEach((it, idx) => {
    for (const b of extractBlocks(it.content)) {
      blocks.push({ ...b, docIndex: idx, docTitle: it.title })
    }
  })
  fs.writeFileSync(path.join(OUT_DIR, 'blocks', `${pad2(day)}.json`), JSON.stringify(blocks), 'utf8')
  blockTotal += blocks.length
  const words = docs.reduce((s, d) => s + d.wordCount, 0)
  days.push({
    day,
    stageId: stage ? stage.id : null,
    title: docs.map((d) => d.title).join(' / ') || `Day ${day}`,
    docs,
    blockCount: blocks.length,
    codeBlocksUrl: `/content/blocks/${pad2(day)}.json`,
    sharedWith: items.length && items[0].end > items[0].start
      ? Array.from({ length: items[0].end - items[0].start + 1 }, (_, i) => items[0].start + i).filter((d) => d !== day)
      : [],
    status: docs.length ? 'ready' : 'missing',
    thin: words < 600,
    estimatedMinutes: Math.max(5, Math.round(words / 300 + blocks.length * 2)),
  })
}

// ---- code/ 目录 ----
const codeFiles = []
for (const stage of STAGES) {
  const dir = path.join(REPO_DIR, stage.dir, 'code')
  if (!fs.existsSync(dir)) continue
  const docsByDay = new Map()
  for (let d = stage.range[0]; d <= stage.range[1]; d += 1) {
    const items = allByDay.get(d) || []
    docsByDay.set(d, items)
  }
  for (const rel of walk(dir)) {
    const src = path.join(dir, rel)
    const target = path.join(OUT_DIR, 'code', stage.dir, rel)
    mkdirp(path.dirname(target))
    fs.copyFileSync(src, target)
    const owner = resolveCodeOwner({ dir: stage.dir, relPath: rel, stage, docsByDay })
    codeFiles.push({
      name: rel.split('/').pop(),
      path: `/content/code/${encodeURIComponent(stage.dir)}/${rel.split('/').map(encodeURIComponent).join('/')}`,
      lang: langOfExt(rel),
      size: fs.statSync(src).size,
      stageId: stage.id,
      day: owner.day,
      confidence: owner.confidence,
    })
  }
}

// ---- 番外篇 ----
const extras = []
const extraDir = path.join(REPO_DIR, '番外篇')
if (fs.existsSync(extraDir)) {
  const files = fs.readdirSync(extraDir).filter((f) => f.endsWith('.md')).sort((a, b) => a.localeCompare(b, 'zh'))
  files.forEach((f, i) => {
    const content = fs.readFileSync(path.join(extraDir, f), 'utf8')
    const rewritten = rewriteAssets(content, assetResolver(extraDir, '番外篇'))
    const slug = String(i + 1).padStart(2, '0')
    fs.writeFileSync(path.join(OUT_DIR, 'extras', `${slug}.md`), rewritten, 'utf8')
    extras.push({
      slug,
      title: f.replace(/\.md$/, ''),
      url: `/content/extras/${slug}.md`,
      wordCount: countWords(content),
    })
  })
}

const meta = gitMeta()
const manifest = {
  generatedAt: new Date().toISOString(),
  source: { repo: 'jackfrued/Python-100-Days', commit: meta.commit, date: meta.date },
  assetsMode: ASSETS_MODE,
  stages: STAGES,
  days,
  extras,
  codeFiles,
  stats: {
    totalDays: TOTAL_DAYS,
    coveredDays: days.filter((d) => d.status === 'ready').length,
    docs: docCount,
    blocks: blockTotal,
    codeFiles: codeFiles.length,
    assets: assetCount,
    missingAssets: [...missingAssets].length,
  },
}
fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest), 'utf8')

const missing = days.filter((d) => d.status === 'missing').map((d) => d.day)
console.log('\n— 生成报告 —')
console.log(`天覆盖: ${manifest.stats.coveredDays}/${TOTAL_DAYS}${missing.length ? `  缺失: ${missing.join(',')}` : '  无缺失'}`)
const thinDays = days.filter((d) => d.thin).map((d) => d.day)
console.log(`文档: ${docCount}   代码块: ${blockTotal}   代码文件: ${codeFiles.length}`)
console.log(`薄内容天(占位存根): ${thinDays.length} → ${thinDays.join(',')}`)
console.log(`图片: 拷贝 ${assetCount} 张${missingAssets.size ? `  缺失引用 ${missingAssets.size} 处` : ''}`)
if (missing.length) {
  console.error('\n[FAIL] 存在缺失天数，请检查源仓库')
  process.exit(1)
}
console.log('\n完成 →', path.relative(ROOT, path.join(OUT_DIR, 'manifest.json')))
