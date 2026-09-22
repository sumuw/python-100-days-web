// 通过 CDP 驱动 Edge：滚动到指定位置后截图（验证吸顶效果）
import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9223
const url = process.argv[2] || 'http://localhost:5180/day/14'
const scrollY = Number(process.argv[3] || 1200)
const out = process.argv[4] || 'shot.png'

const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--window-size=1440,1000',
  'about:blank',
], { stdio: 'ignore' })

async function main() {
  // 等 CDP 端口就绪
  let targets
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 500))
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`)
      targets = await res.json()
      if (targets.length) break
    } catch {}
  }
  const page = targets.find(t => t.type === 'page')
  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const mid = ++id
      pending.set(mid, resolve)
      ws.send(JSON.stringify({ id: mid, method, params }))
    })
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  }
  await new Promise(r => (ws.onopen = r))

  await send('Page.enable')
  await send('Page.navigate', { url })
  await new Promise(r => setTimeout(r, 6000)) // 等待 SPA 渲染
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scrollY})` })
  await new Promise(r => setTimeout(r, 1200)) // 等待隐藏动画与 CSS 变量同步
  const info = await send('Runtime.evaluate', {
    expression: `JSON.stringify({y: window.scrollY, hidden: document.documentElement.style.getPropertyValue('--p100-header-top'), headTop: getComputedStyle(document.querySelector('.head') || document.body).top})`,
    returnByValue: true,
  })
  console.log('滚动后状态:', info.result.value)
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(out, Buffer.from(shot.data, 'base64'))
  console.log('saved:', out)
  ws.close()
  edge.kill()
  process.exit(0)
}

main().catch((e) => { console.error(e); edge.kill(); process.exit(1) })
