const MD_IMG_RE = /!\[[^\]]*\]\(\s*<?([^)>\s]+)>?\s*\)/g
const HTML_IMG_RE = /(<img\b[^>]*?\bsrc=)(["'])([^"']+)\2/gi

// 只处理仓库内相对引用：./res/x.png、res/x.png（含 res/子目录/x.png）
export function normalizeRel(url) {
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return null
  const u = url.replace(/^\.\//, '')
  const m = /(?:^|\/)res\/([^\s]+)$/.exec(u)
  return m ? `res/${m[1]}` : null
}

export function scanAssetRefs(markdown) {
  const set = new Set()
  for (const re of [MD_IMG_RE, HTML_IMG_RE]) {
    for (const m of markdown.matchAll(re)) {
      const rel = normalizeRel(m[3] ?? m[1])
      if (rel) set.add(rel)
    }
  }
  return [...set]
}

export function rewriteAssets(markdown, resolveUrl) {
  let out = markdown.replace(MD_IMG_RE, (full, url) => {
    const rel = normalizeRel(url)
    if (!rel) return full
    const next = resolveUrl(rel)
    return next ? full.replace(url, next) : full
  })
  out = out.replace(HTML_IMG_RE, (full, head, quote, url) => {
    const rel = normalizeRel(url)
    if (!rel) return full
    const next = resolveUrl(rel)
    return next ? `${head}${quote}${next}${quote}` : full
  })
  return out
}
