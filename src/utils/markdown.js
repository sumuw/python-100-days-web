import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import texmath from 'markdown-it-texmath'
import katex from 'katex'

function slugify(text) {
  return (text || '')
    .trim()
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w一-龥-]/g, '')
    .slice(0, 60)
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false,
  highlight(code, lang) {
    const l = lang && hljs.getLanguage(lang) ? lang : null
    let body
    if (l) {
      try {
        body = hljs.highlight(code, { language: l }).value
      } catch {
        body = md.utils.escapeHtml(code)
      }
    } else {
      body = md.utils.escapeHtml(code)
    }
    return `<pre class="hljs"><code class="language-${l || 'text'}">${body}</code></pre>`
  },
})

md.use(texmath, {
  engine: katex,
  katexOptions: { throwOnError: false, strict: 'ignore', output: 'html' },
  delimiters: 'dollars',
})

md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
  const text = tokens[idx + 1]?.content || ''
  env.seen = env.seen || {}
  let id = slugify(text) || 'sec'
  if (env.seen[id]) {
    env.seen[id] += 1
    id = `${id}-${env.seen[id]}`
  } else {
    env.seen[id] = 1
  }
  tokens[idx].attrSet('id', id)
  return self.renderToken(tokens, idx, options, env, self)
}

export function renderMarkdown(src) {
  return md.render(src || '', {})
}

export function extractToc(html) {
  const re = /<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g
  const out = []
  let m
  while ((m = re.exec(html))) {
    out.push({ level: Number(m[1]), id: m[2], text: m[3].replace(/<[^>]+>/g, '').trim() })
  }
  return out
}
