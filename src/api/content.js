const cache = new Map()

async function load(url, asJson) {
  if (cache.has(url)) return cache.get(url)
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`${r.status} ${url}`)
      return asJson ? r.json() : r.text()
    })
    .catch((e) => {
      cache.delete(url)
      throw e
    })
  cache.set(url, p)
  return p
}

export const fetchManifest = () => load('/content/manifest.json', true)
export const fetchDoc = (url) => load(url, false)
export const fetchBlocks = (url) => load(url, true)

export function clearContentCache() {
  cache.clear()
}
