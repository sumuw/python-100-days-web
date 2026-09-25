import { reactive } from 'vue'

/**
 * 全局 UI 状态（非持久化）。
 * headerHidden: 顶部菜单栏是否隐藏 —— 课程内容区下滑时隐藏，上滑时显示。
 */
export const uiState = reactive({
  headerHidden: false,
})

const HEADER_HEIGHT = 58
const HIDE_THRESHOLD = 80 // 滚动超过该距离才允许隐藏
const DELTA = 4 // 过滤微小抖动

let lastY = 0
let listening = false

function syncHeader(target) {
  const y = target.scrollTop
  if (Math.abs(y - lastY) < DELTA) return
  if (y <= HIDE_THRESHOLD) {
    uiState.headerHidden = false
  } else if (y > lastY) {
    uiState.headerHidden = true
  } else {
    uiState.headerHidden = false
  }
  lastY = y
}

/**
 * 绑定课程内容区的滚动方向，用于控制顶部菜单栏显隐。
 * 页面本身不参与滚动，避免课程简介和正文一起离开视口。
 */
export function bindHeaderScroll(target) {
  if (!target || listening) return () => {}
  listening = true
  lastY = target.scrollTop
  const onScroll = () => syncHeader(target)
  target.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    target.removeEventListener('scroll', onScroll)
    listening = false
    lastY = 0
    uiState.headerHidden = false
  }
}
