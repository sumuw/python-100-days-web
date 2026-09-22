const EXT_LANG = {
  '.py': 'python', '.sql': 'sql', '.html': 'html', '.ipynb': 'ipynb',
  '.csv': 'csv', '.xlsx': 'xlsx', '.txt': 'text', '.java': 'java',
  '.js': 'javascript', '.json': 'json', '.md': 'markdown', '.jpg': 'image',
  '.png': 'image', '.ttf': 'font',
}

// 明确的归属规则（人工核对过，confidence: explicit）
const EXPLICIT_RULES = [
  { dir: 'Day31-35', re: /^example\d+\.py$/, day: 31 },
  { dir: 'Day31-35', re: /^test_example\d+\.py$/, day: 31 },
  { dir: 'Day31-35', re: /^list_by_.*\.html$/, day: 32 },
]

// code/ 目录归属到哪一天：优先显式规则 → 文档正文提及文件名 → 落到阶段级入口
export function resolveCodeOwner({ dir, relPath, stage, docsByDay }) {
  const name = relPath.split(/[\\/]/).pop()
  for (const rule of EXPLICIT_RULES) {
    if (rule.dir === dir && rule.re.test(name)) {
      return { day: rule.day, confidence: 'explicit' }
    }
  }
  const stem = name.replace(/\.[^.]+$/, '')
  for (const [day, docs] of docsByDay) {
    for (const doc of docs) {
      if (doc.content && (doc.content.includes(name) || doc.content.includes(stem))) {
        return { day, confidence: 'matched' }
      }
    }
  }
  return { day: null, confidence: 'stage', stageId: stage.id }
}

export function langOfExt(name) {
  const dot = name.lastIndexOf('.')
  const ext = dot === -1 ? '' : name.slice(dot).toLowerCase()
  return EXT_LANG[ext] || 'text'
}
