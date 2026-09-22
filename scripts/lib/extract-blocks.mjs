const FENCE_RE = /^\s*```/

export function guessLang(code) {
  if (/^\s*(from\s+\w[\w.]*\s+import\s|import\s+\w|def\s+\w+|class\s+\w+|if\s+__name__|print\()/m.test(code)) return 'python'
  if (/\b(SELECT|CREATE\s+TABLE|INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(code)) return 'sql'
  if (/^\s*<\??(html|div|script|style|!DOCTYPE|template)/im.test(code)) return 'html'
  if (/^\s*(package\s+\w|public\s+class\s|System\.out)/m.test(code)) return 'java'
  if (/^\s*(npm\s|pip\s|git\s|cd\s|ls\s|mkdir\s|python\d?\s|django-admin|mysql\s|docker\s)/m.test(code)) return 'bash'
  if (/^\s*(\{|\[)\s*$/m.test(code) && /"/.test(code)) return 'json'
  return 'text'
}

export function extractBlocks(markdown, { minLength = 20 } = {}) {
  const lines = markdown.split(/\r?\n/)
  const blocks = []
  let cur = null
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (FENCE_RE.test(line)) {
      if (cur) {
        blocks.push(cur)
        cur = null
      } else {
        const raw = line.replace(FENCE_RE, '').trim().split(/\s+/)[0] || ''
        cur = { lang: raw || null, buf: [], startLine: i + 2 }
      }
      continue
    }
    if (cur) cur.buf.push(line)
  }
  return blocks
    .map((b) => {
      const code = b.buf.join('\n').replace(/\s+$/, '')
      return { lang: b.lang || guessLang(code), code, startLine: b.startLine }
    })
    .filter((b) => b.code.trim().length >= minLength)
}
