// 支持三种命名形态：
//   01.初识Python.md              单天单篇
//   32-33.Web前端入门.md          跨天合并
//   62.用Python获取网络资源-1.md   一天多篇（序号后缀）
const FILE_RE = /^(\d{1,3})(?:-(\d{1,3}))?\.(.+?)(?:-(\d+))?\.md$/

export function parseDayFile(fileName) {
  const m = FILE_RE.exec(fileName)
  if (!m) return null
  const [, startS, endS, title, seqS] = m
  const start = Number(startS)
  const end = endS ? Number(endS) : start
  if (!Number.isFinite(start) || start < 1 || start > 100) return null
  if (end < start || end > 100) return null
  return {
    start,
    end,
    seq: seqS ? Number(seqS) : 0,
    title: title.trim(),
    fileName,
  }
}

export function outSlug({ start, end, seq }) {
  const a = String(start).padStart(2, '0')
  if (seq) return `${a}-${seq}`
  if (end > start) return `${a}-${String(end).padStart(2, '0')}`
  return a
}

export function groupByDay(parsed) {
  const map = new Map()
  for (const item of parsed) {
    for (let d = item.start; d <= item.end; d += 1) {
      if (!map.has(d)) map.set(d, [])
      map.get(d).push(item)
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.seq - b.seq) || a.fileName.localeCompare(b.fileName, 'zh'))
  }
  return map
}
