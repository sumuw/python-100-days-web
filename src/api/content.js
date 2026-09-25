const cache = new Map()
const BASE_URL = import.meta.env.BASE_URL

function withBase(url) {
  if (/^(?:https?:)?\/\//i.test(url)) return url
  const relative = url.replace(/^\//, '')
  return `${BASE_URL}${relative}`
}

async function load(url, asJson) {
  const resolvedUrl = withBase(url)
  if (cache.has(resolvedUrl)) return cache.get(resolvedUrl)
  const p = fetch(resolvedUrl)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${resolvedUrl}`)
      return asJson ? r.json() : r.text()
    })
    .catch((e) => {
      cache.delete(resolvedUrl)
      throw e
    })
  cache.set(resolvedUrl, p)
  return p
}

export const fetchManifest = () => load('/content/manifest.json', true)
export const fetchDoc = (url) => load(url, false)
export const fetchBlocks = (url) => load(url, true)

export function clearContentCache() {
  cache.clear()
}

// 同步产物中的资源地址以 /content/ 开头；子路径部署时需补上 Vite base。
export function rewriteContentUrls(markdown) {
  return (markdown || '').replace(/(\]\(|\bsrc\s*=\s*["'])\/content\//gi, `$1${withBase('/content/')}`)
}
